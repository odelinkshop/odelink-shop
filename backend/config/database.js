const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = (process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL || '').toString().trim();
const password = process.env.DB_PASSWORD;

if (!connectionString && !password && isProduction) {
  console.warn('⚠️ DB_PASSWORD or DATABASE_URL not set in production. Using fallback config.');
  // Allow to continue with default local config for debugging
}

// Determine if we should use SSL based on connection string or host
const shouldUseSSL = () => {
  // If using Docker network (postgres hostname), don't use SSL
  const host = process.env.DB_HOST || 'localhost';
  if (host === 'postgres' || host === 'localhost' || host === '127.0.0.1') {
    return false;
  }
  // For external databases in production, use SSL
  return isProduction;
};

const pool = connectionString
  ? new Pool({
    connectionString,
    ssl: shouldUseSSL() ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
  : new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'odelink_shop',
    user: process.env.DB_USER || 'postgres',
    password: password || 'odelink_local_password',
    ssl: shouldUseSSL() ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

// Test database connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL veritabanına bağlandı');
});

pool.on('error', (err) => {
  console.error('❌ Veritabanı bağlantı hatası:', err);
});

module.exports = pool;
