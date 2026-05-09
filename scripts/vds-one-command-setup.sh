#!/bin/bash

# 🚀 Ödelink VDS Tek Komut Kurulum
# Bu script'i VDS konsolunda çalıştır: curl -sSL https://raw.githubusercontent.com/odelinkshop/odelink-shop/main/scripts/vds-one-command-setup.sh | bash

set -e

echo "🚀 Ödelink VDS Kurulumu Başlıyor..."
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hata yakalama
trap 'echo -e "${RED}❌ Hata oluştu! Kurulum başarısız.${NC}"; exit 1' ERR

# 1. Sistem güncellemesi
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
apt-get update -qq

# 2. Gerekli paketleri kur
echo -e "${YELLOW}📦 Gerekli paketler kuruluyor...${NC}"
apt-get install -y -qq git curl nginx postgresql postgresql-contrib certbot python3-certbot-nginx > /dev/null 2>&1

# 3. Node.js kur (eğer yoksa)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Node.js kuruluyor...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null 2>&1
fi

echo -e "${GREEN}✅ Node.js $(node -v) kurulu${NC}"
echo -e "${GREEN}✅ npm $(npm -v) kurulu${NC}"

# 4. PM2 kur
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 kuruluyor...${NC}"
    npm install -g pm2 > /dev/null 2>&1
fi

echo -e "${GREEN}✅ PM2 kurulu${NC}"

# 5. PostgreSQL yapılandır
echo -e "${YELLOW}🗄️ PostgreSQL yapılandırılıyor...${NC}"
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'odelink_shop'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE odelink_shop;"

sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'odelink_secure_2026';" > /dev/null 2>&1

echo -e "${GREEN}✅ PostgreSQL yapılandırıldı${NC}"

# 6. Projeyi klonla veya güncelle
if [ -d ~/odelink-shop ]; then
    echo -e "${YELLOW}🔄 Proje güncelleniyor...${NC}"
    cd ~/odelink-shop
    git pull origin main
else
    echo -e "${YELLOW}📥 Proje klonlanıyor...${NC}"
    git clone https://github.com/odelinkshop/odelink-shop.git ~/odelink-shop
    cd ~/odelink-shop
fi

# 7. .env dosyasını oluştur
echo -e "${YELLOW}📝 .env dosyası oluşturuluyor...${NC}"

# GitHub Secrets'tan değerleri al (eğer gh CLI varsa)
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 GitHub Secrets'tan değerler alınıyor...${NC}"
    EMAIL_HOST=$(gh secret get EMAIL_HOST 2>/dev/null || echo "smtp.gmail.com")
    EMAIL_PORT=$(gh secret get EMAIL_PORT 2>/dev/null || echo "587")
    EMAIL_USER=$(gh secret get EMAIL_USER 2>/dev/null || echo "")
    EMAIL_PASS=$(gh secret get EMAIL_PASS 2>/dev/null || echo "")
    JWT_SECRET=$(gh secret get JWT_SECRET 2>/dev/null || echo "$(openssl rand -hex 32)")
    PASSWORD_RESET_SECRET=$(gh secret get PASSWORD_RESET_SECRET 2>/dev/null || echo "$(openssl rand -hex 32)")
    CLOUDFLARE_API_TOKEN=$(gh secret get CLOUDFLARE_API_TOKEN 2>/dev/null || echo "")
    CLOUDFLARE_ZONE_ID=$(gh secret get CLOUDFLARE_ZONE_ID 2>/dev/null || echo "")
    SHOPIER_API_TOKEN=$(gh secret get SHOPIER_API_TOKEN 2>/dev/null || echo "")
    GOOGLE_CLIENT_ID=$(gh secret get GOOGLE_CLIENT_ID 2>/dev/null || echo "")
else
    echo -e "${YELLOW}⚠️ GitHub CLI yok, varsayılan değerler kullanılıyor${NC}"
    EMAIL_HOST="smtp.gmail.com"
    EMAIL_PORT="587"
    EMAIL_USER=""
    EMAIL_PASS=""
    JWT_SECRET=$(openssl rand -hex 32)
    PASSWORD_RESET_SECRET=$(openssl rand -hex 32)
    CLOUDFLARE_API_TOKEN=""
    CLOUDFLARE_ZONE_ID=""
    SHOPIER_API_TOKEN=""
    GOOGLE_CLIENT_ID=""
fi

cat > backend/.env << EOF
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.odelink.shop

DB_HOST=localhost
DB_PORT=5432
DB_NAME=odelink_shop
DB_USER=postgres
DB_PASSWORD=odelink_secure_2026

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d
PASSWORD_RESET_SECRET=${PASSWORD_RESET_SECRET}

