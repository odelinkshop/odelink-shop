#!/usr/bin/env node
/**
 * Database initialization script
 * Creates all required tables and indexes
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'odelink_production_password_change_me'}@${process.env.DB_HOST || 'postgres'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'odelink_shop'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

async function initDatabase() {
  console.log('🔄 Initializing database schema...');
  
  try {
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subscription_id UUID,
        trial_started_at TIMESTAMP,
        trial_ends_at TIMESTAMP,
        trial_consumed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Users table created');

    // Create email index
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON users (LOWER(email))');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users (trial_ends_at)');
    console.log('✅ Users indexes created');

    // Create subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        features JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Subscriptions table created');

    // Create sites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        shopier_url TEXT,
        subdomain VARCHAR(63) UNIQUE NOT NULL,
        custom_domain VARCHAR(255),
        theme VARCHAR(50),
        settings JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Sites table created');

    // Create sites indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites (user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sites_subdomain ON sites (subdomain)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sites_custom_domain ON sites (LOWER(custom_domain))');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sites_status ON sites (status)');
    console.log('✅ Sites indexes created');

    // Create auth_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions (token)');
    console.log('✅ Auth sessions table created');

    // Create user_subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT NOW(),
        ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ User subscriptions table created');

    // Create shopier_catalog_cache table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopier_catalog_cache (
        shopier_url TEXT PRIMARY KEY,
        catalog JSONB NOT NULL DEFAULT '{}'::jsonb,
        last_fetched_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Shopier catalog cache table created');

    // Create admin tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_guest_access (
        user_id UUID PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Admin tables created');

    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
