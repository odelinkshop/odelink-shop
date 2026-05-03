const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');
const hpp = require('hpp');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');

const app = express();
let io = null;

 // Load environment variables
 console.log('🔄 Loading environment variables...');
 dotenv.config({
   path: path.join(__dirname, '.env'),
   override: false
 });
 console.log('✅ Environment variables loaded');

// Sentry Initialization
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  console.log('✅ Sentry initialized');
} else {
  console.log('⚠️ Sentry DSN not found, skipping initialization');
}

console.log('🔄 Loading database pool...');
let pool;
try {
  pool = require('./config/database');
  console.log('✅ Database pool loaded');
} catch (e) {
  console.error('❌ Failed to load database pool:', e.message);
  process.exit(1);
}

console.log('🔄 Loading rate limiters...');
const rateLimiters = require('./middleware/rateLimiters');
const {
  globalLimiter,
  authLimiter,
  supportLimiter,
  sitesLimiter,
  shopierLimiter,
  realShopierLimiter,
  metricsLimiter
} = rateLimiters;

// Import routes with error handling
console.log('🔄 Loading routes...');

let authRoutes, siteRoutes, subscriptionRoutes, shopierRoutes, usersRoutes, realShopierRoutes, metricsRoutes, adminRoutes, supportRoutes, reportsRoutes, editorRoutes, storeAuthRoutes;

let SubscriptionModel;
let SiteModel;
try {
  SubscriptionModel = require('./models/Subscription');
  console.log('✅ Subscription model loaded');
} catch (e) {
  console.error('❌ Subscription model failed:', e.message);
}

try {
  SiteModel = require('./models/Site');
  console.log('✅ Site model loaded');
} catch (e) {
  console.error('❌ Site model failed:', e.message);
}

try {
  authRoutes = require('./routes/auth');
  console.log('✅ authRoutes loaded');
} catch (e) {
  console.error('❌ authRoutes failed:', e.message);
}

try {
  siteRoutes = require('./routes/sites');
  console.log('✅ siteRoutes loaded');
} catch (e) {
  console.error('❌ siteRoutes CRITICAL FAILURE:', e);
  // Fallback to error router instead of empty router
  siteRoutes = express.Router();
  siteRoutes.all('*', (req, res) => {
    res.status(500).json({ 
      error: 'Sites Service Unavailable', 
      message: 'The sites module failed to load. Please check server logs.',
      debug: { error: e.message, stack: e.stack }
    });
  });
}

try {
  subscriptionRoutes = require('./routes/subscriptions');
  console.log('✅ subscriptionRoutes loaded');
} catch (e) {
  console.error('❌ subscriptionRoutes failed:', e.message);
  subscriptionRoutes = express.Router();
}

try {
  shopierRoutes = require('./routes/shopier');
  console.log('✅ shopierRoutes loaded');
} catch (e) {
  console.error('❌ shopierRoutes failed:', e.message);
  shopierRoutes = express.Router();
}

try {
  usersRoutes = require('./routes/users');
  console.log('✅ usersRoutes loaded');
} catch (e) {
  console.error('❌ usersRoutes failed:', e.message);
  usersRoutes = express.Router();
}

try {
  realShopierRoutes = require('./routes/real-shopier');
  console.log('✅ realShopierRoutes loaded');
} catch (e) {
  console.error('❌ realShopierRoutes failed:', e.message);
}

// Theme Manager - REMOVED (No longer needed)

try {
  metricsRoutes = require('./routes/metrics');
  console.log('✅ metricsRoutes loaded');
} catch (e) {
  console.error('❌ metricsRoutes failed:', e.message);
}

try {
  adminRoutes = require('./routes/admin');
  console.log('✅ adminRoutes loaded');
} catch (e) {
  console.error('❌ adminRoutes failed:', e.message);
}

try {
  supportRoutes = require('./routes/support');
  console.log('✅ supportRoutes loaded');
} catch (e) {
  console.error('❌ supportRoutes failed:', e.message);
}

try {
  editorRoutes = require('./routes/editor');
  console.log('✅ editorRoutes loaded');
} catch (e) {
  console.error('❌ editorRoutes failed:', e.message);
}

