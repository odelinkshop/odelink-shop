# Implementation Plan: Framer WEARIX Theme Integration

## Overview

Bu plan, Framer'da hazırlanan WEARIX temasının Odelink projesine entegrasyonunu adım adım gerçekleştirir. Mevcut backend yapısı (Node.js/Express) üzerine tema desteği eklenecek, site oluşturma wizard'ı güncellenecek ve Shopier ürünleri dinamik olarak temaya enjekte edilecektir.

## Tasks

- [x] 1. Tema dosyalarını indirme ve saklama altyapısını oluştur
  - [x] 1.1 Theme Scraper Service'i oluştur
    - backend/services/themeScraperService.js dosyasını oluştur
    - scrapeFramerSite() metodunu implement et (wget kullanarak)
    - validateThemeFiles() metodunu implement et
    - Hata yönetimi ve loglama ekle
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 1.2 Tema klasör yapısını oluştur
    - backend/themes/wearix/ klasörünü oluştur
    - Alt klasörleri oluştur (css/, js/, images/, fonts/)
    - .gitkeep dosyalarını ekle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 1.3 Theme Scraper için unit test yaz
    - backend/tests/theme-scraper-service.test.js oluştur
    - scrapeFramerSite() metodunu test et
    - validateThemeFiles() metodunu test et
    - Hata senaryolarını test et
    - _Requirements: 1.1, 1.5_

- [x] 2. Veritabanı şemasını güncelle
  - [x] 2.1 Migration script'i oluştur
    - backend/migrations/update-theme-column.sql dosyasını oluştur
    - theme sütununu VARCHAR(50)'ye genişlet
    - Default değeri NULL olarak ayarla
    - Index oluştur (idx_sites_theme)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.2 Migration'ı çalıştır ve doğrula
    - Migration script'ini production'da çalıştır
    - Mevcut sitelerin theme değerini kontrol et
    - Index'in oluşturulduğunu doğrula
    - _Requirements: 3.1, 3.4_

- [x] 3. Product Injector Service'i oluştur
  - [x] 3.1 Product Injector Service'i implement et
    - backend/services/productInjectorService.js dosyasını oluştur
    - injectProducts() metodunu implement et
    - formatProducts() metodunu implement et
    - XSS sanitization ekle (escapeHtml fonksiyonu)
    - JSON.stringify ile güvenli serialize et
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 10.1, 10.3_
  
  - [ ]* 3.2 Product Injector için unit test yaz
    - backend/tests/product-injector-service.test.js oluştur
    - injectProducts() metodunu test et
    - formatProducts() metodunu test et
    - XSS sanitization'ı test et
    - Boş ürün array'i senaryosunu test et
    - _Requirements: 5.8, 10.1_

- [ ] 4. Checkpoint - Temel servisleri test et
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Site Renderer'ı güncelle (WEARIX tema desteği)
  - [x] 5.1 WEARIX tema handler fonksiyonunu oluştur
    - server.js içinde handleWearixTheme() fonksiyonunu yaz
    - Tema HTML'ini oku (backend/themes/wearix/index.html)
    - Shopier ürünlerini çek (mevcut API kullanarak)
    - Product Injector ile ürünleri HTML'e enjekte et
    - Cache header'ları ayarla (5 dakika)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.5, 6.6, 6.7, 8.1, 8.2, 8.5, 8.6_
  
  - [x] 5.2 /s/:subdomain route'unu güncelle
    - Mevcut route'u genişlet (basit HTML yerine tema desteği ekle)
    - site.theme === 'wearix' kontrolü ekle
    - handleWearixTheme() fonksiyonunu çağır
    - Fallback: theme=NULL ise basit HTML göster
    - Hata yönetimi ekle (tema dosyası bulunamazsa fallback)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8, 9.3_
  
  - [x] 5.3 Statik dosya serving'i ekle
    - CSS, JS, images, fonts için static file handler ekle
    - Path traversal koruması ekle (güvenlik)
    - Content-Type header'larını ayarla
    - Cache header'ları ekle (1 gün)
    - _Requirements: 6.5, 6.7, 8.1, 10.6_
  
  - [ ]* 5.4 Site Renderer için integration test yaz
    - backend/tests/site-renderer-wearix.test.js oluştur
    - /s/:subdomain endpoint'ini test et (WEARIX temalı site)
    - Statik dosya serving'i test et
    - Fallback senaryosunu test et (theme=NULL)
    - 404 senaryosunu test et (site bulunamadı)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Güvenlik önlemlerini ekle
  - [x] 6.1 XSS koruması ekle
    - productInjectorService.js içinde sanitizeProductData() fonksiyonu ekle
    - escapeHtml() helper fonksiyonu ekle
    - Ürün verilerini sanitize et (name, description)
    - URL'leri sanitize et (sanitizeUrl fonksiyonu)
    - _Requirements: 10.1, 10.3_
  
  - [x] 6.2 SQL Injection koruması ekle
    - validateSubdomain() fonksiyonu ekle
    - Subdomain'i regex ile validate et (sadece alphanumeric ve hyphen)
    - _Requirements: 10.2_
  
  - [x] 6.3 Content Security Policy header'ları ekle
    - handleWearixTheme() içinde CSP header'ları ayarla
    - X-Frame-Options header'ı ekle
    - X-Content-Type-Options header'ı ekle
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 6.4 Güvenlik testleri yaz
    - backend/tests/security-wearix.test.js oluştur
    - XSS korumasını test et
    - SQL Injection korumasını test et
    - Path traversal korumasını test et
    - _Requirements: 10.1, 10.2, 10.6_

