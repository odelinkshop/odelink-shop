# 🚀 Hızlı Deploy Rehberi

## Adım 1: GitHub Repository Oluştur

1. https://github.com/new adresine git
2. Repository adı: `odelink-shop`
3. Private seç
4. Create repository

## Adım 2: Kodu GitHub'a Yükle

PowerShell'de şu komutları çalıştır:

```powershell
cd "C:\odelink-shop-main (1)\odelink-shop-main"

# Git repository başlat
git init
git add .
git commit -m "Initial commit - Odelink Shop"

# GitHub'a bağlan (KULLANICI_ADIN yerine kendi GitHub kullanıcı adını yaz)
git remote add origin https://github.com/KULLANICI_ADIN/odelink-shop.git
git branch -M main
git push -u origin main
```

## Adım 3: GitHub Secrets Ekle

GitHub repo > Settings > Secrets and variables > Actions > New repository secret

Eklenecek secrets:

```
VDS_HOST=VDS_IP_ADRESI
VDS_USER=root
VDS_PASSWORD=VDS_SIFREN
VDS_PORT=4383

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gmail_adresin@gmail.com
EMAIL_PASS=gmail_app_password

JWT_SECRET=super_secret_key_buraya_random_string
PASSWORD_RESET_SECRET=password_reset_secret_key
GOOGLE_CLIENT_ID=google_client_id_buraya

CLOUDFLARE_API_TOKEN=cloudflare_token
CLOUDFLARE_ZONE_ID=cloudflare_zone_id
SHOPIER_API_TOKEN=shopier_token
```

## Adım 4: Deploy Başlat

GitHub repo > Actions > Deploy to VDS > Run workflow

Veya:

```powershell
git add .
git commit -m "Deploy to production"
git push
```

## Adım 5: VDS'de Kontrol

SSH ile VDS'e bağlan:

```bash
ssh root@VDS_IP -p 4383
cd ~/odelink-shop
docker ps
docker logs odelink_backend
```

Site: https://www.odelink.shop

---

## Hızlı Komutlar

### Backend logları
```bash
docker logs odelink_backend -f
```

### Backend yeniden başlat
```bash
docker compose restart backend
```

### Veritabanı kontrol
```bash
docker exec -it odelink_postgres psql -U postgres -d odelink_shop
```

### Tüm servisleri yeniden başlat
```bash
docker compose down
docker compose up -d
```
