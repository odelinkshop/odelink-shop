const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Sunucuya bağlandım. GOOGLE CHROME (Snap-sız) kuruluyor...');
  
  const cmd = `
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list &&
    apt-get update &&
    apt-get install -y google-chrome-stable &&
    which google-chrome-stable
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('✅ Google Chrome kurulumu bitti.');
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