try {
  storeAuthRoutes = require('./routes/store-auth');
  console.log('✅ storeAuthRoutes loaded');
} catch (e) {
  console.error('❌ storeAuthRoutes failed:', e.message);
}

const paymentRoutes = require('./routes/payments');
const Transaction = require('./models/Transaction');
Transaction.ensureSchema().catch(e => console.error('❌ Transaction schema failed:', e.message));

try {
  reportsRoutes = require('./routes/reports');
  console.log('✅ reportsRoutes loaded');
} catch (e) {
  console.error('❌ reportsRoutes failed:', e.message);
}

console.log('✅ All routes loaded');
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const isProduction = process.env.NODE_ENV === 'production';

try {
  if (SubscriptionModel?.ensureDefaultPlans) {
    SubscriptionModel.ensureDefaultPlans()
      .then(() => {
        console.log('✅ Default subscription plans ensured');
      })
      .catch((e) => {
        console.warn('⚠️ Could not ensure default subscription plans:', e?.message || e);
      });
  }
} catch (e) {
  console.warn('⚠️ Could not ensure default subscription plans:', e?.message || e);
}

const SHOPIER_CATALOG_REFRESH_INTERVAL_MS = (() => {
  const n = Number(process.env.SHOPIER_CATALOG_REFRESH_INTERVAL_MS || (60 * 60 * 1000));
  if (!Number.isFinite(n) || n <= 0) return 60 * 60 * 1000;
  return Math.floor(n);
})();

const SHOPIER_CATALOG_REFRESH_OLDER_THAN_MS = (() => {
  const n = Number(process.env.SHOPIER_CATALOG_REFRESH_OLDER_THAN_MS || SHOPIER_CATALOG_REFRESH_INTERVAL_MS);
  if (!Number.isFinite(n) || n <= 0) return SHOPIER_CATALOG_REFRESH_INTERVAL_MS;
  return Math.floor(n);
})();

const SHOPIER_CATALOG_REFRESH_BATCH_SIZE = (() => {
  const n = Number(process.env.SHOPIER_CATALOG_REFRESH_BATCH_SIZE || 8);
  if (!Number.isFinite(n) || n <= 0) return 8;
  return Math.max(1, Math.min(50, Math.floor(n)));
})();

// OTOMATIK REFRESH TAMAMEN KAPALI!
// Ürünler site oluşturulurken çekildiği için otomatik refresh'e gerek yok
// Bu sayede ürün sayısı sürekli değişmeyecek
let shopierCatalogRefreshInFlight = false;
const startShopierCatalogRefreshTick = () => {
  // DEVRE DIŞI - Otomatik refresh kapatıldı
  return;
};

if (isProduction) {
  setTimeout(() => {
    startShopierCatalogRefreshTick();
  }, 15 * 1000);

  setInterval(() => {
    startShopierCatalogRefreshTick();
  }, SHOPIER_CATALOG_REFRESH_INTERVAL_MS);
}

if (isProduction) {
  app.use((req, res, next) => {
    try {
      const proto = (req.headers['x-forwarded-proto'] || '').toString().toLowerCase();
      const rawHost = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
      const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0];
      
      // 1. Force HTTPS
      const isHttps = proto === 'https' || req.secure;
      // 2. Force WWW for main domain
      const needsWww = host === 'odelink.shop';
      
      if (!isHttps || needsWww) {
        const targetHost = needsWww ? 'www.odelink.shop' : host;
        const target = `https://${targetHost}${req.originalUrl || ''}`;
        return res.redirect(301, target);
      }
    } catch (e) {
      void e;
    }
    next();
  });
}

const resolveExistingDir = (candidates) => {
  for (const c of (candidates || [])) {
    if (!c) continue;
    try {
      if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
    } catch (e) {
      void e;
    }
  }
  return '';
};

const frontendAppPath = resolveExistingDir([
  path.join(__dirname, '..', 'frontend'),
  path.join(__dirname, 'frontend'),
  path.join(process.cwd(), 'frontend')
]);

