/**
 * SITES ROUTES - SIFIRDAN YENİ VERSİYON
 * Sadece temel CRUD - Karmaşık logic YOK
 */

const express = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const Site = require('../models/Site');
const User = require('../models/User');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const AutoBuildJobStore = require('../models/AutoBuildJobStore');
const AnalyticsStore = require('../models/AnalyticsStore');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const { fetchShopierCatalog, normalizeShopierUrl, enrichCatalogProductsWithDetails, fetchProductDetail } = require('../services/shopierCatalogService');
const { fetchProductsFromShopierAPI, verifyShopierToken, fetchAllProductsFromShopierAPI, fetchShopierSettings } = require('../services/shopierApiService');
const { newJobId } = require('../services/siteCreationJobWorker');
const { addDnsRecord, deleteDnsRecord } = require('../services/cloudflareService');
const CacheService = require('../services/cacheService');
const multer = require('multer');
const xlsx = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

const requireAccess = async (req, res, next) => {
  try {
    const caps = await Subscription.getUserCapabilities(req.userId);
    req.capabilities = caps || {};
    return next();
  } catch (e) {
    console.error('❌ Package check error:', e);
    req.capabilities = {};
    return next();
  }
};

const POLICY_KEYS = ['privacy', 'terms', 'returns', 'shipping', 'kvkk', 'cookies'];
const pickPolicies = (raw) => {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  POLICY_KEYS.forEach((k) => {
    out[k] = (src?.[k] == null ? '' : String(src[k])).slice(0, 10000);
  });
  return out;
};

// Validation schemas
// YENİ AKIŞ: Sadece `shopierUrl` zorunlu. `name` ve `apiKey` opsiyonel/türetilir.
// Shopier mağaza linki yeterli — ürünler scraping ile otomatik çekilir.
const createSiteSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  subdomain: Joi.string().min(3).max(30).required(),
  shopierUrl: Joi.string().allow('').optional(),
  apiKey: Joi.string().allow('').optional(),
  settings: Joi.object().unknown(true).default({})
});

// --- 2026 Basit Mağaza Oluşturma (Sadece Subdomain) ---
router.post('/create-simple', authMiddleware, async (req, res) => {
  try {
    const { subdomain } = req.body;
    
    if (!subdomain) return res.status(400).json({ error: 'Mağaza adı (subdomain) gereklidir.' });
    
    // Temizleme ve Kontrol
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // Mükerrer Kontrolü
    const existing = await pool.query('SELECT id FROM sites WHERE subdomain = $1', [cleanSubdomain]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu mağaza adı zaten alınmış. Başka bir tane dene.' });
    }

    const newSite = await Site.create({
      userId: req.userId,
      name: subdomain.toUpperCase() + " MAĞAZASI",
      subdomain: cleanSubdomain,
      settings: {
        theme: 'nova-premium',
        primaryColor: '#2563eb', // Electric Cobalt Blue
        heroTitle: 'Hoş Geldiniz',
        description: 'En yeni ürünlerimiz burada.'
      }
    });

    res.status(201).json({
      success: true,
      siteId: newSite.id,
      subdomain: newSite.subdomain,
      message: 'Mağazanız saniyeler içinde hazırlandı!'
    });

  } catch (error) {
    console.error('❌ Simple Create Error:', error);
    res.status(500).json({ error: 'Mağaza oluşturulurken bir hata oluştu.' });
  }
});


// --- API ile Mağaza Oluştur (Resmi Shopier API) ---
router.post('/create-from-api', authMiddleware, requireAccess, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'Shopier API anahtarı zorunludur.' });

    console.log(`🔑 [${req.userId}] API ile mağaza kurma isteği...`);

    // 1. Önce Mağaza Ayarlarını Çek (Bu genelde 403 vermez)
    let shopSettings = null;
    let settingsError = null;
    try {
      shopSettings = await fetchShopierSettings(apiKey);
    } catch (e) {
      settingsError = e.message;
      console.error('❌ API Settings Fetch Error:', e.message);
    }

    const shopierUrl = shopSettings?.url || '';
    const shopName = shopSettings?.name || "MAĞAZAM";
    const shopSlug = (shopierUrl || '').split('/').pop() || "magaza-" + Math.random().toString(36).substring(2, 7);

    console.log(`📡 Mağaza Bilgileri Alındı: ${shopName} (URL: ${shopierUrl}, Slug: ${shopSlug})`);

    let products = [];
    let apiError = null;
    
    // 2. API'den ürünleri çekmeye çalış (URL varsa)
    if (shopierUrl) {
      try {
        console.log('🚀 API ile ürün çekme denemesi başlatılıyor...');
        const apiProducts = await fetchAllProductsFromShopierAPI(shopierUrl, apiKey);
        if (apiProducts && apiProducts.length > 0) {
          products = apiProducts;
          console.log(`✅ API ile ${products.length} ürün çekildi.`);
        } else {
          console.log('⚠️ API ürün döndürmedi (boş veya null).');
        }
      } catch (apiErr) {
        apiError = apiErr.message;
        console.error('⚠️ API ürün çekme hatası:', apiErr.message);
      }
    } else {
      console.log('⚠️ Shopier URL boş, API ürün çekme atlanıyor.');
    }
    
    // 3. EĞER API ÜRÜNLERİ VERMEZSE (403 veya Boş), SCRAPING İLE ÇEK (HİBRİT FALLBACK)
    let scrapeResult = null;
    if (!products || products.length === 0) {
      if (shopierUrl) {
        console.log(`🕷️ Scraper Devreye Giriyor: ${shopierUrl}`);
        try {
          scrapeResult = await fetchShopierCatalog(shopierUrl, {
            skipDetails: true,
            bypassCache: true
          });
          
          console.log('🔍 Scraper Sonucu Alındı:', JSON.stringify(scrapeResult?.debug));
          
          // Scraper sonucunu güvenli bir şekilde ayıkla
          const scrapedProducts = Array.isArray(scrapeResult) ? scrapeResult : (scrapeResult?.products || []);
          console.log(`🔍 Scraped Products Count: ${scrapedProducts.length}`);
          
          if (scrapedProducts.length > 0) {
            products = scrapedProducts;
            console.log(`✅ Scraper ile ${products.length} ürün çekildi.`);
          } else {
            console.warn('⚠️ Scraper hiç ürün bulamadı. Hata:', scrapeResult?.debug?.error);
          }
        } catch (scrapeErr) {
          console.error('❌ Scraper Hatası:', scrapeErr.message);
        }
      } else {
        console.error('❌ Shopier URL bulunamadı, scraper çalıştırılamıyor.');
      }
    }
    
    console.log(`🏁 Final Ürün Sayısı: ${products.length}`);
    
    if (!products || products.length === 0) {
      return res.status(400).json({ 
        error: 'Ürünler çekilemedi',
        message: 'Shopier mağazanızdan ürünler ne API ne de Scraper ile çekilemedi.',
        debug: {
          scraperError: scrapeResult?.debug?.error || 'Bilinmeyen scraper hatası',
          settingsError: settingsError,
          apiError: apiError,
          shopierUrl: shopierUrl
        }
      });
    }

    const clampSubdomain = (raw) => {
      const cleaned = (raw || '').toString().trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
      return (cleaned || 'magaza').slice(0, 30);
    };

    let subdomain = clampSubdomain(shopSlug);
    const existing = await Site.findBySubdomain(subdomain);
    if (existing) {
      subdomain = clampSubdomain(subdomain + '-' + Math.random().toString(36).substring(2, 5));
    }

    // 3. Siteyi oluştur veya güncelle
    const productCount = Array.isArray(products) ? products.length : 0;
    const siteData = {
      userId: req.userId,
      name: shopName,
      shopierUrl: shopierUrl,
      subdomain,
      status: 'active',
      settings: {
        created_at: new Date().toISOString(),
        products_data: Array.isArray(products) ? products : [],
        catalog_total_products: productCount,
        catalog_enrichment_status: 'api_loaded',
        catalog_full_sync_complete: true,
        catalog_refreshed_at: new Date().toISOString(),
        last_sync_method: 'shopier_api',
        api_key: apiKey,
        // KURUMSAL KARANLIK MOD VARSAYILANLARI (CRYSTAL DARK)
        theme: 'dark',
        bg_color: '#050505',
        text_color: '#F2EBE1',
        accent_color: '#C5A059',
        nav_style: 'minimal',
        font_family: 'serif'
      }
    };

    const existingSites = await Site.findByUserId(req.userId);
    let site;

    if (existingSites && existingSites.length > 0) {
      site = existingSites[0];
      const currentSettings = site.settings || {};
      await Site.update(site.id, {
        settings: {
          ...currentSettings,
          ...siteData.settings
        }
      });
    } else {
      site = await Site.create(siteData);
    }

    // DNS Ekle
    setImmediate(async () => {
      try { await addDnsRecord(site.subdomain); } catch (e) { console.error('DNS Error:', e); }
    });

    return res.json({
      siteId: site.id,
      subdomain: site.subdomain,
      productCount,
      message: productCount > 0 ? `${productCount} Ürün Başarıyla Çekildi ve Mağazanız Hazır!` : 'Ürün bulunamadı, lütfen Shopier API anahtarınızı kontrol edin.'
    });

  } catch (error) {
    console.error('❌ Create site from API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası: Mağaza kurulamadı.' });
  }
});

