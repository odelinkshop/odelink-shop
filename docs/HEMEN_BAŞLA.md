# 🚀 HEMEN BAŞLA - VDS Kurulum

## 📋 ÖNCEKİ DURUM
- ❌ E-posta ayarları eksik (kayıt ol, şifremi unuttum çalışmıyor)
- ❌ GitHub Actions yok (otomatik deployment yok)
- ❌ VDS bağlantısı yok

## ✅ YAPILAN İŞLEMLER
1. ✅ GitHub Secrets eklendi (EMAIL, JWT, CLOUDFLARE, SHOPIER)
2. ✅ GitHub Actions workflow oluşturuldu
3. ✅ SSH key oluşturuldu ve GitHub'a eklendi
4. ✅ VDS kurulum scriptleri hazırlandı
5. ✅ Deployment rehberleri oluşturuldu

## 🎯 ŞİMDİ YAPMAN GEREKENLER

### ADIM 1: VDS'ye SSH Key Ekle (2 dakika)

Bulutova panelinden konsola bağlan ve şu komutu çalıştır:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1pLtrrl0+Z67nnqnXEcUJVNuSQ0mH7giFUtZSpMhQM odelink-deployment" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✅ SSH key eklendi!"
```

### ADIM 2: Tek Komutla Kurulum (5-10 dakika)

Aynı konsolda şu komutu çalıştır:

```bash
curl -sSL https://raw.githubusercontent.com/odelinkshop/odelink-shop/main/scripts/vds-one-command-setup.sh | bash
```

Bu script:
- ✅ Sistemi güncelleyecek
- ✅ Node.js, PM2, PostgreSQL, Nginx kuracak
- ✅ Projeyi klonlayacak
- ✅ .env dosyasını oluşturacak (GitHub Secrets'tan)
- ✅ Backend ve frontend'i kuracak
- ✅ PM2 ile backend'i başlatacak
- ✅ Nginx'i yapılandıracak

### ADIM 3: E-posta Ayarlarını Kontrol Et (1 dakika)

```bash
nano ~/odelink-shop/backend/.env
```

`EMAIL_USER` ve `EMAIL_PASS` değerlerini kontrol et. Eğer boşsa GitHub Secrets'ı kontrol et.

### ADIM 4: SSL Sertifikası Al (2 dakika)

```bash
sudo certbot --nginx -d odelink.shop -d www.odelink.shop
```

E-posta adresini gir ve onay ver.

### ADIM 5: Test Et! 🎉

1. **Backend Health Check:**
   ```bash
   curl https://www.odelink.shop/api/health
   ```

2. **Website:** https://www.odelink.shop

3. **Kayıt Ol Testi:**
   - https://www.odelink.shop adresine git
   - "Kayıt Ol" butonuna tıkla
   - Bilgileri doldur
   - E-posta gelip gelmediğini kontrol et

## 📊 DURUM KONTROLÜ

```bash
# Backend durumu
pm2 status

# Backend logları
pm2 logs odelink-backend --lines 50

# Nginx durumu
sudo systemctl status nginx

# PostgreSQL durumu
sudo systemctl status postgresql
```

## 🔄 OTOMATIK DEPLOYMENT

Artık her `git push` yaptığında GitHub Actions otomatik olarak VDS'ye deployment yapacak!

Kontrol et: https://github.com/odelinkshop/odelink-shop/actions

## 🆘 SORUN GİDERME

### Backend Başlamıyor

```bash
pm2 logs odelink-backend --lines 200
```

### E-posta Gönderilmiyor

```bash
# .env dosyasını kontrol et
cat ~/odelink-shop/backend/.env | grep EMAIL

# Backend'i yeniden başlat
pm2 restart odelink-backend
```

### 500 Internal Server Error

```bash
# Backend logları
pm2 logs odelink-backend --err --lines 100

# Nginx logları
sudo tail -100 /var/log/nginx/error.log
```

## 📚 DETAYLI REHBERLER

- `VDS_SSH_SETUP.md` - SSH key kurulumu
- `VDS_MANUAL_SETUP.md` - Manuel kurulum adımları
- `DEPLOYMENT_GUIDE.md` - Detaylı deployment rehberi

## ✅ CHECKLIST

- [ ] SSH key VDS'ye eklendi
- [ ] Tek komut kurulum çalıştırıldı
- [ ] E-posta ayarları kontrol edildi
- [ ] SSL sertifikası alındı
- [ ] Backend health check başarılı
- [ ] Website açılıyor
- [ ] Kayıt ol testi yapıldı
- [ ] GitHub Actions çalışıyor

## 🎉 TAMAMLANDI!

Artık siteniz çalışıyor ve her kod değişikliğinde otomatik olarak VDS'ye deployment yapılıyor!

---

**Sorular için:** odelinkdestek@gmail.com
