const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

module.exports = {
  fetchProductDetail: async (productUrl, shopierUrl, options = {}) => {
    try {
      const detail = await module.exports.fetchWithPuppeteerGhostDetail(productUrl);
      if (detail && detail.title && !detail.title.includes('İstek sınırı')) {
        return detail;
      }
      
      // Fallback if needed
      return {
        url: productUrl,
        title: detail?.title || 'Yeni Ürün',
        price: detail?.price || 0,
        images: detail?.images || [],
        description: detail?.description || ''
      };
    } catch (error) {
      console.error('❌ [fetchProductDetail] Fatal Error:', error.message);
      return { url: productUrl, title: 'Yeni Ürün', price: 0, images: [], variations: [], category: '', description: '' };
    }
  },

  fetchWithPuppeteerGhostDetail: async (url) => {
    let browser;
    try {
      console.log(`🤖 [PuppeteerStealth] Starting for: ${url}`);
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

      console.log(`🌐 [PuppeteerStealth] Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      
      // Check for rate limit
      const bodyContent = await page.evaluate(() => document.body.innerText.toLowerCase());
      if (bodyContent.includes('istek sınırı') || bodyContent.includes('too many requests')) {
        console.warn('⚠️ [PuppeteerStealth] Rate limited by Shopier. Waiting 5s and retrying once...');
        await sleep(5000);
        await page.reload({ waitUntil: 'networkidle2' });
      }

      // Mimic human
      await sleep(2000 + Math.random() * 2000);
      await page.evaluate(() => window.scrollBy(0, 400));
      await sleep(1000);

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
          if (!finalImgMap.has(fileName) || cleanUrl.includes('scaledoriginal')) finalImgMap.set(fileName, cleanUrl);
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
            // Eğer sadece nokta varsa ve sonu 3 haneliyse (Örn: 2.100)
            s = s.replace(/\./g, '');
          }
          
          let val = parseFloat(s) || 0;
          return val;
        };

        let title = '';
        let price = 0;
        let discountPrice = 0;
        let description = '';

        try {
          const scripts = Array.from(document.querySelectorAll('script'));
          for (const s of scripts) {
            const content = s.textContent || '';
            if (content.includes('"product"') && (content.includes('"price_formatted"') || content.includes('"price"'))) {
              const titleMatch = content.match(/"name":"([^"]+)"/) || content.match(/"title":"([^"]+)"/);
              if (titleMatch && !title) title = cleanT(titleMatch[1]);

              const pOrigMatch = content.match(/"price_legacy_formatted":"([^"]+)"/);
              const pCurrMatch = content.match(/"price_formatted":"([^"]+)"/);
              const pOrig = pOrigMatch ? parseP(pOrigMatch[1]) : 0;
              const pCurr = pCurrMatch ? parseP(pCurrMatch[1]) : 0;
              
              if (pCurr > 0) {
                if (pOrig > pCurr) { price = pOrig; discountPrice = pCurr; }
                else { price = pCurr; }
              }
            }
          }
        } catch (e) {}

        if (!title) title = cleanT(document.querySelector('h1')?.innerText || document.querySelector('.product-title')?.innerText);
        if (!price) price = parseP(document.querySelector('.price')?.innerText || document.querySelector('.current-price')?.innerText);

        // Description
        description = cleanT(document.querySelector('#productDescription')?.innerText || document.querySelector('.product-description')?.innerText);

        // Images - TARGETED EXTRACTION
        const productContainer = document.querySelector('.product-container') || document.querySelector('#productDescription')?.closest('div') || document.body;
        
        // Find thumbnails and main image specifically
        const galleryImgs = productContainer.querySelectorAll('img');
        galleryImgs.forEach(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (!src) return;

          // EXCLUSION LIST: Skip related products, store logos, etc.
          const isJunk = img.closest('.related-products') || 
                         img.closest('.suggested-products') || 
                         img.closest('.product-recommendations') ||
                         img.closest('.shopier-apps--related-product-product-card-product-link') ||
                         img.closest('.shopier-store--header-store-link') ||
                         img.closest('.follow-store-body');
                         
          if (isJunk) return;

          addImg(src);
        });

        return {
          title,
          price,
          discountPrice,
          description,
          images: Array.from(finalImgMap.values())
        };
      });

      console.log(`🤖 [PuppeteerStealth] Finished: "${details.title}", ${details.images.length} images`);
      return { url, ...details };
    } catch (error) {
      console.error(`❌ [PuppeteerStealth ERROR] URL: ${url} -> ${error.message}`);
      return null;
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  },
  enrichCatalogProductsWithDetails: async (p) => p,
  requestWithRetry: async (m, u, c) => axios.request({ method: m, url: u, ...c })
};
