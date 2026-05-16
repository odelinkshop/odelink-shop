const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım. TEMİZLİK BAŞLIYOR...');
  
  // 1. Tüm node süreçlerini öldür
  // 2. .env dosyasını KESİN olarak localhost'a sabitle
  // 3. PM2'yi ve backend'i sıfırdan başlat
  const cmd = `
    pm2 delete all || true &&
    killall -9 node || true &&
    sed -i 's/DB_HOST=postgres/DB_HOST=127.0.0.1/g' ~/odelink-shop/backend/.env &&
    sed -i 's/@postgres:5432/@127.0.0.1:5432/g' ~/odelink-shop/backend/.env &&
    cd ~/odelink-shop/backend &&
    npm install &&
    pm2 start server.js --name odelink-backend
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ SUNUCU SIFIRLANDI VE BAŞLATILDI!');
      conn.end();
    }).on('data', (data) => {
      console.log('OUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('ERR: ' + data);
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4'
});
