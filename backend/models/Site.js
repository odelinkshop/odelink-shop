const pool = require('../config/database');
const { optimizeSiteSettings } = require('../services/imageOptimizationService');

const slugify = (raw) => {
  let s = (raw || '').toString().trim().toLowerCase();
  // Kötü kelimeleri çıkar (shopier, mağaza, store vb)
  s = s.replace(/shopier|magaza|store|official|resmi/gi, '');
  const ascii = s
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  const cleaned = ascii
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  // Maksimum 20 karakter - kısa ve profesyonel
  return (cleaned || 'magaza').slice(0, 20);
};

const clampSubdomain = (raw, maxLen = 20) => {
  const cleaned = (raw || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || '').slice(0, Math.max(1, Number(maxLen) || 20));
};

const buildCandidateWithSuffix = (base, suffix, maxLen = 20) => {
  const safeSuffix = (suffix || '').toString();
  const max = Math.max(1, Number(maxLen) || 20);
  const baseMax = Math.max(1, max - safeSuffix.length);
  const trimmedBase = (base || '').toString().slice(0, baseMax).replace(/-+$/g, '');
  const merged = `${trimmedBase}${safeSuffix}`;
  return merged.slice(0, max);
};

const buildUniqueSubdomain = async (name) => {
  const base = slugify(name);
  let candidate = base;
  let n = 1;
  // Avoid infinite loops; 200 attempts is plenty.
  while (n < 200) {
    const exists = await pool.query('SELECT 1 FROM sites WHERE subdomain = $1 LIMIT 1', [candidate]);
    if (exists.rowCount === 0) return candidate;
    n += 1;
    candidate = buildCandidateWithSuffix(base, `-${n}`);
  }
  // Worst-case fallback: use a timestamp suffix (still readable-ish)
  return buildCandidateWithSuffix(base, `-${Date.now().toString().slice(-6)}`);
};