const frontendBuildPath = fs.existsSync('/app/frontend/build')
  ? '/app/frontend/build'
  : (fs.existsSync(path.join(__dirname, '..', 'frontend', 'build'))
    ? path.join(__dirname, '..', 'frontend', 'build')
    : null);

// DEBUG: Log frontend build path and files
console.log('📁 Frontend build path:', frontendBuildPath);
if (frontendBuildPath) {
  try {
    const files = fs.readdirSync(frontendBuildPath);
    console.log('📂 Files in build directory:', files.slice(0, 10).join(', '));
    const manifestPath = path.join(frontendBuildPath, 'asset-manifest.json');
    const indexPath = path.join(frontendBuildPath, 'index.html');
    console.log('📄 asset-manifest.json exists:', fs.existsSync(manifestPath));
    console.log('📄 index.html exists:', fs.existsSync(indexPath));
  } catch (e) {
    console.error('❌ Error reading build directory:', e.message);
  }
}

// Theme directory check - REMOVED (No longer needed)

const frontendIndexPath = frontendBuildPath ? path.join(frontendBuildPath, 'index.html') : '';

const currentGitCommit = (process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || process.env.COMMIT_SHA || '').toString().trim();
const resolveGitCommitForHealth = () => {
  const envCommit = (process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || process.env.COMMIT_SHA || '').toString().trim();
  if (envCommit) return envCommit;
  try {
    const candidates = [];
    if (frontendBuildPath) candidates.push(path.join(frontendBuildPath, '.build_commit'));
    // Docker/production variants
    candidates.push(path.join(process.cwd(), 'frontend', 'build', '.build_commit'));
    candidates.push(path.join('/app', 'frontend', 'build', '.build_commit'));
    if ((process.env.FRONTEND_BUILD_PATH || '').toString().trim()) {
      candidates.push(path.join(process.env.FRONTEND_BUILD_PATH.toString().trim(), '.build_commit'));
    }

    for (const markerPath of candidates) {
      try {
        if (!markerPath) continue;
        if (!fs.existsSync(markerPath)) continue;
        const v = fs.readFileSync(markerPath, 'utf8').toString().trim();
        if (v) return v;
      } catch (e2) {
        void e2;
      }
    }
    return '';
  } catch (e) {
    void e;
    return '';
  }
};

const statSafe = (p) => {
  try {
    return fs.statSync(p);
  } catch (e) {
    return null;
  }
};

const readJsonSafe = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
};

if (
  isProduction &&
  (process.env.SERVE_FRONTEND || '').toString().toLowerCase() !== 'false' &&
  (process.env.AUTO_BUILD_FRONTEND || '').toString().toLowerCase() === 'true' &&
  fs.existsSync(frontendAppPath)
) {
  try {
    const resolvedBuildPath = frontendBuildPath || path.join(frontendAppPath, 'build');
    const resolvedIndexPath = resolvedBuildPath ? path.join(resolvedBuildPath, 'index.html') : '';
    const markerPath = resolvedBuildPath ? path.join(resolvedBuildPath, '.build_commit') : '';
    const existing = markerPath && fs.existsSync(markerPath) ? fs.readFileSync(markerPath, 'utf8').toString().trim() : '';
    const needsBuild = !resolvedIndexPath || !fs.existsSync(resolvedIndexPath) || !currentGitCommit || existing !== currentGitCommit;
    if (needsBuild) {
      execSync('npm install', { cwd: frontendAppPath, stdio: 'inherit' });
      execSync('npm run build', { cwd: frontendAppPath, stdio: 'inherit' });
      try {
        if (resolvedBuildPath) {
          fs.mkdirSync(resolvedBuildPath, { recursive: true });
        }
        if (markerPath) {
          fs.writeFileSync(markerPath, currentGitCommit || new Date().toISOString());
        }
      } catch (e) {
        void e;
      }
    }
  } catch (e) {
    console.error('❌ Frontend build failed:', e?.message || e);
  }
}

const shouldServeFrontend =
  isProduction &&
  (process.env.SERVE_FRONTEND || '').toString().toLowerCase() !== 'false' &&
  fs.existsSync(frontendIndexPath);