ADMIN_CLAIM_EMAIL=odelink@admin.com

EMAIL_HOST=${EMAIL_HOST}
EMAIL_PORT=${EMAIL_PORT}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}

CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}

SHOPIER_API_TOKEN=${SHOPIER_API_TOKEN}

GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop

PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

CLOUDINARY_CLOUD_NAME=demo

SUPPORT_EMAIL=odelinkdestek@gmail.com
APP_NAME=Ödelink
EMAIL_FROM_NAME=Ödelink Destek

SERVE_FRONTEND=true
AUTO_BUILD_FRONTEND=false
EOF

echo -e "${GREEN}✅ .env dosyası oluşturuldu${NC}"

# 8. Backend dependencies
echo -e "${YELLOW}📦 Backend dependencies kuruluyor...${NC}"
cd backend
npm install --production > /dev/null 2>&1

# 9. Frontend build
echo -e "${YELLOW}🏗️ Frontend build ediliyor (bu biraz zaman alabilir)...${NC}"
cd ../frontend
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

echo -e "${GREEN}✅ Frontend build tamamlandı${NC}"

# 10. Nginx yapılandır
echo -e "${YELLOW}🌐 Nginx yapılandırılıyor...${NC}"
cp ~/odelink-shop/infrastructure/nginx/odelink.conf /etc/nginx/sites-available/odelink.shop
ln -sf /etc/nginx/sites-available/odelink.shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t > /dev/null 2>&1 && systemctl reload nginx

echo -e "${GREEN}✅ Nginx yapılandırıldı${NC}"

# 11. PM2 ile backend'i başlat
echo -e "${YELLOW}🚀 Backend başlatılıyor...${NC}"
cd ~/odelink-shop/backend
pm2 delete odelink-backend 2>/dev/null || true
pm2 start server.js --name odelink-backend --time
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo -e "${GREEN}✅ Backend başlatıldı${NC}"

# 12. SSL sertifikası (opsiyonel)
echo -e "${YELLOW}🔒 SSL sertifikası kontrol ediliyor...${NC}"
if [ ! -f /etc/letsencrypt/live/odelink.shop/fullchain.pem ]; then
    echo -e "${YELLOW}⚠️ SSL sertifikası yok. Manuel olarak çalıştır:${NC}"
    echo -e "${YELLOW}   sudo certbot --nginx -d odelink.shop -d www.odelink.shop${NC}"
else
    echo -e "${GREEN}✅ SSL sertifikası mevcut${NC}"
fi

# 13. Firewall yapılandır
echo -e "${YELLOW}🔥 Firewall yapılandırılıyor...${NC}"
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1 || true

echo -e "${GREEN}✅ Firewall yapılandırıldı${NC}"

# 14. Durum kontrolü
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ KURULUM TAMAMLANDI!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📊 Sistem Durumu:${NC}"
echo ""

# Backend durumu
if pm2 list | grep -q "odelink-backend.*online"; then
    echo -e "${GREEN}✅ Backend: Çalışıyor${NC}"
else
    echo -e "${RED}❌ Backend: Çalışmıyor${NC}"
fi

# Nginx durumu
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx: Çalışıyor${NC}"
else
    echo -e "${RED}❌ Nginx: Çalışmıyor${NC}"
fi

# PostgreSQL durumu
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL: Çalışıyor${NC}"
else
    echo -e "${RED}❌ PostgreSQL: Çalışmıyor${NC}"
fi

echo ""
echo -e "${YELLOW}🔗 Linkler:${NC}"
echo -e "   Website: ${GREEN}https://www.odelink.shop${NC}"
echo -e "   Health Check: ${GREEN}https://www.odelink.shop/api/health${NC}"
echo ""
echo -e "${YELLOW}📋 Yararlı Komutlar:${NC}"
echo -e "   Backend logları: ${GREEN}pm2 logs odelink-backend${NC}"
echo -e "   Backend durumu: ${GREEN}pm2 status${NC}"
echo -e "   Backend yeniden başlat: ${GREEN}pm2 restart odelink-backend${NC}"
echo -e "   Nginx logları: ${GREEN}tail -f /var/log/nginx/error.log${NC}"
echo ""
echo -e "${YELLOW}⚠️ ÖNEMLİ:${NC}"
echo -e "   1. .env dosyasını kontrol et: ${GREEN}nano ~/odelink-shop/backend/.env${NC}"
echo -e "   2. E-posta ayarlarını (EMAIL_*) güncelle"
echo -e "   3. SSL sertifikası al: ${GREEN}sudo certbot --nginx -d odelink.shop -d www.odelink.shop${NC}"
echo ""
echo -e "${GREEN}🎉 Ödelink başarıyla kuruldu!${NC}"
