require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const pool = require('./backend/config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, title, price, slug, "shopierUrl"
      FROM products
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('--- Last 10 Products in Database ---');
    res.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: "${row.title}"`);
      console.log(`Price: ${row.price}`);
      console.log(`Slug: "${row.slug}"`);
      console.log(`Shopier URL: "${row.shopierUrl}"`);
      console.log('------------------------------------');
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
