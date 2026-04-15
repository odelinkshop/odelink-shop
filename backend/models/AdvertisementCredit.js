const pool = require('../config/database');

let ensureSchemaPromise = null;

class AdvertisementCredit {
  /**
   * Ensure advertisement_credits table exists with proper indexes
   * Uses singleton pattern to prevent multiple concurrent schema operations
   */
  static async ensureSchema() {
    if (ensureSchemaPromise) return ensureSchemaPromise;

    ensureSchemaPromise = (async () => {
      try {
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

        return { ok: true };
      } catch (error) {
        ensureSchemaPromise = null;
        throw error;
      }
    })();

    return ensureSchemaPromise;
  }

  /**
   * Add credit to user account
   * @param {string} userId - User ID
   * @param {number} amount - Credit amount to add (positive for credit, negative for debit)
   * @param {string} source - Credit source ('purchase', 'refund', 'admin_adjustment')
   * @param {string} [sourceTransactionId] - Related payment transaction ID
   * @param {string} [description] - Optional description
   * @returns {Promise<Object>} Created credit record with balance_after
   */
  static async addCredit(userId, amount, source, sourceTransactionId = null, description = null) {
    await this.ensureSchema();

    // Get current balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = parseFloat(currentBalance) + parseFloat(amount);

    // Validate that balance doesn't go negative
    if (newBalance < 0) {
      throw new Error('Yetersiz kredi bakiyesi');
    }

    const query = `
      INSERT INTO advertisement_credits (
        user_id, amount, source, source_transaction_id, balance_after, description, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId,
        amount,
        source,
        sourceTransactionId,
        newBalance,
        description
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Kredi eklenemedi: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Get user's current credit balance
   * @param {string} userId - User ID
   * @returns {Promise<number>} Current balance (0 if no transactions)
   */
  static async getUserBalance(userId) {
    await this.ensureSchema();

    const query = `
      SELECT balance_after 
      FROM advertisement_credits 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return 0;
      }

      return parseFloat(result.rows[0].balance_after);
    } catch (error) {
      throw new Error('Kredi bakiyesi alınamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Get user's credit transaction history with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Records per page
   * @returns {Promise<Object>} Credit history with pagination info
   */
  static async getUserCreditHistory(userId, { page = 1, limit = 20 } = {}) {
    await this.ensureSchema();

    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*)::int as total FROM advertisement_credits WHERE user_id = $1';
    const dataQuery = `
      SELECT * FROM advertisement_credits 
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
        credits: dataResult.rows,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new Error('Kredi geçmişi alınamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }
}

module.exports = AdvertisementCredit;
