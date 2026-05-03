const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();

const localPath = path.join(__dirname, '..', 'backend', 'services', 'shopierCatalogService.js');
const remotePath = '/root/odelink-shop/backend/services/shopierCatalogService.js';

console.log('🚀 Quick Deploy başlatılıyor...');

conn.on('ready', () => {
  console.log('✅ VDS Bağlantısı kuruldu.');
  
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('❌ SFTP Hatası:', err);
      conn.end();
      return;
    }
    
    console.log(`📦 Dosya yükleniyor: ${localPath} -> ${remotePath}`);
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) {
        console.error('❌ Yükleme Hatası:', err);
        conn.end();
        return;
      }
      
      console.log('✅ Dosya başarıyla yüklendi.');
      
      console.log('🔄 PM2 Restart yapılıyor...');
      conn.exec('pm2 restart all', (err, stream) => {
        if (err) {
          console.error('❌ Restart Hatası:', err);
          conn.end();
          return;
        }
        
        stream.on('close', (code) => {
          console.log(`🎉 Deployment tamamlandı! (Exit code: ${code})`);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        });
      });
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4'
});

conn.on('error', (err) => {
  console.error('❌ Bağlantı Hatası:', err);
});
