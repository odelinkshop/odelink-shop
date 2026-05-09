#!/bin/bash

# VDS .env Setup Script
# Bu script VDS'de backend/.env dosyasını oluşturur

set -e

echo "🔧 VDS .env dosyası oluşturuluyor..."

# Backend dizinine git
cd ~/odelink-shop/backend

# .env dosyası varsa yedekle
if [ -f .env ]; then
  echo "📦 Mevcut .env yedekleniyor..."
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# .env dosyasını oluştur
cat > .env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.odelink.shop

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odelink_shop
DB_USER=postgres
DB_PASSWORD=POSTGRES_PASSWORD_BURAYA

# JWT Configuration
JWT_SECRET=GUCLU_JWT_SECRET_BURAYA_32_KARAKTER_MINIMUM
JWT_EXPIRE=7d

# Admin Email
ADMIN_CLAIM_EMAIL=odelink@admin.com

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=GMAIL_ADRESINIZ@gmail.com
EMAIL_PASS=GMAIL_APP_PASSWORD_16_KARAKTER

# Cloudflare API
CLOUDFLARE_API_TOKEN=CLOUDFLARE_API_TOKEN_BURAYA
CLOUDFLARE_ZONE_ID=CLOUDFLARE_ZONE_ID_BURAYA

# Shopier API
SHOPIER_API_TOKEN=SHOPIER_PAT_TOKEN_BURAYA

# Google OAuth (opsiyonel)
GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID_BURAYA

# CORS
CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Cloudinary (opsiyonel)
CLOUDINARY_CLOUD_NAME=demo

# Support Email
SUPPORT_EMAIL=odelinkdestek@gmail.com

# App Name
APP_NAME=Ödelink
EMAIL_FROM_NAME=Ödelink Destek

# Frontend Serving
SERVE_FRONTEND=true
AUTO_BUILD_FRONTEND=false
EOF

echo "✅ .env dosyası oluşturuldu: ~/odelink-shop/backend/.env"
echo ""
echo "⚠️  ÖNEMLİ: Şimdi aşağıdaki değerleri düzenlemeniz gerekiyor:"
echo ""
echo "1. PostgreSQL şifresi:"
echo "   DB_PASSWORD=POSTGRES_PASSWORD_BURAYA"
echo ""
echo "2. JWT Secret (güçlü bir şifre):"
echo "   JWT_SECRET=GUCLU_JWT_SECRET_BURAYA_32_KARAKTER_MINIMUM"
echo ""
echo "3. Gmail ayarları:"
echo "   EMAIL_USER=GMAIL_ADRESINIZ@gmail.com"
echo "   EMAIL_PASS=GMAIL_APP_PASSWORD_16_KARAKTER"
echo ""
echo "4. Cloudflare API (GitHub Secrets'tan kopyalayın):"
echo "   CLOUDFLARE_API_TOKEN=..."
echo "   CLOUDFLARE_ZONE_ID=..."
echo ""
echo "5. Shopier API Token:"
echo "   SHOPIER_API_TOKEN=..."
echo ""
echo "6. Google OAuth (opsiyonel):"
echo "   GOOGLE_CLIENT_ID=..."
echo ""
echo "Düzenlemek için:"
echo "  nano ~/odelink-shop/backend/.env"
echo ""
