const { Client } = require('ssh2');
const conn = new Client();

const host = "141.98.48.172";
const user = "root";
const password = "OCNtS3xPhbo4";

console.log(`🔗 Sunucuya bağlanılıyor: ${host}...`);

conn.on('ready', () => {
  console.log('✅ Bağlantı başarılı!');
  
  const commands = [
    "PROJECT_DIR=$(find /root -name \"odelink-shop\" -type d -not -path \"*/.*\" | head -n 1)",
    "echo \"📂 Proje klasörü: $PROJECT_DIR\"",
    "cd $PROJECT_DIR",
    "git fetch origin main",
    "git reset --hard origin/main",
    "echo \"🔥 Docker konteynerleri güncelleniyor...\"",
    "docker compose down || true",
    "docker compose up -d --build",
    "echo \"✅ Konteynerler ayağa kalktı!\"",
    "docker ps",
    "pm2 stop all && pm2 delete all || true",
    "echo \"--- SİSTEM DURUMU ---\"",
    "df -h /",
    "free -h"
  ].join(" && ");

  console.log("🚀 Enterprise Deployment başlatıldı...");
  
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('🏁 İşlem tamamlandı. Çıkış kodu: ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('✅ ÇIKTI:\n' + data);
    }).stderr.on('data', (data) => {
      console.log('⚠️ UYARI/HATA:\n' + data);
    });
  });
}).connect({
  host: host,
  port: 4383,
  username: user,
  password: password,
  readyTimeout: 30000
});

conn.on('error', (err) => {
  console.error('❌ BAĞLANTI HATASI:', err.message);
});
