# 🚀 RHODES WOOCOMMERCE DEPLOYMENT CHECKLIST

## ✅ TEMİZLİK TAMAMLANDI

### Silinen Dosyalar:
- ❌ `scripts/scrape-moda-theme.js` - Eski moda tema scraper

### Temizlenen Yorumlar:
- ✅ `backend/routes/sites.js` - "Theme support removed" yorumu silindi
- ✅ `backend/routes/real-shopier.js` - "Theme support removed" yorumu silindi
- ✅ `backend/services/siteCreationJobWorker.js` - "Theme support removed" yorumu silindi
- ✅ `backend/models/Subscription.js` - "Theme support removed" yorumu silindi
- ✅ `backend/config/planCatalog.js` - "Theme support removed" yorumu silindi
- ✅ `frontend/src/components/CustomDomainSitePage.js` - "Theme support removed" yorumu silindi
- ✅ `frontend/src/components/StorefrontShell.js` - "Theme support removed" yorumu silindi
- ✅ `frontend/src/components/PublicSitePage.js` - "Theme support removed" yorumu silindi

## 📋 RHODES WOOCOMMERCE ENTEGRASYONU

### Backend Dosyaları:
1. ✅ `backend/services/wooCommerceNonceService.js` - Nonce sistemi
2. ✅ `backend/services/wooCommerceApiService.js` - API converter
3. ✅ `backend/routes/woocommerce-mock.js` - Mock API endpoints
4. ✅ `backend/services/adapters/WooCommerceAdapter.js` - Tema adapter
5. ✅ `backend/services/themeManager.js` - Tema yöneticisi
6. ✅ `backend/server.js` - Rhodes teması kayıtlı
7. ✅ `backend/routes/sites.js` - Tema validation güncellendi
8. ✅ `backend/themes/rhodes-woocommerce/` - Tema dosyaları

### Frontend Dosyaları:
1. ✅ `frontend/src/components/SiteBuilderWizard.js` - Rhodes teması default

### Dokümantasyon:
1. ✅ `backend/WOOCOMMERCE_INTEGRATION.md` - Tam entegrasyon dokümantasyonu
2. ✅ `backend/RHODES_THEME_SETUP.md` - Kurulum kılavuzu
3. ✅ `backend/test-rhodes-theme.js` - Test scripti

## 🎯 DEPLOYMENT ADIMLARI

### 1. LOCAL TEST
```bash
# Backend test
cd backend
npm start

# Frontend test (ayrı terminal)
cd frontend
npm start

# Test site oluştur
# http://localhost:3000/site-builder
```

### 2. FRONTEND BUILD
```bash
cd frontend
npm run build
```

### 3. VDS'YE DEPLOY
```bash
# SSH ile bağlan
ssh -i .ssh/vds_key root@YOUR_VDS_IP

# Projeyi güncelle
cd ~/odelink-shop
git pull origin main

# Backend dependencies
cd backend
npm install

# Frontend build
cd ../frontend
npm install
npm run build

# Backend'i restart et
pm2 restart odelink-backend

# Logları kontrol et
pm2 logs odelink-backend --lines 50
```

### 4. TEST SENARYOLARI

#### Test 1: Backend Health Check
```bash
curl https://www.odelink.shop/api/health
# Beklenen: {"status":"ok",...}
```

#### Test 2: Rhodes Teması Kayıtlı mı?
```bash
# PM2 loglarında şunu ara:
pm2 logs odelink-backend | grep "Rhodes"
# Beklenen: "✅ Rhodes WooCommerce theme registered"
```

#### Test 3: Site Oluştur
1. https://www.odelink.shop/site-builder adresine git
2. Shopier mağaza linki gir
3. Site adı ve açıklama gir
4. "Oluştur" butonuna tıkla
5. Site oluşturuldu mu kontrol et

#### Test 4: Rhodes Teması Çalışıyor mu?
1. Oluşturulan site linkine git: `https://www.odelink.shop/s/SUBDOMAIN`
2. Tarayıcı console'u aç (F12)
3. Şunları kontrol et:
   - `✅ WooCommerce Odelink Override loaded`
   - `✅ WooCommerce nonce loaded`
   - `✅ Odelink site data loaded`

#### Test 5: WooCommerce API Çalışıyor mu?
```bash
# Nonce al
curl https://www.odelink.shop/wp-json/wc/store/v1/nonce

# Ürünleri listele
curl "https://www.odelink.shop/wp-json/wc/store/v1/products?site=SUBDOMAIN"
```

## 🔍 SORUN GİDERME

### Tema Görünmüyor
```bash
# Tema dosyalarını kontrol et
ls -la ~/odelink-shop/backend/themes/rhodes-woocommerce/

# index.html var mı?
cat ~/odelink-shop/backend/themes/rhodes-woocommerce/index.html | head -20
```

### Site Oluşturulmuyor
```bash
# Backend loglarını kontrol et
pm2 logs odelink-backend --lines 100

# Database bağlantısını kontrol et
cd ~/odelink-shop/backend
node -e "const pool = require('./config/database'); pool.query('SELECT 1').then(() => console.log('✅ DB OK')).catch(e => console.error('❌ DB Error:', e));"
```

### Ürünler Çekilmiyor
```bash
# Shopier API token kontrolü
cd ~/odelink-shop/backend
grep SHOPIER_API_TOKEN .env

# Manuel ürün çekme testi
node -e "const {fetchShopierCatalog} = require('./services/shopierCatalogService'); fetchShopierCatalog('https://shopier.com/magaza').then(c => console.log('Ürün sayısı:', c.products.length)).catch(e => console.error('Hata:', e));"
```

## 📊 BAŞARI KRİTERLERİ

- [ ] Backend başarıyla başladı
- [ ] Rhodes teması kayıtlı
- [ ] Frontend build başarılı
- [ ] Site oluşturma çalışıyor
- [ ] Rhodes teması görünüyor
- [ ] Ürünler listeleniyor
- [ ] WooCommerce API çalışıyor
- [ ] Nonce sistemi çalışıyor

## 🎉 DEPLOYMENT TAMAMLANDI!

Tüm testler başarılı olduğunda:
1. ✅ Rhodes WooCommerce teması canlıda
2. ✅ Kullanıcılar site oluşturabilir
3. ✅ Shopier ürünleri otomatik çekiliyor
4. ✅ Modern WooCommerce teması aktif

---

**Tarih:** 2026-04-17  
**Versiyon:** 1.0.0  
**Durum:** Deployment Hazır
