const axios = require('axios');
const cheerio = require('cheerio');
const shopierRoutes = require('../routes/shopier');
const { HttpProxyAgent } = require('http-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

const MAX_CATALOG_PRODUCTS = 50000;
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1'
];

const SHOPIER_PROXY_POOL = (() => {
  const single = (process.env.SHOPIER_PROXY_URL || '').toString().trim();
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

const getHeaders = () => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
});

const normalizeShopierUrl = (raw) => {
  let value = (raw || '').toString().trim();
  if (!value) return '';
  
  // Önce protokolü ekle (yoksa)
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value.replace(/^\/\/+/, '')}`;
  }
  
  try {
    const url = new URL(value);
    // If user pastes a product URL like /store/29444889, normalize to store root /store
    if (/shopier\.com$/i.test(url.hostname)) {
      const segments = (url.pathname || '')
        .split('/')
        .map((seg) => seg.trim())
        .filter(Boolean);
      const storeSlug = segments[0] || '';
      const maybeProductId = segments[1] || '';
      if (storeSlug && maybeProductId && /^\d{4,}$/.test(maybeProductId)) {
        url.pathname = `/${storeSlug}`;
        url.search = '';
        url.hash = '';
      }
    }
    // Path kısmındaki sondaki slash'ı kaldır, ama sadece path varsa
    if (url.pathname.endsWith('/') && url.pathname.length > 1) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString().replace(/\/$/, '');
  } catch (e) {
    // URL parse edilemezse basit temizlik yap
    return value.replace(/\/+$/, '');
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));

const normalizeUrl = (raw, baseUrl) => {
  const value = (raw || '').toString().trim();
  if (!value) return '';
  try {
    return new URL(value, baseUrl || undefined).toString();
  } catch (error) {
    void error;
    return value;
  }
};

const safeText = (value) => (value == null ? '' : String(value)).replace(/\s+/g, ' ').trim();

const decodeSlashEscapes = (value) => safeText(value).replace(/\\\//g, '/');

const buildCookieHeader = (headers) => {
  const setCookie = headers?.['set-cookie'];
  if (!Array.isArray(setCookie) || !setCookie.length) return '';
  return setCookie
    .map((cookie) => safeText(cookie).split(';')[0])
    .filter(Boolean)
    .join('; ');
};

const extractCatalogConfig = (html, pageUrl) => {
  const content = (html || '').toString();
  const csrfTokenMatch = content.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i);
  const searchProductMatch = content.match(/"search_product":"([^"]+)"/i);
  const usernameMatch = content.match(/"username":"([^"]+)"/i);
  const defaultCountMatch = content.match(/"default_product_count":(\d+)/i);
  const showLoadMoreMatch = content.match(/"show_load_more":(true|false)/i);

  return {
    csrfToken: safeText(csrfTokenMatch?.[1]),
    searchProductUrl: normalizeUrl(decodeSlashEscapes(searchProductMatch?.[1]), pageUrl),
    username: safeText(usernameMatch?.[1]),
    defaultProductCount: Number(defaultCountMatch?.[1] || 24) || 24,
    showLoadMore: /^true$/i.test(safeText(showLoadMoreMatch?.[1]))
  };
};

const parseListingProducts = (html, pageUrl) => {
  const $ = cheerio.load((html || '').toString());
  const out = [];

  $('.product-card.shopier--product-card.product-card-store').each((_, element) => {
    const root = $(element);
    const linkEl = root.find('a.shopier-store--store-product-card-link').first();
    const title = safeText(root.find('.shopier-store--store-product-card-title').first().text());
    const image = normalizeUrl(root.find('img').first().attr('src'), pageUrl);
    const url = normalizeUrl(linkEl.attr('href'), pageUrl);
    const price = safeText(
      root.find('.shopier-store--store-product-card-price-current').first().attr('data-price')
      || root.find('.shopier-store--store-product-card-price-current').first().text()
    );

    if (!title && !url) return;
    out.push({
      title,
      name: title,
      price,
      image,
      imageUrl: image,
      link: url,
      url,
      description: '',
      category: 'Genel'
    });
  });

  return out;
};

const normalizeSearchApiProduct = (item, shopierUrl, username) => {
  const id = safeText(item?.id);
  const name = safeText(item?.title || item?.name);
  const imageName = safeText(item?.primary_image || item?.image || item?.picture || item?.picture_name);
  const image = imageName ? `https://cdn.shopier.app/pictures_mid/${imageName}` : '';
  const productUrl = normalizeUrl(
    item?.link
    || item?.url
    || (id && username ? `https://www.shopier.com/${username}/${id}` : ''),
    shopierUrl
  );

  return {
    title: name,
    name,
    price: safeText(item?.price || item?.discount_price || ''),
    image,
    imageUrl: image,
    link: productUrl,
    url: productUrl,
    description: '',
    category: 'Genel'
  };
};

