# Odelink Shop Proje Analiz Raporu

**Yazar:** Manus AI
**Tarih:** 9 Nisan 2026

## 1. Proje Özeti ve Amacı

**Odelink Shop**, Shopier mağaza sahiplerinin herhangi bir şirket kurma zorunluluğu olmadan saniyeler içinde profesyonel e-ticaret web siteleri oluşturmalarını sağlayan kapsamlı bir platformdur. Kullanıcılar sadece Shopier mağaza bağlantılarını girerek ürünlerini, kategorilerini ve mağaza bilgilerini otomatik olarak çeken, modern tasarımlı ve mobil uyumlu bir web sitesine sahip olabilmektedir.

Proje, temelde bir "Website Builder" (Web Sitesi Oluşturucu) ve "SaaS" (Hizmet Olarak Yazılım) modelinde kurgulanmıştır. Kullanıcıların kendi özel alan adlarını bağlayabildiği, detaylı analitik verilerini takip edebildiği ve abonelik sistemiyle yönetilen bir altyapıya sahiptir.

## 2. Teknoloji Yığını ve Mimari

Proje, modern web geliştirme standartlarına uygun olarak **Monorepo** benzeri bir yapıda, `frontend` ve `backend` dizinleri altında iki ana bileşenden oluşmaktadır.

### 2.1. Backend (Sunucu Tarafı)
Backend, Node.js ve Express.js üzerine inşa edilmiş güçlü bir REST API sunmaktadır.

*   **Çalışma Ortamı:** Node.js
*   **Web Çerçevesi:** Express.js
*   **Veritabanı:** PostgreSQL (pg modülü ile bağlanılmış)
*   **Kimlik Doğrulama:** JWT (JSON Web Token) ve bcryptjs ile şifreleme. Ayrıca Google OAuth entegrasyonu mevcuttur.
*   **Web Scraping & Otomasyon:** Shopier mağazalarından ürün verilerini çekmek için `axios`, `cheerio` ve `puppeteer-core` (Chromium tabanlı) kullanılmaktadır.
*   **Görsel İşleme:** `sharp` kütüphanesi ile görsel optimizasyonları yapılmaktadır.
*   **Ödeme Altyapısı:** Stripe entegrasyonu (`stripe` paketi) bulunmaktadır.
*   **E-posta Gönderimi:** `nodemailer` kullanılarak destek ve bildirim e-postaları yönetilmektedir.
*   **Güvenlik:** `helmet`, `cors`, `express-rate-limit` gibi güvenlik ve hız sınırlama katmanları aktiftir.

### 2.2. Frontend (İstemci Tarafı)
Frontend, React tabanlı modern bir tek sayfa uygulamasıdır (SPA).

*   **Çerçeve:** React 18 (Create React App tabanlı)
*   **Stillendirme:** Tailwind CSS ve PostCSS
*   **Yönlendirme:** React Router DOM
*   **Animasyonlar:** Framer Motion
*   **İkonlar:** Lucide React
*   **HTTP İstemcisi:** Axios

### 2.3. Dağıtım ve DevOps
Proje dizininde yer alan çok sayıda `.bat`, `.ps1` ve `.sh` betiği, projenin farklı ortamlara (VPS, Render, Railway, Vercel, Netlify) dağıtımını otomatize etmek için hazırlanmıştır. `docker-compose.yml` ve `Dockerfile.postgres` dosyaları, projenin konteynerize edilmiş ortamlarda da çalışabileceğini göstermektedir.

## 3. Temel İşlevsellikler ve Modüller

### 3.1. Otomatik Site Oluşturma (Auto Build Job Worker)
Projenin en kritik özelliği, Shopier URL'sinden otomatik site oluşturmasıdır. `backend/services/siteCreationJobWorker.js` dosyası bu süreci yönetir.
Kullanıcı bir Shopier linki girdiğinde sistem arka planda bir iş (job) başlatır. Önce hızlıca temel ürün listesini çeker ve siteyi yayına alır. Ardından arka planda ürün detaylarını (açıklamalar, varyantlar, yüksek çözünürlüklü görseller) çekerek veritabanını günceller. Bu asenkron yapı, kullanıcının bekleme süresini minimize eder.

