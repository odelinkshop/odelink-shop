/**
 * PAYMENT ROUTES
 * Dodo Payments integration - Payment link creation, status, history, and webhook handling
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { dodoPaymentsService } = require('../services/dodoPaymentsService');
const EmailNotificationService = require('../services/emailNotificationService');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const AdvertisementCredit = require('../models/AdvertisementCredit');
const User = require('../models/User');
const crypto = require('crypto');

// Rate limiters for payment endpoints
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: 'Çok fazla ödeme isteği. Lütfen bir dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: 'Webhook rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false
});

// Product mapping configuration
const SUBSCRIPTION_PRODUCTS = {
  standard_monthly: {
    tier: 'standart',
    billingCycle: 'monthly',
    amount: 299,
    dodoProductId: process.env.DODO_PRODUCT_STANDARD_MONTHLY || 'prod_standard_monthly'
  },
  professional_yearly: {
    tier: 'profesyonel',
    billingCycle: 'yearly',
    amount: 399,
    dodoProductId: process.env.DODO_PRODUCT_PROFESSIONAL_YEARLY || 'prod_professional_yearly'
  }
};

const AD_PACKAGES = {
  ad_basic: {
    name: 'Başlangıç',
    amount: 500,
    creditAmount: 500,
    dodoProductId: process.env.DODO_PRODUCT_AD_BASIC || 'prod_ad_basic'
  },
  ad_professional: {
    name: 'Profesyonel',
    amount: 1200,
    creditAmount: 1200,
    dodoProductId: process.env.DODO_PRODUCT_AD_PROFESSIONAL || 'prod_ad_professional'
  },
  ad_premium: {
    name: 'Premium',
    amount: 2500,
    creditAmount: 2500,
    dodoProductId: process.env.DODO_PRODUCT_AD_PREMIUM || 'prod_ad_premium'
  }
};

/**
 * Create payment link
 * POST /api/payments/create-link
 */
router.post('/create-link', authMiddleware, paymentLimiter, async (req, res) => {
  try {
    const { productType, productId, tier, billingCycle } = req.body;
    const userId = req.userId;

    // Validate required parameters
    if (!productType || !productId) {
      return res.status(400).json({
        error: 'productType ve productId gereklidir'
      });
    }

    if (!['subscription', 'ad_package'].includes(productType)) {
      return res.status(400).json({
        error: 'Geçersiz productType. "subscription" veya "ad_package" olmalıdır'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    let amount, dodoProductId, metadata;

    // Determine product details based on type
    if (productType === 'subscription') {
      const product = SUBSCRIPTION_PRODUCTS[productId];
      if (!product) {
        return res.status(400).json({ error: 'Geçersiz abonelik ürünü' });
      }

      amount = product.amount;
      dodoProductId = product.dodoProductId;
      metadata = {
        user_id: userId,
        product_type: productType,
        product_id: productId,
        tier: product.tier,
        billing_cycle: product.billingCycle,
        successUrl: `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
      };
    } else if (productType === 'ad_package') {
      const adPackage = AD_PACKAGES[productId];
      if (!adPackage) {
        return res.status(400).json({ error: 'Geçersiz reklam paketi' });
      }

      amount = adPackage.amount;
      dodoProductId = adPackage.dodoProductId;
      metadata = {
        user_id: userId,
        product_type: productType,
        product_id: productId,
        credit_amount: adPackage.creditAmount,
        successUrl: `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
      };
    }

    // Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create payment record in database
    const payment = await Payment.create({
      userId,
      transactionId,
      amount,
      productType,
      productId,
      tier: metadata.tier || null,
      billingCycle: metadata.billing_cycle || null,
      currency: 'TRY',
      metadata
    });

    console.log('💳 Payment record created:', {
      transactionId,
      userId,
      productType,
      amount
    });

    // Create checkout session with Dodo Payments
    const { checkoutUrl, sessionId } = await dodoPaymentsService.createCheckoutSession({
      productId: dodoProductId,
      amount,
      productType,
      customer: {
        email: user.email,
        name: user.name || user.email
      },
      metadata: {
        ...metadata,
        transaction_id: transactionId
      }
    });

    console.log('✅ Payment link created:', {
      transactionId,
      sessionId,
      checkoutUrl
    });

    res.json({
      success: true,
      paymentUrl: checkoutUrl,
      transactionId,
      sessionId
    });

  } catch (error) {
    console.error('❌ Payment link creation error:', error);
    res.status(500).json({
      error: error.message || 'Ödeme bağlantısı oluşturulamadı'
    });
  }
});

/**
 * Get payment status
 * GET /api/payments/status/:transactionId
 */
router.get('/status/:transactionId', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId;

    const payment = await Payment.findByTransactionId(transactionId);

    if (!payment) {
      return res.status(404).json({ error: 'Ödeme kaydı bulunamadı' });
    }

    // Verify user owns this payment
    if (payment.user_id !== userId) {
      return res.status(403).json({ error: 'Bu ödeme kaydına erişim yetkiniz yok' });
    }

    // If payment is still pending after 10 minutes, query Dodo Payments API
    const createdAt = new Date(payment.created_at);
    const now = new Date();
    const minutesSinceCreation = (now - createdAt) / (1000 * 60);

    if (payment.status === 'pending' && minutesSinceCreation > 10 && payment.dodo_transaction_id) {
      try {
        const dodoStatus = await dodoPaymentsService.getPaymentStatus(payment.dodo_transaction_id);
        
        // Update local payment status if it changed
        if (dodoStatus.status !== payment.status) {
          await Payment.updateStatus(transactionId, dodoStatus.status, {
            paymentMethod: dodoStatus.paymentMethod,
            paymentDate: dodoStatus.paymentDate
          });
          
          payment.status = dodoStatus.status;
          payment.payment_method = dodoStatus.paymentMethod;
          payment.payment_date = dodoStatus.paymentDate;
        }
      } catch (error) {
        console.error('⚠️ Failed to query Dodo Payments status:', error.message);
        // Continue with local status
      }
    }

    res.json({
      status: payment.status,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      productType: payment.product_type,
      productId: payment.product_id,
      paymentDate: payment.payment_date,
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at
    });

  } catch (error) {
    console.error('❌ Payment status query error:', error);
    res.status(500).json({
      error: error.message || 'Ödeme durumu sorgulanamadı'
    });
  }
});

/**
 * Get payment history (user)
 * GET /api/payments/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Payment.getUserPayments(userId, { page, limit });

    res.json(result);

  } catch (error) {
    console.error('❌ Payment history query error:', error);
    res.status(500).json({
      error: error.message || 'Ödeme geçmişi alınamadı'
    });
  }
});

/**
 * Admin: Get all payments with filtering
 * GET /api/payments/admin/all
 */
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      userId,
      status,
      productType,
      startDate,
      endDate,
      page,
      limit
    } = req.query;

    const filters = {
      userId: userId || undefined,
      status: status || undefined,
      productType: productType || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await Payment.getAllPayments(filters);

    res.json(result);

  } catch (error) {
    console.error('❌ Admin payment query error:', error);
    res.status(500).json({
      error: error.message || 'Ödemeler alınamadı'
    });
  }
});

