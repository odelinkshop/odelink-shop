# Dodo Payments API Documentation

## Overview

This document describes the Dodo Payments integration API endpoints for the Odelink platform. The integration enables users to purchase subscription plans and advertisement packages through secure payment links.

## Base URL

```
Production: https://odelink.shop/api/payments
Development: http://localhost:5000/api/payments
```

## Authentication

All endpoints (except webhook) require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Payment Link

Creates a payment link for subscription or advertisement package purchase.

**Endpoint:** `POST /api/payments/create-link`

**Authentication:** Required

**Rate Limit:** 10 requests per minute

**Request Body:**

```json
{
  "productType": "subscription",
  "productId": "standard_monthly",
  "tier": "standart",
  "billingCycle": "monthly"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productType | string | Yes | Type of product: `subscription` or `ad_package` |
| productId | string | Yes | Product identifier (see Product IDs below) |
| tier | string | Conditional | Required for subscriptions: `standart` or `profesyonel` |
| billingCycle | string | Conditional | Required for subscriptions: `monthly` or `yearly` |

**Product IDs:**

Subscriptions:
- `standard_monthly` - Standart Aylık Plan (₺299/ay)
- `professional_yearly` - Profesyonel Yıllık Plan (₺399/yıl)

Ad Packages:
- `ad_basic` - Başlangıç Paketi (₺500)
- `ad_professional` - Profesyonel Paketi (₺1,200)
- `ad_premium` - Premium Paketi (₺2,500)

**Success Response (200 OK):**

```json
{
  "success": true,
  "paymentUrl": "https://checkout.dodopayments.com/session_abc123",
  "transactionId": "txn_1234567890_abc123def456",
  "sessionId": "session_abc123"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid parameters
{
  "error": "productType ve productId gereklidir"
}

// 400 Bad Request - Invalid product
{
  "error": "Geçersiz abonelik ürünü"
}

// 404 Not Found - User not found
{
  "error": "Kullanıcı bulunamadı"
}

// 429 Too Many Requests - Rate limit exceeded
{
  "error": "Çok fazla ödeme isteği. Lütfen bir dakika sonra tekrar deneyin."
}

// 500 Internal Server Error
{
  "error": "Ödeme bağlantısı oluşturulamadı"
}
```

---

### 2. Get Payment Status

Retrieves the current status of a payment transaction.

**Endpoint:** `GET /api/payments/status/:transactionId`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| transactionId | string | Transaction ID returned from create-link |

**Success Response (200 OK):**

```json
{
  "status": "completed",
  "amount": 299.00,
  "currency": "TRY",
  "productType": "subscription",
  "productId": "standard_monthly",
  "paymentDate": "2024-01-15T10:30:00.000Z",
  "paymentMethod": "card",
  "createdAt": "2024-01-15T10:25:00.000Z"
}
```

**Status Values:**

- `pending` - Payment is being processed
- `completed` - Payment successful
- `failed` - Payment failed

**Error Responses:**

```json
// 404 Not Found - Payment not found
{
  "error": "Ödeme kaydı bulunamadı"
}

// 403 Forbidden - Not authorized
{
  "error": "Bu ödeme kaydına erişim yetkiniz yok"
}

// 500 Internal Server Error
{
  "error": "Ödeme durumu sorgulanamadı"
}
```

---

### 3. Get Payment History

Retrieves paginated payment history for the authenticated user.

**Endpoint:** `GET /api/payments/history`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |

**Success Response (200 OK):**

```json
{
  "payments": [
    {
      "transaction_id": "txn_1234567890_abc123",
      "amount": 299.00,
      "currency": "TRY",
      "product_type": "subscription",
      "product_id": "standard_monthly",
      "status": "completed",
      "payment_method": "card",
      "payment_date": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:25:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "totalPages": 1
}
```

**Error Response:**

```json
// 500 Internal Server Error
{
  "error": "Ödeme geçmişi alınamadı"
}
```

---

### 4. Admin: Get All Payments

Retrieves all payments with filtering options (admin only).

**Endpoint:** `GET /api/payments/admin/all`

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by user ID |
| status | string | Filter by status: `pending`, `completed`, `failed` |
| productType | string | Filter by product type: `subscription`, `ad_package` |
| startDate | string | Filter by start date (ISO 8601) |
| endDate | string | Filter by end date (ISO 8601) |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

**Success Response (200 OK):**

```json
{
  "payments": [...],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

**Error Responses:**

```json
// 403 Forbidden - Not admin
{
  "error": "Bu işlem için yetkiniz yok"
}

// 500 Internal Server Error
{
  "error": "Ödemeler alınamadı"
}
```

---

### 5. Admin: Manually Complete Payment

Manually marks a payment as completed and activates the subscription/credits (admin only).

**Endpoint:** `POST /api/payments/admin/complete/:transactionId`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| transactionId | string | Transaction ID to complete |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Ödeme manuel olarak tamamlandı"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "error": "Ödeme kaydı bulunamadı"
}

// 400 Bad Request - Already completed
{
  "error": "Ödeme zaten tamamlanmış"
}

// 403 Forbidden - Not admin
{
  "error": "Bu işlem için yetkiniz yok"
}

// 500 Internal Server Error
{
  "error": "Ödeme tamamlanamadı"
}
```

---

### 6. Webhook Endpoint

Receives webhook notifications from Dodo Payments (public endpoint, signature verified).

**Endpoint:** `POST /api/payments/webhook/dodo`

**Authentication:** Webhook signature verification

**Rate Limit:** 100 requests per minute per IP

**Headers:**

```
webhook-id: evt_abc123
webhook-timestamp: 1705315800
webhook-signature: v1,g0hM9SsE+OTPJTGt/tmzilEP3rEMTbv5R+bBPTHO1Vk=
```

**Request Body:**

```json
{
  "business_id": "business_123",
  "type": "payment.succeeded",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "payload_type": "Payment",
    "payment_id": "pay_123",
    "amount": 299,
    "currency": "TRY",
    "status": "succeeded",
    "payment_method": "card",
    "paid_at": "2024-01-15T10:30:00Z",
    "metadata": {
      "user_id": "user_123",
      "product_type": "subscription",
      "transaction_id": "txn_1234567890_abc123"
    }
  }
}
```

**Event Types:**

- `payment.succeeded` - Payment completed successfully
- `payment.failed` - Payment failed

**Success Response (200 OK):**

```json
{
  "received": true
}
```

**Error Responses:**

```json
// 401 Unauthorized - Invalid signature
{
  "error": "Invalid webhook signature"
}

// 429 Too Many Requests
{
  "error": "Webhook rate limit exceeded"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Payment Flow

### User Payment Flow

1. **User selects plan** on pricing page
2. **Frontend calls** `POST /api/payments/create-link`
3. **Backend creates** payment record and Dodo Payments checkout session
4. **User redirects** to Dodo Payments checkout URL
5. **User completes** payment on Dodo Payments
6. **Dodo Payments sends** webhook to `POST /api/payments/webhook/dodo`
7. **Backend processes** webhook and activates subscription/credits
8. **User redirects** back to `/payment/status?transactionId=xxx`
9. **Frontend polls** `GET /api/payments/status/:transactionId` until completed

### Webhook Processing Flow

1. **Webhook received** at `/api/payments/webhook/dodo`
2. **Signature verified** using webhook secret
3. **Idempotency check** - prevent duplicate processing
4. **Event type determined** (payment.succeeded or payment.failed)
5. **Payment record updated** with status and details
6. **For successful payments:**
   - Subscription activated (if subscription product)
   - Credits added (if ad package product)
   - Confirmation email sent
7. **For failed payments:**
   - Failure reason recorded
   - Failure notification email sent
8. **Response sent** to Dodo Payments (200 OK)

---

## Testing

### Test Mode

Set `TEST_MODE=true` in environment variables to enable test mode:

- Uses Dodo Payments test API endpoint
- Transaction IDs prefixed with `TEST_`
- No real emails sent (logged instead)
- All logs prefixed with `[TEST MODE]`

### Test Cards

Use Dodo Payments test cards for testing:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Insufficient Funds:** 4000 0000 0000 9995

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/payments/create-link | 10 requests/minute |
| POST /api/payments/webhook/dodo | 100 requests/minute per IP |
| Other endpoints | No specific limit (general API limits apply) |

---

## Security

### Authentication

- JWT tokens required for all user endpoints
- Admin endpoints require admin role in JWT
- Webhook endpoint uses signature verification

### CSRF Protection

- CSRF tokens generated for payment initiation
- Tokens stored in session with 15-minute expiration
- Validated on payment callback

### Webhook Security

- HMAC SHA256 signature verification
- Constant-time comparison to prevent timing attacks
- Idempotency check using `dodo_transaction_id`

---

## Support

For issues or questions:

- Email: support@odelink.shop
- Documentation: https://odelink.shop/docs
- Dodo Payments Docs: https://docs.dodopayments.com

---

**Last Updated:** 2024-01-15
**API Version:** 1.0
