# Implementation Plan: Dodo Payments Integration

## Overview

Bu implementation plan, Dodo Payments entegrasyonunu Odelink platformuna eklemek için gerekli tüm adımları içerir. Plan, veritabanı şemasından başlayarak backend servisleri, API route'ları, frontend bileşenleri ve testleri kapsayan tam bir entegrasyon sağlar.

## Tasks

- [x] 1. Veritabanı şeması ve modelleri oluştur
  - [x] 1.1 Payments ve advertisement_credits tablolarını oluştur
    - `backend/migrations/` klasöründe yeni migration dosyası oluştur
    - `payments` tablosunu tüm gerekli alanlar ve indexlerle oluştur
    - `advertisement_credits` tablosunu oluştur
    - `updated_at` trigger'ını ekle
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.4_
  
  - [x] 1.2 Payment model'ini implement et
    - `backend/models/Payment.js` dosyasını oluştur
    - `create`, `findByTransactionId`, `findByDodoTransactionId`, `updateStatus` metodlarını implement et
    - `getUserPayments` ve `getAllPayments` metodlarını pagination ile implement et
    - `ensureSchema` metodunu ekle
    - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 1.3 Payment model için unit testler yaz
    - CRUD operasyonlarını test et
    - `dodo_transaction_id` unique constraint'ini test et
    - Pagination ve filtreleme fonksiyonlarını test et
    - _Requirements: 3.1, 3.2, 7.4_
  
  - [x] 1.4 AdvertisementCredit model'ini implement et
    - `backend/models/AdvertisementCredit.js` dosyasını oluştur
    - `addCredit`, `getUserBalance`, `getUserCreditHistory` metodlarını implement et
    - Balance hesaplama mantığını ekle
    - `ensureSchema` metodunu ekle
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 1.5 AdvertisementCredit model için unit testler yaz
    - Kredi ekleme ve balance hesaplama test et
    - Kredi geçmişi sorgulama test et
    - _Requirements: 13.4_

