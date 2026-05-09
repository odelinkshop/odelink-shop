const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { normalizeEmail, normalizePhone, normalizeDisplayName } = require('../utils/account');

let ensureEmailSchemaPromise = null;

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
    const query = 'SELECT id, name, email, phone, subscription_id, created_at, updated_at FROM users WHERE id = $1';
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
