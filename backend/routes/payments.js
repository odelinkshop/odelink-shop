const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const DodoPaymentService = require('../services/dodoPaymentService');
const ShopierService = require('../services/ShopierService');
const Product = require('../models/Product');

// Import auth middleware
const authMiddleware = require('../middleware/auth');

/**
 * Create Dodo Checkout Link
 * POST /api/payments/create-link
 */
router.post('/create-link', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.userId; // Matches authMiddleware (req.userId = userId)
    
    console.log('💳 Creating Checkout for User:', userId, 'Plan:', planId);
    
    // 1. Find User
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // 2. Select Product ID from Env (Supports both professional and profesyonel)
    const isPro = planId === 'professional' || planId === 'profesyonel';
    const productId = isPro 
      ? process.env.DODO_PRODUCT_ID_PRO 
      : process.env.DODO_PRODUCT_ID_STANDART;

    if (!productId) {
      console.error('❌ Dodo Product ID not found in ENV!');
      return res.status(500).json({ message: 'Ürün yapılandırması eksik.' });
    }

    // 3. Create Checkout via Service
    const checkoutUrl = await DodoPaymentService.createCheckout({
      productId: productId,
      userEmail: user.email,
      userName: user.name, // FIXED: was user.full_name
      metadata: {
        userId: user.id,
        planId: planId
      }
    });

    console.log('🔗 [DEBUG] Checkout URL created:', checkoutUrl);

    res.json({ paymentUrl: checkoutUrl });
  } catch (error) {
    console.error('❌ Dodo Payment Link Error:', error);
    const errorDetail = error.response?.data?.message || error.message || 'Bilinmeyen hata';
    res.status(500).json({ error: `Ödeme hatası: ${errorDetail}` });
  }
});

/**
 * Dodo Payments Webhook
 * POST /api/payments/dodo-callback
 */
router.post('/dodo-callback', async (req, res) => {
  try {
    const event = req.body;
    console.log('🔔 Dodo Webhook Received:', event.type);

    // Verify successful payment or active subscription
    if (event.type === 'payment.succeeded' || event.type === 'subscription.active') {
      const { customer, metadata } = event.data;
      const userEmail = customer.email;
      const userId = metadata?.userId;
      const planId = metadata?.planId;

      console.log(`✅ Success payment detected for: ${userEmail}`);

      // Find user to upgrade
      const user = userId ? await User.findById(userId) : await User.findByEmail(userEmail);
      
      if (user) {
        // Apply Premium upgrade
        const isPro = planId === 'professional' || planId === 'profesyonel';
        await Subscription.createSubscription({
          userId: user.id,
          tier: isPro ? 'Profesyonel' : 'Standart',
          billingCycle: isPro ? 'yearly' : 'monthly',
          status: 'active'
        });
        console.log(`🚀 Account UPGRADED: ${user.email} -> ${planId}`);
      } else {
        console.error(`❌ User not found for email: ${userEmail}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Dodo Callback Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * SHOPİER ÖDEME ENTEGRASYONU
 */

// Ödeme Başlatma (Müşteri için)
router.post('/create-shopier-payment', async (req, res) => {
  try {
    const { productId, buyerName, buyerSurname, buyerEmail, buyerPhone, siteOwnerId } = req.body;

    // 1. Satıcının Shopier bilgilerini al
    const seller = await User.findById(siteOwnerId);
    if (!seller || !seller.shopier_api_key || !seller.shopier_api_secret) {
      return res.status(400).json({ error: 'Satıcı ödeme altyapısını henüz yapılandırmamış.' });
    }

    // 2. Ürün bilgilerini kontrol et
    const productQuery = 'SELECT * FROM products WHERE id = $1';
    const productRes = await pool.query(productQuery, [productId]);
    const product = productRes.rows[0];
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });

    // 3. Siparişi veritabanına kaydet (Statü: pending)
    const orderId = `ORD-${Date.now()}`;
    await pool.query(
      'INSERT INTO orders (id, user_id, product_id, amount, status, buyer_email, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [orderId, siteOwnerId, productId, product.price, 'pending', buyerEmail]
    );

    // 4. Shopier formunu oluştur
    const paymentForm = ShopierService.createPaymentForm(
      seller.shopier_api_key,
      seller.shopier_api_secret,
      {
        orderId: orderId,
        totalAmount: product.price,
        buyerName,
        buyerSurname,
        buyerEmail,
        buyerPhone,
        callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/shopier-callback`,
        currency: seller.shop_currency === 'USD' ? '1' : seller.shop_currency === 'EUR' ? '2' : '0'
      }
    );

    res.json(paymentForm);
  } catch (error) {
    console.error('Shopier Payment error:', error);
    res.status(500).json({ error: 'Ödeme başlatılamadı.' });
  }
});

// Shopier Callback (Ödeme Bildirimi)
router.post('/shopier-callback', async (req, res) => {
  try {
    const postData = req.body;
    const orderId = postData.res_platform_order_id;

    if (!orderId) return res.status(400).send('Missing order id');

    // 1. Siparişi bul
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderRes = await pool.query(orderQuery, [orderId]);
    const order = orderRes.rows[0];
    if (!order) return res.status(404).send('Order not found');

    // 2. Satıcıyı bul (İmza doğrulaması için Secret lazım)
    const seller = await User.findById(order.user_id);
    if (!seller) return res.status(404).send('Seller not found');

    // 3. İmzayı doğrula
    const isValid = ShopierService.verifyCallback(seller.shopier_api_secret, postData);
    if (!isValid) {
      console.error('❌ Shopier signature mismatch for order:', orderId);
      return res.status(401).send('Invalid signature');
    }

    // 4. Sipariş durumunu güncelle
    const status = postData.res_status === 'success' ? 'completed' : 'failed';
    await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, orderId]);

    console.log(`✅ Shopier Payment ${status.toUpperCase()} for order:`, orderId);

    // Shopier sistemine başarılı yanıt dön
    res.send('OK');
  } catch (error) {
    console.error('Shopier Callback error:', error);
    res.status(500).send('Internal Error');
  }
});

module.exports = router;
