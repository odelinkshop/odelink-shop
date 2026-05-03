
const { Client } = require('ssh2');
const conn = new Client();

const host = "141.98.48.172";
const user = "root";
const password = "OCNtS3xPhbo4";

console.log(`🔗 Sunucuya bağlanılıyor (ENV Güncelleme): ${host}...`);

conn.on('ready', () => {
  console.log('✅ Bağlantı başarılı!');
  
  const commands = [
    "PROJECT_DIR=$(find /root -name \"odelink-shop-main\" -type d -not -path \"*/.*\" | head -n 1)",
    "cd $PROJECT_DIR/backend",
    "grep -q \"GEMINI_API_KEY\" .env || echo \"GEMINI_API_KEY=AIzaSyANxqMHNYietb--bDx1VIYnB4Sb0LH95T8\" >> .env",
    "sed -i 's/GEMINI_API_KEY=.*/GEMINI_API_KEY=AIzaSyANxqMHNYietb--bDx1VIYnB4Sb0LH95T8/' .env",
    "echo \"✅ .env dosyası güncellendi.\"",
    "pm2 restart all"
  ].join(" && ");

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('🏁 İşlem tamamlandı.');
      conn.end();
    }).on('data', (data) => {
      console.log('✅ ÇIKTI: ' + data);
    });
  });
}).connect({
  host: host,
  port: 4383,
  username: user,
  password: password
});
