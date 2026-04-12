# Odelink Shop - Profesyonel Shopier Vitrin Platformu

Odelink Shop, Shopier mağaza sahiplerinin herhangi bir şirket kurma zorunluluğu olmadan saniyeler içinde profesyonel e-ticaret web siteleri oluşturmalarını sağlayan kapsamlı bir SaaS platformudur.

## 🚀 Temel Özellikler

- **Hızlı Kurulum:** Sadece Shopier mağaza linki ile 3 dakikada hazır web sitesi.
- **Otomatik Katalog:** Ürünler, kategoriler ve görseller Shopier'dan otomatik çekilir.
- **Modern Tasarım:** Mobil uyumlu, hızlı ve dönüşüm odaklı vitrin sayfaları.
- **Gelişmiş Analitik:** Ziyaretçi takibi, sayfa görüntüleme ve tıklama raporları.
- **Abonelik Sistemi:** Standart ve Profesyonel paketlerle yönetim.
- **Özel Alan Adı:** Kullanıcıların kendi domainlerini bağlayabilme imkanı.

## 🛠️ Teknoloji Yığını

- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Veritabanı:** PostgreSQL
- **Otomasyon:** Puppeteer (Shopier Scraping), Sharp (Görsel Optimizasyonu)

## 📦 VPS Kurulum Rehberi (Önerilen: Ubuntu 24.04 LTS)

### 1. Sistem Hazırlığı
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git curl nginx postgresql -y
```

### 2. Node.js Kurulumu (NVM ile)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### 3. Projeyi Klonlama ve Bağımlılıklar
```bash
git clone https://github.com/odelinkshop/odelink-shop.git
cd odelink-shop
npm run install:all
```

### 4. Ortam Değişkenleri (.env)
`backend` dizini altında bir `.env` dosyası oluşturun ve gerekli bilgileri (DB_URL, JWT_SECRET, EMAIL_CONFIG vb.) girin.

### 5. Uygulamayı Başlatma (PM2 ile)
```bash
npm install pm2 -g
pm2 start backend/server.js --name odelink-backend
```

### 6. Nginx Yapılandırması
Frontend build dosyalarını sunmak ve API isteklerini backend'e yönlendirmek için Nginx konfigürasyonunu yapın.

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
