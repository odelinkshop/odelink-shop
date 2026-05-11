const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Tüm ürünlerimi getir
router.get('/my-products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.findByUserId(req.user.userId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni ürün ekle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const product = await Product.create({
      userId: req.user.userId,
      ...req.body
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.user.userId, req.body);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.delete(req.params.id, req.user.userId);
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
