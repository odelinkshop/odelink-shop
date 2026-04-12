const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cheerio = require('cheerio');
const axios = require('axios');
const { HttpProxyAgent } = require('http-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const Site = require('../models/Site');
const authMiddleware = require('../middleware/auth');

const STATIC_THEME_ID = 'represent';
const CATALOG_REFRESH_VERSION = 4;

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

const resolveChromeExecutablePath = async () => {
  if (isProduction) {
    return chromium.executablePath();
  }

  const env = (process.env.PUPPETEER_EXECUTABLE_PATH || '').toString().trim();
  if (env) return env;

  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return p;
      } catch (e) {
        void e;
      }
    }
  }

  return undefined;
};

const MAX_PRODUCTS = (() => {
  const n = Number(process.env.SHOPIER_MAX_PRODUCTS || 50000);
  if (!Number.isFinite(n) || n <= 0) return 50000;
  return Math.floor(n);
})();

const MAX_SCROLL_STEPS = (() => {
  const n = Number(process.env.SHOPIER_SCROLL_STEPS || 25);
  if (!Number.isFinite(n) || n <= 0) return 25;
  return Math.floor(n);
})();

const AXIOS_MIN_PRODUCTS_BEFORE_PUPPETEER = (() => {
  const n = Number(process.env.SHOPIER_AXIOS_MIN_PRODUCTS || 45);
  if (!Number.isFinite(n) || n < 0) return 45;
  return Math.floor(n);
})();

const FORCE_DISCOVERY_MIN_PRODUCTS = (() => {
  const n = Number(process.env.SHOPIER_FORCE_DISCOVERY_MIN_PRODUCTS || 60);
  if (!Number.isFinite(n) || n <= 0) return 60;
  return Math.floor(n);
})();

const CACHE_TTL_MS = 5 * 60 * 1000;
const SCRAPE_PROGRESS_TTL_MS = 30 * 60 * 1000;
const SHOPIER_BACKOFF_TTL_MS = 60 * 60 * 1000;
const SHOPIER_SYNC_JOB_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_SCRAPE_CACHE_ENTRIES = 40;
const MAX_SCRAPE_PROGRESS_ENTRIES = 80;
const MAX_SHOPIER_BACKOFF_ENTRIES = 200;
const MAX_SHOPIER_SYNC_JOB_ENTRIES = 100;
const scrapeCache = new Map();
const scrapeInflight = new Map();
const scrapeProgress = new Map();
const syncJobsBySubdomain = new Map();
const shopierBackoffByUrl = new Map();

const AXIOS_PAGE_DELAY_MS = (() => {
  const defaultValue = isProduction ? 800 : 500; // HIZLANDIRILDI: 1500 -> 800
  const n = Number(process.env.SHOPIER_AXIOS_PAGE_DELAY_MS || defaultValue);
  if (!Number.isFinite(n) || n < 0) return defaultValue;
  return Math.floor(n);
})();

const AXIOS_MAX_PAGES = (() => {
  const n = Number(process.env.SHOPIER_AXIOS_MAX_PAGES || 400);
  if (!Number.isFinite(n) || n <= 0) return 400;
  return Math.floor(n);
})();

const AXIOS_DETAIL_CONCURRENCY = (() => {
  const defaultValue = isProduction ? 3 : 2;
  const n = Number(process.env.SHOPIER_AXIOS_DETAIL_CONCURRENCY || defaultValue);
  if (!Number.isFinite(n) || n <= 0) return defaultValue;
  return Math.floor(n);
})();

const AXIOS_MAX_RETRIES = (() => {
  const n = Number(process.env.SHOPIER_AXIOS_MAX_RETRIES || 12);
  if (!Number.isFinite(n) || n < 0) return 12;
  return Math.floor(n);
})();

const AXIOS_BACKOFF_BASE_MS = (() => {
  const n = Number(process.env.SHOPIER_AXIOS_BACKOFF_BASE_MS || 600); // HIZLANDIRILDI: 900 -> 600
  if (!Number.isFinite(n) || n <= 0) return 600;
  return Math.floor(n);
})();

const SHOPIER_PROXY_POOL = (() => {
  const defaultProxy = 'http://yxiddeeh:ftg8zisvw6c9@31.59.20.176:6754';
  const single = (process.env.SHOPIER_PROXY_URL || defaultProxy).toString().trim();
  const listRaw = (process.env.SHOPIER_PROXY_URLS || '').toString().trim();
  const list = listRaw
    ? listRaw.split(',').map((x) => x.trim()).filter(Boolean)
    : [];
  const combined = [];
  if (single) combined.push(single);
  combined.push(...list);
  const uniq = Array.from(new Set(combined));
  return uniq;
})();

const pickShopierProxyUrl = () => {
  if (!Array.isArray(SHOPIER_PROXY_POOL) || SHOPIER_PROXY_POOL.length === 0) return '';
  const idx = Math.floor(Math.random() * SHOPIER_PROXY_POOL.length);
  return (SHOPIER_PROXY_POOL[idx] || '').toString().trim();
};

const buildAxiosProxyAgents = () => {
  const proxyUrl = pickShopierProxyUrl();
  if (!proxyUrl) return null;
  try {
    return {
      proxy: false,
      httpAgent: new HttpProxyAgent(proxyUrl),
      httpsAgent: new HttpsProxyAgent(proxyUrl)
    };
  } catch (e) {
    void e;
    return null;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, Number(ms) || 0)));

const trimMapByTimestamp = (map, maxSize, getTimestamp) => {
  if (!(map instanceof Map)) return;
  if (!Number.isFinite(maxSize) || maxSize <= 0) return;
  if (map.size <= maxSize) return;

  const ordered = Array.from(map.entries())
    .sort((a, b) => Number(getTimestamp(a[1], a[0]) || 0) - Number(getTimestamp(b[1], b[0]) || 0));

  while (map.size > maxSize && ordered.length > 0) {
    const [key] = ordered.shift();
    map.delete(key);
  }
};

const pruneScraperState = () => {
  const now = Date.now();

  for (const [key, entry] of scrapeCache.entries()) {
    const expiresAt = Number(entry?.expiresAt || 0);
    const updatedAt = Number(entry?.updatedAt || 0);
    const stale = expiresAt > 0 ? now > expiresAt : (updatedAt > 0 && (now - updatedAt) > CACHE_TTL_MS);
    if (stale) scrapeCache.delete(key);
  }

  for (const [key, entry] of scrapeProgress.entries()) {
    const lastUpdateAt = Number(entry?.lastUpdateAt || entry?.startedAt || 0);
    if (!lastUpdateAt || (now - lastUpdateAt) > SCRAPE_PROGRESS_TTL_MS) {
      scrapeProgress.delete(key);
    }
  }

  for (const [key, entry] of shopierBackoffByUrl.entries()) {
    const nextAllowedAt = Number(entry?.nextAllowedAt || 0);
    const updatedAt = Number(entry?.updatedAt || 0);
    const referenceTime = Math.max(nextAllowedAt, updatedAt);
    if (!referenceTime || (now - referenceTime) > SHOPIER_BACKOFF_TTL_MS) {
      shopierBackoffByUrl.delete(key);
    }
  }

  for (const [key, job] of syncJobsBySubdomain.entries()) {
    const status = (job?.status || '').toString();
    const updatedAt = Number(job?.updatedAt || job?.startedAt || 0);
    const isTerminal = status === 'completed' || status === 'failed' || status === 'cancelled';
    if (isTerminal && updatedAt && (now - updatedAt) > SHOPIER_SYNC_JOB_TTL_MS) {
      syncJobsBySubdomain.delete(key);
    }
  }

  trimMapByTimestamp(scrapeCache, MAX_SCRAPE_CACHE_ENTRIES, (entry) => entry?.updatedAt || entry?.expiresAt || 0);
  trimMapByTimestamp(scrapeProgress, MAX_SCRAPE_PROGRESS_ENTRIES, (entry) => entry?.lastUpdateAt || entry?.startedAt || 0);
  trimMapByTimestamp(shopierBackoffByUrl, MAX_SHOPIER_BACKOFF_ENTRIES, (entry) => entry?.updatedAt || entry?.nextAllowedAt || 0);
  trimMapByTimestamp(syncJobsBySubdomain, MAX_SHOPIER_SYNC_JOB_ENTRIES, (entry) => entry?.updatedAt || entry?.startedAt || 0);
};

const parseRetryAfterMs = (retryAfterHeader) => {
  try {
    const v = (retryAfterHeader || '').toString().trim();
    if (!v) return 0;
    // Retry-After can be seconds or HTTP date.
    const seconds = Number(v);
    if (Number.isFinite(seconds) && seconds > 0) return Math.floor(seconds * 1000);
    const dateMs = Date.parse(v);
    if (Number.isFinite(dateMs) && dateMs > Date.now()) return Math.max(0, dateMs - Date.now());
    return 0;
  } catch (e) {
    void e;
    return 0;
  }
};

const scrapeProductUrlsWithPuppeteer = async (shopierUrl, { maxPages = 80 } = {}) => {
  let browser;
  try {
    const resolvedArgs = isProduction
      ? Array.from(new Set([...(chromium.args || []), ...buildPuppeteerArgs()]))
      : buildPuppeteerArgs();

    const executablePath = await resolveChromeExecutablePath();

    browser = await puppeteer.launch({
      headless: isProduction ? chromium.headless : (process.env.PUPPETEER_HEADLESS !== 'false'),
      args: [...resolvedArgs, '--disable-blink-features=AutomationControlled'],
      executablePath
    });

    const page = await browser.newPage();
    
    // Stealth: Webdriver kontrolünü devredışı bırak
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366 + Math.floor(Math.random() * 100), height: 768 + Math.floor(Math.random() * 100) });

    const urls = new Set();
    const visited = new Set();
    const normalizeAbs = (raw, base) => {
      try {
        return new URL((raw || '').toString(), base || undefined).toString();
      } catch (e) {
        void e;
        return (raw || '').toString();
      }
    };

    const collectUrlsOnPage = async () => {
      const hrefs = await page.evaluate(() => {
        try {
          const out = [];
          const anchors = Array.from(document.querySelectorAll('a[href]'));
          for (const a of anchors) out.push(a.getAttribute('href'));
          return out;
        } catch (e) {
          void e;
          return [];
        }
      });

      for (const h of hrefs || []) {
        const abs = normalizeAbs(h, page.url());
        if (!abs) continue;
        try {
          const u = new URL(abs);
          if (u.host !== 'www.shopier.com') continue;
          if (!/\/[^/]+\/\d{6,}/.test(u.pathname)) continue;
          urls.add(u.toString());
        } catch (e) {
          void e;
        }
      }
    };

    await page.goto(shopierUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    await collectUrlsOnPage();

    for (let i = 0; i < Math.max(1, Math.floor(maxPages)); i += 1) {
      const current = page.url();
      if (visited.has(current)) break;
      visited.add(current);

      try {
        // try to scroll a bit in case the store uses lazy-loading
        await page.evaluate(() => {
          try { window.scrollTo(0, document.body.scrollHeight); } catch (e) { void e; }
        });
        await sleep(900);
      } catch (e) {
        void e;
      }

      await collectUrlsOnPage();

      const nextHref = await page.evaluate(() => {
        try {
          const direct = document.querySelector('link[rel="next"]')?.getAttribute('href') ||
            document.querySelector('a[rel="next"]')?.getAttribute('href') ||
            '';
          if (direct) return direct;
          const candidates = Array.from(document.querySelectorAll('a[href]'));
          for (const a of candidates) {
            const t = (a.textContent || '').toString().trim().toLowerCase();
            const h = (a.getAttribute('href') || '').toString();
            if (!h) continue;
            if (t.includes('sonraki') || t === '>' || t.includes('next') || a.getAttribute('aria-label')?.toLowerCase?.().includes('next')) return h;
          }
          return '';
        } catch (e) {
          void e;
          return '';
        }
      });

      if (!nextHref) break;
      const absNext = normalizeAbs(nextHref, page.url());
      if (!absNext || visited.has(absNext)) break;
      await page.goto(absNext, { waitUntil: 'networkidle2', timeout: 45000 });
    }

    return Array.from(urls);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        void e;
      }
    }
  }
};

const isRetryableAxiosError = (err) => {
  const status = Number(err?.response?.status || 0);
  if (status === 429) return true;
  if (status >= 500 && status <= 599) return true;
  const code = (err?.code || '').toString();
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ECONNRESET') return true;
  const msg = (err?.message || '').toString().toLowerCase();
  if (msg.includes('timeout') || msg.includes('socket hang up')) return true;
  return false;
};

const axiosGetWithRetry = async (url, config, { maxRetries } = {}) => {
  const retries = Number.isFinite(maxRetries)
    ? Math.max(0, Math.floor(maxRetries))
    : (isProduction ? Math.max(AXIOS_MAX_RETRIES, 8) : AXIOS_MAX_RETRIES);
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const proxyAgents = buildAxiosProxyAgents();
      return await axios.get(url, {
        ...(proxyAgents || {}),
        ...config,
        validateStatus: config?.validateStatus || (() => true)
      });
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isRetryableAxiosError(err)) throw err;

      const retryAfterMs = parseRetryAfterMs(err?.response?.headers?.['retry-after']);
      const expo = AXIOS_BACKOFF_BASE_MS * Math.pow(2, Math.min(6, attempt - 1));
      const jitter = Math.floor(Math.random() * 400);
      const delay = Math.max(retryAfterMs, expo + jitter);
      await sleep(delay);
    }
  }
};

const axiosPostWithRetry = async (url, data, config, { maxRetries } = {}) => {
  const retries = Number.isFinite(maxRetries)
    ? Math.max(0, Math.floor(maxRetries))
    : (isProduction ? Math.max(AXIOS_MAX_RETRIES, 8) : AXIOS_MAX_RETRIES);
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const proxyAgents = buildAxiosProxyAgents();
      return await axios.post(url, data, {
        ...(proxyAgents || {}),
        ...config,
        validateStatus: config?.validateStatus || (() => true)
      });
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isRetryableAxiosError(err)) throw err;

      const retryAfterMs = parseRetryAfterMs(err?.response?.headers?.['retry-after']);
      const expo = AXIOS_BACKOFF_BASE_MS * Math.pow(2, Math.min(6, attempt - 1));
      const jitter = Math.floor(Math.random() * 400);
      const delay = Math.max(retryAfterMs, expo + jitter);
      await sleep(delay);
    }
  }
};

const getCacheEntry = (key) => {
  pruneScraperState();
  const v = scrapeCache.get(key);
  if (!v) return null;
  return {
    value: v.value || null,
    expiresAt: Number(v.expiresAt || 0),
    updatedAt: Number(v.updatedAt || 0)
  };
};

const isFresh = (entry) => Boolean(entry && entry.expiresAt && Date.now() <= entry.expiresAt);

const setCached = (key, value) => {
  pruneScraperState();
  scrapeCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS, updatedAt: Date.now() });
};

const setProgress = (key, patch) => {
  try {
    pruneScraperState();
    const prev = scrapeProgress.get(key) || {};
    const next = {
      ...prev,
      ...(patch || {}),
      lastUpdateAt: Date.now()
    };
    if (!next.startedAt) next.startedAt = Date.now();
    scrapeProgress.set(key, next);
  } catch (e) {
    void e;
  }
};

const clearProgress = (key) => {
  try {
    scrapeProgress.delete(key);
  } catch (e) {
    void e;
  }
};

const getShopierBackoff = (shopierUrl) => {
  pruneScraperState();
  const k = (shopierUrl || '').toString().trim();
  if (!k) return null;
  return shopierBackoffByUrl.get(k) || null;
};

