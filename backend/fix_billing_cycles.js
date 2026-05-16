const path = require('path');
require('dotenv').config();
const pool = require('./config/database');

async function fix() {
  try {
    console.log('🚀 Veritabanı abonelik periyotları mühürleniyor...');
    
    const query = `
      UPDATE user_subscriptions 
      SET billing_cycle = (
        CASE 
          WHEN (end_date - start_date) >= INTERVAL '300 days' THEN 'yearly' 
          ELSE 'monthly' 
        END
      ) 
      WHERE (billing_cycle IS NULL OR billing_cycle = '' OR billing_cycle = 'monthly')
    `;
    
    const res = await pool.query(query);
    console.log(`✅ İşlem tamamlandı! ${res.rowCount} adet abonelik başarıyla güncellendi.`);
    process.exit(0);
  } catch (e) {
    console.error('❌ HATA:', e);
    process.exit(1);
  }
}

fix();