// --- Policies (authenticated) ---
router.get('/:id/policies', authMiddleware, requireAccess, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    const settings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
    const policies = pickPolicies(settings?.policies || {});
    return res.json({ policies });
  } catch (error) {
    console.error('❌ Get site policies error:', error);
    return res.status(500).json({ error: 'Politikalar alınamadı' });
  }
});

router.get('/jobs/:jobId', authMiddleware, requireAccess, async (req, res) => {
  try {
    const jobId = (req.params.jobId || '').toString().trim();
    if (!jobId) return res.status(400).json({ error: 'Geçersiz job' });
    let job = await AutoBuildJobStore.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job bulunamadı' });
    if ((job.userId || '').toString() !== (req.userId || '').toString()) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }

    // If the background worker is not running, jobs can get stuck in 'queued'.
    // Kick-start the job on first poll by atomically claiming it and running in background.
    try {
      const status = (job?.status || '').toString().toLowerCase();
      if (status === 'queued') {
        const claimed = await AutoBuildJobStore.claimQueuedJobById(jobId);
        if (claimed?.jobId) {
          job = claimed;
          const { runOneJob } = require('../services/siteCreationJobWorker');
          setImmediate(() => {
            runOneJob(claimed).catch(() => void 0);
          });
        }
      }
    } catch (kickErr) {
      void kickErr;
    }

    return res.json({ ok: true, job });
  } catch (e) {
    return res.status(500).json({ error: 'Job alınamadı' });
  }
});

/**
 * GET /api/sites/public/:subdomain/product-detail?url=<productUrl>
 * On-demand Shopier detail fetch for a single product. Used by Quick View to avoid showing "Tek beden" when
 * the catalog was not fully enriched.
 */
router.get('/public/:subdomain/product-detail', async (req, res) => {
  try {
    const subdomain = (req.params.subdomain || '').toString().trim().toLowerCase();
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain gerekli' });
    }

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    const settings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
    const shopierUrl = (site?.shopier_url || settings?.shopier_url || settings?.shopierUrl || '').toString().trim();
    const normalizedShopierUrl = normalizeShopierUrl(shopierUrl);
    if (!normalizedShopierUrl) {
      return res.status(400).json({ error: 'Shopier URL bulunamadı' });
    }

    const productUrl = (req.query?.url || '').toString().trim();
    if (!productUrl) {
      return res.status(400).json({ error: 'Ürün URL gerekli' });
    }

    const keyOf = (raw) => {
      try {
        const u = new URL((raw || '').toString());
        u.hash = '';
        u.search = '';
        return u.toString().toLowerCase();
      } catch (e) {
        void e;
        return (raw || '').toString().trim().toLowerCase().split('#')[0].split('?')[0];
      }
    };

    // Fetch detail from Shopier (may take a few seconds)
    const detail = await fetchProductDetail(productUrl, normalizedShopierUrl);
    if (!detail) {
      return res.status(404).json({ error: 'Ürün detayı alınamadı' });
    }

    // Persist into products_data (best-effort)
    try {
      const productsData = Array.isArray(settings?.products_data) ? settings.products_data : [];
      const dKey = keyOf(detail?.url || productUrl);
      if (productsData.length && dKey) {
        let changed = false;
        const next = productsData.map((p) => {
          if (!p || typeof p !== 'object') return p;
          const pKey = keyOf(p?.url);
          if (!pKey || pKey !== dKey) return p;
          const merged = { ...p };

          if (!merged.description && detail.description) { merged.description = detail.description; changed = true; }
          if ((!Array.isArray(merged.images) || merged.images.length === 0) && Array.isArray(detail.images) && detail.images.length) {
            merged.images = detail.images;
            changed = true;
          }
          if ((!Array.isArray(merged.sizes) || merged.sizes.length === 0) && Array.isArray(detail.sizes) && detail.sizes.length) {
            merged.sizes = detail.sizes;
            changed = true;
          }
          if (!merged.image && detail.image) { merged.image = detail.image; changed = true; }
          if (!merged.imageUrl && detail.image) { merged.imageUrl = detail.image; changed = true; }
          if (!merged.price && detail.price) { merged.price = detail.price; changed = true; }
          if (!merged.oldPrice && detail.oldPrice) { merged.oldPrice = detail.oldPrice; changed = true; }
          if (merged.discountPercent == null && detail.discountPercent != null) { merged.discountPercent = detail.discountPercent; changed = true; }

          return merged;
        });

        if (changed) {
          await Site.update(site.id, {
            settings: {
              products_data: next,
              catalog_refreshed_at: new Date().toISOString(),
              shopier_url: normalizedShopierUrl,
              shopierUrl: normalizedShopierUrl
            }
          });
        }
      }
    } catch (persistErr) {
      console.error('❌ product-detail persist error:', persistErr);
    }

    return res.json({ ok: true, detail });
  } catch (error) {
    console.error('❌ product-detail error:', error);
    return res.status(500).json({ error: 'Ürün detayı alınamadı' });
  }
});

/**
 * GET /api/sites/proxy-image?url=<shopierCdnUrl>
 * Proxies Shopier images to bypass hotlinking protection
 */
router.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = (req.query?.url || '').toString().trim();
    if (!imageUrl) return res.status(400).send('URL gerekli');
    
    if (!imageUrl.includes('cdn.shopier.app')) {
      return res.status(403).send('Sadece Shopier resimleri proxy edilebilir');
    }

    const axios = require('axios');
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'Referer': 'https://www.shopier.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    response.data.pipe(res);
  } catch (error) {
    console.error('❌ Image Proxy Error:', error.message);
    res.status(500).send('Resim yüklenemedi');
  }
});

router.put('/:id/policies', authMiddleware, requireAccess, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    const policies = pickPolicies(req.body || {});
    await Site.update(site.id, {
      settings: {
        policies
      }
    });

    return res.json({ ok: true, policies });
  } catch (error) {
    console.error('❌ Update site policies error:', error);
    return res.status(500).json({ error: 'Politikalar kaydedilemedi' });
  }
});

const updateSiteSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  shopierUrl: Joi.string().min(3).max(500).optional(),
  customDomain: Joi.string().allow('').max(500).optional(),
  // Theme field removed - no longer needed
  status: Joi.string().valid('active', 'inactive').optional(),
  settings: Joi.object().unknown(true).optional()
});

const buildTransporter = async () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    const err = new Error('EMAIL yapılandırması eksik');
    err.code = 'EMAIL_MISCONFIG';
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.verify();
  return transporter;
};

const extractContactEmailForSite = (site) => {
  try {
    const settings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
    const contact = (settings?.contact && typeof settings.contact === 'object') ? settings.contact : {};
    const email = (contact?.email || '').toString().trim();
    return email;
  } catch (e) {
    return '';
  }
};

/**
 * GET /api/sites
 * Kullanıcının tüm sitelerini getir
 */
router.get('/', authMiddleware, requireAccess, async (req, res) => {
  try {
    const sites = await Site.findByUserId(req.userId);
    return res.json({ sites: sites || [] });
  } catch (error) {
    console.error('❌ Get sites error:', error);
    return res.status(500).json({ error: 'Siteler alınamadı' });
  }
});

/**
 * GET /api/sites/:id/analytics
 * Site analytics summary
 */
