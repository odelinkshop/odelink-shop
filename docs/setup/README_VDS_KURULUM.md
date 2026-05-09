# 🎯 VDS KURULUM ÖZETİ

## ✅ TAMAMLANAN İŞLEMLER

1. ✅ **GitHub Secrets Yapılandırıldı**
   - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
   - JWT_SECRET, PASSWORD_RESET_SECRET
   - CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID
   - SHOPIER_API_TOKEN
   - GOOGLE_CLIENT_ID
   - VDS_HOST, VDS_USER, VDS_PORT, VDS_SSH_KEY

2. ✅ **GitHub Actions Workflow Oluşturuldu**
   - `.github/workflows/deploy.yml`
   - Otomatik deployment yapılandırması
   - Her `git push` ile otomatik deployment

3. ✅ **SSH Key Oluşturuldu**
   - Public key: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1pLtrrl0+Z67nnqnXEcUJVNuSQ0mH7giFUtZSpMhQM`
   - Private key GitHub Secrets'a eklendi

4. ✅ **Kurulum Scriptleri Hazırlandı**
   - `scripts/vds-one-command-setup.sh` - Tek komut kurulum
   - `scripts/create-env-from-secrets.sh` - .env oluşturma
   - `scripts/setup-vds.sh` - Detaylı kurulum

5. ✅ **Dokümantasyon Oluşturuldu**
   - `HEMEN_BAŞLA.md` - Hızlı başlangıç rehberi
   - `VDS_MANUAL_SETUP.md` - Manuel kurulum adımları
   - `VDS_SSH_SETUP.md` - SSH key kurulumu
   - `DEPLOYMENT_GUIDE.md` - Detaylı deployment rehberi

## ⚠️ SORUN: SSH CONNECTION TIMEOUT

GitHub Actions'tan VDS'ye SSH bağlantısı timeout alıyor:
```
dial tcp 141.98.81.172:22: i/o timeout
```

**Sebep:** VDS'nin SSH portu (22) kapalı veya firewall engelliyor.

## 🚀 ÇÖZ ÜM: MANUEL KURULUM

### ADIM 1: Bulutova Panelinden Konsola Bağlan

1. https://bulutova.com/hizmet-goruntuler&id=3429
2. **"Konsol Aç"** butonuna tıkla (mavi buton)

### ADIM 2: SSH Key Ekle (30 saniye)

Konsolda şu komutu çalıştır:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1pLtrrl0+Z67nnqnXEcUJVNuSQ0mH7giFUtZSpMhQM odelink-deployment" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✅ SSH key eklendi!"
```

### ADIM 3: Tek Komutla Kurulum (5-10 dakika)

```bash
curl -sSL https://raw.githubusercontent.com/odelinkshop/odelink-shop/main/scripts/vds-one-command-setup.sh | bash
```

Bu script otomatik olarak:
- ✅ Sistemi güncelleyecek
- ✅ Node.js, PM2, PostgreSQL, Nginx kuracak
- ✅ Projeyi klonlayacak
- ✅ .env dosyasını oluşturacak
- ✅ Backend ve frontend'i kuracak
- ✅ PM2 ile backend'i başlatacak
- ✅ Nginx'i yapılandıracak

### ADIM 4: E-posta Ayarlarını Kontrol Et (1 dakika)

```bash
nano ~/odelink-shop/backend/.env
```

`EMAIL_USER` ve `EMAIL_PASS` değerlerini kontrol et.

### ADIM 5: SSL Sertifikası Al (2 dakika)

```bash
sudo certbot --nginx -d odelink.shop -d www.odelink.shop
```

### ADIM 6: Firewall'u Aç (30 saniye)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
```

### ADIM 7: Test Et! 🎉

```bash
# Backend health check
curl https://www.odelink.shop/api/health

# PM2 durumu
pm2 status

# Backend logları
pm2 logs odelink-backend --lines 50
```

## 📊 BEKLENEN SONUÇ

### Backend Health Check:
```json
{
  "ok": true,
  "status": "ok",
  "message": "Odelink readiness checks passed"
}
```

### PM2 Status:
```
┌─────┬──────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ mode    │ ↺       │ status  │ cpu      │
├─────┼──────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ odelink-backend  │ fork    │ 0       │ online  │ 0%       │
└─────┴──────────────────┴─────────┴─────────┴─────────┴──────────┘
```

### Website:
- https://www.odelink.shop - Ana sayfa açılmalı
- Kayıt ol, giriş yap çalışmalı
- E-posta gönderimi çalışmalı

## 🔄 OTOMATIK DEPLOYMENT

SSH portu açıldıktan sonra GitHub Actions otomatik çalışacak:

1. Firewall'da SSH portunu aç:
   ```bash
   sudo ufw allow 22/tcp
   ```

2. SSH servisini yeniden başlat:
   ```bash
   sudo systemctl restart sshd
   ```

3. GitHub'dan test et:
   ```bash
   ssh -i ~/.ssh/odelink_vds root@141.98.81.172 "echo 'SSH OK'"
   ```

4. Başarılı olursa, her `git push` otomatik deployment yapacak!

## 📚 DETAYLI REHBERLER

- **`HEMEN_BAŞLA.md`** - Hızlı başlangıç (ÖNERİLEN)
- **`VDS_MANUAL_SETUP.md`** - Manuel kurulum adımları
- **`VDS_SSH_SETUP.md`** - SSH key kurulumu
- **`DEPLOYMENT_GUIDE.md`** - Detaylı deployment rehberi

## 🆘 SORUN GİDERME

### Backend Başlamıyor
```bash
pm2 logs odelink-backend --lines 200
```

### E-posta Gönderilmiyor
```bash
cat ~/odelink-shop/backend/.env | grep EMAIL
pm2 restart odelink-backend
```

### 500 Internal Server Error
```bash
pm2 logs odelink-backend --err --lines 100
sudo tail -100 /var/log/nginx/error.log
```

## ✅ CHECKLIST

- [ ] Bulutova konsoluna bağlandım
- [ ] SSH key ekledim
- [ ] Tek komut kurulum çalıştırdım
- [ ] E-posta ayarlarını kontrol ettim
- [ ] SSL sertifikası aldım
- [ ] Firewall'u açtım
- [ ] Backend health check başarılı
- [ ] Website açılıyor
- [ ] Kayıt ol testi yaptım

## 🎉 SONUÇ

Tüm adımlar tamamlandığında:
- ✅ Website çalışıyor: https://www.odelink.shop
- ✅ Backend API çalışıyor
- ✅ E-posta gönderimi çalışıyor
- ✅ Kayıt ol, giriş yap, şifremi unuttum çalışıyor
- ✅ Otomatik deployment aktif (SSH portu açıldıktan sonra)

---

**Sorular için:** odelinkdestek@gmail.com
**GitHub:** https://github.com/odelinkshop/odelink-shop
