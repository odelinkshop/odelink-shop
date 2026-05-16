const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım, .env dosyasını düzeltiyorum...');
  
  // DB_HOST'u postgres'ten localhost'a çevir
  const cmd = `
    sed -i 's/DB_HOST=postgres/DB_HOST=localhost/g' ~/odelink-shop/backend/.env &&
    sed -i 's/@postgres:5432/@localhost:5432/g' ~/odelink-shop/backend/.env &&
    pm2 restart odelink-backend
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ Veritabanı bağlantısı localhost olarak güncellendi ve backend restart edildi!');
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
