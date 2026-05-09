# 🚀 VDS Manuel Kurulum Rehberi

## ⚠️ DURUM
SSH bağlantısı timeout alıyor. Bulutova panelinden direkt konsola bağlanmanız gerekiyor.

## 📋 ADIMLAR

### 1. Bulutova Panelinden Konsola Bağlan

1. https://bulutova.com/hizmet-goruntuler&id=3429 adresine git
2. **"Konsol Aç"** butonuna tıkla (mavi buton)
3. Terminal açılacak, `root` olarak giriş yapacaksın

### 2. Projeyi Klonla (İlk Kurulum İçin)

```bash
# Eğer proje yoksa klonla
cd ~
git clone https://github.com/odelinkshop/odelink-shop.git
cd odelink-shop
```

### 3. .env Dosyasını Oluştur

```bash
cd ~/odelink-shop/backend
nano .env
```

Aşağıdaki içeriği yapıştır (CTRL+SHIFT+V):

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.odelink.shop

# Database Configuration  
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odelink_shop
DB_USER=postgres
DB_PASSWORD=odelink_secure_2026

# JWT Configuration (GitHub'dan alındı)
JWT_SECRET=your_jwt_secret_from_github
JWT_EXPIRE=7d
PASSWORD_RESET_SECRET=your_password_reset_secret_from_github

# Admin Email
ADMIN_CLAIM_EMAIL=odelink@admin.com

# Email Configuration (GitHub'dan alındı)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email_from_github
EMAIL_PASS=your_email_pass_from_github

# Cloudflare API (GitHub'dan alındı)
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id

# Shopier API (GitHub'dan alındı)
SHOPIER_API_TOKEN=your_shopier_token

# Google OAuth (GitHub'dan alındı)
GOOGLE_CLIENT_ID=your_google_client_id

# CORS
CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Cloudinary
CLOUDINARY_CLOUD_NAME=demo

# Support Email
SUPPORT_EMAIL=odelinkdestek@gmail.com

# App Name
APP_NAME=Ödelink
EMAIL_FROM_NAME=Ödelink Destek

# Serve Frontend
SERVE_FRONTEND=true
AUTO_BUILD_FRONTEND=false
```

Kaydet ve çık: `CTRL+X`, `Y`, `ENTER`

### 4. PostgreSQL Veritabanını Oluştur

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Veritabanını oluştur
CREATE DATABASE odelink_shop;

# Kullanıcı oluştur ve şifre belirle
CREATE USER postgres WITH PASSWORD 'odelink_secure_2026';

# Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE odelink_shop TO postgres;

# Çık
\q
```

### 5. Backend Dependencies Kur

```bash
cd ~/odelink-shop/backend
npm install --production
```

### 6. Frontend Build Et

```bash
cd ~/odelink-shop/frontend
npm install
npm run build
```

### 7. PM2 Kur ve Backend'i Başlat

```bash
# PM2'yi global kur
npm install -g pm2

# Backend'i başlat
cd ~/odelink-shop/backend
pm2 start server.js --name odelink-backend --time

# PM2'yi kaydet
pm2 save

# Otomatik başlatma
pm2 startup systemd -u root --hp /root
# Çıkan komutu çalıştır

# Durumu kontrol et
pm2 status
pm2 logs odelink-backend --lines 50
```

### 8. Nginx Yapılandırması

```bash
# Nginx config dosyasını kopyala
sudo cp ~/odelink-shop/infrastructure/nginx/odelink.conf /etc/nginx/sites-available/odelink.shop

# Symlink oluştur
sudo ln -sf /etc/nginx/sites-available/odelink.shop /etc/nginx/sites-enabled/

# Default config'i kaldır (varsa)
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx'i test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl reload nginx
```

### 9. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur (eğer yoksa)
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d odelink.shop -d www.odelink.shop

# Otomatik yenileme test et
sudo certbot renew --dry-run
```

### 10. Firewall Ayarları

```bash
# UFW firewall'u kontrol et
sudo ufw status

# Eğer aktif değilse, gerekli portları aç
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (sadece localhost için)

# Firewall'u aktif et
sudo ufw enable
```

## ✅ TEST

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Beklenen yanıt:
```json
{
  "ok": true,
  "status": "ok"
}
```

### 2. Frontend Test

Tarayıcıda: https://www.odelink.shop

### 3. Kayıt Ol Testi

1. https://www.odelink.shop adresine git
2. "Kayıt Ol" butonuna tıkla
3. Bilgileri doldur
4. E-posta gelip gelmediğini kontrol et

### 4. Logları Kontrol Et

```bash
# Backend logları
pm2 logs odelink-backend --lines 100

# Nginx logları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logları
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🔧 SORUN GİDERME

### Backend Başlamıyor

```bash
# Logları kontrol et
pm2 logs odelink-backend --lines 200

# .env dosyasını kontrol et
cat ~/odelink-shop/backend/.env

# Veritabanı bağlantısını test et
cd ~/odelink-shop/backend
node -e "require('dotenv').config(); const pool = require('./config/database'); pool.query('SELECT 1').then(() => console.log('✅ DB OK')).catch(e => console.error('❌ DB Error:', e.message));"
```

### E-posta Gönderilmiyor

```bash
# .env dosyasında EMAIL_ değişkenlerini kontrol et
grep EMAIL ~/odelink-shop/backend/.env

# Backend'i yeniden başlat
pm2 restart odelink-backend
```

### 500 Internal Server Error

```bash
# Backend loglarını kontrol et
pm2 logs odelink-backend --lines 200 --err

# Nginx loglarını kontrol et
sudo tail -100 /var/log/nginx/error.log
```

## 📊 HIZLI KOMUTLAR

```bash
# Backend'i yeniden başlat
pm2 restart odelink-backend

# Logları izle
pm2 logs odelink-backend -f

# PM2 durumu
pm2 status

# Nginx'i yeniden başlat
sudo systemctl reload nginx

# PostgreSQL durumu
sudo systemctl status postgresql

# Disk kullanımı
df -h

# Bellek kullanımı
free -h

# Prosesor kullanımı
top
```

## 🔄 GÜNCELLEME (GitHub'dan Yeni Kod Çek)

```bash
cd ~/odelink-shop
git pull origin main

# Backend dependencies güncelle
cd backend
npm install --production

# Frontend build et
cd ../frontend
npm install
npm run build

# Backend'i yeniden başlat
pm2 restart odelink-backend

# Logları kontrol et
pm2 logs odelink-backend --lines 50
```

## 📝 NOTLAR

1. **SSH Timeout:** SSH bağlantısı timeout alıyor. Bulutova panelinden firewall ayarlarını kontrol et ve SSH portunu (22) aç.

2. **GitHub Secrets:** Tüm hassas bilgiler GitHub Secrets'ta kayıtlı. `.env` dosyasını oluştururken bu değerleri kullan.

3. **Backup:** Veritabanını düzenli yedekle:
   ```bash
   pg_dump odelink_shop > ~/backup_$(date +%Y%m%d).sql
   ```

4. **Monitoring:** PM2 ile monitoring:
   ```bash
   pm2 monit
   ```

## 🆘 YARDIM

Sorun yaşarsan:
1. PM2 loglarını kontrol et: `pm2 logs odelink-backend --lines 200`
2. Nginx loglarını kontrol et: `sudo tail -100 /var/log/nginx/error.log`
3. PostgreSQL loglarını kontrol et: `sudo tail -100 /var/log/postgresql/postgresql-*.log`

---

**Önemli:** Bu adımları Bulutova panelindeki "Konsol" butonundan açılan terminalde çalıştır!