const fetchViaOfficialApi = async (shopierUrl) => {
  const storeUrl = normalizeShopierUrl(shopierUrl);
  const proxyAgents = buildAxiosProxyAgents();
  const initial = await axios.get(storeUrl, {
    ...(proxyAgents || {}),
    headers: getHeaders(),
    timeout: 30000,
    maxRedirects: 5
  });

  const html = (initial?.data || '').toString();
  const config = extractCatalogConfig(html, storeUrl);
  const cookieHeader = buildCookieHeader(initial?.headers || {});
  const initialProducts = parseListingProducts(html, storeUrl);
  const results = initialProducts.slice();
  const seen = new Set(results.map((product) => `${(product.url || '').toLowerCase()}|${(product.title || '').toLowerCase()}`));

  if (!config.showLoadMore || !config.searchProductUrl || !config.csrfToken) {
    return {
      products: results,
      totalProducts: results.length
    };
  }

  const batchSize = Math.max(1, Number(config.defaultProductCount || 24) || 24);
  let offset = Math.max(0, initialProducts.length - 1);
  let showMore = true;
  let stagnantRounds = 0;

  while (showMore && results.length < MAX_CATALOG_PRODUCTS) {
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

    const perRequestProxy = buildAxiosProxyAgents();
    const response = await axios.post(config.searchProductUrl, payload, {
      ...(perRequestProxy || {}),
      headers: {
        ...getHeaders(),
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-TOKEN': config.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookieHeader,
        Origin: 'https://www.shopier.com',
        Referer: storeUrl
      },
      timeout: 30000,
      maxRedirects: 0
    });

    const data = response?.data && typeof response.data === 'object'
      ? response.data
      : JSON.parse((response?.data || '{}').toString());
    const apiProducts = Array.isArray(data?.products) ? data.products : [];
    let added = 0;

    apiProducts.forEach((item) => {
      const normalized = normalizeSearchApiProduct(item, storeUrl, config.username);
      const key = `${(normalized.url || '').toLowerCase()}|${(normalized.title || '').toLowerCase()}`;
      if (!normalized.title || seen.has(key)) return;
      seen.add(key);
      results.push(normalized);
      added += 1;
    });

    showMore = Boolean(data?.show_more);
    if (!apiProducts.length || added === 0) {
      stagnantRounds += 1;
      if (stagnantRounds >= 2) break;
    } else {
      stagnantRounds = 0;
    }

    offset += batchSize;
    if (!showMore) break;
    await sleep(1000); // 1 saniye bekleme süresi - HIZLANDIRILDI
  }

  return {
    products: results,
    totalProducts: results.length
  };
};

const extractShopName = (shopierUrl) => {
  try {
    const url = new URL(normalizeShopierUrl(shopierUrl));
    const parts = url.pathname.split('/').filter(Boolean);
    const leaf = (parts[parts.length - 1] || 'shopier-magaza').toString();
    return leaf.replace(/[-_]+/g, ' ').trim() || 'Shopier Magaza';
  } catch (error) {
    void error;
    return 'Shopier Magaza';
  }
};

const normalizeCategory = (raw) => {
  const value = (raw || '').toString().trim();
  return value || 'Genel';
};

const hasOnlyGenericCategory = (shopData) => {
  const categories = Array.isArray(shopData?.categories) ? shopData.categories : [];
  if (categories.length === 0) return true;

  const nonGeneric = categories.filter((cat) => {
    const name = (cat?.name || '').toString().trim().toLowerCase();
    return name && name !== 'genel';
  });

  return nonGeneric.length === 0;
};

const PLACEHOLDER_PRODUCT_NAME_RE = /^(product\s*title|urun\s*\d+|ürün\s*\d+|untitled\s*product)$/i;

const isPlaceholderProductName = (raw) => {
  const value = (raw || '').toString().trim();
  if (!value) return true;
  return PLACEHOLDER_PRODUCT_NAME_RE.test(value);
};

const isLikelyCatalogProductUrl = (raw) => {
  try {
    const url = new URL(normalizeShopierUrl(raw));
    const host = (url.host || '').toString().trim().toLowerCase();
    if (host !== 'www.shopier.com' && host !== 'shopier.com') return false;

    const pathname = (url.pathname || '').toString().trim();
    if (!pathname || pathname === '/') return false;
    if (/\.(?:jpg|jpeg|png|webp|gif|svg|ico|css|js|map|woff2?|ttf|eot)$/i.test(pathname)) {
      return false;
    }

    const parts = pathname.split('/').filter(Boolean);
    if (parts.length < 2) return false;

    const blocked = new Set([
      'assets',
      'b',
      'basket',
      'cdn-cgi',
      'company',
      'css',
      'fonts',
      'help',
      'image',
      'images',
      'img',
      'js',
      'login',
      'pictures',
      'pictures_mid',
      'shopier',
      'static',
      'uploads'
    ]);

    if (blocked.has(parts[0].toLowerCase()) || blocked.has(parts[1].toLowerCase())) {
      return false;
    }

    return true;
  } catch (error) {
    void error;
    return false;
  }
};

