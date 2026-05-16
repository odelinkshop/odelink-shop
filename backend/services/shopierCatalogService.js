/**
 * SHOPIER CATALOG SERVICE - MONSTER ENGINE FLARE (V5)
 * FlareSolverr Integration + Ghost Puppeteer Fallback
 */

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Stealth eklentisini aktif et
puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
const getRandomItem = (arr) => arr[arr.length * Math.random() | 0];

function normalizeShopierImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const src = url.trim();
  if (src.includes('blank.gif') || src.includes('loader') || src.includes('600icons') || src.includes('logo_') || src.includes('shopier.svg')) return '';
  
  // Boyut eklerini temizle ve en yüksek çözünürlüğe (pictures) odaklan
  let normalized = src.split('?')[0] // Query parametrelerini at
    .replace('/pictures_mid/', '/pictures/')
    .replace('/pictures_small/', '/pictures/')
    .replace('/pictures_large/', '/pictures/');
  
  if (normalized.startsWith('//')) normalized = 'https:' + normalized;
  return normalized;
}

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'http://flaresolverr:8191/v1';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
];

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || 'eeb06f813ed7ad2ddda12ab18184d212';

function normalizeShopierUrl(url) {
  if (!url) return '';
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.startsWith('http')) clean = 'https://' + clean;
  try {
    const u = new URL(clean);
    if (u.hostname === 'shopier.com') u.hostname = 'www.shopier.com';
    return u.origin + u.pathname;
  } catch (e) {
    return clean;
  }
}

const scrapeWithFlareSolverr = async (url) => {
  try {
    console.log(`🔥 [FlareSolverr] İsteği gönderiliyor: ${url}`);
    const response = await axios.post(FLARESOLVERR_URL, {
      cmd: 'request.get',
      url: url,
      maxTimeout: 60000
    }, {
      timeout: 70000
    });

    if (response.data?.status === 'ok') {
      console.log('✅ [FlareSolverr] Başarılı!');
      return { 
        html: response.data.solution.response, 
        status: response.data.solution.status, 
        cookie: response.data.solution.cookies 
      };
    }
    return { html: null, status: 500 };
  } catch (error) {
    console.error('❌ [FlareSolverr] Hata:', error.message);
    return { html: null, status: 500 };
  }
};

/**
 * MONSTER ENGINE V2 - HYBRID SCRAPER
 * Her ne pahasına olursa olsun veriyi getiren çok katmanlı yapı
 */
const scrapeWithMonsterEngine = async (url, shopSlug) => {
  // 1. KATMAN: NEURAL MIRROR (Ağ Dinleme - En Temiz Veri)
  console.log('🛡️ [MonsterEngine] 1. Katman (NeuralMirror) deneniyor...');
  const res1 = await scrapeWithNeuralMirror(url, shopSlug);
  if (res1.interceptedData || (res1.html && res1.html.length > 5000)) {
    console.log('✅ [MonsterEngine] 1. Katman Başarılı!');
    return res1;
  }

  // 2. KATMAN: FLARESOLVERR (Bot Koruması Aşımı)
  console.log('🛡️ [MonsterEngine] 2. Katman (FlareSolverr) deneniyor...');
  const res2 = await scrapeWithFlareSolverr(url);
  if (res2.html && res2.html.length > 5000) {
    console.log('✅ [MonsterEngine] 2. Katman Başarılı!');
    return res2;
  }

  // 3. KATMAN: SCRAPER API (Proxy Fallback)
  console.log('🛡️ [MonsterEngine] 3. Katman (ScraperAPI) deneniyor...');
  try {
    const res3 = await axios.get('http://api.scraperapi.com', {
      params: { api_key: SCRAPER_API_KEY, url: url, render: 'false' },
      timeout: 60000
    });
    if (res3.data && res3.data.length > 5000) {
      console.log('✅ [MonsterEngine] 3. Katman Başarılı!');
      return { html: res3.data, status: 200 };
    }
  } catch (e) {
    console.error('❌ [MonsterEngine] 3. Katman da başarısız:', e.message);
  }

  // 4. KATMAN: STANDART PUPPETEER (Last Resort)
  console.log('🛡️ [MonsterEngine] 4. Katman (Standard Puppeteer) deneniyor...');
  try {
    const res4 = await getShopierHtml(url, shopSlug);
    if (res4.html && res4.html.length > 5000) {
      console.log('✅ [MonsterEngine] 4. Katman Başarılı!');
      return res4;
    }
  } catch (e) {
    console.error('❌ [MonsterEngine] 4. Katman da başarısız:', e.message);
  }

  return { html: null, status: 500, error: 'Tüm yöntemler başarısız oldu' };
};

/**
 * GHOST NEURAL INTERCEPTOR (XHR/Network Layer)
 * Bu yöntem HTML'e bakmaz, Shopier'in kendi iç veri paketini yakalar.
 */
