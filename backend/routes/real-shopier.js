const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const authMiddleware = require('../middleware/auth');
const Site = require('../models/Site');
const Subscription = require('../models/Subscription');

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

const buildPuppeteerArgs = () => {
  const base = new Set(['--no-sandbox', '--disable-setuid-sandbox']);
  try {
    const raw = (process.env.PUPPETEER_ARGS || '').toString();
    raw.split(',').map((x) => x.trim()).filter(Boolean).forEach((a) => base.add(a));
  } catch (e) {
    void e;
  }
  if (isProduction) base.add('--disable-dev-shm-usage');
  return Array.from(base);
};

const launchBrowser = async () => {
  const resolvedArgs = isProduction
    ? Array.from(new Set([...(chromium.args || []), ...buildPuppeteerArgs()]))
    : buildPuppeteerArgs();

  const executablePath = isProduction
    ? await chromium.executablePath()
    : (process.env.PUPPETEER_EXECUTABLE_PATH || undefined);

  return puppeteer.launch({
    headless: isProduction ? chromium.headless : true,
    args: resolvedArgs,
    executablePath
  });
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

// Real Shopier API integration
router.post('/validate-url', async (req, res) => {
  try {
    const { shopierUrl } = req.body;
    
    // Validate Shopier URL format
    if (!shopierUrl || !shopierUrl.includes('shopier.com')) {
      return res.status(400).json({ 
        error: 'Geçersiz Shopier URL\'si' 
      });
    }

    // Check if Shopier URL is accessible
    try {
      const response = await axios.get(shopierUrl, { timeout: 10000 });
      if (response.status === 200) {
        res.json({ 
          valid: true, 
          message: 'Shopier URL doğrulandı',
          shopName: extractShopName(shopierUrl)
        });
      }
    } catch (error) {
      res.status(400).json({ 
        error: 'Shopier URL\'ye erişilemiyor',
        details: !isProduction ? error.message : undefined
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Sunucu hatası',
      details: !isProduction ? error.message : undefined
    });
  }
});

// Real Shopier scraping with Puppeteer
router.post('/scrape-products', async (req, res) => {
  try {
    const { shopierUrl } = req.body;
    
    if (!shopierUrl) {
      return res.status(400).json({ error: 'Shopier URL gerekli' });
    }

    let browser;
    try {
      browser = await launchBrowser();
    } catch (e) {
      if (isPuppeteerUnavailable(e)) {
        return res.status(503).json({
          error: 'Ürün çekme servisi şu an hazır değil. Lütfen daha sonra tekrar deneyin.',
          details: !isProduction ? (e?.message || '').toString() : undefined
        });
      }
      throw e;
    }
    
    const page = await browser.newPage();
    await page.goto(shopierUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for products to load
    await page.waitForSelector('.product-item, .product, .item, [data-product]', { timeout: 10000 });
    
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.product-item, .product, .item, [data-product]');
      const products = [];
      
      productElements.forEach((element, index) => {
        try {
          const titleElement = element.querySelector('.product-title, .title, h2, h3, .name');
          const priceElement = element.querySelector('.price, .amount, .cost');
          const imageElement = element.querySelector('img');
          const linkElement = element.querySelector('a');
          
          if (titleElement && priceElement) {
            products.push({
              id: index + 1,
              title: titleElement.textContent.trim(),
              price: priceElement.textContent.trim(),
              image: imageElement ? imageElement.src : null,
              link: linkElement ? linkElement.href : null,
              description: element.querySelector('.description, .desc, p')?.textContent.trim() || '',
              rating: element.querySelector('.rating, .stars')?.textContent.trim() || '',
              reviews: element.querySelector('.reviews, .comments')?.textContent.trim() || ''
            });
          }
        } catch (error) {
          console.log('Product parsing error:', error);
        }
      });
      
      return products;
    });
    
    try {
      await browser.close();
    } catch (e) {
      void e;
    }
    
    res.json({
      success: true,
      products: products,
      total: products.length,
      shopName: extractShopName(shopierUrl)
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    try {
      // best-effort cleanup
      if (typeof browser !== 'undefined' && browser) await browser.close();
    } catch (e) {
      void e;
    }
    res.status(500).json({ 
      error: 'Ürünler çekilemedi',
      details: !isProduction ? error.message : undefined
    });
  }
});

// Real Shopier shop info
router.post('/shop-info', async (req, res) => {
  try {
    const { shopierUrl } = req.body;

    let browser;
    try {
      browser = await launchBrowser();
    } catch (e) {
      if (isPuppeteerUnavailable(e)) {
        return res.status(503).json({
          error: 'Mağaza bilgi servisi şu an hazır değil. Lütfen daha sonra tekrar deneyin.',
          details: !isProduction ? (e?.message || '').toString() : undefined
        });
      }
      throw e;
    }
    
    const page = await browser.newPage();
    await page.goto(shopierUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const shopInfo = await page.evaluate(() => {
      const shopName = document.querySelector('.shop-name, .store-name, .brand-name, h1')?.textContent.trim() || '';
      const shopDescription = document.querySelector('.shop-description, .store-description, .about')?.textContent.trim() || '';
      const shopLogo = document.querySelector('.shop-logo, .store-logo, .logo img')?.src || '';
      const shopRating = document.querySelector('.rating, .stars')?.textContent.trim() || '';
      const totalProducts = document.querySelectorAll('.product-item, .product, .item, [data-product]').length;
      
      return {
        name: shopName,
        description: shopDescription,
        logo: shopLogo,
        rating: shopRating,
        totalProducts: totalProducts,
        url: window.location.href
      };
    });

    try {
      await browser.close();
    } catch (e) {
      void e;
    }
    
    res.json({
      success: true,
      shopInfo
    });
    
  } catch (error) {
    console.error('Shop info error:', error);
    try {
      // best-effort cleanup
      if (typeof browser !== 'undefined' && browser) await browser.close();
    } catch (e) {
      void e;
    }
    res.status(500).json({ 
      error: 'Mağaza bilgileri alınamadı',
      details: !isProduction ? error.message : undefined
    });
  }
});

// Helper function to extract shop name from URL
function extractShopName(shopierUrl) {
  try {
    const url = new URL(shopierUrl);
    const pathname = url.pathname;
    const parts = pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'Shopier Mağaza';
  } catch (error) {
    return 'Shopier Mağaza';
  }
}

module.exports = router;

