# 🔐 GitHub Secrets Kurulum Rehberi

## VDS Bilgileri (Ekran Görüntüsünden)

- **IP Adresi:** 141.98.48.172
- **SSH Port:** 4383
- **Kullanıcı:** root
- **SSH Key:** `.ssh/vds_key` (zaten mevcut)

---

## 🚀 GitHub Secrets Ekleme Adımları

### 1. GitHub Repository'ye Git

```
https://github.com/[kullanıcı-adın]/odelink-shop
```

### 2. Settings > Secrets and Variables > Actions

1. Repository sayfasında **Settings** sekmesine tıkla
2. Sol menüden **Secrets and variables** > **Actions** seç
3. **New repository secret** butonuna tıkla

### 3. Şu Secret'ları Ekle

#### Secret 1: VDS_HOST
```
Name: VDS_HOST
Value: 141.98.48.172
```

#### Secret 2: VDS_USERNAME
```
Name: VDS_USERNAME
Value: root
```

#### Secret 3: VDS_PORT
```
Name: VDS_PORT
Value: 4383
```

#### Secret 4: VDS_SSH_KEY
```
Name: VDS_SSH_KEY
Value: [Aşağıdaki SSH key'i kopyala yapıştır]
```

**SSH Key İçeriği (`.ssh/vds_key` dosyasından):**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBdaS7a9ftPue56p1xHFCVTbkkNJh+4IhVLWUqTIUDMDAAAAAqAzWgOgM1o
DgAAAAtzc2gtZWQyNTUxOQAAACBdaS7a9ftPue56p1xHFCVTbkkNJh+4IhVLWUqTIUDMDA
AAAEBJxjdXPCPMv+2CzBr/HtuuoLpvdMsrJx2vgLJBoBdRnBou2vX7T7nueqdcRxQlU25J
DSYfuCIVS1lKkyFAzAwAAAASb2RlbGluay1kZXBsb3ltZW50AQIDBA==
-----END OPENSSH PRIVATE KEY-----
```

---

## ✅ Kontrol Listesi

- [ ] VDS_HOST = `141.98.48.172`
- [ ] VDS_USERNAME = `root`
- [ ] VDS_PORT = `4383`
- [ ] VDS_SSH_KEY = SSH private key (yukarıdaki)

---

## 🎯 SSH Key VDS'de Kurulu mu Kontrol Et

Eğer SSH key VDS'de kurulu değilse, şu adımları takip et:

### 1. Public Key'i Al

```bash
# Windows'ta (bu projede)
cat .ssh/vds_key.pub
```

**Eğer `.ssh/vds_key.pub` yoksa, oluştur:**

```bash
# Private key'den public key oluştur
ssh-keygen -y -f .ssh/vds_key > .ssh/vds_key.pub
```

### 2. VDS'ye SSH ile Bağlan (Şifre ile)

```bash
ssh -p 4383 root@141.98.48.172
```

### 3. Public Key'i VDS'ye Ekle

```bash
# VDS'de
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Public key'i authorized_keys'e ekle
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFdpLtr1+0+57nqnXEcUJVNuSQ0mH7giFUtZSpMhQMwM odelink-deployment" >> ~/.ssh/authorized_keys

chmod 600 ~/.ssh/authorized_keys
```

### 4. SSH Bağlantısını Test Et

```bash
# Windows'tan (şifresiz bağlanmalı)
ssh -i .ssh/vds_key -p 4383 root@141.98.48.172
```

**Başarılı olursa şifre sormadan bağlanacak!**

---

## 🚀 GitHub Actions'ı Çalıştır

### 1. GitHub'da Actions Sekmesine Git

```
https://github.com/[kullanıcı-adın]/odelink-shop/actions
```

### 2. "Scrape Shopify Themes" Workflow'unu Seç

Sol menüden **Scrape Shopify Themes** workflow'unu bul.

### 3. "Run workflow" Butonuna Tıkla

Sağ üstteki **Run workflow** > **Run workflow** butonuna tıkla.

### 4. Logları İzle

Workflow çalışmaya başlayacak. Logları izleyerek scraping işlemini takip edebilirsin.

**Beklenen çıktı:**
```
🚀 Shopify Theme Scraper
========================

1️⃣ Theme Engine kontrolü...
{"success":true,"count":5,"themes":[...]}

2️⃣ Materia temasını scrape ediliyor...
{"success":true,"message":"Scraping started"}

⏳ Scraping başladı, 60 saniye bekleniyor...

3️⃣ Materia tema dosyaları:
total 2.5M
-rw-r--r-- 1 root root 2.3M index.html
-rw-r--r-- 1 root root 150K preview.png
...

✅ Scraping tamamlandı!
```

---

## 🐛 Sorun Giderme

### SSH Key Authentication Failed

**Hata:**
```
ssh: handshake failed: ssh: unable to authenticate
```

**Çözüm:**
1. Public key VDS'de `~/.ssh/authorized_keys` dosyasına eklenmiş mi kontrol et
2. Dosya izinleri doğru mu: `chmod 600 ~/.ssh/authorized_keys`
3. SSH service çalışıyor mu: `systemctl status sshd`

### Permission Denied

**Hata:**
```
Permission denied (publickey)
```

**Çözüm:**
1. GitHub Secret'taki SSH key doğru mu kontrol et
2. Private key'in başında/sonunda boşluk var mı kontrol et
3. Key formatı doğru mu: `-----BEGIN OPENSSH PRIVATE KEY-----` ile başlamalı

### Connection Timeout

**Hata:**
```
dial tcp: i/o timeout
```

**Çözüm:**
1. VDS IP adresi doğru mu: `141.98.48.172`
2. Port doğru mu: `4383`
3. VDS firewall SSH portunu engelliyor mu kontrol et

---

## 🎉 Başarılı Olursa

Artık GitHub Actions her çalıştırıldığında:
- ✅ Şifre sormadan VDS'ye bağlanacak
- ✅ Otomatik olarak Shopify temalarını scrape edecek
- ✅ Tema dosyalarını VDS'ye kaydedecek
- ✅ Logları GitHub'da görebileceksin

**Tek yapman gereken: GitHub'da "Run workflow" butonuna tıklamak!**

---

## 📞 Yardım

Sorun yaşarsan:
1. GitHub Actions loglarını kontrol et
2. VDS'ye SSH ile bağlan ve manuel test et
3. `MANUAL_SCRAPE_GUIDE.md` dosyasına bak

**Başarılar! 🚀**