const setShopierBackoff = (shopierUrl, patch) => {
  pruneScraperState();
  const k = (shopierUrl || '').toString().trim();
  if (!k) return;
  const prev = shopierBackoffByUrl.get(k) || {};
  const next = {
    ...prev,
    ...(patch || {}),
    updatedAt: Date.now()
  };
  shopierBackoffByUrl.set(k, next);
};

const markRateLimited = (shopierUrl, err) => {
  try {
    const retryAfterMs = parseRetryAfterMs(err?.response?.headers?.['retry-after']);
    const base = retryAfterMs || 120000;
    const prev = getShopierBackoff(shopierUrl) || {};
    const tries = Number(prev.rateLimitCount || 0) + 1;
    const cool = Math.min(5 * 60 * 1000, base * Math.pow(2, Math.min(4, tries - 1)));
    setShopierBackoff(shopierUrl, {
      nextAllowedAt: Date.now() + cool,
      lastRateLimitAt: Date.now(),
      rateLimitCount: tries
    });
    return cool;
  } catch (e) {
    void e;
    setShopierBackoff(shopierUrl, {
      nextAllowedAt: Date.now() + 120000,
      lastRateLimitAt: Date.now(),
      rateLimitCount: 1
    });
    return 120000;
  }
};

const getRetryAfterSeconds = (shopierUrl) => {
  const b = getShopierBackoff(shopierUrl);
  const nextAt = Number(b?.nextAllowedAt || 0);
  if (!nextAt) return 0;
  const ms = Math.max(0, nextAt - Date.now());
  return Math.ceil(ms / 1000);
};

const normalizeUrl = (raw, base) => {
  const s = (raw || '').toString().trim();
  if (!s) return '';
  try {
    return new URL(s, base || undefined).toString();
  } catch (e) {
    void e;
    return s;
  }
};

const isLikelyShopierProductUrl = (rawUrl, pageUrl) => {
  try {
    const url = new URL((rawUrl || '').toString(), pageUrl || undefined);
    if (url.host !== 'www.shopier.com') return false;

    const pathname = (url.pathname || '').toString();
    if (!pathname || pathname === '/') return false;
    if (/\.(?:jpg|jpeg|png|webp|gif|svg|ico|css|js|map|woff2?|ttf|eot|mp4|webm|avi|mov)$/i.test(pathname)) {
      return false;
    }

    const parts = pathname.split('/').filter(Boolean);
    if (parts.length < 2) return false;

    const blocked = new Set(['images', 'image', 'img', 'static', 'assets', 'js', 'css', 'fonts', 'uploads', 'cdn-cgi']);
    if (blocked.has(parts[0].toLowerCase()) || blocked.has(parts[1].toLowerCase())) return false;

    return parts[1].length >= 3;
  } catch (error) {
    void error;
    return false;
  }
};

