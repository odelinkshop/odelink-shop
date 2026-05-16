const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım, logları çekiyorum...');
  // PM2 loglarını ve son hataları çek
  conn.exec('pm2 logs odelink-backend --lines 50 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('LOGS: ' + data);
    }).stderr.on('data', (data) => {
      console.log('LOG_ERR: ' + data);
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4'
});
