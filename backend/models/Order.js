const pool = require('../config/database');

class Order {
  static async ensureSchema() {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        buyer_email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    `;
    try {
      await pool.query(query);
    } catch (error) {
      console.error('Error ensuring orders schema:', error);
    }
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error('Siparişler getirilemedi: ' + error.message);
    }
  }
}

module.exports = Order;
