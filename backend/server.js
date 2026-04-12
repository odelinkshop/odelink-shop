const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();

 // Load environment variables
 console.log('🔄 Loading environment variables...');
 dotenv.config({
   path: path.join(__dirname, '.env'),
   override: false
 });
 console.log('✅ Environment variables loaded');

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

let authRoutes, siteRoutes, subscriptionRoutes, shopierRoutes, usersRoutes, realShopierRoutes, metricsRoutes, adminRoutes, supportRoutes, reportsRoutes;

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
  console.error('❌ siteRoutes failed:', e.message);
}

try {
  subscriptionRoutes = require('./routes/subscriptions');
  console.log('✅ subscriptionRoutes loaded');
} catch (e) {
  console.error('❌ subscriptionRoutes failed:', e.message);
}

try {
  shopierRoutes = require('./routes/shopier');
  console.log('✅ shopierRoutes loaded');
} catch (e) {
  console.error('❌ shopierRoutes failed:', e.message);
}

try {
  usersRoutes = require('./routes/users');
  console.log('✅ usersRoutes loaded');
} catch (e) {
  console.error('❌ usersRoutes failed:', e.message);
}

try {
  realShopierRoutes = require('./routes/real-shopier');
  console.log('✅ realShopierRoutes loaded');
} catch (e) {
  console.error('❌ realShopierRoutes failed:', e.message);
}

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
      const rawHost = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
      const host = rawHost.split(',')[0].trim().toLowerCase().split(':')[0];
      if (host === 'odelink.shop' && (req.method === 'GET' || req.method === 'HEAD')) {
        const target = `https://www.odelink.shop${req.originalUrl || ''}`;
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

// DEBUG: Log theme files in container
console.log('🎨 Checking theme files in container...');
const themeBasePath = path.join(__dirname, 'themes');
console.log('📁 Theme base path:', themeBasePath);
console.log('📁 Theme base exists:', fs.existsSync(themeBasePath));
if (fs.existsSync(themeBasePath)) {
  try {
    const themeFiles = fs.readdirSync(themeBasePath);
    console.log('📂 Themes available:', themeFiles.join(', '));
    const wearixIndexPath = path.join(themeBasePath, 'wearix/index.html');
    console.log('📄 WEARIX index.html exists:', fs.existsSync(wearixIndexPath));
    if (fs.existsSync(wearixIndexPath)) {
      const stats = fs.statSync(wearixIndexPath);
      console.log('📄 WEARIX index.html size:', stats.size, 'bytes');
    }
  } catch (e) {
    console.error('❌ Error reading theme directory:', e.message);
  }
} else {
  console.error('❌ Theme directory not found! Themes were not copied to container.');
}

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
  const jwtSecretRaw = (process.env.JWT_SECRET || '').toString().trim();
  if (!jwtSecretRaw) {
    console.error('❌ JWT_SECRET is not set in production. Server cannot start securely.');
    process.exit(1);
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
}

app.set('trust proxy', 1);

// Middleware
if (isProduction) {
  app.use(compression());
}
// CSRF middleware
const { csrfTokenMiddleware } = require('./middleware/csrf');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProduction
    ? {
      useDefaults: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'default-src': ["'self'"],
        'script-src': [
          "'self'", 
          "'unsafe-inline'", 
          "'unsafe-eval'", 
          'https://cdn.shopier.com', 
          'https://www.googletagmanager.com', 
          'https://ajax.googleapis.com',
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://gsi.googleapis.com',
          'https://content.googleapis.com',
          'https://*.googleusercontent.com',
          'https://*.googleapis.com',
          'https://static.zdassets.com',
          'https://ekr.zdassets.com',
          'https://*.zdassets.com'
        ],
        'style-src': [
          "'self'", 
          "'unsafe-inline'", 
          'https://fonts.googleapis.com',
          'https://accounts.google.com',
          'https://gsi.googleapis.com',
          'https://*.googleapis.com'
        ],
        'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        'connect-src': [
          "'self'",
          'https://www.odelink.shop',
          'https://odelink.shop',
          'https://cdn.shopier.com',
          'https://accounts.google.com',
          'https://gsi.googleapis.com',
          'https://apis.google.com',
          'https://content.googleapis.com',
          'https://*.googleusercontent.com',
          'https://*.googleapis.com',
          'https://ekr.zdassets.com',
          'https://*.zdassets.com'
        ],
        'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com', 'https://accounts.google.com', 'https://gsi.googleapis.com', 'https://*.google.com'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'", 'https://www.shopier.com', 'https://shopier.com'],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': []
      }
    }
    : false,
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

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
      const err = new Error('CORS blocked');
      err.status = 403;
      return cb(err);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Maintenance mode middleware - check before all routes
