const pool = require('../config/database');

/**
 * AdvertisementCredit Model
 * Manages advertisement credits for users
 */
class AdvertisementCredit {
  /**
   * Add credit to user account
   * @param {string} userId - User ID
   * @param {number} amount - Credit amount
   * @param {string} source - Credit source ('purchase', 'refund', 'admin_adjustment')
   * @param {string} sourceTransactionId - Source transaction ID (payment ID)
   * @param {string} description - Credit description
   * @returns {Promise<Object>} Created credit record
   */
  static async addCredit(userId, amount, source, sourceTransactionId, description = '') {
    try {
      // Get current balance
      const balanceResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_balance 
         FROM advertisement_credits 
         WHERE user_id = $1`,
        [userId]
      );

      const currentBalance = parseFloat(balanceResult.rows[0]?.total_balance || 0);
      const newBalance = currentBalance + parseFloat(amount);

      // Insert credit record
      const query = `
        INSERT INTO advertisement_credits (
          user_id, amount, source, source_transaction_id, balance_after, description, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        amount,
        source,
        sourceTransactionId || null,
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
   * @returns {Promise<number>} Current balance
   */
  static async getUserBalance(userId) {
    try {
      const query = `
        SELECT COALESCE(SUM(amount), 0) as total_balance 
        FROM advertisement_credits 
        WHERE user_id = $1
      `;

      const result = await pool.query(query, [userId]);
      return parseFloat(result.rows[0]?.total_balance || 0);
    } catch (error) {
      throw new Error('Bakiye alınamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Get user's credit history with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Records per page
   * @returns {Promise<Object>} Credit history with pagination info
   */
  static async getUserCreditHistory(userId, { page = 1, limit = 20 } = {}) {
    try {
      const offset = (page - 1) * limit;

      const countQuery = `
        SELECT COUNT(*)::int as total 
        FROM advertisement_credits 
        WHERE user_id = $1
      `;

      const dataQuery = `
        SELECT * 
        FROM advertisement_credits 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;

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

  /**
   * Get credit details by ID
   * @param {string} creditId - Credit ID
   * @returns {Promise<Object|null>} Credit record or null
   */
  static async findById(creditId) {
    try {
      const query = 'SELECT * FROM advertisement_credits WHERE id = $1';
      const result = await pool.query(query, [creditId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Kredi kaydı bulunamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Get all credits for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} All credit records
   */
  static async getAllCredits(userId) {
    try {
      const query = `
        SELECT * 
        FROM advertisement_credits 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error('Krediler alınamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }

  /**
   * Ensure advertisement_credits table exists
   * @returns {Promise<Object>} Schema creation result
   */
  static async ensureSchema() {
    try {
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

      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_ad_credits_user_id ON advertisement_credits(user_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_ad_credits_created_at ON advertisement_credits(created_at)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_ad_credits_source_transaction ON advertisement_credits(source_transaction_id)');

      return { ok: true };
    } catch (error) {
      throw new Error('Schema oluşturulamadı: ' + (error?.message || error?.code || 'Bilinmeyen hata'));
    }
  }
}

module.exports = AdvertisementCredit;