/**
 * Admin: Manually complete payment
 * POST /api/payments/admin/complete/:transactionId
 */
router.post('/admin/complete/:transactionId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const adminUserId = req.userId;

    const payment = await Payment.findByTransactionId(transactionId);

    if (!payment) {
      return res.status(404).json({ error: 'Ödeme kaydı bulunamadı' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ error: 'Ödeme zaten tamamlanmış' });
    }

    // Update payment status
    await Payment.updateStatus(transactionId, 'completed', {
      paymentMethod: 'manual_admin',
      paymentDate: new Date()
    });

    // Process payment (activate subscription or add credits)
    await processSuccessfulPayment(payment);

    console.log('✅ Admin manually completed payment:', {
      transactionId,
      adminUserId,
      userId: payment.user_id
    });

    res.json({
      success: true,
      message: 'Ödeme manuel olarak tamamlandı'
    });

  } catch (error) {
    console.error('❌ Admin payment completion error:', error);
    res.status(500).json({
      error: error.message || 'Ödeme tamamlanamadı'
    });
  }
});

/**
 * Webhook endpoint for Dodo Payments
 * POST /api/payments/webhook/dodo
 * Note: This endpoint needs raw body for signature verification
 */
router.post('/webhook/dodo', webhookLimiter, async (req, res) => {
  try {
    // Get raw body - Express should have already parsed it as JSON
    const rawBody = JSON.stringify(req.body);
    const headers = req.headers;

    console.log('📥 Webhook received:', {
      webhookId: headers['webhook-id'],
      timestamp: headers['webhook-timestamp']
    });

    // Verify webhook signature
    const isValid = dodoPaymentsService.verifyWebhookSignature(rawBody, headers);

    if (!isValid) {
      console.error('❌ Webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Parse webhook payload
    const event = dodoPaymentsService.parseWebhookPayload(rawBody);

    console.log('📦 Webhook event:', {
      type: event.eventType,
      businessId: event.businessId
    });

    // Check idempotency - prevent duplicate processing
    const dodoTransactionId = event.data?.payment_id || event.data?.id;
    
    if (dodoTransactionId) {
      const existingPayment = await Payment.findByDodoTransactionId(dodoTransactionId);
      
      if (existingPayment && existingPayment.status !== 'pending') {
        console.log('✅ Webhook already processed (idempotent):', dodoTransactionId);
        return res.status(200).json({ received: true, idempotent: true });
      }
    }

    // Process webhook based on event type
    if (event.eventType === 'payment.succeeded') {
      await handleSuccessfulPayment(event);
    } else if (event.eventType === 'payment.failed') {
      await handleFailedPayment(event);
    } else {
      console.log('⚠️ Unhandled webhook event type:', event.eventType);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Return 200 to prevent Dodo Payments from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * Handle successful payment webhook
 */
async function handleSuccessfulPayment(event) {
  const paymentData = event.data;
  const dodoTransactionId = paymentData.payment_id || paymentData.id;
  const metadata = paymentData.metadata || {};
  const transactionId = metadata.transaction_id;

  console.log('✅ Processing successful payment:', {
    dodoTransactionId,
    transactionId,
    amount: paymentData.amount
  });

  // Find payment record
  let payment;
  if (transactionId) {
    payment = await Payment.findByTransactionId(transactionId);
  }

  if (!payment) {
    console.error('❌ Payment record not found:', transactionId);
    throw new Error('Payment record not found');
  }

  // Update payment status
  await Payment.updateStatus(transactionId, 'completed', {
    dodoTransactionId,
    paymentMethod: paymentData.payment_method || 'card',
    paymentDate: new Date(paymentData.payment_date || paymentData.paid_at || Date.now())
  });

  // Process payment (activate subscription or add credits)
  await processSuccessfulPayment(payment);

  console.log('✅ Successful payment processed:', transactionId);
}

/**
 * Handle failed payment webhook
 */
async function handleFailedPayment(event) {
  const paymentData = event.data;
  const dodoTransactionId = paymentData.payment_id || paymentData.id;
  const metadata = paymentData.metadata || {};
  const transactionId = metadata.transaction_id;
  const failureReason = paymentData.failure_reason || paymentData.error_message || 'Payment failed';

  console.log('❌ Processing failed payment:', {
    dodoTransactionId,
    transactionId,
    failureReason
  });

  // Find payment record
  let payment;
  if (transactionId) {
    payment = await Payment.findByTransactionId(transactionId);
  }

  if (!payment) {
    console.error('❌ Payment record not found:', transactionId);
    throw new Error('Payment record not found');
  }

  // Update payment status
  await Payment.updateStatus(transactionId, 'failed', {
    dodoTransactionId,
    failureReason
  });

  // Send failure notification email
  try {
    const user = await User.findById(payment.user_id);
    if (user) {
      await EmailNotificationService.sendPaymentFailure({
        userEmail: user.email,
        userName: user.name || user.email,
        productType: payment.product_type,
        failureReason,
        transactionId: payment.transaction_id
      });
    }
  } catch (emailError) {
    console.error('⚠️ Failed to send payment failure email:', emailError.message);
    // Don't throw - email failure shouldn't block webhook processing
  }

  console.log('✅ Failed payment processed:', transactionId);
}

/**
 * Process successful payment - activate subscription or add credits
 */
async function processSuccessfulPayment(payment) {
  const userId = payment.user_id;
  const productType = payment.product_type;

  // Get user details for email
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  if (productType === 'subscription') {
    // Activate subscription
    const tier = payment.tier;
    const billingCycle = payment.billing_cycle;

    console.log('🔄 Activating subscription:', {
      userId,
      tier,
      billingCycle
    });

    // Find subscription plan
    const plans = await Subscription.getAll();
    const planName = tier === 'profesyonel' ? 'Profesyonel' : 'Standart';
    const plan = plans.find(p => p.name === planName);

    if (!plan) {
      throw new Error(`Subscription plan not found: ${planName}`);
    }

    // Create subscription
    await Subscription.createSubscription(
      userId,
      plan.id,
      'dodo_payments',
      billingCycle
    );

    console.log('✅ Subscription activated:', {
      userId,
      planId: plan.id,
      tier,
      billingCycle
    });

    // Send confirmation email
    try {
      await EmailNotificationService.sendSubscriptionConfirmation({
        userEmail: user.email,
        userName: user.name || user.email,
        tier,
        billingCycle,
        amount: parseFloat(payment.amount),
        transactionId: payment.transaction_id
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send subscription confirmation email:', emailError.message);
      // Don't throw - email failure shouldn't block payment processing
    }

  } else if (productType === 'ad_package') {
    // Add advertisement credits
    const metadata = payment.metadata || {};
    const creditAmount = metadata.credit_amount || parseFloat(payment.amount);

    console.log('🔄 Adding advertisement credits:', {
      userId,
      creditAmount
    });

    const creditRecord = await AdvertisementCredit.addCredit(
      userId,
      creditAmount,
      'purchase',
      payment.id,
      `Reklam paketi satın alımı: ${payment.product_id}`
    );

    const newBalance = parseFloat(creditRecord.balance_after);

    console.log('✅ Advertisement credits added:', {
      userId,
      creditAmount,
      newBalance
    });

    // Determine package name
    const packageNames = {
      'ad_basic': 'Başlangıç',
      'ad_professional': 'Profesyonel',
      'ad_premium': 'Premium'
    };
    const packageName = packageNames[payment.product_id] || 'Reklam Paketi';

    // Send credit confirmation email
    try {
      await EmailNotificationService.sendCreditConfirmation({
        userEmail: user.email,
        userName: user.name || user.email,
        packageName,
        creditAmount,
        newBalance,
        transactionId: payment.transaction_id
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send credit confirmation email:', emailError.message);
      // Don't throw - email failure shouldn't block payment processing
    }
  }
}

module.exports = router;
