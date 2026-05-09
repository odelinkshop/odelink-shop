# 🚀 Ödelink VDS Deployment Rehberi

## ❌ MEVCUT SORUNLAR

### 1. E-posta Ayarları Eksik
Kayıt ol, şifremi unuttum, destek mesajları çalışmıyor çünkü `.env` dosyasında e-posta ayarları yok.

### 2. GitHub Actions Yok
Otomatik deployment yapılandırılmamış. Her değişiklikte manuel deployment yapmanız gerekiyor.

### 3. VDS Bağlantısı Yok
GitHub Secrets'ta değişkenler var ama workflow dosyası yok.

---

## ✅ ÇÖZÜM ADIMLARI

### ADIM 1: VDS'de .env Dosyasını Oluştur

VDS'nize SSH ile bağlanın ve backend klasöründe `.env` dosyası oluşturun:

```bash
cd /path/to/odelink-shop/backend
nano .env
```

Aşağıdaki içeriği yapıştırın ve **KENDİ BİLGİLERİNİZLE** doldurun:

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
DB_PASSWORD=BURAYA_VDS_POSTGRES_SIFRENIZI_YAZIN

# JWT Configuration
JWT_SECRET=BURAYA_GUCLU_BIR_SECRET_YAZIN_ORNEK_aB3xK9mP2qR5tY8wZ1nL4jH7vC6fD0sG
JWT_EXPIRE=7d

# Admin Email
ADMIN_CLAIM_EMAIL=odelink@admin.com

# ⚠️ E-POSTA AYARLARI - ÖNEMLİ!
# Gmail kullanıyorsanız:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sizin-gmail-adresiniz@gmail.com
EMAIL_PASS=BURAYA_GMAIL_APP_PASSWORD_YAZIN

# Gmail App Password nasıl alınır:
# 1. Google hesabınıza gidin: https://myaccount.google.com/
# 2. Security > 2-Step Verification > App passwords
# 3. "Mail" seçin ve bir app password oluşturun
# 4. Oluşan 16 haneli şifreyi buraya yapıştırın (boşluksuz)

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_BURAYA_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_BURAYA_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_BURAYA_STRIPE_WEBHOOK_SECRET

# Cloudflare API
CLOUDFLARE_API_TOKEN=BURAYA_CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID=BURAYA_CLOUDFLARE_ZONE_ID

# Shopier API
SHOPIER_API_TOKEN=BURAYA_SHOPIER_PAT_TOKEN

# Google OAuth (opsiyonel)
GOOGLE_CLIENT_ID=BURAYA_GOOGLE_CLIENT_ID

# CORS
CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Cloudinary (opsiyonel)
CLOUDINARY_CLOUD_NAME=demo
```

Kaydet ve çık: `CTRL+X`, `Y`, `ENTER`

---

### ADIM 2: GitHub Actions Workflow Oluştur

Projenizde `.github/workflows` klasörü oluşturun:

```bash
mkdir -p .github/workflows
```

Deployment workflow dosyası oluşturun:

```bash
nano .github/workflows/deploy.yml
```

Aşağıdaki içeriği yapıştırın:

```yaml
name: Deploy to VDS

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to VDS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VDS_HOST }}
          username: ${{ secrets.VDS_USER }}
          key: ${{ secrets.VDS_SSH_KEY }}
          port: ${{ secrets.VDS_PORT || 22 }}
          script: |
            cd /path/to/odelink-shop
            git pull origin main
            cd backend
            npm install --production
            cd ../frontend
            npm install
            npm run build
            pm2 restart odelink-backend || pm2 start backend/server.js --name odelink-backend
            echo "✅ Deployment completed"
```

---

### ADIM 3: GitHub Secrets Ekle

GitHub reponuzda: **Settings > Secrets and variables > Actions > New repository secret**

Eklenecek secrets:

1. `VDS_HOST` - VDS IP adresi (örn: `123.456.789.0`)
2. `VDS_USER` - SSH kullanıcı adı (örn: `root` veya `ubuntu`)
3. `VDS_SSH_KEY` - SSH private key (VDS'nizde `~/.ssh/id_rsa` dosyasının içeriği)
4. `VDS_PORT` - SSH port (genellikle `22`)

---

### ADIM 4: VDS'de PM2 Kurulumu

PM2 process manager ile backend'i çalıştırın:

```bash
# PM2 kur (global)
npm install -g pm2

# Backend'i başlat
cd /path/to/odelink-shop/backend
pm2 start server.js --name odelink-backend

# Otomatik başlatma
pm2 startup
pm2 save

