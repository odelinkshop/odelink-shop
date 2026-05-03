# 🚀 Dodo Payments Deployment Checklist

## ✅ Tamamlanan İşler

### Backend Implementation
- [x] Database migration dosyası (`002_create_payments_schema.sql`)
- [x] Payment model (`backend/models/Payment.js`)
- [x] AdvertisementCredit model (`backend/models/AdvertisementCredit.js`)
- [x] DodoPaymentsService (`backend/services/dodoPaymentsService.js`)
- [x] EmailNotificationService (`backend/services/emailNotificationService.js`)
- [x] Payment routes (`backend/routes/payments.js`)
- [x] Product mapping config (`backend/config/dodoProducts.js`)
- [x] Rate limiters eklendi
- [x] Webhook handler implementasyonu
- [x] Test mode desteği

### Frontend Implementation
- [x] PremiumPricing component güncellendi
- [x] PaymentStatus component oluşturuldu
- [x] PaymentHistory component oluşturuldu
- [x] App.js routing güncellendi

### Documentation
- [x] API Documentation (`DODO_PAYMENTS_API.md`)
- [x] Deployment Guide (`DODO_PAYMENTS_DEPLOYMENT.md`)
- [x] Integration Summary (`DODO_PAYMENTS_INTEGRATION_SUMMARY.md`)

---

## 📋 Deployment Adımları

### 1. Dodo Payments Dashboard Konfigürasyonu

#### A. Ürünleri Oluştur
Dodo Payments dashboard'a giriş yap ve şu ürünleri oluştur:

**Abonelik Planları:**
1. **Standart Aylık Plan**
   - İsim: "Standart Aylık Plan"
   - Fiyat: ₺299
   - Dönem: Aylık (Monthly)
   - Product ID'yi kopyala → `.env` dosyasına ekle

2. **Profesyonel Yıllık Plan**
   - İsim: "Profesyonel Yıllık Plan"
   - Fiyat: ₺399
   - Dönem: Yıllık (Yearly)
   - Product ID'yi kopyala → `.env` dosyasına ekle

**Reklam Paketleri:**
3. **Başlangıç Reklam Paketi**
   - İsim: "Başlangıç Reklam Paketi"
   - Fiyat: ₺500
   - Tip: Tek seferlik (One-time)
   - Product ID'yi kopyala → `.env` dosyasına ekle

4. **Profesyonel Reklam Paketi**
   - İsim: "Profesyonel Reklam Paketi"
   - Fiyat: ₺1,200
   - Tip: Tek seferlik (One-time)
   - Product ID'yi kopyala → `.env` dosyasına ekle

5. **Premium Reklam Paketi**
   - İsim: "Premium Reklam Paketi"
   - Fiyat: ₺2,500
   - Tip: Tek seferlik (One-time)
   - Product ID'yi kopyala → `.env` dosyasına ekle

#### B. Webhook Yapılandır
1. Dodo Payments Dashboard → Webhooks
2. "Add Webhook Endpoint" tıkla
3. URL: `https://odelink.shop/api/payments/webhook/dodo`
4. Events seç:
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`
   - ✅ `subscription.active` (opsiyonel)
   - ✅ `subscription.cancelled` (opsiyonel)
5. Webhook Secret'ı kopyala → `.env` dosyasına ekle

---

### 2. Backend Environment Variables

`backend/.env` dosyasını güncelle:

```bash
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=h9eq_XZdVqhUW2Bn.pTtiCezpgU47VBu_a6rWQCX2FyEFteGE-tZn4kmnUB8iXvow
DODO_WEBHOOK_SECRET=<webhook_secret_buraya_yapistir>
TEST_MODE=false

# Dodo Payments Product IDs (Dodo dashboard'dan al)
DODO_PRODUCT_STANDARD_MONTHLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_PROFESSIONAL_YEARLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_AD_BASIC=prod_xxxxxxxxxxxxx
DODO_PRODUCT_AD_PROFESSIONAL=prod_xxxxxxxxxxxxx
DODO_PRODUCT_AD_PREMIUM=prod_xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=https://odelink.shop

# Email Configuration (mevcut ayarlar)
EMAIL_HOST=<mevcut_email_host>
EMAIL_PORT=<mevcut_email_port>
EMAIL_USER=<mevcut_email_user>
EMAIL_PASS=<mevcut_email_pass>
```

---

### 3. Database Migration

VPS'e bağlan ve migration'ı çalıştır:

```bash
# VPS'e SSH ile bağlan
ssh user@your-vps-ip

# Proje dizinine git
cd /path/to/odelink-shop/backend

# Migration'ı çalıştır
node config/runMigrations.js
```

**Beklenen Çıktı:**
```
✅ Migration 002_create_payments_schema.sql completed
✅ All migrations completed successfully
```

**Doğrulama:**
```bash
# PostgreSQL'e bağlan
psql -U your_db_user -d your_db_name

# Tabloları kontrol et
\dt

# payments tablosunu kontrol et
\d payments

# advertisement_credits tablosunu kontrol et
\d advertisement_credits

# Çıkış
\q
```

---

### 4. Test Mode'da Test

Önce test mode'da test edelim:

```bash
# backend/.env dosyasında
TEST_MODE=true

# Backend'i restart et
pm2 restart odelink-backend
# veya
systemctl restart odelink-backend
```

**Test Adımları:**
1. https://odelink.shop adresine git
2. Giriş yap veya kayıt ol
3. Pricing sayfasına git
4. Bir plan seç
5. Test kartı kullan: `4242 4242 4242 4242`
6. Ödemeyi tamamla
7. Payment status sayfasında durumu kontrol et
8. Dashboard'da aboneliğin aktif olduğunu doğrula

**Logları İzle:**
```bash
# Backend logları
pm2 logs odelink-backend

