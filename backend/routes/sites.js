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
const { newJobId } = require('../services/siteCreationJobWorker');
const { addDnsRecord, deleteDnsRecord } = require('../services/cloudflareService');

const router = express.Router();
// Theme support removed

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
const createSiteSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  shopierUrl: Joi.string().min(3).max(500).required(),
  theme: Joi.string().valid('wear', 'gent').allow(null).optional(),
  settings: Joi.object({
    description: Joi.string().allow('').optional(),
    logoUrl: Joi.string().allow('').optional()
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
  theme: Joi.string().valid('wear', 'gent').allow(null).optional(),
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

    return res.json({
      days,
      totals,
      series,
      breakdowns,
      topProducts,
      realtime: {
        activeVisitors,
        windowSeconds: 60,
        window: realtimeWindow
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

      const payload = {
        days,
        totals,
        series,
        breakdowns,
        topProducts,
        realtime: {
          activeVisitors,
          windowSeconds: 60,
          window: realtimeWindow
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

    let site = await Site.findBySubdomain(subdomain);
    if (!site) {
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

      if ((!hasProducts || !hasAnySizes) && shopierUrl) {
        autoHeal.attempted = true;
        const refreshedAtMs = lastRefreshed ? new Date(lastRefreshed).getTime() : 0;
        const recentlyRefreshed = Boolean(refreshedAtMs) && (Date.now() - refreshedAtMs) < (15 * 60 * 1000);
        // Never skip if products_data is empty; otherwise we can get stuck in an empty state.
        // Only skip if we have evidence of a successful-ish recent sync.
        const shouldSkip = recentlyRefreshed && (lastTotal > 0) && hasProducts;
        if (!shouldSkip) {
          autoHeal.background = true;
          const normalizedShopierUrl = normalizeShopierUrl(shopierUrl);
          fetchShopierCatalog(normalizedShopierUrl, {
            debug: false,
            skipDetails: true,
            detailConcurrency: 3,
            detailMaxProducts: 30
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

    const normalizedShopierUrl = normalizeShopierUrl(value.shopierUrl);
    if (!normalizedShopierUrl) {
      return res.status(400).json({
        error: 'Geçersiz Shopier URL'
      });
    }

    const clampSubdomain = (raw, maxLen = 20) => {
      const cleaned = (raw || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return (cleaned || 'magaza').slice(0, Math.max(1, Number(maxLen) || 20));
    };

    console.log(`🚀 Site oluşturuluyor: ${normalizedShopierUrl}`);
    
    // ÜRÜNLER ANINDA ÇEKİLİYOR - GARANTİLİ SİSTEM
    let products = [];
    let categories = [];
    let totalProducts = 0;
    let catalog = null;
    
    try {
      console.log(`📦 Ürünler çekiliyor (30 saniye timeout)...`);
      
      catalog = await Promise.race([
        fetchShopierCatalog(normalizedShopierUrl, {
          debug: true,
          skipDetails: true,
          bypassCache: true  // YENİ SİTE İÇİN CACHE KULLANMA!
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 30000)  // 30 saniye timeout - Nginx/Cloudflare için
        )
      ]);

      products = Array.isArray(catalog?.products) ? catalog.products : [];
      categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
      totalProducts = products.length;
      
      console.log(`✅ Catalog response:`, {
        productsCount: products.length,
        categoriesCount: categories.length,
        shopName: catalog?.shopName
      });
      
      if (products.length === 0) {
        throw new Error('NO_PRODUCTS');
      }
      
      console.log(`✅ ${totalProducts} ürün başarıyla çekildi`);
    } catch (fetchErr) {
      console.error(`❌ Ürün çekme hatası:`, {
        error: fetchErr,
        message: fetchErr?.message,
        stack: fetchErr?.stack?.split('\n').slice(0, 3)
      });
      
      // HATA MESAJLARINI KULLANICI DOSTU YAP
      const errorMessage = (fetchErr?.message || String(fetchErr)).toString();
      let userMessage = '';
      let errorCode = 'UNKNOWN';
      
      if (errorMessage.includes('TIMEOUT') || errorMessage.includes('timeout') || errorMessage.includes('90 saniye')) {
        userMessage = 'Shopier mağazanız çok yavaş yanıt veriyor. Lütfen birkaç dakika sonra tekrar deneyin.';
        errorCode = 'TIMEOUT';
      } else if (errorMessage.includes('NO_PRODUCTS') || errorMessage.includes('bulunamadı') || errorMessage.includes('ürün bulunamadı')) {
        userMessage = 'Shopier mağazanızda ürün bulunamadı. Mağaza linkini kontrol edin veya mağazanızın herkese açık olduğundan emin olun.';
        errorCode = 'NO_PRODUCTS';
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        userMessage = 'Shopier mağazanız bulunamadı. Lütfen linki kontrol edin.';
        errorCode = 'NOT_FOUND';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        userMessage = 'Shopier mağazanıza erişim engellendi. Mağazanızın herkese açık olduğundan emin olun.';
        errorCode = 'FORBIDDEN';
      } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
        userMessage = 'İnternet bağlantısı hatası. Lütfen tekrar deneyin.';
        errorCode = 'NETWORK_ERROR';
      } else if (errorMessage.includes('Geçersiz') || errorMessage.includes('Invalid')) {
        userMessage = 'Geçersiz Shopier URL. Lütfen doğru link girin.';
        errorCode = 'INVALID_URL';
      } else {
        userMessage = 'Shopier mağazanızdan ürünler çekilemedi. Lütfen mağaza linkinizi kontrol edin ve tekrar deneyin.';
        errorCode = 'FETCH_ERROR';
      }
      
      return res.status(400).json({
        error: 'Ürünler çekilemedi',
        message: userMessage,
        errorCode: errorCode,
        shopierUrl: normalizedShopierUrl
      });
    }

    // SİTE OLUŞTUR - SADECE ÜRÜNLER VARSA!
    if (products.length === 0) {
      return res.status(500).json({
        error: 'Ürün bulunamadı',
        message: 'Shopier mağazanızda ürün bulunamadı veya ürünler çekilemedi. Lütfen kontrol edin.'
      });
    }

    const siteData = {
      userId: req.userId,
      name: value.name,
      shopierUrl: normalizedShopierUrl,
      subdomain: clampSubdomain(value.name, 20),
      theme: value.theme || null,
      settings: {
        ...(value.settings || {}),
        description: (value?.settings?.description || '').toString(),
        created_at: new Date().toISOString(),
        products_data: products,
        collections: categories,
        catalog_total_products: totalProducts,
        catalog_full_sync_complete: true,
        catalog_refreshed_at: new Date().toISOString(),
        shopier_url: normalizedShopierUrl,
        shopierUrl: normalizedShopierUrl,
        catalog_enrichment_status: 'quick_loaded'
      }
    };

    site = await Site.create(siteData);
    console.log(`✅ Site oluşturuldu: ${site.id} (${site.subdomain}) - ${products.length} ürün`);

    // CLOUDFLARE DNS KAYDI EKLE (ARKA PLANDA)
    setImmediate(async () => {
      try {
        await addDnsRecord(site.subdomain);
        console.log(`✅ Cloudflare DNS kaydı eklendi: ${site.subdomain}.odelink.shop`);
      } catch (dnsErr) {
        console.error(`⚠️ Cloudflare DNS kaydı eklenemedi: ${site.subdomain}`, dnsErr);
      }
    });

    // ARKA PLANDA DETAYLI ÇEKİM - HER ZAMAN ÇALIŞ!
    setImmediate(async () => {
      try {
        console.log(`🔄 Detaylı çekim başladı: ${site.id}`);
        
        const fullCatalog = await fetchShopierCatalog(normalizedShopierUrl, {
          debug: false,
          skipDetails: false,
          detailConcurrency: 5,
          detailMaxProducts: 0
        }).catch(err => {
          console.error(`⚠️ Detaylı çekim hatası: ${site.id}`, err);
          return null;
        });

        if (fullCatalog && Array.isArray(fullCatalog.products) && fullCatalog.products.length > 0) {
          await Site.update(site.id, {
            settings: {
              products_data: fullCatalog.products,
              collections: fullCatalog.categories || categories,
              catalog_total_products: fullCatalog.products.length,
              catalog_enrichment_status: 'completed',
              catalog_full_sync_complete: true,
              catalog_refreshed_at: new Date().toISOString()
            }
          }).catch(err => console.error(`⚠️ Detaylı güncelleme hatası: ${site.id}`, err));
          
          console.log(`✅ Detaylı ürün yüklendi: ${site.id} (${fullCatalog.products.length} ürün)`);
        }
      } catch (detailErr) {
        console.error(`❌ Detaylı çekim hatası: ${site.id}`, detailErr);
      }
    });

    // BAŞARILI CEVAP DÖN - ÜRÜNLERLE!
    return res.status(201).json({
      ok: true,
      site: {
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        shopierUrl: site.shopier_url,
        createdAt: site.created_at,
        url: `https://www.odelink.shop/s/${site.subdomain}`,
        productsLoaded: products.length
      },
      message: `Site oluşturuldu! ${products.length} ürün yüklendi. Detaylar arka planda hazırlanıyor...`
    });

  } catch (error) {
    console.error('❌ Create site error:', error);
    
    // Eğer site oluşturulduysa ama hata olduysa, yine de başarılı dön
    if (site && site.id) {
      return res.status(201).json({
        ok: true,
        site: {
          id: site.id,
          name: site.name,
          subdomain: site.subdomain,
          shopierUrl: site.shopier_url,
          createdAt: site.created_at,
          url: `https://www.odelink.shop/s/${site.subdomain}`
        },
        message: 'Site oluşturuldu! Ürünler yükleniyor...'
      });
    }
    
    // Gerçekten hata varsa
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
      const wantsHideBranding = Boolean(incomingSettings && incomingSettings.hideBranding);
      if (wantsHideBranding && !caps?.allowHideBranding) {
        return res.status(403).json({
          error: 'Bu özellik mevcut pakette kullanılamıyor: Branding kaldırma'
        });
      }
    } catch (gateErr) {
      console.error('❌ Feature gate error:', gateErr);
      return res.status(500).json({
        error: 'Paket kontrolü yapılamadı',
        message: (gateErr?.message || String(gateErr)).toString().slice(0, 500)
      });
    }

    const site = await Site.update(req.params.id, value);
    
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

    // CLOUDFLARE DNS KAYDI SİL (ARKA PLANDA)
    const subdomain = existingSite.subdomain;
    if (subdomain) {
      setImmediate(async () => {
        try {
          await deleteDnsRecord(subdomain);
          console.log(`✅ Cloudflare DNS kaydı silindi: ${subdomain}.odelink.shop`);
        } catch (dnsErr) {
          console.error(`⚠️ Cloudflare DNS kaydı silinemedi: ${subdomain}`, dnsErr);
        }
      });
    }
    
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

module.exports = router;