# Logları kontrol et
pm2 logs odelink-backend
```

---

### ADIM 5: Nginx Yapılandırması

Nginx config dosyanızı kontrol edin:

```bash
sudo nano /etc/nginx/sites-available/odelink.shop
```

Örnek config:

```nginx
server {
    listen 80;
    server_name odelink.shop www.odelink.shop;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.odelink.shop;

    ssl_certificate /etc/letsencrypt/live/odelink.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odelink.shop/privkey.pem;

    # Frontend (React build)
    location / {
        root /path/to/odelink-shop/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Site routes (/s/*)
    location /s/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Nginx'i yeniden başlat:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### ADIM 6: PostgreSQL Veritabanı Kontrolü

VDS'de PostgreSQL'in çalıştığından emin olun:

```bash
sudo systemctl status postgresql
sudo -u postgres psql

# PostgreSQL içinde:
\l  # Veritabanlarını listele
\c odelink_shop  # Veritabanına bağlan
\dt  # Tabloları listele
\q  # Çık
```

---

## 🧪 TEST

### 1. Backend Sağlık Kontrolü

```bash
curl https://www.odelink.shop/api/health
```

Beklenen yanıt:
```json
{
  "ok": true,
  "status": "ok",
  "message": "Odelink readiness checks passed"
}
```

### 2. E-posta Testi

Tarayıcıda: `https://www.odelink.shop`

1. "Kayıt Ol" butonuna tıkla
2. Bilgileri doldur
3. Kayıt ol
4. Eğer hata alırsanız, VDS'de logları kontrol edin:

```bash
pm2 logs odelink-backend --lines 100
```

### 3. Şifremi Unuttum Testi

1. "Şifremi Unuttum" linkine tıkla
2. E-posta adresinizi girin
3. E-postanıza kod gelmeli

---

## 🔧 SORUN GİDERME

### E-posta Gönderilmiyor

**Hata:** `EMAIL yapılandırması eksik`

**Çözüm:**
1. VDS'de `.env` dosyasını kontrol edin
2. `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` değerlerinin doğru olduğundan emin olun
3. Gmail kullanıyorsanız App Password oluşturun
4. Backend'i yeniden başlatın: `pm2 restart odelink-backend`

### 500 Internal Server Error

**Çözüm:**
```bash
# Logları kontrol et
pm2 logs odelink-backend --lines 200

# Veritabanı bağlantısını test et
cd /path/to/odelink-shop/backend
node -e "require('dotenv').config(); const pool = require('./config/database'); pool.query('SELECT 1').then(() => console.log('✅ DB OK')).catch(e => console.error('❌ DB Error:', e.message));"
```

### GitHub Actions Çalışmıyor

**Çözüm:**
1. GitHub repo > Actions sekmesine gidin
2. Hata mesajlarını okuyun
3. Secrets'ın doğru eklendiğinden emin olun
4. Workflow dosyasındaki path'leri kontrol edin

---

## 📝 NOTLAR

1. **Güvenlik:** `.env` dosyasını asla GitHub'a pushlama! `.gitignore` dosyasında olduğundan emin ol.
2. **Backup:** Veritabanını düzenli yedekle: `pg_dump odelink_shop > backup.sql`
3. **SSL:** Let's Encrypt sertifikası 90 günde bir yenilenir, otomatik yenileme aktif mi kontrol et: `sudo certbot renew --dry-run`
4. **Monitoring:** PM2 ile monitoring: `pm2 monit`

---

## 🆘 HIZLI YARDIM

### Backend'i yeniden başlat
```bash
pm2 restart odelink-backend
```

### Logları izle
```bash
pm2 logs odelink-backend --lines 100 -f
```

### Veritabanını sıfırla (DİKKAT!)
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS odelink_shop;"
sudo -u postgres psql -c "CREATE DATABASE odelink_shop;"
cd /path/to/odelink-shop/backend
node -e "require('./models/User').ensureSchema(); require('./models/Site').ensureSchema();"
```

### Frontend'i yeniden build et
```bash
cd /path/to/odelink-shop/frontend
npm run build
```

---

## ✅ CHECKLIST

- [ ] VDS'de `.env` dosyası oluşturuldu ve dolduruldu
- [ ] Gmail App Password alındı ve `.env`'e eklendi
- [ ] GitHub Actions workflow dosyası oluşturuldu
- [ ] GitHub Secrets eklendi
- [ ] PM2 kuruldu ve backend başlatıldı
- [ ] Nginx yapılandırması kontrol edildi
- [ ] PostgreSQL çalışıyor
- [ ] Backend health check başarılı
- [ ] Kayıt ol testi yapıldı
- [ ] Şifremi unuttum testi yapıldı

---

Sorularınız için: odelinkdestek@gmail.com
