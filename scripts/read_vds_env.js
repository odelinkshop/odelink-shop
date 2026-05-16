const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım, .env dosyasını okuyorum...');
  conn.exec('cat ~/odelink-shop/backend/.env', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('ENV_CONTENT:\n' + data);
    }).stderr.on('data', (data) => {
      console.log('ENV_ERR: ' + data);
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4'
});
