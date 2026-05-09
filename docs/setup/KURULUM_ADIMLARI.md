# Ödelink Shop Kurulum Adımları

## ✅ Tamamlanan Adımlar
1. ✅ Node.js v24.14.1 yüklendi
2. ✅ npm 11.11.0 yüklendi
3. ✅ Backend bağımlılıkları yüklendi (607 paket)
4. ✅ Frontend bağımlılıkları yüklendi (1528 paket)
5. ✅ Backend .env dosyası oluşturuldu

## ⏳ Yapılması Gerekenler

### 1. PostgreSQL Kurulumu

**İndirme Linki:** https://www.postgresql.org/download/windows/

**Kurulum Ayarları:**
- Şifre: `postgres`
- Port: `5432`
- Locale: `Turkish, Turkey` veya `English, United States`

**Kurulum Sonrası:**

PowerShell'i **Yönetici olarak** açın ve şu komutları çalıştırın:

```powershell
# PostgreSQL'e bağlan
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# Veritabanını oluştur (psql içinde)
CREATE DATABASE odelink_shop;
\q
```

### 2. Backend Sunucusunu Başlatma

Yeni bir PowerShell penceresi açın:

```powershell
cd "c:\odelink-shop-main (1)\odelink-shop-main\backend"
npm start
```

Backend şu adreste çalışacak: http://localhost:5000

### 3. Frontend Sunucusunu Başlatma

Başka bir PowerShell penceresi açın:

```powershell
cd "c:\odelink-shop-main (1)\odelink-shop-main\frontend"
npm start
```

Frontend şu adreste çalışacak: http://localhost:3000

### 4. Siteyi Test Etme

Tarayıcınızda http://localhost:3000 adresine gidin ve:
- Kayıt ol butonuna tıklayın
- Yeni bir hesap oluşturun
- Giriş yapın

## 🔧 Alternatif: Docker ile Kurulum (Önerilen)

Eğer Docker Desktop yüklüyse:

```powershell
cd "c:\odelink-shop-main (1)\odelink-shop-main"
docker-compose up -d postgres
```

Bu komut PostgreSQL'i otomatik olarak başlatır.

## 📝 Notlar

- Backend .env dosyası zaten oluşturuldu
- PostgreSQL şifresi: `postgres` (development için)
- Veritabanı adı: `odelink_shop`
- Backend port: 5000
- Frontend port: 3000

## ❓ Sorun Giderme

### "npm: command not found" hatası
Kiro'yu (VS Code) tamamen kapatıp yeniden açın.

### "PostgreSQL bağlantı hatası"
PostgreSQL servisinin çalıştığından emin olun:
```powershell
Get-Service -Name postgresql*
```

### Port zaten kullanımda
Başka bir uygulama 5000 veya 3000 portunu kullanıyor olabilir:
```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```
