const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım. PORT 5000 TEMİZLENİYOR...');
  
  // 1. Port 5000'i tutan tüm süreçleri zorla öldür
  // 2. PM2'yi sıfırla ve yeniden başlat
  const cmd = `
    fuser -k 5000/tcp || true &&
    pm2 stop all || true &&
    pm2 delete all || true &&
    killall -9 node || true &&
    cd ~/odelink-shop/backend &&
    pm2 start server.js --name odelink-backend &&
    pm2 save
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ PORT 5000 TAHLİYE EDİLDİ VE YENİ KOD BAŞLATILDI!');
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
