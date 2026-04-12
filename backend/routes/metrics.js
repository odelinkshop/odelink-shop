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
      country: req.get('cf-ipcountry') || req.get('x-country') || req.get('x-vercel-ip-country') || ''
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
      referrer: req.get('referer') || req.get('referrer') || '',
      ua: req.get('user-agent') || '',
      country: req.get('cf-ipcountry') || req.get('x-country') || req.get('x-vercel-ip-country') || ''
    });
    return res.json({ ok: true });
  } catch (e) {
    console.warn('Click kaydedilemedi:', e?.message || String(e));
    return res.json({ ok: true });
  }
});

module.exports = router;
