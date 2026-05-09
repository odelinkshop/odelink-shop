# VDS Kurulum ve Sorun Giderme Rehberi

## 🚀 İlk Kurulum (Yeni VDS)

### 1. Sistem Gereksinimleri
- Ubuntu 20.04+ veya Debian 11+
- Node.js 18+ ve npm
- PostgreSQL 14+
- PM2 (process manager)
- Git

### 2. Hızlı Kurulum

VDS'ye SSH ile bağlanın ve şu komutu çalıştırın:

```bash
# Repo'yu klonlayın (ilk kez)
git clone https://github.com/odelinkshop/odelink-shop.git ~/odelink-shop

# Quick fix script'ini çalıştırın (her şeyi otomatik kurar)
cd ~/odelink-shop
chmod +x scripts/*.sh
bash scripts/vds-quick-fix.sh
```

### 3. .env Dosyasını Yapılandırın

```bash
nano ~/odelink-shop/backend/.env
```

**Mutlaka değiştirmeniz gerekenler:**

```env
# PostgreSQL şifresi
DB_PASSWORD=guclu_postgres_sifresi_buraya

# JWT Secret (en az 32 karakter)
JWT_SECRET=cok_guclu_ve_rastgele_bir_secret_32_karakter_minimum

# Gmail ayarları (şifre sıfırlama ve iletişim formu için)
EMAIL_USER=sizin-gmail@gmail.com
EMAIL_PASS=gmail_app_password_16_karakter
```

**Gmail App Password nasıl alınır:**
1. https://myaccount.google.com/ → Security
2. 2-Step Verification → App passwords
3. "Mail" seçin ve password oluşturun
4. 16 haneli şifreyi `EMAIL_PASS`'e yazın (boşluksuz)

### 4. Backend'i Restart Edin

```bash
pm2 restart odelink-backend
pm2 logs odelink-backend
```

---

## 🔧 Sorun Giderme

### Deploy Başarısız Oluyor

**Semptom:** GitHub Actions deploy workflow başarısız

**Çözüm:**
```bash
# VDS'ye SSH ile bağlanın
ssh root@185.91.48.172

# Quick fix çalıştırın
cd ~/odelink-shop
bash scripts/vds-quick-fix.sh

# Logları kontrol edin
pm2 logs odelink-backend --lines 50
```

### Giriş/Kayıt Çalışmıyor

**Olası Sebepler:**
1. Database bağlantısı yok
2. JWT_SECRET tanımlı değil
3. Backend çalışmıyor

**Çözüm:**
```bash
# Database kontrolü
sudo systemctl status postgresql
sudo -u postgres psql -l | grep odelink_shop

# .env kontrolü
cat ~/odelink-shop/backend/.env | grep JWT_SECRET

# Backend restart
pm2 restart odelink-backend
pm2 logs odelink-backend
```

### Şifre Sıfırlama Çalışmıyor

**Sebep:** Email yapılandırması eksik veya hatalı

**Çözüm:**
```bash
# Email config kontrolü
bash ~/odelink-shop/scripts/fix-email-config.sh

# .env'i düzenleyin
nano ~/odelink-shop/backend/.env

# EMAIL_HOST, EMAIL_USER, EMAIL_PASS değerlerini kontrol edin
# Gmail App Password kullanıyorsanız 16 haneli şifreyi yazın

# Backend restart
pm2 restart odelink-backend
```

### İletişim Formu Çalışmıyor

**Sebep:** Email yapılandırması eksik (şifre sıfırlama ile aynı)

**Çözüm:** Yukarıdaki "Şifre Sıfırlama" çözümünü uygulayın

### Backend Çalışmıyor

**Çözüm:**
```bash
# PM2 status kontrol
pm2 status

# Backend restart
pm2 restart odelink-backend

# Logları kontrol edin
pm2 logs odelink-backend --lines 100

# Hata varsa .env'i kontrol edin
nano ~/odelink-shop/backend/.env
```

### Frontend Build Hatası

**Çözüm:**
```bash
cd ~/odelink-shop/frontend
rm -rf node_modules package-lock.json
npm install
npm run build

# Build başarılı mı kontrol edin
ls -la build/index.html
```

---

## 📊 Faydalı Komutlar

### PM2 Komutları
```bash
# Status görüntüle
pm2 status

# Logları görüntüle (canlı)
pm2 logs odelink-backend

# Son 100 satır log
pm2 logs odelink-backend --lines 100 --nostream

# Backend restart
pm2 restart odelink-backend

# Backend stop
pm2 stop odelink-backend

# Backend start
pm2 start ~/odelink-shop/backend/server.js --name odelink-backend
```

### Database Komutları
```bash
# PostgreSQL status
sudo systemctl status postgresql

# PostgreSQL başlat
sudo systemctl start postgresql

# Database'e bağlan
sudo -u postgres psql odelink_shop

# Database listele
sudo -u postgres psql -l
```

### Git Komutları
```bash
# Son değişiklikleri çek
cd ~/odelink-shop
git pull origin main

# Tüm local değişiklikleri sil ve son hali çek
git fetch origin
git reset --hard origin/main
```

### Log Komutları
```bash
# Backend PM2 logları
pm2 logs odelink-backend

# Backend log dosyası
tail -f ~/odelink-shop/backend/logs/pm2.log

# Backend error log
tail -f ~/odelink-shop/backend/logs/pm2-error.log

# System logs
journalctl -u postgresql -n 50
```

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] `.env` dosyasında güçlü şifreler kullanıldı
- [ ] `JWT_SECRET` en az 32 karakter ve rastgele
- [ ] `DB_PASSWORD` güçlü bir şifre
- [ ] Gmail App Password kullanılıyor (normal şifre değil)
- [ ] PostgreSQL sadece localhost'tan erişilebilir
- [ ] Firewall yapılandırıldı (sadece 80, 443, SSH portları açık)
- [ ] SSH key authentication kullanılıyor (password auth kapalı)

---

## 📞 Destek

Sorun devam ediyorsa:

1. PM2 loglarını kontrol edin: `pm2 logs odelink-backend --lines 100`
2. .env dosyasını kontrol edin: `cat ~/odelink-shop/backend/.env`
3. Database bağlantısını test edin: `sudo -u postgres psql odelink_shop -c "SELECT 1"`
4. Backend health check: `curl http://localhost:5000/api/health`

---

## 🔄 Otomatik Deploy

GitHub'a push yaptığınızda otomatik deploy çalışır:

1. GitHub Actions workflow tetiklenir
2. VDS'ye SSH ile bağlanır
3. Son kodu çeker
4. Dependencies yükler
5. Frontend build eder
6. Backend'i restart eder

**Deploy loglarını görmek için:**
- GitHub → Actions sekmesi → Son workflow'a tıklayın

---

## ✅ Başarılı Kurulum Kontrolü

Tüm bunlar çalışıyorsa kurulum başarılı:

```bash
# 1. PostgreSQL çalışıyor
sudo systemctl status postgresql

# 2. Backend çalışıyor
curl http://localhost:5000/api/health

# 3. PM2 process aktif
pm2 status | grep odelink-backend

# 4. Frontend build mevcut
ls ~/odelink-shop/frontend/build/index.html

# 5. .env dosyası doğru yapılandırılmış
bash ~/odelink-shop/scripts/fix-email-config.sh
```

Hepsi ✅ ise sistem hazır! 🎉