const getFrontendBuildSnapshot = () => {
  if (!shouldServeFrontend) {
    return {
      ok: true,
      skipped: true,
      reason: 'frontend_not_served_by_backend'
    };
  }

  try {
    const manifestPath = path.join(frontendBuildPath, 'asset-manifest.json');
    const indexPath = path.join(frontendBuildPath, 'index.html');
    const manifest = readJsonSafe(manifestPath);
    const indexStat = statSafe(indexPath);
    const manifestStat = statSafe(manifestPath);
    const mainJs = (manifest?.files?.['main.js'] || '').toString().trim();
    const ok = Boolean(indexStat && manifestStat && mainJs);

    return {
      ok,
      skipped: false,
      buildPathExists: Boolean(frontendBuildPath && fs.existsSync(frontendBuildPath)),
      index: indexStat ? { mtime: indexStat.mtime, size: indexStat.size } : null,
      assetManifest: manifestStat ? { mtime: manifestStat.mtime, size: manifestStat.size } : null,
      mainJs,
      files: manifest?.files || null
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error.message
    };
  }
};

const withTimeout = (promise, timeoutMs, label) => {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(label || 'timeout');
      err.code = 'TIMEOUT';
      reject(err);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

const getDatabaseSnapshot = async () => {
  const startedAt = Date.now();
  try {
    await withTimeout(pool.query('SELECT 1 AS ok'), 2000, 'database_timeout');
    return {
      ok: true,
      latencyMs: Date.now() - startedAt
    };
  } catch (e) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: (e?.message || e?.code || 'database_error').toString()
    };
  }
};

const buildReadinessSnapshot = async () => {
  const database = await getDatabaseSnapshot();
  const frontend = getFrontendBuildSnapshot();
  const ok = Boolean(database.ok && frontend.ok);

  return {
    status: ok ? 'ok' : 'degraded',
    ok,
    message: ok
      ? 'Odelink readiness checks passed'
      : 'One or more readiness checks failed',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    gitCommit: resolveGitCommitForHealth(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      database,
      frontend
    }
  };
};

if (isProduction) {
  const jwtSecretRaw = (process.env.JWT_SECRET || '').trim();
  if (!jwtSecretRaw) {
    console.error('❌ CRITICAL: JWT_SECRET is not set in production! Using temporary fallback.');
    console.error('⚠️  Please add JWT_SECRET to your .env file immediately.');
    process.env.JWT_SECRET = 'odelink_fallback_secret_32_chars_long_!!';
  }
}
  const corsOriginsRaw = (process.env.CORS_ORIGINS || '').toString().trim();
  const frontendUrlRaw = (process.env.FRONTEND_URL || '').toString().trim();
  const allowAll = corsOriginsRaw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .includes('*');
  if (!allowAll && !corsOriginsRaw && !frontendUrlRaw) {
    console.warn('⚠️ FRONTEND_URL or CORS_ORIGINS not set. Allowing all origins temporarily.');
    process.env.CORS_ORIGINS = '*';
  }

app.set('trust proxy', 1);

// Middleware
if (isProduction) {
  app.use(compression());
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(hpp());

// CSRF middleware
const { csrfTokenMiddleware } = require('./middleware/csrf');

// ELITE CYBER ARMOR (v2.1) - Nova Intelligence Protocol
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProduction
    ? {
      useDefaults: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'", 
          "'unsafe-inline'", 
          "'unsafe-eval'",
          'https:',
          'http:',
          'data:',
          'blob:'
        ],
        'style-src': [
          "'self'", 
          "'unsafe-inline'",
          'https:',
          'http:'
        ],
        'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:', 'unpkg.com', 'raw.githubusercontent.com'],
        'font-src': ["'self'", 'data:', 'https:', 'http:'],
        'connect-src': [
          "'self'",
          'https:',
          'http:',
          'ws:',
          'wss:'
        ],
        'frame-src': ["'self'", 'https:', 'http:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'", 'https:', 'http:'],
        'frame-ancestors': ["'self'", "https://*.odelink.shop", "https://odelink.shop", "http://localhost:3000"],
        'upgrade-insecure-requests': []
      }
    }
    : false,
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true
}));