- [ ] 7. Checkpoint - Güvenlik ve rendering'i test et
  - Ensure all tests pass, ask the user if questions arise.

- [-] 8. Frontend: Site Builder Wizard'ına tema seçimi ekle
  - [x] 8.1 Tema seçim UI component'i oluştur
    - Site builder wizard'a yeni adım ekle (Step 2: Tema Seçimi)
    - "Tema Kullan" checkbox'ı ekle (varsayılan: kapalı)
    - WEARIX tema kartı oluştur (önizleme görseli + açıklama)
    - Tema seçim state'ini yönet
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 8.2 Site oluşturma API çağrısını güncelle
    - POST /api/sites endpoint'ine theme parametresi ekle
    - settings.theme = 'wearix' olarak gönder
    - Backend'de theme değerini veritabanına kaydet
    - _Requirements: 4.8_
  
  - [ ]* 8.3 Frontend tema seçimi için test yaz
    - Tema seçim component'ini test et
    - Checkbox toggle'ı test et
    - API çağrısında theme parametresinin gönderildiğini test et
    - _Requirements: 4.1, 4.5, 4.6, 4.7, 4.8_

- [x] 9. Hata yönetimi ve loglama ekle
  - [x] 9.1 Theme Scraper hata yönetimi
    - scrapeFramerSite() içinde try-catch ekle
    - Network hatalarını yakala ve logla
    - File system hatalarını yakala ve logla
    - _Requirements: 9.1, 9.2_
  
  - [x] 9.2 Product Injector hata yönetimi
    - injectProducts() içinde try-catch ekle
    - Shopier API timeout'u handle et (10 saniye)
    - 3 deneme mekanizması ekle
    - Boş array fallback ekle
    - _Requirements: 9.2, 9.6, 9.7_
  
  - [x] 9.3 Site Renderer hata yönetimi
    - handleWearixTheme() içinde try-catch ekle
    - Tema dosyası bulunamazsa fallback HTML göster
    - Her render işlemini logla
    - 500 hatası döndür ve logla
    - _Requirements: 9.3, 9.4_
  
  - [ ]* 9.4 Hata yönetimi testleri yaz
    - backend/tests/error-handling-wearix.test.js oluştur
    - Theme Scraper hata senaryolarını test et
    - Product Injector timeout senaryosunu test et
    - Site Renderer fallback senaryosunu test et
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 10. Performans optimizasyonu ekle
  - [x] 10.1 HTML caching mekanizması ekle
    - In-memory cache Map'i oluştur (htmlCache)
    - getCachedHtml() fonksiyonu ekle
    - setCachedHtml() fonksiyonu ekle
    - Cache süresini 5 dakika olarak ayarla
    - _Requirements: 8.5, 8.6_
  
  - [x] 10.2 Statik dosya cache header'ları ekle
    - Static file handler'a Cache-Control header'ı ekle (1 gün)
    - ETag header'ı ekle
    - _Requirements: 8.1_
  
  - [x] 10.3 Ürün verisi optimizasyonu
    - minimizeProductData() fonksiyonu ekle (opsiyonel)
    - JSON field isimlerini kısalt (id->i, name->n, price->p)
    - _Requirements: 8.3_
  
  - [ ]* 10.4 Performans testleri yaz
    - backend/tests/performance-wearix.test.js oluştur
    - Cache hit rate'i test et
    - Rendering latency'sini ölç
    - _Requirements: 8.5, 8.6_

- [ ] 11. Checkpoint - Tüm testleri çalıştır
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Manuel deployment ve doğrulama
  - [x] 12.1 Framer sitesini manuel olarak indir
    - Lokal olarak wget/httrack ile https://odelinktheme.framer.ai sitesini indir
    - İndirilen dosyaları backend/themes/wearix/ klasörüne kopyala
    - Dosya yapısını doğrula (index.html, css/, js/, images/, fonts/)
    - Git'e commit et
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 12.2 Production'a deploy et
    - Backend kod değişikliklerini deploy et
    - Frontend wizard güncellemesini deploy et
    - Migration script'ini çalıştır
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 12.3 Smoke test yap
    - Yeni site oluştur ve WEARIX temasını seç
    - /s/:subdomain URL'ine git ve temayı görüntüle
    - Shopier ürünlerinin göründüğünü doğrula
    - Statik dosyaların (CSS/JS/images) yüklendiğini doğrula
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.5_

- [ ] 13. Final checkpoint - Production doğrulama
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Manual deployment (Task 12) requires developer intervention for theme scraping
- Theme files must be committed to Git before deployment
- Migration script must be run on production database before code deployment
