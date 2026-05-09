#!/bin/bash

# VDS Deploy Helper Script
# Bu script deploy sonrası kontrolleri yapar

set -e

echo "🔍 VDS Deploy Kontrolleri..."
echo ""

# 1. .env dosyası kontrolü
echo "1️⃣ .env dosyası kontrolü..."
if [ ! -f ~/odelink-shop/backend/.env ]; then
  echo "❌ HATA: .env dosyası bulunamadı!"
  echo "   Çözüm: bash ~/odelink-shop/scripts/setup-vds-env.sh"
  exit 1
else
  echo "✅ .env dosyası mevcut"
fi

# 2. PostgreSQL kontrolü
echo ""
echo "2️⃣ PostgreSQL kontrolü..."
if systemctl is-active --quiet postgresql; then
  echo "✅ PostgreSQL çalışıyor"
else
  echo "❌ PostgreSQL çalışmıyor!"
  echo "   Çözüm: sudo systemctl start postgresql"
  exit 1
fi

# 3. Database kontrolü
echo ""
echo "3️⃣ Database kontrolü..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw odelink_shop; then
  echo "✅ odelink_shop database mevcut"
else
  echo "⚠️  odelink_shop database bulunamadı"
  echo "   Oluşturuluyor..."
  sudo -u postgres psql -c "CREATE DATABASE odelink_shop;"
  echo "✅ Database oluşturuldu"
fi

# 4. Node.js ve npm kontrolü
echo ""
echo "4️⃣ Node.js kontrolü..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "✅ Node.js yüklü: $NODE_VERSION"
else
  echo "❌ Node.js yüklü değil!"
  exit 1
fi

# 5. PM2 kontrolü
echo ""
echo "5️⃣ PM2 kontrolü..."
if command -v pm2 &> /dev/null; then
  echo "✅ PM2 yüklü"
  pm2 status
else
  echo "❌ PM2 yüklü değil!"
  echo "   Çözüm: npm install -g pm2"
  exit 1
fi

# 6. Backend health check
echo ""
echo "6️⃣ Backend health check..."
sleep 2
if curl -f http://localhost:5000/api/health &> /dev/null; then
  echo "✅ Backend çalışıyor"
else
  echo "⚠️  Backend health check başarısız"
  echo "   PM2 logları:"
  pm2 logs odelink-backend --lines 30 --nostream
fi

# 7. Frontend build kontrolü
echo ""
echo "7️⃣ Frontend build kontrolü..."
if [ -f ~/odelink-shop/frontend/build/index.html ]; then
  echo "✅ Frontend build mevcut"
else
  echo "⚠️  Frontend build bulunamadı"
fi

# 8. Nginx kontrolü (varsa)
echo ""
echo "8️⃣ Nginx kontrolü..."
if command -v nginx &> /dev/null; then
  if systemctl is-active --quiet nginx; then
    echo "✅ Nginx çalışıyor"
  else
    echo "⚠️  Nginx yüklü ama çalışmıyor"
  fi
else
  echo "ℹ️  Nginx yüklü değil (opsiyonel)"
fi

echo ""
echo "✅ Kontroller tamamlandı!"
echo ""
echo "📊 Sistem Durumu:"
echo "  - Backend: http://localhost:5000"
echo "  - Frontend: ~/odelink-shop/frontend/build"
echo "  - PM2 Logs: pm2 logs odelink-backend"
echo "  - PM2 Restart: pm2 restart odelink-backend"
echo ""
