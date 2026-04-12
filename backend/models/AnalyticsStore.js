const pool = require('../config/database');
const crypto = require('crypto');

let ensureSchemaPromise = null;

const normalizeVisitorId = (value) => {
  const visitorId = (value || '').toString().trim();
  if (!visitorId) return '';
  return visitorId.slice(0, 128);
};

const normalizePath = (value) => {
  return (value || '').toString().slice(0, 256);
};

const normalizeReferrer = (value) => {
  const raw = (value || '').toString().trim();
  if (!raw) return '';
  return raw.slice(0, 512);
};

const normalizeUserAgent = (value) => {
  const raw = (value || '').toString().trim();
  if (!raw) return '';
  return raw.slice(0, 256);
};

const normalizeCountry = (value) => {
  const raw = (value || '').toString().trim().toUpperCase();
  if (!raw) return '';
  return raw.slice(0, 8);
};

const normalizeProductKey = (value) => {
  const raw = (value || '').toString().trim();
  if (!raw) return '';
  return raw.slice(0, 256);
};

const deriveDeviceType = (ua) => {
  const v = (ua || '').toString().toLowerCase();
  if (!v) return 'unknown';
  if (/(android|iphone|ipad|ipod|mobile)/i.test(v)) return 'mobile';
  return 'desktop';
};

const extractReferrerHost = (referrer) => {
  const raw = (referrer || '').toString().trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    return (u.hostname || '').toString().trim().toLowerCase().slice(0, 128);
  } catch (e) {
    void e;
    return '';
  }
};

