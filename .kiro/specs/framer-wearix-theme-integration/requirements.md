# Requirements Document

## Introduction

Bu doküman, Framer'da hazırlanan WEARIX temasının (https://odelinktheme.framer.ai) Odelink projesine entegrasyonunu tanımlar. WEARIX, modern giyim e-ticaret sektörü için tasarlanmış premium bir temadır. Entegrasyon, temanın orijinalliğini %100 koruyarak, Shopier ürünlerinin dinamik olarak tema içine enjekte edilmesini ve site oluşturma wizard'ında seçilebilir olmasını sağlayacaktır.

## Glossary

- **WEARIX_Theme**: Framer'da hazırlanan modern giyim e-ticaret teması (https://odelinktheme.framer.ai)
- **Theme_Scraper**: Framer sitesini indiren web scraping servisi
- **Theme_Storage**: İndirilen tema dosyalarının saklandığı backend/themes/wearix/ klasörü
- **Site_Builder**: Kullanıcıların yeni site oluşturduğu wizard arayüzü
- **Product_Injector**: Shopier ürünlerini temaya dinamik olarak ekleyen servis
- **Site_Renderer**: /s/:subdomain route'unda siteleri serve eden sistem
- **Shopier_API**: Shopier ürün verilerini sağlayan API servisi
- **Database**: PostgreSQL veritabanı (sites tablosu)

## Requirements

### Requirement 1: Framer Sitesini İndirme

**User Story:** Geliştirici olarak, Framer'da hazırlanan WEARIX temasını projeye entegre edebilmek için, Framer sitesini tüm varlıklarıyla (HTML, CSS, JS, görseller) indirmek istiyorum.

#### Acceptance Criteria

1. THE Theme_Scraper SHALL wget veya httrack kullanarak https://odelinktheme.framer.ai sitesini indirebilmeli
2. WHEN indirme işlemi başlatıldığında, THE Theme_Scraper SHALL tüm HTML, CSS, JavaScript, görsel ve font dosyalarını indirmeli
3. WHEN indirme tamamlandığında, THE Theme_Scraper SHALL indirilen dosyaları backend/themes/wearix/ klasörüne yerleştirmeli
4. THE Theme_Scraper SHALL göreceli (relative) URL'leri koruyarak dosya yapısını bozmamalı
5. WHEN bir dosya indirilemediğinde, THE Theme_Scraper SHALL hata mesajını loglayıp işleme devam etmeli
6. THE Theme_Scraper SHALL indirme işleminin başarılı olup olmadığını raporlamalı

### Requirement 2: Tema Dosyalarının Saklanması

**User Story:** Geliştirici olarak, indirilen tema dosyalarının düzenli ve erişilebilir şekilde saklanmasını istiyorum, böylece site oluşturulurken hızlıca serve edilebilsin.

#### Acceptance Criteria

1. THE Theme_Storage SHALL backend/themes/wearix/ klasör yapısını oluşturmalı
2. THE Theme_Storage SHALL index.html dosyasını kök dizinde bulundurmalı
3. THE Theme_Storage SHALL CSS dosyalarını orijinal klasör yapısında saklamalı
4. THE Theme_Storage SHALL JavaScript dosyalarını orijinal klasör yapısında saklamalı
5. THE Theme_Storage SHALL görsel dosyalarını orijinal klasör yapısında saklamalı
6. THE Theme_Storage SHALL font dosyalarını orijinal klasör yapısında saklamalı
7. WHEN dosya yapısı oluşturulduğunda, THE Theme_Storage SHALL .gitkeep dosyası eklemeli (boş klasörler için)

### Requirement 3: Veritabanı Şeması Güncelleme

**User Story:** Geliştirici olarak, sitelerin hangi temayı kullandığını takip edebilmek için, sites tablosuna theme sütunu eklemek istiyorum.

#### Acceptance Criteria

1. THE Database SHALL sites tablosuna theme VARCHAR(50) sütunu eklemeli
2. THE Database SHALL theme sütununa varsayılan değer olarak 'wearix' atamalı
3. THE Database SHALL mevcut sitelerin theme değerini NULL olarak bırakmalı (eski siteler tema kullanmıyor)
4. THE Database SHALL theme sütununa index oluşturmalı (performans için)
5. WHEN migration çalıştırıldığında, THE Database SHALL hata durumunda rollback yapabilmeli

### Requirement 4: Site Oluşturma Wizard'ına Tema Seçimi Ekleme

**User Story:** Kullanıcı olarak, yeni site oluştururken WEARIX temasını seçebilmek istiyorum, böylece modern bir e-ticaret sitesi oluşturabilirim.

