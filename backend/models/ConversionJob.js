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

const clampProgress = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.floor(num)));
};

const normalizeJobRow = (row) => {
  if (!row) return null;
  
  const steps = parseJsonSafe(row.steps, []);
  const errors = parseJsonSafe(row.errors, []);
  const stats = parseJsonSafe(row.stats, {});

  return {
    jobId: row.job_id,
    themeUrl: row.theme_url,
    themeName: row.theme_name,
    status: row.status,
    progress: clampProgress(row.progress),
    currentStep: row.current_step,
    steps,
    errors,
    stats,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at
  };
};

class ConversionJob {
  static async ensureSchema() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversion_jobs (
        job_id VARCHAR(80) PRIMARY KEY,
        theme_url TEXT NOT NULL,
        theme_name VARCHAR(100) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        progress INTEGER NOT NULL DEFAULT 0,
        current_step VARCHAR(100),
        steps JSONB NOT NULL DEFAULT '[]'::jsonb,
        errors JSONB NOT NULL DEFAULT '[]'::jsonb,
        stats JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversion_jobs_status ON conversion_jobs (status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversion_jobs_updated_at ON conversion_jobs (updated_at DESC)');
  }

  static async create(jobData) {
    await this.ensureSchema();
    
    const {
      jobId,
      themeUrl,
      themeName,
      status = 'pending',
      progress = 0,
      currentStep = null,
      steps = [],
      errors = [],
      stats = {}
    } = jobData;

    const query = `
      INSERT INTO conversion_jobs (
        job_id, theme_url, theme_name, status, progress, current_step,
        steps, errors, stats, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, NOW(), NOW())
      ON CONFLICT (job_id) DO UPDATE SET
        theme_url = EXCLUDED.theme_url,
        theme_name = EXCLUDED.theme_name,
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        current_step = EXCLUDED.current_step,
        steps = EXCLUDED.steps,
        errors = EXCLUDED.errors,
        stats = EXCLUDED.stats,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      themeUrl,
      themeName,
      status,
      clampProgress(progress),
      currentStep,
      JSON.stringify(steps),
      JSON.stringify(errors),
      JSON.stringify(stats)
    ]);

    return normalizeJobRow(result.rows[0]);
  }

  static async findById(jobId) {
    await this.ensureSchema();
    
    const query = 'SELECT * FROM conversion_jobs WHERE job_id = $1 LIMIT 1';
    const result = await pool.query(query, [jobId]);
    
    return normalizeJobRow(result.rows[0] || null);
  }

  static async updateStatus(jobId, status) {
    await this.ensureSchema();
    
    const completedAt = (status === 'completed' || status === 'failed') ? 'NOW()' : 'completed_at';
    
    const query = `
      UPDATE conversion_jobs
      SET
        status = $2,
        updated_at = NOW(),
        completed_at = ${completedAt}
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [jobId, status]);
    return normalizeJobRow(result.rows[0] || null);
  }

  static async updateProgress(jobId, progress, currentStep = null) {
    await this.ensureSchema();
    
    const query = `
      UPDATE conversion_jobs
      SET
        progress = $2,
        current_step = COALESCE($3, current_step),
        updated_at = NOW()
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      clampProgress(progress),
      currentStep
    ]);

    return normalizeJobRow(result.rows[0] || null);
  }

  static async recordStep(jobId, stepData) {
    await this.ensureSchema();
    
    const step = {
      name: stepData.name,
      status: stepData.status,
      completedAt: new Date().toISOString(),
      duration: stepData.duration || null,
      details: stepData.details || null
    };

    const query = `
      UPDATE conversion_jobs
      SET
        steps = steps || $2::jsonb,
        updated_at = NOW()
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      JSON.stringify([step])
    ]);

    return normalizeJobRow(result.rows[0] || null);
  }

  static async recordError(jobId, errorData) {
    await this.ensureSchema();
    
    const error = {
      message: errorData.message,
      filePath: errorData.filePath || null,
      lineNumber: errorData.lineNumber || null,
      severity: errorData.severity || 'error',
      timestamp: new Date().toISOString(),
      stack: errorData.stack || null
    };

    const query = `
      UPDATE conversion_jobs
      SET
        errors = errors || $2::jsonb,
        updated_at = NOW()
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      JSON.stringify([error])
    ]);

    return normalizeJobRow(result.rows[0] || null);
  }

  static async updateStats(jobId, stats) {
    await this.ensureSchema();
    
    const query = `
      UPDATE conversion_jobs
      SET
        stats = stats || $2::jsonb,
        updated_at = NOW()
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      JSON.stringify(stats)
    ]);

    return normalizeJobRow(result.rows[0] || null);
  }

  static async markCompleted(jobId, finalStats = {}) {
    await this.ensureSchema();
    
    const query = `
      UPDATE conversion_jobs
      SET
        status = 'completed',
        progress = 100,
        stats = stats || $2::jsonb,
        updated_at = NOW(),
        completed_at = NOW()
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      JSON.stringify(finalStats)
    ]);

    return normalizeJobRow(result.rows[0] || null);
  }

  static async markFailed(jobId, errorMessage) {
    await this.ensureSchema();
    
    const error = {
      message: errorMessage,
      severity: 'critical',
      timestamp: new Date().toISOString()
    };

    const query = `
      UPDATE conversion_jobs
      SET
        status = 'failed',
        errors = errors || $2::jsonb,
        updated_at = NOW(),
        completed_at = NOW()
      WHERE job_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      jobId,
      JSON.stringify([error])
    ]);

    return normalizeJobRow(result.rows[0] || null);
  }

  static async listRecent(limit = 25) {
    await this.ensureSchema();
    
    const query = `
      SELECT * FROM conversion_jobs
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [
      Math.max(1, Math.min(200, Number(limit || 25)))
    ]);

    return result.rows.map(row => normalizeJobRow(row)).filter(Boolean);
  }

  static async listByStatus(status, limit = 25) {
    await this.ensureSchema();
    
    const query = `
      SELECT * FROM conversion_jobs
      WHERE status = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [
      status,
      Math.max(1, Math.min(200, Number(limit || 25)))
    ]);

    return result.rows.map(row => normalizeJobRow(row)).filter(Boolean);
  }

  static async cleanupOldJobs(maxAgeHours = 24 * 7) {
    await this.ensureSchema();
    
    const query = `
      DELETE FROM conversion_jobs
      WHERE status IN ('completed', 'failed')
        AND updated_at < NOW() - (($1::text || ' hours')::interval)
    `;

    await pool.query(query, [Math.max(24, Number(maxAgeHours || 0))]);
  }
}

module.exports = ConversionJob;
