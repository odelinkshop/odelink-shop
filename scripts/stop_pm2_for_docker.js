const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım. PM2 DURDURULUYOR, DOCKER İÇİN YOL AÇILIYOR...');
  
  // 1. PM2'yi tamamen durdur ve sil (Docker ile çakışmasın)
  // 2. Port 5000'i zorla boşalt
  const cmd = `
    pm2 stop all || true &&
    pm2 delete all || true &&
    fuser -k 5000/tcp || true &&
    echo "✅ PM2 durduruldu ve Port 5000 boşaltıldı. Şimdi GitHub Actions tekrar çalışabilir."
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ TEMİZLİK TAMAM! Şimdi GitHub Actions üzerinden tekrar "Re-run jobs" yapabilirsin.');
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
