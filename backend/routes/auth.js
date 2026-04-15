const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const AuthSession = require('../models/AuthSession');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth');
const { extractBearerToken } = require('../middleware/auth');
const pool = require('../config/database');
const { normalizeEmail, normalizePhone, normalizeDisplayName } = require('../utils/account');
const { getCookieValue, normalizeCookieDomain, parseDurationToMs } = require('../utils/httpCookies');
const { withTransaction } = require('../utils/transactions');

const router = express.Router();

User.ensureEmailSchema().catch((error) => {
  console.error('User email schema init error:', error);
});

User.ensureEmailSchema().catch((error) => {
  console.error('User email schema init error:', error);
});

AuthSession.ensureSchema().catch((error) => {
  console.error('Auth session schema init error:', error);
});

const makeUuid = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = b.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const ensureIpLogSchema = async () => {
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS user_ip_logs (
      id UUID PRIMARY KEY,
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
};

const normalizeIp = (raw) => {
  const s = (raw || '').toString().trim();
  if (!s) return '';
  let v = s.split(',')[0].trim();
  v = v.replace(/^::ffff:/, '');
  v = v.split('%')[0];
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(v)) v = v.split(':')[0];
  v = v.replace(/^\[|\]$/g, '');
  return v;
};

const getClientIp = (req) => {
  const header = (k) => {
    const v = req.headers?.[k];
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.join(',');
    return '';
  };

  const candidates = [
    header('cf-connecting-ip'),
    header('x-real-ip'),
    header('x-forwarded-for'),
    req.ip,
    req.connection?.remoteAddress,
    req.socket?.remoteAddress
  ];

  for (const c of candidates) {
    const ip = normalizeIp(c);
    if (!ip) continue;
    if (ip === '1') continue;
    return ip.slice(0, 64);
  }
  return '';
};

const getClientIpDetails = (req) => {
  const header = (k) => {
    const v = req.headers?.[k];
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.join(',');
    return '';
  };

  const candidates = [
    { source: 'cf-connecting-ip', raw: header('cf-connecting-ip') },
    { source: 'x-real-ip', raw: header('x-real-ip') },
    { source: 'x-forwarded-for', raw: header('x-forwarded-for') },
    { source: 'req.ip', raw: req.ip },
    { source: 'remoteAddress', raw: req.connection?.remoteAddress },
    { source: 'socket.remoteAddress', raw: req.socket?.remoteAddress }
  ];

  const chain = [];
  for (const c of candidates) {
    const raw = (c?.raw || '').toString();
    if (!raw) continue;

    if (c.source === 'x-forwarded-for') {
      const parts = raw.split(',').map((p) => normalizeIp(p)).filter(Boolean);
      for (const p of parts) chain.push({ source: c.source, ip: p });
      continue;
    }

    const ip = normalizeIp(raw);
    if (ip) chain.push({ source: c.source, ip });
  }

  const ip = getClientIp(req);
  const first = chain.find((x) => x?.ip === ip);
  return {
    ip: ip ? ip.slice(0, 64) : '',
    ipSource: (first?.source || '').toString().slice(0, 32),
    ipChain: JSON.stringify(chain).slice(0, 4000)
  };
};

const getUserAgent = (req) => (req.headers['user-agent'] || '').toString().slice(0, 2048);

const insertIpLog = async (userId, email, req, eventType) => {
  await ensureIpLogSchema();
  const details = getClientIpDetails(req);
  const ip = details.ip;
  const ua = getUserAgent(req);
  await pool.query(
    'INSERT INTO user_ip_logs (id, user_id, email, ip, user_agent, event_type, ip_source, ip_chain) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [makeUuid(), userId, email, ip, ua, (eventType || '').toString().slice(0, 32), details.ipSource, details.ipChain]
  );
};

