const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Site = require('../models/Site');
const cacheService = require('../services/cacheService');
const authMiddleware = require('../middleware/auth');

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

// Ürün sil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.delete(req.params.id, req.userId);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    await clearUserSiteCaches(req.userId);
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
