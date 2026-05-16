const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım. Tüm sistemi (Puppeteer & OS) hazırlıyorum...');
  
  // Puppeteer için gereken tüm Linux kütüphanelerini kur
  const cmd = `
    apt-get update && 
    apt-get install -y wget gnupg ca-certificates procps libxss1 &&
    apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 &&
    cd ~/odelink-shop/backend && 
    npm install && 
    pm2 restart odelink-backend
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ TÜM SİSTEM HAZIR! VDS sorunu kökten çözüldü.');
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4'
});