class Site {
  static async create(siteData) {
    const { userId, name, shopierUrl, customDomain, theme, settings } = siteData;
    const requestedSubdomainRaw = (siteData?.subdomain || '').toString().trim().toLowerCase();
    const requestedSubdomain = clampSubdomain(requestedSubdomainRaw, 20);

    const subdomain = requestedSubdomain
      ? await (async () => {
        const exists = await pool.query('SELECT 1 FROM sites WHERE subdomain = $1 LIMIT 1', [requestedSubdomain]);
        if (exists.rowCount === 0) return requestedSubdomain;
        return await buildUniqueSubdomain(name);
      })()
      : await buildUniqueSubdomain(name);
    
    const query = `
      INSERT INTO sites (user_id, name, shopier_url, subdomain, custom_domain, theme, settings, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [userId, name, shopierUrl, subdomain, customDomain, theme || null, settings || null]);
      return result.rows[0];
    } catch (error) {
      const code = (error?.code || '').toString();
      const constraint = (error?.constraint || '').toString();
      const detail = (error?.detail || '').toString();
      const hint = (error?.hint || '').toString();
      const extras = [
        code ? `code=${code}` : '',
        constraint ? `constraint=${constraint}` : '',
        detail ? `detail=${detail}` : '',
        hint ? `hint=${hint}` : ''
      ].filter(Boolean).join(' ');
      throw new Error(`Site oluşturulamadı: ${(error?.message || String(error)).toString()}${extras ? ` (${extras})` : ''}`);
    }
  }

  static async findDashboardByUserId(userId) {
    const query = `
      SELECT
        id,
        user_id,
        name,
        shopier_url,
        subdomain,
        custom_domain,
        status,
        created_at,
        updated_at
      FROM sites
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error('Siteler bulunamadı: ' + error.message);
    }
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM sites 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error('Siteler bulunamadı: ' + error.message);
    }
  }

  static async findAll() {
    const query = `
      SELECT * FROM sites 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      // Boş array dön, hata fırlatma
      return result.rows || [];
    } catch (error) {
      console.error('Site.findAll error:', error);
      // Hata durumunda boş array dön, crash etme
      return [];
    }
  }

  static async findMostRecentByShopierUrl(shopierUrl) {
    const raw = (shopierUrl || '').toString().trim();
    if (!raw) return null;
    const query = `
      SELECT *
      FROM sites
      WHERE shopier_url = $1
        AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    try {
      const result = await pool.query(query, [raw]);
      return result.rows?.[0] || null;
    } catch (error) {
      throw new Error('Site bulunamadı: ' + error.message);
    }
  }

  static async findById(siteId) {
    const query = `
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM sites s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    
    try {
      const result = await pool.query(query, [siteId]);
      const site = result.rows[0];
      
      if (!site) {
        return null;
      }
      
      // Image optimization
      if (site && site.settings) {
        site.settings = optimizeSiteSettings(site.settings);
      }
      
      return site;
    } catch (error) {
      console.error('❌ Site.findById error:', error);
      throw new Error('Site bulunamadı: ' + error.message);
    }
  }

  static async findBySubdomain(subdomain) {
    const query = 'SELECT * FROM sites WHERE subdomain = $1 AND status = $2';
    try {
      const result = await pool.query(query, [subdomain, 'active']);
      const site = result.rows[0];
      
      // Image optimization
      if (site && site.settings) {
        site.settings = optimizeSiteSettings(site.settings);
      }
      
      return site;
    } catch (error) {
      throw new Error('Site bulunamadı: ' + error.message);
    }
  }

  static async findByCustomDomain(customDomain) {
    const domain = (customDomain || '').toString().trim().toLowerCase();
    if (!domain) return null;
    const query = "SELECT * FROM sites WHERE LOWER(custom_domain) = $1 AND status = $2";
    try {
      const result = await pool.query(query, [domain, 'active']);
      return result.rows[0];
    } catch (error) {
      throw new Error('Site bulunamadı: ' + error.message);
    }
  }

  static async findByShopierSyncStatuses(statuses = ['queued', 'running'], limit = 25) {
    const normalizedStatuses = Array.isArray(statuses)
      ? statuses
        .map((status) => (status || '').toString().trim().toLowerCase())
        .filter(Boolean)
      : [];

    if (normalizedStatuses.length === 0) {
      return [];
    }

    const query = `
      SELECT *
      FROM sites
      WHERE status = 'active'
        AND COALESCE(LOWER(settings->'shopier_sync'->>'status'), '') = ANY($1::text[])
      ORDER BY updated_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [
        normalizedStatuses,
        Math.max(1, Math.min(200, Number(limit || 25) || 25))
      ]);
      return result.rows;
    } catch (error) {
      throw new Error('Shopier senkronizasyon siteleri alinamadi: ' + error.message);
    }
  }

  static async findShopierSitesDueForRefresh({ olderThanMs = 60 * 60 * 1000, limit = 10 } = {}) {
    const ms = Math.max(60 * 1000, Number(olderThanMs || 0) || 0);
    const safeLimit = Math.max(1, Math.min(200, Number(limit || 10) || 10));

    const query = `
      SELECT
        *,
        COALESCE(
          NULLIF(shopier_url, ''),
          NULLIF(settings->>'shopierUrl', ''),
          NULLIF(settings->>'shopier_url', '')
        ) as resolved_shopier_url
      FROM sites
      WHERE status = 'active'
        AND COALESCE(
          NULLIF(shopier_url, ''),
          NULLIF(settings->>'shopierUrl', ''),
          NULLIF(settings->>'shopier_url', '')
        ) IS NOT NULL
        AND COALESCE(LOWER(settings->'shopier_sync'->>'status'), '') NOT IN ('queued', 'running')
        AND (
          settings->>'catalog_refreshed_at' IS NULL
          OR (NOW() - (settings->>'catalog_refreshed_at')::timestamptz) > ($1::int * interval '1 millisecond')
        )
      ORDER BY
        (settings->>'catalog_refreshed_at')::timestamptz NULLS FIRST,
        updated_at ASC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [ms, safeLimit]);
      return result.rows;
    } catch (error) {
      throw new Error('Shopier refresh siteleri alınamadı: ' + error.message);
    }
  }

  static async update(siteId, updateData) {
    const { name, shopierUrl, customDomain, theme, status, settings } = updateData;
    const dbSettings = (settings && typeof settings === 'object') ? JSON.stringify(settings) : (settings || null);
    const query = `
      UPDATE sites
      SET
        name = COALESCE($1, name),
        shopier_url = COALESCE($2, shopier_url),
        custom_domain = COALESCE($3, custom_domain),
        theme = COALESCE($4, theme),
        status = COALESCE($5, status),
        settings = COALESCE(settings, '{}'::jsonb) || COALESCE($6::jsonb, '{}'::jsonb),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [name, shopierUrl, customDomain, theme, status, dbSettings, siteId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Site güncellenemedi: ' + error.message);
    }
  }

  static async delete(siteId) {
    const query = 'DELETE FROM sites WHERE id = $1 RETURNING *';
    try {
      const result = await pool.query(query, [siteId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Site silinemedi: ' + error.message);
    }
  }

  static async getSiteStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_sites,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sites,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_sites
      FROM sites 
      WHERE user_id = $1
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Site istatistikleri alınamadı: ' + error.message);
    }
  }
}

module.exports = Site;
