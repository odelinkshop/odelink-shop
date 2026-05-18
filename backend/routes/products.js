const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Site = require('../models/Site');
const cacheService = require('../services/cacheService');
const authMiddleware = require('../middleware/auth');
const { fetchProductDetail } = require('../services/shopierCatalogService');

const clearUserSiteCaches = async (userId) => {
  try {
    const sites = await Site.findByUserId(userId);
    for (const site of sites) {
      if (site.subdomain) {
        await cacheService.clearSiteFullCache(`${site.subdomain}.odelink.shop`);
      }
      if (site.custom_domain) {
        await cacheService.clearSiteFullCache(site.custom_domain);
      }
    }
  } catch (e) {
    console.error('Cache clearing failed:', e);
  }
};

// Tüm ürünlerimi getir
router.get('/my-products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findByUserId(req.userId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni ürün ekle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const product = await Product.create({
      userId: req.userId,
      ...req.body
    });
    await clearUserSiteCaches(req.userId);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün güncelle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.userId, req.body);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    await clearUserSiteCaches(req.userId);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toplu link ile ürün çek
router.post('/import-links', authMiddleware, async (req, res) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: 'Geçerli link listesi gerekli' });
    }

    console.log(`🚀 [${req.userId}] ${links.length} link için toplu çekim başlatıldı...`);
    const results = [];

    for (const link of links) {
      try {
        const cleanLink = (link || '').toString().trim();
        if (!cleanLink) continue;

        console.log(`🔍 [${req.userId}] Link işleniyor: ${cleanLink}`);
        
        // Use the unified scraper with its built-in robustness
        const detail = await fetchProductDetail(cleanLink).catch(e => {
          console.error(`❌ Scraper detail error for ${cleanLink}:`, e.message);
          return null;
        });
        
        if (detail && (detail.title || detail.price > 0)) {
          console.log(`✅ [${req.userId}] Veri çekildi: "${detail.title}", Resim: ${detail.images?.length || 0}, Fiyat: ${detail.price}`);
          
          const product = await Product.create({
            userId: req.userId,
            title: detail.title || 'Yeni Ürün',
            description: detail.description || '',
            price: detail.price || 0,
            discountPrice: detail.discountPrice || 0,
            images: Array.isArray(detail.images) ? detail.images : [],
            shopierUrl: cleanLink,
            category: detail.category || 'Genel',
            stockCount: 100,
            sizes: Array.isArray(detail.sizes) ? detail.sizes : [],
            variations: Array.isArray(detail.variations) ? detail.variations : [],
            delivery_info: detail.deliveryInfo || ''
          });
          
          results.push({ link: cleanLink, success: true, id: product.id });
        } else {
          console.warn(`⚠️ [${req.userId}] Linkten yeterli veri alınamadı: ${cleanLink}`);
          results.push({ link: cleanLink, success: false, error: 'Ürün verisi (başlık/fiyat) çekilemedi.' });
        }
      } catch (err) {
        console.error(`❌ [${req.userId}] Toplu çekim hatası (${link}):`, err.message);
        results.push({ link, success: false, error: err.message });
      }
    }

    await clearUserSiteCaches(req.userId);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün sil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`🗑️ [${req.userId}] Ürün siliniyor: ${req.params.id}`);
    const product = await Product.delete(req.params.id, req.userId);
    if (!product) {
      console.warn(`⚠️ [${req.userId}] Silinecek ürün bulunamadı veya yetki yok: ${req.params.id}`);
      return res.status(404).json({ error: 'Ürün bulunamadı veya silme yetkiniz yok' });
    }
    await clearUserSiteCaches(req.userId);
    console.log(`✅ [${req.userId}] Ürün başarıyla silindi: ${req.params.id}`);
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error(`❌ [${req.userId}] Ürün silme hatası:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