const extractProductUrlsFromHtml = (html, pageUrl, maxProducts) => {
  try {
    const out = new Set();
    const text = (html || '').toString();
    if (!text) return [];

    const storeSlug = (() => {
      try {
        const u = new URL(pageUrl);
        const p = (u.pathname || '').replace(/^\/+/, '');
        const first = (p.split('/')[0] || '').toString().trim();
        return first || '';
      } catch (e) {
        void e;
        return '';
      }
    })();

    const cap = (() => {
      const n = Number(maxProducts || 0);
      if (!Number.isFinite(n) || n <= 0) return 5000;
      return Math.floor(n);
    })();

    const addIfProductUrl = (candidate) => {
      const normalized = normalizeUrl(candidate, pageUrl);
      if (!normalized) return;
      if (!isLikelyShopierProductUrl(normalized, pageUrl)) return;
      out.add(normalized);
    };

    // Common Shopier product links (sometimes numeric IDs, sometimes slugs):
    // https://www.shopier.com/{STORE}/{PRODUCT_ID_OR_SLUG}
    try {
      const re = /https?:\/\/www\.shopier\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]{3,}/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const full = (m[0] || '').toString();
        addIfProductUrl(full);
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // JSON-escaped absolute URLs like https:\/\/www.shopier.com\/STORE\/PRODUCT
    try {
      const reEscAbs = /https?:\\\/\\\/www\.shopier\.com\\\/([A-Za-z0-9_-]+)\\\/([A-Za-z0-9_-]{3,})/g;
      let m;
      while ((m = reEscAbs.exec(text)) !== null) {
        const store = (m[1] || '').toString();
        const slug = (m[2] || '').toString();
        if (!store || !slug) continue;
        addIfProductUrl(`https://www.shopier.com/${store}/${slug}`);
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // JSON-escaped relative URLs like \/STORE\/PRODUCT
    try {
      const reEscRel = /\\\/([A-Za-z0-9_-]+)\\\/([A-Za-z0-9_-]{3,})/g;
      let m;
      while ((m = reEscRel.exec(text)) !== null) {
        const store = (m[1] || '').toString();
        const slug = (m[2] || '').toString();
        if (!store || !slug) continue;
        addIfProductUrl(`https://www.shopier.com/${store}/${slug}`);
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // JSON-escaped absolute URLs like https:\/\/www.shopier.com\/STORE\/PRODUCT
    try {
      const reEscAbs = /https?:\\\/\\\/www\.shopier\.com\\\/([A-Za-z0-9_-]+)\\\/([A-Za-z0-9_-]{3,})/g;
      let m;
      while ((m = reEscAbs.exec(text)) !== null) {
        const store = (m[1] || '').toString();
        const slug = (m[2] || '').toString();
        if (!store || !slug) continue;
        addIfProductUrl(`https://www.shopier.com/${store}/${slug}`);
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // JSON-escaped relative URLs like \/STORE\/PRODUCT
    try {
      const reEscRel = /\\\/([A-Za-z0-9_-]+)\\\/([A-Za-z0-9_-]{3,})/g;
      let m;
      while ((m = reEscRel.exec(text)) !== null) {
        const store = (m[1] || '').toString();
        const slug = (m[2] || '').toString();
        if (!store || !slug) continue;
        addIfProductUrl(`https://www.shopier.com/${store}/${slug}`);
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // If we know the store slug, also match plain occurrences of /slug/product or \/slug\/product in payloads.
    if (storeSlug) {
      try {
        const reSlug = new RegExp(`\\/${storeSlug}\\/([A-Za-z0-9_-]{3,})`, 'g');
        let m;
        while ((m = reSlug.exec(text)) !== null) {
          const slug = (m[1] || '').toString();
          if (!slug) continue;
          addIfProductUrl(`https://www.shopier.com/${storeSlug}/${slug}`);
          if (out.size > cap * 3) break;
        }
      } catch (e) {
        void e;
      }

      try {
        const reSlugEsc = new RegExp(`\\\\\\/${storeSlug}\\\\\\/([A-Za-z0-9_-]{3,})`, 'g');
        let m;
        while ((m = reSlugEsc.exec(text)) !== null) {
          const slug = (m[1] || '').toString();
          if (!slug) continue;
          addIfProductUrl(`https://www.shopier.com/${storeSlug}/${slug}`);
          if (out.size > cap * 3) break;
        }
      } catch (e) {
        void e;
      }
    }

    // Some listings only contain relative paths like /BYPEDROTR/27921277 or /BYPEDROTR/product-slug
    // Extract and normalize them to absolute URLs.
    try {
      const base = (() => {
        try {
          const u = new URL(pageUrl);
          return `${u.protocol}//${u.host}`;
        } catch (e) {
          void e;
          return 'https://www.shopier.com';
        }
      })();
      const reRel = /\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]{3,}/g;
      let m;
      while ((m = reRel.exec(text)) !== null) {
        const rel = m[0];
        if (!rel) continue;
        addIfProductUrl(normalizeUrl(rel, base));
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // Sometimes product URLs appear in JSON-ish payloads as "productUrl":"/STORE/123".
    try {
      const reJsonUrl = /"productUrl"\s*:\s*"([^"\\]+)"/g;
      let m;
      while ((m = reJsonUrl.exec(text)) !== null) {
        const raw = (m[1] || '').toString();
        if (!raw) continue;
        addIfProductUrl(normalizeUrl(raw, pageUrl));
        if (out.size > cap * 3) break;
      }
    } catch (e) {
      void e;
    }

    // Also try to extract relative links and normalize.
    try {
      const $ = cheerio.load(text);
      $('a[href]').each((i, el) => {
        const href = ($(el).attr('href') || '').toString().trim();
        if (!href) return;
        addIfProductUrl(normalizeUrl(href, pageUrl));
      });
    } catch (e) {
      void e;
    }

    return Array.from(out);
  } catch (e) {
    void e;
    return [];
  }
};

const normalizePrice = (rawPrice) => {
  const price = (rawPrice || '').toString().trim();
  if (!price) return '';

  const cleaned = price
    .replace(/\s+/g, ' ')
    .replace(/[^0-9.,₺$€£TLUSDEURGBP ]/gi, '')
    .trim();

  // Extract numeric value and currency
  const match = cleaned.match(/([0-9][0-9.,]*)\s*(₺|TL|USD|EUR|GBP|\$|€|£)?/i);
  if (!match) return price;

  const rawNum = (match[1] || '').toString();
  const curRaw = (match[2] || '₺').toString();

  const currency = (() => {
    const c = curRaw.toUpperCase();
    if (c === 'TL' || c === '₺') return '₺';
    if (c === '$' || c === 'USD') return '$';
    if (c === '€' || c === 'EUR') return '€';
    if (c === '£' || c === 'GBP') return '£';
    return '₺';
  })();

  // Turkish format handling:
  // - "550,00" => 550.00
  // - "1.250,50" => 1250.50
  // - "1,250.50" => 1250.50
  const toNumber = (s) => {
    const t = (s || '').toString().trim();
    if (!t) return NaN;

    const lastComma = t.lastIndexOf(',');
    const lastDot = t.lastIndexOf('.');
    const decSep = lastComma > lastDot ? ',' : '.';

    // Heuristic: dot-only values like "4.000" or "12.500.000" are Turkish thousands,
    // not decimals. If there is no comma and all dot-separated groups after the first
    // have length 3, treat dots as thousands separators.
    const isDotThousandsOnly = (() => {
      try {
        if (lastDot < 0 || lastComma >= 0) return false;
        const parts = t.split('.');
        if (parts.length < 2) return false;

        if (parts.length === 2) {
          const left = parts[0] || '';
          const right = parts[1] || '';
          if (left.length >= 1 && right.length === 3) return true;
          return false;
        }

        for (let i = 1; i < parts.length; i += 1) {
          if (parts[i].length !== 3) return false;
        }
        return true;
      } catch (e) {
        void e;
        return false;
      }
    })();

    let norm = t;
    if (isDotThousandsOnly) {
      norm = norm.replace(/\./g, '');
    } else if (decSep === ',') {
      // remove thousand dots, convert decimal comma to dot
      norm = norm.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // remove thousand commas
      norm = norm.replace(/,/g, '');
    }
    return Number.parseFloat(norm);
  };

  const numValue = toNumber(rawNum);
  if (!Number.isFinite(numValue)) return price;

  // Return with Turkish decimal comma for ₺ by default
  if (currency === '₺') {
    const fixed = numValue.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `₺${grouped},${decPart}`;
  }

  return `${currency}${numValue.toFixed(2)}`;
};

const buildNextPageUrlFallback = (currentUrl, nextPageNum) => {
  try {
    const u = new URL((currentUrl || '').toString());
    const hasP = u.searchParams.has('p');
    const hasPage = u.searchParams.has('page');
    const param = hasP && !hasPage ? 'p' : 'page';
    u.searchParams.set(param, String(nextPageNum));
    return u.toString();
  } catch (e) {
    void e;
    return '';
  }
};

const readPageParam = (url) => {
  try {
    const u = new URL((url || '').toString());
    const v = u.searchParams.get('page') || u.searchParams.get('p') || '';
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return Math.floor(n);
  } catch (e) {
    void e;
    return 1;
  }
};

const pickNextPageHref = ($, currentPage) => {
  try {
    const direct =
      $('link[rel="next"]').attr('href') ||
      $('a[rel="next"]').attr('href') ||
      $('a:contains("Sonraki")').first().attr('href') ||
      $('a:contains("Next")').first().attr('href') ||
      '';
    const directTrimmed = (direct || '').toString().trim();
    if (directTrimmed) return directTrimmed;

    const candidates = [];
    $('a[href]').each((i, el) => {
      try {
        const href = ($(el).attr('href') || '').toString().trim();
        if (!href) return;
        if (!(href.includes('page=') || href.includes('p='))) return;
        let page = 0;
        try {
          const u = new URL(href, 'https://www.shopier.com/');
          const v = u.searchParams.get('page') || u.searchParams.get('p') || '';
          const n = Number(v);
          page = Number.isFinite(n) ? Math.floor(n) : 0;
        } catch (e2) {
          void e2;
          page = 0;
        }
        if (page > 0) candidates.push({ page, href });
      } catch (e3) {
        void e3;
      }
    });

    const next = candidates
      .filter((c) => c.page > currentPage)
      .sort((a, b) => a.page - b.page)[0];

    return next?.href ? next.href.toString().trim() : '';
  } catch (e) {
    void e;
    return '';
  }
};

const parseTotalCountFromText = (t) => {
  try {
    const m = (t || '').toString().match(/(\d{1,7})\s*(?:ürün|urun)/i);
    if (!m || !m[1]) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    void e;
    return 0;
  }
};

const decodeEscapedJsonString = (value) => {
  const raw = textValue(value);
  if (!raw) return '';
  try {
    return JSON.parse(`"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  } catch (error) {
    void error;
    return raw.replace(/\\\//g, '/');
  }
};

const extractShopierCatalogConfig = (html, pageUrl) => {
  const content = (html || '').toString();
  const $ = cheerio.load(content);
  const csrfToken = textValue($('meta[name="csrf-token"]').attr('content'));
  const searchProductMatch = content.match(/"search_product":"([^"]+)"/i);
  const usernameMatch = content.match(/"username":"([^"]+)"/i);
  const defaultProductCountMatch = content.match(/"default_product_count":(\d+)/i);
  const totalCountMatch = content.match(/const\s+\$product_count\s*=\s*(\d+)/i) || 
                          content.match(/class="[^"]*shopier-store--store-product-count[^"]*"[^>]*>\s*(\d+)/i) ||
                          content.match(/(\d+)\s*ürün/i);
  const showLoadMoreMatch = content.match(/"show_load_more":(true|false)/i);

  return {
    csrfToken,
    searchProductUrl: normalizeUrl(
      decodeEscapedJsonString(searchProductMatch?.[1] || ''),
      pageUrl
    ),
    username: decodeEscapedJsonString(usernameMatch?.[1] || ''),
    defaultProductCount: Math.max(1, Number(defaultProductCountMatch?.[1] || 24) || 24),
    totalCount: Math.max(0, Number(totalCountMatch?.[1] || 0) || 0),
    showLoadMore: /^true$/i.test(textValue(showLoadMoreMatch?.[1] || 'false'))
  };
};

const buildCookieHeader = (headers) => {
  const rawCookies = Array.isArray(headers?.['set-cookie']) ? headers['set-cookie'] : [];
  return rawCookies
    .map((value) => textValue(value).split(';')[0])
    .filter(Boolean)
    .join('; ');
};

const buildPuppeteerArgs = () => {
  const raw = (process.env.PUPPETEER_ARGS || '').toString();
  const envArgs = raw.split(',').map((x) => x.trim()).filter(Boolean);
  const base = new Set(envArgs);
  
  // Base mandatory args for VPS/Docker stability
  const mandatory = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-infobars',
    '--window-size=1920,1080',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    '--disable-blink-features=AutomationControlled'
  ];

  mandatory.forEach(arg => base.add(arg));
  
  return Array.from(base);
};

const isPuppeteerUnavailable = (err) => {
  const msg = (err?.message || '').toString();
  return (
    msg.includes('Could not find Chrome') ||
    msg.includes('executablePath') ||
    msg.includes('Failed to launch') ||
    msg.includes('ENOENT')
  );
};

const SHOPIER_AXIOS_HEADERS = Object.freeze({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
  'Referer': 'https://www.google.com/'
});

const textValue = (value) => (value == null ? '' : String(value)).trim();

const normalizeCategoryLabel = (value) => textValue(value) || 'Genel';

const pickTextFromScope = (scope, selectors) => {
  const list = Array.isArray(selectors) ? selectors : [];
  for (const selector of list) {
    try {
      const text = textValue(scope.find(selector).first().text());
      if (text) return text;
    } catch (error) {
      void error;
    }
  }
  return '';
};

const pickAttrFromScope = (scope, selectors, attr) => {
  const list = Array.isArray(selectors) ? selectors : [];
  for (const selector of list) {
    try {
      const value = textValue(scope.find(selector).first().attr(attr));
      if (value) return value;
    } catch (error) {
      void error;
    }
  }
  return '';
};

const normalizeSearchApiProduct = (item, shopierUrl, username) => {
  const productId = textValue(item?.id);
  const fallbackUrl = productId && username ? `https://www.shopier.com/${username}/${productId}` : '';
  const rawImage = textValue(item?.primary_image || item?.image);
  const imageUrl = rawImage.startsWith('http')
    ? rawImage
    : (rawImage ? `https://cdn.shopier.app/pictures_mid/${rawImage}` : '');

  return {
    name: choosePreferredText(item?.name, item?.subject),
    price: choosePreferredText(
      item?.price?.price_legacy_formatted,
      item?.price?.price_symbol_formatted,
      item?.price?.price_code_formatted,
      item?.price?.price_formatted,
      item?.price
    ),
    image: imageUrl,
    description: '',
    url: normalizeUrl(choosePreferredText(item?.link, fallbackUrl), shopierUrl),
    category: 'Genel'
  };
};

const fetchProductsViaSearchApi = async (catalogConfig, cookieHeader, shopierUrl, initialVisibleCount = 0) => {
  const searchProductUrl = textValue(catalogConfig?.searchProductUrl);
  const csrfToken = textValue(catalogConfig?.csrfToken);
  if (!searchProductUrl || !csrfToken) return [];

  const username = textValue(catalogConfig?.username);
  const batchSize = Math.max(1, Number(catalogConfig?.defaultProductCount || 24) || 24);
  let offset = Math.max(0, Number(initialVisibleCount || batchSize) - 1);
  let showMore = true;
  let stagnantRounds = 0;
  const maxBatches = Math.max(1, Math.ceil(Math.max(Number(catalogConfig?.totalCount || 0), batchSize) / batchSize) + 3);
  const results = [];
  const seen = new Set();

  for (let batchIndex = 0; batchIndex < maxBatches && showMore && seen.size < MAX_PRODUCTS; batchIndex += 1) {
    const payload = new URLSearchParams({
      start: String(batchSize),
      offset: String(offset),
      filter: '0',
      sort: '0',
      filterMaxPrice: '',
      filterMinPrice: '',
      datesort: '-1',
      pricesort: '-1',
      value: ''
    }).toString();

    const response = await axiosPostWithRetry(searchProductUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookieHeader || '',
        Origin: 'https://www.shopier.com',
        Referer: shopierUrl,
        Accept: 'application/json, text/plain, */*',
        ...SHOPIER_AXIOS_HEADERS
      },
      timeout: 20000,
      maxRedirects: 0
    });

    if (!response || response.status === 429) {
      const error = new Error('Shopier search api 429');
      error.status = 429;
      error.response = response ? { status: response.status, headers: response.headers || {} } : undefined;
      throw error;
    }

    if (!response || response.status < 200 || response.status >= 300) {
      const error = new Error(`Shopier search api failed: ${response?.status || 'unknown'}`);
      error.status = response?.status || 500;
      throw error;
    }

    const responseData = response.data && typeof response.data === 'object'
      ? response.data
      : (() => {
        try {
          return JSON.parse((response.data || '').toString());
        } catch (error) {
          void error;
          return {};
        }
      })();

    const products = Array.isArray(responseData?.products) ? responseData.products : [];
    let batchAdded = 0;
    products.forEach((item) => {
      const normalized = normalizeSearchApiProduct(item, shopierUrl, username);
      const key = textValue(item?.id) || normalized.url || normalized.name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      results.push(normalized);
      batchAdded += 1;
    });

    showMore = Boolean(responseData?.show_more);
    if (!products.length || batchAdded === 0) {
      stagnantRounds += 1;
      if (stagnantRounds >= 2) break;
    } else {
      stagnantRounds = 0;
    }

    offset += batchSize;
    if (!showMore) break;
    await sleep(AXIOS_PAGE_DELAY_MS);
  }

  return results;
};

const normalizeProductRecord = (product, baseUrl) => {
  const name = textValue(product?.name || product?.title);
  const url = normalizeUrl(product?.url || product?.link || '', baseUrl);
  const image = normalizeUrl(product?.image || product?.imageUrl || '', baseUrl);
  const price = normalizePrice(product?.price || '');
  const description = textValue(product?.description);
  const categoryRaw = textValue(product?.category);

  return {
    name,
    price,
    image,
    description,
    url,
    category: categoryRaw || 'Genel'
  };
};

const choosePreferredText = (...values) => {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return '';
};

const findExistingProductKey = (productMap, normalized) => {
  const urlKey = (normalized.url || '').toLowerCase();
  if (urlKey && productMap.has(urlKey)) return urlKey;

  const nameKey = (normalized.name || '').toLowerCase();
  if (!nameKey) return '';

  for (const [key, value] of productMap.entries()) {
    const existingName = textValue(value?.name).toLowerCase();
    if (existingName && existingName === nameKey) {
      return key;
    }
  }

  return '';
};

const mergeProductIntoMap = (productMap, product, baseUrl) => {
  const normalized = normalizeProductRecord(product, baseUrl);
  if (!normalized.name && !normalized.url) return;

  const key = findExistingProductKey(productMap, normalized) || (normalized.url || normalized.name).toLowerCase();
  const previous = productMap.get(key) || {};
  const normalizedCategory = normalizeCategoryLabel(normalized.category);
  const previousCategory = normalizeCategoryLabel(previous.category);

  productMap.set(key, {
    name: choosePreferredText(previous.name, normalized.name),
    price: choosePreferredText(previous.price, normalized.price),
    image: choosePreferredText(previous.image, normalized.image),
    description: choosePreferredText(previous.description, normalized.description),
    url: choosePreferredText(previous.url, normalized.url),
    category: normalizedCategory !== 'Genel'
      ? normalizedCategory
      : (previousCategory || 'Genel')
  });
};

const extractStoreMetadataFromHtml = (html, pageUrl) => {
  const $ = cheerio.load((html || '').toString());
  const storeNameSelectors = [
    '.store-name',
    '.store-title',
    '.shop-name',
    '.merchant-name',
    'main h1',
    'header h1',
    'h1'
  ];
  const descriptionSelectors = [
    '.store-description',
    '.shop-description',
    '.description',
    '.merchant-description',
    'main p'
  ];

  let storeName = '';
  for (const selector of storeNameSelectors) {
    const text = textValue($(selector).first().text());
    if (text) {
      storeName = text;
      break;
    }
  }

  if (!storeName) {
    const title = textValue($('title').first().text());
    if (title) {
      const cleaned = title.split('|')[0].split('-').slice(0, 2).join(' - ');
      storeName = textValue(cleaned);
    }
  }

  if (!storeName) {
    try {
      const url = new URL(pageUrl);
      const leaf = (url.pathname.split('/').filter(Boolean).pop() || 'Shopier Magaza').toString();
      storeName = leaf.replace(/[-_]+/g, ' ').trim() || 'Shopier Magaza';
    } catch (error) {
      void error;
      storeName = 'Shopier Magaza';
    }
  }

  let description = textValue($('meta[name="description"]').attr('content'));
  if (!description) {
    for (const selector of descriptionSelectors) {
      const text = textValue($(selector).first().text());
      if (text) {
        description = text;
        break;
      }
    }
  }

  const logo = normalizeUrl(
    textValue($('meta[property="og:image"]').attr('content'))
      || textValue($('.logo img').first().attr('src'))
      || textValue($('.store-logo img').first().attr('src'))
      || textValue($('.navbar-brand img').first().attr('src')),
    pageUrl
  );

  // Sosyal medya linklerini çek
  const socialLinks = {
    instagram: '',
    facebook: '',
    twitter: '',
    whatsapp: '',
    youtube: ''
  };

  // Instagram
  const instagramSelectors = [
    'a[href*="instagram.com"]',
    'a[href*="instagr.am"]',
    '.social-instagram',
    '.instagram-link'
  ];
  for (const selector of instagramSelectors) {
    const href = textValue($(selector).first().attr('href'));
    if (href && href.includes('instagram')) {
      socialLinks.instagram = href;
      break;
    }
  }

  // Facebook
  const facebookSelectors = [
    'a[href*="facebook.com"]',
    'a[href*="fb.com"]',
    '.social-facebook',
    '.facebook-link'
  ];
  for (const selector of facebookSelectors) {
    const href = textValue($(selector).first().attr('href'));
    if (href && href.includes('facebook')) {
      socialLinks.facebook = href;
      break;
    }
  }

  // Twitter
  const twitterSelectors = [
    'a[href*="twitter.com"]',
    'a[href*="x.com"]',
    '.social-twitter',
    '.twitter-link'
  ];
  for (const selector of twitterSelectors) {
    const href = textValue($(selector).first().attr('href'));
    if (href && (href.includes('twitter') || href.includes('x.com'))) {
      socialLinks.twitter = href;
      break;
    }
  }

  // WhatsApp
  const whatsappSelectors = [
    'a[href*="wa.me"]',
    'a[href*="whatsapp.com"]',
    'a[href*="api.whatsapp.com"]',
    '.social-whatsapp',
    '.whatsapp-link'
  ];
  for (const selector of whatsappSelectors) {
    const href = textValue($(selector).first().attr('href'));
    if (href && href.includes('whatsapp')) {
      socialLinks.whatsapp = href;
      break;
    }
  }

  // YouTube
  const youtubeSelectors = [
    'a[href*="youtube.com"]',
    'a[href*="youtu.be"]',
    '.social-youtube',
    '.youtube-link'
  ];
  for (const selector of youtubeSelectors) {
    const href = textValue($(selector).first().attr('href'));
    if (href && href.includes('youtube')) {
      socialLinks.youtube = href;
      break;
    }
  }

  const totalCandidates = [
    textValue($('[data-testid="product-count"]').first().text()),
    textValue($('.product-count').first().text()),
    textValue($('.products-count').first().text()),
    textValue($('.count').first().text()),
    textValue($('body').text())
  ];

  const totalCount = totalCandidates.reduce((best, value) => {
    const parsed = parseTotalCountFromText(value);
    return parsed > best ? parsed : best;
  }, 0);

  return {
    storeName,
    description,
    logo,
    socialLinks,
    totalCount
  };
};

const extractProductsFromListingHtml = (html, pageUrl) => {
  const content = (html || '').toString();
  const $ = cheerio.load(content);
  const products = [];
  const seen = new Set();

    // 1. DENE: EVRENSEL SEÇİCİLER (StoreV1, V2, V3 Hepsi İçin)
  const universalSelectors = [
    // StoreV3 (Modern Shopier - glossgiyim & eellibesmoda tipi)
    { box: '.product-card', title: '.shopier-store--store-product-card-title', price: '.shopier-store--store-product-card-price-current', img: 'img' },
    { box: '.shopier--product-card', title: '.shopier-store--store-product-card-title', price: '.shopier-store--store-product-card-price-current', img: 'img' },
    { box: '.product-box', title: '.product-title', price: '.product-price', img: 'img' },
    // StoreV2 & Standart Temalar
    { box: '.product', title: '.product-title', price: '.price', img: 'img' },
    { box: '.product-item', title: '.product-name', price: '.product-price', img: 'img' },
    { box: '[data-product]', title: 'h3', price: '.amount', img: 'img' },
    // Klasik/Eski Yapılar
    { box: '.shop-item', title: '.title', price: '.cost', img: 'img' },
    { box: '.swiper-slide', title: 'h2', price: 'span', img: 'img' }
  ];

  for (const sel of universalSelectors) {
    $(sel.box).each((i, el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const scope = $(el);
      
      const name = textValue(scope.find(sel.title).first().text()) || 
                   textValue(scope.find('h1, h2, h3, h4, h5').first().text()) ||
                   textValue(scope.find('a[title]').first().attr('title'));
                   
      const price = textValue(scope.find(sel.price).first().text()) || 
                    textValue(scope.find('.amount, .cost, .price, [data-price]').first().text());
                    
      const img = normalizeUrl(
        scope.find(sel.img).attr('src') || 
        scope.find(sel.img).attr('data-src') || 
        scope.find('[data-setbg]').attr('data-setbg'), 
        pageUrl
      );
      
      const href = normalizeUrl(scope.find('a[href]').attr('href'), pageUrl);

      if (name && (price || img)) {
        products.push({
          name,
          price: normalizePrice(price),
          image: img,
          url: href || pageUrl,
          category: 'Genel'
        });
      }
    });
  }

  // 2. DENE: JSON-LD (Arama motorları için gömülen veri - Bot korumasına takılmaz)
  try {
    const scripts = $('script[type="application/ld+json"]');
    scripts.each((i, el) => {
      const text = $(el).html();
      if (text.includes('"@type":"Product"')) {
         const nameMatch = text.match(/"name"\s*:\s*"([^"]+)"/);
         const priceMatch = text.match(/"price"\s*:\s*"([^"]+)"/);
         const imageMatch = text.match(/"image"\s*:\s*"([^"]+)"/);
         if (nameMatch) {
            products.push({
              name: decodeEscapedJsonString(nameMatch[1]),
              price: priceMatch ? normalizePrice(priceMatch[1]) : '',
              image: imageMatch ? normalizeUrl(decodeEscapedJsonString(imageMatch[1]), pageUrl) : '',
              url: pageUrl,
              category: 'Genel'
            });
         }
      }
    });
  } catch (e) { void e; }

  // 3. DENE: HAM HTML TARAMA (Hiçbir seçici çalışmazsa fiyat etiketinden yakala)
  if (products.length === 0) {
     const priceRegex = /([0-9.,]+)\s*(?:₺|TL)/g;
     let match;
     while ((match = priceRegex.exec(content)) !== null && products.length < 15) {
        const index = match.index;
        const surrounding = content.substring(Math.max(0, index - 250), Math.min(content.length, index + 250));
        const imgMatch = surrounding.match(/src="([^"]+)"/);
        const titleMatch = surrounding.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
        if (imgMatch || titleMatch) {
           products.push({
              name: titleMatch ? textValue(titleMatch[1]) : 'Ürün',
              price: normalizePrice(match[0]),
              image: imgMatch ? normalizeUrl(imgMatch[1], pageUrl) : '',
              url: pageUrl,
              category: 'Genel'
           });
        }
     }
  }

    // 5. DENE: ULTRA-ROBUST GÖRSEL VE LİNK EŞLEŞTİRME (Her şey başarısız olursa)
    if (products.length === 0) {
      $('*').each((i, el) => {
        const node = $(el);
        const img = node.find('img').first();
        const link = node.closest('a').length ? node.closest('a') : node.find('a').first();
        
        if (img.length && link.length) {
          const href = normalizeUrl(link.attr('href'), pageUrl);
          const imgSrc = normalizeUrl(img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || img.attr('data-original') || img.attr('srcset')?.split(' ')[0], pageUrl);
          
          if (href && imgSrc && isLikelyShopierProductUrl(href, pageUrl)) {
            const name = textValue(img.attr('alt') || img.attr('title') || node.find('.shopier-store--store-product-card-title').text() || node.text() || 'Ürün');
            if (name && name.length > 2) {
              products.push({
                name,
                price: '',
                image: imgSrc,
                url: href,
                category: 'Genel'
              });
            }
          }
        }
      });
    }

  const currentPage = readPageParam(pageUrl);
  const nextHref = pickNextPageHref($, currentPage);
  return { products, nextHref, discoveredUrls: extractProductUrlsFromHtml(content, pageUrl, MAX_PRODUCTS) };
};

const extractCategoryFromDetailPage = ($) => {
  const selectors = [
    '.breadcrumb li:nth-last-child(2) a',
    '.breadcrumb li:nth-last-child(2)',
    '.breadcrumbs a:nth-last-child(2)',
    '.category a',
    '.product-category',
    '[itemprop="category"]'
  ];

  for (const selector of selectors) {
    const text = textValue($(selector).first().text());
    if (text && text.toLowerCase() !== 'anasayfa') return text;
  }

  const metaCategory = textValue($('meta[property="product:category"]').attr('content'));
  return metaCategory || 'Genel';
};

const fetchAxiosProductDetail = async (productUrl) => {
  const response = await axiosGetWithRetry(productUrl, {
    headers: SHOPIER_AXIOS_HEADERS,
    timeout: 20000,
    maxRedirects: 5
  });

  if (!response || response.status === 429) {
    const error = new Error('Shopier 429');
    error.status = 429;
    error.response = response ? { status: response.status, headers: response.headers || {} } : undefined;
    throw error;
  }

  if (!response || response.status < 200 || response.status >= 300) {
    const error = new Error(`Shopier product detail fetch failed: ${response?.status || 'unknown'}`);
    error.status = response?.status || 500;
    throw error;
  }

  const html = (response.data || '').toString();
  const $ = cheerio.load(html);
  const image = choosePreferredText(
    textValue($('meta[property="og:image"]').attr('content')),
    textValue($('.product-image img').first().attr('src')),
    textValue($('.main-image img').first().attr('src')),
    textValue($('img').first().attr('src'))
  );

  return {
    name: choosePreferredText(
      textValue($('.product-title').first().text()),
      textValue($('h1').first().text()),
      textValue($('.title').first().text()),
      textValue($('.name').first().text())
    ),
    price: choosePreferredText(
      textValue($('.price').first().text()),
      textValue($('.amount').first().text()),
      textValue($('.cost').first().text()),
      textValue($('[data-price]').first().text()),
      textValue($('[data-price]').first().attr('data-price'))
    ),
    description: choosePreferredText(
      textValue($('.description').first().text()),
      textValue($('.about').first().text()),
      textValue($('.summary').first().text()),
      textValue($('meta[name="description"]').attr('content'))
    ),
    image: normalizeUrl(image, productUrl),
    url: productUrl,
    category: extractCategoryFromDetailPage($),
    discoveredUrls: extractProductUrlsFromHtml(html, productUrl, MAX_PRODUCTS)
  };
};

const mapWithConcurrency = async (items, limit, iteratee) => {
  const out = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) break;

      try {
        out[index] = await iteratee(items[index], index);
      } catch (error) {
        out[index] = null;
      }
    }
  };

  const workers = Array.from({ length: Math.max(1, Number(limit || 1)) }, () => worker());
  await Promise.all(workers);
  return out;
};

