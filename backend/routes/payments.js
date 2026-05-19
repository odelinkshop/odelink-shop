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

/**
 * Public Shopier Checkout Variation Resolver
 * GET /api/payments/shopier-checkout-data
 */
const cheerio = require('cheerio');
const axios = require('axios');

router.get('/shopier-checkout-data', async (req, res) => {
  try {
    const { url, size } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const cleanUrl = decodeURIComponent(url).trim();
    console.log(`🔍 [Shopier Checkout Parser] Fetching page: ${cleanUrl}, Size: ${size}`);

    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let shopName = null;
    let productId = null;
    let variationId = null;

    try {
      const parsedUrl = new URL(cleanUrl);
      if (parsedUrl.searchParams.has('id')) {
        productId = parsedUrl.searchParams.get('id');
      }

      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        if (!isNaN(Number(pathParts[1]))) {
          shopName = pathParts[0];
          productId = pathParts[1];
        }
      } else if (pathParts.length === 1) {
        if (!isNaN(Number(pathParts[0]))) {
          productId = pathParts[0];
        }
      }
    } catch (err) {
      console.error('URL parse error:', err.message);
    }

    if (!productId) {
      productId = $('input[name="product_id"]').val();
    }
    if (!shopName) {
      const formAction = $('#buy-form').attr('action') || '';
      if (formAction.includes('shipping/')) {
        shopName = formAction.split('shipping/')[1];
      }
    }

    if (size) {
      const targetSize = size.toString().trim().toLowerCase();
      let foundVariationId = null;
      let foundVariationName = null;

      // Svelte SPA JSON State'ten çekme denemesi (Yeni Shopier Mimarisi)
      try {
        // Dengeli süslü parantez ile JSON bloğu çıkar (catalogService.js'teki aynı mantık)
        const extractBalancedJson = (str, startIdx) => {
          if (str[startIdx] !== '{') return null;
          let depth = 0;
          let inString = false;
          let escapeNext = false;
          for (let i = startIdx; i < str.length && i < startIdx + 500000; i++) {
            if (escapeNext) { escapeNext = false; continue; }
            if (str[i] === '\\') { escapeNext = true; continue; }
            if (str[i] === '"' && !escapeNext) { inString = !inString; continue; }
            if (inString) continue;
            if (str[i] === '{') depth++;
            else if (str[i] === '}') {
              depth--;
              if (depth === 0) return str.substring(startIdx, i + 1);
            }
          }
          return null;
        };

        $('script').each((i, el) => {
          if (foundVariationId) return;
          const content = $(el).html() || '';
          if (content.length < 50) return;

          if (content.includes('"product"') || content.includes("'product'") || content.includes('product:')) {
            const assignmentRegex = /=\s*\{/g;
            let assignMatch;
            while ((assignMatch = assignmentRegex.exec(content)) !== null) {
              try {
                const jsonStr = extractBalancedJson(content, assignMatch.index + assignMatch[0].length - 1);
                if (!jsonStr || jsonStr.length < 100) continue;
                
                const data = JSON.parse(jsonStr);
                const p = data.product || data.$product || data.p;
                
                if (p && p.variations) {
                  for (let vNum = 1; vNum <= 3; vNum++) {
                    const vList = p.variations[`variation_${vNum}`] || [];
                    const vName = p.variations[`variation_${vNum}_name`] || '';
                    for (const opt of vList) {
                      const optionName = (opt.name || '').toLowerCase().trim();
                      const targetParts = targetSize.split('/').map(p => p.trim());
                      const optionParts = optionName.split('/').map(p => p.trim());
                      
                      let isMatch = false;
                      for (const tp of targetParts) {
                        for (const op of optionParts) {
                          if (tp === op || tp.includes(op) || op.includes(tp)) {
                            isMatch = true;
                            break;
                          }
                        }
                        if (isMatch) break;
                      }

                      if (isMatch) {
                        foundVariationId = opt.id;
                        foundVariationName = vName;
                        break;
                      }
                    }
                    if (foundVariationId) break;
                  }
                }
              } catch (jsonErr) {
                // Ignore parse error and continue
              }
            }
          }
        });
      } catch (err) {
        console.error('Variation JSON parse error:', err.message);
      }

      variationId = foundVariationId;
      variationName = foundVariationName;

      // Legacy HTML Select Element Fallback (Eski Shopier Mimarisi)
      if (!variationId) {
        const selectElement = $('select'); 
        selectElement.find('option').each((i, el) => {
          const optionText = $(el).text().trim().toLowerCase();
          const optionValue = $(el).attr('value');
          
          if (!optionText || optionValue === '-1' || !optionValue) return;
          
          const targetParts = targetSize.split('/').map(p => p.trim());
          const optionParts = optionText.split('/').map(p => p.trim());
          
          let isMatch = false;
          for (const tp of targetParts) {
            for (const op of optionParts) {
              if (tp === op || tp.includes(op) || op.includes(tp)) {
                isMatch = true;
                break;
              }
            }
            if (isMatch) break;
          }
          
          if (isMatch) {
            variationId = optionValue;
            const selectName = selectElement.attr('name') || '';
            variationName = selectName.toLowerCase().includes('renk') ? 'Renk' : 'Beden';
            return false;
          }
        });
      }
    }

    res.json({
      success: true,
      shopName,
      productId,
      variationId,
      variationName
    });

  } catch (error) {
    console.error('❌ Shopier checkout data error:', error.message);
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