const isProduction = process.env.NODE_ENV === 'production';
const ACCESS_COOKIE_NAME = (process.env.AUTH_ACCESS_COOKIE_NAME || 'odelink_access').toString().trim() || 'odelink_access';
const REFRESH_COOKIE_NAME = (process.env.AUTH_REFRESH_COOKIE_NAME || 'odelink_refresh').toString().trim() || 'odelink_refresh';
const ACCESS_COOKIE_MAX_AGE_MS = Math.max(
  5 * 60 * 1000,
  parseDurationToMs(process.env.AUTH_ACCESS_COOKIE_MAX_AGE || process.env.JWT_COOKIE_MAX_AGE || '7d', 7 * 24 * 60 * 60 * 1000)
);
const REFRESH_COOKIE_MAX_AGE_MS = Math.max(
  7 * 24 * 60 * 60 * 1000,
  parseDurationToMs(`${Math.max(7, Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 30) || 30)}d`, 30 * 24 * 60 * 60 * 1000)
);

const buildCookieOptions = (req, maxAge) => {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  const forwardedProto = (req.headers['x-forwarded-proto'] || '').toString().trim().toLowerCase();
  
  // Production'da MUTLAKA secure olmalı
  const secure = isProduction ? true : (forwardedProto === 'https');
  
  const explicitDomain = (process.env.AUTH_COOKIE_DOMAIN || '').toString().trim();
  const domain = explicitDomain || normalizeCookieDomain(host);
  
  // Production'da sameSite=none MUTLAKA secure ile birlikte olmalı
  // Aksi halde cookie set edilmez!
  const sameSite = isProduction ? 'lax' : 'lax';

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: Math.max(0, Number(maxAge || 0)),
    ...(domain ? { domain } : {})
  };
};

const clearCookieOptions = (req) => {
  const opts = buildCookieOptions(req, 0);
  delete opts.maxAge;
  return opts;
};

const clearSessionCookies = (req, res) => {
  const options = clearCookieOptions(req);
  res.clearCookie(ACCESS_COOKIE_NAME, options);
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};

const buildUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  subscriptionId: user.subscription_id
});

const issueSessionCookies = async (req, res, user) => {
  const token = User.generateToken(user.id);
  const refreshSession = await AuthSession.issue({
    userId: user.id,
    ip: getClientIp(req),
    userAgent: getUserAgent(req)
  });

  res.cookie(ACCESS_COOKIE_NAME, token, buildCookieOptions(req, ACCESS_COOKIE_MAX_AGE_MS));
  res.cookie(REFRESH_COOKIE_NAME, refreshSession.refreshToken, buildCookieOptions(req, REFRESH_COOKIE_MAX_AGE_MS));

  return {
    token,
    refreshExpiresAt: refreshSession.expiresAt
  };
};

const resolveUserIdFromAccessToken = (token) => {
  const rawToken = (token || '').toString().trim();
  if (!rawToken) return '';

  const secret = process.env.JWT_SECRET;
  if (!secret) return '';

  try {
    const decoded = jwt.verify(rawToken, secret);
    return (decoded?.userId || '').toString().trim();
  } catch (error) {
    return '';
  }
};

const refreshSessionFromCookie = async (req, res) => {
  const refreshToken = getCookieValue(req, REFRESH_COOKIE_NAME);
  if (!refreshToken) return null;

  const rotated = await AuthSession.rotate(refreshToken, {
    ip: getClientIp(req),
    userAgent: getUserAgent(req)
  });

  if (!rotated?.userId) {
    clearSessionCookies(req, res);
    return null;
  }

  const user = await User.findById(rotated.userId);
  if (!user?.id) {
    clearSessionCookies(req, res);
    return null;
  }

  const token = User.generateToken(user.id);
  res.cookie(ACCESS_COOKIE_NAME, token, buildCookieOptions(req, ACCESS_COOKIE_MAX_AGE_MS));
  res.cookie(REFRESH_COOKIE_NAME, rotated.refreshToken, buildCookieOptions(req, REFRESH_COOKIE_MAX_AGE_MS));

  return {
    user,
    token,
    refreshed: true
  };
};