// Custom Nova Security Signature
app.use((req, res, next) => {
  res.setHeader('X-Nova-Intelligence', 'Active-Shield-v2.1');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const normalizeOrigin = (o) => (o || '').toString().trim().replace(/\/$/, '');
const corsEnvList = (process.env.CORS_ORIGINS || '')
  .toString()
  .split(',')
  .map((x) => (x || '').toString().trim())
  .filter(Boolean);

const allowAllOrigins = corsEnvList.includes('*');

const allowList = (() => {
  const fromEnv = corsEnvList
    .filter((x) => x !== '*')
    .map((x) => normalizeOrigin(x))
    .filter(Boolean);
  const fe = normalizeOrigin(FRONTEND_URL);

  const base = new Set();
  if (fe) base.add(fe);
  for (const o of fromEnv) base.add(o);

  // Add both www and non-www variants
  base.add('https://www.odelink.shop');
  base.add('https://odelink.shop');
  base.add('http://www.odelink.shop');
  base.add('http://odelink.shop');

  if (!isProduction) {
    base.add('http://localhost:3000');
    base.add('http://localhost:3001');
    base.add('http://127.0.0.1:3000');
    base.add('http://127.0.0.1:3001');
  }

  return Array.from(base);
})();

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (health checks, server-to-server)
      if (!origin) return cb(null, true);
      if (allowAllOrigins) return cb(null, true);
      const o = normalizeOrigin(origin);
      if (allowList.includes(o)) return cb(null, true);
      
      // Allow all subdomains of odelink.shop
      if (o.endsWith('.odelink.shop')) return cb(null, true);
      
      const err = new Error('CORS blocked');
      err.status = 403;
      return cb(err);
    },
    credentials: true
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Nova Theme Proxy - MUST BE BEFORE STATIC SERVING
const NOVA_ENABLED = (process.env.NOVA_ENABLED || '').toString().toLowerCase() === 'true';
const NOVA_URL = process.env.NOVA_URL || 'http://nova:3001';

if (NOVA_ENABLED) {
  console.log('🎨 Setting up Multi-Tenant Nova theme proxy:', NOVA_URL);
  
  app.use((req, res, next) => {
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().toLowerCase().split(':')[0];
    
    // List of domains that should NOT be proxied to Nova
    const systemDomains = ['odelink.shop', 'www.odelink.shop', 'api.odelink.shop', 'admin.odelink.shop', 'tema.odelink.shop'];
    
    // If it's a subdomain and not a system domain, proxy to Nova
    const isSubdomain = host.endsWith('.odelink.shop');
    const isSystem = systemDomains.includes(host);

    // Skip proxying for API and Auth requests
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      return next();
    }

    if (host === 'demo.odelink.shop' || (isSubdomain && !isSystem)) {

      return createProxyMiddleware({
        target: NOVA_URL,
        changeOrigin: true,
        ws: true,
        onProxyReq: (proxyReq, req) => {
          // Pass the original host as a header so Nova knows which store to show
          proxyReq.setHeader('X-Odelink-Host', host);
          console.log(`🔄 Proxying ${host} to Nova`);
          
          // REAL-TIME INTELLIGENCE (v2.1) - Notify Admin Panel
          if (global.io) {
            global.io.emit('new_visit', { 
              host, 
              path: req.path,
              timestamp: new Date().toISOString()
            });
          }
        },
        onError: (err, req, res) => {
          console.error('❌ Nova proxy error:', err.message);
          res.status(503).json({
            error: 'Nova theme temporarily unavailable',
            message: 'Please try again later'
          });
        }
      })(req, res, next);
    }
    
    next();
  });
  
  console.log('✅ Multi-Tenant Nova proxy configured');
}

// Maintenance mode middleware - check before all routes
const { maintenanceMiddleware } = require('./middleware/maintenanceMode');
app.use(maintenanceMiddleware);

app.use(globalLimiter);

// CSRF token middleware - tüm isteklere token ekle
app.use(csrfTokenMiddleware);