const shouldKeepNormalizedProduct = (product) => {
  const title = (product?.title || product?.name || '').toString().trim();
  const link = (product?.link || product?.url || '').toString().trim();
  const image = (product?.image || product?.imageUrl || '').toString().trim();
  const price = (product?.price || '').toString().trim();

  if (!title || isPlaceholderProductName(title)) return false;
  if (!link && !image && !price) return false;

  if (link && !isLikelyCatalogProductUrl(link) && !image && !price) {
    return false;
  }

  return true;
};

const normalizeProduct = (raw, index) => {
  const title = (raw?.title || raw?.name || '').toString().trim() || `Urun ${index + 1}`;
  const link = (raw?.link || raw?.url || '').toString().trim();
  const image = (raw?.image || raw?.imageUrl || '').toString().trim();
  const description = (raw?.description || '').toString().trim().slice(0, 800);
  const price = (raw?.price || '').toString().trim();
  const category = normalizeCategory(raw?.category);

  return {
    id: index + 1,
    title,
    name: title,
    price,
    image,
    imageUrl: image,
    link,
    url: link,
    description,
    category
  };
};

const normalizeCatalogProducts = (products) => {
  const list = Array.isArray(products) ? products : [];
  const seen = new Set();
  const out = [];

  for (const raw of list) {
    const normalized = normalizeProduct(raw, out.length);
    if (!shouldKeepNormalizedProduct(normalized)) continue;
    const dedupeKey = `${(normalized.url || '').toLowerCase()}|${normalized.title.toLowerCase()}`;
    if (!normalized.title) continue;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(normalized);
    if (out.length >= MAX_CATALOG_PRODUCTS) break;
  }

  return out.map((product, index) => ({
    ...product,
    id: index + 1
  }));
};

const buildCatalogCategories = (products) => {
  const groups = new Map();

  products.forEach((product, index) => {
    const name = normalizeCategory(product?.category);
    if (!groups.has(name)) {
      groups.set(name, []);
    }
    groups.get(name).push(index);
  });

  return Array.from(groups.entries())
    .map(([name, productIndices]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'genel',
      productIndices
    }))
    .sort((a, b) => b.productIndices.length - a.productIndices.length);
};

const buildShopDataFromScraped = (scraped, requestedUrl) => {
  const url = normalizeShopierUrl(requestedUrl);
  const products = normalizeCatalogProducts(scraped?.products || []);
  const categories = buildCatalogCategories(products);
  const totalProducts = Math.max(Number(scraped?.totalCount || 0) || 0, products.length);
  const shopName = (scraped?.storeName || scraped?.shopName || scraped?.shopInfo?.name || '').toString().trim() || extractShopName(url);

  return {
    products,
    categories,
    totalProducts,
    shopierUrl: url,
    shopName,
    shopInfo: {
      name: shopName,
      description: (scraped?.description || scraped?.shopInfo?.description || '').toString().trim(),
      logo: (scraped?.logo || scraped?.shopInfo?.logo || '').toString().trim(),
      url
    }
  };
};

const fetchShopierCatalog = async (shopierUrl, options = {}) => {
  const url = normalizeShopierUrl(shopierUrl);
  if (!url || !url.includes('shopier')) {
    const error = new Error('Gecerli bir Shopier URL giriniz');
    error.status = 400;
    throw error;
  }

  try {
    const directCatalog = await fetchViaOfficialApi(url);
    const directShopData = buildShopDataFromScraped({
      products: directCatalog.products,
      totalCount: directCatalog.totalProducts,
      storeName: extractShopName(url)
    }, url);

    if (directShopData.products.length && !hasOnlyGenericCategory(directShopData)) {
      return directShopData;
    }
  } catch (directError) {
    void directError;
  }

  const scraped = await shopierRoutes.scrapeShopier({
    url,
    force: options.force !== false,
    debug: Boolean(options.debug),
    discoverAll: options.discoverAll !== false
  });

  const shopData = buildShopDataFromScraped(scraped, url);
  if (!shopData.products.length) {
    const error = new Error('Magazadan urun bulunamadi');
    error.status = 400;
    throw error;
  }

  return shopData;
};

module.exports = {
  buildCatalogCategories,
  buildShopDataFromScraped,
  extractShopName,
  fetchShopierCatalog,
  normalizeCatalogProducts,
  normalizeShopierUrl
};
