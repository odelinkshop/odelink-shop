const pool = require('../config/database');

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
  const ip = (req.ip || '').toString();
  return ip === '127.0.0.1' || ip === '::1' || ip.endsWith('127.0.0.1');
};

const allowRemoteAdminBootstrap = () => {
  const v = (process.env.ALLOW_REMOTE_ADMIN_BOOTSTRAP || '').toString().trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
};

const mustMatchClaimEmail = async (req) => {
  const claimEmail = ((process.env.ADMIN_CLAIM_EMAIL || process.env.ADMIN_EMAIL) || '').toString().trim().toLowerCase();
  const u = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
  const email = (u.rows?.[0]?.email || '').toString().trim().toLowerCase();
  return Boolean(claimEmail && email === claimEmail);
};

const adminOnly = async (req, res, next) => {
  try {
    await ensureSchema();

    const r = await pool.query('SELECT value FROM admin_settings WHERE key = $1', ['owner_user_id']);
    const ownerId = r.rows[0]?.value || '';

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
        return next();
      }
      if (!emailOk) return res.status(403).json({ error: 'Yetkisiz', reason: 'email_mismatch' });
      if (isProduction && !isLocalRequest(req) && !remoteAllowed) return res.status(403).json({ error: 'Yetkisiz', reason: 'remote_bootstrap_disabled' });
      return res.status(409).json({ error: 'Admin henüz atanmadı' });
    }

    if (ownerId !== req.userId) {
      if (!emailOk) return res.status(403).json({ error: 'Yetkisiz', reason: 'email_mismatch' });
      if (isProduction && !isLocalRequest(req) && !remoteAllowed) return res.status(403).json({ error: 'Yetkisiz', reason: 'remote_bootstrap_disabled' });
      return res.status(403).json({ error: 'Yetkisiz', reason: 'owner_mismatch' });
    }

    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Yetkilendirme kontrolü başarısız' });
  }
};

module.exports = adminOnly;