- [x] 2. Dodo Payments Service'i implement et
  - [x] 2.1 DodoPaymentsService class'ını oluştur
    - `backend/services/dodoPaymentsService.js` dosyasını oluştur
    - Constructor'da API key, webhook secret ve test mode parametrelerini al
    - Environment variable'ları yükle ve validate et
    - _Requirements: 1.1, 1.2, 15.1, 15.2_
  
  - [x] 2.2 Checkout session oluşturma metodunu implement et
    - `createCheckoutSession` metodunu implement et
    - Dodo Payments API'sine POST request gönder
    - Product mapping'i uygula (subscription ve ad_package için)
    - Metadata'yı (user_id, product_type, product_id) ekle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 2.3 Webhook signature verification implement et
    - `verifyWebhookSignature` metodunu implement et
    - Standard Webhooks specification'a göre HMAC SHA256 ile imza doğrula
    - Constant-time comparison kullan (timing attack'lara karşı)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 2.4 Payment status sorgulama metodunu implement et
    - `getPaymentStatus` metodunu implement et
    - Dodo Payments API'den payment durumunu çek
    - _Requirements: 11.3, 11.4_
  
  - [x] 2.5 Webhook payload parsing metodunu implement et
    - `parseWebhookPayload` metodunu implement et
    - Event type'a göre payload'u parse et
    - _Requirements: 4.5, 5.1, 5.2, 5.3_
  
  - [x] 2.6 Error handling ve retry logic ekle
    - Exponential backoff ile retry mekanizması ekle (max 3 deneme)
    - API hatalarını loglama ekle
    - Custom PaymentError class'ı oluştur
    - _Requirements: 1.4, 1.5, 14.1, 14.2, 14.3_
  
  - [ ]* 2.7 DodoPaymentsService için unit testler yaz
    - API request formatting'i test et
    - Webhook signature verification'ı bilinen imzalarla test et
    - Retry logic'i mocked failure'larla test et
    - Error handling'i test et
    - _Requirements: 1.5, 4.3, 4.4_

- [ ] 3. Checkpoint - Temel servis ve modellerin testi
  - Tüm testlerin başarılı olduğundan emin ol, sorular varsa kullanıcıya sor.

- [x] 4. Payment routes ve webhook handler'ı implement et
  - [x] 4.1 Payment routes dosyasını oluştur
    - `backend/routes/payments.js` dosyasını oluştur
    - Express router'ı setup et
    - Middleware'leri import et (auth, adminOnly, rateLimiters)
    - _Requirements: 9.1, 9.2, 10.1_
  
  - [x] 4.2 Create payment link endpoint'ini implement et
    - `POST /api/payments/create-link` endpoint'ini oluştur
    - Input validation ekle (productType, productId, tier, billingCycle)
    - CSRF token oluştur ve session'a kaydet
    - DodoPaymentsService ile checkout session oluştur
    - Payment transaction kaydı oluştur (status: pending)
    - Payment URL'i döndür
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 10.1, 10.2_
  
  - [x] 4.3 Payment status endpoint'ini implement et
    - `GET /api/payments/status/:transactionId` endpoint'ini oluştur
    - Transaction ID ile payment kaydını sorgula
    - 10 dakikadan eski pending payment'lar için Dodo API'den status çek
    - Status'u güncelle ve döndür
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 4.4 Payment history endpoint'ini implement et
    - `GET /api/payments/history` endpoint'ini oluştur
    - Kullanıcının payment'larını pagination ile getir (20 per page)
    - created_at'e göre descending sırala
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 4.5 Admin payment endpoints'lerini implement et
    - `GET /api/payments/admin/all` endpoint'ini oluştur (filtering ve search ile)
    - `POST /api/payments/admin/complete/:transactionId` endpoint'ini oluştur
    - Admin action logging ekle
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 4.6 Webhook endpoint'ini implement et
    - `POST /api/payments/webhook/dodo` endpoint'ini oluştur
    - Raw body parsing ekle (signature verification için)
    - Webhook signature'ı verify et
    - Idempotency check yap (dodo_transaction_id kontrolü)
    - Event type'a göre işlem yap (payment.succeeded, payment.failed)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 4.7 Webhook'ta başarılı ödeme işleme mantığını implement et
    - payment.succeeded event'i için handler yaz
    - Payment status'u "completed" olarak güncelle
    - Subscription için: Subscription_Manager'ı çağır, abonelik oluştur/güncelle
    - Ad package için: AdvertisementCredit_Manager'ı çağır, kredi ekle
    - Confirmation email gönder
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 13.1, 13.2, 13.3, 13.5_
  
  - [x] 4.8 Webhook'ta başarısız ödeme işleme mantığını implement et
    - payment.failed event'i için handler yaz
    - Payment status'u "failed" olarak güncelle
    - Failure reason'ı kaydet
    - Failure notification email gönder
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 4.9 Rate limiting middleware'lerini ekle
    - Payment endpoint'leri için rate limiter ekle (10 req/min)
    - Webhook endpoint'i için rate limiter ekle (100 req/min per IP)
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 4.10 Payment routes için integration testler yaz
    - Payment link creation'ı valid/invalid data ile test et
    - Authentication ve authorization test et
    - Rate limiting test et
    - Webhook endpoint'ini valid/invalid signature'larla test et
    - Idempotency'yi duplicate webhook event'lerle test et
    - _Requirements: 2.5, 4.4, 9.1, 9.2, 9.6_

- [x] 5. Subscription ve Advertisement Credit yönetimini entegre et
  - [x] 5.1 Subscription Manager'a Dodo Payments entegrasyonu ekle
    - Mevcut `backend/models/Subscription.js` dosyasını incele
    - Başarılı ödeme sonrası subscription oluşturma/güncelleme metodunu ekle
    - Standard plan için: 3 site limiti, monthly billing
    - Professional plan için: 10 site limiti, yearly billing
    - Subscription renewal logic'i ekle
    - _Requirements: 5.1, 5.2, 12.1, 12.3_
  
  - [x] 5.2 Advertisement Credit Manager'ı implement et
    - Başarılı ad package ödemesi sonrası kredi ekleme metodunu implement et
    - Başlangıç paketi: 500 TRY, Profesyonel: 1200 TRY, Premium: 2500 TRY
    - Balance hesaplama ve güncelleme
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 5.3 Email notification servisini entegre et
    - Confirmation email template'i oluştur (subscription ve ad credit için)
    - Failure notification email template'i oluştur
    - Renewal notification email template'i oluştur
    - Test mode'da email gönderme yerine loglama yap
    - _Requirements: 5.6, 6.3, 12.2, 12.4, 13.5, 15.3_
  
  - [ ]* 5.4 Subscription ve credit yönetimi için integration testler yaz
    - End-to-end payment flow test et (link creation → webhook → activation)
    - Subscription activation test et
    - Credit addition test et
    - Email notification'ları test et
    - _Requirements: 5.1, 5.2, 5.3, 13.1, 13.2, 13.3_

- [ ] 6. Checkpoint - Backend entegrasyonunun testi
  - Tüm backend testlerinin başarılı olduğundan emin ol, sorular varsa kullanıcıya sor.

- [x] 7. Frontend bileşenlerini implement et
  - [x] 7.1 PricingPage component'ini güncelle
    - Mevcut `frontend/src/components/PricingPage.js` dosyasını incele
    - Dodo Payments entegrasyonu için payment link creation ekle
    - `handlePurchasePlan` ve `handlePurchaseAdPackage` metodlarını güncelle
    - Loading ve error state'lerini ekle
    - Payment URL'e redirect mantığını ekle
    - _Requirements: 2.5, 2.6_
  
  - [x] 7.2 PaymentStatus component'ini oluştur
    - `frontend/src/components/PaymentStatus.js` dosyasını oluştur
    - URL query parameter'dan transactionId al
    - Payment status polling implement et (1s, 2s, 4s, 8s exponential backoff)
    - Pending, completed, failed state'leri için UI oluştur
    - Success durumunda dashboard'a yönlendirme ekle
    - _Requirements: 11.1, 11.2, 11.5_
  
  - [x] 7.3 PaymentHistory component'ini oluştur
    - `frontend/src/components/PaymentHistory.js` dosyasını oluştur
    - Payment history API'sini çağır
    - Pagination implement et (20 per page)
    - Transaction listesini tablo formatında göster
    - Status badge'leri ekle (pending, completed, failed)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 7.4 Navigation ve routing'i güncelle
    - Payment pages için route'ları ekle
    - Dashboard'a payment history linki ekle
    - _Requirements: 7.1_
  
  - [ ]* 7.5 Frontend component'leri için unit testler yaz
    - PricingPage payment initiation test et
    - PaymentStatus polling ve state transitions test et
    - PaymentHistory rendering ve pagination test et
    - _Requirements: 2.5, 11.5, 7.4_

- [x] 8. Environment configuration ve deployment hazırlığı
  - [x] 8.1 Environment variables'ları ekle
    - `.env.example` dosyasını güncelle
    - Dodo Payments API key, webhook secret ekle
    - Product ID'leri ekle (standard_monthly, professional_yearly, ad packages)
    - Test mode flag'i ekle
    - _Requirements: 1.1, 15.1, 15.2, 15.5_
  
  - [x] 8.2 Product mapping configuration'ı oluştur
    - `backend/config/dodoProducts.js` dosyasını oluştur
    - Subscription plans mapping'i ekle
    - Ad packages mapping'i ekle
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 8.3 Logging ve monitoring setup'ı yap
    - Structured logging implement et
    - Payment operations için log points ekle
    - Webhook events için log points ekle
    - Error logging ile context bilgisi ekle
    - _Requirements: 1.4, 4.6, 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 8.4 Test mode implementation'ını tamamla
    - Test mode flag kontrollerini tüm servislere ekle
    - Transaction ID'lere "TEST_" prefix'i ekle
    - Test API endpoint kullanımını ekle
    - Test mode log prefix'i ekle
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 9. Documentation ve deployment
  - [x] 9.1 API documentation oluştur
    - Payment endpoints için API docs yaz
    - Request/response örnekleri ekle
    - Error code'ları dokümante et
    - _Requirements: 2.6, 6.2, 11.2_
  
  - [x] 9.2 Deployment guide güncelle
    - Dodo Payments webhook URL configuration'ı ekle
    - Environment variables setup guide'ı ekle
    - Migration çalıştırma adımlarını ekle
    - _Requirements: 1.1, 15.5_
  
  - [x] 9.3 Admin panel için kullanım kılavuzu oluştur
    - Payment yönetimi için guide yaz
    - Manual payment completion adımlarını dokümante et
    - _Requirements: 8.4, 8.5_

- [ ] 10. Final checkpoint - End-to-end test ve deployment
  - Test mode'da tüm flow'u test et
  - Webhook processing'i test et
  - Error scenario'larını test et
  - Production deployment için hazırlık yap
  - Tüm testlerin başarılı olduğundan emin ol, sorular varsa kullanıcıya sor.

## Notes

- `*` ile işaretli task'lar optional'dır ve daha hızlı MVP için atlanabilir
- Her task spesifik requirement'lara referans verir (traceability için)
- Checkpoint'ler incremental validation sağlar
- Test task'ları implementation'a yakın konumlandırılmıştır (hataları erken yakalamak için)
- Backend implementation frontend'den önce tamamlanmalıdır
- Test mode kullanarak production'ı etkilemeden geliştirme yapılabilir