router.get('/:id/analytics', authMiddleware, async (req, res) => {
  try {
    const caps = await Subscription.getUserCapabilities(req.userId).catch(() => null);
    if (!caps?.tier) {
      return res.status(403).json({ error: 'Deneme süreniz bitti. Plan satın alınız.', code: 'PAYWALL' });
    }

    await AnalyticsStore.ensureSchema();
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }
    if (site.user_id !== req.userId) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }
    const analyticsLevel = (caps?.analyticsLevel || 'basic').toString().trim().toLowerCase();
    const allowAdvancedAnalytics = analyticsLevel === 'advanced';

    const daysRaw = Number(req.query?.days || 30);
    const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(365, Math.floor(daysRaw))) : 30;

    const seriesRes = await pool.query(
      `
      SELECT date, page_views, unique_visitors, clicks
      FROM site_analytics
      WHERE site_id = $1
        AND date >= (CURRENT_DATE - (($2::text || ' days')::interval))
      ORDER BY date DESC
      `,
      [site.id, days]
    );
    const rows = Array.isArray(seriesRes.rows) ? seriesRes.rows : [];
    const series = rows.map((r) => ({
      date: r?.date,
      pageViews: Number(r?.page_views || 0),
      uniqueVisitors: Number(r?.unique_visitors || 0),
      clicks: Number(r?.clicks || 0)
    }));

    const totals = series.reduce((acc, r) => ({
      pageViews: acc.pageViews + (Number(r.pageViews) || 0),
      uniqueVisitors: acc.uniqueVisitors + (Number(r.uniqueVisitors) || 0),
      clicks: acc.clicks + (Number(r.clicks) || 0)
    }), { pageViews: 0, uniqueVisitors: 0, clicks: 0 });

    const subdomain = (site.subdomain || '').toString().trim().toLowerCase();
    const activeVisitors = subdomain
      ? await AnalyticsStore.getActiveVisitorCountByPrefix(subdomain, { activeWindowMs: 60 * 1000, maxTrackMs: 10 * 60 * 1000 })
      : 0;

    const breakdowns = allowAdvancedAnalytics ? await AnalyticsStore.getBreakdowns({ siteId: site.id, days }) : {};
    const topProducts = allowAdvancedAnalytics ? await AnalyticsStore.getTopProducts({ siteId: site.id, days }) : [];
    const realtimeWindow = allowAdvancedAnalytics ? await AnalyticsStore.getRealtimeWindow({ siteId: site.id, windowSeconds: 10 * 60 }) : [];
    const realtimeEvents = allowAdvancedAnalytics ? await AnalyticsStore.getRealtimeEvents({ siteId: site.id, limit: 100 }) : [];

    return res.json({
      days,
      totals,
      series,
      breakdowns,
      topProducts,
      realtime: {
        activeVisitors,
        windowSeconds: 60,
        window: realtimeWindow,
        events: realtimeEvents
      }
    });
  } catch (error) {
    console.error('❌ Get site analytics error:', error);
    return res.status(500).json({
      error: 'Analitik verisi alinamadi',
      details: (error?.message || String(error)).toString().slice(0, 220)
    });
  }
});

/**
 * GET /api/sites/:id/heatmap
 * Heatmap click data
 */
router.get('/:id/heatmap', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    const daysRaw = Number(req.query?.days || 7);
    const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(365, Math.floor(daysRaw))) : 7;

    const heatmap = await AnalyticsStore.getHeatmapData({ siteId: site.id, days });
    return res.json({ ok: true, heatmap });
  } catch (error) {
    console.error('❌ Get site heatmap error:', error);
    return res.status(500).json({ error: 'Isı haritası verisi alınamadı' });
  }
});

/**
 * GET /api/sites/:id/ai-insights
 * AI-powered insights for the site
 */
router.get('/:id/ai-insights', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    const AIInsightsService = require('../services/aiInsightsService');
    const insights = await AIInsightsService.generateInsights(site.id);
    
    return res.json({ ok: true, insights });
  } catch (error) {
    console.error('❌ Get site AI insights error:', error);
    return res.status(500).json({ error: 'AI analizleri alınamadı' });
  }
});