const scrapeWithAxios = async (shopierUrl) => {
  const progressKey = `shopier:${shopierUrl}`;
  const productMap = new Map();
  const discoveredUrls = new Set();
  const diagnostics = {
    mode: 'axios',
    pagesFetched: 0,
    discoveredUrlCount: 0,
    detailFetchCount: 0,
    searchApiProductCount: 0
  };

  try {
    const backoff = getShopierBackoff(shopierUrl);
    const nextAllowedAt = Number(backoff?.nextAllowedAt || 0);
    if (nextAllowedAt > Date.now()) {
      const retryAfterSeconds = getRetryAfterSeconds(shopierUrl);
      const error = new Error(`Shopier gecici bekleme istiyor. ${retryAfterSeconds} saniye sonra tekrar deneyin.`);
      error.status = 429;
      error.retryAfterSeconds = retryAfterSeconds;
      throw error;
    }

    try {
      const response = await axios.get(shopierUrl, {
        headers: SHOPIER_AXIOS_HEADERS,
        timeout: 20000,
        maxRedirects: 5
      });
      const html = response.data.toString();
      const $ = cheerio.load(html);
      
      // DEPLOY VERIFICATION: If you see this in logs, code is ACTIVE
      console.log(`[DEPLOY_CHECK] Active on ${shopierUrl} - Length: ${html.length}`);

      // Look for StoreV3 config object
      const configMatch = html.match(/var\s+store_config\s*=\s*({.*?});/s) || 
                          html.match(/window\.store_config\s*=\s*({.*?});/s);
      
      if (configMatch) {
        try {
          const config = JSON.parse(configMatch[1]);
          if (config.products && Array.isArray(config.products)) {
            // Found embedded products!
            config.products.forEach(p => {
              mergeProductIntoMap(productMap, normalizeSearchApiProduct(p, shopierUrl, config.username), shopierUrl);
            });
            console.log(`Extracted ${config.products.length} products from embedded config`);
          }
        } catch (e) { 
          // Try more aggressive JSON extraction if direct parse fails
          try {
            const rawJson = configMatch[1].trim();
            const fixedJson = rawJson.replace(/\\'/g, "'");
            const config = JSON.parse(fixedJson);
            if (config.products && Array.isArray(config.products)) {
              config.products.forEach(p => {
                mergeProductIntoMap(productMap, normalizeSearchApiProduct(p, shopierUrl, config.username), shopierUrl);
              });
            }
          } catch (e2) { void e2; }
        }
      }
    } catch (e) { void e; }


    let storeMeta = {
      storeName: '',
      description: '',
      logo: '',
      totalCount: 0
    };
    let searchApiConfig = null;
    let searchApiCookieHeader = '';
    let initialVisibleCount = 0;

    let currentUrl = shopierUrl;
    const visitedUrls = new Set();

    for (let pageIndex = 0; pageIndex < AXIOS_MAX_PAGES; pageIndex += 1) {
      const normalizedCurrentUrl = normalizeUrl(currentUrl, shopierUrl) || shopierUrl;
      if (visitedUrls.has(normalizedCurrentUrl)) break;
      visitedUrls.add(normalizedCurrentUrl);

      const response = await axiosGetWithRetry(normalizedCurrentUrl, {
        headers: SHOPIER_AXIOS_HEADERS,
        timeout: 20000,
        maxRedirects: 5
      });

      if (!response || response.status === 429) {
        const error = new Error('Shopier 429');
        error.status = 429;
        error.response = response ? { status: response.status, headers: response.headers || {} } : undefined;
        throw error;
      }

      if (!response || response.status < 200 || response.status >= 300) {
        if (pageIndex > 0) break;
        const error = new Error(`Shopier page fetch failed: ${response?.status || 'unknown'}`);
        error.status = response?.status || 500;
        throw error;
      }

      diagnostics.pagesFetched += 1;
      const html = (response.data || '').toString();
      const extractedMeta = extractStoreMetadataFromHtml(html, normalizedCurrentUrl);
      if (pageIndex === 0) {
        searchApiConfig = extractShopierCatalogConfig(html, normalizedCurrentUrl);
        searchApiCookieHeader = buildCookieHeader(response.headers || {});
      }
      storeMeta = {
        storeName: choosePreferredText(storeMeta.storeName, extractedMeta.storeName),
        description: choosePreferredText(storeMeta.description, extractedMeta.description),
        logo: choosePreferredText(storeMeta.logo, extractedMeta.logo),
        totalCount: Math.max(Number(storeMeta.totalCount || 0), Number(extractedMeta.totalCount || 0))
      };

      const productCountBefore = productMap.size;
      const urlCountBefore = discoveredUrls.size;
      const listing = extractProductsFromListingHtml(html, normalizedCurrentUrl);
      (listing.discoveredUrls || []).forEach((productUrl) => {
        const normalizedProductUrl = normalizeUrl(productUrl, normalizedCurrentUrl);
        if (normalizedProductUrl) discoveredUrls.add(normalizedProductUrl);
      });

      (listing.products || []).forEach((product) => {
        mergeProductIntoMap(productMap, product, normalizedCurrentUrl);
      });
      if (pageIndex === 0) {
        initialVisibleCount = Math.max(initialVisibleCount, Number(listing.products?.length || 0));
      }

      diagnostics.discoveredUrlCount = discoveredUrls.size;

      const explicitNext = normalizeUrl(listing.nextHref, normalizedCurrentUrl);
      const currentPage = readPageParam(normalizedCurrentUrl);
      const fallbackNext = buildNextPageUrlFallback(normalizedCurrentUrl, currentPage + 1);
      const nextUrl = explicitNext || fallbackNext;
      const noCatalogGrowth = productMap.size === productCountBefore && discoveredUrls.size === urlCountBefore;

      setProgress(progressKey, {
        stage: 'fetching_pages',
        inflight: true,
        productCount: productMap.size,
        totalCount: Math.max(storeMeta.totalCount || 0, discoveredUrls.size)
      });

      const effectiveTotal = Math.max(Number(storeMeta.totalCount || 0), discoveredUrls.size);
      if (effectiveTotal > 0 && productMap.size >= effectiveTotal && discoveredUrls.size >= effectiveTotal) {
        break;
      }

      if (pageIndex === 0 && searchApiConfig?.showLoadMore && searchApiConfig?.searchProductUrl) {
        break;
      }

      if (!nextUrl || visitedUrls.has(nextUrl)) break;
      if (noCatalogGrowth && pageIndex > 0 && !explicitNext) break;

      currentUrl = nextUrl;
      await sleep(AXIOS_PAGE_DELAY_MS);
    }

    if (searchApiConfig?.showLoadMore && searchApiConfig?.searchProductUrl) {
      const searchApiProducts = await fetchProductsViaSearchApi(
        searchApiConfig,
        searchApiCookieHeader,
        shopierUrl,
        initialVisibleCount
      );

      searchApiProducts.forEach((product) => {
        mergeProductIntoMap(productMap, product, shopierUrl);
        const normalizedProductUrl = normalizeUrl(product?.url, shopierUrl);
        if (normalizedProductUrl) discoveredUrls.add(normalizedProductUrl);
      });

      diagnostics.searchApiProductCount = searchApiProducts.length;
      diagnostics.discoveredUrlCount = discoveredUrls.size;
    }

    const detailVisited = new Set();
    const detailQueued = new Set();
    const maxDetailDiscoveryVisits = Math.min(MAX_PRODUCTS, 2000);
    const effectiveCatalogTotal = Math.max(Number(storeMeta.totalCount || 0), discoveredUrls.size, productMap.size);
    const shouldSkipBulkDetailFetch = diagnostics.searchApiProductCount > 0 && productMap.size >= effectiveCatalogTotal;
    const queueDiscoveredDetailUrls = (urls) => {
      (urls || []).forEach((candidateUrl) => {
        const normalizedCandidateUrl = normalizeUrl(candidateUrl, shopierUrl);
        if (!normalizedCandidateUrl) return;
        discoveredUrls.add(normalizedCandidateUrl);
        if (detailVisited.has(normalizedCandidateUrl) || detailQueued.has(normalizedCandidateUrl)) return;
        detailQueued.add(normalizedCandidateUrl);
      });
    };

    if (!shouldSkipBulkDetailFetch) {
      queueDiscoveredDetailUrls(Array.from(discoveredUrls));
    }

    while (!shouldSkipBulkDetailFetch && detailQueued.size && detailVisited.size < maxDetailDiscoveryVisits) {
      const remainingBudget = maxDetailDiscoveryVisits - detailVisited.size;
      const batch = Array.from(detailQueued).slice(0, Math.max(1, remainingBudget));
      batch.forEach((productUrl) => {
        detailQueued.delete(productUrl);
        detailVisited.add(productUrl);
      });

      setProgress(progressKey, {
        stage: 'fetching_details',
        inflight: true,
        productCount: productMap.size,
        totalCount: Math.max(storeMeta.totalCount || 0, discoveredUrls.size)
      });

      const details = await mapWithConcurrency(
        batch,
        AXIOS_DETAIL_CONCURRENCY,
        async (productUrl) => await fetchAxiosProductDetail(productUrl)
      );

      diagnostics.detailFetchCount += batch.length;

      (details || []).forEach((product) => {
        if (!product) return;
        mergeProductIntoMap(productMap, product, shopierUrl);
        queueDiscoveredDetailUrls(product.discoveredUrls || []);
      });

      diagnostics.discoveredUrlCount = discoveredUrls.size;

      const effectiveTotal = Math.max(Number(storeMeta.totalCount || 0), discoveredUrls.size, productMap.size);
      if (effectiveTotal > 0 && productMap.size >= effectiveTotal && discoveredUrls.size >= effectiveTotal) {
        break;
      }

      if (discoveredUrls.size >= MAX_PRODUCTS || productMap.size >= MAX_PRODUCTS) {
        break;
      }
    }

    const products = Array.from(productMap.values())
      .map((product) => normalizeProductRecord(product, shopierUrl))
      .filter((product) => product.name || product.url)
      .slice(0, MAX_PRODUCTS);

    if (!products.length) {
      const error = new Error('Shopier magazasindan urun bulunamadi');
      error.status = 404;
      throw error;
    }

    setShopierBackoff(shopierUrl, {
      nextAllowedAt: 0,
      rateLimitCount: 0
    });

    setProgress(progressKey, {
      stage: 'completed',
      inflight: false,
      productCount: products.length,
      totalCount: Math.max(storeMeta.totalCount || 0, discoveredUrls.size, products.length),
      error: null
    });

    return {
      storeName: choosePreferredText(storeMeta.storeName, 'Shopier Magaza'),
      products,
      totalCount: Math.max(storeMeta.totalCount || 0, discoveredUrls.size, products.length),
      description: choosePreferredText(storeMeta.description, 'Profesyonel Shopier magazasi'),
      logo: choosePreferredText(storeMeta.logo, ''),
      socialLinks: storeMeta.socialLinks || {},
      theme: STATIC_THEME_ID,
      __diagnostics: diagnostics
    };
  } catch (error) {
    if (Number(error?.status || error?.response?.status || 0) === 429) {
      markRateLimited(shopierUrl, error);
    }

    setProgress(progressKey, {
      stage: 'failed',
      inflight: false,
      error: textValue(error?.message) || 'Shopier scrape hatasi'
    });
    throw error;
  }
};

const scrapeWithPuppeteerDom = async (shopierUrl, options = {}) => {
  let browser;
  try {
    const executablePath = await resolveChromeExecutablePath();
    const args = buildPuppeteerArgs();

    browser = await puppeteer.launch({
      headless: isProduction ? chromium.headless : (process.env.PUPPETEER_HEADLESS !== 'false'),
      args: buildPuppeteerArgs(),
      executablePath,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    
    // Stealth: Webdriver ve diğer bot işaretlerini temizle
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    await page.setViewport({ 
      width: 1920 + Math.floor(Math.random() * 100), 
      height: 1080 + Math.floor(Math.random() * 100) 
    });

    // Sayfaya git ve bekleme süresini artır
    await page.goto(shopierUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000 // 60 saniye limit
    });

    // Cloudflare/Bot kontrolü varsa biraz bekle
    await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));

    const categoryTabs = await page.evaluate(() => {
      try {
        const normalize = (t) => (t || '').toString().replace(/\s+/g, ' ').trim();
        const cssPath = (el) => {
          try {
            if (!el || !el.nodeType) return '';
            if (el.id) return `#${CSS.escape(el.id)}`;
            const parts = [];
            let cur = el;
            let guard = 0;
            while (cur && cur.nodeType === 1 && guard < 12) {
              guard += 1;
              const tag = (cur.tagName || '').toLowerCase();
              if (!tag) break;

              if (cur.id) {
                parts.unshift(`${tag}#${CSS.escape(cur.id)}`);
                break;
              }

              const parent = cur.parentElement;
              if (!parent) {
                parts.unshift(tag);
                break;
              }

              const siblings = Array.from(parent.children).filter((c) => (c.tagName || '').toLowerCase() === tag);
              const idx = siblings.indexOf(cur);
              if (idx >= 0 && siblings.length > 1) {
                parts.unshift(`${tag}:nth-of-type(${idx + 1})`);
              } else {
                parts.unshift(tag);
              }
              cur = parent;
            }
            return parts.join(' > ');
          } catch (e) {
            void e;
            return '';
          }
        };
        const out = [];
        const candidates = [];

        const navSelectors = [
          'nav a',
          'nav button',
          'nav [role="tab"]',
          '.store-tabs a',
          '.store-tabs button',
          '.tabs a',
          '.tabs button',
          '.shopier-store--store-tabs a',
          '.shopier-store--store-tabs button',
          '.shopier-store--store-tab a',
          '.shopier-store--store-tab button',
          '.shopier-store--store-category a'
        ];

        navSelectors.forEach((sel) => {
          try {
            document.querySelectorAll(sel).forEach((a) => candidates.push(a));
          } catch (e) {
            void e;
          }
        });

        const uniq = new Set();
        candidates.forEach((a) => {
          try {
            const text = normalize(a.textContent);
            const href = (a.getAttribute('href') || '').toString().trim();
            if (!text) return;
            const lower = text.toLowerCase();
            if (lower === 'tüm ürünler' || lower === 'tum urunler') {
              return;
            }
            if (lower === 'iletişim' || lower === 'iletisim') {
              return;
            }

            let hash = href.includes('#') ? href.split('#').slice(1).join('#') : '';
            if (!hash) {
              try {
                hash = encodeURIComponent(text);
              } catch (e) {
                void e;
                hash = '';
              }
            }
            const selector = cssPath(a);
            if (!hash && !selector) return;

            const key = `${text.toLowerCase()}|${(hash || selector).toLowerCase()}`;
            if (uniq.has(key)) return;
            uniq.add(key);
            out.push({ name: text, hash, selector });
          } catch (e) {
            void e;
          }
        });

        return out.slice(0, 30);
      } catch (e) {
        void e;
        return [];
      }
    });

    try {
      // StoreV3 ve genel seçiciler için bekle
      await page.waitForSelector('.shopier--product-card, .product, .item, [data-product]', { timeout: 15000 });
    } catch (e) {
      void e;
    }

    let effectiveTarget = 0;

    try {
      const targetCount = await page.evaluate(() => {
        try {
          const readNumberFromText = (t) => {
            const m = (t || '').toString().match(/(\d{1,5})\s*(?:ürün|urun)/i);
            if (!m || !m[1]) return 0;
            const n = Number(m[1]);
            return Number.isFinite(n) ? n : 0;
          };

          const candidates = [];
          candidates.push(document.querySelector('[data-testid="product-count"]')?.textContent);
          candidates.push(document.querySelector('.product-count')?.textContent);

          const bodyText = (document.body?.innerText || '').toString();
          const bodyMatch = bodyText.match(/\b(\d{1,5})\s*(?:ürün|urun)\b/i);
          if (bodyMatch && bodyMatch[0]) candidates.push(bodyMatch[0]);

          for (const c of candidates) {
            const n = readNumberFromText(c);
            if (n > 0) return n;
          }
          return 0;
        } catch (e) {
          void e;
          return 0;
        }
      });

      const computedEffectiveTarget = (() => {
        const t = Number(targetCount || 0);
        if (!Number.isFinite(t) || t <= 0) return 0;
        return Math.min(t, MAX_PRODUCTS);
      })();

      effectiveTarget = computedEffectiveTarget;

      let lastCount = 0;
      let stableRounds = 0;
      for (let i = 0; i < MAX_SCROLL_STEPS; i++) {
        const next = await page.evaluate(() => {
          const sel = '.product, .item, .product-card, .shop-item, .product-item, [data-product]';
          const count = document.querySelectorAll(sel).length;

          const clickLoadMore = () => {
            const candidates = Array.from(document.querySelectorAll('button, a'));
            for (const el of candidates) {
              const t = (el.textContent || '').toString().trim().toLowerCase();
              if (!t) continue;
              if (
                t.includes('daha fazla') ||
                t.includes('daha çok') ||
                t.includes('load more') ||
                t.includes('more')
              ) {
                try {
                  el.click();
                  return true;
                } catch (e) {
                  void e;
                }
              }
            }
            return false;
          };

          const clicked = clickLoadMore();
          try {
            window.scrollTo(0, document.body.scrollHeight);
          } catch (e) {
            void e;
          }
          return { count, clicked };
        });

        const count = Number(next?.count || 0);
        if (count > lastCount) {
          lastCount = count;
          stableRounds = 0;
        } else {
          stableRounds += 1;
        }

        await sleep(next?.clicked ? 1400 : 900);
        if (effectiveTarget > 0 && lastCount >= effectiveTarget) break;
        if (lastCount >= MAX_PRODUCTS) break;
        if (stableRounds >= (effectiveTarget > 0 ? 6 : 3)) break;
      }
    } catch (e) {
      void e;
    }

    try {
      const currentCount = await page.evaluate(() => {
        const sel = '.product, .item, .product-card, .shop-item, .product-item, [data-product]';
        return document.querySelectorAll(sel).length;
      });

      const needMore = Boolean(effectiveTarget > 0 && Number(currentCount || 0) > 0 && Number(currentCount || 0) < effectiveTarget);
      const hasCategoryTabs = Boolean(Array.isArray(categoryTabs) && categoryTabs.length);
      const shouldCollectAcrossCategories = Boolean(needMore || hasCategoryTabs);
      if (shouldCollectAcrossCategories) {
        const visited = new Set();
        visited.add(shopierUrl);

        const collectProductsOnPage = async (categoryName = '') => {
          return page.evaluate((activeCategory) => {
            const pickText = (el, selectors) => {
              for (const s of selectors) {
                const n = el.querySelector(s);
                const t = (n?.textContent || '').toString().trim();
                if (t) return t;
              }
              return '';
            };
            const pickAttr = (el, selectors, attr) => {
              for (const s of selectors) {
                const n = el.querySelector(s);
                const v = (n?.getAttribute?.(attr) || '').toString().trim();
                if (v) return v;
              }
              return '';
            };
            const productEls = Array.from(document.querySelectorAll('.product, .item, .product-card, .shop-item, .product-item, [data-product]'));
            const products = [];
            for (const el of productEls) {
              const name = pickText(el, ['.product-title', '.title', '.name', 'h2', 'h3', 'h4']);
              const price = pickText(el, ['.price', '.amount', '.cost', '[data-price]']);
              const image = pickAttr(el, ['img'], 'src') || pickAttr(el, ['img'], 'data-src');
              const url = (el.querySelector('a')?.getAttribute('href') || '').toString().trim();
              const desc = pickText(el, ['.description', '.desc', '.summary', '[data-desc]']);
              if (!name) continue;
              products.push({ name, price, image, url, description: desc, category: (activeCategory || '').toString() });
            }
            return products;
          }, categoryName);
        };

        const all = [];
        try {
          all.push(...(await collectProductsOnPage('')));
        } catch (e) {
          void e;
        }

        if (Array.isArray(categoryTabs) && categoryTabs.length) {
          for (const tab of categoryTabs) {
            const tabName = (tab?.name || '').toString().trim();
            const tabHash = (tab?.hash || '').toString().trim();
            const tabSelector = (tab?.selector || '').toString().trim();
            if (!tabName) continue;

            try {
              if (tabHash) {
                await page.evaluate((hash) => {
                  try {
                    window.location.hash = hash;
                  } catch (e) {
                    void e;
                  }
                }, tabHash);
                await sleep(800);
              } else if (tabSelector) {
                await page.click(tabSelector).catch(() => {});
                await sleep(900);
              }
            } catch (e) {
              void e;
            }

            try {
              let lastCount = 0;
              let stableRounds = 0;
              for (let i = 0; i < 10; i += 1) {
                const next = await page.evaluate(() => {
                  const sel = '.product, .item, .product-card, .shop-item, .product-item, [data-product]';
                  const count = document.querySelectorAll(sel).length;

                  const clickLoadMore = () => {
                    const candidates = Array.from(document.querySelectorAll('button, a'));
                    for (const el of candidates) {
                      const t = (el.textContent || '').toString().trim().toLowerCase();
                      if (!t) continue;
                      if (
                        t.includes('daha fazla') ||
                        t.includes('daha çok') ||
                        t.includes('load more') ||
                        t.includes('more')
                      ) {
                        try {
                          el.click();
                          return true;
                        } catch (e) {
                          void e;
                        }
                      }
                    }
                    return false;
                  };

                  const clicked = clickLoadMore();
                  try {
                    window.scrollTo(0, document.body.scrollHeight);
                  } catch (e) {
                    void e;
                  }
                  return { count, clicked };
                });

                const count = Number(next?.count || 0);
                if (count > lastCount) {
                  lastCount = count;
                  stableRounds = 0;
                } else {
                  stableRounds += 1;
                }
                await sleep(next?.clicked ? 1400 : 900);
                if (stableRounds >= 3) break;
              }
            } catch (e) {
              void e;
            }

            try {
              all.push(...(await collectProductsOnPage(tabName)));
            } catch (e) {
              void e;
            }
          }
        }

        for (let i = 0; i < 20; i++) {
          const nextUrl = await page.evaluate(() => {
            const href = document.querySelector('link[rel="next"]')?.getAttribute('href') || '';
            if (href) return href;

            const candidates = Array.from(document.querySelectorAll('a'));
            for (const a of candidates) {
              const h = (a.getAttribute('href') || '').toString();
              if (!h) continue;
              const t = (a.textContent || '').toString().trim().toLowerCase();
              if (t === '>' || t.includes('sonraki') || t.includes('next')) return h;
              if (h.includes('page=')) return h;
            }
            return '';
          });

          if (!nextUrl) break;
          let abs = '';
          try {
            abs = new URL(nextUrl, page.url()).toString();
          } catch (e) {
            void e;
            abs = '';
          }
          if (!abs || visited.has(abs)) break;
          visited.add(abs);

          try {
            await page.goto(abs, { waitUntil: 'networkidle2', timeout: 30000 });
          } catch (e) {
            void e;
            break;
          }

          try {
            await page.waitForSelector('.product, .item, .product-card, .shop-item, .product-item, [data-product]', { timeout: 12000 });
          } catch (e) {
            void e;
          }

          try {
            all.push(...(await collectProductsOnPage('')));
          } catch (e) {
            void e;
          }

          const uniqueCount = (() => {
            const seen = new Set();
            let c = 0;
            for (const p of all) {
              const key = `${(p?.url || '').toString()}|${(p?.name || '').toString()}`;
              if (!key || seen.has(key)) continue;
              seen.add(key);
              c += 1;
            }
            return c;
          })();

          if (effectiveTarget > 0 && uniqueCount >= effectiveTarget) break;
          if (uniqueCount >= MAX_PRODUCTS) break;
        }

        try {
          await page.evaluate((products) => {
            try {
              window.__odelinkCollectedProducts = Array.isArray(products) ? products : [];
            } catch (e) {
              void e;
            }
          }, all);
        } catch (e) {
          void e;
        }
      }
    } catch (e) {
      void e;
    }

    const raw = await page.evaluate(() => {
      const pickText = (el, selectors) => {
        for (const s of selectors) {
          const n = el.querySelector(s);
          const t = (n?.textContent || '').toString().trim();
          if (t) return t;
        }
        return '';
      };

      const pickAttr = (el, selectors, attr) => {
        for (const s of selectors) {
          const n = el.querySelector(s);
          const v = (n?.getAttribute?.(attr) || '').toString().trim();
          if (v) return v;
        }
        return '';
      };

      const storeName = (
        document.querySelector('h1')?.textContent ||
        document.querySelector('.store-name')?.textContent ||
        document.querySelector('.shop-name')?.textContent ||
        document.querySelector('.brand-name')?.textContent ||
        document.title ||
        ''
      ).toString().trim();

      const description = (
        document.querySelector('.store-description')?.textContent ||
        document.querySelector('.about')?.textContent ||
        document.querySelector('.description')?.textContent ||
        ''
      ).toString().trim();

      const logo = (
        document.querySelector('.logo img')?.getAttribute('src') ||
        document.querySelector('.store-logo img')?.getAttribute('src') ||
        ''
      ).toString().trim();

      const collected = Array.isArray(window.__odelinkCollectedProducts) ? window.__odelinkCollectedProducts : null;
      const productEls = collected
        ? []
        : Array.from(document.querySelectorAll('.product, .item, .product-card, .shop-item, .product-item, [data-product]'));
      const products = [];
      if (collected) {
        const seen = new Set();
        for (const p of collected) {
          const name = (p?.name || '').toString().trim();
          if (!name) continue;
          const url = (p?.url || '').toString().trim();
          const key = `${url}|${name}`;
          if (seen.has(key)) continue;
          seen.add(key);
          products.push({
            name,
            price: (p?.price || '').toString(),
            image: (p?.image || '').toString(),
            url,
            description: (p?.description || '').toString(),
            category: (p?.category || '').toString()
          });
        }
      } else {
        for (const el of productEls) {
          const name = pickText(el, ['.product-title', '.title', '.name', 'h2', 'h3', 'h4']);
          const price = pickText(el, ['.price', '.amount', '.cost', '[data-price]']);
          const image = pickAttr(el, ['img'], 'src') || pickAttr(el, ['img'], 'data-src');
          const url = (el.querySelector('a')?.getAttribute('href') || '').toString().trim();
          const desc = pickText(el, ['.description', '.desc', '.summary', '[data-desc]']);
          if (!name) continue;
          products.push({ name, price, image, url, description: desc, category: '' });
        }
      }

      return { storeName, description, logo, products };
    });

    const storeData = {
      storeName: raw?.storeName || 'Shopier Mağaza',
      products: (raw?.products || []).map((p) => ({
        name: (p?.name || '').toString(),
        price: (p?.price || '').toString(),
        image: normalizeUrl(p?.image || '', shopierUrl),
        description: (p?.description || '').toString(),
        url: normalizeUrl(p?.url || '', shopierUrl) || shopierUrl,
        category: normalizeCategoryLabel(p?.category)
      })),
      totalCount: effectiveTarget || 0,
      description: (raw?.description || 'Profesyonel Shopier mağazası').toString(),
      logo: normalizeUrl(raw?.logo || '', shopierUrl),
      theme: STATIC_THEME_ID
    };

    storeData.products = storeData.products.slice(0, MAX_PRODUCTS);
    return storeData;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        void e;
      }
    }
  }
};