const scrapeWithNeuralMirror = async (url, shopSlug) => {
  let browser = null;
  try {
    console.log(`🧠 [NeuralMirror] Ağ dinleyicisi başlatılıyor: ${url}`);
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(getRandomItem(USER_AGENTS));

    let interceptedData = null;

    // AĞI DİNLE: Shopier'in kendi API'sinden gelen JSON paketini yakala
    page.on('response', async (response) => {
      const resUrl = response.url();
      if (resUrl.includes('/s/api/v1/search_product/') || resUrl.includes('api.shopier.com')) {
        try {
          const data = await response.json();
          if (data && (data.products || data.data)) {
            console.log(`🎯 [NeuralMirror] Saf veri paketi yakalandı!`);
            interceptedData = data;
          }
        } catch (e) { /* Sessizce devam et */ }
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Eğer scroll gerekliyse yap (Daha fazla ürün yüklemesi için)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(3000);

    const html = await page.content();
    return { html, interceptedData, status: 200 };
  } catch (error) {
    console.error(`❌ [NeuralMirror] Hata: ${error.message}`);
    return { html: null, interceptedData: null, status: 500, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
};

const cleanPrice = (val) => {
    if (!val) return '';
    let cleaned = val.toString().replace(/\s+/g, ' ').trim();
    // Daha kapsayıcı fiyat yakalama regex'i:
    const matches = cleaned.match(/[\d.,]+\s*(?:TL|₺)/gi);
    if (matches && matches.length > 0) return matches[0];
    
    // Eğer TL ibaresi yoksa ama sayısal format (1.299,90 gibi) varsa onu yakala ve TL ekle
    const digitMatch = cleaned.match(/[\d.,]+/);
    if (digitMatch) return digitMatch[0] + ' TL';
    
    return cleaned;
};

function parseProductsFromHtml(html, shopSlug) {
  if (!html) return [];
  const $ = cheerio.load(html);
  const products = [];
  
  console.log(`🔍 [Parser] HTML boyutu: ${html.length}, Mağaza: ${shopSlug}`);

  // 1. YÖNTEM: Sınıf Tabanlı (Yeni Tasarım v3 + Özdemir Saat + Sade Saat)
  $('.product-card, .product-item, .product-box, [class*="product-card"], [class*="product-item"], [class*="product-box"]').each((i, el) => {
    const $el = $(el);
    const url = $el.find('a[href*="/' + shopSlug + '/"]').attr('href') || $el.find('a').attr('href');
    if (!url) return;

    const id = url.split('/').pop();
    if (!id || isNaN(id) || products.find(p => p.id === id)) return;

    const name = $el.find('h3, h4, .product-card__info-title, .title, [class*="title"]').first().text().replace(/\s+/g, ' ').trim();
    const rawPrice = $el.find('.product-card__info-price, .price, [class*="price"]').text().trim();
    const rawImg = $el.find('img').attr('src') || $el.find('img').attr('data-src') || $el.find('img').attr('data-original') || '';
    const image = normalizeShopierImageUrl(rawImg);

    if (name && id && image) {
      products.push({
        id, name,
        price: cleanPrice(rawPrice),
        image: image,
        url: url.startsWith('http') ? url : `https://www.shopier.com${url}`
      });
    }
  });

  // 2. YÖNTEM: Link Tabanlı (Fallback)
  if (products.length < 5) {
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.toLowerCase().includes(`/${shopSlug.toLowerCase()}/`) && /\d+$/.test(href)) {
        const id = href.split('/').pop();
        if (!id || products.find(p => p.id === id)) return;
        
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        let name = $(el).find('img').attr('alt') || text.replace(/\d+([.,]\d+)?\s*TL/i, '').replace(/Son ürün/i, '').trim();
        let rawPrice = text.match(/\d+([.,]\d+)?\s*TL/i)?.[0] || '';

        if (!name || name.length < 2) {
          name = $(el).closest('div').find('h3').first().text().trim() || $(el).parent().find('h3').first().text().trim();
        }

        if (name && id) {
          products.push({
            id, name, 
            price: cleanPrice(rawPrice),
            url: href.startsWith('http') ? href : `https://www.shopier.com${href}`,
            image: $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || ''
          });
        }
      }
    });
  }

  // 3. YÖNTEM: Eski Tasarım Fallback
  if (products.length === 0) {
    $('.shopier-product').each((i, el) => {
      const $el = $(el);
      const id = $el.attr('data-product-id');
      const name = $el.find('.product-title').text().trim();
      if (id && name) {
        products.push({
          id, name, 
          price: cleanPrice($el.find('.product-price').text()),
          image: $el.find('img').attr('data-src') || $el.find('img').attr('src'),
          url: `https://www.shopier.com/${shopSlug}/${id}`
        });
      }
    });
  }

  console.log(`🎯 [Parser] Toplam ${products.length} ürün bulundu.`);
  return products;
}

async function fetchShopierCatalog(shopierUrl, opts = {}) {
  try {
  const normalized = normalizeShopierUrl(shopierUrl);
  const shopSlug = (normalized.endsWith('/') ? normalized.slice(0, -1) : normalized).split('/').pop();
  
  console.log(`💎 [MonsterEngine V11 - Unlimited Ghost] Mağaza: ${normalized}`);

  let allProducts = [];
  let categories = [];
  let html = null;
  let firstPageProducts = [];
  
  // 1. AŞAMA: MONSTER ENGINE V2 (ÇOK KATMANLI TARAMA)
  console.log(`🧠 [MonsterEngine] Çok katmanlı tarama başlatılıyor...`);
  try {
      const monsterRes = await scrapeWithMonsterEngine(normalized, shopSlug);
      html = monsterRes.html;
      
      // Eğer saf veri yakalandıysa (NeuralMirror), PARSER'ı devre dışı bırak ve direkt veriyi işle
      if (monsterRes.interceptedData) {
          const rawProducts = monsterRes.interceptedData.products || monsterRes.interceptedData.data || [];
          console.log(`🎯 [NeuralMirror] Yakalanan saf veriden ${rawProducts.length} ürün işleniyor...`);
          
          firstPageProducts = rawProducts.map(p => {
              const id = (p.id || p.product_id || p.ID || '').toString();
              const name = p.name || p.title || p.label || 'İsimsiz Ürün';
              const priceData = p.price || p.amount || {};
              const price = (priceData.price_legacy_formatted || priceData.price_formatted || p.price || '').toString();
              const imgKey = p.primary_image || p.image || p.img || '';
              
              return {
                  id, name,
                  price: cleanPrice(price),
                  url: `https://www.shopier.com/${shopSlug}/${id}`,
                  image: imgKey.startsWith('http') ? imgKey : `https://cdn.shopier.app/pictures_large/${imgKey}`
              };
          });
      } else {
          // Eğer HTML alındıysa parse et
          firstPageProducts = html ? parseProductsFromHtml(html, shopSlug) : [];
      }
  } catch (err) {
      console.error(`❌ MonsterEngine başarısız:`, err.message);
  }

  // EĞER HALA ÜRÜN YOKSA (BÜYÜK BİR SORUN VAR DEMEKTİR)
  if (!html || firstPageProducts.length === 0) {
      console.error(`❌ [MonsterEngine] Hiçbir yöntemle veri alınamadı!`);
      return { products: [], totalProducts: 0, categories: [], debug: { error: 'All sync methods failed' } };
  }

  // 24 ÜRÜN BARAJI KONTROLÜ VE ZORUNLU SCROLL (DERİN TARAMA)
  if (firstPageProducts.length === 24) {
      console.log(`🌀 [MonsterEngine] 24 ürün barajı yakalandı, derin tarama (Scroll) başlatılıyor...`);
      try {
          const deepProducts = await fetchWithPuppeteerScroll(normalized, shopSlug);
          if (deepProducts.length > firstPageProducts.length) {
              allProducts = deepProducts;
          } else {
              allProducts = firstPageProducts;
          }
      } catch (scrollErr) {
          console.error('❌ Derin tarama başarısız:', scrollErr.message);
          allProducts = firstPageProducts;
      }
  } else {
      allProducts = firstPageProducts;
  }

  if (allProducts.length === 0 && !html) {
      console.error(`❌ [MonsterEngine] Hiçbir yöntemle HTML alınamadı!`);
      return { products: [], totalProducts: 0, categories: [], debug: { error: 'Fetch failed on all methods' } };
  }

  const $ = cheerio.load(html);

  // Kategorileri (Koleksiyonlar) HTML içinden ayıkla - TAB LİNK desteği
  $('.tab-link').each((i, el) => {
      const name = $(el).text().trim();
      const id = $(el).attr('data-id')?.replace('cat_', '');
      if (name && id && name !== 'Tüm ürünler' && !categories.find(c => c.id === id)) {
          categories.push({ id, name });
      }
  });

  // Eğer yukarıdaki yetmezse JSON içinden dene
  const categoriesMapMatch = html.match(/\$categories\s*=\s*({[^;]+})/);
  if (categoriesMapMatch) {
    try {
      const categoriesMap = JSON.parse(categoriesMapMatch[1]);
      Object.keys(categoriesMap).forEach(id => {
        if (!categories.find(c => c.id === id)) {
            categories.push({ id, name: categoriesMap[id] });
        }
      });
    } catch (e) {
      console.warn('⚠️ Kategoriler JSON parse edilemedi.');
    }
  }

  if (categories.length > 0) {
      console.log(`📂 [MonsterEngine] ${categories.length} kategori bulundu.`);
  }

  allProducts.push(...firstPageProducts);
  console.log(`✅ [MonsterEngine] İlk aşama tamam. ${firstPageProducts.length} ürün bulundu.`);

  // CSRF Şifresini ve Ürün Sayısını Bul
  const csrfToken = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1] || 
                    html.match(/"csrfToken":"([^"]+)"/)?.[1];
  
  const defaultProductCountMatch = html.match(/"default_product_count":(\d+)/);
  const increment = defaultProductCountMatch ? parseInt(defaultProductCountMatch[1]) : 24;

  if (!csrfToken) {
      console.warn(`⚠️ CSRF Token bulunamadı. Puppeteer ile DERİN TARAMA (Auto-Scroll) başlatılıyor...`);
      // CSRF yoksa API Hack çalışmaz, Puppeteer ile aşağı kaydıra kaydıra her şeyi çekelim
      try {
          const deepProducts = await fetchWithPuppeteerScroll(normalized, shopSlug);
          if (deepProducts.length > allProducts.length) {
              allProducts = deepProducts;
          }
      } catch (e) {
          console.error('❌ Derin tarama hatası:', e.message);
      }
      return { products: allProducts, totalProducts: allProducts.length, categories, debug: { method: 'PUPPETEER_SCROLL' } };
  }

  console.log(`🔑 Güvenlik anahtarı yakalandı, API Tüneli açılıyor... (Adım: ${increment})`);

  // 2. AŞAMA: Gizli JSON API'si üzerinden kalan tüm ürünleri çek
  const apiUrl = `https://www.shopier.com/s/api/v1/search_product/${shopSlug}`;
  let startOffset = increment;
  let hasMore = true;
  let emptyCount = 0;
  
  while (hasMore && allProducts.length < 5000) { // Güvenlik sınırı 5000
      console.log(`🚀 API Çekiliyor (Offset: ${startOffset}, Mevcut: ${allProducts.length})...`);
      
      const postData = `start=${startOffset}&offset=0&filter=0&sort=0&filterMinPrice=&filterMaxPrice=&datesort=-1&pricesort=-1&value=`;
      
      try {
          const apiRes = await axios.post('http://api.scraperapi.com', postData, {
              params: { api_key: SCRAPER_API_KEY, url: apiUrl, keep_headers: 'true' },
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Origin': 'https://www.shopier.com',
                  'Referer': normalized,
                  'X-CSRF-Token': csrfToken,
                  'X-Requested-With': 'XMLHttpRequest'
              },
              timeout: 120000
          });

          const data = apiRes.data;
          const jsonProducts = data.products || data.data || [];

          if (jsonProducts.length > 0) {
              const prevCount = allProducts.length;
              jsonProducts.forEach(p => {
                  if (!allProducts.find(old => old.id == p.id)) {
                      allProducts.push({
                          id: p.id.toString(),
                          name: p.name,
                          price: (p.price?.price_legacy_formatted || p.price?.price_formatted || p.price || '').toString().replace(/\s+/g, ' ').trim(),
                          url: `https://www.shopier.com/${shopSlug}/${p.id}`,
                          image: `https://cdn.shopier.app/pictures_large/${p.primary_image}`
                      });
                  }
              });
              
              if (allProducts.length === prevCount) {
                  console.log('🔄 Ürünler başa sardı, durduruluyor.');
                  hasMore = false;
              } else {
                  startOffset += increment;
                  emptyCount = 0;
              }
          } else {
              emptyCount++;
              if (emptyCount > 1) hasMore = false; // Üst üste boş gelirse dur
          }
      } catch (err) {
          console.error(`❌ API Hatası (Offset ${startOffset}):`, err.message);
          if (err.response?.status === 403 || err.response?.status === 401) {
              console.warn(`⚠️ Shopier API erişimi engelledi (403). Puppeteer ile KAYDIRMA MODUNA geçiliyor...`);
              try {
                  const deepProducts = await fetchWithPuppeteerScroll(normalized, shopSlug);
                  if (deepProducts && deepProducts.length > 0) {
                      allProducts = deepProducts;
                  }
                  hasMore = false;
                  break;
              } catch (scrollErr) {
                  console.error('❌ Kaydırma modu da başarısız:', scrollErr.message);
              }
          }
          hasMore = false;
      }
      await sleep(300);
  }

  console.log(`🏁 Senkronizasyon tamamlandı! Toplam: ${allProducts.length} ürün çekildi.`);

  if (opts.skipDetails) {
      return { 
        products: allProducts, 
        totalProducts: allProducts.length, 
        categories,
        debug: { url: normalized, method: 'SCRAPER_API_HACK' } 
      };
  }

  console.log(`🔍 [MonsterEngine] Aşama 3: Ürün Detayları (Beden, Kategori, Resimler) çekiliyor...`);
  const concurrency = opts.detailConcurrency || 5;
  const maxProducts = opts.detailMaxProducts || allProducts.length;
  const productsToEnrich = allProducts.slice(0, maxProducts);
  
  let enrichedCount = 0;
  
  // Basit concurrency (P-limit tarzı)
  for (let i = 0; i < productsToEnrich.length; i += concurrency) {
      const chunk = productsToEnrich.slice(i, i + concurrency);
      const promises = chunk.map(async (p) => {
          const details = await module.exports.fetchProductDetail(p.url);
          p.images = details.images?.length > 0 ? details.images : (p.image ? [p.image] : []);
          p.variations = details.variations || [];
          p.category = details.category || '';
          p.description = details.description || '';
          
          enrichedCount++;
          if (enrichedCount % 10 === 0) {
              console.log(`⏳ Detaylar çekiliyor: ${enrichedCount}/${productsToEnrich.length}`);
          }
      });
      await Promise.all(promises);
      
      if (opts.onProgress) {
          try { await opts.onProgress(allProducts, enrichedCount); } catch(e){}
      }
      
      await sleep(1000); // ScraperAPI'yi çok boğmamak için her 5'li istekten sonra 1 sn bekle
  }
  
  console.log(`✅ [MonsterEngine] Aşama 3 Tamamlandı! Tüm ürün detayları eklendi.`);

  console.log(`🏁 MonsterEngine Bitti. Bulunan: ${allProducts.length}`);
  return { 
    products: allProducts, 
    totalProducts: allProducts.length, 
    categories,
    debug: { 
      url: normalized, 
      method: allProducts.length > 0 ? 'SCRAPER_SUCCESS' : 'SCRAPER_FAILED',
      error: allProducts.length === 0 ? 'No products found by any method' : null,
      methodUsed: allProducts.length > 0 ? 'MonsterEngine V11' : 'None'
    } 
  };
} catch (error) {
  console.error('❌ MonsterEngine FATAL ERROR:', error.message);
  return { 
    products: [], 
    totalProducts: 0, 
    categories: [], 
    debug: { 
      url: normalized, 
      error: error.message,
      stack: error.stack
    } 
  };
}
}