router.get('/:id/analytics/stream', authMiddleware, async (req, res) => {
  try {
    const caps = await Subscription.getUserCapabilities(req.userId).catch(() => null);
    if (!caps?.tier) {
      return res.status(403).json({ error: 'Deneme süreniz bitti. Plan satın alınız.', code: 'PAYWALL' });
    }

    await AnalyticsStore.ensureSchema();
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }
    if (site.user_id !== req.userId) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }
    const analyticsLevel = (caps?.analyticsLevel || 'basic').toString().trim().toLowerCase();
    const allowAdvancedAnalytics = analyticsLevel === 'advanced';

    const daysRaw = Number(req.query?.days || 30);
    const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(365, Math.floor(daysRaw))) : 30;
    const subdomain = (site.subdomain || '').toString().trim().toLowerCase();

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = async () => {
      const seriesRes = await pool.query(
        `
        SELECT date, page_views, unique_visitors, clicks
        FROM site_analytics
        WHERE site_id = $1
          AND date >= (CURRENT_DATE - (($2::text || ' days')::interval))
        ORDER BY date DESC
        `,
        [site.id, days]
      );
      const rows = Array.isArray(seriesRes.rows) ? seriesRes.rows : [];
      const series = rows.map((r) => ({
        date: r?.date,
        pageViews: Number(r?.page_views || 0),
        uniqueVisitors: Number(r?.unique_visitors || 0),
        clicks: Number(r?.clicks || 0)
      }));
      const totals = series.reduce((acc, r) => ({
        pageViews: acc.pageViews + (Number(r.pageViews) || 0),
        uniqueVisitors: acc.uniqueVisitors + (Number(r.uniqueVisitors) || 0),
        clicks: acc.clicks + (Number(r.clicks) || 0)
      }), { pageViews: 0, uniqueVisitors: 0, clicks: 0 });

      const activeVisitors = subdomain
        ? await AnalyticsStore.getActiveVisitorCountByPrefix(subdomain, { activeWindowMs: 60 * 1000, maxTrackMs: 10 * 60 * 1000 })
        : 0;
      const breakdowns = allowAdvancedAnalytics ? await AnalyticsStore.getBreakdowns({ siteId: site.id, days }) : {};
      const topProducts = allowAdvancedAnalytics ? await AnalyticsStore.getTopProducts({ siteId: site.id, days }) : [];
      const realtimeWindow = allowAdvancedAnalytics ? await AnalyticsStore.getRealtimeWindow({ siteId: site.id, windowSeconds: 10 * 60 }) : [];
      const realtimeEvents = allowAdvancedAnalytics ? await AnalyticsStore.getRealtimeEvents({ siteId: site.id, limit: 50 }) : [];

      const payload = {
        days,
        totals,
        series,
        breakdowns,
        topProducts,
        realtime: {
          activeVisitors,
          windowSeconds: 60,
          window: realtimeWindow,
          events: realtimeEvents
        }
      };

      res.write(`event: analytics\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const id = setInterval(() => {
      send().catch(() => void 0);
    }, 2000);

    send().catch(() => void 0);

    req.on('close', () => {
      clearInterval(id);
      try { res.end(); } catch (e) { void e; }
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Stream baslatilamadi',
      details: (error?.message || String(error)).toString().slice(0, 220)
    });
  }
});

/**
 * POST /api/sites/public/:subdomain/newsletter
 * Bülten aboneliği (Gerçek veri kaydı)
 */
router.post('/public/:subdomain/newsletter', async (req, res) => {
  try {
    const subdomain = (req.params.subdomain || '').toString().trim().toLowerCase();
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi gerekli' });
    }

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Mağaza bulunamadı' });
    }

    // Mevcut bülten listesini al
    const settings = site.settings || {};
    const currentEmails = settings.newsletter_emails || [];

    // Eğer zaten kayıtlıysa başarılı dön (çakışma olmasın)
    if (currentEmails.includes(email.toLowerCase())) {
      return res.status(200).json({ message: 'Zaten abonesiniz!', alreadyExists: true });
    }

    // Yeni e-postayı ekle
    const updatedEmails = [...currentEmails, email.toLowerCase()];
    
    await Site.update(site.id, {
      settings: {
        ...settings,
        newsletter_emails: updatedEmails,
        last_newsletter_signup_at: new Date().toISOString()
      }
    });

    console.log(`📩 Yeni bülten aboneliği: ${email} (${subdomain})`);

    return res.status(201).json({ 
      success: true, 
      message: 'Bültene başarıyla abone oldunuz!' 
    });
  } catch (error) {
    console.error('❌ Newsletter error:', error);
    return res.status(500).json({ error: 'Abonelik sırasında bir hata oluştu' });
  }
});

/**
 * GET /api/sites/public/:subdomain
 * Public site verisi (tema scripti bu endpoint'i kullanır)
 */
router.get('/public/:subdomain', async (req, res) => {
  try {
    const subdomain = (req.params.subdomain || '').toString().trim().toLowerCase();
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain gerekli' });
    }

    let site = null;
    try {
      // Direct subdomain lookup
      site = await Site.findBySubdomain(subdomain);
      
      // Fallback: search in slugified names for very old legacy links
      if (!site) {
        const all = await Site.findAll();
        site = all.find(s => (s.subdomain || '').toString().toLowerCase() === subdomain) || null;
      }
    } catch (dbErr) {
      console.error('❌ Database error in public site fetch:', dbErr);
      // If DB fails, we can't do much, but let's not crash
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası', details: dbErr.message });
    }

    if (!site) {
      // FOR DEMO/DEV: If subdomain is 'demo', return a mock site object instead of 404
      if (subdomain === 'demo') {
        return res.json({
          ok: true,
          site: {
            name: 'NOVA DEMO',
            subdomain: subdomain,
            settings: {
              description: 'Bu bir demo mağazadır. Shopier linkinizi bağlayarak kendi mağazanızı oluşturabilirsiniz.',
              products_data: [
                {
                  id: 'p1',
                  name: 'Italian Linen Gömlek — Beyaz',
                  slug: 'italian-linen-gomlek-beyaz',
                  price: 1299.90,
                  originalPrice: 2499.90,
                  images: ['/images/products/linen-shirt.png'],
                  badge: 'Sezon İndirimi',
                  isNew: true
                },
                {
                  id: 'p2',
                  name: 'Cashmere Polo Triko — Lacivert',
                  slug: 'cashmere-polo-triko-lacivert',
                  price: 1899.90,
                  originalPrice: 3299.90,
                  images: ['/images/products/cashmere-polo.png'],
                  isNew: false
                }
              ]
            }
          }
        });
      }
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    // Auto-heal:
    // 1) some legacy sites may have collections but missing products_data.
    // 2) some sites have products_data but missing detail fields (sizes/images/description) because
    //    Shopier detail enrichment may have been capped.
    const autoHeal = { attempted: false, ok: false, skipped: false, error: null, background: false };
    try {
      const settings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
      const productsData = Array.isArray(settings?.products_data) ? settings.products_data : [];
      const hasProducts = productsData.length > 0;
      const hasAnySizes = productsData.some((p) => Array.isArray(p?.sizes) && p.sizes.length > 0);
      const missingSizesCount = productsData.filter((p) => !(Array.isArray(p?.sizes) && p.sizes.length > 0)).length;
      const missingDetailsRatio = hasProducts ? (missingSizesCount / Math.max(1, productsData.length)) : 1;
      const shopierUrl = (site?.shopier_url || settings?.shopier_url || settings?.shopierUrl || '').toString().trim();
      const lastRefreshed = (settings?.catalog_refreshed_at || '').toString().trim();
      const lastTotal = Number(settings?.catalog_total_products || 0);

      if (shopierUrl) {
        autoHeal.attempted = true;
        const refreshedAtMs = lastRefreshed ? new Date(lastRefreshed).getTime() : 0;
        const isOld = !refreshedAtMs || (Date.now() - refreshedAtMs) > (1000 * 60 * 60); // 1 hour
        
        // TRIGGER SYNC IF: 
        // 1. No products at all
        // 2. No sizes/variations found yet
        // 3. Only 1 image found (maybe gallery was missed)
        // 4. Data is more than 1 hour old
        const hasAnyVariations = productsData.some(p => (p.variations && p.variations.length > 0) || (p.sizes && p.sizes.length > 0));
        const hasGallery = productsData.some(p => p.images && p.images.length > 1);
        const isExportImport = settings?.last_sync_method === 'export_import';
        const shouldSync = !isExportImport && (!hasProducts || !hasAnyVariations || !hasGallery || isOld);

        if (shouldSync) {
          autoHeal.background = true;
          const normalizedShopierUrl = normalizeShopierUrl(shopierUrl);
          const apiKey = settings?.api_key || settings?.apiKey;

          const syncPromise = apiKey 
            ? fetchAllProductsFromShopierAPI(normalizedShopierUrl, apiKey)
            : fetchShopierCatalog(normalizedShopierUrl, {
                debug: false,
                skipDetails: true,
                detailConcurrency: 3,
                detailMaxProducts: 200
              });

          syncPromise
            .then(async (result) => {
              try {
                // Determine if result is from API or Scraping
                const products = Array.isArray(result) ? result : (result?.products || []);
                const categories = Array.isArray(result?.categories) ? result.categories : [];
                const totalProducts = apiKey ? products.length : Number(result?.totalProducts || result?.totalCount || products.length || 0);
                
                const refreshedAt = new Date().toISOString();
                
                // ATOMIC UPDATE: Merge with existing settings to prevent data loss
                const currentSite = await Site.findById(site.id);
                const currentSettings = currentSite?.settings || {};
                
                await Site.update(site.id, {
                  settings: {
                    ...currentSettings,
                    products_data: products.length > 0 ? products : (currentSettings.products_data || []),
                    collections: categories.length > 0 ? categories : (currentSettings.collections || []),
                    catalog_total_products: totalProducts || currentSettings.catalog_total_products || 0,
                    catalog_full_sync_complete: true,
                    catalog_refreshed_at: refreshedAt,
                    shopier_url: normalizedShopierUrl,
                    shopierUrl: normalizedShopierUrl
                  }
                });
              } catch (e) {
                console.error('❌ Public site auto-heal error:', e);
              }
            })
            .catch((e) => {
            console.error('❌ Public site auto-heal background error:', e);
          });
          autoHeal.ok = true;
        } else {
          autoHeal.skipped = true;
        }
      } else if (hasProducts && shopierUrl && missingSizesCount > 0) {
        // Incremental heal: enrich missing details beyond the initial cap.
        autoHeal.attempted = true;
        const refreshedAtMs = lastRefreshed ? new Date(lastRefreshed).getTime() : 0;
        const recentlyRefreshed = Boolean(refreshedAtMs) && (Date.now() - refreshedAtMs) < (10 * 60 * 1000);
        if (!recentlyRefreshed) {
          autoHeal.background = true;
          const normalizedShopierUrl = normalizeShopierUrl(shopierUrl);
          enrichCatalogProductsWithDetails(productsData, normalizedShopierUrl, {
            concurrency: 3,
            maxProducts: 240,
            onlyMissing: true
          }).then(async (updated) => {
            const refreshedAt = new Date().toISOString();
            await Site.update(site.id, {
              settings: {
                products_data: updated,
                catalog_refreshed_at: refreshedAt,
                shopier_url: normalizedShopierUrl,
                shopierUrl: normalizedShopierUrl
              }
            });
          }).catch((e) => {
            console.error('❌ Public site incremental heal background error:', e);
          });

          autoHeal.ok = true;
        } else {
          autoHeal.skipped = true;
        }
      }
    } catch (healError) {
      console.error('❌ Public site auto-heal error:', healError);
      autoHeal.attempted = true;
      autoHeal.ok = false;
      autoHeal.error = (healError?.message || String(healError)).toString().slice(0, 400);
    }

    // Final Cleanup: Ensure no demo products leak into real sites
    if (subdomain !== 'demo' && site.settings && Array.isArray(site.settings.products_data)) {
      const demoIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
      const demoNames = ['Italian Linen', 'Cashmere Polo', 'Triko Kazak']; // Common demo name patterns
      
      site.settings.products_data = site.settings.products_data.filter(p => {
        if (!p) return false;
        const id = (p.id || '').toString();
        const name = (p.name || '').toString();
        
        // If ID is in demo list OR name contains demo patterns (and it's a real site), kill it
        const isDemoId = demoIds.includes(id);
        const isDemoName = demoNames.some(dn => name.includes(dn)) && !name.includes('Yarım Fermuarlı Polar'); // Preserve user's real product
        
        return !(isDemoId || isDemoName);
      });
    }

    return res.json({ site, autoHeal });
  } catch (error) {
    console.error('❌ Get public site error:', error);
    return res.status(500).json({ error: 'Site alınamadı' });
  }
});

router.get('/public/:subdomain/policies', async (req, res) => {
  try {
    const subdomain = (req.params.subdomain || '').toString().trim().toLowerCase();
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain gerekli' });
    }

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    const settings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
    const policies = pickPolicies(settings?.policies || {});
    return res.json({ policies });
  } catch (error) {
    console.error('❌ Get public site policies error:', error);
    return res.status(500).json({ error: 'Politikalar alınamadı' });
  }
});

router.post('/public/:subdomain/newsletter', async (req, res) => {
  try {
    await AnalyticsStore.ensureSchema();

    const subdomain = (req.params.subdomain || '').toString().trim().toLowerCase();
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain gerekli' });
    }

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    const email = (req.body?.email || '').toString();
    const out = await AnalyticsStore.addNewsletterSubscriber({ siteId: site.id, email });
    if (!out?.ok) {
      return res.status(400).json({ error: out?.error || 'Kaydedilemedi' });
    }

    let notified = false;
    const to = extractContactEmailForSite(site);
    if (to) {
      try {
        const transporter = await buildTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          replyTo: (email || '').toString().trim(),
          subject: `[Bülten] Yeni abone (${subdomain})`,
          text: [
            `Site: ${subdomain}`,
            `Abone e-posta: ${(email || '').toString().trim()}`
          ].join('\n')
        });
        notified = true;
      } catch (mailErr) {
        console.error('❌ Newsletter notify error:', mailErr);
      }
    }

    return res.json({ ok: true, notified });
  } catch (error) {
    console.error('❌ Newsletter subscribe error:', error);
    if (error && error.code === 'EMAIL_MISCONFIG') {
      return res.status(500).json({ error: 'E-posta gönderimi yapılandırılmadı (EMAIL_HOST/EMAIL_USER/EMAIL_PASS).' });
    }
    return res.status(500).json({ error: 'Abonelik kaydedilemedi' });
  }
});

const publicContactSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  message: Joi.string().min(2).max(5000).required(),
  page: Joi.string().max(256).allow('').optional(),
  visitorId: Joi.string().max(128).allow('').optional()
});

router.post('/public/:subdomain/contact-message', async (req, res) => {
  try {
    await AnalyticsStore.ensureSchema();

    const subdomain = (req.params.subdomain || '').toString().trim().toLowerCase();
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain gerekli' });
    }

    const { error, value } = publicContactSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Geçersiz istek' });
    }

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    const saved = await AnalyticsStore.addContactMessage({
      siteId: site.id,
      email: value.email,
      message: value.message,
      page: value.page,
      visitorId: value.visitorId
    });
    if (!saved?.ok) {
      return res.status(400).json({ error: saved?.error || 'Kaydedilemedi' });
    }

    let notified = false;
    const to = extractContactEmailForSite(site);
    if (to) {
      try {
        const transporter = await buildTransporter();
        const safePage = (value.page || '').toString().trim();
        const safeVisitor = (value.visitorId || '').toString().trim();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          replyTo: value.email,
          subject: `[İletişim] Yeni mesaj (${subdomain})`,
          text: [
            `Site: ${subdomain}`,
            safePage ? `Sayfa: ${safePage}` : null,
            safeVisitor ? `VisitorId: ${safeVisitor}` : null,
            `Gönderen: ${value.email}`,
            '',
            value.message
          ].filter(Boolean).join('\n')
        });
        notified = true;
      } catch (mailErr) {
        console.error('❌ Contact notify error:', mailErr);
      }
    }

    return res.json({ ok: true, notified });
  } catch (e) {
    if (e && e.code === 'EMAIL_MISCONFIG') {
      return res.status(500).json({ error: 'E-posta gönderimi yapılandırılmadı (EMAIL_HOST/EMAIL_USER/EMAIL_PASS).' });
    }
    console.error('❌ Public contact-message error:', e);
    return res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

/**
 * GET /api/sites/public-by-host
 * Host header'a göre public site verisi (custom domain veya subdomain)
 */
router.get('/public-by-host', async (req, res) => {
  try {
    const rawHost = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
    const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0];
    if (!host) {
      return res.status(400).json({ error: 'Host bulunamadı' });
    }

    const cacheKey = `site:${host}`;
    const cachedSite = await CacheService.get(cacheKey);
    if (cachedSite) return res.json({ site: cachedSite });

    const site = await (async () => {
      if (host.endsWith('odelink.shop')) {
        const parts = host.split('.').filter(Boolean);
        const sub = parts.length >= 3 ? parts[0] : '';
        if (!sub || sub === 'www') return null;
        return await Site.findBySubdomain(sub);
      }
      return await Site.findByCustomDomain(host);
    })();

    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    // Fetch manual products for this site owner
    const products = await Product.findByUserId(site.user_id);
    site.manual_products = products;

    // Cache for 1 hour
    await CacheService.set(cacheKey, site, 3600);

    return res.json({ site, products });
  } catch (error) {
    console.error('❌ Get public site by host error:', error);
    return res.status(500).json({ error: 'Site alınamadı' });
  }
});

/**
 * GET /api/sites/:id
 * Tek bir siteyi getir
 */
router.get('/:id', authMiddleware, requireAccess, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    if (site.user_id !== req.userId) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }

    return res.json({ site });
  } catch (error) {
    console.error('❌ Get site error:', error);
    return res.status(500).json({
      error: 'Site alınamadı',
      message: (error?.message || String(error)).toString().slice(0, 500)
    });
  }
});

/**
 * POST /api/sites
 * YENİ SİTE OLUŞTUR - ANINDA ÜRÜNLERLE!
 */
router.post('/', authMiddleware, requireAccess, async (req, res) => {
  let site = null;
  
  try {
    // Validation
    const { error, value } = createSiteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Geçersiz veri', 
        details: error.details[0].message 
      });
    }

    // --- PLAN LIMIT CHECK ---
    const limitCheck = await Subscription.checkSiteLimit(req.userId);
    if (limitCheck.currentSites >= limitCheck.maxSites) {
      return res.status(403).json({
        error: 'Plan Limitine Ulaşıldı',
        message: `Mevcut paketinizle en fazla ${limitCheck.maxSites} site oluşturabilirsiniz. Daha fazla site için lütfen planınızı yükseltin.`
      });
    }

    const normalizedShopierUrl = normalizeShopierUrl(value.shopierUrl);
    if (!normalizedShopierUrl) {
      return res.status(400).json({
        error: 'Geçersiz Shopier mağaza linki',
        message: 'Lütfen geçerli bir Shopier mağaza linki girin. Örn: https://www.shopier.com/glossgiyim'
      });
    }

    // Shopier linkinden slug'ı çıkar: https://www.shopier.com/glossgiyim -> glossgiyim
    const extractSlugFromShopierUrl = (url) => {
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        return (parts[0] || '').trim().toLowerCase();
      } catch (e) {
        return '';
      }
    };

    const shopSlug = extractSlugFromShopierUrl(normalizedShopierUrl);
    if (!shopSlug) {
      return res.status(400).json({
        error: 'Geçersiz Shopier mağaza linki',
        message: 'Mağaza kullanıcı adı tespit edilemedi. Linkinizin formatı: https://www.shopier.com/KULLANICI-ADI'
      });
    }

    const clampSubdomain = (raw, maxLen = 30) => {
      const cleaned = (raw || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return (cleaned || 'magaza').slice(0, Math.max(1, Number(maxLen) || 30));
    };

    // Site ismi ve subdomain'i Shopier slug'ından türet
    const storeName = (value.name && value.name.trim()) || shopSlug;
    const subdomain = clampSubdomain(shopSlug, 30);

    console.log(`🚀 Site oluşturuluyor: ${normalizedShopierUrl} (slug=${shopSlug})`);

    const warnings = [];
    let products = [];
    let categories = [];
    let productSource = 'none';

    // 1) API key varsa önce API ile dene (opsiyonel)
    if (value.apiKey) {
      try {
        console.log(`🚀 API Anahtarı ile ürünler çekiliyor: ${normalizedShopierUrl}`);
        const apiProducts = await fetchProductsFromShopierAPI(normalizedShopierUrl, value.apiKey);
        if (apiProducts && apiProducts.length > 0) {
          products = apiProducts;
          productSource = 'api';
          console.log(`✅ API ile ${products.length} ürün çekildi.`);
        } else {
          console.warn('⚠️ API ürün döndürmedi; scraping fallback denenecek.');
        }
      } catch (apiErr) {
        console.error('⚠️ API ürün çekme hatası, scraping fallback:', apiErr.message);
      }
    }

    // 2) ZORUNLU: API başarısız veya hiç API yoksa → SCRAPING
    let catalog = null;
    if (products.length === 0) {
      try {
        console.log(`🕷️ Scraping ile ürünler çekiliyor (ZORUNLU): ${normalizedShopierUrl}`);
        catalog = await fetchShopierCatalog(normalizedShopierUrl, {
          debug: false,
          skipDetails: true, // HIZLI MOD: Detayları arka plana bırak
          detailConcurrency: 3,
          detailMaxProducts: 100,
          bypassCache: true
        });
        const scraped = Array.isArray(catalog?.products) ? catalog.products : [];
        if (scraped.length > 0) {
          products = scraped;
          categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
          productSource = 'scrape';
          console.log(`✅ Scraping ile ${products.length} ürün çekildi.`);
        } else {
          console.warn(`⚠️ Scraping da ürün döndürmedi: ${normalizedShopierUrl}`);
        }
      } catch (scrapeErr) {
        console.error('❌ Scraping hatası:', scrapeErr?.message || scrapeErr);
      }
    }

    // KESİN KURAL: Ürün çekilemediyse site OLUŞTURULMAZ.
    if (products.length === 0) {
      const debug = catalog?.debug || {};
      return res.status(422).json({
        error: 'Ürünler çekilemedi',
        message: 'Shopier mağazanızdan hiç ürün çekilemedi. Lütfen şunları kontrol edin:\n' +
                 '1) Mağaza linkinizin doğru olduğundan (örn: https://www.shopier.com/glossgiyim)\n' +
                 '2) Mağazanızda en az bir aktif ürün bulunduğundan\n' +
                 '3) Mağazanızın herkese açık (public) olduğundan',
        debug: {
          status: debug.lastStatus,
          error: debug.lastError,
          slug: debug.slug,
          url: debug.url
        }
      });
    }

    // SİTEYİ OLUŞTUR (sadece ürünler çekildiyse buraya geliyoruz)
    const siteData = {
      userId: req.userId,
      name: storeName,
      shopierUrl: normalizedShopierUrl,
      subdomain,
      status: 'active',
      settings: {
        ...(value.settings || {}),
        shopier_user: shopSlug,
        description: (value?.settings?.description || '').toString(),
        created_at: new Date().toISOString(),
        shopier_api_key: value.apiKey || '',
        products_data: products,
        collections: categories,
        catalog_total_products: products.length,
        catalog_enrichment_status: 'quick_loaded',
        catalog_full_sync_complete: false,
        catalog_refreshed_at: new Date().toISOString(),
        shopier_url: normalizedShopierUrl,
        shopierUrl: normalizedShopierUrl
      }
    };

    site = await Site.create(siteData);
    console.log(`✅ Site oluşturuldu: ${site.id} (${site.subdomain}) — ${products.length} ürün (${productSource}).`);

    // Arka planda DNS kaydı ekle (Cloudflare)
    setImmediate(async () => {
      try {
        if (site.subdomain) {
          await addDnsRecord(site.subdomain);
          console.log(`✅ Cloudflare DNS eklendi: ${site.subdomain}.odelink.shop`);
        }
      } catch (dnsErr) {
        console.error(`⚠️ Cloudflare DNS eklenemedi: ${site.subdomain}`, dnsErr?.message || dnsErr);
      }
    });

    // ARKA PLANDA FULL SYNC BAŞLAT (detayları ve kalan ürünleri tamamla)
    setImmediate(async () => {
      try {
        console.log(`🔄 Arka planda FULL sync başladı: ${site.id}`);
        const fullCatalog = await fetchShopierCatalog(normalizedShopierUrl, {
          debug: false,
          skipDetails: false,
          apiKey: value.apiKey,
          bypassCache: true
        });

        if (fullCatalog?.products?.length > products.length) {
          await Site.update(site.id, {
            settings: {
              ...site.settings,
              products_data: fullCatalog.products,
              collections: fullCatalog.categories || categories,
              catalog_total_products: fullCatalog.products.length,
              catalog_enrichment_status: 'completed',
              catalog_full_sync_complete: true,
              catalog_refreshed_at: new Date().toISOString()
            }
          });
          console.log(`✅ Full sync tamamlandı: ${site.id} (${fullCatalog.products.length} ürün)`);
        }
      } catch (err) {
        console.error(`⚠️ Full sync hatası: ${site.id}`, err?.message || err);
      }
    });

    // BAŞARILI CEVAP
    const successMessage = `Siteniz oluşturuldu! ${products.length} ürün yüklendi. Tüm ürünleriniz arka planda senkronize ediliyor.`;

    return res.status(201).json({
      ok: true,
      site: {
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        shopierUrl: site.shopier_url,
        createdAt: site.created_at,
        url: `https://${site.subdomain}.odelink.shop`,
        status: 'active',
        productsLoaded: products.length,
        productSource
      },
      warnings,
      message: successMessage
    });

  } catch (error) {
    console.error('❌ Create site error:', error);
    return res.status(500).json({
      error: 'Site oluşturulamadı',
      message: (error?.message || String(error)).toString().slice(0, 400)
    });
  }
});