const MAINTENANCE_FLAG = path.join(__dirname, '.maintenance');
app.use((req, res, next) => {
  // Skip maintenance check for API endpoints
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Check if maintenance mode is active
  if (fs.existsSync(MAINTENANCE_FLAG)) {
    // Serve maintenance page
    const maintenancePath = path.join(__dirname, '..', 'frontend', 'build', 'maintenance.html');
    if (fs.existsSync(maintenancePath)) {
      return res.status(503).sendFile(maintenancePath);
    }
  }
  
  next();
});

app.use(globalLimiter);

// CSRF token middleware - tüm isteklere token ekle
app.use(csrfTokenMiddleware);

// Static files removed - themes no longer supported

// Cloudflare endpoints (tema kopyalanınca bazı scriptler /cdn-cgi/* ister; Cloudflare yoksa 404 basar)

// WEARIX Theme Handler
const productInjectorService = require('./services/productInjectorService');

// In-memory HTML cache
const htmlCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

function getCachedHtml(key) {
  const cached = htmlCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    htmlCache.delete(key);
    return null;
  }
  
  return cached.html;
}

function setCachedHtml(key, html) {
  htmlCache.set(key, {
    html,
    timestamp: Date.now()
  });
  
  // Cache temizleme (maksimum 100 entry)
  if (htmlCache.size > 100) {
    const firstKey = htmlCache.keys().next().value;
    htmlCache.delete(firstKey);
  }
}

/**
 * WEARIX temasını serve et
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Object} site - Site verisi
 * @param {string} requestedPath - İstenen dosya yolu
 */
