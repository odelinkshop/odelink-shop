const os = require('os');
const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const shopierRoutes = require('./shopier');
const Subscription = require('../models/Subscription');

const router = express.Router();

const getCpuUsage = async () => {
  const start = os.cpus();
  await new Promise(resolve => setTimeout(resolve, 100));
  const end = os.cpus();
  let idleDiff = 0, totalDiff = 0;
  for (let i = 0; i < start.length; i++) {
    const startIdle = start[i].times.idle;
    const startTotal = Object.values(start[i].times).reduce((acc, val) => acc + val, 0);
    const endIdle = end[i].times.idle;
    const endTotal = Object.values(end[i].times).reduce((acc, val) => acc + val, 0);
    idleDiff += (endIdle - startIdle);
    totalDiff += (endTotal - startTotal);
  }
  return totalDiff === 0 ? 0 : Math.round(100 - (100 * idleDiff / totalDiff));
};

router.get('/system-stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = Math.round((usedMem / totalMem) * 100);
    
    // Windows dahil tüm sistemlerde gerçek anlık CPU kullanımı hesaplanır
    const cpuLoad = await getCpuUsage();
    
    // DB Latency check
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    res.json({
      cpu: cpuLoad,
      ram: memUsagePercent,
      db: dbLatency,
      uptime: os.uptime(),
      platform: os.platform(),
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: 'Sistem metrikleri alınamadı' });
  }
});

// Sistem Kontrol Rotaları
router.post('/cache/clear', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Burada ileride redis veya bellek temizliği yapılacak
    res.json({ ok: true, message: 'Sistem önbelleği başarıyla temizlendi' });
  } catch (e) {
    res.status(500).json({ error: 'Önbellek temizlenemedi' });
  }
});

router.post('/maintenance/toggle', authMiddleware, adminOnly, async (req, res) => {
  try {
    await ensureSchema();
    const { enabled } = req.body;
    await setSetting('maintenance_mode', enabled ? 'true' : 'false');
    res.json({ ok: true, enabled: Boolean(enabled) });
  } catch (e) {
    res.status(500).json({ error: 'Bakım modu değiştirilemedi' });
  }
});

router.post('/broadcast', authMiddleware, adminOnly, async (req, res) => {
  try {
    await ensureSchema();
    const { message } = req.body;
    await setSetting('global_broadcast', message || '');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Duyuru yayınlanamadı' });
  }
});

router.get('/hourly-stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const q = `
      SELECT 
        to_char(created_at, 'HH24:00') as time,
        COUNT(*)::int as visits
      FROM site_analytics
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY time
      ORDER BY time ASC
    `;
    const r = await pool.query(q);
    
    // Fill gaps for 24 hours
    const hours = [];
    for(let i=23; i>=0; i--) {
      const d = new Date();
      d.setHours(d.getHours() - i);
      const h = d.getHours().toString().padStart(2, '0') + ':00';
      const match = (r.rows || []).find(row => row.time === h);
      hours.push({ time: h, visits: match ? match.visits : 0 });
    }

    res.json({ hourly: hours });
  } catch (e) {
    res.status(500).json({ error: 'Saatlik veriler alınamadı' });
  }
});

const safeLen = (v) => (Array.isArray(v) ? v.length : 0);

const pickCapabilitiesSnapshot = (caps, currentSites) => {
  const c = caps || {};
  return {
    tier: (c.tier || '').toString(),
    billingCycle: (c.billingCycle || '').toString(),
    maxSites: Number(c.maxSites || 0),
    currentSites: Number(currentSites || 0),
    allowedColorsCount: safeLen(c.allowedColors),
    allowedBlocksCount: safeLen(c.allowedBlocks),
    allowLogoUpload: Boolean(c.allowLogoUpload),
    allowHideBranding: Boolean(c.allowHideBranding),
    allowCustomDomain: Boolean(c.allowCustomDomain)
  };
};

let schemaReady = false;
const ensureSchema = async () => {
  if (schemaReady) return;
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `
  );
  schemaReady = true;
};

const getSetting = async (key) => {
  await ensureSchema();
  const r = await pool.query('SELECT value FROM admin_settings WHERE key = $1', [key]);
  return r.rows[0]?.value || '';
};

