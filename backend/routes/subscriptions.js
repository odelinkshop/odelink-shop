const express = require('express');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth');
const { PLAN_CATALOG } = require('../config/planCatalog');

const router = express.Router();

// Get all subscription plans
router.get('/plans/db', async (req, res) => {
  try {
    const plans = await Subscription.getAll();
    res.json({ plans });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Abonelik planları alınamadı' });
  }
});

// Get user's current subscription
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.getUserSubscription(req.userId);
    res.json({ subscription });
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(500).json({ error: 'Abonelik bilgileri alınamadı' });
  }
});

// Get user's subscription capabilities (feature gating)
router.get('/capabilities', authMiddleware, async (req, res) => {
  try {
    const capabilities = await Subscription.getUserCapabilities(req.userId);
    const { maxSites, currentSites } = await Subscription.checkSiteLimit(req.userId);
    res.json({ capabilities, siteLimit: { maxSites, currentSites } });
  } catch (error) {
    console.error('Get subscription capabilities error:', error);
    res.status(500).json({ error: 'Abonelik yetenekleri alınamadı' });
  }
});

// Public plan catalog (pricing UI consumes this)
router.get('/plans', async (req, res) => {
  try {
    // Frontend compatibility: return both catalog and plans array
    const plans = Object.entries(PLAN_CATALOG.tiers || {}).flatMap(([tierKey, tierDef]) => {
      return Object.entries(tierDef.billingCycles || {}).map(([cycleKey, cycleDef]) => {
        return {
          id: `${tierKey}_${cycleKey}`,
          tier: tierKey,
          name: tierDef.label || tierKey,
          billingCycle: cycleKey,
          price: cycleDef.price || 0,
          priceLabel: cycleDef.priceLabel || `${cycleDef.price} TL`,
          duration: cycleKey === 'yearly' ? 'yıl' : 'ay',
          capabilities: tierDef.capabilities || {},
          featureGroups: tierDef.featureGroups || []
        };
      });
    });
    
    return res.json({ 
      catalog: PLAN_CATALOG,
      plans: plans
    });
  } catch (error) {
    console.error('Get plan catalog error:', error);
    return res.status(500).json({ error: 'Planlar alınamadı' });
  }
});

// Create new subscription
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscriptionId, paymentMethodId, billingCycle } = req.body;

    if (!subscriptionId || !paymentMethodId) {
      return res.status(400).json({ 
        error: 'Abonelik ID ve ödeme yöntemi gereklidir' 
      });
    }

    const cycle = (billingCycle || 'monthly').toString().toLowerCase();
    if (cycle !== 'monthly' && cycle !== 'yearly') {
      return res.status(400).json({ error: 'Geçersiz ödeme periyodu' });
    }

    const subscription = await Subscription.createSubscription(
      req.userId, 
      subscriptionId, 
      paymentMethodId,
      cycle
    );
    
    res.status(201).json({
      message: 'Abonelik başarıyla oluşturuldu',
      subscription
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Abonelik oluşturulamadı' });
  }
});

// Cancel subscription
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.cancelSubscription(req.userId);
    
    res.json({
      message: 'Abonelik iptal edildi',
      subscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Abonelik iptal edilemedi' });
  }
});

// Renew subscription
router.post('/renew', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.renewSubscription(req.userId);
    
    res.json({
      message: 'Abonelik yenilendi',
      subscription
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ error: 'Abonelik yenilenemedi' });
  }
});

module.exports = router;