/**
 * PUT /api/sites/:id
 * Site güncelle - Kurumsal Sürüm
 */
router.put('/:id', authMiddleware, requireAccess, async (req, res) => {
  try {
    const siteId = req.params.id;
    const existingSite = await Site.findById(siteId);
    
    if (!existingSite) return res.status(404).json({ error: 'Mağaza bulunamadı' });
    if (existingSite.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    const { name, subdomain, settings, customDomain } = req.body;
    const updateData = { name, settings, customDomain };

    // --- SUBDOMAIN DEĞİŞİM SINIRI (AYDA 3 KEZ) ---
    if (subdomain && subdomain !== existingSite.subdomain) {
      const lastChange = new Date(existingSite.last_subdomain_change_at || 0);
      const now = new Date();
      const isSameMonth = lastChange.getMonth() === now.getMonth() && lastChange.getFullYear() === now.getFullYear();
      
      let changeCount = isSameMonth ? (existingSite.subdomain_change_count || 0) : 0;

      if (changeCount >= 3) {
        return res.status(400).json({ 
          error: 'Subdomain değişim sınırı doldu.', 
          message: 'Kurumsal güvenlik gereği, mağaza adınızı bir ay içinde en fazla 3 kez değiştirebilirsiniz.' 
        });
      }

      // Mükerrer Kontrolü
      const duplicate = await pool.query('SELECT id FROM sites WHERE subdomain = $1 AND id != $2', [subdomain, siteId]);
      if (duplicate.rows.length > 0) {
        return res.status(400).json({ error: 'Bu mağaza adı zaten kullanımda.' });
      }

      // Sınırı güncelle ve subdomaini set et
      await pool.query(
        'UPDATE sites SET subdomain = $1, subdomain_change_count = $2, last_subdomain_change_at = NOW() WHERE id = $3',
        [subdomain, changeCount + 1, siteId]
      );
      
      // DNS Kaydını Güncelle (Arka planda)
      setImmediate(async () => {
        try {
          await deleteDnsRecord(existingSite.subdomain);
          await addDnsRecord(subdomain);
        } catch (e) { console.error('DNS Update Error:', e); }
      });
    }

    // --- SİTEYİ GÜNCELLE ---
    const site = await Site.update(siteId, updateData);
    
    // Cache Temizleme
    try {
      await CacheService.clearStoreCache(`${existingSite.subdomain}.odelink.shop`);
      await CacheService.clearStoreCache(`${site.subdomain}.odelink.shop`);
    } catch (e) { console.error('Cache Clear Error:', e); }

    return res.json({
      success: true,
      message: 'Değişiklikler başarıyla yayına alındı.',
      site
    });

  } catch (error) {
    console.error('❌ Update site error:', error);
    return res.status(500).json({ error: 'Mağaza güncellenirken bir hata oluştu.' });
  }
});

/**
 * GET /api/sites/:id/domain-status
 * Alan adı ve SSL durumunu sorgula
 */
router.get('/:id/domain-status', authMiddleware, requireAccess, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim engellendi' });

    if (!site.custom_domain) {
      return res.json({ 
        hasCustomDomain: false,
        subdomainUrl: `https://${site.subdomain}.odelink.shop`
      });
    }

    const { getCustomHostnameStatus } = require('../services/cloudflareService');
    const status = await getCustomHostnameStatus(site.custom_domain);

    return res.json({
      hasCustomDomain: true,
      hostname: site.custom_domain,
      status: status?.status || 'pending', // 'active', 'pending', etc.
      sslStatus: status?.ssl?.status || 'initializing',
      verificationErrors: status?.verification_errors || [],
      ownershipVerification: status?.ownership_verification || null,
      sslValidationRecords: status?.ssl?.validation_records || []
    });

  } catch (error) {
    console.error('❌ Domain status error:', error);
    return res.status(500).json({ error: 'Alan adı durumu alınamadı' });
  }
});