// Validate Shopier URL
const validateShopierUrl = (url) => {
  return true; // Her girişi kabul et
};

const shouldForceFullDiscovery = (data, options = {}) => {
  const force = Boolean(options?.force);
  const total = Number(data?.totalCount || 0);
  const current = Number((data?.products || []).length);

  if (force) {
    if (current <= 0) return true;
    if (total > 0) return current < total;
    return current < FORCE_DISCOVERY_MIN_PRODUCTS;
  }
  if (total > 0 && current < total) return true;
  if (current <= 0) return true;
  return current < FORCE_DISCOVERY_MIN_PRODUCTS;
};

const ensureFullDiscovery = async (shopierUrl, data, options = {}) => {
  try {
    const total = Number(data?.totalCount || 0);
    const current = Number((data?.products || []).length);
    if (!shouldForceFullDiscovery(data, options)) return data;

    const urls = await scrapeProductUrlsWithPuppeteer(shopierUrl, { maxPages: 120 });
    const uniqUrls = Array.from(new Set((urls || []).filter(Boolean)));
    if (!uniqUrls.length) return data;

    const existing = new Set((data?.products || []).map((p) => (p?.url || '').toString()));
    const productQueue = [];
    const queued = new Set();
    const visited = new Set();
    const maxDetailDiscoveryVisits = Math.min(MAX_PRODUCTS, 50000);
    const dataProducts = Array.isArray(data.products) ? data.products : [];
    data.products = dataProducts;

    const enqueueDetailUrls = (rawUrls) => {
      (Array.isArray(rawUrls) ? rawUrls : []).forEach((rawUrl) => {
        const normalizedUrl = normalizeUrl(rawUrl, shopierUrl);
        if (!normalizedUrl || queued.has(normalizedUrl) || existing.has(normalizedUrl) || visited.has(normalizedUrl)) {
          return;
        }
        queued.add(normalizedUrl);
        productQueue.push(normalizedUrl);
      });
    };

    enqueueDetailUrls(uniqUrls);
    if (!productQueue.length) {
      data.totalCount = Math.max(total, current, uniqUrls.length);
      return data;
    }

    const fetchProductDetail = async (productUrl) => {
      const response = await axiosGetWithRetry(productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 20000,
        maxRedirects: 5
      });

      if (!response || response.status === 429) {
        const error = new Error('Shopier 429');
        error.status = 429;
        throw error;
      }

      if (!response || response.status < 200 || response.status >= 300) {
        const error = new Error(`Shopier product detail fetch failed: ${response?.status || 'unknown'}`);
        error.status = response?.status || 500;
        throw error;
      }

      const $ = cheerio.load(response.data);
      const name = $('.product-title, h1, .title, .name').first().text().trim();
      const price = $('.price, .amount, .cost, [data-price]').first().text().trim();
      const description = $('.description, .about, .summary, [data-desc]').first().text().trim();
      const image =
        $('.product-image img, .main-image img, img').first().attr('src') ||
        $('.product-image img, .main-image img, img').first().attr('data-src') ||
        '';

      return {
        name,
        price,
        description,
        image: normalizeUrl(image, productUrl),
        url: productUrl,
        discoveredUrls: extractProductUrlsFromHtml(response.data, productUrl, MAX_PRODUCTS)
      };
    };

    const mapWithConcurrency = async (items, limit, fn) => {
      const out = new Array(items.length);
      let idx = 0;
      const worker = async () => {
        while (idx < items.length) {
          const cur = idx;
          idx += 1;
          try {
            out[cur] = await fn(items[cur], cur);
          } catch (error) {
            void error;
            out[cur] = null;
          }
        }
      };

      const workers = Array.from({ length: Math.max(1, limit) }, () => worker());
      await Promise.all(workers);
      return out;
    };

    const addProduct = (product) => {
      if (!product?.name) return;
      const normalized = {
        name: product.name,
        price: normalizePrice(product.price) || '',
        image: normalizeUrl(product.image || '', shopierUrl),
        description: product.description || '',
        url: normalizeUrl(product.url || '', shopierUrl) || shopierUrl
      };
      const key = `${normalized.url}|${normalized.name}`;
      if ((data.products || []).some((entry) => `${entry.url}|${entry.name}` === key)) return;
      data.products.push(normalized);
      existing.add(normalized.url);
    };

    while (productQueue.length > 0 && visited.size < maxDetailDiscoveryVisits) {
      const batch = productQueue.splice(0, AXIOS_DETAIL_CONCURRENCY);
      batch.forEach((url) => visited.add(url));

      const details = await mapWithConcurrency(batch, AXIOS_DETAIL_CONCURRENCY, async (url) => fetchProductDetail(url));
      for (const detail of details || []) {
        if (!detail) continue;
        if (Array.isArray(detail.discoveredUrls) && detail.discoveredUrls.length) {
          enqueueDetailUrls(detail.discoveredUrls);
        }
        if (detail?.name) addProduct(detail);
      }

      const effectiveTotal = Math.max(total, uniqUrls.length, data.products.length);
      if (effectiveTotal > 0 && data.products.length >= effectiveTotal && productQueue.length === 0) {
        break;
      }

      if (data.products.length >= MAX_PRODUCTS) {
        break;
      }
    }

    data.totalCount = Math.max(total, (data.products || []).length, uniqUrls.length, productQueue.length + visited.size);
    return data;
  } catch (error) {
    void error;
    return data;
  }
};

