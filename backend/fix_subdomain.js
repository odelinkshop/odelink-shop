const pool = require('./config/database');
const dotenv = require('dotenv');
const path = require('path');

process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'odelink_production_password_change_me';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'odelink_shop';

async function fix() {
  try {
    const res = await pool.query(
      "UPDATE sites SET subdomain = 'ozdemirsaat' WHERE subdomain = 'zdemi-r-saat' RETURNING id"
    );
    if (res.rows.length > 0) {
      console.log('✅ Subdomain başarıyla ozdemirsaat olarak güncellendi!');
    } else {
      console.log('❌ Site bulunamadı (zdemi-r-saat). Zaten güncellenmiş olabilir mi?');
    }
  } catch (err) {
    console.error('❌ Hata oluştu:', err.message);
  } finally {
    await pool.end();
  }
}

fix();
