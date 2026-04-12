/**
 * SHOPIER ROUTES - SIFIRDAN YENİ VERSİYON
 * Tek endpoint: /scrape - Ürünleri çek ve döndür
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeShopierUrl, fetchAllProducts, requestWithRetry } = require('../services/shopierCatalogService');
const { handleProducts } = require('./shopier-products');

const router = express.Router();

/** GET /api/shopier/products — Tema ve eski scriptlerle uyumluluk */
router.get('/products', handleProducts);

async function scrapeShopier({ url, force } = {}) {
  const normalized = normalizeShopierUrl(url);
  if (!normalized) {
    const err = new Error('Geçersiz Shopier URL');
    err.status = 400;
    throw err;
  }

  const discoverAll = Boolean(arguments?.[0]?.discoverAll);

  void force;

  const response = await requestWithRetry('get', normalized, {
    timeout: 15000,
    maxAttempts: 5,
    baseDelayMs: 700,
    capDelayMs: 8000,
    maxTotalMs: 25000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response || response.status < 200 || response.status >= 300) {
    const err = new Error(`Shopier sayfası çekilemedi (status=${response?.status || 'unknown'})`);
    err.status = Number(response?.status || 0) || 502;
    throw err;
  }
  const $ = cheerio.load(response.data);

  const titleText = $('title').first().text().trim();
  const storeName = (titleText.split('|')[0] || '').trim() || 'Shopier';

  if (discoverAll) {
    const products = await fetchAllProducts(normalized);
    return { storeName, totalCount: products.length, products };
  }

  const products = [];
  const seen = new Set();

  $('.product, .product-item, .product-card, [class*="product"]').each((i, el) => {
    const $el = $(el);
    const name = $el.find('.product-title, .product-name, .product-title, h3, h4').first().text().trim();
    const priceText = $el.find('.price, .product-price, [class*="price"]').first().text().trim();
    const href = ($el.find('a').first().attr('href') || '').trim();
    if (!name || !priceText || !href) return;

    const absUrl = href.startsWith('http')
      ? href
      : (href.startsWith('/') ? `https://www.shopier.com${href}` : `${normalized.replace(/\/$/, '')}/${href}`);

    const key = `${absUrl.toLowerCase()}|${name.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);

    products.push({
      name,
      price: priceText,
      url: absUrl
    });
  });

  return { storeName, totalCount: products.length, products };
}

router.scrapeShopier = scrapeShopier;

/**
 * POST /api/shopier/scrape
 * Shopier'dan ürünleri çek
 */
router.post('/scrape', async (req, res) => {
  try {
    const rawUrl = (req.body?.url || req.body?.shopierUrl || '').toString();
    
    if (!rawUrl.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Shopier URL gerekli' 
      });
    }

    const normalized = normalizeShopierUrl(rawUrl);
    if (!normalized) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir Shopier URL giriniz'
      });
    }
    console.log(`📦 Scrape başladı: ${normalized}`);

    const products = await fetchAllProducts(normalized);

    const storeName = normalized.split('/').filter(Boolean).pop() || 'Shopier';
    const categories = [];

    return res.json({
      success: true,
      data: {
        storeName,
        products,
        categories,
        totalProducts: products.length,
        shopierUrl: normalized
      }
    });

  } catch (error) {
    console.error('❌ Scrape hatası:', error);
    const status = Number(error?.status || 0) || 0;
    const message = (error?.message || '').toString();
    const looksLikeBadInput = message.toLowerCase().includes('geçersiz') || message.toLowerCase().includes('gecersiz');
    if (status === 400 || looksLikeBadInput) {
      return res.status(400).json({
        success: false,
        error: message || 'Geçerli bir Shopier URL giriniz'
      });
    }
    return res.status(500).json({
      success: false,
      error: message || 'Ürünler çekilemedi'
    });
  }
});

module.exports = router;