const SHOPIER_SYNC_RECOVERY_LIMIT = 30;
const SHOPIER_SYNC_RECOVERY_INTERVAL_MS = (() => {
  const n = Number(process.env.SHOPIER_SYNC_RECOVERY_INTERVAL_MS || (5 * 60 * 1000));
  if (!Number.isFinite(n) || n <= 0) return 5 * 60 * 1000;
  return Math.floor(n);
})();

const USER_RESTART_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const USER_RESTART_RATE_LIMIT_MAX = 2;
const restartRateLimiter = new Map();

const checkRestartRateLimit = ({ userId, siteId }) => {
  const now = Date.now();
  const key = `${(userId || '').toString()}:${(siteId || '').toString()}`;
  const existing = restartRateLimiter.get(key);
  if (!existing || now >= Number(existing.until || 0)) {
    const next = { until: now + USER_RESTART_RATE_LIMIT_WINDOW_MS, count: 1 };
    restartRateLimiter.set(key, next);
    return { allowed: true, remainingMs: USER_RESTART_RATE_LIMIT_WINDOW_MS, used: 1 };
  }

  const used = Number(existing.count || 0) || 0;
  if (used >= USER_RESTART_RATE_LIMIT_MAX) {
    return { allowed: false, remainingMs: Math.max(0, Number(existing.until || 0) - now), used };
  }

  const next = { until: Number(existing.until || 0), count: used + 1 };
  restartRateLimiter.set(key, next);
  return { allowed: true, remainingMs: Math.max(0, next.until - now), used: next.count };
};

const normalizeSyncTimestamp = (value, fallback = Date.now()) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  const parsed = Date.parse((value || '').toString());
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return Math.max(0, Number(fallback || 0));
};

const createSyncJobRecord = (partial = {}) => {
  const nextAllowedAt = partial?.nextAllowedAt
    ? normalizeSyncTimestamp(partial.nextAllowedAt, 0)
    : 0;

  return {
    jobId: ((partial?.jobId || `${Date.now()}_${Math.random().toString(16).slice(2)}`) + '').toString(),
    subdomain: (partial?.subdomain || '').toString().trim().toLowerCase(),
    siteId: partial?.siteId || null,
    shopierUrl: (partial?.shopierUrl || '').toString().trim(),
    status: (partial?.status || 'queued').toString().trim().toLowerCase() || 'queued',
    startedAt: normalizeSyncTimestamp(partial?.startedAt, Date.now()),
    updatedAt: normalizeSyncTimestamp(partial?.updatedAt, Date.now()),
    totalCount: Number(partial?.totalCount || 0) || 0,
    productCount: Number(partial?.productCount || 0) || 0,
    error: partial?.error ? (partial.error + '').toString() : null,
    retryAfterSeconds: Math.max(0, Number(partial?.retryAfterSeconds || 0) || 0),
    nextAllowedAt: nextAllowedAt > 0 ? nextAllowedAt : null
  };
};

const hasActiveSyncJob = (job) => {
  const status = (job?.status || '').toString().trim().toLowerCase();
  return status === 'queued' || status === 'running';
};

const syncRetryTimersBySubdomain = new Map();

const clearSyncRetryTimer = (subdomain) => {
  try {
    const key = (subdomain || '').toString().trim().toLowerCase();
    const t = syncRetryTimersBySubdomain.get(key);
    if (t) {
      clearTimeout(t);
      syncRetryTimersBySubdomain.delete(key);
    }
  } catch (e) {
    void e;
  }
};

const scheduleSyncRetryIfNeeded = (site, job, { subdomain, shopierUrl } = {}) => {
  const sd = (subdomain || job?.subdomain || site?.subdomain || '').toString().trim().toLowerCase();
  if (!sd) return;
  const nextAllowedAt = normalizeSyncTimestamp(job?.nextAllowedAt, 0);
  if (!nextAllowedAt || nextAllowedAt <= Date.now()) return;
  const delayMs = Math.max(250, Math.min(nextAllowedAt - Date.now(), 30 * 60 * 1000));

  clearSyncRetryTimer(sd);
  const t = setTimeout(() => {
    try {
      syncRetryTimersBySubdomain.delete(sd);
      startBackgroundSyncJob(site, {
        subdomain: sd,
        shopierUrl: (shopierUrl || job?.shopierUrl || '').toString().trim(),
        existingJob: job
      });
    } catch (e) {
      void e;
    }
  }, delayMs);
  syncRetryTimersBySubdomain.set(sd, t);
};

const createSiteSyncStatePatcher = (site) => {
  let currentSyncState = (site?.settings?.shopier_sync && typeof site.settings.shopier_sync === 'object')
    ? { ...site.settings.shopier_sync }
    : {};

  return async (patch) => {
    try {
      currentSyncState = {
        ...currentSyncState,
        ...(patch || {}),
        updatedAt: new Date().toISOString()
      };
      site.settings = {
        ...(site?.settings || {}),
        shopier_sync: currentSyncState
      };
      await Site.update(site.id, {
        settings: {
          shopier_sync: currentSyncState
        }
      });
    } catch (e) {
      void e;
    }
  };
};

const updateSyncJobState = async (job, patchSiteSyncState, patch = {}) => {
  Object.assign(job, patch || {});
  job.status = (job.status || 'queued').toString().trim().toLowerCase() || 'queued';
  job.retryAfterSeconds = Math.max(0, Number(job.retryAfterSeconds || 0) || 0);
  job.totalCount = Number(job.totalCount || 0) || 0;
  job.productCount = Number(job.productCount || 0) || 0;
  job.error = job.error ? (job.error + '').toString() : null;
  job.updatedAt = Date.now();
  syncJobsBySubdomain.set(job.subdomain, job);

  await patchSiteSyncState({
    jobId: job.jobId,
    shopierUrl: job.shopierUrl,
    status: job.status,
    startedAt: new Date(job.startedAt).toISOString(),
    totalCount: job.totalCount,
    productCount: job.productCount,
    retryAfterSeconds: job.retryAfterSeconds,
    nextAllowedAt: job.nextAllowedAt ? new Date(job.nextAllowedAt).toISOString() : null,
    error: job.error
  });

  return job;
};