const resolveAuthenticatedUser = async (req, res, { allowRefresh = true } = {}) => {
  const candidateTokens = [
    extractBearerToken(req.header('Authorization')),
    getCookieValue(req, ACCESS_COOKIE_NAME)
  ].filter(Boolean);

  for (const token of candidateTokens) {
    const userId = resolveUserIdFromAccessToken(token);
    if (!userId) continue;
    const user = await User.findById(userId);
    if (user?.id) {
      return {
        user,
        token,
        refreshed: false
      };
    }
  }

  if (!allowRefresh) return null;
  return refreshSessionFromCookie(req, res);
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().trim().allow('').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  code: Joi.string().trim().min(4).max(16).required(),
  newPassword: Joi.string().min(6).required()
});

const googleAuthSchema = Joi.object({
  credential: Joi.string().trim().min(20).required()
});

const ensurePasswordResetSchema = async () => {
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      code_hash VARCHAR(128) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP
    )
    `
  );
  await pool.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens (email)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens (user_id)');
};

const hashResetCode = (email, code) => {
  const secret = (process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET || 'odelink_reset_secret').toString();
  const payload = `${(email || '').toString().trim().toLowerCase()}|${(code || '').toString().trim()}|${secret}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

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

const generateResetCode = () => {
  const n = crypto.randomInt(0, 1000000);
  return n.toString().padStart(6, '0');
};

const getGoogleClientId = () => (
  process.env.GOOGLE_CLIENT_ID || ''
).toString().trim();

const buildGoogleUserName = (payload) => {
  const explicit = normalizeDisplayName(payload?.name || '');
  if (explicit) return explicit;

  const email = normalizeEmail(payload?.email || '');
  const localPart = (email.split('@')[0] || '').replace(/[._-]+/g, ' ').trim();
  return normalizeDisplayName(localPart || 'Google Kullanici');
};

const generateProviderPassword = () => crypto.randomBytes(24).toString('hex');

