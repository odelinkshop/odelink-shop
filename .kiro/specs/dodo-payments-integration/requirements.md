# Requirements Document

## Introduction

Bu doküman, Odelink platformuna Dodo Payments ödeme sağlayıcısının entegrasyonu için gereksinimleri tanımlar. Sistem, kullanıcıların abonelik planları ve reklam paketleri için güvenli ödeme yapabilmesini, ödemelerin otomatik olarak işlenmesini ve webhook bildirimleri ile abonelik/kredi yönetiminin otomatikleştirilmesini sağlayacaktır.

## Glossary

- **Dodo_Payments_API**: Dodo Payments ödeme sağlayıcısının REST API servisi
- **Payment_Service**: Ödeme işlemlerini yöneten backend servisi
- **Webhook_Handler**: Dodo Payments'tan gelen webhook bildirimlerini işleyen servis
- **Subscription_Manager**: Kullanıcı aboneliklerini yöneten servis
- **Advertisement_Credit_Manager**: Reklam kredilerini yöneten servis
- **Payment_Link**: Dodo Payments tarafından oluşturulan ödeme bağlantısı
- **Payment_Transaction**: Bir ödeme işleminin veritabanı kaydı
- **Webhook_Signature**: Webhook isteklerinin doğruluğunu kanıtlayan kriptografik imza
- **CSRF_Token**: Cross-Site Request Forgery saldırılarına karşı güvenlik tokeni
- **Rate_Limiter**: API isteklerini sınırlayan middleware
- **Standard_Plan**: Aylık ₺299 abonelik planı (3 vitrin sitesi)
- **Professional_Plan**: Yıllık ₺399 abonelik planı (10 vitrin sitesi)
- **Ad_Package**: Reklam paketi (Başlangıç: ₺500, Profesyonel: ₺1.200, Premium: ₺2.500)

## Requirements

### Requirement 1: Dodo Payments API Entegrasyonu

**User Story:** Sistem yöneticisi olarak, Dodo Payments API'sini güvenli şekilde entegre etmek istiyorum, böylece ödeme işlemlerini başlatabilirim.

#### Acceptance Criteria

1. THE Payment_Service SHALL store the Dodo Payments API key securely in environment variables
2. WHEN the Payment_Service initializes, THE Payment_Service SHALL validate the API key format
3. THE Payment_Service SHALL use HTTPS for all Dodo Payments API communications
4. WHEN an API request fails, THE Payment_Service SHALL log the error with timestamp and request details
5. THE Payment_Service SHALL implement exponential backoff for failed API requests with maximum 3 retry attempts

### Requirement 2: Ödeme Bağlantısı Oluşturma

**User Story:** Kullanıcı olarak, abonelik planı veya reklam paketi seçtiğimde ödeme bağlantısı oluşturulmasını istiyorum, böylece güvenli şekilde ödeme yapabilirim.

#### Acceptance Criteria

1. WHEN a user selects Standard_Plan, THE Payment_Service SHALL create a Payment_Link with amount 299 TRY and monthly billing cycle
2. WHEN a user selects Professional_Plan, THE Payment_Service SHALL create a Payment_Link with amount 399 TRY and yearly billing cycle
3. WHEN a user selects an Ad_Package, THE Payment_Service SHALL create a Payment_Link with the corresponding package amount
4. THE Payment_Service SHALL include user_id, product_type, and product_id in Payment_Link metadata
5. WHEN Payment_Link creation succeeds, THE Payment_Service SHALL return the payment URL to the frontend within 2 seconds
6. IF Payment_Link creation fails, THEN THE Payment_Service SHALL return a descriptive error message to the user

### Requirement 3: Ödeme İşlemi Kayıt Yönetimi

**User Story:** Sistem yöneticisi olarak, tüm ödeme işlemlerinin kaydedilmesini istiyorum, böylece ödeme geçmişini takip edebilirim.

#### Acceptance Criteria

1. WHEN a Payment_Link is created, THE Payment_Service SHALL create a Payment_Transaction record with status "pending"
2. THE Payment_Transaction SHALL store user_id, amount, currency, product_type, product_id, payment_method, and dodo_transaction_id
3. THE Payment_Service SHALL generate a unique transaction_id for each Payment_Transaction
4. THE Payment_Transaction SHALL include created_at and updated_at timestamps
5. THE Payment_Service SHALL create database indexes on user_id, status, and created_at fields for efficient querying

### Requirement 4: Webhook İmza Doğrulama

**User Story:** Sistem yöneticisi olarak, webhook isteklerinin Dodo Payments'tan geldiğini doğrulamak istiyorum, böylece sahte istekleri engelleyebilirim.