/**
 * DELETE /api/sites/:id
 * Site sil
 */
router.delete('/:id', authMiddleware, requireAccess, async (req, res) => {
  try {
    const existingSite = await Site.findById(req.params.id);
    if (!existingSite) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    if (existingSite.user_id !== req.userId) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }

    await Site.delete(req.params.id);

    // CLOUDFLARE DNS & HOSTNAME KAYDI SİL (ARKA PLANDA)
    const subdomain = existingSite.subdomain;
    const customDomain = existingSite.custom_domain;
    
    setImmediate(async () => {
      const { deleteDnsRecord, deleteCustomHostname } = require('../services/cloudflareService');
      
      if (subdomain) {
        try {
          await deleteDnsRecord(subdomain);
          console.log(`✅ Cloudflare DNS kaydı silindi: ${subdomain}.odelink.shop`);
        } catch (dnsErr) {
          console.error(`⚠️ Cloudflare DNS kaydı silinemedi: ${subdomain}`, dnsErr);
        }
      }

      if (customDomain) {
        try {
          await deleteCustomHostname(customDomain);
          console.log(`✅ Cloudflare Custom Hostname silindi: ${customDomain}`);
        } catch (chErr) {
          console.error(`⚠️ Cloudflare Custom Hostname silinemedi: ${customDomain}`, chErr);
        }
      }
    });
    
    return res.json({ 
      success: true,
      message: 'Site silindi' 
    });

  } catch (error) {
    console.error('❌ Delete site error:', error);
    return res.status(500).json({ error: 'Site silinemedi' });
  }
});

