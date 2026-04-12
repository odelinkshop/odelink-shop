const pool = require('../config/database');

const parseJsonSafe = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const clampLogs = (logs) => {
  const list = Array.isArray(logs) ? logs : [];
  return list.slice(-200);
};

const normalizeJobRow = (row) => {
  if (!row) return null;
  const logs = clampLogs(parseJsonSafe(row.logs, []));
  const resultSite = parseJsonSafe(row.result_site, null);
  const payload = parseJsonSafe(row.payload, {});

  return {
    jobId: row.job_id,
    userId: row.user_id,
    shopierUrl: row.shopier_url,
    siteName: row.site_name,
    subdomain: row.subdomain,
    payload,
    status: row.status,
    progress: Number(row.progress || 0),
    message: (row.message || '').toString(),
    logs,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    result: resultSite ? { site: resultSite } : null,
    resultSiteId: row.result_site_id || null
  };
};

class AutoBuildJobStore {
  static async ensureSchema() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auto_build_jobs (
        job_id VARCHAR(80) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shopier_url TEXT NOT NULL,
        site_name VARCHAR(100) NOT NULL,
        subdomain VARCHAR(100) NOT NULL,
        status VARCHAR(32) NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        message TEXT,
        logs JSONB NOT NULL DEFAULT '[]'::jsonb,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        result_site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP
      )
    `);
    // Safe migration for already-created tables
    await pool.query("ALTER TABLE auto_build_jobs ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb");
    await pool.query('CREATE INDEX IF NOT EXISTS idx_auto_build_jobs_user_id ON auto_build_jobs (user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_auto_build_jobs_status ON auto_build_jobs (status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_auto_build_jobs_updated_at ON auto_build_jobs (updated_at DESC)');
  }

  static async create(snapshot) {
    await this.ensureSchema();
    const logs = JSON.stringify(clampLogs(snapshot.logs));
    const payload = JSON.stringify(snapshot.payload && typeof snapshot.payload === 'object' ? snapshot.payload : {});
    const resultSiteId = snapshot.resultSiteId || snapshot.result?.site?.id || null;
    const result = await pool.query(
      `
      INSERT INTO auto_build_jobs (
        job_id, user_id, shopier_url, site_name, subdomain,
        status, progress, message, logs, payload, result_site_id, created_at, updated_at, completed_at, cancelled_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, COALESCE($12, NOW()), COALESCE($13, NOW()), $14, $15)
      ON CONFLICT (job_id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        shopier_url = EXCLUDED.shopier_url,
        site_name = EXCLUDED.site_name,
        subdomain = EXCLUDED.subdomain,
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        message = EXCLUDED.message,
        logs = EXCLUDED.logs,
        payload = EXCLUDED.payload,
        result_site_id = EXCLUDED.result_site_id,
        updated_at = EXCLUDED.updated_at,
        completed_at = EXCLUDED.completed_at,
        cancelled_at = EXCLUDED.cancelled_at
      RETURNING job_id
      `,
      [
        snapshot.jobId,
        snapshot.userId,
        snapshot.shopierUrl,
        snapshot.siteName,
        snapshot.subdomain,
        snapshot.status,
        Number(snapshot.progress || 0),
        snapshot.message || '',
        logs,
        payload,
        resultSiteId,
        snapshot.createdAt || null,
        snapshot.updatedAt || null,
        snapshot.completedAt || null,
        snapshot.cancelledAt || null
      ]
    );
    return result.rows[0]?.job_id || snapshot.jobId;
  }

  static async save(snapshot) {
    return await this.create(snapshot);
  }

  static async findById(jobId) {
    await this.ensureSchema();
    const result = await pool.query(
      `
      SELECT
        j.*,
        CASE WHEN s.id IS NOT NULL THEN row_to_json(s) ELSE NULL END AS result_site
      FROM auto_build_jobs j
      LEFT JOIN sites s ON s.id = j.result_site_id
      WHERE j.job_id = $1
      LIMIT 1
      `,
      [jobId]
    );
    return normalizeJobRow(result.rows[0] || null);
  }

  static async listQueued(limit = 25) {
    await this.ensureSchema();
    const result = await pool.query(
      `
      SELECT
        j.*,
        CASE WHEN s.id IS NOT NULL THEN row_to_json(s) ELSE NULL END AS result_site
      FROM auto_build_jobs j
      LEFT JOIN sites s ON s.id = j.result_site_id
      WHERE j.status = 'queued'
      ORDER BY j.created_at ASC
      LIMIT $1
      `,
      [Math.max(1, Math.min(200, Number(limit || 25) || 25))]
    );
    return (result.rows || []).map((row) => normalizeJobRow(row)).filter(Boolean);
  }

  static async claimNextQueuedJob() {
    await this.ensureSchema();
    const result = await pool.query(
      `
      WITH next_job AS (
        SELECT job_id
        FROM auto_build_jobs
        WHERE status = 'queued'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE auto_build_jobs j
      SET
        status = 'running',
        progress = GREATEST(j.progress, 1),
        message = CASE WHEN COALESCE(j.message, '') = '' THEN 'Başlatıldı' ELSE j.message END,
        updated_at = NOW()
      FROM next_job
      WHERE j.job_id = next_job.job_id
      RETURNING j.*
      `
    );
    return normalizeJobRow(result.rows?.[0] || null);
  }

  static async claimQueuedJobById(jobId) {
    await this.ensureSchema();
    const id = (jobId || '').toString().trim();
    if (!id) return null;
    const result = await pool.query(
      `
      UPDATE auto_build_jobs j
      SET
        status = 'running',
        progress = GREATEST(j.progress, 1),
        message = CASE WHEN COALESCE(j.message, '') = '' THEN 'Başlatıldı' ELSE j.message END,
        updated_at = NOW()
      WHERE j.job_id = $1
        AND j.status = 'queued'
      RETURNING j.*
      `,
      [id]
    );
    return normalizeJobRow(result.rows?.[0] || null);
  }

  static async appendLog(jobId, entry) {
    await this.ensureSchema();
    const payload = JSON.stringify(clampLogs([entry]));
    await pool.query(
      `
      UPDATE auto_build_jobs
      SET
        logs = COALESCE(logs, '[]'::jsonb) || ($2::jsonb),
        updated_at = NOW()
      WHERE job_id = $1
      `,
      [jobId, payload]
    );
  }

  static async updateProgress(jobId, { progress, message, status } = {}) {
    await this.ensureSchema();
    const p = Number(progress);
    const hasP = Number.isFinite(p);
    const msg = message == null ? null : (message || '').toString();
    const st = status == null ? null : (status || '').toString();
    await pool.query(
      `
      UPDATE auto_build_jobs
      SET
        progress = CASE WHEN $2::boolean THEN LEAST(100, GREATEST(0, $3::int)) ELSE progress END,
        message = COALESCE($4, message),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE job_id = $1
      `,
      [jobId, hasP, hasP ? Math.floor(p) : 0, msg, st]
    );
  }

  static async markCompleted(jobId, { resultSiteId, message } = {}) {
    await this.ensureSchema();
    await pool.query(
      `
      UPDATE auto_build_jobs
      SET
        status = 'completed',
        progress = 100,
        message = COALESCE($3, message),
        result_site_id = COALESCE($2, result_site_id),
        updated_at = NOW(),
        completed_at = NOW()
      WHERE job_id = $1
      `,
      [jobId, resultSiteId || null, message == null ? null : (message || '').toString()]
    );
  }

  static async markFailed(jobId, { message } = {}) {
    await this.ensureSchema();
    await pool.query(
      `
      UPDATE auto_build_jobs
      SET
        status = 'failed',
        message = COALESCE($2, message),
        updated_at = NOW(),
        completed_at = NOW()
      WHERE job_id = $1
      `,
      [jobId, message == null ? null : (message || '').toString()]
    );
  }

  static async markInterruptedJobs() {
    await this.ensureSchema();
    await pool.query(
      `
      UPDATE auto_build_jobs
      SET
        status = 'failed',
        progress = CASE WHEN progress >= 100 THEN 100 ELSE progress END,
        message = 'Sunucu yeniden baslatildigi icin islem durduruldu. Lutfen tekrar deneyin.',
        updated_at = NOW(),
        completed_at = NOW()
      WHERE status = 'running'
      `
    );
  }

  static async cleanupOldJobs(maxAgeHours = 24 * 7) {
    await this.ensureSchema();
    await pool.query(
      `
      DELETE FROM auto_build_jobs
      WHERE status IN ('completed', 'failed', 'cancelled')
        AND updated_at < NOW() - (($1::text || ' hours')::interval)
      `,
      [Math.max(24, Number(maxAgeHours || 0))]
    );
  }
}

module.exports = AutoBuildJobStore;
