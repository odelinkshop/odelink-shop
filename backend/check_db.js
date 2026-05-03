
require('dotenv').config();
const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, name, subdomain, 
             (settings->>'catalog_total_products') as total, 
             (settings->'products_data'->0) as first_product
      FROM sites 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('--- Last 3 Sites ---');
    res.rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.name}, Subdomain: ${row.subdomain}, Total: ${row.total}`);
      if (row.first_product) {
        console.log('First Product:', JSON.stringify(row.first_product, null, 2));
      }
      console.log('--------------------');
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
