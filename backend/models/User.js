const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { normalizeEmail, normalizePhone, normalizeDisplayName } = require('../utils/account');

let ensureEmailSchemaPromise = null;
let ensureTrialSchemaPromise = null;

class User {
  static async ensureEmailSchema() {
    if (ensureEmailSchemaPromise) return ensureEmailSchemaPromise;

    ensureEmailSchemaPromise = (async () => {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))');

      const duplicates = await pool.query(`
        SELECT LOWER(email) AS email_key, COUNT(*)::int AS duplicate_count
        FROM users
        GROUP BY LOWER(email)
        HAVING COUNT(*) > 1
        LIMIT 5
      `);

      if ((duplicates.rows || []).length > 0) {
        return {
          ok: false,
          duplicates: duplicates.rows
        };
      }
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON users (LOWER(email))');
      return {
        ok: true,
        duplicates: []
      };
    })().catch((error) => {
      ensureEmailSchemaPromise = null;
      throw error;
    });

    return ensureEmailSchemaPromise;
  }

  static async ensureTrialSchema() {
    if (ensureTrialSchemaPromise) return ensureTrialSchemaPromise;

    ensureTrialSchemaPromise = (async () => {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_consumed BOOLEAN DEFAULT FALSE");
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users (trial_ends_at)');
      return { ok: true };
    })().catch((error) => {
      ensureTrialSchemaPromise = null;
      throw error;
    });

    return ensureTrialSchemaPromise;
  }

  static async getTrialStatus(userId) {
    await this.ensureTrialSchema();

    const res = await pool.query(
      'SELECT trial_started_at, trial_ends_at, trial_consumed FROM users WHERE id = $1',
      [userId]
    );
    const row = res.rows?.[0] || null;
    const startedAt = row?.trial_started_at ? new Date(row.trial_started_at) : null;
    const endsAt = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
    const consumed = Boolean(row?.trial_consumed);

    const now = Date.now();
    const endsMs = endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt.getTime() : 0;
    const active = Boolean(endsMs) && endsMs > now;
    const expired = Boolean(endsMs) && endsMs <= now;

    return {
      startedAt: startedAt && !Number.isNaN(startedAt.getTime()) ? startedAt.toISOString() : null,
      endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt.toISOString() : null,
      consumed,
      active,
      expired,
      msLeft: active ? Math.max(0, endsMs - now) : 0
    };
  }

  static async startTrialIfEligible(userId, { days = 3 } = {}) {
    await this.ensureTrialSchema();

    const trial = await this.getTrialStatus(userId);
    if (trial.active) return { ok: true, started: false, trial };
    if (trial.consumed) return { ok: true, started: false, trial };

    const durationDays = Number(days || 3);
    const safeDays = Number.isFinite(durationDays) ? Math.max(1, Math.min(14, Math.floor(durationDays))) : 3;
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + safeDays * 24 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET trial_started_at = $2, trial_ends_at = $3, trial_consumed = TRUE, updated_at = NOW() WHERE id = $1',
      [userId, startedAt.toISOString(), endsAt.toISOString()]
    );

    const next = await this.getTrialStatus(userId);
    return { ok: true, started: true, trial: next };
  }

  static async create(userData) {
    const { name, email, password, phone } = userData;
    const normalizedName = normalizeDisplayName(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, email, password, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, email, phone, created_at
    `;

    try {
      const result = await pool.query(query, [normalizedName, normalizedEmail, hashedPassword, normalizedPhone || null]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Kullanici olusturulamadi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  static async findByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    try {
      const result = await pool.query(query, [normalizedEmail]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Kullanici bulunamadi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, phone, subscription_id, trial_started_at, trial_ends_at, trial_consumed, created_at, updated_at FROM users WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Kullanici bulunamadi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  static async findWithPasswordById(id) {
    const query = 'SELECT id, name, email, phone, password, subscription_id, created_at, updated_at FROM users WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Kullanici bulunamadi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  static async updateSubscription(userId, subscriptionId) {
    const query = `
      UPDATE users
      SET subscription_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, subscription_id
    `;

    try {
      const result = await pool.query(query, [subscriptionId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Abonelik guncellenemedi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  static async getSubscriptionDetails(userId) {
    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.subscription_id,
        u.created_at,
        u.updated_at,
        s.name as subscription_name,
        s.price,
        s.features
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      WHERE u.id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Abonelik bilgileri alinamadi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }
}

module.exports = User;
