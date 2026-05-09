const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const DodoPaymentService = require('../services/dodoPaymentService');

// Import auth middleware
const auth = require('../middleware/auth');

/**
 * Create Dodo Checkout Link
 * POST /api/payments/create-link
 */
router.post('/create-link', auth, async (req, res) => {
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

module.exports = router;