async function getShopierHtml(url, shopSlug) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
              '--no-sandbox', 
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent(getRandomItem(USER_AGENTS));
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const html = await page.content();
        return { html, status: 200 };
    } catch (error) {
        console.error(`❌ [getShopierHtml] Hata:`, error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

async function fetchWithPuppeteerScroll(url, shopSlug) {
  let browser;
  try {
    console.log(`🌀 [AutoScroll] Başlatılıyor: ${url}`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(getRandomItem(USER_AGENTS));
    
    console.log(`🌀 [AutoScroll] Sayfa yükleniyor...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

    // Ürünlerin yüklenmesini bekle (Yeni tasarımda kartlar geç geliyor)
    try {
      await page.waitForSelector('.product-card, a[href*="/' + shopSlug + '/"]', { timeout: 15000 });
      console.log(`✅ [AutoScroll] Ürün kartları tespit edildi.`);
    } catch (e) {
      console.warn(`⚠️ [AutoScroll] Ürün kartları belirlenen sürede gelmedi, yine de denenecek.`);
    }

    // Auto-scroll loop with incremental capture
    let lastHeight = await page.evaluate('document.body.scrollHeight');
    let scrollCount = 0;
    const allCapturedProducts = new Map();

    while (scrollCount < 60) { // Max 60 scroll (217+ ürün için yeterli)
      // Mevcutları hafızaya al
      const currentHtml = await page.content();
      const batch = parseProductsFromHtml(currentHtml, shopSlug);
      batch.forEach(p => allCapturedProducts.set(p.id, p));

      console.log(`🌀 [AutoScroll] Kaydırıldı: ${scrollCount}, Toplam Yakalanan: ${allCapturedProducts.size}`);

      // Eğer tüm ürünlere ulaştıysak (Shopier HTML'de toplam sayıyı veriyor genelde)
      // Ama biz garantici olalım, kaydırmaya devam.

      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await sleep(2500); // Ürünlerin render olması için süre tanı
      
      let newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === lastHeight) {
        // Alt kısımda "Daha fazla göster" butonu varsa tıkla
        const clicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a'));
          const moreBtn = btns.find(b => b.textContent.toLowerCase().includes('daha fazla') || b.textContent.toLowerCase().includes('tümünü gör'));
          if (moreBtn) {
            moreBtn.click();
            return true;
          }
          return false;
        });
        
        if (clicked) {
          console.log(`🖱️ [AutoScroll] 'Daha Fazla' butonuna tıklandı.`);
          await sleep(3000);
          newHeight = await page.evaluate('document.body.scrollHeight');
        } else {
          // Son bir kez daha bekle (yavaş yükleme için)
          await sleep(3000);
          newHeight = await page.evaluate('document.body.scrollHeight');
          if (newHeight === lastHeight) break;
        }
      }
      lastHeight = newHeight;
      scrollCount++;
    }

    return Array.from(allCapturedProducts.values());
  } catch (error) {
    console.error(`❌ [AutoScroll] Hata:`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  fetchShopierCatalog,
  normalizeShopierUrl,
  fetchAllProducts: (u) => fetchShopierCatalog(u).then(r => r.products),
  buildShopDataFromScraped: (data, url) => ({
    name: 'Shopier',
    totalProducts: data.products?.length || 0,
    products: data.products || [],
    shopierUrl: url
  }),
  fetchProductDetail: async (url) => {
    try {
      // 1. URL Normalization - Keep the full URL if possible to avoid redirect issues
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
      
      // If it's a short URL or specific numeric ID, expand it
      const numericMatch = targetUrl.match(/\/(\d+)$/);
      if (numericMatch && !targetUrl.includes('ShowProductNew') && !targetUrl.includes('/shop/')) {
        // Only override if it's very short, otherwise keep the descriptive URL which is better for SEO/metadata
        if (targetUrl.split('/').length < 4) {
           targetUrl = `https://www.shopier.com/${numericMatch[1]}`;
        }
      }

      console.log(`🔍 [fetchProductDetail] Processing: ${targetUrl}`);

      let html;
      const axiosConfig = {
        headers: { 
            'User-Agent': getRandomItem(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 30000
      };

      try {
        const res = await axios.get(targetUrl, axiosConfig);
        html = res.data;
      } catch (e) {
        console.log(`⚠️ [fetchProductDetail] Direct access failed (${e.message}), trying ScraperAPI...`);
        try {
          const res = await axios.get('http://api.scraperapi.com', {
              params: { api_key: SCRAPER_API_KEY, url: targetUrl },
              timeout: 60000
          });
          html = res.data;
        } catch (sErr) {
          console.log(`❌ [fetchProductDetail] ScraperAPI failed: ${sErr.message}`);
        }
      }

      if (!html || html.length < 1000) {
          console.log(`👻 [fetchProductDetail] HTML too small or empty, using Ghost Puppeteer fallback...`);
          return await module.exports.fetchWithPuppeteerGhostDetail(targetUrl);
      }

      const $ = cheerio.load(html);
      
      // --- JSON Extraction (Shopier V3) ---
      let jsonData = null;
      try {
          const scripts = $('script').map((i, el) => $(el).html()).get();
          for (const script of scripts) {
              if (script && script.includes('} = {')) {
                  const startIdx = script.indexOf('} = {') + 4;
                  let bracketCount = 0;
                  let endIdx = -1;
                  for (let i = startIdx; i < script.length; i++) {
                      if (script[i] === '{') bracketCount++;
                      else if (script[i] === '}') {
                          if (bracketCount === 0) {
                              endIdx = i + 1;
                              break;
                          }
                          bracketCount--;
                      }
                  }
                  if (endIdx !== -1) {
                      jsonData = JSON.parse(script.substring(startIdx, endIdx));
                      break;
                  }
              }
          }
      } catch (jsonErr) { /* ignore */ }

      // --- Title ---
      let title = jsonData?.product?.name || 
                  $('meta[property="og:title"]').attr('content') ||
                  $('.product-name, .product-title-text, h1, .product-title').first().text().trim();
      
      // Clean title from "Shopier" suffix
      if (title) title = title.split(' | ')[0].split(' - Shopier')[0].trim();

      // --- Price ---
      const parseP = (val) => {
        if (val === undefined || val === null) return 0;
        if (typeof val === 'object') {
           val = val.price_formatted || val.price_legacy_formatted || val.amount || val.price || val.value || 0;
        }
        let cleaned = val.toString().replace(/[^\d.,]/g, '').replace(/\s/g, '');
        if (!cleaned) return 0;
        
        // Handle thousands separator (1.199,00 -> 1199.00)
        if (cleaned.includes('.') && cleaned.includes(',')) {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else if (cleaned.includes(',')) {
          // Check if comma is decimal (common in TR)
          cleaned = cleaned.replace(',', '.');
        }
        
        return parseFloat(cleaned) || 0;
      };

      let currentPrice = 0;
      let originalPrice = 0;

      if (jsonData?.product?.price) {
          currentPrice = parseP(jsonData.product.price.price_formatted || jsonData.product.price);
      }

      const rawCurrent = $('.price-current, .product-price, .price, .price-value, [data-price]').first().text() || $('[data-price]').first().attr('data-price');
      const rawOld = $('.price-old, .product-old-price, .product-price-old, [class*="old-price"]').first().text();

      if (!currentPrice) currentPrice = parseP(rawCurrent);
      if (!originalPrice) originalPrice = parseP(rawOld);

      // --- Last Resort Price Extraction (Regex) ---
      if (currentPrice === 0 || originalPrice === 0) {
        const fullText = $('body').text().replace(/\s+/g, ' ');
        // More flexible regex for prices like "1.499,99 TL", "599,98₺", etc.
        const priceRegex = /([\d.,]{2,12})\s*(?:TL|₺|TRY)/gi;
        let match;
        const foundPrices = [];
        while ((match = priceRegex.exec(fullText)) !== null) {
          const val = parseP(match[1]);
          if (val > 20) foundPrices.push(val);
        }
        
        if (foundPrices.length > 0) {
          // Sort descending
          foundPrices.sort((a, b) => b - a);
          if (currentPrice === 0) {
             // If we only found one, it's the current price
             // If we found two, the larger is original, smaller is current
             if (foundPrices.length >= 2) {
                originalPrice = foundPrices[0];
                currentPrice = foundPrices[1];
             } else {
                currentPrice = foundPrices[0];
             }
          } else if (originalPrice === 0 && foundPrices[0] > currentPrice) {
             originalPrice = foundPrices[0];
          }
        }
      }

      // --- Images (ULTRA AGGRESSIVE) ---
      const images = [];
      const seen = new Set();
      const addImg = (src) => {
        if (!src) return;
        // Clean possible quotes or backslashes from JSON strings
        const cleaned = src.replace(/\\/g, '').replace(/["']/g, '').trim();
        const norm = normalizeShopierImageUrl(cleaned);
        if (norm && norm.includes('cdn.shopier.app') && !seen.has(norm)) {
          if (!norm.includes('600icons') && !norm.includes('logo_')) {
            images.push(norm);
            seen.add(norm);
          }
        }
      };

      // 1. Primary from JSON
      if (jsonData?.product?.primary_variant_image) addImg(jsonData.product.primary_variant_image);
      if (jsonData?.product?.images) {
        if (Array.isArray(jsonData.product.images)) jsonData.product.images.forEach(img => addImg(img.url || img));
        else if (typeof jsonData.product.images === 'object') Object.values(jsonData.product.images).forEach(img => addImg(img.url || img));
      }
      
      // 2. Product Gallery Selectors
      $('.product-images img, .swiper-slide img, .gallery img, #product-gallery img, .product-detail-images img, .product-image-container img, .product-img img, [class*="product"] img').each((i, el) => {
         addImg($(el).attr('data-src') || $(el).attr('src') || $(el).attr('data-original') || $(el).attr('data-lazy-src'));
      });

      // 3. Script search (Regex for image URLs in scripts)
      if (images.length < 3) {
        $('script').each((i, el) => {
          const content = $(el).html();
          if (content && content.includes('cdn.shopier.app')) {
            const matches = content.match(/https:\/\/cdn\.shopier\.app\/[^\s"']+\.(?:jpe?g|png|webp)/gi);
            if (matches) matches.forEach(m => addImg(m));
          }
        });
      }

      // 4. Fallback to Meta
      if (images.length === 0) addImg($('meta[property="og:image"]').attr('content'));

      // 5. Last resort: all images
      if (images.length < 2) {
        $('img').each((i, el) => {
          const src = $(el).attr('data-src') || $(el).attr('src');
          addImg(src);
        });
      }

      // --- Desperate Image Recovery (Regex on Raw HTML) ---
      if (images.length === 0) {
        const rawHtml = $.html();
        const imgRegex = /https:\/\/cdn\.shopier\.app\/[^\s"']+\.(?:jpe?g|png|webp)/gi;
        const matches = rawHtml.match(imgRegex);
        if (matches) matches.forEach(m => addImg(m));
      }

      // --- Description ---
      let description = jsonData?.product?.description || 
                        $('.product-description, #tab-description, .description').html() || 
                        $('meta[property="og:description"]').attr('content') || '';

      const result = { 
        url, 
        title: title || 'Yeni Ürün', 
        price: originalPrice > currentPrice ? originalPrice : currentPrice, 
        discountPrice: originalPrice > currentPrice ? currentPrice : 0,
        images: images.slice(0, 15), 
        variations: [], 
        category: 'Genel', 
        description: description ? description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim() : ''
      };

      // *** CRITICAL: If axios got HTML but found NO images, Shopier likely returned a bot page ***
      // Force Puppeteer Stealth fallback
      if (result.images.length === 0) {
        console.log(`🔄 [fetchProductDetail] Axios found NO images for ${url} - Shopier bot protection detected! Falling back to Puppeteer Stealth...`);
        try {
          const puppeteerResult = await module.exports.fetchWithPuppeteerGhostDetail(url);
          if (puppeteerResult && puppeteerResult.images && puppeteerResult.images.length > 0) {
            console.log(`✅ [fetchProductDetail] Puppeteer recovered ${puppeteerResult.images.length} images!`);
            return puppeteerResult;
          } else {
            console.log(`⚠️ [fetchProductDetail] Puppeteer also found no images. Returning axios result with title.`);
          }
        } catch (puppErr) {
          console.error(`❌ [fetchProductDetail] Puppeteer fallback failed:`, puppErr.message);
        }
      }

      return result;
    } catch (e) {
      console.error(`❌ [fetchProductDetail] Global Error:`, e.message);
      // Even on global error, try Puppeteer as last resort
      console.log(`🔄 [fetchProductDetail] Global error caught, trying Puppeteer as last resort for ${url}...`);
      try {
        const puppeteerResult = await module.exports.fetchWithPuppeteerGhostDetail(url);
        if (puppeteerResult && puppeteerResult.images && puppeteerResult.images.length > 0) {
          return puppeteerResult;
        }
      } catch (pe) { /* swallow */ }
      return { url, title: 'Yeni Ürün', price: 0, images: [], variations: [], category: '', description: '' };
    }
  },
  fetchWithPuppeteerGhostDetail: async (url) => {
    let browser;
    try {
      console.log(`🤖 [PuppeteerStealth] Starting for: ${url}`);
      browser = await puppeteer.launch({ 
        headless: 'new', 
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--window-size=1920,1080'
        ] 
      });
      const page = await browser.newPage();
      await page.setUserAgent(getRandomItem(USER_AGENTS));
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-platform': '"Windows"',
      });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      
      // --- WAIT FOR DYNAMIC CONTENT ---
      await sleep(5000); 
      
      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollBy(0, 500);
        setTimeout(() => window.scrollBy(0, 500), 1000);
      });
      await sleep(2000);

      const details = await page.evaluate(() => {
        const cleanT = (t) => t?.replace(/\s+/g, ' ').trim() || '';

        // --- 1. Title ---
        const titleEl = document.querySelector('.product-title-text, h1, .product-title, .product-name, [class*="product-detail"] h1');
        let title = cleanT(titleEl?.textContent) || document.title.split(' | ')[0];

        // --- 2. Prices (Surgical Precision) ---
        const parseP = (txt) => {
          if (!txt) return 0;
          let s = txt.replace(/[^\d.,]/g, '').replace(/\s/g, '');
          if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
          else if (s.includes(',')) s = s.replace(',', '.');
          return parseFloat(s) || 0;
        };

        // TARGET SPECIFIC CONTAINERS FOR PRICE
        const mainPriceArea = document.querySelector('.product-price-container, .price-container, .shopier-store--product-detail-price');
        let curPriceEl = mainPriceArea?.querySelector('.price-current, .product-price, .current-price') || 
                         document.querySelector('.price-current, .product-price, #product-price');
        let oldPriceEl = mainPriceArea?.querySelector('.price-old, .product-old-price, strike') || 
                         document.querySelector('.price-old, .product-old-price, strike');
        
        let p1 = parseP(curPriceEl?.textContent);
        let p2 = parseP(oldPriceEl?.textContent);

        // If still 0, look for the largest number near TL
        if (p1 === 0) {
          const bodyText = document.body.innerText;
          const matches = [...bodyText.matchAll(/([\d.,]{3,12})\s*(?:TL|₺|TRY)/gi)]; // Min 3 digits to avoid '131'
          const vals = matches.map(m => parseP(m[1])).filter(v => v > 50).sort((a,b) => b-a);
          if (vals.length >= 2) { p2 = vals[0]; p1 = vals[1]; }
          else if (vals.length === 1) { p1 = vals[0]; }
        }

        const price = Math.max(p1, p2);
        const discountPrice = (p1 > 0 && p2 > 0) ? Math.min(p1, p2) : 0;

        // --- 3. Badges ---
        const badges = Array.from(document.querySelectorAll('.product-badge, .badge, .shipping-info, .cargo-badge'))
          .map(el => cleanT(el.textContent))
          .filter(t => t.length > 2 && t.length < 50);
        
        // --- 4. Description ---
        const descEl = document.querySelector('.product-description, #tab-description, .description, .product-details, .shopier-product-description');
        let description = descEl?.innerHTML || '';
        
        if (badges.length > 0) {
          const badgeHtml = `<div style="margin-bottom:15px; display:flex; flex-wrap:wrap; gap:8px;">${badges.map(b => `<span style="background:#f0f0f0; padding:4px 10px; border-radius:6px; font-weight:bold; color:#111; font-size:12px; border:1px solid #ddd;">${b}</span>`).join('')}</div>`;
          description = badgeHtml + description;
        }

        // --- 5. Images (Strict Deduplication) ---
        const imgSet = new Set();
        document.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('data-src') || img.getAttribute('src') || img.getAttribute('data-original');
          if (!src) return;
          
          const s = src.toLowerCase();
          // Filter out junk
          if (s.includes('blank.gif') || s.includes('loader') || s.includes('600icons') || 
              s.includes('logo') || s.includes('icon') || s.includes('shopier.svg') ||
              s.includes('pixel') || s.startsWith('data:') || s.includes('profile')) return;
          
          // Only take high-quality CDN images
          if (s.includes('cdn.shopier.app') && (s.includes('scaledoriginal') || s.includes('/pictures/'))) {
            imgSet.add(src.split('?')[0]
              .replace('/pictures_mid/', '/pictures/')
              .replace('/pictures_small/', '/pictures/')
              .replace('/pictures_large/', '/pictures/')
            );
          }
        });

        return { 
          title, 
          price,
          discountPrice,
          images: [...imgSet].slice(0, 15), 
          variations: [], 
          category: 'Genel', 
          description 
        };
      });
      
      console.log(`🤖 [PuppeteerStealth] Finished: "${details.title}", ${details.images.length} images`);
      return { url, ...details };
    } catch (e) {
      console.error(`❌ [PuppeteerStealth] Error:`, e.message);
      return null;
    } finally {
      if (browser) await browser.close();
    }
  },
  enrichCatalogProductsWithDetails: async (products) => {
    // This is handled by siteCreationJobWorker iteratively, but if called directly:
    return products;
  },
  requestWithRetry: async (m, u, c) => axios.request({ method: m, url: u, ...c })
};
