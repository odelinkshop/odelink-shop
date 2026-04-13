# 🚨 ACİL ÇÖZÜM - GİRİŞ/KAYIT/GOOGLE AUTH ÇALIŞMIYOR

## ❌ SORUNLAR

1. **`.env` dosyası yok** - Backend yapılandırması eksik
2. **Google OAuth çalışmıyor** - `GOOGLE_CLIENT_ID` tanımlı değil
3. **E-posta gönderimi çalışmıyor** - Gmail App Password eksik
4. **CSP hatası** - Google scriptleri engelleniyor (✅ DÜZELTİLDİ)

---

## ✅ ÇÖZÜM ADIMLARI

### 1. VDS'ye Bağlan

```bash
ssh root@VDS_IP_ADRESI -p 4383
cd /root/odelink-shop/backend
```

### 2. `.env` Dosyasını Oluştur

```bash
nano .env
```

Aşağıdaki içeriği yapıştır ve **KENDİ BİLGİLERİNLE** doldur:

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
DB_PASSWORD=odelink_production_password_change_me

# JWT Configuration
JWT_SECRET=odelink_super_secret_jwt_key_production_2026
JWT_EXPIRE=7d

# Admin Configuration
ADMIN_CLAIM_EMAIL=odelink@admin.com

# ⚠️ E-POSTA AYARLARI - ÖNEMLİ!
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=odelinkdestek@gmail.com
EMAIL_PASS=BURAYA_GMAIL_APP_PASSWORD_YAZIN

# ⚠️ GOOGLE OAUTH - ÖNEMLİ!
GOOGLE_CLIENT_ID=BURAYA_GOOGLE_CLIENT_ID_YAZIN

# Stripe (Şu an kullanılmıyor)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare (Opsiyonel)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=

# Shopier (Opsiyonel)
SHOPIER_API_TOKEN=

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Cloudinary (Opsiyonel)
CLOUDINARY_CLOUD_NAME=demo

# CORS
CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop

# Frontend
SERVE_FRONTEND=true
AUTO_BUILD_FRONTEND=false

# Password Reset
PASSWORD_RESET_SECRET=odelink_password_reset_secret_2026
PASSWORD_RESET_EXPIRES_MINUTES=20

# Auth Cookies
AUTH_ACCESS_COOKIE_NAME=odelink_access
AUTH_REFRESH_COOKIE_NAME=odelink_refresh
AUTH_ACCESS_COOKIE_MAX_AGE=7d
REFRESH_TOKEN_EXPIRE_DAYS=30
AUTH_COOKIE_DOMAIN=.odelink.shop
```

**CTRL+X** → **Y** → **ENTER** ile kaydet.

---

### 3. Gmail App Password Al

1. **Google hesabına git:** https://myaccount.google.com/
2. **Security** → **2-Step Verification** → **App passwords**
3. **"Mail"** seç ve bir app password oluştur
4. Oluşan **16 haneli şifreyi** kopyala (boşluksuz)
5. `.env` dosyasında `EMAIL_PASS=` kısmına yapıştır

**Örnek:**
```env
EMAIL_PASS=abcd efgh ijkl mnop  # YANLIŞ (boşluklu)
EMAIL_PASS=abcdefghijklmnop     # DOĞRU (boşluksuz)
```

---

### 4. Google OAuth Client ID Al

1. **Google Cloud Console'a git:** https://console.cloud.google.com/
2. **Yeni proje oluştur** (veya mevcut projeyi seç)
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type:** Web application
5. **Authorized JavaScript origins:**
   ```
   https://www.odelink.shop
   https://odelink.shop
   ```
6. **Authorized redirect URIs:**
   ```
   https://www.odelink.shop/auth
   https://odelink.shop/auth
   ```
7. **Create** butonuna tıkla
8. Oluşan **Client ID**'yi kopyala
9. `.env` dosyasında `GOOGLE_CLIENT_ID=` kısmına yapıştır

**Örnek:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

---

### 5. Backend'i Yeniden Başlat

```bash
# Docker kullanıyorsan:
cd /root/odelink-shop
docker compose restart backend

