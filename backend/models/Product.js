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
        discount_price DECIMAL(10,2),
        images JSONB DEFAULT '[]',
        stock_count INTEGER DEFAULT 100,
        sku VARCHAR(100),
        category VARCHAR(255),
        shopier_url TEXT,
        tags JSONB DEFAULT '[]',
        personalization_settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
      
      -- Add columns if they don't exist (Self-repair schema)
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='discount_price') THEN
          ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sku') THEN
          ALTER TABLE products ADD COLUMN sku VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
          ALTER TABLE products ADD COLUMN category VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='shopier_url') THEN
          ALTER TABLE products ADD COLUMN shopier_url TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
          ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='personalization_settings') THEN
          ALTER TABLE products ADD COLUMN personalization_settings JSONB DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sizes') THEN
          ALTER TABLE products ADD COLUMN sizes JSONB DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='variations') THEN
          ALTER TABLE products ADD COLUMN variations JSONB DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='delivery_info') THEN
          ALTER TABLE products ADD COLUMN delivery_info TEXT;
        END IF;
      END $$;
    `;
    try {
      await pool.query(query);
    } catch (error) {
      console.error('Error ensuring products schema:', error);
    }
  }

  static async create(productData) {
    const { userId, title, description, price, discountPrice, images, stockCount, sku, category, shopierUrl, tags, personalizationSettings, sizes, variations, deliveryInfo, delivery_info } = productData;
    await this.ensureSchema();

    const query = `
      INSERT INTO products (user_id, title, description, price, discount_price, images, stock_count, sku, category, shopier_url, tags, personalization_settings, sizes, variations, delivery_info)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId,
        title,
        description,
        price,
        discountPrice,
        JSON.stringify(images || []),
        stockCount || 100,
        sku,
        category,
        shopierUrl,
        JSON.stringify(tags || []),
        JSON.stringify(personalizationSettings || {}),
        JSON.stringify(sizes || []),
        JSON.stringify(variations || []),
        delivery_info || deliveryInfo || ''
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
    const { title, description, price, discountPrice, images, stockCount, sku, category, shopierUrl, tags, personalizationSettings, isActive, sizes, variations, deliveryInfo, delivery_info } = updateData;
    const query = `
      UPDATE products
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        discount_price = $4,
        images = COALESCE($5, images),
        stock_count = COALESCE($6, stock_count),
        sku = COALESCE($7, sku),
        category = COALESCE($8, category),
        shopier_url = COALESCE($9, shopier_url),
        tags = COALESCE($10, tags),
        personalization_settings = COALESCE($11, personalization_settings),
        is_active = COALESCE($12, is_active),
        sizes = COALESCE($13, sizes),
        variations = COALESCE($14, variations),
        delivery_info = COALESCE($15, delivery_info),
        updated_at = NOW()
      WHERE id = $16 AND user_id = $17
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        title,
        description,
        price,
        discountPrice,
        images ? JSON.stringify(images) : null,
        stockCount,
        sku,
        category,
        shopierUrl,
        tags ? JSON.stringify(tags) : null,
        personalizationSettings ? JSON.stringify(personalizationSettings) : null,
        isActive,
        sizes ? JSON.stringify(sizes) : null,
        variations ? JSON.stringify(variations) : null,
        delivery_info || deliveryInfo || null,
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
