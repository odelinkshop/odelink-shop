const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const AnalyticsStore = require('../models/AnalyticsStore');

const router = express.Router();

router.get('/monthly-summary', authMiddleware, async (req, res) => {
  try {
    const capabilities = await Subscription.getUserCapabilities(req.userId);
    if (!capabilities?.monthlyReportDownload) {
      return res.status(403).json({ error: 'Bu rapor yalnızca profesyonel paketlerde kullanılabilir.' });
    }

    const siteStatsRes = await pool.query(
      `SELECT COUNT(*) as total_sites FROM sites WHERE user_id = $1`,
      [req.userId]
    );

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

    return res.json({ 
      report: {
        sites: siteStatsRes.rows?.[0] || {},
        analytics: analyticsRes.rows?.[0] || {},
        tier: capabilities.tier
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Rapor alınamadı' });
  }
});

/**
 * GET /api/reports/download
 * Generates a professional, comprehensive Nova Elite Intelligence Report (HTML).
 */
router.get('/download', authMiddleware, async (req, res) => {
  try {
    const capabilities = await Subscription.getUserCapabilities(req.userId);
    if (!capabilities?.monthlyReportDownload && capabilities?.tier !== 'profesyonel') {
      return res.status(403).json({ error: 'Profesyonel rapor erişimi için aboneliğinizi yükseltin.' });
    }

    // 1. Gather Deep Intelligence
    const userId = req.userId;
    
    // Global User Stats
    const statsRes = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM sites WHERE user_id = $1) as total_sites,
        (SELECT COALESCE(SUM(page_views), 0) FROM site_analytics sa JOIN sites s ON sa.site_id = s.id WHERE s.user_id = $1 AND sa.date >= (CURRENT_DATE - INTERVAL '30 days')) as total_views,
        (SELECT COALESCE(SUM(clicks), 0) FROM site_analytics sa JOIN sites s ON sa.site_id = s.id WHERE s.user_id = $1 AND sa.date >= (CURRENT_DATE - INTERVAL '30 days')) as total_clicks`,
      [userId]
    );
    const stats = statsRes.rows[0];

    // Top Performing Sites
    const topSitesRes = await pool.query(
      `SELECT s.name, s.subdomain, SUM(sa.page_views) as views, SUM(sa.clicks) as clicks
       FROM sites s
       JOIN site_analytics sa ON s.id = sa.site_id
       WHERE s.user_id = $1 AND sa.date >= (CURRENT_DATE - INTERVAL '30 days')
       GROUP BY s.id
       ORDER BY views DESC LIMIT 5`,
      [userId]
    );

    // Device & Browser Distribution (Global for all user sites)
    const distributionRes = await pool.query(
      `SELECT device_type, browser, COUNT(*) as count
       FROM analytics_events ae
       JOIN sites s ON ae.site_id = s.id
       WHERE s.user_id = $1 AND ae.ts >= (NOW() - INTERVAL '30 days')
       GROUP BY device_type, browser`,
      [userId]
    );

    // 2. Generate HTML Report Template
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const views = Number(stats.total_views);
    const clicks = Number(stats.total_clicks);
    const cr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

    // Aristocratic CEO Summary logic
    let insight = "Nova platformu üzerinden istikrarlı bir büyüme gözlemleniyor.";
    if (Number(cr) > 5) insight = "Mağaza dönüşüm oranlarınız (CR) %5 eşiğinin üzerinde, pazar ortalamasının üstünde bir performans!";
    if (views > 1000) insight += " Yüksek trafik hacmi, marka bilinirliğinizin aristokratik bir seviyeye ulaştığını gösteriyor.";

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Nova Elite Intelligence Report - ${dateStr}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:wght@700;900&display=swap');
        
        :root {
            --gold: #C5A059;
            --black: #0A0A0A;
            --dark-grey: #1A1A1A;
            --white: #F2EBE1;
        }

        body {
            background-color: var(--black);
            color: var(--white);
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid rgba(197, 160, 89, 0.2);
            padding: 60px;
            background: linear-gradient(145deg, #0D0D0D 0%, #050505 100%);
        }

        .header {
            border-bottom: 2px solid var(--gold);
            padding-bottom: 30px;
            margin-bottom: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .logo {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 900;
            color: var(--gold);
            letter-spacing: -1px;
        }

        .report-title {
            text-align: right;
        }

        .report-title h1 {
            font-[9px];
            text-transform: uppercase;
            letter-spacing: 5px;
            color: var(--gold);
            margin: 0;
            opacity: 0.6;
        }

        .report-title p {
            font-size: 14px;
            margin: 5px 0 0 0;
            font-weight: 700;
        }

        .ceo-summary {
            background: rgba(197, 160, 89, 0.05);
            border-left: 4px solid var(--gold);
            padding: 30px;
            margin-bottom: 50px;
        }

        .ceo-summary h2 {
            font-family: 'Playfair Display', serif;
            color: var(--gold);
            margin-top: 0;
            font-size: 24px;
        }

        .stats-grid {
            display: grid;
            grid-template-cols: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 50px;
        }

        .stat-card {
            background: var(--dark-grey);
            padding: 25px;
            border: 1px solid rgba(255,255,255,0.05);
            text-align: center;
        }

        .stat-card .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--gold);
            opacity: 0.7;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 32px;
            font-family: 'Playfair Display', serif;
            font-weight: 900;
        }

        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 15px;
            margin-bottom: 25px;
            color: var(--gold);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 50px;
        }

        th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--gold);
            padding: 15px;
            border-bottom: 1px solid rgba(197, 160, 89, 0.2);
        }

        td {
            padding: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 14px;
        }

        .footer {
            margin-top: 100px;
            text-align: center;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: var(--gold);
            opacity: 0.4;
        }

        @media print {
            body { padding: 0; background: white; color: black; }
            .container { border: none; width: 100%; max-width: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NOVA</div>
            <div class="report-title">
                <h1>Elite Intelligence Report</h1>
                <p>${dateStr}</p>
            </div>
        </div>

        <div class="ceo-summary">
            <h2>Yönetici Özeti</h2>
            <p>${insight}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Toplam Görüntülenme</div>
                <div class="value">${views.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <div class="label">Toplam Tıklama</div>
                <div class="value">${clicks.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <div class="label">Dönüşüm Oranı (CR)</div>
                <div class="value">%${cr}</div>
            </div>
        </div>

        <div class="section-title">Performans Özeti (Top 5 Mağaza)</div>
        <table>
            <thead>
                <tr>
                    <th>Mağaza Adı</th>
                    <th>Subdomain</th>
                    <th>Görüntülenme</th>
                    <th>Tıklama</th>
                </tr>
            </thead>
            <tbody>
                ${topSitesRes.rows.map(s => `
                    <tr>
                        <td style="font-weight:bold">${s.name}</td>
                        <td style="opacity:0.6">${s.subdomain}.odelink.shop</td>
                        <td>${Number(s.views).toLocaleString()}</td>
                        <td>${Number(s.clicks).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="section-title">Teknik Erişim Analizi</div>
        <p style="font-size:12px; opacity:0.7; margin-bottom:20px">Son 30 gün içindeki cihaz ve tarayıcı dağılımı:</p>
        <table>
            <thead>
                <tr>
                    <th>Cihaz Tipi</th>
                    <th>Tarayıcı</th>
                    <th>Erişim Sayısı</th>
                </tr>
            </thead>
            <tbody>
                ${distributionRes.rows.slice(0, 8).map(d => `
                    <tr>
                        <td style="text-transform:uppercase">${d.device_type}</td>
                        <td style="text-transform:uppercase">${d.browser}</td>
                        <td>${Number(d.count).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            Nova Strategic Intelligence Division &copy; 2024 - Confidential
        </div>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=Nova_Elite_Report_${new Date().getTime()}.html`);
    return res.send(html);

  } catch (e) {
    console.error('❌ Report Download Error:', e);
    return res.status(500).json({ error: 'Rapor oluşturulamadı' });
  }
});

module.exports = router;
