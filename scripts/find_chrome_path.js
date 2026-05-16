const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım, Chromium yolunu arıyorum...');
  conn.exec('which chromium-browser || which chromium || which google-chrome', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('CHROME_PATH: ' + data);
    }).stderr.on('data', (data) => {
      console.log('CHROME_ERR: ' + data);
    });
  });
}).connect({
  host: '141.98.48.172',
  port: 4383,
  username: 'root',
  password: 'OCNtS3xPhbo4'
});
