const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.get('/monthly-summary', authMiddleware, async (req, res) => {
  try {
    const capabilities = await Subscription.getUserCapabilities(req.userId);

    if (!capabilities?.monthlyReportDownload) {
      return res.status(403).json({ error: 'Bu rapor yalnızca profesyonel paketlerde kullanılabilir.' });
    }

    const endDateRes = await pool.query('SELECT CURRENT_DATE as d');
    const endDate = endDateRes.rows?.[0]?.d;

    const siteStatsRes = await pool.query(
      `SELECT 
        COUNT(*) as total_sites,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sites,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_sites
       FROM sites
       WHERE user_id = $1`,
      [req.userId]
    );

    const siteStats = siteStatsRes.rows?.[0] || {};

    let analytics = null;
    if (capabilities.tier === 'standart' || capabilities.tier === 'profesyonel') {
      const analyticsRes = await pool.query(
        `SELECT 
          COALESCE(SUM(sa.page_views), 0) as page_views,
          COALESCE(SUM(sa.unique_visitors), 0) as unique_visitors,
          COALESCE(SUM(sa.clicks), 0) as clicks
         FROM site_analytics sa
         JOIN sites s ON sa.site_id = s.id
         WHERE s.user_id = $1 AND sa.date >= (CURRENT_DATE - INTERVAL '30 days')`,
        [req.userId]
      );
      analytics = analyticsRes.rows?.[0] || {};
    }

    const report = {
      periodDays: 30,
      endDate,
      tier: capabilities.tier,
      billingCycle: capabilities.billingCycle,
      sites: {
        total: Number(siteStats.total_sites || 0),
        active: Number(siteStats.active_sites || 0),
        newLast30Days: Number(siteStats.recent_sites || 0)
      }
    };

    if (analytics) {
      report.analytics = {
        pageViews: Number(analytics.page_views || 0),
        uniqueVisitors: Number(analytics.unique_visitors || 0),
        clicks: Number(analytics.clicks || 0)
      };
    }

    if (capabilities.tier === 'profesyonel') {
      report.profesyonel = {
        allowCustomDomain: capabilities.allowCustomDomain,
        maxSites: capabilities.maxSites
      };
    }

    return res.json({ report });
  } catch (e) {
    return res.status(500).json({ error: 'Rapor alınamadı' });
  }
});

module.exports = router;