# PM2 kullanıyorsan:
pm2 restart odelink-backend

# Logları kontrol et:
docker logs odelink_backend -f
# veya
pm2 logs odelink-backend
```

---

### 6. Frontend'i Yeniden Build Et (Opsiyonel)

CSP düzeltmesi için frontend'i yeniden build etmen gerekebilir:

```bash
cd /root/odelink-shop/frontend
npm run build

# Docker kullanıyorsan:
docker compose restart backend
```

---

## 🧪 TEST

### 1. Backend Sağlık Kontrolü

```bash
curl https://www.odelink.shop/api/health
```

**Beklenen yanıt:**
```json
{
  "ok": true,
  "status": "ok",
  "message": "Odelink readiness checks passed"
}
```

### 2. Google OAuth Config Kontrolü

```bash
curl https://www.odelink.shop/api/auth/google/config
```

**Beklenen yanıt:**
```json
{
  "enabled": true,
  "clientId": "123456789-abcdefghijklmnop.apps.googleusercontent.com"
}
```

### 3. Tarayıcıda Test

1. **https://www.odelink.shop/auth** adresine git
2. **Google ile giriş** butonunu gör
3. **Kayıt Ol** formunu doldur ve gönder
4. **E-postana kod geldi mi kontrol et**

---

## 🔍 SORUN GİDERME

### Hata: "EMAIL yapılandırması eksik"

**Çözüm:** `.env` dosyasında `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` değerlerinin doğru olduğundan emin ol.

```bash
# .env dosyasını kontrol et:
cat /root/odelink-shop/backend/.env | grep EMAIL
```

### Hata: "Google giris yapilandirilmadi"

**Çözüm:** `.env` dosyasında `GOOGLE_CLIENT_ID` değerinin doğru olduğundan emin ol.

```bash
# .env dosyasını kontrol et:
cat /root/odelink-shop/backend/.env | grep GOOGLE
```

### Hata: "CORS blocked"

**Çözüm:** `.env` dosyasında `CORS_ORIGINS` değerinin doğru olduğundan emin ol.

```bash
# .env dosyasını kontrol et:
cat /root/odelink-shop/backend/.env | grep CORS
```

### Google OAuth Butonu Görünmüyor

**Çözüm:** CSP düzeltmesi için backend'i yeniden başlat.

```bash
docker compose restart backend
# veya
pm2 restart odelink-backend
```

---

## 📝 NOTLAR

1. **`.env` dosyasını asla GitHub'a pushlama!** (`.gitignore` dosyasında zaten var)
2. **Gmail App Password'ü kimseyle paylaşma!**
3. **Google Client ID'yi kimseyle paylaşma!**
4. **JWT_SECRET'i güçlü bir şifre yap!**

---

## ✅ CHECKLIST

- [ ] VDS'ye SSH ile bağlandım
- [ ] `.env` dosyasını oluşturdum
- [ ] Gmail App Password aldım ve `.env`'e ekledim
- [ ] Google OAuth Client ID aldım ve `.env`'e ekledim
- [ ] Backend'i yeniden başlattım
- [ ] `/api/health` endpoint'i çalışıyor
- [ ] `/api/auth/google/config` endpoint'i `enabled: true` döndürüyor
- [ ] Tarayıcıda Google ile giriş butonu görünüyor
- [ ] Kayıt ol formu çalışıyor
- [ ] E-posta gönderimi çalışıyor

---

## 🆘 HIZLI YARDIM

Sorun devam ederse:

```bash
# Backend loglarını kontrol et:
docker logs odelink_backend --tail 100
# veya
pm2 logs odelink-backend --lines 100

# .env dosyasını kontrol et:
cat /root/odelink-shop/backend/.env

# Backend'i yeniden başlat:
docker compose restart backend
# veya
pm2 restart odelink-backend
```

---

**Sorularınız için:** odelinkdestek@gmail.com