#### Acceptance Criteria

1. THE Site_Builder SHALL tema seçim adımını wizard'a eklemeli
2. THE Site_Builder SHALL WEARIX temasını önizleme görseli ile göstermeli
3. THE Site_Builder SHALL tema açıklamasını göstermeli ("Modern Giyim E-ticaret - Premium tasarım")
4. WHEN kullanıcı WEARIX temasını seçtiğinde, THE Site_Builder SHALL seçimi vurgulayarak göstermeli
5. THE Site_Builder SHALL "Tema Kullanma" checkbox'ı eklemeli (varsayılan: kapalı)
6. WHEN checkbox işaretlendiğinde, THE Site_Builder SHALL tema seçim alanını göstermeli
7. WHEN checkbox işaretlenmediğinde, THE Site_Builder SHALL tema seçim alanını gizlemeli
8. WHEN site oluşturulduğunda, THE Site_Builder SHALL seçilen temayı veritabanına kaydetmeli

### Requirement 5: Shopier Ürünlerini Temaya Enjekte Etme

**User Story:** Kullanıcı olarak, Shopier mağazamdaki ürünlerin WEARIX temasında otomatik olarak görünmesini istiyorum, böylece manuel ürün ekleme yapmama gerek kalmasın.

#### Acceptance Criteria

1. WHEN bir site WEARIX teması ile oluşturulduğunda, THE Product_Injector SHALL Shopier_API'den ürünleri çekmeli
2. THE Product_Injector SHALL ürün verilerini JSON formatında hazırlamalı
3. THE Product_Injector SHALL ürün verilerini tema HTML'ine JavaScript değişkeni olarak enjekte etmeli
4. THE Product_Injector SHALL ürün görsellerini Shopier CDN URL'leri ile bağlamalı
5. THE Product_Injector SHALL ürün fiyatlarını Türk Lirası formatında göstermeli
6. THE Product_Injector SHALL ürün linklerini Shopier satın alma sayfalarına yönlendirmeli
7. WHEN ürün verisi boş olduğunda, THE Product_Injector SHALL placeholder mesajı göstermeli
8. THE Product_Injector SHALL ürün enjeksiyonunu sunucu tarafında (server-side) yapmalı

### Requirement 6: Site Rendering Sistemi

**User Story:** Ziyaretçi olarak, /s/:subdomain URL'ine gittiğimde WEARIX temalı siteyi görmek istiyorum, böylece ürünleri inceleyip satın alabilirim.

#### Acceptance Criteria

1. WHEN /s/:subdomain isteği geldiğinde, THE Site_Renderer SHALL subdomain'i veritabanında aramalı
2. WHEN site bulunduğunda ve theme='wearix' ise, THE Site_Renderer SHALL WEARIX temasını serve etmeli
3. WHEN site bulunduğunda ve theme=NULL ise, THE Site_Renderer SHALL basit HTML mesajı göstermeli
4. WHEN site bulunamadığında, THE Site_Renderer SHALL 404 hatası döndürmeli
5. THE Site_Renderer SHALL statik dosyaları (CSS, JS, görseller) doğru path'lerle serve etmeli
6. THE Site_Renderer SHALL tema dosyalarını cache'lemeli (performans için)
7. THE Site_Renderer SHALL Content-Type header'larını doğru ayarlamalı
8. WHEN site inactive durumda ise, THE Site_Renderer SHALL "Site geçici olarak kapalı" mesajı göstermeli

### Requirement 7: Tema Orijinalliğini Koruma

**User Story:** Kullanıcı olarak, Framer'da hazırladığım temanın %100 orijinalliğinin korunmasını istiyorum, böylece tasarımım bozulmadan yayınlansın.

#### Acceptance Criteria

1. THE Theme_Scraper SHALL Framer'ın ürettiği CSS class isimlerini değiştirmemeli
2. THE Theme_Scraper SHALL Framer'ın JavaScript kodlarını değiştirmemeli
3. THE Product_Injector SHALL tema HTML'ine müdahale ederken mevcut yapıyı bozmamalı
4. THE Product_Injector SHALL ürün enjeksiyonunu özel bir <script> tag'i içinde yapmalı
5. THE Product_Injector SHALL Framer'ın kendi JavaScript'lerini override etmemeli
6. THE Site_Renderer SHALL tema dosyalarını olduğu gibi serve etmeli (minify/uglify yapmamalı)
7. WHEN tema güncellendiğinde, THE Theme_Storage SHALL eski dosyaları yedeklemeli