class AnalyticsStore {
  static async ensureSchema() {
    if (ensureSchemaPromise) return ensureSchemaPromise;

    ensureSchemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_analytics (
          id UUID PRIMARY KEY,
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          page_views INT NOT NULL DEFAULT 0,
          unique_visitors INT NOT NULL DEFAULT 0,
          clicks INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_newsletter_subscribers (
          id VARCHAR(64) PRIMARY KEY,
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_contact_messages (
          id VARCHAR(64) PRIMARY KEY,
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          message VARCHAR(5000) NOT NULL,
          page VARCHAR(256),
          visitor_id VARCHAR(128),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS visitor_heartbeats (
          visitor_id VARCHAR(128) PRIMARY KEY,
          path VARCHAR(256),
          last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_daily_unique_visitors (
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          visitor_id VARCHAR(128) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (site_id, date, visitor_id)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id UUID PRIMARY KEY,
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          type VARCHAR(32) NOT NULL,
          path VARCHAR(256),
          referrer VARCHAR(512),
          referrer_host VARCHAR(128),
          ua VARCHAR(256),
          device_type VARCHAR(16),
          country VARCHAR(8),
          product_key VARCHAR(256)
        )
      `);

      // Consolidate legacy duplicate analytics rows before adding the unique index needed for UPSERT.
      await pool.query(`
        WITH grouped AS (
          SELECT
            site_id,
            date,
            MIN(id::text) AS keep_id,
            COALESCE(SUM(page_views), 0) AS sum_page_views,
            COALESCE(SUM(unique_visitors), 0) AS sum_unique_visitors,
            COALESCE(SUM(clicks), 0) AS sum_clicks
          FROM site_analytics
          GROUP BY site_id, date
          HAVING COUNT(*) > 1
        ),
        updated AS (
          UPDATE site_analytics s
          SET
            page_views = g.sum_page_views,
            unique_visitors = g.sum_unique_visitors,
            clicks = g.sum_clicks
          FROM grouped g
          WHERE s.id::text = g.keep_id
          RETURNING s.id
        )
        DELETE FROM site_analytics s
        USING grouped g
        WHERE s.site_id = g.site_id
          AND s.date = g.date
          AND s.id::text <> g.keep_id
      `);

      await pool.query('CREATE INDEX IF NOT EXISTS idx_visitor_heartbeats_last_seen ON visitor_heartbeats (last_seen DESC)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_site_daily_unique_visitors_site_date ON site_daily_unique_visitors (site_id, date DESC)');
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_site_analytics_site_date_unique ON site_analytics (site_id, date)');
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_site_newsletter_site_email_unique ON site_newsletter_subscribers (site_id, email)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_site_contact_messages_site_ts ON site_contact_messages (site_id, created_at DESC)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_events_site_ts ON analytics_events (site_id, ts DESC)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_events_site_type_ts ON analytics_events (site_id, type, ts DESC)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_events_site_product_ts ON analytics_events (site_id, product_key, ts DESC)');
    })().catch((error) => {
      ensureSchemaPromise = null;
      throw error;
    });

    return ensureSchemaPromise;
  }

  static async recordVisitorHeartbeat({ visitorId, path }) {
    const normalizedVisitorId = normalizeVisitorId(visitorId);
    if (!normalizedVisitorId) return false;

    await this.ensureSchema();
    await pool.query(
      `
      INSERT INTO visitor_heartbeats (visitor_id, path, last_seen, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (visitor_id) DO UPDATE
      SET
        path = EXCLUDED.path,
        last_seen = EXCLUDED.last_seen,
        updated_at = NOW()
      `,
      [normalizedVisitorId, normalizePath(path)]
    );

    return true;
  }

  static async getActiveVisitorCount({ activeWindowMs, maxTrackMs } = {}) {
    await this.ensureSchema();

    const activeSeconds = Math.max(1, Math.floor((Number(activeWindowMs || 60 * 1000)) / 1000));
    const retentionSeconds = Math.max(activeSeconds, Math.floor((Number(maxTrackMs || 10 * 60 * 1000)) / 1000));

    await pool.query(
      `
      DELETE FROM visitor_heartbeats
      WHERE last_seen < NOW() - (($1::text || ' seconds')::interval)
      `,
      [retentionSeconds]
    );

    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS active_visitors
      FROM visitor_heartbeats
      WHERE last_seen >= NOW() - (($1::text || ' seconds')::interval)
      `,
      [activeSeconds]
    );

    return Number(result.rows?.[0]?.active_visitors || 0);
  }

  static async getActiveVisitorCountByPrefix(prefix, { activeWindowMs, maxTrackMs } = {}) {
    await this.ensureSchema();

    const safePrefix = (prefix || '').toString().trim().slice(0, 64);
    if (!safePrefix) return 0;

    const activeSeconds = Math.max(1, Math.floor((Number(activeWindowMs || 60 * 1000)) / 1000));
    const retentionSeconds = Math.max(activeSeconds, Math.floor((Number(maxTrackMs || 10 * 60 * 1000)) / 1000));

    await pool.query(
      `
      DELETE FROM visitor_heartbeats
      WHERE last_seen < NOW() - (($1::text || ' seconds')::interval)
      `,
      [retentionSeconds]
    );

    const like = `${safePrefix}:%`;
    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS active_visitors
      FROM visitor_heartbeats
      WHERE visitor_id LIKE $2
        AND last_seen >= NOW() - (($1::text || ' seconds')::interval)
      `,
      [activeSeconds, like]
    );

    return Number(result.rows?.[0]?.active_visitors || 0);
  }

  static async trackSiteView({ siteId, visitorId }) {
    await this.ensureSchema();

    const dateResult = await pool.query('SELECT CURRENT_DATE AS d');
    const dateKey = dateResult.rows?.[0]?.d;
    const normalizedVisitorId = normalizeVisitorId(visitorId);

    let uniqueIncrement = 0;
    if (normalizedVisitorId) {
      const uniqueResult = await pool.query(
        `
        INSERT INTO site_daily_unique_visitors (site_id, date, visitor_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        RETURNING visitor_id
        `,
        [siteId, dateKey, normalizedVisitorId]
      );
      uniqueIncrement = uniqueResult.rowCount > 0 ? 1 : 0;
    }

    const rowId = (() => {
      try {
        if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      } catch (e) {
        void e;
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    })();

    await pool.query(
      `
      INSERT INTO site_analytics (id, site_id, date, page_views, unique_visitors, clicks, created_at)
      VALUES ($1, $2, $3, 1, $4, 0, NOW())
      ON CONFLICT (site_id, date) DO UPDATE
      SET
        page_views = site_analytics.page_views + 1,
        unique_visitors = site_analytics.unique_visitors + EXCLUDED.unique_visitors
      `,
      [rowId, siteId, dateKey, uniqueIncrement]
    );

    return {
      dateKey,
      pageViewIncrement: 1,
      uniqueIncrement
    };
  }

  static async incrementSiteClick(siteId) {
    await this.ensureSchema();

    const dateResult = await pool.query('SELECT CURRENT_DATE AS d');
    const dateKey = dateResult.rows?.[0]?.d;

    const rowId = (() => {
      try {
        if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      } catch (e) {
        void e;
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    })();

    await pool.query(
      `
      INSERT INTO site_analytics (id, site_id, date, page_views, unique_visitors, clicks, created_at)
      VALUES ($1, $2, $3, 0, 0, 1, NOW())
      ON CONFLICT (site_id, date) DO UPDATE
      SET clicks = site_analytics.clicks + 1
      `,
      [rowId, siteId, dateKey]
    );

    return { dateKey };
  }

  static async recordEvent({ siteId, type, path, referrer, ua, country, productKey }) {
    await this.ensureSchema();
    const safeType = (type || '').toString().trim().toLowerCase().slice(0, 32);
    if (!safeType) return false;

    const safeUa = normalizeUserAgent(ua);
    const safeCountry = normalizeCountry(country);
    const safeReferrer = normalizeReferrer(referrer);
    const referrerHost = extractReferrerHost(safeReferrer);
    const deviceType = deriveDeviceType(safeUa);
    const safeProductKey = normalizeProductKey(productKey);

    const id = (() => {
      try {
        if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      } catch (e) {
        void e;
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    })();

    await pool.query(
      `
      INSERT INTO analytics_events (id, site_id, ts, type, path, referrer, referrer_host, ua, device_type, country, product_key)
      VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        id,
        siteId,
        safeType,
        normalizePath(path),
        safeReferrer || null,
        referrerHost || null,
        safeUa || null,
        deviceType || null,
        safeCountry || null,
        safeProductKey || null
      ]
    );

    return true;
  }

  static async getBreakdowns({ siteId, days }) {
    await this.ensureSchema();
    const safeDays = Math.max(1, Math.min(365, Number(days || 30) || 30));

    const [refRes, deviceRes, countryRes] = await Promise.all([
      pool.query(
        `
        SELECT COALESCE(referrer_host, '') AS k, COUNT(*)::int AS c
        FROM analytics_events
        WHERE site_id = $1
          AND ts >= NOW() - (($2::text || ' days')::interval)
          AND COALESCE(referrer_host, '') <> ''
        GROUP BY COALESCE(referrer_host, '')
        ORDER BY c DESC
        LIMIT 10
        `,
        [siteId, safeDays]
      ),
      pool.query(
        `
        SELECT COALESCE(device_type, 'unknown') AS k, COUNT(*)::int AS c
        FROM analytics_events
        WHERE site_id = $1
          AND ts >= NOW() - (($2::text || ' days')::interval)
        GROUP BY COALESCE(device_type, 'unknown')
        ORDER BY c DESC
        `,
        [siteId, safeDays]
      ),
      pool.query(
        `
        SELECT COALESCE(country, '??') AS k, COUNT(*)::int AS c
        FROM analytics_events
        WHERE site_id = $1
          AND ts >= NOW() - (($2::text || ' days')::interval)
          AND COALESCE(country, '') <> ''
        GROUP BY COALESCE(country, '??')
        ORDER BY c DESC
        LIMIT 10
        `,
        [siteId, safeDays]
      )
    ]);

    const mapRows = (r) => (Array.isArray(r?.rows) ? r.rows : []).map((x) => ({ key: x.k, count: Number(x.c || 0) }));
    return {
      referrers: mapRows(refRes),
      devices: mapRows(deviceRes),
      countries: mapRows(countryRes)
    };
  }

  static async getTopProducts({ siteId, days }) {
    await this.ensureSchema();
    const safeDays = Math.max(1, Math.min(365, Number(days || 30) || 30));

    const res = await pool.query(
      `
      SELECT COALESCE(product_key, '') AS k, COUNT(*)::int AS c
      FROM analytics_events
      WHERE site_id = $1
        AND type = 'click'
        AND ts >= NOW() - (($2::text || ' days')::interval)
        AND COALESCE(product_key, '') <> ''
      GROUP BY COALESCE(product_key, '')
      ORDER BY c DESC
      LIMIT 20
      `,
      [siteId, safeDays]
    );

    return (Array.isArray(res.rows) ? res.rows : []).map((x) => ({ productKey: x.k, clicks: Number(x.c || 0) }));
  }

  static async getRealtimeWindow({ siteId, windowSeconds = 600 }) {
    await this.ensureSchema();
    const seconds = Math.max(30, Math.min(3600, Number(windowSeconds || 600) || 600));
    const res = await pool.query(
      `
      SELECT type, COUNT(*)::int AS c
      FROM analytics_events
      WHERE site_id = $1
        AND ts >= NOW() - (($2::text || ' seconds')::interval)
      GROUP BY type
      `,
      [siteId, seconds]
    );
    const out = { page_view: 0, click: 0 };
    (Array.isArray(res.rows) ? res.rows : []).forEach((r) => {
      const t = (r?.type || '').toString();
      out[t] = Number(r?.c || 0);
    });
    return { windowSeconds: seconds, counts: out };
  }

  static async addNewsletterSubscriber({ siteId, email }) {
    await this.ensureSchema();
    const safeEmail = (email || '').toString().trim().toLowerCase().slice(0, 255);
    if (!safeEmail || !safeEmail.includes('@')) return { ok: false, error: 'Geçersiz e-posta' };

    const id = (() => {
      try {
        if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      } catch (e) {
        void e;
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    })();

    try {
      await pool.query(
        `
        INSERT INTO site_newsletter_subscribers (id, site_id, email)
        VALUES ($1, $2, $3)
        ON CONFLICT (site_id, email) DO NOTHING
        `,
        [id, siteId, safeEmail]
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e?.message || 'Kaydedilemedi').toString().slice(0, 200) };
    }
  }

  static async addContactMessage({ siteId, email, message, page, visitorId }) {
    await this.ensureSchema();

    const safeEmail = (email || '').toString().trim().toLowerCase().slice(0, 255);
    if (!safeEmail || !safeEmail.includes('@')) return { ok: false, error: 'Geçersiz e-posta' };

    const safeMessage = (message || '').toString().trim().slice(0, 5000);
    if (!safeMessage || safeMessage.length < 2) return { ok: false, error: 'Mesaj gerekli' };

    const safePage = normalizePath(page);
    const safeVisitorId = normalizeVisitorId(visitorId);

    const id = (() => {
      try {
        if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      } catch (e) {
        void e;
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    })();

    try {
      await pool.query(
        `
        INSERT INTO site_contact_messages (id, site_id, email, message, page, visitor_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [id, siteId, safeEmail, safeMessage, safePage || null, safeVisitorId || null]
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e?.message || 'Kaydedilemedi').toString().slice(0, 200) };
    }
  }
}

module.exports = AnalyticsStore;
