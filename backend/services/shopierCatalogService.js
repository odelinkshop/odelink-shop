/**
 * SHOPIER CATALOG SERVICE - HYBRID VERSİYON
 * Önce Shopier API dener, başarısız olursa scraping'e fallback yapar
 */

const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/database');
const { optimizeProductImages } = require('./imageOptimizationService');

// Shopier API servisi - geçici olarak devre dışı (syntax hatası için)
let fetchAllProductsFromShopierAPI = null;
try {
  const apiService = require('./shopierApiService');
  fetchAllProductsFromShopierAPI = apiService.fetchAllProductsFromShopierAPI;
} catch (e) {
  console.warn('⚠️ Shopier API servisi yüklenemedi:', e.message);
  fetchAllProductsFromShopierAPI = null;
}

let shopierRoutes;
const getShopierRoutes = () => {
  if (shopierRoutes) return shopierRoutes;
  try {
    shopierRoutes = require('../routes/shopier');
  } catch (e) {
    shopierRoutes = null;
  }
  return shopierRoutes;
};

const SHOPIER_CATALOG_CACHE_TTL_MS = Math.max(0, Number(process.env.SHOPIER_CATALOG_CACHE_TTL_MS || 600000) || 600000);
const shopierCatalogCache = new Map();

let shopierCatalogCacheSchemaEnsured = false;
const ensureShopierCatalogCacheSchema = async () => {
  if (shopierCatalogCacheSchemaEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopier_catalog_cache (
        shopier_url TEXT PRIMARY KEY,
        catalog JSONB NOT NULL DEFAULT '{}'::jsonb,
        complete BOOLEAN NOT NULL DEFAULT false,
        total_products INTEGER NOT NULL DEFAULT 0,
        enriched_products INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_shopier_catalog_cache_updated_at ON shopier_catalog_cache (updated_at DESC)');
    shopierCatalogCacheSchemaEnsured = true;
  } catch (e) {
    console.error('❌ Shopier catalog cache schema error:', e);
  }
};

const getPersistentCatalog = async (normalizedShopierUrl) => {
  const u = (normalizedShopierUrl || '').toString().trim();
  if (!u) return null;
  await ensureShopierCatalogCacheSchema();
  try {
    const res = await pool.query(
      `
      SELECT shopier_url, catalog, complete, total_products, enriched_products, updated_at
      FROM shopier_catalog_cache
      WHERE shopier_url = $1
      LIMIT 1
      `,
      [u]
    );
    const row = res.rows?.[0] || null;
    if (!row) return null;
    return {
      shopierUrl: row.shopier_url,
      catalog: row.catalog && typeof row.catalog === 'object' ? row.catalog : null,
      complete: Boolean(row.complete),
      totalProducts: Number(row.total_products || 0),
      enrichedProducts: Number(row.enriched_products || 0),
      updatedAt: row.updated_at
    };
  } catch (e) {
    console.error('❌ Get persistent catalog error:', e);
    return null;
  }
};

const upsertPersistentCatalog = async (normalizedShopierUrl, data) => {
  const u = (normalizedShopierUrl || '').toString().trim();
  if (!u) return;
  await ensureShopierCatalogCacheSchema();
  try {
    await pool.query(
      `
      INSERT INTO shopier_catalog_cache (shopier_url, catalog, complete, total_products, enriched_products, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (shopier_url) DO UPDATE
      SET
        catalog = EXCLUDED.catalog,
        complete = EXCLUDED.complete,
        total_products = EXCLUDED.total_products,
        enriched_products = EXCLUDED.enriched_products,
        updated_at = NOW()
      `,
      [
        u,
        JSON.stringify(data.catalog || {}),
        Boolean(data.complete),
        Number(data.totalProducts || 0),
        Number(data.enrichedProducts || 0)
      ]
    );
  } catch (e) {
    console.error('❌ Upsert persistent catalog error:', e);
  }
};

const getCachedCatalog = (key) => {
  const entry = shopierCatalogCache.get(key);
  if (!entry) return null;
  const expiresAt = Number(entry.expiresAt || 0);
  if (expiresAt && Date.now() > expiresAt) {
    shopierCatalogCache.delete(key);
    return null;
  }
  return entry;
};

const setCachedCatalog = (key, value) => {
  if (!SHOPIER_CATALOG_CACHE_TTL_MS) return;
  shopierCatalogCache.set(key, {
    value,
    expiresAt: Date.now() + SHOPIER_CATALOG_CACHE_TTL_MS
  });
};

const setCatalogInFlight = (key, promise) => {
  if (!SHOPIER_CATALOG_CACHE_TTL_MS) return;
  shopierCatalogCache.set(key, {
    inFlight: promise,
    expiresAt: Date.now() + SHOPIER_CATALOG_CACHE_TTL_MS
  });
};

// Rate Limit Yönetimi - HIZLI MOD (kullanıcı beklemez!)
const CLOUDFLARE_WORKER_URL = 'https://shopier-proxy.muratbyrm3752.workers.dev/proxy';
const USE_PROXY = false; // Proxy kapalı (Shopier engelliyor)

// HIZLI MOD - Kullanıcı beklemez, arka planda yüklenir
const DELAY_MS = 0; // İstekler arası bekleme YOK
const MAX_RETRIES = 5; // Daha fazla retry
const RETRY_DELAY_MS = 3000; // Retry'da kısa bekleme (3 saniye)

const SHOPIER_AXIOS_HEADERS = Object.freeze({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));

const parseRetryAfterMs = (value) => {
  const raw = (value || '').toString().trim();
  if (!raw) return 0;
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(600000, Math.floor(seconds * 1000));
  const dateMs = Date.parse(raw);
  if (Number.isFinite(dateMs) && dateMs > 0) {
    const diff = dateMs - Date.now();
    if (diff > 0) return Math.min(600000, diff);
  }
  return 0;
};

const isRetryableAxiosError = (err) => {
  const code = (err?.code || '').toString();
  if (code === 'ECONNRESET') return true;
  if (code === 'ETIMEDOUT') return true;
  if (code === 'ECONNABORTED') return true;
  if (code === 'EAI_AGAIN') return true;
  if (code === 'ENOTFOUND') return true;
  if (code === 'ENETUNREACH') return true;
  if (code === 'EHOSTUNREACH') return true;
  return false;
};

const shouldRetryShopierResponse = (resp) => {
  const st = Number(resp?.status || 0);
  if (st === 429) return true;
  if (st >= 500 && st <= 599) return true;
  return false;
};

const requestWithRetry = async (method, url, config = {}) => {
  const maxAttempts = Math.max(1, Number(config?.maxAttempts || 3) || 3);
  const baseDelayMs = Math.max(100, Number(config?.baseDelayMs || 1000) || 1000);
  const capDelayMs = Math.max(baseDelayMs, Number(config?.capDelayMs || 5000) || 5000);
  const maxTotalMs = Math.max(0, Number(config?.maxTotalMs || 30000) || 30000);

  const reqConfig = { ...(config || {}) };
  delete reqConfig.maxAttempts;
  delete reqConfig.baseDelayMs;
  delete reqConfig.capDelayMs;
  delete reqConfig.maxTotalMs;
  reqConfig.validateStatus = () => true;

  let lastError = null;
  let lastResp = null;

  const startedAt = Date.now();

  // Cloudflare Worker Proxy kullan
  let requestUrl = url;
  if (USE_PROXY && url.includes('shopier.com')) {
    requestUrl = `${CLOUDFLARE_WORKER_URL}?url=${encodeURIComponent(url)}`;
    console.log(`🔄 Proxy kullanılıyor: ${url}`);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (maxTotalMs > 0 && Date.now() - startedAt >= maxTotalMs) {
      break;
    }
    try {
      const resp = await axios.request({ method, url: requestUrl, ...reqConfig });
      lastResp = resp;

      // 429 gelirse kısa bekle (Proxy ile daha az olmalı)
      if (resp?.status === 429) {
        if (attempt < maxAttempts) {
          console.warn(`⚠️ Rate limit (429) - ${RETRY_DELAY_MS/1000}s bekleniyor... (${attempt}/${maxAttempts})`);
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        return resp;
      }

      if (!shouldRetryShopierResponse(resp)) {
        return resp;
      }

      if (attempt >= maxAttempts) return resp;
      if (maxTotalMs > 0 && Date.now() - startedAt >= maxTotalMs) return resp;

      const retryAfterMs = parseRetryAfterMs(resp?.headers?.['retry-after'] || resp?.headers?.['Retry-After']);
      const exp = Math.min(capDelayMs, Math.floor(baseDelayMs * (1.5 ** (attempt - 1))));
      const jitter = Math.floor(Math.random() * 200);
      const delayMs = Math.max(retryAfterMs, exp + jitter);

      await sleep(delayMs);
    } catch (err) {
      lastError = err;
      if (!isRetryableAxiosError(err)) throw err;
      if (attempt >= maxAttempts) throw err;
      
      const exp = Math.min(capDelayMs, Math.floor(baseDelayMs * (1.5 ** (attempt - 1))));
      await sleep(exp + Math.floor(Math.random() * 200));
    }
  }

  if (lastResp) return lastResp;
  if (lastError) throw lastError;
  throw new Error('Shopier request failed');
};

const textValue = (value) => (value == null ? '' : String(value)).trim();

function uniqStrings(list) {
  const arr = Array.isArray(list) ? list : [];
  const out = [];
  const seen = new Set();
  for (const raw of arr) {
    const v = textValue(raw);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function canonicalizeImageForKey(raw) {
  const v = textValue(raw);
  if (!v) return '';
  try {
    const u = new URL(v);
    u.hash = '';
    u.search = '';
    return `${u.hostname.toLowerCase()}${u.pathname}`.toLowerCase();
  } catch (e) {
    void e;
    return v.toLowerCase().replace(/[?#].*$/, '');
  }
}

function uniqStringsByKey(list, toKey) {
  const arr = Array.isArray(list) ? list : [];
  const out = [];
  const seen = new Set();
  const keyFn = typeof toKey === 'function' ? toKey : ((x) => textValue(x).toLowerCase());
  for (const raw of arr) {
    const v = textValue(raw);
    if (!v) continue;
    const k = keyFn(v);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

function upgradeShopierImageUrl(raw) {
  const v = textValue(raw);
  if (!v) return '';
  // Shopier often serves images from these folders. If a larger variant exists,
  // swapping the folder yields higher resolution.
  const candidates = [
    ['/pictures_mid/', '/pictures_big/'],
    ['/pictures_mid/', '/pictures_large/'],
    ['/pictures_small/', '/pictures_mid/'],
    ['/pictures_small/', '/pictures_big/']
  ];

  for (const [from, to] of candidates) {
    if (v.includes(from)) return v.replace(from, to);
  }
  return v;
}

function normalizeUrl(raw, baseUrl) {
  const val = textValue(raw);
  if (!val) return '';
  if (val.startsWith('data:')) return '';
  if (val.startsWith('javascript:')) return '';
  try {
    return new URL(val, baseUrl).toString();
  } catch (e) {
    void e;
    return val;
  }
}

async function mapWithConcurrency(items, limit, fn) {
  const arr = Array.isArray(items) ? items : [];
  const out = new Array(arr.length);
  const concurrency = Math.max(1, Number(limit) || 1);
  let idx = 0;

  const worker = async () => {
    while (idx < arr.length) {
      const cur = idx;
      idx += 1;
      try {
        out[cur] = await fn(arr[cur], cur);
      } catch (e) {
        void e;
        out[cur] = null;
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

function comparableShopierUrl(raw) {
  const value = textValue(raw);
  if (!value) return '';
  try {
    const u = new URL(value);
    const host = textValue(u.hostname).toLowerCase().replace(/^www\./, '');
    const pathname = textValue(u.pathname).replace(/\/+$/, '');
    return `https://${host}${pathname}`.toLowerCase();
  } catch (e) {
    void e;
    return value.toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
}

function buildCookieHeader(setCookieHeader) {
  const rawCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [];
  return rawCookies
    .map((value) => textValue(value).split(';')[0])
    .filter(Boolean)
    .join('; ');
}

function decodeEscapedJsonString(value) {
  const raw = textValue(value);
  if (!raw) return '';
  try {
    return JSON.parse(`"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  } catch (error) {
    void error;
    return raw.replace(/\\\//g, '/');
  }
}

function extractShopierCatalogConfig(html, pageUrl) {
  const content = (html || '').toString();
  const $ = cheerio.load(content);
  const csrfToken = textValue($('meta[name="csrf-token"]').attr('content'));
  const searchProductMatch = content.match(/"search_product"\s*:\s*"([^"]*\/s\/api\/v1\/search_product[^"]*)"/i);
  const usernameMatch = content.match(/"username"\s*:\s*"([^"]+)"/i);
  const defaultProductCountMatch = content.match(/"default_product_count"\s*:\s*(\d+)/i);
  const totalCountMatch = content.match(/const\s+\$product_count\s*=\s*(\d+)/i) || content.match(/(\d+)\s*(?:ürün|urun)/i);

  const searchProductUrl = (() => {
    const decoded = decodeEscapedJsonString(searchProductMatch?.[1] || '');
    if (!decoded) return '';
    try {
      return new URL(decoded, pageUrl).toString();
    } catch (e) {
      void e;
      return decoded;
    }
  })();

  return {
    csrfToken,
    searchProductUrl,
    username: decodeEscapedJsonString(usernameMatch?.[1] || ''),
    defaultProductCount: Math.max(1, Number(defaultProductCountMatch?.[1] || 24) || 24),
    totalCount: Math.max(0, Number(totalCountMatch?.[1] || 0) || 0)
  };
}

function normalizeSearchApiProduct(item, shopierUrl, username) {
  const productId = textValue(item?.id);
  const fallbackUrl = productId && username ? `https://www.shopier.com/${username}/${productId}` : '';
  const rawImage = textValue(item?.primary_image || item?.image);
  const imageUrl = rawImage.startsWith('http')
    ? rawImage
    : (rawImage ? `https://cdn.shopier.app/pictures_mid/${rawImage}` : '');

  const url = textValue(item?.link || fallbackUrl);
  let normalizedUrl = url;
  if (normalizedUrl) {
    try {
      normalizedUrl = new URL(normalizedUrl, shopierUrl).toString();
    } catch (e) {
      void e;
    }
  }

  return {
    name: textValue(item?.name || item?.subject),
    price: textValue(
      item?.price?.price_legacy_formatted ||
        item?.price?.price_symbol_formatted ||
        item?.price?.price_code_formatted ||
        item?.price?.price_formatted ||
        item?.price
    ),
    image: imageUrl,
    url: normalizedUrl,
    id: productId || undefined
  };
}

function extractProductsFromShopHtml(html, pageUrl) {
  const content = (html || '').toString();
  const $ = cheerio.load(content);
  const out = [];
  const seen = new Set();

  const selectors = [
    '.product-card',
    '.product-item',
    '.product',
    '[class*="product-card"]',
    '[class*="product"]'
  ];

  $(selectors.join(',')).each((i, el) => {
    if (i > 500) return;
    const $el = $(el);
    const name = textValue($el.find('.product-name, .product-title, h3, h4').first().text());
    const priceText = textValue($el.find('.product-price, .price, [class*="price"]').first().text());
    const imageUrl = textValue($el.find('img').first().attr('src') || $el.find('img').first().attr('data-src'));
    const href = textValue($el.find('a').first().attr('href'));
    if (!href) return;

    let url = href;
    try {
      url = new URL(url, pageUrl).toString();
    } catch (e) {
      void e;
    }

    const key = url.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    out.push({
      name: name || '',
      price: priceText || '',
      image: imageUrl || '',
      url,
      id: undefined
    });
  });

  return out.filter((p) => textValue(p?.name) && textValue(p?.url));
}

function extractCategoryTabsFromShopHtml(html, pageUrl) {
  const content = (html || '').toString();
  const $ = cheerio.load(content);
  const out = [];
  const seen = new Set();

  const pushTab = (labelRaw, valueRaw) => {
    const label = textValue(labelRaw);
    let value = textValue(valueRaw);
    if (!label) return;
    if (!value) value = label;
    if (label.toLowerCase() === 'tüm ürünler' || label.toLowerCase() === 'tum urunler') return;

    // storev3 categories are filter ids like cat_1336301
    // Avoid capturing UI buttons like "Filtrele" as categories.
    if (/^cat_/i.test(value) === false && /\/#/.test(value) === false) return;

    if (value) {
      try {
        value = decodeURIComponent(value);
      } catch (e) {
        void e;
      }
    }

    const key = `${label.toLowerCase()}|${value.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name: label, value });
  };

  const tryExtractValueFromHref = (href) => {
    const h = textValue(href);
    if (!h) return '';
    try {
      const abs = new URL(h, pageUrl).toString();
      const u = new URL(abs);
      const hash = textValue((u.hash || '').replace(/^#/, ''));
      if (hash) return hash;
      return '';
    } catch (e) {
      void e;
      return '';
    }
  };

  const parseCategoriesObject = () => {
    const m = content.match(/const\s+\$categories\s*=\s*(\{[\s\S]*?\});/i);
    if (!m) return {};
    try {
      return JSON.parse((m[1] || '').replace(/'/g, '"'));
    } catch (e) {
      void e;
      return {};
    }
  };

  const categoriesMap = parseCategoriesObject();

  // storev3: main category tabs are DIVs with data-id="cat_123" (no <a href>)
  $('.store-categories [data-id^="cat_"]').each((_, el) => {
    const $el = $(el);
    const dataId = textValue($el.attr('data-id'));
    if (!dataId || dataId === 'cat_all') return;
    const id = dataId.replace(/^cat_/, '');
    const label = textValue($el.find('.tab-name').first().text()) || textValue($el.text());
    const resolvedLabel = textValue(categoriesMap?.[id]) || label;
    pushTab(resolvedLabel, dataId);
  });

  // storev3: filter chips also carry data-id + data-value
  $('.filter-categories [data-id^="cat_"]').each((_, el) => {
    const $el = $(el);
    const dataId = textValue($el.attr('data-id'));
    if (!dataId || dataId === 'cat_all') return;
    const id = dataId.replace(/^cat_/, '');
    const label = textValue(categoriesMap?.[id]) || textValue($el.attr('data-value')) || textValue($el.text());
    pushTab(label, dataId);
  });

  // storev3: category tabs often live under .store-categories and may rely on JS (no #hash in href)
  $('.store-categories a, .store-categories button, .store-categories [role="tab"]').each((_, el) => {
    const $el = $(el);
    const label = textValue($el.text());
    const href = textValue($el.attr('href'));
    const dataValue = textValue($el.attr('data-value'));
    const dataCategory = textValue($el.attr('data-category'));
    const value = dataValue || dataCategory || tryExtractValueFromHref(href) || label;
    pushTab(label, value);
  });

  // Fallback: look for any anchor that navigates using hash (older templates)
  if (out.length > 0) return out;

  $('a').each((_, el) => {
    const $el = $(el);
    const href = textValue($el.attr('href'));
    const label = textValue($el.text());
    if (!href || !label) return;
    if (!href.includes('#')) return;

    let abs = '';
    try {
      abs = new URL(href, pageUrl).toString();
    } catch (e) {
      void e;
      return;
    }

    const u = new URL(abs);
    const hash = textValue((u.hash || '').replace(/^#/, ''));
    if (!hash) return;
    pushTab(label, hash);
  });

  return out;
}

async function fetchProductDetail(productUrl, shopierUrl) {
  try {
    const url = normalizeUrl(productUrl, shopierUrl);
    if (!url) return null;

    const resp = await requestWithRetry('get', url, {
      timeout: 120000,
      maxAttempts: 5,
      baseDelayMs: 1000,
      capDelayMs: 5000,
      maxTotalMs: 40000,
      headers: {
        ...SHOPIER_AXIOS_HEADERS,
        Referer: shopierUrl || 'https://www.google.com/'
      }
    });

    if (!resp || resp.status < 200 || resp.status >= 300) return null;

    const html = (resp.data || '').toString();
    const $ = cheerio.load(html);

    const name = textValue(
      $('.product-title, .product-name, h1, .title').first().text()
    );

    const findSectionText = (label) => {
      try {
        const target = textValue(label).toLowerCase();
        if (!target) return '';
        const candidates = [];
        $('*').each((_, el) => {
          const t = textValue($(el).text());
          if (!t) return;
          if (t.toLowerCase() === target) {
            const next = $(el).closest('div,li,span').next();
            const txt = textValue(next.text());
            if (txt) candidates.push(txt);
          }
        });
        return candidates.sort((a, b) => b.length - a.length)[0] || '';
      } catch (e) {
        return '';
      }
    };

    const desc = (() => {
      try {
        const direct = textValue(
          $('.product-description, .description, .detail-desc, #description, [data-product-description]').first().text()
        );
        if (direct) return direct;
        const tabbed = findSectionText('Ürün açıklaması');
        return tabbed;
      } catch (e) {
        return '';
      }
    })();

    const deliveryInfo = (() => {
      try {
        const tabbed = findSectionText('Teslimat bilgisi');
        if (tabbed) return tabbed;
        const ship = textValue($('*:contains("Kargo")').filter((_, el) => /kargo\s*ücreti/i.test($(el).text())).first().text());
        return ship;
      } catch (e) {
        return '';
      }
    })();

    // BEDENLER - ZORLA ÇEK!
    const sizes = (() => {
      try {
        const out = [];

        const isLikelyPlaceholder = (v) => {
          const s = textValue(v).toLowerCase();
          if (!s) return true;
          if (/(seçiniz|seçin|seciniz|secin|choose)/i.test(s)) return true;
          return false;
        };

        // 1. SELECT elementlerinden çek
        $('select').each((_, sel) => {
          try {
            const $sel = $(sel);
            const name = textValue($sel.attr('name')).toLowerCase();
            const id = textValue($sel.attr('id')).toLowerCase();
            
            // Beden/varyant selecti mi kontrol et
            if (/(beden|size|varyant|variant|secenek|seçenek)/i.test(name + ' ' + id)) {
              $sel.find('option').each((_, o) => {
                const t = textValue($(o).text());
                if (!t || isLikelyPlaceholder(t) || t.length > 60) return;
                out.push(t);
              });
            }
          } catch (e) {
            void e;
          }
        });

        // 2. RADIO buttonlardan çek
        if (out.length === 0) {
          $('input[type="radio"]').each((_, el) => {
            try {
              const $el = $(el);
              const name = textValue($el.attr('name')).toLowerCase();
              const id = textValue($el.attr('id'));
              
              if (/(beden|size|varyant|variant|secenek|seçenek)/i.test(name)) {
                let labelText = '';
                if (id) {
                  labelText = textValue($(`label[for="${id.replace(/"/g, '')}"]`).first().text());
                }
                if (!labelText) {
                  labelText = textValue($el.closest('label').text());
                }
                if (!labelText) {
                  labelText = textValue($el.parent().text());
                }
                if (labelText && !isLikelyPlaceholder(labelText) && labelText.length <= 60) {
                  out.push(labelText);
                }
              }
            } catch (e) {
              void e;
            }
          });
        }

        // 3. BUTTON/DIV elementlerinden çek
        if (out.length === 0) {
          $('*').each((_, el) => {
            try {
              const t = textValue($(el).text());
              if (!t) return;
              const low = t.toLowerCase();
              if (low === 'beden' || low === 'size' || low === 'varyant' || low === 'variant' || low === 'seçenekler') {
                const parent = $(el).closest('div,section,form');
                parent.find('button, a, li, span[class*="option"], div[class*="option"]').each((_, n) => {
                  const v = textValue($(n).text());
                  if (!v || isLikelyPlaceholder(v) || v.length > 60) return;
                  // Beden benzeri değerler
                  if (/^(xs|s|m|l|xl|xxl|xxxl|\d{2,3}|tek\s*beden)$/i.test(v) || v.length <= 8) {
                    out.push(v);
                  }
                });
              }
            } catch (e) {
              void e;
            }
          });
        }

        return uniqStrings(out).slice(0, 30);
      } catch (e) {
        return [];
      }
    })();

    // FOTOĞRAFLAR - DOĞRU ÇEK!
    const imgCandidates = [];
    const pushImg = (v) => {
      try {
        const normalized = normalizeUrl(v, url);
        if (normalized && !normalized.includes('data:image')) {
          imgCandidates.push(normalized);
        }
      } catch (e) {
        void e;
      }
    };

    const isLikelyProductImageUrl = (src) => {
      try {
        const s = textValue(src);
        if (!s) return false;
        if (s.startsWith('data:')) return false;
        if (/sprite|icon|logo|avatar|favicon|placeholder/i.test(s)) return false;
        if (/pictures_/i.test(s)) return true;
        if (/cdn\.shopier\.app\//i.test(s)) return true;
        if (/shopier/i.test(s) && /(images|img|upload|cdn|media)/i.test(s)) return true;
        if (/\.(jpg|jpeg|png|webp)(\?|#|$)/i.test(s)) return true;
        return false;
      } catch (e) {
        return false;
      }
    };

    try {
      // Ana ürün görseli
      const mainImg = textValue($('.product-image img, .main-image img, [class*="product-img"] img').first().attr('src') || 
                                 $('.product-image img, .main-image img, [class*="product-img"] img').first().attr('data-src'));
      if (mainImg && isLikelyProductImageUrl(mainImg)) {
        pushImg(upgradeShopierImageUrl(mainImg));
      }

      // Galeri görselleri
      $('.product-gallery img, .product-images img, [class*="gallery"] img, [class*="thumb"] img').each((_, el) => {
        const src = textValue($(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original') || $(el).attr('data-zoom-image'));
        if (!src) return;
        if (!isLikelyProductImageUrl(src)) return;
        pushImg(upgradeShopierImageUrl(src));
      });

      // Tüm img elementleri (fallback)
      if (imgCandidates.length < 3) {
        $('img').each((_, el) => {
          const src = textValue($(el).attr('src') || $(el).attr('data-src'));
          if (!src) return;
          if (!isLikelyProductImageUrl(src)) return;
          pushImg(upgradeShopierImageUrl(src));
        });
      }

      // Link'lerdeki görseller
      $('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".webp"]').each((_, el) => {
        const href = textValue($(el).attr('href'));
        if (!href) return;
        if (!isLikelyProductImageUrl(href)) return;
        pushImg(upgradeShopierImageUrl(href));
      });

      // OG image
      const ogImg = textValue($('meta[property="og:image"]').attr('content'));
      if (ogImg && isLikelyProductImageUrl(ogImg)) {
        pushImg(upgradeShopierImageUrl(ogImg));
      }
    } catch (e) {
      void e;
    }

    const images = uniqStringsByKey(
      imgCandidates
        .map((x) => {
          try {
            return normalizeUrl(x, url);
          } catch (e) {
            return '';
          }
        })
        .filter(Boolean),
      canonicalizeImageForKey
    ).slice(0, 12);

    const priceText = textValue($('.price, .product-price, [class*="price"]').first().text());
    const oldPriceText = textValue($('.old-price, .price-old, .price--old, .discount-price, [class*="old"]').first().text());
    const discountText = textValue($('.discount, .discount-rate, [class*="discount"]').first().text());

    const discountPercent = (() => {
      try {
        const m = discountText.match(/(\d{1,2})\s*%/);
        if (!m) return undefined;
        const v = Number(m[1] || 0) || 0;
        if (!v) return undefined;
        return v;
      } catch (e) {
        return undefined;
      }
    })();

    return {
      url,
      name,
      description: desc,
      deliveryInfo,
      sizes,
      images,
      image: images[0] || undefined,
      price: priceText || undefined,
      oldPrice: oldPriceText || undefined,
      discountPercent
    };
  } catch (e) {
    // Hata olsa bile null dön, devam et
    return null;
  }
}

async function enrichCatalogProductsWithDetails(products, shopierUrl, opts = {}) {
  try {
    const list = Array.isArray(products) ? products : [];
    const limit = Math.max(1, Number(opts?.concurrency || 2) || 2);
    const max = Math.max(0, Number(opts?.maxProducts || 0) || 0);
    const onProgress = typeof opts?.onProgress === 'function' ? opts.onProgress : null;

    const needsDetail = (p) => {
      try {
        if (!p || typeof p !== 'object') return true;
        const hasSizes = Array.isArray(p?.sizes) && p.sizes.length > 0;
        const hasImages = Array.isArray(p?.images) && p.images.length > 0;
        const hasDesc = Boolean(textValue(p?.description));
        return !(hasSizes && hasImages && hasDesc);
      } catch (e) {
        return true;
      }
    };

    const onlyMissing = Boolean(opts?.onlyMissing);
    const candidates = onlyMissing ? list.filter(needsDetail) : list;
    const target = max > 0 ? candidates.slice(0, max) : candidates;

    let throttleMs = 1000;
    const maxPerItemAttempts = 3;
    let enrichedCount = 0;

    const details = await mapWithConcurrency(target, limit, async (p) => {
      let lastErr = null;
      for (let attempt = 1; attempt <= maxPerItemAttempts; attempt += 1) {
        try {
          const d = await fetchProductDetail(p?.url, shopierUrl);
          await sleep(throttleMs);
          
          enrichedCount++;
          if (onProgress) {
            try {
              if (d?.url) {
                const idx = list.findIndex(item => comparableShopierUrl(item?.url) === comparableShopierUrl(d.url));
                if (idx !== -1) {
                  list[idx] = { ...list[idx], ...d };
                }
              }
              await onProgress(list, enrichedCount);
            } catch (progressErr) {
              void progressErr;
            }
          }
          
          return d;
        } catch (e) {
          lastErr = e;
          // Hata olsa bile devam et
          await sleep(1000);
        }
      }

      void lastErr;
      return null;
    });

    const indexByUrl = new Map();
    list.forEach((p, idx) => {
      try {
        const key = comparableShopierUrl(p?.url);
        if (key) indexByUrl.set(key, idx);
      } catch (e) {
        void e;
      }
    });

    for (const d of details) {
      try {
        if (!d?.url) continue;
        const idx = indexByUrl.get(comparableShopierUrl(d.url));
        if (idx == null) continue;
        const cur = list[idx];
        if (!cur || typeof cur !== 'object') continue;

        const next = { ...cur };

        if (!textValue(next.description) && textValue(d.description)) next.description = d.description;
        if (!Array.isArray(next.images) || next.images.length === 0) {
          if (Array.isArray(d.images) && d.images.length) next.images = d.images;
        }
        if (!Array.isArray(next.sizes) || next.sizes.length === 0) {
          if (Array.isArray(d.sizes) && d.sizes.length) next.sizes = d.sizes;
        }
        if (!textValue(next.image) && textValue(d.image)) next.image = d.image;
        if (!textValue(next.imageUrl) && textValue(d.image)) next.imageUrl = d.image;

        if (!textValue(next.price) && textValue(d.price)) next.price = d.price;
        if (!textValue(next.oldPrice) && textValue(d.oldPrice)) next.oldPrice = d.oldPrice;
        if (next.discountPercent == null && d.discountPercent != null) next.discountPercent = d.discountPercent;

        list[idx] = next;
      } catch (e) {
        void e;
      }
    }

    return list;
  } catch (e) {
    // Hata olsa bile orijinal listeyi dön
    return Array.isArray(products) ? products : [];
  }
}

async function fetchCategoryProductsViaSearchApi({
  searchProductUrl,
  csrfToken,
  cookieHeader,
  refererUrl,
  batchSize,
  username,
  value
}) {
  const maxBatches = 80;
  const out = [];
  const seen = new Set();
  let offset = 0;

  for (let i = 0; i < maxBatches; i += 1) {
    // Shopier storev3 category filtering is sent via activeCheckBoxes[]=cat_<id>
    // The "value" field is the search input, not the category.
    const params = new URLSearchParams({
      start: String(batchSize),
      offset: String(offset),
      filter: '1',
      sort: '0',
      filterMaxPrice: '',
      filterMinPrice: '',
      datesort: '-1',
      pricesort: '-1',
      value: ''
    });
    const catId = textValue(value);
    if (catId) params.append('activeCheckBoxes[]', catId);
    const payload = params.toString();

    const resp = await requestWithRetry('post', searchProductUrl, {
      timeout: 120000,
      data: payload,
      headers: {
        ...SHOPIER_AXIOS_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookieHeader || '',
        Origin: 'https://www.shopier.com',
        Referer: refererUrl,
        Accept: 'application/json, text/plain, */*'
      }
    });

    if (!resp || resp.status < 200 || resp.status >= 300) break;

    const data = resp.data && typeof resp.data === 'object'
      ? resp.data
      : (() => {
        try {
          return JSON.parse((resp.data || '').toString());
        } catch (e) {
          void e;
          return {};
        }
      })();

    const products = Array.isArray(data?.products) ? data.products : [];
    let added = 0;
    for (const item of products) {
      const p = normalizeSearchApiProduct(item, refererUrl, username);
      const key = textValue(item?.id) || textValue(p?.url) || textValue(p?.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(p);
      added += 1;
    }

    const showMore = Boolean(data?.show_more);
    if (!showMore || products.length === 0) break;
    if (added === 0) break;
    offset = Math.max(0, out.length - 1);
    await sleep(DELAY_MS);
  }

  return out;
}

async function fetchAllProductsViaSearchApi(shopierUrl) {
  const normalized = normalizeShopierUrl(shopierUrl);
  if (!normalized) throw new Error('Geçersiz Shopier URL');

  const normalizedWww = normalized.replace(/^https:\/\/shopier\.com\//i, 'https://www.shopier.com/');
  const shopSlug = (() => {
    try {
      const u = new URL(normalizedWww);
      const part = (u.pathname || '').split('/').filter(Boolean)[0] || '';
      return part.toLowerCase();
    } catch (e) {
      void e;
      return '';
    }
  })();

  const pageResp = await requestWithRetry('get', normalizedWww, {
    timeout: 120000,
    headers: {
      ...SHOPIER_AXIOS_HEADERS,
      Referer: 'https://www.google.com/'
    }
  });

  if (!pageResp || pageResp.status < 200 || pageResp.status >= 300) {
    throw new Error(`Shopier page fetch failed: ${pageResp?.status || 'unknown'}`);
  }

  const cookieHeader = buildCookieHeader(pageResp?.headers?.['set-cookie']);
  const cfg = extractShopierCatalogConfig(pageResp.data, normalizedWww);
  const csrfToken = textValue(cfg?.csrfToken);
  const username = textValue(cfg?.username);
  const searchProductUrl = shopSlug ? `https://www.shopier.com/s/api/v1/search_product/${shopSlug}` : '';

  if (!searchProductUrl || !csrfToken) {
    throw new Error('Shopier API config bulunamadı');
  }

  const batchSize = Math.max(1, Number(cfg?.defaultProductCount || 24) || 24);
  const maxBatches = Math.max(1, Math.ceil(Math.max(Number(cfg?.totalCount || 0), batchSize) / batchSize) + 5);
  const out = [];
  const seen = new Set();
  for (const p of extractProductsFromShopHtml(pageResp.data, normalizedWww)) {
    const key = textValue(p?.url).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }

  let offset = Math.max(0, out.length - 1, batchSize - 1);
  let consecutiveNoAdd = 0;

  for (let i = 0; i < maxBatches; i += 1) {
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

    const resp = await requestWithRetry('post', searchProductUrl, {
      timeout: 120000,
      data: payload,
      headers: {
        ...SHOPIER_AXIOS_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookieHeader || '',
        Origin: 'https://www.shopier.com',
        Referer: normalizedWww,
        Accept: 'application/json, text/plain, */*'
      }
    });

    if (resp?.status === 403) {
      throw new Error('Shopier search api 403');
    }
    if (!resp || resp.status < 200 || resp.status >= 300) {
      throw new Error(`Shopier search api failed: ${resp?.status || 'unknown'}`);
    }

    const data = resp.data && typeof resp.data === 'object'
      ? resp.data
      : (() => {
        try {
          return JSON.parse((resp.data || '').toString());
        } catch (e) {
          void e;
          return {};
        }
      })();

    const products = Array.isArray(data?.products) ? data.products : [];
    if (i === 0 && products.length === 0) {
      const ct = textValue(resp?.headers?.['content-type']);
      const rawText = typeof resp?.data === 'string' ? resp.data : '';
      const snippet = rawText ? rawText.slice(0, 300) : '';
      throw new Error(
        `Shopier search api empty response (url=${searchProductUrl} status=${resp?.status || 'unknown'} content-type=${ct || 'n/a'} snippet=${snippet || 'n/a'})`
      );
    }
    let added = 0;
    for (const item of products) {
      const p = normalizeSearchApiProduct(item, normalized, cfg?.username);
      const key = textValue(item?.id) || textValue(p?.url) || textValue(p?.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(p);
      added += 1;
    }

    const showMore = Boolean(data?.show_more);
    offset = Math.max(0, out.length - 1);

    if (added === 0) consecutiveNoAdd += 1;
    else consecutiveNoAdd = 0;

    if (!showMore || products.length === 0) break;
    if (consecutiveNoAdd >= 2) break;
    if (Number(cfg?.totalCount || 0) > 0 && out.length >= Number(cfg.totalCount)) break;
    await sleep(DELAY_MS);
  }

  try {
    const tabs = extractCategoryTabsFromShopHtml(pageResp.data, normalizedWww);
    if (Array.isArray(tabs) && tabs.length > 0) {
      const indexByUrl = new Map();
      out.forEach((p, idx) => {
        const u = comparableShopierUrl(p?.url);
        if (u) indexByUrl.set(u, idx);
      });

      for (const tab of tabs.slice(0, 20)) {
        const label = textValue(tab?.name);
        const value = textValue(tab?.value);
        if (!label || !value) continue;

        const catProducts = await fetchCategoryProductsViaSearchApi({
          searchProductUrl,
          csrfToken,
          cookieHeader,
          refererUrl: normalizedWww,
          batchSize,
          username: cfg?.username,
          value
        });

        for (const cp of Array.isArray(catProducts) ? catProducts : []) {
          const u = comparableShopierUrl(cp?.url);
          const idx = u ? indexByUrl.get(u) : undefined;
          if (idx == null) continue;
          if (!out[idx] || typeof out[idx] !== 'object') continue;
          out[idx] = { ...out[idx], category: label };
        }
      }
    }
  } catch (e) {
    void e;
  }

  return out;
}

/**
 * Shopier URL'ini normalize et
 */
function normalizeShopierUrl(url) {
  if (!url) return '';
  let raw = url.trim();
  if (!raw) return '';

  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  try {
    const u = new URL(raw);
    const host = (u.hostname || '').toLowerCase();
    if (!host.endsWith('shopier.com')) return '';

    const parts = (u.pathname || '')
      .split('/')
      .map((p) => (p || '').trim())
      .filter(Boolean);

    const storeSlug = (parts[0] || '').toLowerCase();
    if (!storeSlug) return '';

    return `https://shopier.com/${storeSlug}`;
  } catch (e) {
    return '';
  }
}

function normalizeCatalogProducts(products) {
  const list = Array.isArray(products) ? products : [];
  const out = [];
  const seen = new Set();

  for (const raw of list) {
    const url = String(raw?.url || raw?.link || '').trim();
    const name = String(raw?.name || raw?.title || '').trim();
    if (!url || !name) continue;
    if (url.endsWith('#')) continue;
    if (url.toLowerCase().includes('/company/shopier')) continue;
    const key = `${url.toLowerCase()}|${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title: name,
      name,
      url,
      link: url,
      image: raw?.image || raw?.imageUrl,
      imageUrl: raw?.imageUrl || raw?.image,
      images: Array.isArray(raw?.images) ? raw.images : undefined,
      price: raw?.price,
      oldPrice: raw?.oldPrice,
      discountPercent: raw?.discountPercent,
      description: raw?.description,
      category: raw?.category || 'Genel'
    });
  }

  return out;
}

function buildShopDataFromScraped(scraped, shopierUrl) {
  const productsRaw = Array.isArray(scraped?.products) ? scraped.products : [];
  const normalizedProducts = normalizeCatalogProducts(productsRaw);

  const rawTotal = Number(scraped?.totalCount || scraped?.totalProducts || productsRaw.length || 0);

  const categoriesMap = new Map();
  normalizedProducts.forEach((p, idx) => {
    const name = String(p?.category || '').trim();
    // "Genel" kategorisini atla, sadece gerçek kategorileri al
    if (!name || name === 'Genel') return;
    if (!categoriesMap.has(name)) categoriesMap.set(name, []);
    categoriesMap.get(name).push(idx);
  });

  const categories = Array.from(categoriesMap.entries()).map(([name, productIndices]) => ({
    name,
    productIndices
  }));

  return {
    shopierUrl: String(shopierUrl || '').trim(),
    shopName: String(scraped?.storeName || scraped?.shopName || '').trim() || 'Shopier',
    totalProducts: rawTotal,
    totalCount: rawTotal,
    products: normalizedProducts,
    categories
  };
}

/**
 * Tek bir sayfadan ürünleri çek
 */
async function scrapePage(url, pageNum = 1) {
  const pageUrl = (() => {
    if (pageNum === 1) return url;
    try {
      const u = new URL(url);
      u.searchParams.set('page', String(pageNum));
      return u.toString();
    } catch (e) {
      return `${url}?page=${pageNum}`;
    }
  })();
  
  const response = await requestWithRetry('get', pageUrl, {
    timeout: 120000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response || response.status < 200 || response.status >= 300) {
    throw new Error(`Shopier page scrape failed: ${response?.status || 'unknown'}`);
  }

  const $ = cheerio.load(response.data);
  const products = [];

  // Ürünleri bul
  $('.product, .product-item, .product-card, [class*="product"]').each((i, el) => {
    const $el = $(el);
    
    const name = $el.find('.product-name, .product-title, h3, h4').first().text().trim();
    const priceText = $el.find('.product-price, .price, [class*="price"]').first().text().trim();
    const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
    const productUrl = $el.find('a').first().attr('href') || '';

    if (name && priceText) {
      let resolvedUrl = (productUrl || '').toString().trim();
      if (resolvedUrl) {
        try {
          resolvedUrl = new URL(resolvedUrl, url).toString();
        } catch (e) {
          void e;
        }
      }
      products.push({
        name,
        price: priceText,
        image: imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`,
        url: resolvedUrl,
        id: `product-${Date.now()}-${i}`
      });
    }
  });

  return products;
}

/**
 * TÜM ürünleri çek - HYBRID (API + Scraping)
 */
async function fetchAllProducts(shopierUrl) {
  const normalized = normalizeShopierUrl(shopierUrl);
  if (!normalized) {
    throw new Error('Geçersiz Shopier URL');
  }

  console.log(`🔍 fetchAllProducts başladı: ${normalized}`);

  // TRY 1: Shopier REST API (Resmi API - En Hızlı!)
  if (fetchAllProductsFromShopierAPI) {
    try {
      console.log(`🚀 Shopier REST API deneniyor...`);
      const apiProducts = await fetchAllProductsFromShopierAPI(normalized);
      if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
        console.log(`✅ Shopier REST API ile ${apiProducts.length} ürün çekildi (HIZLI!)`);
        return apiProducts;
      }
      console.warn(`⚠️ Shopier REST API kullanılamadı, scraping\'e geçiliyor...`);
    } catch (apiErr) {
      console.warn('⚠️ Shopier REST API hatası, scraping\'e geçiliyor:', apiErr.message);
    }
  }

  // TRY 2: Shopier Search API (Internal API)
  try {
    console.log(`📡 Shopier Search API deneniyor...`);
    const searchApiProducts = await fetchAllProductsViaSearchApi(normalized);
    if (Array.isArray(searchApiProducts) && searchApiProducts.length > 0) {
      console.log(`✅ Shopier Search API ile ${searchApiProducts.length} ürün çekildi`);
      return searchApiProducts;
    }
    console.warn(`⚠️ Shopier Search API boş sonuç döndü`);
  } catch (searchApiErr) {
    console.error('❌ Shopier Search API hatası:', {
      message: searchApiErr?.message,
      status: searchApiErr?.response?.status,
      statusText: searchApiErr?.response?.statusText
    });
  }

  // TRY 3: HTML Scraping (Fallback)
  console.log(`🌐 HTML scraping deneniyor...`);
  const allProducts = [];
  const seenUrls = new Set();
  let page = 1;
  let hasMore = true;
  let consecutiveErrors = 0;

  while (hasMore && page <= 50 && consecutiveErrors < 3) {
    try {
      const products = await scrapePage(normalized, page);
      
      if (!Array.isArray(products) || products.length === 0) {
        console.log(`ℹ️ Sayfa ${page}: Ürün bulunamadı`);
        hasMore = false;
        break;
      }

      consecutiveErrors = 0; // Reset error counter on success
      let newlyAdded = 0;
      
      for (const p of products) {
        try {
          const u = String(p?.url || '').trim().toLowerCase();
          if (!u) continue;
          if (seenUrls.has(u)) continue;
          seenUrls.add(u);
          allProducts.push(p);
          newlyAdded += 1;
        } catch (e) {
          void e;
        }
      }

      console.log(`✓ Sayfa ${page}: ${newlyAdded} yeni ürün (Toplam: ${allProducts.length})`);

      if (newlyAdded === 0) {
        hasMore = false;
        break;
      }

      page++;
      
      if (hasMore) {
        await sleep(DELAY_MS);
      }
    } catch (pageErr) {
      consecutiveErrors++;
      const is429 = pageErr?.message?.includes('429');
      const waitTime = is429 ? RETRY_DELAY_MS : DELAY_MS * 2;
      
      console.error(`✗ Sayfa ${page} hatası (${consecutiveErrors}/3):`, pageErr?.message || pageErr);
      
      if (is429) {
        console.warn(`⚠️ Rate limit (429) - ${waitTime/1000} saniye bekleniyor...`);
      }
      
      if (consecutiveErrors >= 3) {
        console.error('❌ 3 ardışık hata, scraping durduruluyor');
        break;
      }
      
      // Retry with delay
      await sleep(waitTime);
    }
  }

  // FINAL CHECK
  if (allProducts.length === 0) {
    console.error(`❌ HİÇ ÜRÜN BULUNAMADI: ${normalized}`);
    throw new Error('Shopier mağazanızda ürün bulunamadı. Mağaza linkini kontrol edin veya mağazanızın herkese açık olduğundan emin olun.');
  }

  console.log(`✅ HTML scraping ile ${allProducts.length} ürün çekildi`);
  return allProducts;
}

async function fetchShopierCatalog(shopierUrl, opts = {}) {
  const normalized = normalizeShopierUrl(shopierUrl);
  if (!normalized) {
    throw new Error('Geçersiz Shopier URL');
  }

  const skipDetails = Boolean(opts?.skipDetails);
  const debug = Boolean(opts?.debug);
  const bypassCache = Boolean(opts?.bypassCache);
  const externalOnProgress = typeof opts?.onProgress === 'function' ? opts.onProgress : null;

  if (debug) console.log(`[Shopier] fetchShopierCatalog started: ${normalized} (bypassCache: ${bypassCache})`);

  const cacheKey = `${normalized}::v1`;
  
  // CACHE KONTROLÜ - BYPASS EDİLEBİLİR
  if (!bypassCache) {
    const cached = getCachedCatalog(cacheKey);
    if (cached?.value) {
      if (debug) console.log(`[Shopier] Using memory cache`);
      return cached.value;
    }
    if (cached?.inFlight) {
      if (debug) console.log(`[Shopier] Waiting for in-flight request`);
      try {
        return await cached.inFlight;
      } catch (inflightErr) {
        console.warn('[Shopier] In-flight request failed, retrying...');
        shopierCatalogCache.delete(cacheKey);
      }
    }
  } else {
    if (debug) console.log(`[Shopier] Cache bypassed - fresh fetch`);
    shopierCatalogCache.delete(cacheKey);
  }

  const task = (async () => {
    // Check persistent DB cache first - SADECE BYPASS YOKSA
    if (!bypassCache) {
      try {
        const persistent = await getPersistentCatalog(normalized);
        if (persistent?.catalog && persistent.complete && Array.isArray(persistent.catalog.products) && persistent.catalog.products.length > 0) {
          console.log(`[Shopier] Using persistent DB cache for ${normalized} (${persistent.catalog.products.length} products)`);
          return persistent.catalog;
        }
      } catch (dbErr) {
        console.warn('[Shopier] DB cache check failed:', dbErr?.message || dbErr);
      }
    }

    if (debug) console.log(`[Shopier] Fetching products from Shopier...`);
    
    // FETCH PRODUCTS - This will throw if it fails
    let products = [];
    try {
      products = await fetchAllProducts(normalized);
      if (debug) console.log(`[Shopier] fetchAllProducts returned ${products.length} products`);
    } catch (fetchErr) {
      console.error('[Shopier] fetchAllProducts failed:', fetchErr?.message || fetchErr);
      
      // TRY FALLBACK: shopier routes if available
      const routes = getShopierRoutes();
      if (routes?.scrapeShopier) {
        try {
          if (debug) console.log(`[Shopier] Trying fallback scraper...`);
          const scraped = await routes.scrapeShopier({
            url: normalized,
            force: true,
            debug: debug,
            discoverAll: true
          });
          products = Array.isArray(scraped?.products) ? scraped.products : [];
          if (debug) console.log(`[Shopier] Fallback scraper returned ${products.length} products`);
        } catch (scrapeErr) {
          console.error('[Shopier] Fallback scraper also failed:', scrapeErr?.message || scrapeErr);
        }
      }
      
      // If still no products, throw the original error
      if (!Array.isArray(products) || products.length === 0) {
        throw fetchErr;
      }
    }

    // FINAL CHECK: Do we have products?
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Shopier mağazanızda ürün bulunamadı veya ürünler çekilemedi');
    }

    const built = buildShopDataFromScraped({ 
      storeName: 'Shopier', 
      totalCount: products.length, 
      products 
    }, normalized);
    
    if (debug) console.log(`[Shopier] Built catalog with ${built.products.length} products`);
    
    // Detay çekme (opsiyonel)
    if (!skipDetails) {
      try {
        if (debug) console.log(`[Shopier] Starting detail enrichment...`);
        built.products = await enrichCatalogProductsWithDetails(built.products, normalized, {
          concurrency: Number(opts?.detailConcurrency || 2) || 2,
          maxProducts: Number(opts?.detailMaxProducts || 0) || 0,
          onProgress: async (currentList, enrichedCount) => {
            try {
              await upsertPersistentCatalog(normalized, {
                catalog: { ...built, products: currentList },
                complete: false,
                totalProducts: built.totalProducts,
                enrichedProducts: enrichedCount
              });
              if (externalOnProgress) {
                await externalOnProgress(currentList, enrichedCount);
              }
            } catch (e) {
              console.warn('[Shopier] Progress callback error:', e);
            }
          }
        });
        if (debug) console.log(`[Shopier] Detail enrichment completed`);
      } catch (enrichErr) {
        console.warn('[Shopier] Enrichment failed, using basic products:', enrichErr?.message || enrichErr);
        // Hata olsa bile temel ürünlerle devam et
      }
    }
    
    // Image optimization
    if (built && Array.isArray(built.products)) {
      try {
        built.products = optimizeProductImages(built.products);
        if (debug) console.log(`🖼️ ${built.products.length} ürün görseli optimize edildi`);
      } catch (imgErr) {
        console.warn('[Shopier] Image optimization failed:', imgErr);
      }
    }
    
    // Save to persistent DB cache
    try {
      await upsertPersistentCatalog(normalized, {
        catalog: built,
        complete: true,
        totalProducts: built.totalProducts,
        enrichedProducts: built.products.length
      });
    } catch (dbErr) {
      console.warn('[Shopier] DB cache save failed:', dbErr);
    }
    
    return built;
  })();

  setCatalogInFlight(cacheKey, task);

  try {
    const built = await task;
    setCachedCatalog(cacheKey, built);
    return built;
  } catch (e) {
    console.error('[Shopier] fetchShopierCatalog error:', e);
    shopierCatalogCache.delete(cacheKey);
    throw e;
  }
}

module.exports = {
  normalizeShopierUrl,
  fetchAllProducts,
  normalizeCatalogProducts,
  buildShopDataFromScraped,
  fetchShopierCatalog,
  enrichCatalogProductsWithDetails,
  fetchProductDetail,
  requestWithRetry
};