### Requirement 8: Performans ve Optimizasyon

**User Story:** Ziyaretçi olarak, WEARIX temalı sitenin hızlı yüklenmesini istiyorum, böylece iyi bir kullanıcı deneyimi yaşayabilirim.

#### Acceptance Criteria

1. THE Site_Renderer SHALL statik dosyalar için HTTP cache header'ları ayarlamalı (max-age: 1 gün)
2. THE Site_Renderer SHALL gzip compression kullanmalı
3. THE Product_Injector SHALL ürün verilerini minimize edilmiş JSON olarak enjekte etmeli
4. THE Theme_Storage SHALL görselleri optimize etmemeli (Framer'ın kendi optimizasyonunu korumak için)
5. WHEN aynı site birden fazla kez istendiğinde, THE Site_Renderer SHALL render edilmiş HTML'i cache'lemeli
6. THE Site_Renderer SHALL cache süresini 5 dakika olarak ayarlamalı
7. WHEN ürünler güncellendiğinde, THE Site_Renderer SHALL ilgili site cache'ini temizlemeli

### Requirement 9: Hata Yönetimi ve Loglama

**User Story:** Geliştirici olarak, tema entegrasyonunda oluşan hataları takip edebilmek istiyorum, böylece sorunları hızlıca çözebilirim.

#### Acceptance Criteria

1. WHEN Theme_Scraper hata aldığında, THE Theme_Scraper SHALL hata detaylarını console'a loglamalı
2. WHEN Product_Injector ürün çekemediğinde, THE Product_Injector SHALL hata mesajını loglamalı ve boş array döndürmeli
3. WHEN Site_Renderer tema dosyası bulamadığında, THE Site_Renderer SHALL 500 hatası döndürmeli ve loglamalı
4. THE Site_Renderer SHALL her site render işlemini loglayarak takip edilebilir hale getirmeli
5. WHEN veritabanı hatası oluştuğunda, THE Database SHALL hata detaylarını loglamalı
6. THE Product_Injector SHALL Shopier API timeout durumunda 10 saniye beklemeli ve tekrar denemeli
7. WHEN 3 deneme başarısız olduğunda, THE Product_Injector SHALL hata fırlatmalı

### Requirement 10: Güvenlik

**User Story:** Kullanıcı olarak, WEARIX temalı sitemin güvenli olmasını istiyorum, böylece ziyaretçilerim güvenle alışveriş yapabilsin.

#### Acceptance Criteria

1. THE Site_Renderer SHALL XSS saldırılarına karşı ürün verilerini sanitize etmeli
2. THE Site_Renderer SHALL SQL injection'a karşı subdomain parametresini validate etmeli
3. THE Product_Injector SHALL Shopier API yanıtlarını validate etmeli
4. THE Site_Renderer SHALL Content-Security-Policy header'ı ayarlamalı
5. THE Site_Renderer SHALL X-Frame-Options header'ı ayarlamalı (clickjacking koruması)
6. THE Theme_Storage SHALL tema dosyalarına yazma izinlerini kısıtlamalı
7. WHEN kullanıcı kendi sitesi olmayan bir subdomain'e erişmeye çalıştığında, THE Site_Renderer SHALL erişimi engellemeli

## Technical Notes

### Web Scraping Yaklaşımı

Framer'ın ücretsiz planında HTML export özelliği olmadığı için web scraping kullanılacaktır:

```bash
# wget ile indirme
wget --mirror --convert-links --adjust-extension --page-requisites --no-parent https://odelinktheme.framer.ai -P backend/themes/wearix/

# veya httrack ile
httrack https://odelinktheme.framer.ai -O backend/themes/wearix/ "+*.framer.ai/*" -v
```

### Ürün Enjeksiyon Örneği

```javascript
// Tema HTML'ine enjekte edilecek kod
<script>
window.ODELINK_PRODUCTS = [
  {
    id: "123",
    name: "Ürün Adı",
    price: "299.00",
    currency: "TRY",
    image: "https://cdn.shopier.com/...",
    url: "https://www.shopier.com/..."
  }
];
</script>
```

### Veritabanı Migration

```sql
-- Migration: Add theme column to sites table
ALTER TABLE sites ADD COLUMN theme VARCHAR(50) DEFAULT 'wearix';
CREATE INDEX idx_sites_theme ON sites(theme);
```

### Klasör Yapısı

```
backend/
  themes/
    wearix/
      index.html
      css/
        framer.*.css
      js/
        framer.*.js
      images/
        *.png, *.jpg, *.svg
      fonts/
        *.woff, *.woff2
```
