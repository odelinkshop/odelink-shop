#!/bin/bash

# Email Configuration Fix Script
# Bu script email ayarlarını kontrol eder ve düzeltir

set -e

echo "📧 Email Yapılandırması Kontrolü..."
echo ""

# .env dosyasını kontrol et
if [ ! -f ~/odelink-shop/backend/.env ]; then
  echo "❌ .env dosyası bulunamadı!"
  exit 1
fi

# Email değişkenlerini kontrol et
source ~/odelink-shop/backend/.env

echo "Mevcut Email Ayarları:"
echo "  EMAIL_HOST: ${EMAIL_HOST:-'❌ TANIMLI DEĞİL'}"
echo "  EMAIL_PORT: ${EMAIL_PORT:-'❌ TANIMLI DEĞİL'}"
echo "  EMAIL_USER: ${EMAIL_USER:-'❌ TANIMLI DEĞİL'}"
echo "  EMAIL_PASS: ${EMAIL_PASS:+✅ TANIMLI (gizli)}"
echo ""

# Eksik değişkenleri kontrol et
MISSING=0

if [ -z "$EMAIL_HOST" ]; then
  echo "❌ EMAIL_HOST tanımlı değil"
  MISSING=1
fi

if [ -z "$EMAIL_PORT" ]; then
  echo "❌ EMAIL_PORT tanımlı değil"
  MISSING=1
fi

if [ -z "$EMAIL_USER" ]; then
  echo "❌ EMAIL_USER tanımlı değil"
  MISSING=1
fi

if [ -z "$EMAIL_PASS" ]; then
  echo "❌ EMAIL_PASS tanımlı değil"
  MISSING=1
fi

if [ $MISSING -eq 1 ]; then
  echo ""
  echo "⚠️  Email yapılandırması eksik!"
  echo ""
  echo "Gmail için örnek yapılandırma:"
  echo ""
  echo "EMAIL_HOST=smtp.gmail.com"
  echo "EMAIL_PORT=587"
  echo "EMAIL_USER=sizin-gmail@gmail.com"
  echo "EMAIL_PASS=xxxx xxxx xxxx xxxx"
  echo ""
  echo "Gmail App Password nasıl alınır:"
  echo "1. https://myaccount.google.com/ adresine gidin"
  echo "2. Security > 2-Step Verification > App passwords"
  echo "3. 'Mail' seçin ve bir app password oluşturun"
  echo "4. Oluşan 16 haneli şifreyi EMAIL_PASS'e yazın"
  echo ""
  echo "Düzenlemek için:"
  echo "  nano ~/odelink-shop/backend/.env"
  echo ""
  exit 1
else
  echo "✅ Email yapılandırması tamam!"
  echo ""
  echo "Test etmek için:"
  echo "  1. Backend'i restart edin: pm2 restart odelink-backend"
  echo "  2. Web sitesinde 'Şifremi Unuttum' veya 'İletişim' formunu deneyin"
  echo ""
fi