const verifyGoogleCredential = async (credential) => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    console.error('❌ GOOGLE_CLIENT_ID not configured');
    const error = new Error('Google giris yapilandirilmadi');
    error.status = 503;
    throw error;
  }

  console.log('🔵 Verifying credential with Google tokeninfo API...');
  const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { id_token: credential },
    timeout: 15000,
    validateStatus: () => true
  });

  console.log('🔵 Google tokeninfo response status:', response.status);

  if (!response || response.status !== 200) {
    console.error('❌ Google tokeninfo failed:', {
      status: response?.status,
      data: response?.data
    });
    const error = new Error('Google kimligi dogrulanamadi');
    error.status = 401;
    throw error;
  }

  const payload = response.data && typeof response.data === 'object' ? response.data : {};
  const aud = (payload.aud || '').toString().trim();
  const azp = (payload.azp || '').toString().trim();
  const email = normalizeEmail(payload.email || '');
  const emailVerified = (payload.email_verified || '').toString().trim().toLowerCase() === 'true';
  const subject = (payload.sub || '').toString().trim();

  console.log('🔵 Google payload:', {
    aud,
    azp,
    email,
    emailVerified,
    subject,
    clientId
  });

  if ((!aud || (aud !== clientId && azp !== clientId)) || !subject || !email || !emailVerified) {
    console.error('❌ Google credential validation failed:', {
      audMatch: aud === clientId || azp === clientId,
      hasSubject: !!subject,
      hasEmail: !!email,
      emailVerified
    });
    const error = new Error('Google kimligi gecersiz');
    error.status = 401;
    throw error;
  }

  console.log('✅ Google credential verified successfully');
  return {
    email,
    name: buildGoogleUserName(payload),
    subject,
    picture: (payload.picture || '').toString().trim()
  };
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const { name, email, password, phone } = req.body;
    const normalizedName = normalizeDisplayName(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    // Gmail-only validation - Sadece Gmail adresleri kabul edilir
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({ 
        error: 'Sadece Gmail adresleri ile kayıt olabilirsiniz. Lütfen @gmail.com uzantılı bir e-posta adresi kullanın.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    // Create new user
    const user = await User.create({ name: normalizedName, email: normalizedEmail, password, phone: normalizedPhone });

    try {
      await insertIpLog(user.id, user.email, req, 'register');
    } catch (e) {
      void e;
    }
    
    const { token } = await issueSessionCookies(req, res, user);

    res.status(201).json({
      message: 'Kayit basarili',
      user: buildUserPayload(user),
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ error: isProduction ? 'Kayıt işlemi başarısız' : (error?.message || 'Kayıt işlemi başarısız') });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Geçersiz istek' });
    }

    const email = normalizeEmail(value.email);

    let user = null;
    try {
      user = await User.findByEmail(email);
    } catch (e) {
      user = null;
    }

    await ensurePasswordResetSchema();

    if (!user || !user.id) {
      return res.json({ ok: true });
    }

    const code = generateResetCode();
    const codeHash = hashResetCode(email, code);
    const expiresMinutes = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 20);
    const expiresAt = new Date(Date.now() + Math.max(5, expiresMinutes) * 60 * 1000);

    await pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND email = $2 AND used_at IS NULL',
      [user.id, email]
    );

    await pool.query(
      'INSERT INTO password_reset_tokens (id, user_id, email, code_hash, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [makeUuid(), user.id, email, codeHash, expiresAt]
    );

    const transporter = await buildTransporter();
    const appName = (process.env.APP_NAME || 'Ödelink').toString();
    const fromName = (process.env.EMAIL_FROM_NAME || appName).toString();
    const supportFrom = (process.env.EMAIL_USER || '').toString();
    const fromHeader = supportFrom ? `${fromName} <${supportFrom}>` : undefined;

    const text = [
      `${appName} şifre sıfırlama kodun: ${code}`,
      '',
      `Kodun süresi: ${Math.max(5, expiresMinutes)} dakika`,
      '',
      'Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.'
    ].join('\n');

    await transporter.sendMail({
      from: fromHeader,
      to: email,
      subject: `${appName} Şifre Sıfırlama Kodu`,
      text
    });

    try {
      await insertIpLog(user.id, email, req, 'forgot_password');
    } catch (e) {
      void e;
    }

    return res.json({ ok: true });
  } catch (e) {
    if (e && e.code === 'EMAIL_MISCONFIG') {
      return res.status(500).json({ error: 'E-posta gönderimi yapılandırılmadı (EMAIL_HOST/EMAIL_USER/EMAIL_PASS).' });
    }
    console.error('Forgot password error:', e);
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({ error: isProduction ? 'E-posta gönderilemedi' : (e?.message || 'Şifre sıfırlama başlatılamadı') });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Geçersiz istek' });
    }

    const email = normalizeEmail(value.email);
    const code = (value.code || '').toString().trim();
    const newPassword = (value.newPassword || '').toString();

    await ensurePasswordResetSchema();

    const codeHash = hashResetCode(email, code);
    const r = await pool.query(
      `
      SELECT id, user_id
      FROM password_reset_tokens
      WHERE email = $1
        AND code_hash = $2
        AND used_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email, codeHash]
    );

    if (!r.rows || r.rows.length === 0) {
      return res.status(400).json({ error: 'Kod hatalı veya süresi dolmuş' });
    }

    const tokenRow = r.rows[0];
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await withTransaction(pool, async (client) => {
      await client.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, tokenRow.user_id]);
      await client.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND email = $2 AND used_at IS NULL',
        [tokenRow.user_id, email]
      );
    });
    await AuthSession.revokeAllForUser(tokenRow.user_id, 'password_reset');

    try {
      await insertIpLog(tokenRow.user_id, email, req, 'reset_password');
    } catch (e) {
      void e;
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('Reset password error:', e);
    return res.status(500).json({ error: 'Şifre sıfırlanamadı' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = getCookieValue(req, REFRESH_COOKIE_NAME);
    const session = await resolveAuthenticatedUser(req, res, { allowRefresh: false });

    if (refreshToken) {
      try {
        await AuthSession.revoke(refreshToken, 'logout');
      } catch (e) {
        void e;
      }
    }

    clearSessionCookies(req, res);

    if (session?.user?.id) {
      try {
        await insertIpLog(session.user.id, session.user.email, req, 'logout');
      } catch (e) {
        void e;
      }
    }
    return res.json({ ok: true });
  } catch (e) {
    clearSessionCookies(req, res);
    return res.status(500).json({ error: 'Cikis islemi basarisiz' });
  }
});

router.get('/google/config', (req, res) => {
  const clientId = getGoogleClientId();
  return res.json({
    enabled: Boolean(clientId),
    clientId: clientId || ''
  });
});

router.post('/google/callback', async (req, res) => {
  try {
    console.log('🔵 Google OAuth callback received');
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code eksik' });
    }

    const clientId = getGoogleClientId();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').toString().trim();
    
    if (!clientId || !clientSecret) {
      console.error('❌ Google OAuth credentials missing');
      return res.status(503).json({ error: 'Google girisi yapilandirilmadi' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/auth`;
    
    console.log('🔵 Exchanging code for token...');
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000
    });

    const { id_token } = tokenResponse.data;
    
    if (!id_token) {
      console.error('❌ No id_token in response');
      return res.status(401).json({ error: 'Google kimlik dogrulanamadi' });
    }

    console.log('🔵 Verifying ID token...');
    // Verify ID token
    const googleIdentity = await verifyGoogleCredential(id_token);
    
    // Gmail-only validation - Sadece Gmail adresleri kabul edilir
    if (!googleIdentity.email.endsWith('@gmail.com')) {
      console.log('❌ Non-Gmail email rejected:', googleIdentity.email);
      return res.status(400).json({ 
        error: 'Sadece Gmail adresleri ile giriş yapabilirsiniz. Lütfen @gmail.com uzantılı bir Google hesabı kullanın.' 
      });
    }
    
    let user = await User.findByEmail(googleIdentity.email);
    let eventType = 'google_login';

    if (!user) {
      console.log('🔵 User not found, creating new user...');
      eventType = 'google_register';
      try {
        user = await User.create({
          name: googleIdentity.name,
          email: googleIdentity.email,
          password: generateProviderPassword(),
          phone: ''
        });
        console.log('✅ New user created:', user.id);
      } catch (createError) {
        console.error('⚠️ User creation failed, trying to find existing:', createError.message);
        user = await User.findByEmail(googleIdentity.email);
        if (!user) throw createError;
      }
    } else {
      console.log('✅ Existing user found:', user.id);
    }

    try {
      await insertIpLog(user.id, user.email, req, eventType);
    } catch (logError) {
      console.error('⚠️ IP log failed:', logError.message);
      void logError;
    }

    console.log('🔵 Issuing session cookies...');
    const { token } = await issueSessionCookies(req, res, user);
    console.log('✅ Session cookies issued successfully');

    return res.json({
      ok: true,
      message: 'Google girisi basarili',
      user: buildUserPayload(user),
      token
    });
  } catch (callbackError) {
    const status = Number(callbackError?.status || callbackError?.response?.status || 0) || 500;
    console.error('❌ Google OAuth callback error:', {
      status,
      message: callbackError?.message,
      response: callbackError?.response?.data
    });
    return res.status(status).json({
      error: 'Google ile giris basarisiz'
    });
  }
});

