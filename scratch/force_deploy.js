const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Bağlandım, radikal temizlik başlıyor...');
  const cmd = 'cd /root/odelink-shop && docker compose down && docker rm -f $(docker ps -aq) || true && docker system prune -f && docker compose up -d';
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ Temizlik ve Deploy bitti! Çıkış kodu:', code);
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
  password: 'OCNtS3xPhbo4',
  readyTimeout: 30000
});
