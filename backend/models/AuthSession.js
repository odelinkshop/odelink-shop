const crypto = require('crypto');
const pool = require('../config/database');
const { withTransaction } = require('../utils/transactions');

let ensureSchemaPromise = null;

const REFRESH_COOKIE_TTL_DAYS = Math.max(7, Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 30) || 30);

const makeSessionId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
};

const normalizeIp = (value) => (value || '').toString().trim().slice(0, 64);
const normalizeUserAgent = (value) => (value || '').toString().trim().slice(0, 2048);

const hashRefreshToken = (token) => {
  const secret = (process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'odelink_refresh_secret').toString();
  return crypto
    .createHash('sha256')
    .update(`${secret}|${(token || '').toString()}`)
    .digest('hex');
};

const makeRefreshToken = () => crypto.randomBytes(48).toString('hex');

const nextExpiryDate = () => new Date(Date.now() + (REFRESH_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000));

class AuthSession {
  static async ensureSchema() {
    if (ensureSchemaPromise) return ensureSchemaPromise;

    ensureSchemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS auth_sessions (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          refresh_token_hash VARCHAR(128) NOT NULL UNIQUE,
          ip VARCHAR(64),
          user_agent TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_used_at TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          revoked_at TIMESTAMP,
          revoked_reason VARCHAR(64)
        )
      `);

      await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions (expires_at)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_revoked_at ON auth_sessions (revoked_at)');
    })().catch((error) => {
      ensureSchemaPromise = null;
      throw error;
    });

    return ensureSchemaPromise;
  }

  static async issue({ userId, ip, userAgent }) {
    await this.ensureSchema();
    const refreshToken = makeRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = nextExpiryDate();

    await pool.query(
      `
      INSERT INTO auth_sessions (
        id,
        user_id,
        refresh_token_hash,
        ip,
        user_agent,
        expires_at,
        last_used_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `,
      [makeSessionId(), userId, refreshTokenHash, normalizeIp(ip), normalizeUserAgent(userAgent), expiresAt]
    );

    return {
      refreshToken,
      expiresAt
    };
  }

  static async rotate(refreshToken, { ip, userAgent } = {}) {
    await this.ensureSchema();
    const currentHash = hashRefreshToken(refreshToken);

    return withTransaction(pool, async (client) => {
      const existing = await client.query(
        `
        SELECT id, user_id
        FROM auth_sessions
        WHERE refresh_token_hash = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        FOR UPDATE
        `,
        [currentHash]
      );

      if (!existing.rows?.length) return null;

      const row = existing.rows[0];
      const nextRefreshToken = makeRefreshToken();
      const nextHash = hashRefreshToken(nextRefreshToken);
      const expiresAt = nextExpiryDate();

      await client.query(
        `
        UPDATE auth_sessions
        SET
          refresh_token_hash = $1,
          ip = $2,
          user_agent = $3,
          last_used_at = NOW(),
          updated_at = NOW(),
          expires_at = $4,
          revoked_at = NULL,
          revoked_reason = NULL
        WHERE id = $5
        `,
        [nextHash, normalizeIp(ip), normalizeUserAgent(userAgent), expiresAt, row.id]
      );

      return {
        sessionId: row.id,
        userId: row.user_id,
        refreshToken: nextRefreshToken,
        expiresAt
      };
    });
  }

  static async revoke(refreshToken, reason = 'logout') {
    await this.ensureSchema();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const result = await pool.query(
      `
      UPDATE auth_sessions
      SET revoked_at = NOW(), revoked_reason = $2, updated_at = NOW()
      WHERE refresh_token_hash = $1
        AND revoked_at IS NULL
      RETURNING id
      `,
      [refreshTokenHash, (reason || 'logout').toString().slice(0, 64)]
    );

    return result.rowCount > 0;
  }

  static async revokeAllForUser(userId, reason = 'security_reset') {
    await this.ensureSchema();
    const result = await pool.query(
      `
      UPDATE auth_sessions
      SET revoked_at = NOW(), revoked_reason = $2, updated_at = NOW()
      WHERE user_id = $1
        AND revoked_at IS NULL
      `,
      [userId, (reason || 'security_reset').toString().slice(0, 64)]
    );
    return Number(result.rowCount || 0);
  }
}

module.exports = AuthSession;
