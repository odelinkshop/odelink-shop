/**
 * SITES ROUTES - SIFIRDAN YENİ VERSİYON
 * Sadece temel CRUD - Karmaşık logic YOK
 */

const express = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const Site = require('../models/Site');
const Subscription = require('../models/Subscription');
const AutoBuildJobStore = require('../models/AutoBuildJobStore');
const AnalyticsStore = require('../models/AnalyticsStore');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const { fetchShopierCatalog, normalizeShopierUrl, enrichCatalogProductsWithDetails, fetchProductDetail } = require('../services/shopierCatalogService');
const { fetchProductsFromShopierAPI, verifyShopierToken } = require('../services/shopierApiService');
const { newJobId } = require('../services/siteCreationJobWorker');
const { addDnsRecord, deleteDnsRecord } = require('../services/cloudflareService');
const CacheService = require('../services/cacheService');

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
  shopierUrl: Joi.string().min(3).max(500).required(),
  apiKey: Joi.string().allow('').max(500).optional(),
  settings: Joi.object({
    description: Joi.string().allow('').optional(),
    logoUrl: Joi.string().allow('').optional(),
    shopier_user: Joi.string().allow('').optional()
  }).unknown(true).default({})
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
        const shouldSync = !hasProducts || !hasAnyVariations || !hasGallery || isOld;

        if (shouldSync) {
          autoHeal.background = true;
          const normalizedShopierUrl = normalizeShopierUrl(shopierUrl);
          fetchShopierCatalog(normalizedShopierUrl, {
            debug: false,
            skipDetails: true,
            detailConcurrency: 3,
            detailMaxProducts: 200 // Increase limit to enrich more products
          })
            .then(async (catalog) => {
              try {
                const products = Array.isArray(catalog?.products) ? catalog.products : [];
                const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
                const totalProducts = Number(catalog?.totalProducts || catalog?.totalCount || products.length || 0);
                const refreshedAt = new Date().toISOString();
                await Site.update(site.id, {
                  settings: {
                    products_data: products,
                    collections: categories,
                    catalog_total_products: totalProducts,
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

    // Cache for 1 hour
    await CacheService.set(cacheKey, site, 3600);

    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    return res.json({ site });
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
 * Site güncelle
 */
router.put('/:id', authMiddleware, requireAccess, async (req, res) => {
  try {
    const { error, value } = updateSiteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const existingSite = await Site.findById(req.params.id);
    if (!existingSite) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    if (existingSite.user_id !== req.userId) {
      return res.status(403).json({ error: 'Erişim izniniz yok' });
    }

    // Feature gating (plan enforcement)
    try {
      const caps = await Subscription.getUserCapabilities(req.userId);

      const nextCustomDomain = (value?.customDomain == null ? '' : String(value.customDomain)).trim();
      if (nextCustomDomain) {
        if (!caps?.allowCustomDomain) {
          return res.status(403).json({
            error: 'Bu özellik mevcut pakette kullanılamıyor: Özel alan adı (custom domain)'
          });
        }
      }

      const incomingSettings = (value?.settings && typeof value.settings === 'object') ? value.settings : null;
      
      // Branding check
      const wantsHideBranding = Boolean(incomingSettings && incomingSettings.hideBranding);
      if (wantsHideBranding && !caps?.allowHideBranding) {
        return res.status(403).json({
          error: 'Bu özellik mevcut pakette kullanılamıyor: Branding kaldırma'
        });
      }

      // Color check
      const incomingColor = incomingSettings?.color;
      if (incomingColor && !caps?.allowedColors?.includes(incomingColor)) {
        const standardColors = ['blue', 'purple', 'green', 'amber'];
        if (!standardColors.includes(incomingColor)) {
          return res.status(403).json({
            error: 'Seçilen renk tonu mevcut pakette kullanılamıyor. Lütfen Profesyonel plana geçin.'
          });
        }
      }

      // Design controls check
      const wantsGlass = incomingSettings?.themeCustomization?.glassmorphism;
      if (wantsGlass && !caps?.allowedDesignControls?.includes('custom_css')) {
        // We might allow it if it's already set to true in existing site to avoid breaking
        if (!existingSite.settings?.themeCustomization?.glassmorphism) {
          return res.status(403).json({ error: 'Cam efekti (Glassmorphism) Profesyonel plana özeldir.' });
        }
      }
    } catch (gateErr) {
      console.error('❌ Feature gate error:', gateErr);
      return res.status(500).json({
        error: 'Paket kontrolü yapılamadı',
        message: (gateErr?.message || String(gateErr)).toString().slice(0, 500)
      });
    }

    const site = await Site.update(req.params.id, value);
    
    // Clear cache
    try {
      if (site.subdomain) await CacheService.clearStoreCache(`${site.subdomain}.odelink.shop`);
      if (site.custom_domain) await CacheService.clearStoreCache(site.custom_domain);
      if (existingSite.custom_domain && existingSite.custom_domain !== site.custom_domain) {
        await CacheService.clearStoreCache(existingSite.custom_domain);
      }
    } catch (e) {
      console.error('❌ Cache clear error:', e);
    }
    
    // CLOUDFLARE CUSTOM HOSTNAME ENTEGRASYONU
    const nextCustomDomain = (value?.customDomain == null ? '' : String(value.customDomain)).trim().toLowerCase();
    if (nextCustomDomain && nextCustomDomain !== existingSite.custom_domain) {
      setImmediate(async () => {
        try {
          const { addCustomHostname } = require('../services/cloudflareService');
          await addCustomHostname(nextCustomDomain);
          console.log(`✅ Custom Hostname Cloudflare'e eklendi: ${nextCustomDomain}`);
        } catch (err) {
          console.error(`❌ Custom Hostname Cloudflare hatası: ${nextCustomDomain}`, err);
        }
      });
    }

    return res.json({
      success: true,
      message: 'Site güncellendi',
      site
    });

  } catch (error) {
    console.error('❌ Update site error:', error);
    return res.status(500).json({
      error: 'Site güncellenemedi',
      message: (error?.message || String(error)).toString().slice(0, 500)
    });
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
 * POST /api/sites/create-from-export
 * Eklentiden dışa aktarılan JSON dosyasıyla otomatik site oluştur
 */
router.post('/create-from-export', authMiddleware, async (req, res) => {
  try {
    const { products, source, exportDate } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Geçersiz veya boş ürün listesi' });
    }

    console.log(`📦 Export import: ${products.length} ürün, kaynak: ${source || 'bilinmiyor'}`);

    // Kullanıcının mevcut sitesini bul veya yeni oluştur
    const existingSites = await Site.findByUser(req.userId);
    let site;

    if (existingSites && existingSites.length > 0) {
      // Mevcut siteyi güncelle
      site = existingSites[0];
      console.log(`📝 Mevcut site güncelleniyor: ${site.id}`);
    } else {
      // Yeni site oluştur
      const subdomain = 'shop-' + Date.now().toString(36);
      site = await Site.create({
        user_id: req.userId,
        subdomain: subdomain,
        name: 'Mağazam',
        theme: 'starter',
        settings: {}
      });
      console.log(`🆕 Yeni site oluşturuldu: ${site.id}`);
    }

    // Ürünleri siteye işle
    const updatedSettings = {
      ...(site.settings || {}),
      products_data: products,
      catalog_total_products: products.length,
      catalog_refreshed_at: exportDate || new Date().toISOString(),
      catalog_full_sync_complete: true,
      last_sync_method: 'export_import',
      export_source: source || 'shopier'
    };

    await Site.update(site.id, { settings: updatedSettings });

    const siteUrl = `https://${site.subdomain}.odelink.shop`;

    return res.json({
      success: true,
      message: `${products.length} ürün başarıyla aktarıldı ve siteniz oluşturuldu!`,
      siteId: site.id,
      siteUrl: siteUrl,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Export import error:', error);
    return res.status(500).json({ error: 'İçe aktarma başarısız', message: error.message });
  }
});

module.exports = router;

