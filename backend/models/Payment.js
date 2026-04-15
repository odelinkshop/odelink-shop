const pool = require('../config/database');

let ensureSchemaPromise = null;

class Payment {
  /**
   * Ensure payments and advertisement_credits tables exist with proper indexes
   * Uses singleton pattern to prevent multiple concurrent schema operations
   */
  static async ensureSchema() {
    if (ensureSchemaPromise) return ensureSchemaPromise;

    ensureSchemaPromise = (async () => {
      try {
        // Create payments table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            transaction_id VARCHAR(255) UNIQUE NOT NULL,
            dodo_transaction_id VARCHAR(255) UNIQUE,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'TRY',
            product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('subscription', 'ad_package')),
            product_id VARCHAR(100) NOT NULL,
            tier VARCHAR(50),
            billing_cycle VARCHAR(20),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
            payment_method VARCHAR(50),
            payment_date TIMESTAMP,
            failure_reason TEXT,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create indexes for payments table
        await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_dodo_transaction_id ON payments(dodo_transaction_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_product_type ON payments(product_type)');

        // Create advertisement_credits table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS advertisement_credits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            source VARCHAR(50) NOT NULL CHECK (source IN ('purchase', 'refund', 'admin_adjustment')),
            source_transaction_id UUID REFERENCES payments(id),
            balance_after DECIMAL(10,2) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create indexes for advertisement_credits table
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ad_credits_user_id ON advertisement_credits(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ad_credits_created_at ON advertisement_credits(created_at)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ad_credits_source_transaction ON advertisement_credits(source_transaction_id)');

        // Create trigger function for updated_at
        await pool.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $ language 'plpgsql'
        `);

        // Create trigger for payments table
        await pool.query('DROP TRIGGER IF EXISTS update_payments_updated_at ON payments');
        await pool.query(`
          CREATE TRIGGER update_payments_updated_at 
            BEFORE UPDATE ON payments
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column()
        `);

        return { ok: true };
      } catch (error) {
        ensureSchemaPromise = null;
        throw error;
      }
    })();

    return ensureSchemaPromise;
  }

  /**
   * Create a new payment record
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.userId - User ID
   * @param {string} paymentData.transactionId - Unique transaction ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.productType - 'subscription' or 'ad_package'
   * @param {string} paymentData.productId - Product identifier
   * @param {string} [paymentData.tier] - Subscription tier (for subscriptions)
   * @param {string} [paymentData.billingCycle] - Billing cycle (for subscriptions)
   * @param {string} [paymentData.currency='TRY'] - Currency code
   * @param {Object} [paymentData.metadata] - Additional metadata
   * @returns {Promise<Object>} Created payment record
   */
  static async create(paymentData) {
    await this.ensureSchema();

    const {
      userId,
      transactionId,
      amount,
      productType,
      productId,
      tier = null,
      billingCycle = null,
      currency = 'TRY',
      metadata = {}
    } = paymentData;

    const query = `
      INSERT INTO payments (
        user_id, transaction_id, amount, currency, product_type, 
        product_id, tier, billing_cycle, status, metadata, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, NOW(), NOW())
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId,
        transactionId,
        amount,
        currency,
        productType,
        productId,
        tier,
        billingCycle,
        JSON.stringify(metadata)
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Ödeme kaydı oluşturulamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Find payment by transaction ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object|null>} Payment record or null
   */
  static async findByTransactionId(transactionId) {
    await this.ensureSchema();

    const query = 'SELECT * FROM payments WHERE transaction_id = $1';
    
    try {
      const result = await pool.query(query, [transactionId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Ödeme kaydı bulunamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Find payment by Dodo transaction ID
   * @param {string} dodoTransactionId - Dodo Payments transaction ID
   * @returns {Promise<Object|null>} Payment record or null
   */
  static async findByDodoTransactionId(dodoTransactionId) {
    await this.ensureSchema();

    const query = 'SELECT * FROM payments WHERE dodo_transaction_id = $1';
    
    try {
      const result = await pool.query(query, [dodoTransactionId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Ödeme kaydı bulunamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Update payment status and related fields
   * @param {string} transactionId - Transaction ID
   * @param {string} status - New status ('pending', 'completed', 'failed')
   * @param {Object} updateData - Additional fields to update
   * @param {string} [updateData.dodoTransactionId] - Dodo transaction ID
   * @param {string} [updateData.paymentMethod] - Payment method
   * @param {Date} [updateData.paymentDate] - Payment date
   * @param {string} [updateData.failureReason] - Failure reason (for failed payments)
   * @param {Object} [updateData.metadata] - Additional metadata
   * @returns {Promise<Object>} Updated payment record
   */
  static async updateStatus(transactionId, status, updateData = {}) {
    await this.ensureSchema();

    const {
      dodoTransactionId,
      paymentMethod,
      paymentDate,
      failureReason,
      metadata
    } = updateData;

    const query = `
      UPDATE payments
      SET 
        status = $2,
        dodo_transaction_id = COALESCE($3, dodo_transaction_id),
        payment_method = COALESCE($4, payment_method),
        payment_date = COALESCE($5, payment_date),
        failure_reason = COALESCE($6, failure_reason),
        metadata = COALESCE($7, metadata),
        updated_at = NOW()
      WHERE transaction_id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        transactionId,
        status,
        dodoTransactionId || null,
        paymentMethod || null,
        paymentDate || null,
        failureReason || null,
        metadata ? JSON.stringify(metadata) : null
      ]);

      if (!result.rows[0]) {
        throw new Error('Ödeme kaydı bulunamadı');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error('Ödeme durumu güncellenemedi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Get user's payment history with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Records per page
   * @returns {Promise<Object>} Payment history with pagination info
   */
  static async getUserPayments(userId, { page = 1, limit = 20 } = {}) {
    await this.ensureSchema();

    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*)::int as total FROM payments WHERE user_id = $1';
    const dataQuery = `
      SELECT * FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    try {
      const countResult = await pool.query(countQuery, [userId]);
      const dataResult = await pool.query(dataQuery, [userId, limit, offset]);

      const total = countResult.rows[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        payments: dataResult.rows,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new Error('Ödeme geçmişi alınamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Get all payments with filtering (admin function)
   * @param {Object} filters - Filter options
   * @param {string} [filters.userId] - Filter by user ID
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.productType] - Filter by product type
   * @param {Date} [filters.startDate] - Filter by start date
   * @param {Date} [filters.endDate] - Filter by end date
   * @param {number} [filters.page=1] - Page number
   * @param {number} [filters.limit=20] - Records per page
   * @returns {Promise<Object>} Filtered payments with pagination info
   */
  static async getAllPayments(filters = {}) {
    await this.ensureSchema();

    const {
      userId,
      status,
      productType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(userId);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (productType) {
      conditions.push(`product_type = $${paramIndex++}`);
      params.push(productType);
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int as total FROM payments ${whereClause}`;
    const dataQuery = `
      SELECT p.*, u.email, u.name as user_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    try {
      const countResult = await pool.query(countQuery, params);
      const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

      const total = countResult.rows[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        payments: dataResult.rows,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new Error('Ödemeler alınamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }
}

module.exports = Payment;