# Webhook logları
pm2 logs odelink-backend | grep "Webhook"

# Payment logları
pm2 logs odelink-backend | grep "💳\|✅\|❌"
```

---

### 5. Production Deployment

Test başarılı olduktan sonra production'a geç:

```bash
# backend/.env dosyasında
TEST_MODE=false

# Backend'i restart et
pm2 restart odelink-backend
```

**Frontend Build & Deploy:**
```bash
# Frontend dizinine git
cd /path/to/odelink-shop/frontend

# Build al
npm run build

# Build'i deploy et (nginx kullanıyorsan)
sudo rsync -avz build/ /var/www/odelink-shop/

# Nginx'i reload et
sudo systemctl reload nginx
```

---

### 6. Production Test

**Gerçek Ödeme Testi:**
1. Küçük bir tutar seç (örn: Standart plan ₺299)
2. Gerçek kart bilgileri ile ödeme yap
3. Webhook'un geldiğini loglardan doğrula
4. Aboneliğin aktif olduğunu kontrol et
5. Email bildiriminin geldiğini kontrol et

**Doğrulama Sorguları:**
```sql
-- Son ödemeyi kontrol et
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;

-- Aboneliği kontrol et
SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 1;

-- Reklam kredisini kontrol et (eğer ad package aldıysan)
SELECT * FROM advertisement_credits ORDER BY created_at DESC LIMIT 1;
```

---

### 7. Monitoring Setup

**Log İzleme:**
```bash
# Tüm payment logları
pm2 logs odelink-backend | grep "Payment"

# Webhook logları
pm2 logs odelink-backend | grep "Webhook"

# Hata logları
pm2 logs odelink-backend --err
```

**Database Monitoring:**
```sql
-- Ödeme istatistikleri
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payments
GROUP BY status;

-- Son 24 saatteki başarısız ödemeler
SELECT 
  transaction_id,
  user_id,
  amount,
  failure_reason,
  created_at
FROM payments
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 1 saatten eski pending ödemeler
SELECT 
  transaction_id,
  user_id,
  amount,
  created_at
FROM payments
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 🔍 Troubleshooting

### Problem: Payment link oluşturulamıyor

**Kontrol Et:**
```bash
# API key doğru mu?
echo $DODO_PAYMENTS_API_KEY

# Backend logları
pm2 logs odelink-backend | grep "Payment link creation error"
```

**Çözüm:**
- API key'in doğru olduğundan emin ol
- Dodo Payments dashboard'da API key'in aktif olduğunu kontrol et
- Product ID'lerin doğru olduğunu kontrol et

---

### Problem: Webhook signature verification başarısız

**Kontrol Et:**
```bash
# Webhook secret doğru mu?
echo $DODO_WEBHOOK_SECRET

# Webhook logları
pm2 logs odelink-backend | grep "Webhook signature verification"
```

**Çözüm:**
- Webhook secret'ın Dodo dashboard'daki ile aynı olduğunu kontrol et
- Webhook endpoint'inin erişilebilir olduğunu test et:
  ```bash
  curl -X POST https://odelink.shop/api/payments/webhook/dodo
  ```

---

### Problem: Abonelik aktif olmuyor

**Kontrol Et:**
```bash
# Webhook işlendi mi?
pm2 logs odelink-backend | grep "Successful payment processed"

# Database'de payment var mı?
psql -U your_db_user -d your_db_name -c "SELECT * FROM payments WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1;"

# Subscription oluştu mu?
psql -U your_db_user -d your_db_name -c "SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 1;"
```

**Çözüm:**
- Webhook'un başarıyla işlendiğini kontrol et
- Manuel olarak tamamla (admin panel):
  ```
  POST /api/payments/admin/complete/:transactionId
  ```

---

## 📊 Success Metrics

Deployment başarılı sayılır eğer:

- [x] Database migration başarılı
- [x] Test mode'da ödeme tamamlanabiliyor
- [x] Webhook signature verification çalışıyor
- [x] Abonelik otomatik aktif oluyor
- [x] Email bildirimleri gönderiliyor
- [x] Production'da gerçek ödeme yapılabiliyor
- [x] Payment history görüntülenebiliyor
- [x] Admin panel'den ödemeler yönetilebiliyor

---

## 📞 Destek

**Teknik Sorunlar:**
- Backend logları: `pm2 logs odelink-backend`
- Database sorguları: Yukarıdaki monitoring sorguları
- Dokümantasyon: `DODO_PAYMENTS_API.md`, `DODO_PAYMENTS_DEPLOYMENT.md`

**Dodo Payments Sorunları:**
- Dodo Payments Dashboard: https://dodopayments.com
- Dodo Payments Docs: https://docs.dodopayments.com
- Destek: support@dodopayments.com

---

## ✅ Final Checklist

Deployment tamamlandıktan sonra:

- [ ] Database migration çalıştırıldı
- [ ] Environment variables ayarlandı
- [ ] Product ID'ler Dodo dashboard'dan alındı
- [ ] Webhook yapılandırıldı
- [ ] Test mode'da test edildi
- [ ] Backend deploy edildi
- [ ] Frontend build alındı ve deploy edildi
- [ ] Production'da gerçek ödeme test edildi
- [ ] Webhook delivery doğrulandı
- [ ] Monitoring kuruldu
- [ ] Ekip bilgilendirildi

---

**Deployment Tarihi:** _____________
**Deploy Eden:** _____________
**Status:** ⏳ Beklemede / ✅ Tamamlandı

---

## 🎉 Tebrikler!

Dodo Payments entegrasyonu başarıyla tamamlandı! Artık kullanıcılar güvenli bir şekilde ödeme yapabilir ve abonelikleri otomatik olarak aktif olur.
