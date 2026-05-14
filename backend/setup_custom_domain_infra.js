require('dotenv').config();
const { addDnsRecord } = require('./services/cloudflareService');

async function setupInfrastructure() {
  try {
    console.log('🏗️ Altyapı kurulumu başlatılıyor...');
    
    // custom.odelink.shop kaydını oluştur/güncelle
    const record = await addDnsRecord('custom');
    console.log('✅ Altyapı DNS kaydı aktif: custom.odelink.shop -> 89.144.10.94');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Kurulum hatası:', err.message);
    process.exit(1);
  }
}

setupInfrastructure();
