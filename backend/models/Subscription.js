const pool = require('../config/database');
const { buildCapabilitiesForTier } = require('../config/planCatalog');
const User = require('./User');
const { withTransaction } = require('../utils/transactions');

class Subscription {
  static async ensureSchema() {
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    } catch (e) {
      void e;
    }

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        max_sites INTEGER DEFAULT 1,
        features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id),
        payment_method_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );

    try {
      await pool.query("ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20)");
    } catch (e) {
      void e;
    }
  }

  static async ensureDefaultPlans() {
    await this.ensureSchema();
    const defaults = [
      {
        name: 'Standart',
        description: 'Aylık paket (1 tema)',
        price: 299.0,
        maxSites: 3,
        features: [
          '3 vitrin sitesi',
          '1 tema seçimi (Monthly veya Economy)',
          'Tema/renk özelleştirme',
          'Logo yükleme',
          'Koleksiyonlar',
          'Temel analitik (ziyaret/tıklama)',
          'Öncelikli destek'
        ]
      },
      {
        name: 'Profesyonel',
        description: 'Yıllık paket (3 tema)',
        price: 399.0,
        maxSites: 10,
        features: [
          '10 vitrin sitesi',
          'Tüm renk paleti',
          'Logo yükleme',
          'Özel alan adı',
          'Gelişmiş analitik',
          'VIP destek'
        ]
      }
    ];

    try {
      const existingRes = await pool.query('SELECT name FROM subscriptions');
      const existing = new Set((existingRes.rows || []).map((r) => (r?.name || '').toString().trim().toLowerCase()));

      for (const p of defaults) {
        const key = (p.name || '').toString().trim().toLowerCase();
        if (!key) continue;
        if (existing.has(key)) continue;
        await pool.query(
          'INSERT INTO subscriptions (name, description, price, max_sites, features) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING',
          [p.name, p.description, p.price, p.maxSites, JSON.stringify(p.features || [])]
        );
      }
    } catch (e) {
      throw new Error('Default planlar oluşturulamadı: ' + (e?.message || e));
    }
  }

  static async getAll() {
    const query = 'SELECT * FROM subscriptions ORDER BY price ASC';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error('Abonelikler alınamadı: ' + error.message);
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM subscriptions WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Abonelik bulunamadı: ' + error.message);
    }
  }

  static async findByName(name) {
    const query = 'SELECT * FROM subscriptions WHERE LOWER(name) = LOWER($1) LIMIT 1';
    try {
      const result = await pool.query(query, [name]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Abonelik bulunamadı: ' + error.message);
    }
  }

  static async createSubscription(userId, subscriptionId, paymentMethodId, billingCycle = 'monthly') {
    let subscription;
    
    if (subscriptionId && subscriptionId.length > 20) {
      subscription = await this.findById(subscriptionId);
    } else {
      // If subscriptionId is missing or looks like a name (e.g. from shopier callback)
      // We try to find it by name if we have a default or we can pass the tier directly.
      // For now, let's assume if it's not a UUID, we check names.
      const name = subscriptionId || 'Standart';
      subscription = await this.findByName(name);
    }

    if (!subscription) {
      throw new Error('Abonelik paketi bulunamadı');
    }

    try {
      const cycle = (billingCycle || 'monthly').toString().toLowerCase();

      return await withTransaction(pool, async (client) => {
        await client.query(
          `UPDATE user_subscriptions
           SET status = 'cancelled', end_date = NOW(), updated_at = NOW()
           WHERE user_id = $1 AND status = 'active'`,
          [userId]
        );

        const insertRes = await client.query(
          `INSERT INTO user_subscriptions (user_id, subscription_id, payment_method_id, status, start_date, end_date, created_at)
           VALUES ($1, $2, $3, 'active', NOW(), NOW() + (CASE WHEN $4 = 'yearly' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END), NOW())
           RETURNING *`,
          [userId, subscriptionId, paymentMethodId, cycle]
        );

        await client.query(
          'UPDATE users SET subscription_id = $1, updated_at = NOW() WHERE id = $2',
          [subscriptionId, userId]
        );

        return insertRes.rows[0];
      });
    } catch (error) {
      throw new Error('Abonelik olusturulamadi: ' + error.message);
    }
  }

  static async getUserSubscription(userId) {
    await this.ensureSchema();
    const query = `
      SELECT us.*, s.name, s.price, s.features, s.max_sites
      FROM user_subscriptions us
      JOIN subscriptions s ON us.subscription_id = s.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Kullanıcı aboneliği bulunamadı: ' + error.message);
    }
  }

  static async cancelSubscription(userId) {
    const query = `
      UPDATE user_subscriptions
      SET status = 'cancelled', end_date = NOW(), updated_at = NOW()
      WHERE user_id = $1 AND status = 'active'
      RETURNING *
    `;

    try {
      return await withTransaction(pool, async (client) => {
        const result = await client.query(query, [userId]);

        await client.query(
          'UPDATE users SET subscription_id = NULL, updated_at = NOW() WHERE id = $1',
          [userId]
        );

        return result.rows[0];
      });
    } catch (error) {
      throw new Error('Abonelik iptal edilemedi: ' + error.message);
    }
  }

  static async renewSubscription(userId) {
    const query = `
      UPDATE user_subscriptions
      SET
        status = 'active',
        end_date = NOW() + (
          CASE
            WHEN (end_date - start_date) >= INTERVAL '300 days' THEN INTERVAL '1 year'
            ELSE INTERVAL '1 month'
          END
        ),
        updated_at = NOW()
      WHERE id = (
        SELECT id
        FROM user_subscriptions
        WHERE user_id = $1 AND status = 'cancelled'
        ORDER BY updated_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      )
      RETURNING *
    `;

    try {
      return await withTransaction(pool, async (client) => {
        const result = await client.query(query, [userId]);
        const renewed = result.rows[0];

        if (renewed?.subscription_id) {
          await client.query(
            'UPDATE users SET subscription_id = $1, updated_at = NOW() WHERE id = $2',
            [renewed.subscription_id, userId]
          );
        }

        return renewed;
      });
    } catch (error) {
      throw new Error('Abonelik yenilenemedi: ' + error.message);
    }
  }

  static async checkSiteLimit(userId) {
    try {
      const caps = await this.getUserCapabilities(userId);
      const maxSites = 999999;
      if (!maxSites) {
        return { maxSites: 0, currentSites: 0, hasActiveSubscription: false };
      }

      const countRes = await pool.query(
        "SELECT COUNT(id) as current_sites FROM sites WHERE user_id = $1 AND status = 'active'",
        [userId]
      );
      const currentSites = parseInt(countRes?.rows?.[0]?.current_sites || 0);

      return {
        maxSites,
        currentSites,
        hasActiveSubscription: true
      };
    } catch (error) {
      throw new Error('Site limiti kontrol edilemedi: ' + error.message);
    }
  }

  static async getUserCapabilities(userId) {
    // CEO hesabı kontrolü - SINIRSIZ yetki
    const CEO_EMAIL = 'muratbyrm3752@gmail.com';
    try {
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      const userEmail = (userResult.rows?.[0]?.email || '').toString().trim().toLowerCase();
      
      if (userEmail === CEO_EMAIL.toLowerCase()) {
        // CEO için SINIRSIZ yetkiler
        return {
          tier: 'profesyonel',
          planCode: 'ceo-unlimited',
          planLabel: 'CEO - Sınırsız',
          planName: 'CEO Hesabı',
          maxSites: 999999,
          allowCustomDomain: true,
          allowedColors: ['blue', 'purple', 'green', 'red', 'orange', 'pink', 'yellow', 'teal', 'indigo'],
          allowLogoUpload: true,
          allowHideBranding: true,
          allowedBlocks: ['hero', 'features', 'pricing', 'testimonials', 'cta', 'faq', 'contact', 'gallery', 'team', 'stats'],
          allowedDesignControls: ['colors', 'fonts', 'spacing', 'layout', 'animations'],
          billingCycle: 'lifetime',
          planFeatures: ['Sınırsız site', 'Tüm özellikler', 'VIP destek', 'Özel domain', 'Tüm temalar'],
          vipSupport: true,
          supportLevel: 'vip',
          monthlyReportDownload: true,
          isCEO: true
        };
      }
    } catch (e) {
      console.error('CEO check error:', e);
    }

    const subscription = await this.getUserSubscription(userId);

    // Plan yoksa erişim yok
    if (!subscription) {
      return {
        tier: null,
        planCode: null,
        planLabel: null,
        planName: null,
        maxSites: 0,
        allowCustomDomain: false,
        allowedColors: [],
        allowLogoUpload: false,
        allowHideBranding: false,
        allowedBlocks: [],
        allowedDesignControls: [],
        billingCycle: null,
        planFeatures: []
      };
    }

    const subscriptionName = (subscription?.name || '').toString().trim().toLowerCase();
    let billingCycle = subscription?.billing_cycle || 'monthly';
    
    // Attempt to determine billing cycle from start/end dates if not explicitly set
    try {
      const start = subscription?.start_date ? new Date(subscription.start_date) : null;
      const end = subscription?.end_date ? new Date(subscription.end_date) : null;
      if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays >= 300) billingCycle = 'yearly';
      }
    } catch (e) {
      void e;
    }
    
    // Determine tier based on cycle and name
    const tier = (subscriptionName === 'profesyonel' || subscriptionName === 'professional' || subscriptionName === 'pro' || subscriptionName === 'premium')
      ? 'profesyonel'
      : 'standart';

    const caps = buildCapabilitiesForTier({ tier, billingCycle });
    if (!caps) {
      return {
        tier: null,
        planCode: null,
        planLabel: null,
        planName: null,
        maxSites: 0,
        allowCustomDomain: false,
        allowedColors: ['blue', 'purple'],
        allowLogoUpload: false,
        allowHideBranding: false,
        allowedBlocks: [],
        allowedDesignControls: [],
        billingCycle: null,
        planFeatures: []
      };
    }

    return {
      ...caps,
      billingCycle
    };
  }
}

module.exports = Subscription;