/**
 * POST /api/sites/:id/sync
 * Shopier'dan manuel senkronizasyon
 */
router.post('/:id/sync', authMiddleware, requireAccess, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    if (site.user_id !== req.userId) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }

    const { syncSite } = require('../services/shopierSyncService');
    
    console.log(`🔄 Manuel sync başlatıldı: ${req.params.id}`);
    
    const result = await syncSite(req.params.id);
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Senkronizasyon tamamlandı',
        stats: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Senkronizasyon başarısız'
      });
    }

  } catch (error) {
    console.error('❌ Sync error:', error);
    return res.status(500).json({ 
      error: 'Senkronizasyon başarısız',
      message: (error?.message || String(error)).toString().slice(0, 400)
    });
  }
});

/**
 * POST /api/sites/:id/sync-from-extension
 * Eklentiden gelen ürün verilerini kaydet
 */
router.post('/:id/sync-from-extension', authMiddleware, requireAccess, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    const { products } = req.body;
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Geçersiz ürün verisi' });

    console.log(`🔌 Eklentiden ${products.length} ürün geldi: ${site.id}`);

    // Mevcut ayarları koruyarak ürünleri güncelle
    const updatedSettings = {
      ...(site.settings || {}),
      products_data: products,
      catalog_total_products: products.length,
      catalog_refreshed_at: new Date().toISOString(),
      catalog_full_sync_complete: true,
      last_sync_method: 'extension'
    };

    await Site.update(site.id, { settings: updatedSettings });

    return res.json({ success: true, message: 'Senkronizasyon başarılı', count: products.length });
  } catch (error) {
    console.error('❌ Extension sync error:', error);
    return res.status(500).json({ error: 'Veriler kaydedilemedi' });
  }
});

/**
 * POST /api/sites/:id/import-excel
 * Shopier Excel dosyasından ürünleri içe aktar
 */
router.post('/:id/import-excel', authMiddleware, requireAccess, upload.single('file'), async (req, res) => {
  try {
    const siteId = req.params.id;
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });
    if (site.user_id !== req.userId) return res.status(403).json({ error: 'Erişim izniniz yok' });

    if (!req.file) return res.status(400).json({ error: 'Excel dosyası gerekli' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) return res.status(400).json({ error: 'Excel dosyası boş' });

    const slugify = (text) => (text || '').toString().toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const parsePrice = (p) => {
      if (!p) return 0;
      const s = p.toString().replace(/\n/g, '').replace(',', '.').replace(/[^0-9.]/g, '');
      return parseFloat(s) || 0;
    };

    const products = rows.map((row, index) => {
      const name = (row['Ürün Adı'] || row['Ürün İsmi'] || 'İsimsiz Ürün').toString();
      const url = (row['Ürün Linki'] || row['Link'] || '').toString();
      const id = url.split('/').pop() || `p-${index}`;
      
      return {
        id,
        name,
        slug: slugify(name) + '-' + id,
        description: (row['Ürün Açıklaması'] || row['Açıklama'] || '').toString(),
        price: parsePrice(row['İndirimli Fiyat'] || row['Fiyat'] || row['Ürün Fiyatı']),
        originalPrice: parsePrice(row['Orijinal Fiyat'] || row['Eski Fiyat'] || '0'),
        currency: (row['Para Birimi'] || 'TL').toString(),
        url,
        category: (row['Ürün Kategorisi'] || row['Kategori'] || 'Genel').toString(),
        stock: parseInt(row['Stok Adedi'] || row['Stok'] || 0),
        shippingType: (row['Kargo'] || '').toString(),
        shippingFee: (row['Kargo Ücreti'] || '0').toString(),
        productType: (row['Ürün Türü'] || 'Fiziksel').toString(),
        imageUrl: '',
        variations: row['Varyasyonlar'] ? row['Varyasyonlar'].toString().split(',').map(v => ({ value: v.trim(), label: v.trim() })) : []
      };
    });

    // Temel verileri anında kaydet
    const settings = (site.settings && typeof site.settings === 'object') ? site.settings : {};
    const updatedSettings = {
      ...settings,
      products_data: products,
      catalog_total_products: products.length,
      catalog_refreshed_at: new Date().toISOString(),
      catalog_full_sync_complete: false,
      last_sync_method: 'excel_import'
    };

    await Site.update(siteId, { settings: updatedSettings });

    // Arka planda resimleri çek
    setImmediate(async () => {
      console.log(`🖼️ Background image sync started for site ${siteId} (${products.length} products)`);
      const updatedProducts = [...products];
      
      for (let i = 0; i < updatedProducts.length; i++) {
        const p = updatedProducts[i];
        if (!p.url) continue;

        try {
          const response = await axios.get(p.url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 5000
          });
          const $ = cheerio.load(response.data);
          
          // Meta taglerden veya carousel'den resimleri bul
          const ogImage = $('meta[property="og:image"]').attr('content');
          const galleryImages = [];
          $('.carousel-item img, .product-image img, .sp-image, img[data-src]').each((_, el) => {
             const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset');
             if (src && src.startsWith('http')) galleryImages.push(src);
          });

          p.imageUrl = ogImage || galleryImages[0] || '';
          if (p.imageUrl && !p.imageUrl.startsWith('http')) p.imageUrl = 'https:' + p.imageUrl;
          
          p.images = galleryImages.length > 0 ? galleryImages : (ogImage ? [ogImage] : []);
          p.images = p.images.map(img => img.startsWith('http') ? img : 'https:' + img);
          
          // Her 10 üründe bir ara kayıt yap (kullanıcı sayfayı yenilerse ilerlemeyi görsün)
          if (i % 10 === 0 || i === updatedProducts.length - 1) {
            const currentSite = await Site.findById(siteId);
            const currentSettings = currentSite.settings || {};
            await Site.update(siteId, { 
              settings: { ...currentSettings, products_data: updatedProducts } 
            });
          }
        } catch (err) {
          console.error(`❌ Image fetch failed for ${p.url}:`, err.message);
        }
      }

      const finalSite = await Site.findById(siteId);
      const finalSettings = finalSite.settings || {};
      await Site.update(siteId, { 
        settings: { 
          ...finalSettings, 
          products_data: updatedProducts,
          catalog_full_sync_complete: true 
        } 
      });
      console.log(`✅ Background image sync completed for site ${siteId}`);
    });

    return res.json({ 
      success: true, 
      message: 'Excel başarıyla yüklendi. Ürünler saniyeler içinde listelenecek, fotoğraflar arka planda çekiliyor.',
      count: products.length 
    });

  } catch (error) {
    console.error('❌ Excel import error:', error);
    return res.status(500).json({ error: 'Excel dosyası işlenemedi' });
  }
});

/**
 * POST /api/sites/request-build
 * VIP Müşteri Deneyimi: Müşteri Shopier linkini bırakır, sıraya alınır.
 */
router.post('/request-build', authMiddleware, async (req, res) => {
  try {
    const { shopierUrl } = req.body;
    if (!shopierUrl || !shopierUrl.includes('shopier.com/')) {
      return res.status(400).json({ error: 'Geçerli bir Shopier mağaza linki giriniz.' });
    }

    // Rastgele bilet numarası oluştur (örn: ODL-4829)
    const ticketId = 'ODL-' + Math.floor(1000 + Math.random() * 9000);
    
    // Mağaza adını linkten tahmin etmeye çalış (örn: shopier.com/BUMERANGWEAR)
    const urlParts = shopierUrl.split('shopier.com/');
    let shopNameGuess = urlParts.length > 1 ? urlParts[1].split('/')[0].split('?')[0] : 'Yeni Mağaza';
    if (!shopNameGuess || shopNameGuess.trim() === '') shopNameGuess = 'Yeni Mağaza';

    const slugify = (text) => (text || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const existingSites = await Site.findByUserId(req.userId);
    let site;

    if (existingSites && existingSites.length > 0) {
      site = existingSites[0];
      await Site.update(site.id, { 
        name: shopNameGuess,
        settings: {
          ...(site.settings || {}),
          shopierUrl: shopierUrl,
          vip_ticket_id: ticketId,
          build_status: 'pending'
        }
      });
    } else {
      const subdomain = slugify(shopNameGuess + '-' + Math.random().toString(36).substring(2, 6));
      site = await Site.create({
        userId: req.userId,
        name: shopNameGuess,
        subdomain: subdomain,
        settings: {
          shopierUrl: shopierUrl,
          vip_ticket_id: ticketId,
          build_status: 'pending'
        }
      });
    }

    // Admin'e mail at
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Odelink'}" <${process.env.EMAIL_USER}>`,
        to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
        subject: `🚨 YENİ SİTE TALEBİ: ${ticketId} - ${shopNameGuess}`,
        html: `
          <h2>Yeni VIP Mağaza Talebi!</h2>
          <p><strong>Bilet No:</strong> ${ticketId}</p>
          <p><strong>Mağaza Adı:</strong> ${shopNameGuess}</p>
          <p><strong>Shopier Linki:</strong> <a href="${shopierUrl}">${shopierUrl}</a></p>
          <p><strong>Kullanıcı ID:</strong> ${req.userId}</p>
          <p><strong>Site ID:</strong> ${site.id}</p>
          <br/>
          <p><i>Lütfen Derin Tarama robotunu çalıştırıp veriyi JSON olarak çekin, ardından deliver_store.js scriptini kullanarak teslimatı yapın.</i></p>
        `
      });
    } catch (mailErr) {
      console.error("Admin mail gönderilemedi:", mailErr);
      // Mail gitmese bile müşteriye ticket numarasını verelim.
    }

    return res.json({ 
      success: true, 
      ticketId, 
      message: 'Talebiniz başarıyla alındı. Lütfen mailinizi bekleyin.' 
    });

  } catch (error) {
    console.error('❌ Request build error:', error);
    return res.status(500).json({ error: 'Talep oluşturulamadı. Lütfen tekrar deneyin.' });
  }
});