// Legacy static serving for the main website (Dashboard/Auth/Builder)
if (frontendBuildPath && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  
  // Masaüstü Uygulaması İndirme Dizini
  app.use('/downloads', express.static(path.join(__dirname, 'public/downloads')));
  app.get('*', (req, res, next) => {
    // Don't intercept /api routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

console.log('✅ Static Frontend configured');

// Static files removed - themes no longer supported

// Cloudflare endpoints (tema kopyalanınca bazı scriptler /cdn-cgi/* ister; Cloudflare yoksa 404 basar)

// ❌ DUPLICATE /s/:subdomain ROUTE KALDIRILDI - Yukarıda tanımlandı (static serving'den önce)

app.get('/cdn-cgi/rum', (req, res) => {
  res.status(204).end();
});
app.get('/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js', (req, res) => {
  res.type('application/javascript').status(200).send('');
});

// Favicon fallback - tema siteleri için 204 döndür (503 yerine)
app.get('/favicon.ico', (req, res) => {
  if (frontendBuildPath) {
    const faviconPath = path.join(frontendBuildPath, 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      return res.sendFile(faviconPath);
    }
  }
  res.status(204).end();
});

// CSRF token endpoint - frontend'den token almak için
app.get('/api/csrf-token', (req, res) => {
  try {
    res.json({ 
      csrfToken: req.csrfToken,
      ok: true
    });
  } catch (e) {
    console.error('❌ CSRF token endpoint error:', e);
    res.status(500).json({ error: 'CSRF token alınamadı' });
  }
});

// WooCommerce Mock API - KALDIRILDI (Artık kullanılmıyor)

// Routes
const maintenanceRoutes = require('./routes/maintenance');
app.use('/api/maintenance', maintenanceRoutes);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/sites', sitesLimiter, siteRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/shopier', shopierLimiter, shopierRoutes);
app.use('/api/real-shopier', realShopierLimiter, realShopierRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/metrics', metricsLimiter, metricsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportLimiter, supportRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payments', paymentRoutes);

// Theme Engine routes - REMOVED

// Payment routes - REMOVED

// Shopier Products API - Tema için ürünleri döndür
const shopierProductsRoutes = require('./routes/shopier-products');
app.use('/api/shopier-products', shopierProductsRoutes);

// Cart API - Ödelink vitrin sepet uyumluluğu
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// Storefront Auth API
app.use('/api/store-auth', storeAuthRoutes);


try {
  if (process.env.NODE_ENV !== 'test') {
    const AutoBuildJobStore = require('./models/AutoBuildJobStore');
    const { startSiteCreationJobWorker } = require('./services/siteCreationJobWorker');
    const { startSyncCron } = require('./services/shopierSyncService');
    const { startBackupCron } = require('./services/databaseBackupService');
    const { checkCloudinaryConfig } = require('./services/imageOptimizationService');
    
    AutoBuildJobStore.markInterruptedJobs().catch(() => void 0);
    startSiteCreationJobWorker({ intervalMs: 1200 });
    
    // Shopier otomatik senkronizasyon başlat
    startSyncCron();
    
    // Database otomatik backup başlat (her gün saat 03:00)
    startBackupCron();
    
    // Cloudinary image optimization kontrolü
    checkCloudinaryConfig();
  }
} catch (e) {
  void e;
}

// Health check routes
const healthRoutes = require('./routes/health');
app.use('/api/health', healthRoutes);

// Backup routes (admin only)
const backupRoutes = require('./routes/backup');
app.use('/api/backup', backupRoutes);

// Webhook routes (deploy)
const webhookRoutes = require('./routes/webhook');
app.use('/api/webhook', webhookRoutes);

// Backward compatibility: /api/ready endpoint (for deploy scripts)
app.get('/api/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      ok: true,
      status: 'ready',
      message: 'Odelink backend is ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          ok: true
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      status: 'not_ready',
      message: 'Backend is not ready',
      error: error.message,
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          ok: false,
          error: error.message
        }
      }
    });
  }
});

app.get('/api/frontend-build', (req, res) => {
  if (!shouldServeFrontend) {
    res.status(404).json({
      error: 'frontend_not_served',
      shouldServeFrontend: false
    });
    return;
  }

  const snapshot = getFrontendBuildSnapshot();

  res.json({
    shouldServeFrontend: true,
    buildPathExists: snapshot.buildPathExists,
    index: snapshot.index,
    assetManifest: snapshot.assetManifest,
    mainJs: snapshot.mainJs,
    files: snapshot.files || null
  });
});