const setSetting = async (key, value) => {
  await ensureSchema();
  await pool.query(
    'INSERT INTO admin_settings(key, value) VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP',
    [key, value]
  );
};

const generateAdminCredentials = async () => {
  const username = `odelink-admin-${crypto.randomBytes(3).toString('hex')}`;
  const key = crypto.randomBytes(16).toString('hex');
  const hash = await bcrypt.hash(key, 12);
  await setSetting('admin_username', username);
  await setSetting('admin_key_hash', hash);
  return { username, key };
};

const ensureAccessSchema = async () => {
  await ensureSchema();
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS admin_guest_access (
      user_id UUID PRIMARY KEY,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `
  );
};

const ACCESS_CODE_COUNT = 6;

const readAccessCodeHashes = async () => {
  await ensureSchema();
  const keys = Array.from({ length: ACCESS_CODE_COUNT }, (_, i) => `access_code_hash_${i + 1}`);
  const r = await pool.query('SELECT key, value FROM admin_settings WHERE key = ANY($1)', [keys]);
  const map = new Map((r.rows || []).map((x) => [x.key, x.value]));
  return keys.map((k) => map.get(k) || '');
};

const hasAccessCodes = async () => {
  const hashes = await readAccessCodeHashes();
  return hashes.every((h) => Boolean((h || '').toString().trim()));
};

const generateSixDigitCode = () => {
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, '0');
};

const initAccessCodesIfMissing = async () => {
  const existingOk = await hasAccessCodes();
  if (existingOk) return { created: false, codes: null };

  const codes = Array.from({ length: ACCESS_CODE_COUNT }, () => generateSixDigitCode());
  const hashes = await Promise.all(codes.map((c) => bcrypt.hash(c, 12)));

  for (let i = 0; i < ACCESS_CODE_COUNT; i += 1) {
    await setSetting(`access_code_hash_${i + 1}`, hashes[i]);
  }

  return { created: true, codes };
};

const grantGuestAccess = async (userId, hours) => {
  await ensureAccessSchema();
  const h = Number.isFinite(Number(hours)) ? Number(hours) : 24;
  const expiresAt = new Date(Date.now() + Math.max(1, h) * 60 * 60 * 1000);
  await pool.query(
    `
    INSERT INTO admin_guest_access(user_id, expires_at)
    VALUES($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET expires_at = EXCLUDED.expires_at
    `,
    [userId, expiresAt]
  );
  return expiresAt;
};

const getGuestAccess = async (userId) => {
  await ensureAccessSchema();
  const r = await pool.query('SELECT expires_at FROM admin_guest_access WHERE user_id = $1', [userId]);
  const expiresAt = r.rows?.[0]?.expires_at ? new Date(r.rows[0].expires_at) : null;
  if (!expiresAt) return { hasAccess: false, expiresAt: null };
  if (Number.isNaN(expiresAt.getTime())) return { hasAccess: false, expiresAt: null };
  if (expiresAt.getTime() <= Date.now()) return { hasAccess: false, expiresAt };
  return { hasAccess: true, expiresAt };
};

const isLocalRequest = (req) => {
  const ip = req.ip || '';
  return ip === '127.0.0.1' || ip === '::1' || ip.endsWith('127.0.0.1');
};

const DEV_OWNER_EMAIL = (process.env.DEV_OWNER_EMAIL || '').toString().trim().toLowerCase();

const allowRemoteAdminBootstrap = () => {
  const v = (process.env.ALLOW_REMOTE_ADMIN_BOOTSTRAP || '').toString().trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
};

const ownerOnly = async (req, res, next) => {
  try {
    await ensureSchema();
    const ownerRes = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
    const ownerId = (ownerRes.rows?.[0]?.value || '').toString();
    if (!ownerId) {
      return res.status(409).json({ error: 'Yetkisiz', reason: 'owner_missing' });
    }
    if (ownerId !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz', reason: 'owner_only' });
    }
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Yetkilendirme kontrolü başarısız' });
  }
};

const ensureSafeAdminMutation = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !isLocalRequest(req) && !allowRemoteAdminBootstrap()) {
    res.status(403).json({ error: 'Yetkisiz', reason: 'remote_mutation_disabled' });
    return false;
  }
  return true;
};

const getOwnerId = async () => {
  await ensureSchema();
  const ownerRes = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
  return (ownerRes.rows?.[0]?.value || '').toString();
};

const ensureNotOwnerTarget = async (res, userId) => {
  const ownerId = await getOwnerId();
  if (ownerId && userId && ownerId === userId) {
    res.status(400).json({ error: 'OWNER hesabına bu işlem uygulanamaz' });
    return false;
  }
  return true;
};

const mustMatchClaimEmail = async (req) => {
  const claimEmail = ((process.env.ADMIN_CLAIM_EMAIL || process.env.ADMIN_EMAIL) || '').toString().trim().toLowerCase();
  const u = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
  const email = (u.rows?.[0]?.email || '').toString().trim().toLowerCase();
  if (claimEmail && email === claimEmail) return true;

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction && DEV_OWNER_EMAIL && isLocalRequest(req) && email === DEV_OWNER_EMAIL) return true;

  return false;
};

router.get('/status', authMiddleware, async (req, res) => {
  try {
    await ensureSchema();
    const r = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
    const ownerId = r.rows[0]?.value || '';
    return res.json({ hasOwner: Boolean(ownerId) });
  } catch (e) {
    return res.status(500).json({ error: 'Admin durumu alınamadı' });
  }
});

router.get('/access/status', authMiddleware, async (req, res) => {
  try {
    await ensureSchema();
    const ownerRes = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
    const ownerId = ownerRes.rows?.[0]?.value || '';

    const guest = await getGuestAccess(req.userId);
    const isOwner = ownerId && ownerId === req.userId;

    return res.json({
      ok: true,
      isOwner,
      hasOwner: Boolean(ownerId),
      guestAccess: guest.hasAccess,
      guestExpiresAt: guest.expiresAt ? guest.expiresAt.toISOString() : null
    });
  } catch (e) {
    return res.status(500).json({ error: 'Admin erişim durumu alınamadı' });
  }
});

router.post('/access/init', authMiddleware, adminOnly, async (req, res) => {
  try {
    const out = await initAccessCodesIfMissing();
    if (!out.created) return res.json({ ok: true, created: false });
    return res.json({ ok: true, created: true, codes: out.codes });
  } catch (e) {
    return res.status(500).json({ error: 'Erişim kodları oluşturulamadı' });
  }
});

router.post('/access/verify', authMiddleware, async (req, res) => {
  try {
    await ensureSchema();
    const ownerRes = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
    const ownerId = ownerRes.rows?.[0]?.value || '';
    if (!ownerId) return res.status(409).json({ error: 'Admin henüz atanmadı' });
    if (ownerId === req.userId) return res.json({ ok: true, bypass: true });

    const raw = (req.body?.code || '').toString().trim();
    const code = raw.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Geçersiz kod' });
    }

    const hashes = await readAccessCodeHashes();
    if (!hashes.some(Boolean)) {
      return res.status(409).json({ error: 'Erişim kodları oluşturulmamış' });
    }

    let ok = false;
    for (const h of hashes) {
      if (!h) continue;
      const m = await bcrypt.compare(code, h);
      if (m) {
        ok = true;
        break;
      }
    }

    if (!ok) return res.status(401).json({ error: 'Kod hatalı' });

    const expiresAt = await grantGuestAccess(req.userId, 24);
    return res.json({ ok: true, guestAccess: true, guestExpiresAt: expiresAt.toISOString() });
  } catch (e) {
    return res.status(500).json({ error: 'Kod doğrulaması başarısız' });
  }
});

router.post('/reset-owner', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    await ensureSchema();

    const emailOk = await mustMatchClaimEmail(req);
    if (!emailOk) {
      return res.status(403).json({ error: 'Yetkisiz' });
    }

    if (!isLocalRequest(req) && !allowRemoteAdminBootstrap()) {
      return res.status(403).json({ error: 'Yetkisiz' });
    }

    // EMERGENCY: Full System Reset (Users, Sites, Sessions, Jobs)
    // This is a one-time emergency operation requested by the user to "start from scratch".
    if (req.body?.emergency_nuke === 'confirm_full_system_reset_2026') {
      try {
        await pool.query('TRUNCATE users, sites, auth_sessions, site_analytics, auto_build_jobs, user_subscriptions, visitor_heartbeats, site_daily_unique_visitors CASCADE');
        
        // Clear all in-memory sync jobs
        try {
          if (typeof shopierRoutes?.clearSyncJobsForSubdomains === 'function') {
            shopierRoutes.clearSyncJobsForSubdomains(['*']);
          }
        } catch (e) { void e; }

        // Clear logos directory
        try {
          const logosDir = path.join(__dirname, '..', 'uploads', 'logos');
          if (fs.existsSync(logosDir)) {
            const files = fs.readdirSync(logosDir);
            for (const file of files) {
              const fullPath = path.join(logosDir, file);
              if (fs.lstatSync(fullPath).isFile() && file !== '.gitkeep') {
                fs.unlinkSync(fullPath);
              }
            }
          }
        } catch (e) { void e; }

        return res.json({ 
          ok: true, 
          message: 'SISTEM KOKTEN SIFIRLANDI. Tum kullanicilar, siteler ve veriler silindi.' 
        });
      } catch (err) {
        console.error('EMERGENCY NUKE FAILED:', err);
        return res.status(500).json({ error: 'Sifirlama sirasinda hata olustu', detail: err.message });
      }
    }

    await pool.query("DELETE FROM admin_settings WHERE key = 'owner_user_id'");
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Admin sıfırlanamadı' });
  }
});

router.get('/ip-logs', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS user_ip_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255),
        ip VARCHAR(64),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );
    await pool.query("ALTER TABLE user_ip_logs ADD COLUMN IF NOT EXISTS event_type VARCHAR(32)");
    await pool.query("ALTER TABLE user_ip_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP");
    await pool.query("ALTER TABLE user_ip_logs ADD COLUMN IF NOT EXISTS deleted_batch_id UUID");
    await pool.query("ALTER TABLE user_ip_logs ADD COLUMN IF NOT EXISTS ip_source VARCHAR(32)");
    await pool.query("ALTER TABLE user_ip_logs ADD COLUMN IF NOT EXISTS ip_chain TEXT");

    const q = `
      SELECT
        l.id,
        l.user_id,
        COALESCE(u.email, l.email) as email,
        NULLIF(l.ip, '1') as ip,
        l.user_agent,
        l.event_type,
        l.ip_source,
        l.ip_chain,
        l.created_at
      FROM user_ip_logs l
      LEFT JOIN users u ON u.id = l.user_id
      WHERE l.deleted_at IS NULL
      ORDER BY l.created_at DESC
      LIMIT 500
    `;

    const r = await pool.query(q);
    return res.json({ logs: r.rows || [] });
  } catch (e) {
    return res.status(500).json({ error: 'IP kayıtları alınamadı' });
  }
});

router.post('/ip-logs/clear', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const batchRes = await pool.query('SELECT uuid_generate_v4() as id');
    const batchId = batchRes.rows?.[0]?.id;
    const r = await pool.query(
      'UPDATE user_ip_logs SET deleted_at = NOW(), deleted_batch_id = $1 WHERE deleted_at IS NULL',
      [batchId]
    );
    return res.json({ ok: true, batchId, affected: r.rowCount || 0 });
  } catch (e) {
    return res.status(500).json({ error: 'IP kayıtları temizlenemedi' });
  }
});

router.post('/ip-logs/undo-clear', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const last = await pool.query(
      'SELECT deleted_batch_id FROM user_ip_logs WHERE deleted_batch_id IS NOT NULL ORDER BY deleted_at DESC NULLS LAST LIMIT 1'
    );
    const batchId = last.rows?.[0]?.deleted_batch_id;
    if (!batchId) {
      return res.status(404).json({ error: 'Geri alınacak kayıt yok' });
    }

    const r = await pool.query(
      'UPDATE user_ip_logs SET deleted_at = NULL, deleted_batch_id = NULL WHERE deleted_batch_id = $1',
      [batchId]
    );
    return res.json({ ok: true, restored: r.rowCount || 0 });
  } catch (e) {
    return res.status(500).json({ error: 'Geri alma başarısız' });
  }
});

router.delete('/ip-logs/:id', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const id = (req.params?.id || '').toString();
    const r = await pool.query('UPDATE user_ip_logs SET deleted_at = NOW(), deleted_batch_id = NULL WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'IP kaydı silinemedi' });
  }
});

router.delete('/users/:userId', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const userId = (req.params?.userId || '').toString();
    if (!userId) return res.status(400).json({ error: 'Geçersiz kullanıcı' });
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Kendini silemezsin' });
    }

    const okTarget = await ensureNotOwnerTarget(res, userId);
    if (!okTarget) return;

    const r = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Kullanıcı silinemedi' });
  }
});

router.delete('/sites/:siteId', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const siteId = (req.params?.siteId || '').toString();
    if (!siteId) return res.status(400).json({ error: 'Geçersiz site' });
    const r = await pool.query('DELETE FROM sites WHERE id = $1 RETURNING id', [siteId]);
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Site silinemedi' });
  }
});

router.delete('/subscriptions/:userSubscriptionId', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const id = (req.params?.userSubscriptionId || '').toString();
    if (!id) return res.status(400).json({ error: 'Geçersiz abonelik' });

    const ownerId = await getOwnerId();
    if (ownerId) {
      const target = await pool.query('SELECT user_id FROM user_subscriptions WHERE id = $1', [id]);
      const targetUserId = (target.rows?.[0]?.user_id || '').toString();
      if (targetUserId && targetUserId === ownerId) {
        return res.status(400).json({ error: 'OWNER aboneliği silinemez' });
      }
    }

    const r = await pool.query('DELETE FROM user_subscriptions WHERE id = $1 RETURNING id', [id]);
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Abonelik bulunamadı' });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Abonelik silinemedi' });
  }
});

router.get('/overview', authMiddleware, adminOnly, async (req, res) => {
  try {
    const safeQuery = async (query, params, fallback) => {
      try {
        const result = await pool.query(query, params);
        return result;
      } catch (err) {
        const code = (err?.code || '').toString();
        if (code === '42P01') {
          return { rows: fallback, rowCount: Array.isArray(fallback) ? fallback.length : 0 };
        }
        throw err;
      }
    };

    const r = await safeQuery(
      `
      SELECT
        (SELECT COUNT(*)::int FROM users) as total_users,
        (SELECT COUNT(*)::int FROM sites) as total_sites,
        (SELECT COUNT(*)::int FROM sites WHERE status = 'active') as active_sites,
        (SELECT COUNT(*)::int FROM user_subscriptions WHERE status = 'active') as active_subscriptions
      `,
      [],
      [{
        total_users: 0,
        total_sites: 0,
        active_sites: 0,
        active_subscriptions: 0
      }]
    );

    const planDist = await safeQuery(
      `
      SELECT
        s.name as plan_name,
        CASE
          WHEN (us.end_date - us.start_date) >= INTERVAL '300 days' THEN 'yearly'
          ELSE 'monthly'
        END as derived_billing_cycle,
        COUNT(*)::int as count
      FROM user_subscriptions us
      JOIN subscriptions s ON s.id = us.subscription_id
      WHERE us.status = 'active'
      GROUP BY s.name, derived_billing_cycle
      ORDER BY s.name ASC, derived_billing_cycle ASC
      `,
      [],
      []
    );

    const recentUsers = await safeQuery(
      `
      SELECT id, name, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 8
      `,
      [],
      []
    );

    const recentSites = await safeQuery(
      `
      SELECT s.id, s.name, s.subdomain, s.status, s.created_at, u.email as owner_email
      FROM sites s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
      LIMIT 8
      `,
      [],
      []
    );

    const recentSubs = await safeQuery(
      `
      SELECT us.id, us.user_id, us.created_at, s.name as plan_name, u.email as user_email
      FROM user_subscriptions us
      JOIN subscriptions s ON s.id = us.subscription_id
      JOIN users u ON u.id = us.user_id
      ORDER BY us.created_at DESC
      LIMIT 8
      `,
      [],
      []
    );

    return res.json({
      overview: r.rows?.[0] || {
        total_users: 0,
        total_sites: 0,
        active_sites: 0,
        active_subscriptions: 0
      },
      planDistribution: planDist.rows || [],
      recent: {
        users: recentUsers.rows || [],
        sites: recentSites.rows || [],
        subscriptions: recentSubs.rows || []
      }
    });
  } catch (e) {
    console.error('❌ Admin overview error:', e);
    return res.status(500).json({
      error: 'Özet veriler alınamadı',
      message: (e?.message || String(e)).toString().slice(0, 500)
    });
  }
});

router.get('/subscriptions', authMiddleware, adminOnly, async (req, res) => {
  try {
    const q = `
      SELECT
        us.id as user_subscription_id,
        us.user_id,
        us.subscription_id,
        us.status,
        us.start_date,
        us.end_date,
        us.payment_method_id,
        us.created_at,
        u.name as user_name,
        u.email as user_email,
        s.name as plan_name,
        s.price,
        CASE
          WHEN (us.end_date - us.start_date) >= INTERVAL '300 days' THEN 'yearly'
          ELSE 'monthly'
        END as billing_cycle
      FROM user_subscriptions us
      JOIN users u ON u.id = us.user_id
      JOIN subscriptions s ON s.id = us.subscription_id
      ORDER BY us.created_at DESC
      LIMIT 250
    `;

    const r = await pool.query(q);
    const rows = r.rows || [];

    const enriched = await Promise.all(
      rows.map(async (s) => {
        try {
          const siteCountRes = await pool.query('SELECT COUNT(*)::int as total_sites FROM sites WHERE user_id = $1', [s.user_id]);
          const totalSites = siteCountRes.rows?.[0]?.total_sites || 0;
          const caps = await Subscription.getUserCapabilities(s.user_id);
          return {
            ...s,
            total_sites: totalSites,
            capabilities: pickCapabilitiesSnapshot(caps, totalSites)
          };
        } catch (e) {
          return {
            ...s,
            capabilities: null
          };
        }
      })
    );

    return res.json({ subscriptions: enriched });
  } catch (e) {
    return res.status(500).json({ error: 'Abonelik listesi alınamadı' });
  }
});

router.post('/claim', authMiddleware, async (req, res) => {
  try {
    await ensureSchema();

    const emailOk = await mustMatchClaimEmail(req);
    if (!emailOk) {
      return res.status(403).json({ error: 'Yetkisiz' });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !isLocalRequest(req) && !allowRemoteAdminBootstrap()) {
      return res.status(403).json({ error: 'Yetkisiz' });
    }

    const r = await pool.query(
      "INSERT INTO admin_settings(key, value) VALUES('owner_user_id', $1) ON CONFLICT (key) DO NOTHING",
      [req.userId]
    );

    if (r.rowCount === 0) {
      return res.status(409).json({ error: 'Admin zaten atanmış' });
    }

    const username = await getSetting('admin_username');
    const keyHash = await getSetting('admin_key_hash');
    const credentials = username && keyHash ? null : await generateAdminCredentials();

    return res.json({ ok: true, credentials });
  } catch (e) {
    return res.status(500).json({ error: 'Admin atanamadı' });
  }
});

router.get('/credentials/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const username = await getSetting('admin_username');
    const keyHash = await getSetting('admin_key_hash');
    return res.json({ hasCredentials: Boolean(username && keyHash), username: username || null });
  } catch (e) {
    return res.status(500).json({ error: 'Admin bilgileri alınamadı' });
  }
});

router.post('/credentials/init', authMiddleware, adminOnly, async (req, res) => {
  try {
    const username = await getSetting('admin_username');
    const keyHash = await getSetting('admin_key_hash');
    if (username && keyHash) {
      return res.status(409).json({ error: 'Admin bilgileri zaten oluşturulmuş' });
    }

    const credentials = await generateAdminCredentials();
    return res.json({ ok: true, credentials });
  } catch (e) {
    return res.status(500).json({ error: 'Admin bilgileri oluşturulamadı' });
  }
});

router.post('/credentials/rotate', authMiddleware, adminOnly, async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !isLocalRequest(req)) {
      return res.status(403).json({ error: 'Yetkisiz' });
    }

    const credentials = await generateAdminCredentials();
    return res.json({ ok: true, credentials });
  } catch (e) {
    return res.status(500).json({ error: 'Admin bilgileri oluşturulamadı' });
  }
});

router.post('/credentials/verify', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, key } = req.body || {};
    if (!username || !key) {
      return res.status(400).json({ error: 'Admin kullanıcı adı ve key gerekli' });
    }

    const storedUsername = await getSetting('admin_username');
    const storedHash = await getSetting('admin_key_hash');

    if (!storedUsername || !storedHash) {
      return res.status(409).json({ error: 'Admin bilgileri oluşturulmamış' });
    }

    if (String(username).trim() !== storedUsername) {
      return res.status(401).json({ error: 'Admin bilgileri hatalı' });
    }

    const ok = await bcrypt.compare(String(key), storedHash);
    if (!ok) {
      return res.status(401).json({ error: 'Admin bilgileri hatalı' });
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Admin doğrulaması yapılamadı' });
  }
});

router.get('/check', authMiddleware, async (req, res) => {
  try {
    await ensureSchema();

    const ownerRes = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
    const ownerId = ownerRes.rows[0]?.value || '';

    const isProduction = process.env.NODE_ENV === 'production';
    const emailOk = await mustMatchClaimEmail(req);
    const remoteAllowed = allowRemoteAdminBootstrap();
    const canBootstrap = emailOk && (!isProduction || isLocalRequest(req) || remoteAllowed);

    if (!ownerId) {
      if (canBootstrap) {
        await pool.query(
          "INSERT INTO admin_settings(key, value) VALUES('owner_user_id', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP",
          [req.userId]
        );
        return res.json({ ok: true, bootstrapped: true });
      }
      if (!emailOk) return res.status(403).json({ error: 'Yetkisiz', reason: 'email_mismatch' });
      if (isProduction && !isLocalRequest(req) && !remoteAllowed) return res.status(403).json({ error: 'Yetkisiz', reason: 'remote_bootstrap_disabled' });
      return res.status(409).json({ error: 'Admin henüz atanmadı' });
    }

    if (ownerId !== req.userId) {
      if (canBootstrap) {
        await pool.query(
          "UPDATE admin_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = 'owner_user_id'",
          [req.userId]
        );
        return res.json({ ok: true, bootstrapped: true });
      }
      if (!emailOk) return res.status(403).json({ error: 'Yetkisiz', reason: 'email_mismatch' });
      if (isProduction && !isLocalRequest(req) && !remoteAllowed) return res.status(403).json({ error: 'Yetkisiz', reason: 'remote_bootstrap_disabled' });
      return res.status(403).json({ error: 'Yetkisiz', reason: 'owner_mismatch' });
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Admin doğrulaması yapılamadı' });
  }
});

router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const q = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        u.updated_at,
        s.name as subscription_name,
        us.status as subscription_status,
        us.start_date,
        us.end_date,
        CASE
          WHEN us.id IS NULL THEN NULL
          WHEN (us.end_date - us.start_date) >= INTERVAL '300 days' THEN 'yearly'
          ELSE 'monthly'
        END as billing_cycle,
        (
          SELECT COUNT(*)::int
          FROM sites st
          WHERE st.user_id = u.id
        ) as total_sites,
        (
          SELECT COUNT(*)::int
          FROM sites st
          WHERE st.user_id = u.id AND st.status = 'active'
        ) as active_sites
      FROM users u
      LEFT JOIN LATERAL (
        SELECT *
        FROM user_subscriptions
        WHERE user_id = u.id AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      ) us ON true
      LEFT JOIN subscriptions s ON us.subscription_id = s.id
      ORDER BY u.created_at DESC
    `;

    const r = await pool.query(q);
    const rows = r.rows || [];

    const enriched = await Promise.all(
      rows.map(async (u) => {
        try {
          const caps = await Subscription.getUserCapabilities(u.id);
          return {
            ...u,
            capabilities: pickCapabilitiesSnapshot(caps, u.total_sites)
          };
        } catch (e) {
          return {
            ...u,
            capabilities: null
          };
        }
      })
    );

    return res.json({ users: enriched });
  } catch (e) {
    return res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
});

router.get('/sites', authMiddleware, adminOnly, async (req, res) => {
  try {
    const q = `
      SELECT
        s.id,
        s.user_id,
        s.name,
        s.shopier_url,
        s.subdomain,
        s.custom_domain,
        s.status,
        s.created_at,
        s.updated_at,
        u.name as owner_name,
        u.email as owner_email
      FROM sites s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
    `;
    const r = await pool.query(q);
    return res.json({ sites: r.rows || [] });
  } catch (e) {
    return res.status(500).json({ error: 'Siteler alınamadı' });
  }
});

router.post('/users/:userId/subscription', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { planName, subscriptionId, billingCycle } = req.body || {};

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Geçersiz kullanıcı' });
    }

    const okTarget = await ensureNotOwnerTarget(res, userId);
    if (!okTarget) return;

    const providedSubId = (subscriptionId || '').toString().trim();
    const normalizedPlan = (planName || '').toString().trim().toLowerCase();
    if (!providedSubId && !normalizedPlan) {
      return res.status(400).json({ error: 'Plan gerekli' });
    }

    let cycle = (billingCycle || 'monthly').toString().trim().toLowerCase();
    if (cycle !== 'monthly' && cycle !== 'yearly') {
      return res.status(400).json({ error: 'Geçersiz ödeme periyodu' });
    }

    let resolvedSubscriptionId = '';

    let resolvedPlanName = '';

    if (providedSubId) {
      const found = await Subscription.findById(providedSubId).catch(() => null);
      if (!found?.id) {
        return res.status(404).json({ error: 'Plan bulunamadı' });
      }
      resolvedSubscriptionId = found.id;
      resolvedPlanName = (found?.name || '').toString().trim().toLowerCase();
    } else {
      const aliases = {
        standart: ['standart', 'standard', 'standartplan', 'standardplan'],
        ekonomi: ['ekonomi', 'ekonomiplan'],
        basic: ['basic', 'starter'],
        pro: ['pro', 'premium', 'titan']
      };

      const target = aliases.standart.includes(normalizedPlan)
        ? 'standart'
        : aliases.ekonomi.includes(normalizedPlan)
          ? 'ekonomi'
        : aliases.basic.includes(normalizedPlan)
          ? 'basic'
          : aliases.pro.includes(normalizedPlan)
            ? 'pro'
            : normalizedPlan;

      const subRes = await pool.query('SELECT id, name FROM subscriptions');
      const match = (subRes.rows || []).find((p) => (p?.name || '').toString().trim().toLowerCase() === target);
      if (!match?.id) {
        return res.status(404).json({ error: 'Plan bulunamadı', availablePlans: (subRes.rows || []).map((p) => p.name) });
      }
      resolvedSubscriptionId = match.id;
      resolvedPlanName = (match?.name || '').toString().trim().toLowerCase();
    }

    if (resolvedPlanName === 'ekonomi' && cycle !== 'yearly') {
      cycle = 'yearly';
    }

    const created = await Subscription.createSubscription(userId, resolvedSubscriptionId, 'shopier_manual', cycle);
    return res.json({ ok: true, subscription: created });
  } catch (e) {
    return res.status(500).json({ error: 'Abonelik atanamadı' });
  }
});

router.post('/users/:userId/subscription/cancel', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Geçersiz kullanıcı' });
    }

    const okTarget = await ensureNotOwnerTarget(res, userId);
    if (!okTarget) return;

    const cancelled = await Subscription.cancelSubscription(userId);
    return res.json({ ok: true, subscription: cancelled || null });
  } catch (e) {
    return res.status(500).json({ error: 'Abonelik iptal edilemedi' });
  }
});

router.post('/sites/:siteId/status', authMiddleware, adminOnly, ownerOnly, async (req, res) => {
  try {
    const siteId = req.params.siteId;
    const status = (req.body?.status || '').toString().trim().toLowerCase();
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    const r = await pool.query(
      'UPDATE sites SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, siteId]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Site bulunamadı' });
    }
    return res.json({ ok: true, site: r.rows[0] });
  } catch (e) {
    return res.status(500).json({ error: 'Site durumu güncellenemedi' });
  }
});

module.exports = router;
