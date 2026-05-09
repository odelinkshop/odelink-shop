# 🕷️ MANUEL SCRAPING REHBERİ

## ❌ GitHub Actions SSH Hatası

SSH authentication başarısız oldu. Manuel olarak scraping yapalım.

## 🚀 MANUEL SCRAPING ADIMLARI

### 1. VDS'ye SSH ile Bağlan

```bash
ssh root@your-vds-ip
# Şifre: [VDS şifresi]
```

### 2. Odelink Klasörüne Git

```bash
cd ~/odelink-shop
```

### 3. Backend Çalışıyor mu Kontrol Et

```bash
docker ps | grep odelink_backend
curl http://127.0.0.1:5000/api/health
```

### 4. Theme Engine Kontrolü

```bash
curl http://127.0.0.1:5000/api/themes
```

**Beklenen çıktı:**
```json
{
  "success": true,
  "count": 5,
  "themes": [
    {
      "id": "shopify-materia",
      "name": "Materia - Shopify Streetwear",
      "type": "shopify",
      "enabled": true
    }
  ]
}
```

### 5. Materia Scrape Başlat

```bash
curl -X POST http://127.0.0.1:5000/api/themes/scrape/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "shopifyUrl": "https://materia-streetwear-demo2.myshopify.com/",
    "themeId": "shopify-materia"
  }'
```

**Beklenen çıktı:**
```json
{
  "success": true,
  "message": "Scraping started",
  "themeId": "shopify-materia",
  "status": "in-progress"
}
```

### 6. Backend Loglarını İzle

```bash
# Yeni terminal aç ve logları izle
docker logs odelink_backend -f
```

**Aranacak loglar:**
- `🚀 Starting Shopify scrape`
- `📄 Loading page`
- `📦 Collecting resources`
- `📸 Taking screenshot`
- `✅ HTML saved`
- `⬇️ Downloading resources`
- `✅ Shopify theme scraped successfully`

### 7. Scraping Tamamlanmasını Bekle (~60 saniye)

```bash
# 60 saniye bekle
sleep 60
```

### 8. Tema Dosyalarını Kontrol Et

```bash
ls -lh ~/odelink-shop/backend/themes/shopify-materia/
```

**Beklenen dosyalar:**
```
total 2.5M
-rw-r--r-- 1 root root 2.3M Apr 16 15:50 index.html
-rw-r--r-- 1 root root 150K Apr 16 15:50 preview.png
-rw-r--r-- 1 root root  512 Apr 16 15:50 metadata.json
drwxr-xr-x 2 root root 4.0K Apr 16 15:50 css/
drwxr-xr-x 2 root root 4.0K Apr 16 15:50 js/
drwxr-xr-x 2 root root 4.0K Apr 16 15:50 images/
drwxr-xr-x 2 root root 4.0K Apr 16 15:50 fonts/
```

### 9. Metadata Kontrol Et

```bash
cat ~/odelink-shop/backend/themes/shopify-materia/metadata.json
```

### 10. Dawn Scrape (Opsiyonel)

```bash
curl -X POST http://127.0.0.1:5000/api/themes/scrape/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "shopifyUrl": "https://dawn-demo.myshopify.com/",
    "themeId": "shopify-dawn"
  }'

# 60 saniye bekle
sleep 60

# Kontrol et
ls -lh ~/odelink-shop/backend/themes/shopify-dawn/
```

## 🎯 TEST SİTESİ OLUŞTUR

### 1. PostgreSQL'e Bağlan

```bash
docker exec -it odelink_postgres psql -U postgres -d odelink_shop
```

### 2. Test Sitesi Oluştur

```sql
-- Mevcut siteleri kontrol et
SELECT id, subdomain, name, theme, status FROM sites;

-- Yeni site oluştur
INSERT INTO sites (user_id, subdomain, name, shopier_url, theme, status)
VALUES (1, 'streetwear', 'Streetwear Demo', 'https://shopier.com/takikjewelry', 'shopify-materia', 'active');

-- Kontrol et
SELECT subdomain, name, theme, status FROM sites WHERE subdomain = 'streetwear';

-- Çık
\q
```

### 3. Cache Temizle

```bash
curl -X DELETE http://127.0.0.1:5000/api/themes/cache
```

### 4. Siteyi Ziyaret Et

```
https://www.odelink.shop/s/streetwear
```

## 🐛 SORUN GİDERME

### Scraping Başarısız Olursa

**1. Puppeteer hatası:**
```bash
# Chromium kurulu mu?
docker exec odelink_backend node -e "console.log(require('@sparticuz/chromium'))"
```

**2. Memory hatası:**
```bash
# Memory kullanımı
docker stats odelink_backend --no-stream

# Memory limit artır
docker update --memory=2g odelink_backend
docker compose restart backend
```

**3. Timeout hatası:**
```bash
# Backend loglarını kontrol et
docker logs odelink_backend --tail 200 | grep -i "error\|timeout"
```

**4. Permission hatası:**
```bash
# Tema klasörü izinleri
chmod -R 755 ~/odelink-shop/backend/themes/
chown -R root:root ~/odelink-shop/backend/themes/
```

### Tema Render Edilmiyorsa

**1. Tema dosyaları var mı:**
```bash
ls -la ~/odelink-shop/backend/themes/shopify-materia/index.html
```

**2. Theme Engine çalışıyor mu:**
```bash
curl http://127.0.0.1:5000/api/themes/stats
```

**3. Backend restart:**
```bash
docker compose restart backend
docker logs odelink_backend --tail 50
```

**4. Site database'de var mı:**
```bash
docker exec -it odelink_postgres psql -U postgres -d odelink_shop -c "SELECT subdomain, theme FROM sites WHERE subdomain = 'streetwear';"
```

## 📊 BAŞARI KRİTERLERİ

- [ ] Backend çalışıyor
- [ ] Theme Engine API çalışıyor
- [ ] Scraping başladı
- [ ] index.html oluşturuldu
- [ ] CSS/JS dosyaları indirildi
- [ ] preview.png oluşturuldu
- [ ] metadata.json oluşturuldu
- [ ] Test sitesi oluşturuldu
- [ ] Site render ediliyor
- [ ] Ürünler görünüyor

## 🎉 BAŞARILI OLURSA

```bash
echo "✅ Scraping başarılı!"
echo "📁 Tema dosyaları: ~/odelink-shop/backend/themes/shopify-materia/"
echo "🌐 Test sitesi: https://www.odelink.shop/s/streetwear"
echo "🎨 Theme Engine: https://www.odelink.shop/api/themes"
```

---

## 🚀 HEMEN BAŞLA!

```bash
# 1. VDS'ye bağlan
ssh root@your-vds-ip

# 2. Scraping başlat
cd ~/odelink-shop
curl -X POST http://127.0.0.1:5000/api/themes/scrape/shopify \
  -H "Content-Type: application/json" \
  -d '{"shopifyUrl": "https://materia-streetwear-demo2.myshopify.com/", "themeId": "shopify-materia"}'

# 3. Logları izle
docker logs odelink_backend -f
```

**Başarılar! 🎉**