// create-automated has been removed in favor of excel-first architecture

/**
 * POST /api/sites/create-from-excel
 * Excel dosyasından anında site oluştur
 */
router.post('/create-from-excel', authMiddleware, requireAccess, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Excel dosyası gerekli' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) return res.status(400).json({ error: 'Excel dosyası boş' });

    // İlk satırdan Shopier URL'ini ve mağaza adını tahmin et
    const firstUrl = (rows[0]['Ürün Linki'] || '').toString();
    const extractSlug = (url) => {
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        return (parts[0] || '').trim().toLowerCase();
      } catch (e) { return 'magaza'; }
    };
    const shopSlug = extractSlug(firstUrl) || 'magaza';
    const shopierUrl = `https://www.shopier.com/${shopSlug}`;

    const slugify = (text) => (text || '').toString().toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const products = rows.map((row, index) => {
      const name = (row['Ürün Adı'] || 'İsimsiz Ürün').toString();
      const url = (row['Ürün Linki'] || '').toString();
      const id = url.split('/').pop() || `p-${index}`;
      const parsePrice = (p) => {
        if (!p) return 0;
        const s = p.toString().replace(',', '.').replace(/[^0-9.]/g, '');
        return parseFloat(s) || 0;
      };

      return {
        id,
        name,
        slug: slugify(name) + '-' + id,
        description: (row['Ürün Açıklaması'] || '').toString(),
        price: parsePrice(row['İndirimli Fiyat'] || row['Orijinal Fiyat']),
        originalPrice: parsePrice(row['Orijinal Fiyat']),
        currency: (row['Para Birimi'] || 'TL').toString(),
        url,
        category: (row['Ürün Kategorisi'] || 'Genel').toString(),
        stock: parseInt(row['Stok Adedi'] || 0),
        shippingType: (row['Kargo'] || '').toString(),
        shippingFee: (row['Kargo Ücreti'] || '0').toString(),
        productType: (row['Ürün Türü'] || 'Fiziksel').toString(),
        images: [],
        imageUrl: '',
        variations: row['Varyasyonlar'] ? row['Varyasyonlar'].toString().split(',').map(v => ({ value: v.trim(), label: v.trim() })) : []
      };
    });

    const clampSubdomain = (raw) => {
      const cleaned = (raw || '').toString().trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
      return (cleaned || 'magaza').slice(0, 30);
    };

    // Subdomain çakışması kontrolü
    let subdomain = clampSubdomain(shopSlug);
    const existing = await Site.findBySubdomain(subdomain);
    if (existing) {
      subdomain = clampSubdomain(subdomain + '-' + Math.random().toString(36).substring(2, 5));
    }

    // Mağaza adını iyileştir (Sayı ise ODELINK BOUTIQUE yap)
    const finalShopName = /^\d+$/.test(shopSlug) ? "ODELINK BOUTIQUE" : shopSlug.toUpperCase().replace(/-/g, ' ');

    const existingSites = await Site.findByUserId(req.userId);
    let site;

    const siteData = {
      userId: req.userId,
      name: finalShopName,
      shopierUrl,
      subdomain,
      status: 'active',
      settings: {
        shopier_user: shopSlug,
        created_at: new Date().toISOString(),
        products_data: products,
        catalog_total_products: products.length,
        catalog_enrichment_status: 'excel_loaded',
        catalog_full_sync_complete: false,
        catalog_refreshed_at: new Date().toISOString(),
        shopier_url: shopierUrl,
        shopierUrl: shopierUrl,
        last_sync_method: 'excel_import'
      }
    };

    if (existingSites && existingSites.length > 0) {
      site = existingSites[0];
      console.log(`📝 [${site.id}] Mevcut site güncelleniyor: ${site.subdomain}`);
      // Mevcut siteyi güncelle
      await Site.update(site.id, {
        name: finalShopName,
        settings: siteData.settings
      });
    } else {
      console.log(`🆕 [${subdomain}] Yeni site oluşturuluyor...`);
      site = await Site.create(siteData);
    }

    // DNS Ekle
    setImmediate(async () => {
      try { await addDnsRecord(site.subdomain); } catch (e) { console.error('DNS Error:', e); }
    });

    // Arka planda gerçek mağaza adını bul ve resimleri çek
    setImmediate(async () => {
      const updatedProducts = [...products];
      let realShopName = finalShopName;
      
      console.log(`📸 [${site.id}] Gerçek mağaza adı ve resim senkronizasyonu başladı...`);
      
      for (let i = 0; i < updatedProducts.length; i++) {
        const p = updatedProducts[i];
        if (!p.url) continue;
        
        try {
          const response = await axios.get(p.url, { 
            timeout: 10000, 
            headers: { 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            } 
          });
          
          const $ = cheerio.load(response.data);
          
          // İlk üründe gerçek mağaza adını yakala
          if (i === 0) {
            const possibleName = $('.shop-name, .seller-name, title').first().text().split('|')[0].split('-')[0].trim();
            if (possibleName && possibleName.length > 2 && !possibleName.includes('Shopier')) {
               realShopName = possibleName.toUpperCase();
               console.log(`🏷️ Mağaza Adı Bulundu: ${realShopName}`);
               await Site.update(site.id, { name: realShopName });
            }
          }

          const ogImage = $('meta[property="og:image"]').attr('content');
          const gallery = [];
          
          $('.carousel-item img, .product-image img, .sp-image, .product-detail-image img').each((_, el) => {
             const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy');
             if (src && src.startsWith('http')) {
               if (!gallery.includes(src)) gallery.push(src);
             }
          });
          
          p.imageUrl = ogImage || gallery[0] || '';
          p.images = gallery.length > 0 ? gallery : (ogImage ? [ogImage] : []);
          
          if (i % 5 === 0 || i === updatedProducts.length - 1) {
            const current = await Site.findById(site.id);
            if (current) {
              await Site.update(site.id, { 
                name: realShopName, // İsmi her seferinde doğrula
                settings: { 
                  ...current.settings, 
                  products_data: updatedProducts,
                  catalog_enrichment_progress: Math.round(((i+1)/updatedProducts.length)*100)
                } 
              });
            }
          }
        } catch (err) {
          console.error(`⚠️ [${site.id}] Hata (${p.id}):`, err.message);
        }
      }
      
      const final = await Site.findById(site.id);
      if (final) {
        await Site.update(site.id, { 
          settings: { 
            ...final.settings, 
            products_data: updatedProducts, 
            catalog_full_sync_complete: true,
            catalog_enrichment_status: 'completed'
          } 
        });
      }
      console.log(`✅ [${site.id}] Senkronizasyon tamamlandı.`);
    });

    return res.status(201).json({
      ok: true,
      siteId: site.id,
      subdomain: site.subdomain,
      message: 'Mağazanız oluşturuldu! Ürünler yüklendi, fotoğraflar arka planda çekiliyor.'
    });

  } catch (error) {
    console.error('❌ Excel create error:', error);
    return res.status(500).json({ error: 'Mağaza oluşturulamadı' });
  }
});


// TEMPORARY: Nuclear Cleanup Route (Test Purpose Only)
router.get('/maintenance/cleanup-nuclear-12345', async (req, res) => {
  try {
    console.log('☢️ NUCLEAR CLEANUP STARTED');
    await pool.query('TRUNCATE TABLE sites, products, orders, categories, site_analytics CASCADE');
    res.json({ success: true, message: 'All test sites and data cleared successfully.' });
  } catch (err) {
    console.error('❌ NUCLEAR CLEANUP FAILED:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

