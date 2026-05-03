const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım!');
  conn.exec('docker ps && docker logs --tail 30 odelink_backend', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('ÇIKTI: ' + data);
    }).stderr.on('data', (data) => {
      console.log('HATA: ' + data);
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4',
  readyTimeout: 20000
});
