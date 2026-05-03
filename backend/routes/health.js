/**
 * HEALTH CHECK ROUTES
 * Detaylı sistem sağlık kontrolü
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Temel health check (hızlı)
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Odelink backend liveness is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptimeSeconds: Math.round(process.uptime())
  });
});

/**
 * Detaylı health check
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  const checks = {};

  // 1. Database Check
  try {
    const dbStart = Date.now();
    const result = await pool.query('SELECT 1 AS ok, NOW() as server_time');
    const dbTime = Date.now() - dbStart;
    
    checks.database = {
      status: 'healthy',
      responseTime: `${dbTime}ms`,
      serverTime: result.rows[0]?.server_time,
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }

  // 2. Memory Check
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  checks.memory = {
    status: (memUsage.heapUsed / memUsage.heapTotal) < 0.9 ? 'healthy' : 'warning',
    process: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    },
    system: {
      total: `${Math.round(totalMem / 1024 / 1024 / 1024)}GB`,
      used: `${Math.round(usedMem / 1024 / 1024 / 1024)}GB`,
      free: `${Math.round(freeMem / 1024 / 1024 / 1024)}GB`,
      usagePercent: `${Math.round((usedMem / totalMem) * 100)}%`
    }
  };

  // 3. CPU Check
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  
  checks.cpu = {
    status: loadAvg[0] < cpus.length * 0.8 ? 'healthy' : 'warning',
    cores: cpus.length,
    model: cpus[0]?.model || 'unknown',
    loadAverage: {
      '1min': loadAvg[0].toFixed(2),
      '5min': loadAvg[1].toFixed(2),
      '15min': loadAvg[2].toFixed(2)
    },
    usage: cpus.map((cpu, i) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      const usage = Math.round(((total - idle) / total) * 100);
      return { core: i, usage: `${usage}%` };
    })
  };

  // 4. Disk Check
  try {
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const stats = fs.statSync(uploadsPath);
    
    checks.disk = {
      status: 'healthy',
      uploadsPath: uploadsPath,
      exists: fs.existsSync(uploadsPath),
      writable: fs.accessSync(uploadsPath, fs.constants.W_OK) === undefined
    };
  } catch (error) {
    checks.disk = {
      status: 'warning',
      error: error.message
    };
  }

  // 5. Environment Check
  checks.environment = {
    status: 'healthy',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    env: process.env.NODE_ENV || 'development',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    uptime: `${Math.round(process.uptime())}s`,
    pid: process.pid
  };

  // 6. Dependencies Check
  checks.dependencies = {
    status: 'healthy',
    express: require('express/package.json').version,
    pg: require('pg/package.json').version,
    jwt: require('jsonwebtoken/package.json').version,
    bcrypt: require('bcryptjs/package.json').version,
    helmet: require('helmet/package.json').version
  };

  // 7. API Endpoints Check
  try {
    const sitesCount = await pool.query('SELECT COUNT(*) as count FROM sites');
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    checks.data = {
      status: 'healthy',
      sites: parseInt(sitesCount.rows[0]?.count || 0),
      users: parseInt(usersCount.rows[0]?.count || 0)
    };
  } catch (error) {
    checks.data = {
      status: 'warning',
      error: error.message
    };
  }

  // 8. Shopier Sync Check
  try {
    const lastSync = await pool.query(
      "SELECT updated_at FROM sites WHERE updated_at IS NOT NULL ORDER BY updated_at DESC LIMIT 1"
    );
    
    checks.shopierSync = {
      status: 'healthy',
      lastSync: lastSync.rows[0]?.updated_at || null,
      syncInterval: '1 minute'
    };
  } catch (error) {
    checks.shopierSync = {
      status: 'warning',
      error: error.message
    };
  }

  // Overall Status
  const allHealthy = Object.values(checks).every(check => 
    check.status === 'healthy' || check.status === 'warning'
  );
  
  const hasWarnings = Object.values(checks).some(check => 
    check.status === 'warning'
  );
  
  const hasErrors = Object.values(checks).some(check => 
    check.status === 'unhealthy' || check.status === 'error'
  );

  const overallStatus = hasErrors ? 'unhealthy' : (hasWarnings ? 'degraded' : 'healthy');
  const responseTime = Date.now() - startTime;

  res.status(overallStatus === 'unhealthy' ? 503 : 200).json({
    status: overallStatus,
    message: overallStatus === 'healthy' 
      ? 'All systems operational' 
      : overallStatus === 'degraded'
      ? 'Some systems have warnings'
      : 'Some systems are unhealthy',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    checks
  });
});

/**
 * Readiness check (Kubernetes/Docker için)
 */
router.get('/ready', async (req, res) => {
  try {
    // Database bağlantısını kontrol et
    await pool.query('SELECT 1');
    
    res.json({
      status: 'ready',
      message: 'Service is ready to accept traffic',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      message: 'Service is not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness check (Kubernetes/Docker için)
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: `${Math.round(process.uptime())}s`
  });
});

module.exports = router;
