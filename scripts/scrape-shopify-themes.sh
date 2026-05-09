#!/bin/bash

# SHOPIFY THEME SCRAPER SCRIPT
# Bu script Shopify temalarını otomatik olarak scrape eder

set -e

API_URL="http://127.0.0.1:5000"
THEMES_API="${API_URL}/api/themes"
SCRAPE_API="${API_URL}/api/themes/scrape/shopify"

echo "🚀 Shopify Theme Scraper"
echo "========================"
echo ""

# 1. Theme Engine kontrolü
echo "1️⃣ Theme Engine kontrolü..."
THEMES_RESPONSE=$(curl -s ${THEMES_API})
echo "✅ Theme Engine çalışıyor"
echo "${THEMES_RESPONSE}" | head -20
echo ""

# 2. Materia scrape
echo "2️⃣ Materia temasını scrape ediliyor..."
MATERIA_RESPONSE=$(curl -s -X POST ${SCRAPE_API} \
  -H "Content-Type: application/json" \
  -d '{
    "shopifyUrl": "https://materia-streetwear-demo2.myshopify.com/",
    "themeId": "shopify-materia"
  }')

echo "Response: ${MATERIA_RESPONSE}"

if echo "${MATERIA_RESPONSE}" | grep -q "success"; then
  echo "✅ Materia scraping başladı!"
else
  echo "❌ Materia scraping başarısız!"
  exit 1
fi

echo ""
echo "⏳ Scraping tamamlanması bekleniyor (60 saniye)..."
sleep 60

# 3. Tema dosyalarını kontrol et
echo ""
echo "3️⃣ Tema dosyaları kontrol ediliyor..."
if [ -d "$HOME/odelink-shop/backend/themes/shopify-materia" ]; then
  echo "✅ Materia tema klasörü oluşturuldu"
  ls -lh "$HOME/odelink-shop/backend/themes/shopify-materia/" | head -20
else
  echo "❌ Materia tema klasörü bulunamadı"
fi

echo ""
echo "4️⃣ Dawn temasını scrape ediliyor..."
DAWN_RESPONSE=$(curl -s -X POST ${SCRAPE_API} \
  -H "Content-Type: application/json" \
  -d '{
    "shopifyUrl": "https://dawn-demo.myshopify.com/",
    "themeId": "shopify-dawn"
  }')

echo "Response: ${DAWN_RESPONSE}"

if echo "${DAWN_RESPONSE}" | grep -q "success"; then
  echo "✅ Dawn scraping başladı!"
else
  echo "❌ Dawn scraping başarısız!"
fi

echo ""
echo "⏳ Scraping tamamlanması bekleniyor (60 saniye)..."
sleep 60

# 5. Dawn dosyalarını kontrol et
echo ""
echo "5️⃣ Dawn tema dosyaları kontrol ediliyor..."
if [ -d "$HOME/odelink-shop/backend/themes/shopify-dawn" ]; then
  echo "✅ Dawn tema klasörü oluşturuldu"
  ls -lh "$HOME/odelink-shop/backend/themes/shopify-dawn/" | head -20
else
  echo "❌ Dawn tema klasörü bulunamadı"
fi

echo ""
echo "6️⃣ Backend logları kontrol ediliyor..."
docker logs odelink_backend --tail 50 | grep -i "scrape\|theme\|shopify" || echo "Log bulunamadı"

echo ""
echo "✅ Scraping tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Test sitesi oluştur: INSERT INTO sites ..."
echo "2. Ziyaret et: https://www.odelink.shop/s/streetwear"
echo ""