### 3.2. Shopier Katalog Servisi
`backend/services/shopierCatalogService.js` dosyası, Shopier'dan veri çekme işlemini üstlenir. Shopier'ın API'si kapalı veya kısıtlı olduğunda sistem otomatik olarak "Scraping" (Web Kazıma) yöntemine geçer. Rate limit (429) hatalarına karşı akıllı bekleme (retry) mekanizmaları ve Cloudflare Worker Proxy desteği kodlanmıştır.

### 3.3. Abonelik ve Paket Yönetimi
`backend/config/planCatalog.js` ve `backend/models/Subscription.js` dosyaları abonelik sistemini yönetir. Sistemde iki temel paket bulunmaktadır:
*   **Standart Paket:** Aylık 299₺. 3 site limiti, temel analitik, standart destek.
*   **Profesyonel Paket:** Yıllık 399₺. 10 site limiti, aylık rapor indirme, VIP destek.
Kullanıcıların yetkileri (capabilities) bu paketlere göre dinamik olarak belirlenir ve API uç noktalarında `requireAccess` ara yazılımı ile denetlenir.

### 3.4. Analitik ve Metrikler
`backend/models/AnalyticsStore.js` ve `backend/routes/metrics.js` dosyaları, oluşturulan sitelerin trafiğini ölçer.
*   **Ziyaretçi Kalp Atışı (Heartbeat):** Sitede aktif olan ziyaretçileri anlık olarak takip eder.
*   **Sayfa Görüntüleme ve Tekil Ziyaretçi:** Günlük bazda sayfa görüntüleme ve tekil ziyaretçi sayılarını kaydeder.
*   **Tıklama Takibi:** Ürünlere yapılan tıklamaları ölçümleyerek mağaza sahibine raporlar.

### 3.5. Yönetim Paneli (Admin)
`backend/routes/admin.js` dosyası, sistem yöneticisinin tüm platformu kontrol etmesini sağlar. Kullanıcıları, siteleri, abonelikleri yönetme, IP loglarını inceleme ve acil durumlarda sistemi sıfırlama (reset-owner) gibi yüksek yetkili işlemleri barındırır. Güvenlik için 6 haneli dinamik erişim kodları ve misafir erişim süreleri (guest access) tanımlanmıştır.

## 4. Veritabanı Şeması (PostgreSQL)

Projede kullanılan temel veritabanı tabloları şunlardır:
*   **users:** Kullanıcı hesap bilgileri.
*   **sites:** Oluşturulan mağaza siteleri, subdomain bilgileri ve JSONB formatında site ayarları (tema, ürünler, politikalar).
*   **subscriptions / user_subscriptions:** Abonelik paketleri ve kullanıcıların aktif abonelik durumları.
*   **auto_build_jobs:** Arka planda çalışan site oluşturma görevlerinin durumları ve logları.
*   **site_analytics / analytics_events:** Günlük trafik istatistikleri ve detaylı olay kayıtları.
*   **admin_settings:** Sistem genel ayarları ve yönetici kimlik bilgileri.

## 5. Güvenlik ve Optimizasyon

*   **Görsel Optimizasyonu:** `backend/services/imageOptimizationService.js` dosyası, Shopier'dan çekilen görsellerin URL'lerini manipüle ederek daha yüksek çözünürlüklü versiyonlarını elde eder ve HTTPS protokolüne zorlar.
*   **Rate Limiting:** API uç noktalarında aşırı isteği engellemek için `express-rate-limit` kullanılmıştır.
*   **Veri Doğrulama:** Kullanıcıdan gelen veriler `Joi` kütüphanesi ile sıkı bir şekilde doğrulanmaktadır.
*   **Şifreleme:** Kullanıcı şifreleri ve yönetici erişim kodları `bcryptjs` ile hashlenerek saklanmaktadır.

## 6. Sonuç ve Değerlendirme

Odelink Shop, e-ticaret dünyasına adım atmak isteyen ancak teknik bilgiye veya şirket kurma bütçesine sahip olmayan kullanıcılar için son derece yenilikçi ve pratik bir çözüm sunmaktadır. Projenin mimarisi, asenkron iş kuyrukları (job queues), detaylı analitik altyapısı ve esnek abonelik modeli ile ölçeklenmeye (scalability) oldukça uygundur. Özellikle Shopier entegrasyonunun hem API hem de Scraping yöntemleriyle yedekli (fallback) çalışması, sistemin kararlılığını artıran önemli bir mühendislik başarısıdır.