const buildCollectionsFromProducts = (products) => {
  const groups = new Map();
  (Array.isArray(products) ? products : []).forEach((product, index) => {
    const name = normalizeCategoryLabel(product?.category);
    if (!groups.has(name)) {
      groups.set(name, []);
    }
    groups.get(name).push(index);
  });

  return Array.from(groups.entries())
    .map(([name, productIndices]) => ({
      name,
      slug: normalizeCategoryLabel(name)
        .toLocaleLowerCase('tr-TR')
        .replace(/[^a-z0-9çğıöşü\s-]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'genel',
      productIndices
    }))
    .sort((left, right) => right.productIndices.length - left.productIndices.length || left.name.localeCompare(right.name, 'tr'));
};

const formatSyncJobError = (error, shopierUrl) => {
  try {
    const status = Number(error?.status || error?.response?.status || 0) || 0;
    const code = (error?.code || '').toString();
    const name = (error?.name || '').toString();
    const message = (error?.message || 'sync_failed').toString();
    const stack = (error?.stack || '').toString();
    const stackLine = stack.split('\n').map((x) => x.trim()).filter(Boolean)[0] || '';
    const retryAfter = (error?.retryAfterSeconds || '').toString();
    const headers = error?.response?.headers && typeof error.response.headers === 'object'
      ? error.response.headers
      : null;

    const headerHint = headers
      ? JSON.stringify({
        'retry-after': headers['retry-after'],
        'cf-ray': headers['cf-ray'],
        server: headers['server']
      })
      : '';

    return [
      `status=${status}`,
      code ? `code=${code}` : null,
      name ? `name=${name}` : null,
      retryAfter ? `retryAfterSeconds=${retryAfter}` : null,
      `url=${(shopierUrl || '').toString()}`,
      `message=${message}`,
      stackLine ? `at=${stackLine}` : null,
      headerHint ? `headers=${headerHint}` : null
    ].filter(Boolean).join(' | ').slice(0, 1800);
  } catch (e) {
    void e;
    return ((error?.message || 'sync_failed') + '').toString().slice(0, 1800);
  }
};

const runSyncSiteJob = async ({ site, subdomain, shopierUrl, existingJob = null }) => {
  const patchSiteSyncState = createSiteSyncStatePatcher(site);
  const persistedSync = (site?.settings?.shopier_sync && typeof site.settings.shopier_sync === 'object')
    ? site.settings.shopier_sync
    : {};
  const job = createSyncJobRecord({
    ...persistedSync,
    ...(existingJob || {}),
    subdomain,
    siteId: site.id,
    shopierUrl
  });
  const resumedNextAllowedAt = job.nextAllowedAt;
  let lastObservedProductCount = Number(job.productCount || 0) || 0;
  let lastObservedTotalCount = Number(job.totalCount || 0) || 0;
  let lastObservedProducts = Array.isArray(site?.settings?.products_data) ? site.settings.products_data : [];

  try {
    await updateSyncJobState(job, patchSiteSyncState, {
      status: 'running',
      retryAfterSeconds: 0,
      nextAllowedAt: null,
      error: null
    });

    if (isProduction) {
      const resumedWaitSeconds = resumedNextAllowedAt && resumedNextAllowedAt > Date.now()
        ? Math.ceil((resumedNextAllowedAt - Date.now()) / 1000)
        : 0;

      if (resumedWaitSeconds > 0) {
        await updateSyncJobState(job, patchSiteSyncState, {
          status: 'queued',
          retryAfterSeconds: resumedWaitSeconds,
          nextAllowedAt: Date.now() + (resumedWaitSeconds * 1000),
          error: null
        });
        await sleep(resumedWaitSeconds * 1000);
        await updateSyncJobState(job, patchSiteSyncState, {
          status: 'running',
          retryAfterSeconds: 0,
          nextAllowedAt: null,
          error: null
        });
      }
    }

    try {
      const progressKey = `shopier:${shopierUrl}`;
      setProgress(progressKey, { stage: 'sync', inflight: true, productCount: 0, totalCount: 0 });
    } catch (e) {
      void e;
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      let scrapeResult;
      try {
        scrapeResult = await scrapeShopier({
          url: shopierUrl,
          force: true,
          discoverAll: true
        });
      } catch (e) {
        const status = Number(e?.status || e?.response?.status || 0);
        if (status === 429 && isProduction) {
          markRateLimited(shopierUrl, e);
          const waitSeconds = Math.max(1, getRetryAfterSeconds(shopierUrl));
          await updateSyncJobState(job, patchSiteSyncState, {
            status: 'queued',
            retryAfterSeconds: waitSeconds,
            nextAllowedAt: Date.now() + (waitSeconds * 1000),
            error: null
          });
          await sleep(waitSeconds * 1000);
          await updateSyncJobState(job, patchSiteSyncState, {
            status: 'running',
            retryAfterSeconds: 0,
            nextAllowedAt: null,
            error: null
          });
          continue;
        }
        throw e;
      }

      try {
        const progressKey = `shopier:${shopierUrl}`;
        const progress = scrapeProgress.get(progressKey);
        if (progress) {
          await updateSyncJobState(job, patchSiteSyncState, {
            totalCount: Number(progress.totalCount || 0) || job.totalCount,
            productCount: Number(progress.productCount || 0) || job.productCount
          });
        }
      } catch (e) {
        void e;
      }

      const products = (scrapeResult?.products || []).map((product, index) => ({
        id: index + 1,
        title: (product?.name || product?.title || '').toString(),
        price: (product?.price || '').toString(),
        image: (product?.image || '').toString(),
        link: (product?.url || product?.link || '').toString(),
        description: (product?.description || '').toString(),
        category: normalizeCategoryLabel(product?.category)
      })).filter((product) => product.title && product.link);

      const collections = buildCollectionsFromProducts(products);
      const expectedTotal = Math.max(
        Number(job.totalCount || 0) || 0,
        Number(scrapeResult?.totalCount || 0) || 0,
        products.length
      );

      lastObservedProducts = products;
      lastObservedProductCount = products.length;
      lastObservedTotalCount = expectedTotal;
      const refreshedAt = new Date().toISOString();
      const complete = expectedTotal > 0
        ? products.length >= expectedTotal
        : products.length > 0;

      await updateSyncJobState(job, patchSiteSyncState, {
        status: 'running',
        totalCount: expectedTotal,
        productCount: products.length,
        error: null
      });

      if (!complete && isProduction) {
        const waitSeconds = Math.max(15, getRetryAfterSeconds(shopierUrl));

        const queuedSyncState = {
          ...(site?.settings?.shopier_sync || {}),
          updatedAt: new Date().toISOString(),
          status: 'queued',
          totalCount: expectedTotal,
          productCount: products.length,
          jobId: job.jobId,
          shopierUrl,
          startedAt: new Date(job.startedAt).toISOString(),
          retryAfterSeconds: waitSeconds,
          nextAllowedAt: new Date(Date.now() + (waitSeconds * 1000)).toISOString(),
          error: null
        };

        await Site.update(site.id, {
          settings: {
            products_data: products,
            collections,
            catalog_total_products: expectedTotal,
            catalog_category_count: collections.length,
            catalog_discovery_mode: 'full',
            catalog_full_sync_complete: false,
            catalog_refresh_version: CATALOG_REFRESH_VERSION,
            catalog_refreshed_at: refreshedAt,
            shopierUrl,
            shopier_url: shopierUrl,
            shopier_sync: queuedSyncState
          }
        });

        site.settings = {
          ...(site?.settings || {}),
          products_data: products,
          collections,
          catalog_total_products: expectedTotal,
          catalog_category_count: collections.length,
          catalog_discovery_mode: 'full',
          catalog_full_sync_complete: false,
          catalog_refresh_version: CATALOG_REFRESH_VERSION,
          catalog_refreshed_at: refreshedAt,
          shopierUrl,
          shopier_url: shopierUrl,
          shopier_sync: queuedSyncState
        };

        await updateSyncJobState(job, patchSiteSyncState, {
          status: 'queued',
          retryAfterSeconds: waitSeconds,
          nextAllowedAt: Date.now() + (waitSeconds * 1000),
          error: null
        });

        await sleep(waitSeconds * 1000);
        await updateSyncJobState(job, patchSiteSyncState, {
          status: 'running',
          retryAfterSeconds: 0,
          nextAllowedAt: null,
          error: null
        });
        continue;
      }

      const completedSyncState = {
        ...(site?.settings?.shopier_sync || {}),
        updatedAt: new Date().toISOString(),
        status: complete ? 'completed' : 'queued',
        totalCount: expectedTotal,
        productCount: products.length,
        jobId: job.jobId,
        shopierUrl,
        startedAt: new Date(job.startedAt).toISOString(),
        retryAfterSeconds: 0,
        nextAllowedAt: null,
        error: null
      };

      await Site.update(site.id, {
        settings: {
          products_data: products,
          collections,
          catalog_total_products: expectedTotal,
          catalog_category_count: collections.length,
          catalog_discovery_mode: 'full',
          catalog_full_sync_complete: Boolean(complete),
          catalog_refresh_version: CATALOG_REFRESH_VERSION,
          catalog_refreshed_at: refreshedAt,
          shopierUrl,
          shopier_url: shopierUrl,
          shopier_sync: completedSyncState
        }
      });

      site.settings = {
        ...(site?.settings || {}),
        products_data: products,
        collections,
        catalog_total_products: expectedTotal,
        catalog_category_count: collections.length,
        catalog_discovery_mode: 'full',
        catalog_full_sync_complete: Boolean(complete),
        catalog_refresh_version: CATALOG_REFRESH_VERSION,
        catalog_refreshed_at: refreshedAt,
        shopierUrl,
        shopier_url: shopierUrl,
        shopier_sync: completedSyncState
      };

      await updateSyncJobState(job, patchSiteSyncState, {
        status: complete ? 'completed' : 'queued',
        retryAfterSeconds: 0,
        nextAllowedAt: null,
        error: null
      });

      return job;
    }

    const fallbackWaitSeconds = Math.max(30, getRetryAfterSeconds(shopierUrl));
    await updateSyncJobState(job, patchSiteSyncState, {
      status: 'queued',
      totalCount: lastObservedTotalCount,
      productCount: lastObservedProductCount,
      retryAfterSeconds: fallbackWaitSeconds,
      nextAllowedAt: Date.now() + (fallbackWaitSeconds * 1000),
      error: null
    });

    return job;
  } catch (e) {
    const status = Number(e?.status || e?.response?.status || 0);
    if (status === 429) {
      const waitSeconds = Math.max(1, getRetryAfterSeconds(shopierUrl));
      await updateSyncJobState(job, patchSiteSyncState, {
        status: 'queued',
        retryAfterSeconds: waitSeconds,
        nextAllowedAt: Date.now() + (waitSeconds * 1000),
        error: null
      });
    } else {
      const detailedError = formatSyncJobError(e, shopierUrl);
      console.error('shopier sync failed', {
        subdomain,
        shopierUrl,
        error: detailedError
      });
      await updateSyncJobState(job, patchSiteSyncState, {
        status: 'failed',
        retryAfterSeconds: 0,
        nextAllowedAt: null,
        error: detailedError
      });
    }
    throw e;
  }
};

const startBackgroundSyncJob = (site, { subdomain, shopierUrl, existingJob = null, force = false } = {}) => {
  const normalizedSubdomain = (subdomain || site?.subdomain || '').toString().trim().toLowerCase();
  const resolvedShopierUrl = (shopierUrl || site?.settings?.shopierUrl || site?.shopier_url || '').toString().trim();
  const liveJob = syncJobsBySubdomain.get(normalizedSubdomain);

  if (!force && hasActiveSyncJob(liveJob)) {
    scheduleSyncRetryIfNeeded(site, liveJob, { subdomain: normalizedSubdomain, shopierUrl: resolvedShopierUrl });
    return liveJob;
  }

  clearSyncRetryTimer(normalizedSubdomain);

  const bootstrapJob = createSyncJobRecord({
    ...(existingJob || {}),
    subdomain: normalizedSubdomain,
    siteId: site?.id || null,
    shopierUrl: resolvedShopierUrl,
    status: existingJob?.status || 'queued'
  });

  syncJobsBySubdomain.set(normalizedSubdomain, bootstrapJob);
  runSyncSiteJob({
    site,
    subdomain: normalizedSubdomain,
    shopierUrl: resolvedShopierUrl,
    existingJob: bootstrapJob
  }).catch((error) => {
    console.warn('shopier sync background job failed', {
      subdomain: normalizedSubdomain,
      message: error?.message || String(error)
    });

    try {
      const latestJob = syncJobsBySubdomain.get(normalizedSubdomain) || bootstrapJob;
      scheduleSyncRetryIfNeeded(site, latestJob, { subdomain: normalizedSubdomain, shopierUrl: resolvedShopierUrl });
    } catch (e) {
      void e;
    }
  });

  return bootstrapJob;
};

const markSyncRecoveryFailed = async (site, syncState, message) => {
  try {
    await Site.update(site.id, {
      settings: {
        shopier_sync: {
          ...(syncState || {}),
          status: 'failed',
          error: message,
          retryAfterSeconds: 0,
          nextAllowedAt: null,
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (e) {
    void e;
  }
};

const recoverPersistedSyncJobs = async () => {
  const sites = await Site.findByShopierSyncStatuses(['queued', 'running'], SHOPIER_SYNC_RECOVERY_LIMIT);
  const now = Date.now();

  for (const site of sites || []) {
    const syncState = (site?.settings?.shopier_sync && typeof site.settings.shopier_sync === 'object')
      ? site.settings.shopier_sync
      : {};
    const subdomain = (site?.subdomain || '').toString().trim().toLowerCase();
    const shopierUrl = (syncState?.shopierUrl || site?.settings?.shopierUrl || site?.shopier_url || '').toString().trim();
    const updatedAtMs = normalizeSyncTimestamp(syncState?.updatedAt || site?.updated_at, 0);
    const staleRecovery = updatedAtMs > 0 && (now - updatedAtMs) > SHOPIER_SYNC_JOB_TTL_MS;

    if (!subdomain || !validateShopierUrl(shopierUrl)) {
      await markSyncRecoveryFailed(site, syncState, 'Kaydedilen Shopier adresi gecersiz. Yeniden senkronizasyon baslatin.');
      continue;
    }

    if (staleRecovery) {
      try {
        await Site.update(site.id, {
          settings: {
            shopier_sync: {
              ...(syncState || {}),
              status: 'queued',
              retryAfterSeconds: 0,
              nextAllowedAt: null,
              error: null,
              updatedAt: new Date().toISOString()
            }
          }
        });
      } catch (e) {
        void e;
      }
    }

    startBackgroundSyncJob(site, {
      subdomain,
      shopierUrl,
      existingJob: syncState
    });

    if (isProduction) {
      await sleep(250);
    }
  }
};

router.post('/sync-site-products/restart', authMiddleware, async (req, res) => {
  try {
    const rawSiteId = (req.body?.siteId || '').toString().trim();
    const rawSubdomain = (req.body?.subdomain || '').toString().trim().toLowerCase();
    if (!rawSiteId && !rawSubdomain) {
      return res.status(400).json({ error: 'siteId veya subdomain gereklidir' });
    }

    const site = rawSiteId
      ? await Site.findById(rawSiteId)
      : await Site.findBySubdomain(rawSubdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    const rlKeySiteId = (site?.id || rawSiteId || rawSubdomain || '').toString();
    const rl = checkRestartRateLimit({ userId: req.userId, siteId: rlKeySiteId });
    if (!rl.allowed) {
      return res.status(429).json({
        error: `Çok sık deneme yapıldı. Lütfen ${Math.ceil(rl.remainingMs / 1000)} sn bekleyin.`
      });
    }

    if (site.user_id !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const subdomain = (site.subdomain || '').toString().trim().toLowerCase();
    const shopierUrl = site.shopier_url || site.settings?.shopierUrl;

    if (!subdomain || !shopierUrl) {
      return res.status(400).json({ error: 'Site bilgileri eksik (subdomain/url)' });
    }

    // Force clear existing job if any
    clearSyncRetryTimer(subdomain);
    syncJobsBySubdomain.delete(subdomain.toLowerCase());

    try {
      await Site.update(site.id, {
        settings: {
          shopier_sync: {
            ...(site?.settings?.shopier_sync || {}),
            status: 'queued',
            retryAfterSeconds: 0,
            nextAllowedAt: null,
            error: null,
            updatedAt: new Date().toISOString(),
            shopierUrl
          }
        }
      });
    } catch (e) {
      void e;
    }

    const job = startBackgroundSyncJob(site, {
      subdomain,
      shopierUrl,
      force: true
    });

    return res.json({
      success: true,
      message: 'Senkronizasyon yeniden başlatıldı',
      job
    });
  } catch (e) {
    console.error('sync-site-products/restart error:', e);
    return res.status(500).json({ error: 'Senkronizasyon başlatılamadı' });
  }
});

router.post('/sync-site-products', async (req, res) => {
  try {
    pruneScraperState();
    const subdomain = (req.body?.subdomain || '').toString().trim().toLowerCase();
    const shopierUrl = (req.body?.shopierUrl || '').toString().trim();
    const directProducts = Array.isArray(req.body?.products) ? req.body.products : [];

    if (!subdomain) {
      return res.status(400).json({ error: 'subdomain gerekli' });
    }
    if (!shopierUrl || !validateShopierUrl(shopierUrl)) {
      return res.status(400).json({ error: 'Gecerli bir Shopier URL giriniz' });
    }

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadi' });
    }

    if (directProducts.length > 0) {
      const products = directProducts
        .map((product) => ({
          id: Number(product?.id || 0) || undefined,
          title: (product?.title || product?.name || '').toString().trim(),
          name: (product?.name || product?.title || '').toString().trim(),
          price: (product?.price || '').toString().trim(),
          image: (product?.image || product?.imageUrl || '').toString().trim(),
          imageUrl: (product?.imageUrl || product?.image || '').toString().trim(),
          link: (product?.link || product?.url || '').toString().trim(),
          url: (product?.url || product?.link || '').toString().trim(),
          description: (product?.description || '').toString().trim().slice(0, 800),
          category: normalizeCategoryLabel(product?.category)
        }))
        .filter((product) => product.title && product.url);

      if (!products.length) {
        return res.status(400).json({ error: 'Gecerli products listesi gerekli' });
      }

      const collections = buildCollectionsFromProducts(products);
      const resolvedTotalCount = Math.max(Number(req.body?.totalProducts || 0) || 0, products.length);
      const refreshedAt = new Date().toISOString();
      const completedSyncState = {
        ...(site?.settings?.shopier_sync || {}),
        updatedAt: refreshedAt,
        status: 'completed',
        totalCount: resolvedTotalCount,
        productCount: products.length,
        jobId: null,
        shopierUrl,
        startedAt: refreshedAt,
        retryAfterSeconds: 0,
        nextAllowedAt: null,
        error: null
      };

      const updated = await Site.update(site.id, {
        theme: STATIC_THEME_ID,
        settings: {
          products_data: products,
          collections,
          catalog_total_products: resolvedTotalCount,
          catalog_category_count: collections.length,
          catalog_discovery_mode: 'full',
          catalog_full_sync_complete: true,
          catalog_refresh_version: CATALOG_REFRESH_VERSION,
          catalog_refreshed_at: refreshedAt,
          shopierUrl,
          shopier_url: shopierUrl,
          theme: STATIC_THEME_ID,
          theme_catalogs: {
            [STATIC_THEME_ID]: {
              ready: true,
              productCount: products.length,
              categoryCount: collections.length
            }
          },
          supported_themes: [STATIC_THEME_ID],
          shopier_sync: completedSyncState
        }
      });

      return res.json({
        success: true,
        direct: true,
        subdomain,
        siteId: site.id,
        productCount: products.length,
        totalCount: resolvedTotalCount,
        site: updated || site
      });
    }

    if (isProduction) {
      const job = startBackgroundSyncJob(site, { subdomain, shopierUrl });
      return res.status(202).json({
        success: true,
        pending: true,
        message: 'Urunler arka planda siteye yaziliyor',
        subdomain,
        siteId: site.id,
        job,
        retryAfterSeconds: Math.max(Number(job?.retryAfterSeconds || 0) || 0, getRetryAfterSeconds(shopierUrl))
      });
    }

    const job = await runSyncSiteJob({ site, subdomain, shopierUrl });
    return res.json({ success: true, job });
  } catch (e) {
    console.error('sync-site-products error:', e);
    return res.status(500).json({ error: 'Senkronizasyon basarisiz' });
  }
});

router.get('/sync-site-products/status', async (req, res) => {
  try {
    pruneScraperState();
    const subdomain = (req.query?.subdomain || '').toString().trim().toLowerCase();
    if (!subdomain) return res.status(400).json({ error: 'subdomain gerekli' });

    const liveJob = syncJobsBySubdomain.get(subdomain) || null;
    if (hasActiveSyncJob(liveJob)) {
      return res.json({ success: true, job: liveJob });
    }

    try {
      const site = await Site.findBySubdomain(subdomain);
      const sync = site?.settings?.shopier_sync || null;
      if (sync && (sync.status || sync.jobId || sync.updatedAt)) {
        return res.json({ success: true, job: sync });
      }
    } catch (e) {
      void e;
    }

    return res.json({ success: true, job: liveJob });
  } catch (e) {
    void e;
    return res.status(500).json({ error: 'Durum alinamadi' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  recoverPersistedSyncJobs().catch((error) => {
    console.warn('shopier sync recovery failed', error?.message || error);
  });

  if (isProduction) {
    setInterval(() => {
      recoverPersistedSyncJobs().catch((error) => {
        console.warn('shopier sync recovery tick failed', error?.message || error);
      });
    }, SHOPIER_SYNC_RECOVERY_INTERVAL_MS);
  }
}

// Scrape Shopier store data
router.post('/scrape', async (req, res) => {
  try {
    pruneScraperState();
    const shopierUrl = req.body?.url || req.body?.shopierUrl;
    const forceQuery = ((req.query?.force || '') + '').toString() === '1';
    const forceBody = Boolean(req.body?.force);
    const force = forceQuery || forceBody;
    const debug = ((req.query?.debug || '') + '').toString() === '1';
    const runId = debug ? `${Date.now()}_${Math.random().toString(16).slice(2)}` : undefined;

    if (!shopierUrl || !validateShopierUrl(shopierUrl)) {
      return res.status(400).json({ 
        error: 'Geçerli bir Shopier URL giriniz' 
      });
    }

    const cacheKey = shopierUrl.toString().trim();
    // THE KEY MUST BE CONSISTENT
    const progressKey = `shopier:${cacheKey}`;
    const entry = force ? null : getCacheEntry(cacheKey);
    if (entry?.value && isFresh(entry)) {
      try {
        const cachedTotal = Number(entry.value?.totalCount || 0);
        const cachedCount = Number((entry.value?.products || []).length);
        if (cachedTotal > 0 && cachedCount > 0 && cachedCount < cachedTotal) {
          // Cached value is incomplete; bypass cache.
        } else {
          return res.json({
            success: true,
            data: entry.value,
            message: `${(entry.value?.products || []).length} ürün bulundu`
          });
        }
      } catch (e) {
        void e;
        return res.json({
          success: true,
          data: entry.value,
          message: `${(entry.value?.products || []).length} ürün bulundu`
        });
      }
    }

    const isCompleteEnough = (data) => {
      try {
        const total = Number(data?.totalCount || 0);
        const count = Number((data?.products || []).length);
        if (!count) return false;
        if (total > 0 && count < total) return false;
        return true;
      } catch (e) {
        void e;
        return Boolean(data?.products?.length);
      }
    };

    const isCacheCompleteEnough = (value) => {
      try {
        const total = Number(value?.totalCount || 0);
        const count = Number((value?.products || []).length);
        if (!count) return false;
        if (total > 0 && count < total) return false;
        return true;
      } catch (e) {
        void e;
        return false;
      }
    };

    if (isProduction && !force) {
      if (entry?.value && isCacheCompleteEnough(entry.value)) {
        return res.json({
          success: true,
          data: entry.value,
          message: `${(entry.value?.products || []).length} ürün bulundu`
        });
      }

      // Ensure progress is initialized BEFORE returning 202
      if (!scrapeProgress.has(progressKey)) {
        setProgress(progressKey, { inflight: true, stage: 'starting', productCount: 0, totalCount: 0, error: null });
      }

      if (!scrapeInflight.has(cacheKey)) {
        const p = (async () => {
          try {
            const data = await scrapeWithAxios(shopierUrl);
            setCached(cacheKey, data);
            clearProgress(progressKey);
            return data;
          } catch (e) {
            setProgress(progressKey, { inflight: false, error: e.message });
            throw e;
          }
        })();
        scrapeInflight.set(cacheKey, p);
        p.finally(() => {
          scrapeInflight.delete(cacheKey);
        });
      }

      return res.status(202).json({
        success: true,
        pending: true,
        message: 'Ürünler arka planda senkronize ediliyor',
        cacheKey,
        runId
      });
    }

    const shouldUseAxiosResult = (data) => {
      const count = Number((data?.products || []).length);
      const total = Number(data?.totalCount || 0);
      if (total > 0) return count >= total;
      return count >= AXIOS_MIN_PRODUCTS_BEFORE_PUPPETEER;
    };

    const hasMeaningfulCategories = (data) => {
      try {
        const products = Array.isArray(data?.products) ? data.products : [];
        if (!products.length) return false;
        const uniq = new Set();
        for (const p of products) {
          const raw = (p?.category || '').toString().trim();
          if (!raw) continue;
          const norm = normalizeCategoryLabel(raw).toString().trim();
          if (!norm) continue;
          const lower = norm.toLowerCase();
          if (lower === 'genel') continue;
          uniq.add(lower);
          if (uniq.size >= 2) return true;
        }
        return uniq.size >= 1;
      } catch (e) {
        void e;
        return false;
      }
    };

    const doScrape = async () => {
      const diagnostics = debug ? { runId, force, path: 'unknown', axios: null, puppeteer: null, errors: [] } : null;

      if (isProduction) {
        let axiosData = null;
        let axiosError = null;
        try {
          axiosData = await scrapeWithAxios(shopierUrl);
          if (diagnostics) {
            diagnostics.path = 'production_axios_first';
            diagnostics.axios = {
              products: Number((axiosData?.products || []).length),
              totalCount: Number(axiosData?.totalCount || 0),
              diag: axiosData?.__diagnostics || null
            };
          }
        } catch (e) {
          axiosError = e;
          if (diagnostics) diagnostics.errors.push(`production_axios_first:${(e?.message || '').toString()}`);
        }

        const axiosLooksGood = axiosData && shouldUseAxiosResult(axiosData) && hasMeaningfulCategories(axiosData);
        if (axiosLooksGood) {
          return { storeData: axiosData, diagnostics };
        }

        if (diagnostics) diagnostics.path = 'production_trying_puppeteer_fallback';
        try {
          const storeData = await scrapeWithPuppeteerDom(shopierUrl);
          if (diagnostics) {
            diagnostics.path = 'production_puppeteer_fallback_success';
            diagnostics.puppeteer = {
              products: Number((storeData?.products || []).length),
              totalCount: Number(storeData?.totalCount || 0)
            };
          }
          if (storeData?.products?.length) {
            return { storeData, diagnostics };
          }
        } catch (puppeteerError) {
          const errMsg = (puppeteerError?.message || 'unknown_puppeteer_error').toString();
          if (diagnostics) {
            diagnostics.errors.push(`production_puppeteer_fallback_error:${errMsg}`);
          }
          // Critical: If we are here, it means we really needed Puppeteer but it failed.
          if (axiosData) {
            axiosData.__puppeteerError = errMsg;
          }
        }

        if (axiosData) {
          if (diagnostics) {
            diagnostics.path = 'production_return_axios_generic_with_pup_error';
          }
          return { storeData: axiosData, diagnostics };
        }
        throw axiosError;
      }

      try {
        const storeData = await scrapeWithPuppeteerDom(shopierUrl);
        if (diagnostics) {
          diagnostics.path = 'puppeteer_then_fallback';
          diagnostics.puppeteer = {
            products: Number((storeData?.products || []).length),
            totalCount: Number(storeData?.totalCount || 0)
          };
        }
        if (!storeData?.products?.length) {
          const ax = await scrapeWithAxios(shopierUrl);
          return { storeData: ax, diagnostics };
        }
        return { storeData, diagnostics };
      } catch (puppeteerError) {
        const puppeteerUnavailable = isPuppeteerUnavailable(puppeteerError);
        if (diagnostics) diagnostics.errors.push(`puppeteer:${(puppeteerError?.message || '').toString()}`);
        try {
          const storeData = await scrapeWithAxios(shopierUrl);
          if (diagnostics) {
            diagnostics.path = 'puppeteer_error_axios';
            diagnostics.axios = {
              products: Number((storeData?.products || []).length),
              totalCount: Number(storeData?.totalCount || 0),
              diag: storeData?.__diagnostics || null
            };
          }
          return { storeData, diagnostics };
        } catch (fallbackError) {
          if (puppeteerUnavailable) {
            const err = new Error('Shopier mağaza verileri alınamadı. (Scrape altyapısı kısıtlı)');
            err.status = 502;
            err.details = !isProduction
              ? {
                puppeteer: (puppeteerError?.message || '').toString(),
                axios: (fallbackError?.message || '').toString()
              }
              : undefined;
            throw err;
          }
          throw (fallbackError || puppeteerError);
        }
      }
    };

    if (entry?.value) {
      refreshInBackground();
      if (isCacheCompleteEnough(entry.value)) {
        return res.json({
          success: true,
          data: entry.value,
          message: `${(entry.value?.products || []).length} ürün bulundu`,
          stale: true
        });
      }
    }

    let { storeData, diagnostics } = await doScrape();
    storeData = await ensureFullDiscovery(shopierUrl, storeData, { force: true });
    setCached(cacheKey, storeData);
    return res.json({
      success: true,
      data: storeData,
      message: `${(storeData.products || []).length} ürün bulundu`,
      diagnostics: diagnostics || undefined
    });

  } catch (error) {
    console.error('Shopier scraping error:', error);
    const status = Number(error?.status || 0) || 500;
    res.status(status).json({
      error: (error?.message || 'Shopier mağaza verileri alınamadı').toString(),
      details: !isProduction ? (error?.details || error.message) : undefined
    });
  }
});

router.get('/scrape/status', async (req, res) => {
  try {
    pruneScraperState();
    const shopierUrl = (req.query?.shopierUrl || '').toString().trim();
    if (!shopierUrl || !validateShopierUrl(shopierUrl)) {
      return res.status(400).json({
        error: 'Geçerli bir Shopier URL giriniz'
      });
    }

    const cacheKey = shopierUrl;
    const progressKey = `shopier:${cacheKey}`;
    const entry = getCacheEntry(cacheKey);
    const inflight = scrapeInflight.has(cacheKey);
    const progress = scrapeProgress.get(progressKey) || null;
    const totalCount = Number(entry?.value?.totalCount || 0);
    const productCount = Number((entry?.value?.products || []).length);

    return res.json({
      success: true,
      inflight,
      cached: Boolean(entry?.value),
      fresh: Boolean(entry && isFresh(entry)),
      totalCount: totalCount || Number(progress?.totalCount || 0),
      productCount: productCount || Number(progress?.productCount || 0),
      stage: (progress?.stage || null),
      startedAt: progress?.startedAt || null,
      lastUpdateAt: progress?.lastUpdateAt || null,
      error: progress?.error || null
    });
  } catch (e) {
    void e;
    return res.status(500).json({
      error: 'Durum alınamadı'
    });
  }
});

const scrapeShopier = async ({ url, debug, force, discoverAll } = {}) => {
  pruneScraperState();
  const shopierUrl = (url || '').toString().trim();
  if (!shopierUrl || !validateShopierUrl(shopierUrl)) {
    const err = new Error('Geçerli bir Shopier URL giriniz');
    err.status = 400;
    throw err;
  }

  const cacheKey = shopierUrl;
  const entry = force ? null : getCacheEntry(cacheKey);
  if (entry?.value && isFresh(entry)) {
    try {
      const cachedTotal = Number(entry.value?.totalCount || 0);
      const cachedCount = Number((entry.value?.products || []).length);
      if (!(cachedTotal > 0 && cachedCount > 0 && cachedCount < cachedTotal)) {
        return entry.value;
      }
    } catch (e) {
      void e;
      return entry.value;
    }
  }

  const runId = debug ? `${Date.now()}_${Math.random().toString(16).slice(2)}` : undefined;
  void runId;

  if (scrapeInflight.has(cacheKey)) {
    try {
      return await scrapeInflight.get(cacheKey);
    } catch (e) {
      void e;
    }
  }

  const shouldUseAxiosResult = (data) => {
    const count = Number((data?.products || []).length);
    const total = Number(data?.totalCount || 0);
    if (total > 0) return count >= total;
    return count >= AXIOS_MIN_PRODUCTS_BEFORE_PUPPETEER;
  };

  const hasNonGenericCategory = (data) => {
    const list = Array.isArray(data?.products) ? data.products : [];
    for (const product of list) {
      const raw = (product?.category || '').toString().trim().toLowerCase();
      if (raw && raw !== 'genel') return true;
    }
    return false;
  };

  const p = (async () => {
    // In production, Shopier may block datacenter IPs and plain HTTP clients (403).
    // We still try Axios first for speed, but automatically fall back to Stealth Puppeteer.
    let axiosResult = null;
    let axiosError = null;
    try {
      axiosResult = await scrapeWithAxios(shopierUrl);
      if (shouldUseAxiosResult(axiosResult) && hasNonGenericCategory(axiosResult)) return axiosResult;
    } catch (e) {
      axiosError = e;
    }

    const status = Number(axiosError?.status || axiosError?.response?.status || 0);
    if (axiosError && status && status !== 403 && status !== 429) {
      // Non-blocking errors: still attempt puppeteer, but keep original error for debugging if needed.
      void axiosError;
    }

    try {
      const pp = await scrapeWithPuppeteerDom(shopierUrl);
      if (pp && Array.isArray(pp.products) && pp.products.length) return pp;
    } catch (e) {
      // If Puppeteer also fails, last resort: return Axios result if we have any.
      if (axiosResult) return axiosResult;
      throw e;
    }

    // Puppeteer returned empty; fall back to Axios result if any.
    if (axiosResult) return axiosResult;
    if (axiosError) throw axiosError;
    return await scrapeWithAxios(shopierUrl);
  })();

  scrapeInflight.set(cacheKey, p);
  try {
    let data = await p;
    data = await ensureFullDiscovery(shopierUrl, data, { force: discoverAll !== false });
    setCached(cacheKey, data);
    return data;
  } finally {
    scrapeInflight.delete(cacheKey);
  }
};

// Validate Shopier URL
router.post('/validate', (req, res) => {
  try {
    const { shopierUrl } = req.body;

    if (!shopierUrl) {
      return res.status(400).json({ 
        error: 'Shopier URL gereklidir' 
      });
    }

    const isValid = validateShopierUrl(shopierUrl);
    
    res.json({
      valid: isValid,
      message: isValid ? 'Geçerli Shopier URL' : 'Geçersiz Shopier URL'
    });

  } catch (error) {
    console.error('URL validation error:', error);
    res.status(500).json({ error: 'URL doğrulanamadı' });
  }
});

router.scrapeShopier = scrapeShopier;
router.scrapeWithPuppeteerDom = scrapeWithPuppeteerDom;

router.clearSyncJobsForSubdomains = (subdomains) => {
  try {
    const list = Array.isArray(subdomains) ? subdomains : [subdomains];
    for (const raw of list) {
      const s = (raw || '').toString().trim().toLowerCase();
      if (!s) continue;
      try {
        syncJobsBySubdomain.delete(s);
      } catch (e) {
        void e;
      }
    }
  } catch (e) {
    void e;
  }
};

router.startBackgroundSyncJob = startBackgroundSyncJob;

module.exports = router;