#### Acceptance Criteria

1. WHEN a webhook request is received, THE Webhook_Handler SHALL extract the Webhook_Signature from request headers
2. THE Webhook_Handler SHALL compute the expected signature using the webhook secret and request body
3. THE Webhook_Handler SHALL compare the received signature with the computed signature using constant-time comparison
4. IF the signatures do not match, THEN THE Webhook_Handler SHALL reject the request with HTTP 401 status
5. IF the signatures match, THEN THE Webhook_Handler SHALL process the webhook payload
6. THE Webhook_Handler SHALL log all webhook validation attempts with success/failure status

### Requirement 5: Başarılı Ödeme İşleme

**User Story:** Kullanıcı olarak, ödeme yaptığımda otomatik olarak aboneliğimin veya reklam kredimin aktifleşmesini istiyorum, böylece hemen hizmetten yararlanabilirim.

#### Acceptance Criteria

1. WHEN a successful payment webhook is received for Standard_Plan, THE Subscription_Manager SHALL create an active subscription with 3 site limit and monthly billing
2. WHEN a successful payment webhook is received for Professional_Plan, THE Subscription_Manager SHALL create an active subscription with 10 site limit and yearly billing
3. WHEN a successful payment webhook is received for an Ad_Package, THE Advertisement_Credit_Manager SHALL add the corresponding credit amount to user account
4. THE Webhook_Handler SHALL update the Payment_Transaction status to "completed" within 1 second of receiving successful payment webhook
5. THE Webhook_Handler SHALL update the Payment_Transaction with payment_date, dodo_transaction_id, and payment_method
6. WHEN subscription or credit is activated, THE Webhook_Handler SHALL send a confirmation email to the user
7. THE Webhook_Handler SHALL return HTTP 200 status to Dodo Payments after successful processing

### Requirement 6: Başarısız Ödeme İşleme

**User Story:** Kullanıcı olarak, ödemem başarısız olduğunda bilgilendirilmek istiyorum, böylece sorunu çözebilirim.

#### Acceptance Criteria

1. WHEN a failed payment webhook is received, THE Webhook_Handler SHALL update the Payment_Transaction status to "failed"
2. THE Webhook_Handler SHALL store the failure reason in Payment_Transaction
3. WHEN payment fails, THE Webhook_Handler SHALL send a notification email to the user with failure reason
4. THE Webhook_Handler SHALL log the failure details for admin review
5. THE Webhook_Handler SHALL return HTTP 200 status to Dodo Payments after processing failed payment

### Requirement 7: Ödeme Geçmişi Görüntüleme

**User Story:** Kullanıcı olarak, geçmiş ödemelerimi görmek istiyorum, böylece ödeme geçmişimi takip edebilirim.

#### Acceptance Criteria

1. WHEN a user requests payment history, THE Payment_Service SHALL return all Payment_Transaction records for that user
2. THE Payment_Service SHALL sort payment history by created_at in descending order
3. THE Payment_Service SHALL include transaction_id, amount, currency, product_type, status, payment_date, and payment_method in each record
4. THE Payment_Service SHALL paginate results with 20 transactions per page
5. THE Payment_Service SHALL return payment history within 500 milliseconds

### Requirement 8: Admin Ödeme Yönetimi

**User Story:** Admin olarak, tüm ödeme işlemlerini görmek ve yönetmek istiyorum, böylece ödeme sorunlarını çözebilirim.

#### Acceptance Criteria

1. WHEN an admin requests all payments, THE Payment_Service SHALL return Payment_Transaction records for all users
2. THE Payment_Service SHALL support filtering by user_id, status, product_type, and date range
3. THE Payment_Service SHALL support searching by transaction_id or user email
4. WHEN an admin manually marks a payment as completed, THE Payment_Service SHALL activate the corresponding subscription or credit
5. THE Payment_Service SHALL log all admin actions on Payment_Transaction records with admin_id and timestamp

### Requirement 9: Webhook Güvenlik ve Rate Limiting

**User Story:** Sistem yöneticisi olarak, webhook endpoint'inin kötüye kullanımını engellemek istiyorum, böylece sistem güvenliğini sağlayabilirim.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL limit webhook requests to 100 requests per minute per IP address
2. IF rate limit is exceeded, THEN THE Rate_Limiter SHALL return HTTP 429 status
3. THE Webhook_Handler SHALL validate webhook payload schema before processing
4. IF payload schema is invalid, THEN THE Webhook_Handler SHALL return HTTP 400 status with validation errors
5. THE Webhook_Handler SHALL implement idempotency by checking if dodo_transaction_id already exists
6. IF dodo_transaction_id already exists, THEN THE Webhook_Handler SHALL return HTTP 200 without reprocessing

