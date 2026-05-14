const express = require('express');
const authMiddleware = require('../middleware/auth');
const AnalyticsStore = require('../models/AnalyticsStore');
const Site = require('../models/Site');

const router = express.Router();

const ACTIVE_WINDOW_MS = 60 * 1000;
const MAX_TRACK_MS = 10 * 60 * 1000;

router.post('/heartbeat', async (req, res) => {
  try {
    const visitorId = typeof req.body?.visitorId === 'string' ? req.body.visitorId.trim() : '';
    if (!visitorId || visitorId.length > 128) {
      return res.status(400).json({ error: 'visitorId gerekli' });
    }

    const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 256) : '';
    await AnalyticsStore.recordVisitorHeartbeat({ visitorId, path });

    return res.json({ ok: true });
  } catch (e) {
    console.warn('Heartbeat kaydedilemedi:', e?.message || String(e));
    return res.json({ ok: true });
  }
});

router.get('/active-visitors', authMiddleware, async (req, res) => {
  try {
    const adminKey = process.env.ADMIN_METRICS_KEY;
    if (adminKey) {
      const provided = req.header('x-odelink-admin-key');
      if (provided !== adminKey) {
        return res.status(403).json({ error: 'Yetkisiz' });
      }
    }

    const active = await AnalyticsStore.getActiveVisitorCount({
      activeWindowMs: ACTIVE_WINDOW_MS,
      maxTrackMs: MAX_TRACK_MS
    });

    return res.json({
      activeVisitors: active,
      windowSeconds: Math.round(ACTIVE_WINDOW_MS / 1000)
    });
  } catch (e) {
    return res.status(500).json({ error: 'Sayaç alınamadı' });
  }
});

router.post('/site-view', async (req, res) => {
  try {
    const subdomain = typeof req.body?.subdomain === 'string' ? req.body.subdomain.trim().toLowerCase() : '';
    if (!subdomain) {
      return res.status(400).json({ error: 'subdomain gerekli' });
    }

    const visitorId = typeof req.body?.visitorId === 'string' ? req.body.visitorId.trim() : '';
    const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 256) : '';
    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    await AnalyticsStore.trackSiteView({ siteId: site.id, visitorId });
    await AnalyticsStore.recordEvent({
      siteId: site.id,
      type: 'page_view',
      path,
      referrer: req.get('referer') || req.get('referrer') || '',
      ua: req.get('user-agent') || '',
      country: req.get('cf-ipcountry') || req.get('x-country') || req.get('x-vercel-ip-country') || '',
      req
    });
    return res.json({ ok: true });
  } catch (e) {
    console.warn('Site view kaydedilemedi:', e?.message || String(e));
    return res.json({ ok: true });
  }
});

router.post('/click', async (req, res) => {
  try {
    const subdomain = typeof req.body?.subdomain === 'string' ? req.body.subdomain.trim().toLowerCase() : '';
    if (!subdomain) {
      return res.status(400).json({ error: 'subdomain gerekli' });
    }

    const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 256) : '';
    const productKey = typeof req.body?.productKey === 'string' ? req.body.productKey.trim().slice(0, 256) : '';
    const clickX = typeof req.body?.x === 'number' ? req.body.x : null;
    const clickY = typeof req.body?.y === 'number' ? req.body.y : null;
    const screenWidth = typeof req.body?.screenWidth === 'number' ? req.body.screenWidth : null;
    const screenHeight = typeof req.body?.screenHeight === 'number' ? req.body.screenHeight : null;

    const site = await Site.findBySubdomain(subdomain);
    if (!site) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }

    await AnalyticsStore.incrementSiteClick(site.id);
    await AnalyticsStore.recordEvent({
      siteId: site.id,
      type: 'click',
      path,
      productKey,
      clickX,
      clickY,
      screenWidth,
      screenHeight,
      referrer: req.get('referer') || req.get('referrer') || '',
      ua: req.get('user-agent') || '',
      country: req.get('cf-ipcountry') || req.get('x-country') || req.get('x-vercel-ip-country') || '',
      req
    });
    return res.json({ ok: true });
  } catch (e) {
    console.warn('Click kaydedilemedi:', e?.message || String(e));
    return res.json({ ok: true });
  }
});

// --- YENİ E-TİCARET ANALİTİK ENDPOINT'LERİ ---

router.post('/add-to-cart', async (req, res) => {
  try {
    const { subdomain, path, productKey, amount } = req.body;
    const site = await Site.findBySubdomain(subdomain);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });

    await AnalyticsStore.recordEvent({
      siteId: site.id,
      type: 'add_to_cart',
      path,
      productKey,
      amount,
      req
    });
    return res.json({ ok: true });
  } catch (e) { return res.json({ ok: true }); }
});

router.post('/begin-checkout', async (req, res) => {
  try {
    const { subdomain, path, amount } = req.body;
    const site = await Site.findBySubdomain(subdomain);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });

    await AnalyticsStore.recordEvent({
      siteId: site.id,
      type: 'begin_checkout',
      path,
      amount,
      req
    });
    return res.json({ ok: true });
  } catch (e) { return res.json({ ok: true }); }
});

router.post('/purchase', async (req, res) => {
  try {
    const { subdomain, path, amount, productKey } = req.body;
    const site = await Site.findBySubdomain(subdomain);
    if (!site) return res.status(404).json({ error: 'Site bulunamadı' });

    await AnalyticsStore.recordEvent({
      siteId: site.id,
      type: 'purchase',
      path,
      amount,
      productKey,
      req
    });
    return res.json({ ok: true });
  } catch (e) { return res.json({ ok: true }); }
});

router.get('/detailed-stats/:siteId', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { days } = req.query;

    // Sitenin kullanıcıya ait olduğundan emin ol
    const site = await Site.findById(siteId);
    if (!site || site.user_id !== req.userId) {
      return res.status(403).json({ error: 'Bu siteye erişim yetkiniz yok' });
    }

    const stats = await AnalyticsStore.getDetailedSiteAnalytics({ siteId, days });
    const liveCount = await AnalyticsStore.getActiveVisitorCountByPrefix(siteId);

    return res.json({
      ...stats,
      liveCount
    });
  } catch (e) {
    console.error('Detailed stats error:', e);
    return res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

module.exports = router;
