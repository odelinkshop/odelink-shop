
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./config/database');

async function getAdmin() {
  try {
    const result = await pool.query('SELECT email, password, role FROM users WHERE role = $1 OR email LIKE $2', ['admin', '%admin%']);
    console.log('\n--- CEO KARARGAHI GİRİŞ BİLGİLERİ ---');
    if (result.rows.length === 0) {
      console.log('❌ Hiç admin kullanıcısı bulunamadı!');
    } else {
      result.rows.forEach(user => {
        console.log(`📧 Gmail: ${user.email}`);
        console.log(`🔑 Şifre: ${user.password}`);
        console.log(`🛡️ Rol: ${user.role}`);
        console.log('-----------------------------------');
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Hata:', err.message);
    process.exit(1);
  }
}

getAdmin();
