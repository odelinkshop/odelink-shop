#!/bin/bash

# VDS Quick Fix Script
# Bu script VDS'deki yaygın sorunları otomatik olarak düzeltir

set -e

echo "🔧 VDS Quick Fix başlatılıyor..."
echo ""

# 1. PostgreSQL kontrolü ve başlatma
echo "1️⃣ PostgreSQL kontrolü..."
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
  echo "⚠️  PostgreSQL çalışmıyor, başlatılıyor..."
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
  echo "✅ PostgreSQL başlatıldı"
else
  echo "✅ PostgreSQL zaten çalışıyor"
fi

# 2. Database oluşturma
echo ""
echo "2️⃣ Database kontrolü..."
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw odelink_shop 2>/dev/null; then
  echo "⚠️  odelink_shop database yok, oluşturuluyor..."
  sudo -u postgres psql -c "CREATE DATABASE odelink_shop;" 2>/dev/null || echo "Database zaten var veya oluşturulamadı"
  echo "✅ Database hazır"
else
  echo "✅ Database mevcut"
fi

# 3. .env dosyası kontrolü
echo ""
echo "3️⃣ .env dosyası kontrolü..."
if [ ! -f ~/odelink-shop/backend/.env ]; then
  echo "⚠️  .env dosyası yok, oluşturuluyor..."
  bash ~/odelink-shop/scripts/setup-vds-env.sh
else
  echo "✅ .env dosyası mevcut"
  
  # Placeholder kontrolü
  if grep -q "CHANGE_ME\|BURAYA" ~/odelink-shop/backend/.env 2>/dev/null; then
    echo "⚠️  WARNING: .env dosyasında placeholder değerler var!"
    echo "   Düzenlemek için: nano ~/odelink-shop/backend/.env"
  fi
fi

# 4. Node modules kontrolü
echo ""
echo "4️⃣ Node modules kontrolü..."
if [ ! -d ~/odelink-shop/backend/node_modules ]; then
  echo "⚠️  Backend node_modules yok, yükleniyor..."
  cd ~/odelink-shop/backend
  npm install --production
  echo "✅ Backend dependencies yüklendi"
else
  echo "✅ Backend node_modules mevcut"
fi

if [ ! -d ~/odelink-shop/frontend/node_modules ]; then
  echo "⚠️  Frontend node_modules yok, yükleniyor..."
  cd ~/odelink-shop/frontend
  npm install
  echo "✅ Frontend dependencies yüklendi"
else
  echo "✅ Frontend node_modules mevcut"
fi

# 5. Frontend build kontrolü
echo ""
echo "5️⃣ Frontend build kontrolü..."
if [ ! -f ~/odelink-shop/frontend/build/index.html ]; then
  echo "⚠️  Frontend build yok, build ediliyor..."
  cd ~/odelink-shop/frontend
  npm run build
  echo "✅ Frontend build tamamlandı"
else
  echo "✅ Frontend build mevcut"
fi

# 6. PM2 kontrolü ve restart
echo ""
echo "6️⃣ PM2 kontrolü..."
if ! command -v pm2 &> /dev/null; then
  echo "⚠️  PM2 yüklü değil, yükleniyor..."
  npm install -g pm2
  echo "✅ PM2 yüklendi"
fi

echo "🔄 Backend restart ediliyor..."
cd ~/odelink-shop/backend

# Log dizini oluştur
mkdir -p logs

# PM2 restart
if pm2 describe odelink-backend > /dev/null 2>&1; then
  pm2 restart odelink-backend
else
  pm2 start server.js --name odelink-backend --time --log logs/pm2.log --error logs/pm2-error.log
fi

# 7. Health check
echo ""
echo "7️⃣ Backend health check..."
sleep 3

for i in {1..5}; do
  if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Backend çalışıyor!"
    break
  else
    echo "Deneme $i/5..."
    sleep 2
  fi
  
  if [ $i -eq 5 ]; then
    echo "⚠️  Backend health check başarısız!"
    echo "PM2 logları:"
    pm2 logs odelink-backend --lines 30 --nostream
  fi
done

echo ""
echo "✅ Quick fix tamamlandı!"
echo ""
echo "📊 Durum:"
pm2 status
echo ""
echo "📋 Faydalı komutlar:"
echo "  - Logları görüntüle: pm2 logs odelink-backend"
echo "  - Backend restart: pm2 restart odelink-backend"
echo "  - .env düzenle: nano ~/odelink-shop/backend/.env"
echo "  - Email config kontrol: bash ~/odelink-shop/scripts/fix-email-config.sh"
echo ""