router.post('/google', async (req, res) => {
  try {
    console.log('🔵 Google OAuth request received');
    const { error, value } = googleAuthSchema.validate(req.body);
    if (error) {
      console.error('❌ Google OAuth validation error:', error.details);
      return res.status(400).json({ error: 'Gecersiz Google giris istegi' });
    }

    console.log('🔵 Verifying Google credential...');
    const googleIdentity = await verifyGoogleCredential(value.credential);
    console.log('✅ Google identity verified:', { email: googleIdentity.email, name: googleIdentity.name });
    
    // Gmail-only validation - Sadece Gmail adresleri kabul edilir
    if (!googleIdentity.email.endsWith('@gmail.com')) {
      console.log('❌ Non-Gmail email rejected:', googleIdentity.email);
      return res.status(400).json({ 
        error: 'Sadece Gmail adresleri ile giriş yapabilirsiniz. Lütfen @gmail.com uzantılı bir Google hesabı kullanın.' 
      });
    }
    
    let user = await User.findByEmail(googleIdentity.email);
    let eventType = 'google_login';

    if (!user) {
      console.log('🔵 User not found, creating new user...');
      eventType = 'google_register';
      try {
        user = await User.create({
          name: googleIdentity.name,
          email: googleIdentity.email,
          password: generateProviderPassword(),
          phone: ''
        });
        console.log('✅ New user created:', user.id);
      } catch (createError) {
        console.error('⚠️ User creation failed, trying to find existing:', createError.message);
        user = await User.findByEmail(googleIdentity.email);
        if (!user) throw createError;
      }
    } else {
      console.log('✅ Existing user found:', user.id);
    }

    try {
      await insertIpLog(user.id, user.email, req, eventType);
    } catch (logError) {
      console.error('⚠️ IP log failed:', logError.message);
      void logError;
    }

    console.log('🔵 Issuing session cookies...');
    const { token } = await issueSessionCookies(req, res, user);
    console.log('✅ Session cookies issued successfully');

    return res.json({
      ok: true,
      message: 'Google girisi basarili',
      user: buildUserPayload(user),
      token
    });
  } catch (routeError) {
    const status = Number(routeError?.status || routeError?.response?.status || 0) || 500;
    console.error('❌ Google auth error:', {
      status,
      message: routeError?.message,
      stack: routeError?.stack
    });
    return res.status(status).json({
      error: status === 503
        ? 'Google girisi henuz yapilandirilmadi.'
        : (status === 401 ? 'Google ile giris dogrulanamadi.' : 'Google ile giris basarisiz.')
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Gmail-only validation - Sadece Gmail adresleri kabul edilir
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({ 
        error: 'Sadece Gmail adresleri ile giriş yapabilirsiniz. Lütfen @gmail.com uzantılı bir e-posta adresi kullanın.' 
      });
    }

    // Find user
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    try {
      await insertIpLog(user.id, user.email, req, 'login');
    } catch (e) {
      void e;
    }

    const { token } = await issueSessionCookies(req, res, user);

    res.json({
      message: 'Giris basarili',
      user: buildUserPayload(user),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ error: isProduction ? 'Giriş işlemi başarısız' : (error?.message || 'Giriş işlemi başarısız') });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const subscriptionDetails = await User.getSubscriptionDetails(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        subscription: subscriptionDetails
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const session = await refreshSessionFromCookie(req, res);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Oturum yenilenemedi' });
    }

    return res.json({
      ok: true,
      refreshed: true,
      user: buildUserPayload(session.user),
      token: session.token
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    clearSessionCookies(req, res);
    return res.status(500).json({ error: 'Oturum yenilenemedi' });
  }
});

router.get('/session', async (req, res) => {
  try {
    const session = await resolveAuthenticatedUser(req, res, { allowRefresh: true });
    if (!session?.user?.id) {
      clearSessionCookies(req, res);
      return res.status(401).json({ error: 'Aktif oturum bulunamadi' });
    }

    return res.json({
      ok: true,
      refreshed: Boolean(session.refreshed),
      user: buildUserPayload(session.user),
      token: session.token
    });
  } catch (error) {
    console.error('Get session error:', error);
    clearSessionCookies(req, res);
    return res.status(500).json({ error: 'Oturum bilgisi alinamadi' });
  }
});

module.exports = router;