async function handleWearixTheme(req, res, site, requestedPath) {
  const themeDir = path.join(__dirname, 'themes', 'wearix');
  
  try {
    // Static file request (CSS, JS, images, fonts)
    if (requestedPath && requestedPath !== '/') {
      const filePath = path.join(themeDir, requestedPath);
      
      // Path traversal koruması
      if (!filePath.startsWith(themeDir)) {
        console.error('⚠️ Path traversal attempt:', requestedPath);
        return res.status(403).send('Forbidden');
      }
      
      // Dosya var mı kontrol et
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        // Cache header'ları ayarla
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 gün
        res.setHeader('ETag', `"${fs.statSync(filePath).mtime.getTime()}"`);
        return res.sendFile(filePath);
      }
      
      return res.status(404).send('File not found');
    }
    
    // HTML request - check cache first
    const cacheKey = `wearix:${site.subdomain}`;
    const cachedHtml = getCachedHtml(cacheKey);
    
    if (cachedHtml) {
      console.log('✅ Cache hit:', cacheKey);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Content-Security-Policy', 
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data: https:; " +
        "connect-src 'self' https:; " +
        "frame-src 'self' https:;"
      );
      return res.send(cachedHtml);
    }
    
    // HTML request - inject products
    const htmlPath = path.join(themeDir, 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ Theme HTML not found:', htmlPath);
      throw new Error('Theme HTML not found');
    }
    
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Shopier ürünlerini çek
    let products = [];
    try {
      // Mevcut Shopier API'sini kullan
      const shopierCatalogService = require('./services/shopierCatalogService');
      const catalogData = await shopierCatalogService.getCatalogByShopierUrl(site.shopier_url);
      products = catalogData?.products || [];
    } catch (productError) {
      console.error('⚠️ Product fetch error:', productError.message);
      // Boş array ile devam et
    }
    
    // Site ayarlarını hazırla
    const siteSettings = {
      name: site.name,
      subdomain: site.subdomain,
      logoUrl: site.settings?.logoUrl || '',
      description: site.settings?.description || '',
      contact: site.settings?.contact || {},
      social: site.settings?.social || {}
    };
    
    // Ürünleri HTML'e enjekte et
    html = productInjectorService.injectProducts(html, products, siteSettings);
    
    // Cache'e kaydet
    setCachedHtml(cacheKey, html);
    console.log('✅ Cache set:', cacheKey);
    
    // Cache ve güvenlik header'ları
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 dakika
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy (Framer için gevşek)
    res.setHeader('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: https:; " +
      "connect-src 'self' https:; " +
      "frame-src 'self' https:;"
    );
    
    return res.send(html);
    
  } catch (error) {
    console.error('❌ WEARIX theme rendering error:', error);
    
    // Fallback: basit HTML
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${site.name}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>${site.name}</h1>
          <p>Tema yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        </body>
      </html>
    `);
  }
}

// Path-based site route - serve Ödelink theme for /s/:subdomain
// CRITICAL: This MUST come BEFORE express.static() and OUTSIDE shouldServeFrontend check
app.get('/s/:subdomain*', async (req, res, next) => {
  const subdomain = req.params.subdomain;
  const requestedPath = req.params[0] || '';
  
  // SQL Injection koruması: subdomain validation
  if (!subdomain || typeof subdomain !== 'string') {
    return res.status(400).send('Invalid subdomain');
  }
  
  // Sadece alphanumeric ve hyphen karakterlerine izin ver
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(subdomain)) {
    console.log('⚠️ Invalid subdomain format:', subdomain);
    return res.status(400).send('Invalid subdomain format');
  }
  
  // Maksimum uzunluk kontrolü
  if (subdomain.length > 63) {
    return res.status(400).send('Subdomain too long');
  }
  
  try {
    const Site = require('./models/Site');
    const site = await Site.findBySubdomain(subdomain);
    
    if (!site || site.status !== 'active') {
      console.log('⚠️ Site not found or inactive:', subdomain);
      return res.status(404).send('Site not found');
    }
    
    console.log('🎨 Serving site:', subdomain, 'theme:', site.theme);
    
    // WEARIX tema desteği
    if (site.theme === 'wearix') {
      return await handleWearixTheme(req, res, site, requestedPath);
    }
    
    // Fallback: basit HTML (tema yok)
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${site.name}</title>
        </head>
        <body>
          <h1>${site.name}</h1>
          <p>Site is active.</p>
        </body>
      </html>
    `);
    
  } catch (err) {
    console.error('❌ Error serving site:', err);
    return res.status(500).send('Server error');
  }
});

app.get('/cdn-cgi/rum', (req, res) => {
  res.status(204).end();
});
app.get('/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js', (req, res) => {
  res.type('application/javascript').status(200).send('');
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

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/sites', sitesLimiter, siteRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/shopier', shopierLimiter, shopierRoutes);
app.use('/api/real-shopier', realShopierLimiter, realShopierRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/metrics', metricsLimiter, metricsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportLimiter, supportRoutes);
app.use('/api/reports', reportsRoutes);

// Shopier Products API - Tema için ürünleri döndür
const shopierProductsRoutes = require('./routes/shopier-products');
app.use('/api/shopier-products', shopierProductsRoutes);

// Cart API - Ödelink vitrin sepet uyumluluğu
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

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

// Maintenance mode routes
const maintenanceRoutes = require('./routes/maintenance');
app.use('/api/maintenance', maintenanceRoutes);

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

const startServer = () => {
  if (server) return server;

  try {
    server = app.listen(PORT, () => {
      console.log('🚀 Odelink.shop Backend', PORT, 'portunda çalışıyor');
      console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
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