### Requirement 10: CSRF Koruması

**User Story:** Sistem yöneticisi olarak, ödeme işlemlerinde CSRF saldırılarını engellemek istiyorum, böylece kullanıcı güvenliğini sağlayabilirim.

#### Acceptance Criteria

1. WHEN a user initiates a payment, THE Payment_Service SHALL generate a unique CSRF_Token
2. THE Payment_Service SHALL store the CSRF_Token in user session with 15 minute expiration
3. WHEN Payment_Link is created, THE Payment_Service SHALL include CSRF_Token in callback URL
4. WHEN payment callback is received, THE Payment_Service SHALL validate the CSRF_Token
5. IF CSRF_Token is invalid or expired, THEN THE Payment_Service SHALL reject the callback with HTTP 403 status

### Requirement 11: Ödeme Durumu Sorgulama

**User Story:** Kullanıcı olarak, ödeme durumumu kontrol etmek istiyorum, böylece ödemenin başarılı olup olmadığını görebilirim.

#### Acceptance Criteria

1. WHEN a user requests payment status, THE Payment_Service SHALL query Payment_Transaction by transaction_id
2. THE Payment_Service SHALL return current status, amount, product_type, and payment_date
3. IF payment is still pending after 10 minutes, THE Payment_Service SHALL query Dodo_Payments_API for current status
4. WHEN Dodo_Payments_API returns updated status, THE Payment_Service SHALL update Payment_Transaction accordingly
5. THE Payment_Service SHALL return payment status within 1 second

### Requirement 12: Abonelik Yenileme Bildirimleri

**User Story:** Kullanıcı olarak, aboneliğim yenilendiğinde bilgilendirilmek istiyorum, böylece ödeme durumumu takip edebilirim.

#### Acceptance Criteria

1. WHEN a subscription renewal payment succeeds, THE Webhook_Handler SHALL extend subscription end_date by billing cycle duration
2. THE Webhook_Handler SHALL send a renewal confirmation email to the user
3. THE Webhook_Handler SHALL create a new Payment_Transaction record for the renewal
4. WHEN subscription renewal payment fails, THE Webhook_Handler SHALL send a payment failure notification to the user
5. THE Webhook_Handler SHALL mark the subscription as "payment_failed" status

### Requirement 13: Reklam Kredisi Yönetimi

**User Story:** Kullanıcı olarak, reklam paketi satın aldığımda kredimin hesabıma yüklenmesini istiyorum, böylece reklam verebilirim.

#### Acceptance Criteria

1. WHEN Başlangıç Ad_Package payment succeeds, THE Advertisement_Credit_Manager SHALL add 500 TRY credit to user account
2. WHEN Profesyonel Ad_Package payment succeeds, THE Advertisement_Credit_Manager SHALL add 1200 TRY credit to user account
3. WHEN Premium Ad_Package payment succeeds, THE Advertisement_Credit_Manager SHALL add 2500 TRY credit to user account
4. THE Advertisement_Credit_Manager SHALL record credit transaction with amount, source, and timestamp
5. THE Advertisement_Credit_Manager SHALL send a credit confirmation email to the user with new balance

### Requirement 14: Hata Loglama ve İzleme

**User Story:** Sistem yöneticisi olarak, ödeme işlemlerindeki hataları izlemek istiyorum, böylece sorunları hızlıca tespit edip çözebilirim.

#### Acceptance Criteria

1. THE Payment_Service SHALL log all API requests to Dodo_Payments_API with timestamp, endpoint, and response status
2. WHEN an error occurs, THE Payment_Service SHALL log error message, stack trace, user_id, and transaction_id
3. THE Payment_Service SHALL categorize errors as "api_error", "validation_error", "database_error", or "webhook_error"
4. THE Payment_Service SHALL send critical errors to admin notification channel within 1 minute
5. THE Payment_Service SHALL store logs for minimum 90 days

### Requirement 15: Test Modu Desteği

**User Story:** Geliştirici olarak, production ortamını etkilemeden ödeme sistemini test etmek istiyorum, böylece güvenli şekilde geliştirme yapabilirim.

#### Acceptance Criteria

1. WHERE test mode is enabled, THE Payment_Service SHALL use Dodo Payments test API endpoint
2. WHERE test mode is enabled, THE Payment_Service SHALL prefix all transaction_id values with "TEST_"
3. WHERE test mode is enabled, THE Payment_Service SHALL not send real emails to users
4. WHERE test mode is enabled, THE Payment_Service SHALL log all actions with "TEST MODE" prefix
5. THE Payment_Service SHALL determine test mode from TEST_MODE environment variable

