/**
 * Shopier Products API
 * Public endpoint - Tema için ürünleri döndürür
 */

const express = require('express');
const Site = require('../models/Site');
const CacheService = require('../services/cacheService');

const router = express.Router();

/**
 * GET /api/shopier-products/products?subdomain=xxx
 * GET /api/shopier/products?subdomain=xxx  (aynı handler — tema uyumluluğu)
 * theme=1: site yoksa 200 + boş ürün (vitrin kırılmasın)
 */
async function handleProducts(req, res) {
  try {
    const subdomain = (req.query.subdomain || '').toString().trim().toLowerCase();
    const themeMode = (req.query.theme || '').toString() === '1';

    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain gerekli' });
    }

    const cacheKey = `products:${subdomain}`;
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const site = await Site.findBySubdomain(subdomain);

    if (!site) {
      if (themeMode) {
        return res.status(200).json({
          ok: true,
          products: [],
          settings: {
            currency: 'TL',
            siteName: 'Mağaza',
            description: ''
          },
          total: 0,
          siteNotFound: true
        });
      }
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    const settings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
    
    // Merge Shopier products and Manual products
    const shopierProducts = Array.isArray(settings?.products_data) ? settings.products_data : [];
    const manualProducts = Array.isArray(settings?.manualProducts) ? settings.manualProducts : [];
    
    const combinedProducts = [...shopierProducts, ...manualProducts];

    const products = combinedProducts.map((p, index) => ({
      id: p?.id || `product-${index}`,
      name: p?.name || p?.title || 'Ürün',
      price: p?.price || p?.currentPrice || 0,
      oldPrice: p?.oldPrice || p?.originalPrice || null,
      image: p?.image || p?.imageUrl || p?.img || '',
      images: Array.isArray(p?.images) 
        ? p.images.map(img => typeof img === 'object' ? (img.optimized || img.original || '') : img).filter(Boolean)
        : (p?.image ? [p.image] : []),
      description: p?.description || '',
      variations: p?.variations || [],
      sizes: p?.sizes || [],
      category: p?.category || 'Genel',
      sku: p?.sku || `SHP-${index}`,
      slug: p?.slug || (p?.name ? p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : `product-${index}`),
      url: p?.url || p?.shopierUrl || '',
      discount: p?.discountPercent || p?.discount || null,
      shopierUrl: p?.url || p?.shopierUrl || '',
      hasFreeShipping: Boolean(p?.hasFreeShipping)
    }));

    const siteSettings = {
      currency: settings?.currency || 'TL',
      siteName: site?.name || 'Mağaza',
      description: settings?.description || '',
      contact: settings?.contact || {},
      about: settings?.about || {}
    };

    const responseData = {
      ok: true,
      products,
      settings: siteSettings,
      total: products.length
    };

    // Cache for 1 hour
    await CacheService.set(cacheKey, responseData, 3600);

    return res.json(responseData);
  } catch (error) {
    console.error('❌ Shopier products error:', error);
    return res.status(500).json({
      error: 'Ürünler alınamadı',
      details: (error?.message || String(error)).slice(0, 200)
    });
  }
}

router.get('/products', handleProducts);

module.exports = router;
module.exports.handleProducts = handleProducts;
