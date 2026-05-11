const pool = require('../config/database');

class Product {
  static async ensureSchema() {
    const query = `
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        images JSONB DEFAULT '[]',
        stock_count INTEGER DEFAULT 100,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    `;
    try {
      await pool.query(query);
    } catch (error) {
      console.error('Error ensuring products schema:', error);
    }
  }

  static async create(productData) {
    const { userId, title, description, price, images, stockCount } = productData;
    await this.ensureSchema();

    const query = `
      INSERT INTO products (user_id, title, description, price, images, stock_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId,
        title,
        description,
        price,
        JSON.stringify(images || []),
        stockCount || 100
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Ürün oluşturulamadı: ' + error.message);
    }
  }

  static async findByUserId(userId) {
    await this.ensureSchema();
    const query = 'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC';
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error('Ürünler getirilemedi: ' + error.message);
    }
  }

  static async update(productId, userId, updateData) {
    const { title, description, price, images, stockCount, isActive } = updateData;
    const query = `
      UPDATE products
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        images = COALESCE($4, images),
        stock_count = COALESCE($5, stock_count),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        title,
        description,
        price,
        images ? JSON.stringify(images) : null,
        stockCount,
        isActive,
        productId,
        userId
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Ürün güncellenemedi: ' + error.message);
    }
  }

  static async delete(productId, userId) {
    const query = 'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *';
    try {
      const result = await pool.query(query, [productId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Ürün silinemedi: ' + error.message);
    }
  }
}

module.exports = Product;
