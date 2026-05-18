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

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'http://flaresolverr:8191/v1';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
];

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

  // 3. KATMAN: SCRAPER API (Elite Proxy Fallback)
  console.log('🛡️ [MonsterEngine] 3. Katman (ScraperAPI) deneniyor...');
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || 'eeb06f813ed7ad2ddda12ab18184d212';
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
    const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || $el.find('img').attr('data-original') || '';

    if (name && id) {
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

  return { 
    products: allProducts, 
    totalProducts: allProducts.length, 
    categories,
    debug: { url: normalized, method: 'SCRAPER_API_HACK_ENRICHED' } 
  };
}

async function getShopierHtml(url, shopSlug) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent(getRandomItem(USER_AGENTS));
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const html = await page.content();
        return { html };
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
      // Önce basit axios ile dene (Hızlı)
      let html;
      try {
        const res = await axios.get(url, {
          headers: { 'User-Agent': getRandomItem(USER_AGENTS) },
          timeout: 10000
        });
        html = res.data;
      } catch (e) {
        // Bloklanırsak ScraperAPI ile dene
        const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
        const res = await axios.get('http://api.scraperapi.com', {
            params: { api_key: SCRAPER_API_KEY, url: url, render: 'false' },
            timeout: 30000
        });
        html = res.data;
      }

      // Eğer hem direkt axios hem de ScraperAPI başarısız olduysa Puppeteer ile son kez dene
      if (!html) {
          console.log(`👻 [GhostDetail] API'ler başarısız, Puppeteer ile detay çekiliyor: ${url}`);
          const ghost = await module.exports.fetchWithPuppeteerGhostDetail(url);
          if (ghost) return ghost;
      }

      const $ = cheerio.load(html);
      
      let title = '';
      let price = 0;
      let discountPrice = 0;
      let description = '';
      const variations = [];
      const sizes = [];

      // Extract from scripts (Foolproof State Hydration JSON)
      try {
        $('script').each((i, el) => {
          const content = $(el).html() || '';
          if (content.includes('"product"') && (content.includes('"price_formatted"') || content.includes('"price"'))) {
            // Find the JSON state object
            const match = content.match(/=\s*(\{.+?\});?\s*$/m) || content.match(/({(?:[^{}]+|{(?:[^{}]+|{[^{}]*})*})*})/);
            if (match) {
              const data = JSON.parse(match[1]);
              const p = data.product;
              if (p) {
                title = p.name || '';
                description = p.description || '';
                
                if (p.price) {
                  const parsePrice = (txt) => {
                    if (!txt) return 0;
                    let s = txt.toString().replace(/[^\d.,]/g, '').trim();
                    if (!s) return 0;
                    if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
                    else if (s.includes(',')) s = s.replace(',', '.');
                    else if (s.includes('.') && s.split('.').pop()?.length === 3) s = s.replace(/\./g, '');
                    return parseFloat(s) || 0;
                  };
                  
                  const pOrig = p.price.price_legacy_formatted ? parsePrice(p.price.price_legacy_formatted) : 0;
                  const pCurr = p.price.price_code_formatted ? parsePrice(p.price.price_code_formatted) : parsePrice(p.price.price_formatted);
                  if (pCurr > 0) {
                    if (pOrig > pCurr) { price = pOrig; discountPrice = pCurr; }
                    else { price = pCurr; }
                  }
                }
                
                // Variations
                if (p.variations) {
                  const v1_name = (p.variations.variation_1_name || '').trim();
                  const v1_list = p.variations.variation_1 || [];
                  if (v1_name && v1_list.length > 0) {
                    let label = v1_name;
                    const lowerLabel = label.toLowerCase();
                    if (lowerLabel.includes('beden') || lowerLabel.includes('size') || lowerLabel.includes('seçenek') || lowerLabel === 'seçiniz') {
                      label = 'Beden';
                    } else if (lowerLabel.includes('renk') || lowerLabel.includes('color')) {
                      label = 'Renk';
                    }
                    const options = v1_list.map(o => (o.name || '').trim()).filter(Boolean);
                    variations.push({ name: label, options });
                    if (label === 'Beden') sizes.push(...options);
                  }

                  const v2_name = (p.variations.variation_2_name || '').trim();
                  const v2_list = p.variations.variation_2 || [];
                  if (v2_name && v2_list.length > 0) {
                    let label = v2_name;
                    const lowerLabel = label.toLowerCase();
                    if (lowerLabel.includes('beden') || lowerLabel.includes('size') || lowerLabel.includes('seçenek') || lowerLabel === 'seçiniz') {
                      label = 'Beden';
                    } else if (lowerLabel.includes('renk') || lowerLabel.includes('color')) {
                      label = 'Renk';
                    }
                    const options = v2_list.map(o => (o.name || '').trim()).filter(Boolean);
                    variations.push({ name: label, options });
                    if (label === 'Beden') sizes.push(...options);
                  }
                }
              }
            }
          }
        });
      } catch (err) {
        console.error('Error parsing script JSON:', err.message);
      }

      // Fallback: title and price
      if (!title) {
        title = $('h1').first().text().trim() || $('.product-title').first().text().trim();
      }
      if (!price) {
        const pText = $('.price').first().text().trim() || $('.current-price').first().text().trim();
        let s = pText.replace(/[^\d.,]/g, '').trim();
        if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
        else if (s.includes(',')) s = s.replace(',', '.');
        else if (s.includes('.') && s.split('.').pop()?.length === 3) s = s.replace(/\./g, '');
        price = parseFloat(s) || 0;
      }

      // Fallback: description
      if (!description) {
        description = $('.product-description').html() || 
                      $('#tab-description').html() || 
                      $('.description').html() || 
                      $('.product-details').html() || 
                      $('[class*="description"]').html() || '';
        if (description) {
          description = description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
        }
      }

      // Fallback: variations
      if (variations.length === 0) {
        $('select').each((i, el) => {
          const $select = $(el);
          let label = $select.closest('.variation-container').find('label').text().trim() || 
                      $select.parent().find('label').text().trim() || 
                      'Beden';
          
          const options = [];
          $select.find('option').each((j, opt) => {
            const val = $(opt).text().trim();
            if (val && !val.includes('Seçiniz')) options.push(val);
          });
          
          if (options.length > 0) {
            const lowerLabel = label.toLowerCase();
            if (lowerLabel.includes('beden') || lowerLabel.includes('size') || lowerLabel.includes('seçenek') || lowerLabel === 'seçiniz') {
              label = 'Beden';
            } else if (lowerLabel.includes('renk') || lowerLabel.includes('color')) {
              label = 'Renk';
            }
            variations.push({ name: label, options });
            if (label === 'Beden') sizes.push(...options);
          }
        });
      }

      // Extract all images including scaledoriginal with priority de-duplication
      const finalImgMap = new Map();
      $('img').each((i, el) => {
        let src = $(el).attr('data-src') || $(el).attr('src') || $(el).attr('srcset')?.split(' ')[0];
        if (src) {
          src = src.trim();
          if (src.startsWith('//')) src = 'https:' + src;
          if (src.includes('cdn.shopier.app')) {
            const lower = src.toLowerCase();
            if (lower.includes('pictures') || lower.includes('scaledoriginal')) {
              const cleaned = src.split('?')[0];
              const fileName = cleaned.split('/').pop();
              if (fileName) {
                let priority = 1;
                if (cleaned.includes('scaledoriginal')) priority = 4;
                else if (cleaned.includes('pictures_large')) priority = 3;
                else if (cleaned.includes('pictures/')) priority = 2;
                
                const existing = finalImgMap.get(fileName);
                if (!existing || existing.priority < priority) {
                  finalImgMap.set(fileName, { url: cleaned, priority });
                }
              }
            }
          }
        }
      });
      const images = Array.from(finalImgMap.values()).map(x => x.url);

      // Delivery Info (shipping-fee container, delivery-info-pane or deliveryInformation ID)
      let deliveryInfo = $('#delivery-info-pane').text().trim() || 
                         $('.shipping-fee').text().trim() || 
                         $('#deliveryInformation').text().trim() || '';
      if (deliveryInfo) {
        deliveryInfo = deliveryInfo.replace(/\s+/g, ' ').trim();
      }

      // Category (Breadcrumb)
      const breadcrumb = $('.breadcrumb li, .shopier-breadcrumb li').map((i, el) => $(el).text().trim()).get();
      const category = breadcrumb.length > 1 ? breadcrumb[1] : '';
      
      return { url, title, price, discountPrice, images, variations, sizes, category, description, deliveryInfo };
    } catch (e) {
      console.error(`❌ [fetchProductDetail] Failed for ${url}:`, e.message);
      return { url, title: '', price: 0, discountPrice: 0, images: [], variations: [], sizes: [], category: '', description: '', deliveryInfo: '' };
    }
  },
  fetchWithPuppeteerGhostDetail: async (url) => {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true, 
        executablePath: process.platform === 'linux' ? '/usr/bin/google-chrome-stable' : undefined,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-dev-shm-usage',
          '--shm-size=1gb',
          '--window-size=1920,1080'
        ] 
      });
      const page = await browser.newPage();
      await page.setUserAgent(getRandomItem(USER_AGENTS));
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      
      // Mimic human
      await sleep(1000 + Math.random() * 1000);
      await page.evaluate(() => window.scrollBy(0, 300));
      await sleep(500);

      const details = await page.evaluate(() => {
        const decodeUnicode = (str) => {
          return str.replace(/\\u([a-fA-F0-9]{4})/g, (match, grp) => {
            return String.fromCharCode(parseInt(grp, 16));
          }).replace(/\\/g, '');
        };

        const cleanT = (t) => {
          if (!t) return '';
          let decoded = decodeUnicode(t);
          return decoded.replace(/\s+/g, ' ').trim();
        };
        
        const finalImgMap = new Map();
        const addImg = (u) => {
          if (!u || typeof u !== 'string' || !u.includes('cdn.shopier.app')) return;
          const cleanUrl = u.split('?')[0].replace(/\\/g, '');
          const s = cleanUrl.toLowerCase();
          if (s.includes('logo') || s.includes('icon') || s.includes('pixel') || s.includes('profile') || s.includes('banner')) return;
          
          const fileName = cleanUrl.split('/').pop();
          if (fileName) {
            let priority = 1;
            if (cleanUrl.includes('scaledoriginal')) priority = 4;
            else if (cleanUrl.includes('pictures_large')) priority = 3;
            else if (cleanUrl.includes('pictures/')) priority = 2;
            
            const existing = finalImgMap.get(fileName);
            if (!existing || existing.priority < priority) {
              finalImgMap.set(fileName, { url: cleanUrl, priority });
            }
          }
        };

        const parseP = (txt) => {
          if (!txt) return 0;
          let s = txt.toString().replace(/[^\d.,]/g, '').trim();
          if (!s) return 0;
          
          if (s.includes('.') && s.includes(',')) {
            s = s.replace(/\./g, '').replace(',', '.');
          } else if (s.includes(',')) {
            s = s.replace(',', '.');
          } else if (s.includes('.') && s.split('.').pop()?.length === 3) {
            s = s.replace(/\./g, '');
          }
          
          let val = parseFloat(s) || 0;
          return val;
        };

        let title = '';
        let price = 0;
        let discountPrice = 0;
        let description = '';
        const variations = [];
        const sizes = [];

        try {
          const scripts = Array.from(document.querySelectorAll('script'));
          for (const s of scripts) {
            const content = s.textContent || '';
            if (content.includes('"product"') && (content.includes('"price_formatted"') || content.includes('"price"'))) {
              const match = content.match(/=\s*(\{.+?\});?\s*$/m) || content.match(/({(?:[^{}]+|{(?:[^{}]+|{[^{}]*})*})*})/);
              if (match) {
                const data = JSON.parse(match[1]);
                const p = data.product;
                if (p) {
                  title = cleanT(p.name);
                  description = cleanT(p.description);
                  
                  if (p.price) {
                    const pOrig = p.price.price_legacy_formatted ? parseP(p.price.price_legacy_formatted) : 0;
                    const pCurr = p.price.price_code_formatted ? parseP(p.price.price_code_formatted) : parseP(p.price.price_formatted);
                    if (pCurr > 0) {
                      if (pOrig > pCurr) { price = pOrig; discountPrice = pCurr; }
                      else { price = pCurr; }
                    }
                  }
                  
                  // Variations
                  if (p.variations) {
                    const v1_name = (p.variations.variation_1_name || '').trim();
                    const v1_list = p.variations.variation_1 || [];
                    if (v1_name && v1_list.length > 0) {
                      let label = v1_name;
                      const lowerLabel = label.toLowerCase();
                      if (lowerLabel.includes('beden') || lowerLabel.includes('size') || lowerLabel.includes('seçenek') || lowerLabel === 'seçiniz') {
                        label = 'Beden';
                      } else if (lowerLabel.includes('renk') || lowerLabel.includes('color')) {
                        label = 'Renk';
                      }
                      const options = v1_list.map(o => (o.name || '').trim()).filter(Boolean);
                      variations.push({ name: label, options });
                      if (label === 'Beden') sizes.push(...options);
                    }

                    const v2_name = (p.variations.variation_2_name || '').trim();
                    const v2_list = p.variations.variation_2 || [];
                    if (v2_name && v2_list.length > 0) {
                      let label = v2_name;
                      const lowerLabel = label.toLowerCase();
                      if (lowerLabel.includes('beden') || lowerLabel.includes('size') || lowerLabel.includes('seçenek') || lowerLabel === 'seçiniz') {
                        label = 'Beden';
                      } else if (lowerLabel.includes('renk') || lowerLabel.includes('color')) {
                        label = 'Renk';
                      }
                      const options = v2_list.map(o => (o.name || '').trim()).filter(Boolean);
                      variations.push({ name: label, options });
                      if (label === 'Beden') sizes.push(...options);
                    }
                  }
                }
              }
            }
          }
        } catch (e) {}

        if (!title) title = cleanT(document.querySelector('h1')?.innerText || document.querySelector('.product-title')?.innerText);
        if (!price) price = parseP(document.querySelector('.price')?.innerText || document.querySelector('.current-price')?.innerText);

        // Description
        if (!description) {
          description = cleanT(document.querySelector('#productDescription')?.innerText || document.querySelector('.product-description')?.innerText);
        }

        // Images - TARGETED EXTRACTION
        const productContainer = document.querySelector('.product-container') || document.querySelector('#productDescription')?.closest('div') || document.body;
        
        const galleryImgs = productContainer.querySelectorAll('img');
        galleryImgs.forEach(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (!src) return;

          const isJunk = img.closest('.related-products') || 
                         img.closest('.suggested-products') || 
                         img.closest('.product-recommendations') ||
                         img.closest('.shopier-apps--related-product-product-card-product-link') ||
                         img.closest('.shopier-store--header-store-link') ||
                         img.closest('.follow-store-body');
                         
          if (isJunk) return;

          addImg(src);
        });

        // Fallback Variations
        if (variations.length === 0) {
          document.querySelectorAll('select').forEach(select => {
              let label = select.closest('.variation-container')?.querySelector('label')?.innerText?.trim() || 
                          select.parentElement?.querySelector('label')?.innerText?.trim() || 
                          'Beden';
              const options = Array.from(select.querySelectorAll('option'))
                  .map(opt => opt.textContent.trim())
                  .filter(val => val && !val.includes('Seçiniz'));
              if (options.length > 0) {
                const lowerLabel = label.toLowerCase();
                if (lowerLabel.includes('beden') || lowerLabel.includes('size') || lowerLabel.includes('seçenek') || lowerLabel === 'seçiniz') {
                  label = 'Beden';
                } else if (lowerLabel.includes('renk') || lowerLabel.includes('color')) {
                  label = 'Renk';
                }
                variations.push({ name: label, options });
                if (label === 'Beden') sizes.push(...options);
              }
          });
        }

        const deliveryInfo = document.querySelector('#delivery-info-pane')?.innerText?.trim() || 
                             document.querySelector('.shipping-fee')?.innerText?.trim() || 
                             document.querySelector('#deliveryInformation')?.innerText?.trim() || '';

        const breadcrumb = Array.from(document.querySelectorAll('.breadcrumb li, .shopier-breadcrumb li'))
            .map(li => li.textContent.trim());
        const category = breadcrumb.length > 1 ? breadcrumb[1] : '';
        
        return { 
          title,
          price,
          discountPrice,
          images: Array.from(finalImgMap.values()).map(x => x.url),
          variations, 
          sizes, 
          category, 
          description, 
          deliveryInfo 
        };
      });
      
      return { url, ...details };
    } catch (e) {
      console.error(`❌ [GhostDetail] Hata:`, e.message);
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
