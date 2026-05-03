const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const StoreCustomer = {
  async ensureSchema() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS storefront_customers (
        id UUID PRIMARY KEY,
        site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(site_id, email)
      )
    `);
    
    // Index for fast lookups
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sf_customers_email ON storefront_customers (site_id, email)');
  },

  async create({ siteId, name, email, password, phone }) {
    await this.ensureSchema();
    const id = require('crypto').randomUUID();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      'INSERT INTO storefront_customers (id, site_id, name, email, password, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, created_at',
      [id, siteId, name, email.toLowerCase().trim(), hashedPassword, phone]
    );
    
    return result.rows[0];
  },

  async findByEmail(siteId, email) {
    await this.ensureSchema();
    const result = await pool.query(
      'SELECT * FROM storefront_customers WHERE site_id = $1 AND email = $2',
      [siteId, email.toLowerCase().trim()]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT id, site_id, name, email, phone, created_at FROM storefront_customers WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE storefront_customers SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, id]);
  },

  generateToken(customerId, siteId) {
    return jwt.sign(
      { customerId, siteId, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
  }
};

module.exports = StoreCustomer;
