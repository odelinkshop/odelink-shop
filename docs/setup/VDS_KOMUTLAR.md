# VDS'DE ÇALIŞTIR - KOPYALA YAPIŞTIR

## 1. VDS'ye Bağlan
```bash
ssh root@185.91.48.172
```

## 2. Projeyi Çek/Güncelle
```bash
# İlk kez kuruyorsan
git clone https://github.com/odelinkshop/odelink-shop.git ~/odelink-shop

# Zaten varsa güncelle
cd ~/odelink-shop
git pull origin main
```

## 3. .env Dosyasını Oluştur
```bash
cd ~/odelink-shop/backend

cat > .env << 'EOF'
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.odelink.shop

DB_HOST=localhost
DB_PORT=5432
DB_NAME=odelink_shop
DB_USER=postgres
DB_PASSWORD=BURAYA_POSTGRES_SIFREN

JWT_SECRET=BURAYA_GUCLU_BIR_SECRET_EN_AZ_32_KARAKTER
JWT_EXPIRE=7d

ADMIN_CLAIM_EMAIL=odelink@admin.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=BURAYA_GMAIL_ADRESIN@gmail.com
EMAIL_PASS=BURAYA_GMAIL_APP_PASSWORD

CLOUDFLARE_API_TOKEN=BURAYA_CLOUDFLARE_TOKEN
CLOUDFLARE_ZONE_ID=BURAYA_CLOUDFLARE_ZONE_ID

SHOPIER_API_TOKEN=BURAYA_SHOPIER_TOKEN

GOOGLE_CLIENT_ID=BURAYA_GOOGLE_CLIENT_ID

CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox
CLOUDINARY_CLOUD_NAME=demo
SUPPORT_EMAIL=odelinkdestek@gmail.com
APP_NAME=Odelink
EMAIL_FROM_NAME=Odelink Destek
SERVE_FRONTEND=true
AUTO_BUILD_FRONTEND=false
EOF

# Şimdi .env'i düzenle
nano .env
```

## 4. PostgreSQL Kur ve Başlat
```bash
# PostgreSQL yüklü mü kontrol et
sudo systemctl status postgresql

# Yüklü değilse kur
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database oluştur
sudo -u postgres psql -c "CREATE DATABASE odelink_shop;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'BURAYA_GUCLU_SIFRE';"
```

## 5. Node.js ve PM2 Kur
```bash
# Node.js 18+ yüklü mü kontrol et
node -v

# Yüklü değilse kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 kur
sudo npm install -g pm2
```

## 6. Backend Kur
```bash
cd ~/odelink-shop/backend
npm install --production
```

## 7. Frontend Build Et
```bash
cd ~/odelink-shop/frontend
npm install
npm run build
```

## 8. Backend'i Başlat
```bash
cd ~/odelink-shop/backend

# PM2 ile başlat
pm2 start server.js --name odelink-backend --time

# PM2'yi sistem başlangıcına ekle
pm2 startup
pm2 save
```

## 9. Kontrol Et
```bash
# PM2 status
pm2 status

# Logları izle
pm2 logs odelink-backend

# Backend health check
curl http://localhost:5000/api/health
```

## 10. Nginx Kur (Opsiyonel ama Önerilen)
```bash
sudo apt install -y nginx

# Nginx config
sudo nano /etc/nginx/sites-available/odelink

# Aşağıdaki config'i yapıştır:
```

```nginx
server {
    listen 80;
    server_name odelink.shop www.odelink.shop;

    # Frontend
    location / {
        root /root/odelink-shop/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
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

    # Site routes
    location /s/ {
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
}
```

```bash
# Config'i aktif et
sudo ln -s /etc/nginx/sites-available/odelink /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Nginx'i başlat
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 11. SSL Sertifikası (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d odelink.shop -d www.odelink.shop
```

---

## SONRAKI GÜNCELLEMELER İÇİN (Hızlı Deploy)

```bash
cd ~/odelink-shop
git pull origin main

cd backend
npm install --production

cd ../frontend
npm install
npm run build

cd ../backend
pm2 restart odelink-backend

pm2 logs odelink-backend
```

---

## SORUN GİDERME

### Backend Çalışmıyor
```bash
pm2 logs odelink-backend --lines 100
pm2 restart odelink-backend
```

### Database Bağlantı Hatası
```bash
sudo systemctl status postgresql
sudo -u postgres psql -l
nano ~/odelink-shop/backend/.env  # DB_PASSWORD kontrol et
```

### Email Çalışmıyor
```bash
nano ~/odelink-shop/backend/.env
# EMAIL_USER ve EMAIL_PASS kontrol et
# Gmail App Password kullan (16 haneli)
```

### Port 5000 Kullanımda
```bash
sudo lsof -i :5000
pm2 delete odelink-backend
pm2 start server.js --name odelink-backend
```

---

## GITHUB SECRETS (Referans)

GitHub'da şu secrets'lar tanımlı:
- VDS_HOST: 185.91.48.172
- VDS_USER: root
- VDS_PORT: 22
- VDS_SSH_KEY: (SSH private key)
- EMAIL_HOST, EMAIL_USER, EMAIL_PASS
- CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID
- SHOPIER_API_TOKEN
- GOOGLE_CLIENT_ID
- JWT_SECRET
- PASSWORD_RESET_SECRET

Bu değerleri .env dosyasına kopyala!