const getCanonicalBaseUrl = (req) => {
  const fromEnv = (process.env.PUBLIC_BASE_URL || process.env.CANONICAL_BASE_URL || process.env.FRONTEND_URL || '').toString().trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const protoRaw = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString();
  const proto = protoRaw.split(',')[0].trim() || 'https';
  const hostRaw = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  const host = hostRaw.split(',')[0].trim();
  if (!host) return '';
  return `${proto}://${host}`;
};

const sitemapCacheByBaseUrl = new Map();
const getSitemapCacheKey = (baseUrl) => (baseUrl || '').toString().trim().replace(/\/$/, '');
const xmlEscape = (value) => (value || '').toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

app.get('/robots.txt', (req, res) => {
  const baseUrl = getCanonicalBaseUrl(req);
  res.type('text/plain');
  res.send(
    `User-agent: *\n` +
    `Disallow: /api/\n` +
    `Disallow: /auth\n` +
    `Disallow: /panel\n` +
    `Disallow: /admin\n` +
    `Disallow: /site-builder\n` +
    `Disallow: /sites/\n` +
    `Disallow: /preview\n` +
    `Allow: /\n` +
    `${baseUrl ? `Sitemap: ${baseUrl}/sitemap.xml\n` : ''}`
  );
});

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = getCanonicalBaseUrl(req);
  const cacheKey = getSitemapCacheKey(baseUrl);
  const cached = sitemapCacheByBaseUrl.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.xml) {
    res.type('application/xml');
    res.send(cached.xml);
    return;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const staticPaths = [
    '/',
    '/plan/basic/month',
    '/plan/basic/year',
    '/plan/ekonomi/month',
    '/plan/ekonomi/year',
    '/plan/standart/month',
    '/plan/standart/year',
    '/plan/pro/month',
    '/plan/pro/year',
    '/terms',
    '/privacy',
    '/kvkk',
    '/cookies',
    '/contact',
    '/support',
    '/vip-support',
    '/links'
  ];

  const b = (baseUrl || '').replace(/\/$/, '');
  const toLoc = (p) => {
    const pathPart = (p || '').startsWith('/') ? p : `/${p || ''}`;
    if (!b) return pathPart;
    return `${b}${pathPart}`;
  };

  const addUrl = (items, loc, lastmod, changefreq, priority) => {
    if (!loc) return;
    const lm = (lastmod || nowIso).toString();
    items.push({ loc, lastmod: lm, changefreq: changefreq || 'weekly', priority: priority || '0.7' });
  };

  const items = [];
  for (const p of staticPaths) {
    addUrl(items, toLoc(p), nowIso, 'weekly', p === '/' ? '1.0' : '0.7');
  }

  try {
    const r = await pool.query(
      "SELECT subdomain, updated_at FROM sites WHERE status = 'active' AND subdomain IS NOT NULL ORDER BY updated_at DESC NULLS LAST"
    );
    for (const row of (r.rows || [])) {
      const sd = (row.subdomain || '').toString().trim();
      if (!sd) continue;
      const pathPart = `/s/${encodeURIComponent(sd)}`;
      const lm = row.updated_at ? new Date(row.updated_at).toISOString() : nowIso;
      addUrl(items, toLoc(pathPart), lm, 'weekly', '0.8');
    }
  } catch (e) {
    void e;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    items.map((u) => {
      const loc = xmlEscape(u.loc);
      const lastmod = xmlEscape(u.lastmod);
      const changefreq = xmlEscape(u.changefreq);
      const priority = xmlEscape(u.priority);
      return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }).join('\n') +
    `\n</urlset>\n`;

  sitemapCacheByBaseUrl.set(cacheKey, {
    xml,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  res.type('application/xml');
  res.send(xml);
});

if (!shouldServeFrontend) {
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: '🌟 TÜRKİYE\'NİN İLK ŞİRKETSİZ E-TİCARET PLATFORMU',
      status: 'active',
      api: '/api',
      version: '1.0.0',
      features: [
        'Shopier entegrasyonu',
        '0 komisyon',
        'Şirketsiz çalışma',
        'Premium tasarımlar',
        'Gerçek zamanlı veri'
      ]
    });
  });
}
if (shouldServeFrontend) {
  // Serve sitemap.xml and robots.txt with correct content-type
  app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(frontendBuildPath, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(sitemapPath);
    } else {
      res.status(404).send('Sitemap not found');
    }
  });

  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(frontendBuildPath, 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(robotsPath);
    } else {
      res.status(404).send('Robots.txt not found');
    }
  });

  // Theme serving removed
  
  app.use(express.static(frontendBuildPath, {
    setHeaders: (res, filePath) => {
      const p = (filePath || '').toString();
      if (p.endsWith(`${path.sep}index.html`) || p.endsWith('/index.html') || p.endsWith('\\index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return;
      }
      if (p.includes(`${path.sep}static${path.sep}`) || p.includes('/static/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Default frontend for non-subdomain requests (www.odelink.shop)
  // CRITICAL: Exclude /s/ paths (theme sites)
  app.get('*', (req, res, next) => {
    // Skip if this is a theme site request
    if (req.path.startsWith('/s/')) {
      return next();
    }
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      res.status(503).json({
        error: 'frontend_build_missing',
        message: 'Frontend build bulunamadı. Lütfen daha sonra tekrar deneyin.'
      });
      return;
    }
    res.sendFile(indexPath, (err) => {
      if (!err) return;
      res.status(503).json({
        error: 'frontend_serve_failed',
        message: 'Frontend servis edilemedi. Lütfen daha sonra tekrar deneyin.'
      });
    });
  });
}

// Sentry Error Handler
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Backend hatası:', err.stack);
  const status = err.status || 500;
  const safeMessage = isProduction ? 'Sunucu hatası' : err.message;
  res.status(status).json({
    error: {
      message: safeMessage,
      status,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  if (req.originalUrl === '/heartbeat') {
    return res.status(204).end();
  }
  res.status(404).json({
    error: {
      message: 'Sayfa bulunamadı',
      status: 404
    }
  });
});

// Start server with error handling
let server = null;
let shuttingDown = false;

const startServer = async () => {
  if (server) return server;

  try {
    // Run database migrations
    try {
      const { runMigrations } = require('./config/runMigrations');
      await runMigrations();
    } catch (e) {
      console.warn('⚠️ Migration warning:', e.message);
    }

    const httpServer = http.createServer(app);
    io = socketIo(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    server = httpServer;

    // REAL-TIME CORE (v2.1) - WebSocket Management
    io.on('connection', (socket) => {
      console.log('📡 Elite Connection Established:', socket.id);

      socket.on('disconnect', () => {
        console.log('📡 Connection Lost:', socket.id);
      });
    });

    // Global Socket Access
    global.io = io;

    // Server Ignition
    server.listen(PORT, () => {
      console.log(`
  🏛️  NOVA CORE SYSTEM ACTIVE
  🚀 Port: ${PORT}
  🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}
  🛡️  Cyber Armor: v2.1
  🛰️  WebSocket: ACTIVE
  `);
      console.log('🔗 API URL:', `http://localhost:${PORT}/api`);
      console.log('📊 Health Check:', `http://localhost:${PORT}/api/health`);
      console.log('📋 Readiness Check:', `http://localhost:${PORT}/api/ready`);
      console.log('⚡ Real Shopier API:', `http://localhost:${PORT}/api/real-shopier`);
    });

    server.headersTimeout = 12 * 1000;
    server.requestTimeout = 30 * 1000;
    server.keepAliveTimeout = 65 * 1000;

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });

    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

const shutdownServer = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`⚠️ ${signal} received, shutting down backend gracefully...`);

  if (!server) {
    process.exit(0);
    return;
  }

  const forceTimer = setTimeout(() => {
    console.error('❌ Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);

  server.close(() => {
    clearTimeout(forceTimer);
    server = null;
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdownServer('SIGTERM'));
process.on('SIGINT', () => shutdownServer('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
module.exports.shutdownServer = shutdownServer;

