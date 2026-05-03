const pool = require('../config/database');

class Transaction {
  static async ensureSchema() {
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS payment_transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          order_id VARCHAR(100) UNIQUE NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          tier VARCHAR(50) NOT NULL,
          billing_cycle VARCHAR(20) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          provider VARCHAR(50) DEFAULT 'shopier',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('❌ Transaction schema error:', error.message);
    }
  }

  static async create({ userId, orderId, amount, tier, billingCycle }) {
    await this.ensureSchema();
    const query = `
      INSERT INTO payment_transactions (user_id, order_id, amount, tier, billing_cycle, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `;
    const result = await pool.query(query, [userId, orderId, amount, tier, billingCycle]);
    return result.rows[0];
  }

  static async findByOrderId(orderId) {
    const query = 'SELECT * FROM payment_transactions WHERE order_id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM payment_transactions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(orderId, status) {
    const query = `
      UPDATE payment_transactions
      SET status = $1, updated_at = NOW()
      WHERE order_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0];
  }
}

module.exports = Transaction;
