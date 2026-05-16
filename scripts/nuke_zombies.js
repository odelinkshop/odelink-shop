const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım. ZOMBİ SÜREÇLER İMHA EDİLİYOR...');
  
  const cmd = `
    pm2 stop all || true &&
    pm2 delete all || true &&
    lsof -ti:5000 | xargs kill -9 || true &&
    netstat -tlpn | grep :5000 || true &&
    cd ~/odelink-shop/backend &&
    npm install &&
    pm2 start server.js --name odelink-backend &&
    pm2 save
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ TÜM ZOMBİLER TEMİZLENDİ! SİSTEM ŞU AN SADECE YENİ KODLA ÇALIŞIYOR.');
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
