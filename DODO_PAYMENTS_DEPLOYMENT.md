# Dodo Payments Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Dodo Payments integration to production.

## Prerequisites

Before deploying, ensure you have:

1. **Dodo Payments Account**
   - Sign up at https://dodopayments.com
   - Complete business verification
   - Obtain API credentials

2. **Product IDs from Dodo Payments Dashboard**
   - Create products for each subscription plan and ad package
   - Note down the product IDs

3. **Webhook Secret**
   - Configure webhook endpoint in Dodo Payments dashboard
   - Copy the webhook signing secret

4. **Database Access**
   - PostgreSQL database with admin access
   - Ability to run migrations

## Step 1: Database Migration

Run the database migration to create the required tables:

```bash
cd backend
node config/runMigrations.js
```

This will create:
- `payments` table
- `advertisement_credits` table
- Required indexes and triggers

**Verify migration:**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'advertisement_credits');

-- Check payments table structure
\d payments

-- Check advertisement_credits table structure
\d advertisement_credits
```

## Step 2: Configure Environment Variables

### Backend Configuration

Update `backend/.env` with Dodo Payments credentials:

```bash
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=your_live_api_key_here
DODO_WEBHOOK_SECRET=your_webhook_secret_here
TEST_MODE=false

# Dodo Payments Product IDs (from Dodo Payments dashboard)
DODO_PRODUCT_STANDARD_MONTHLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_PROFESSIONAL_YEARLY=prod_xxxxxxxxxxxxx
DODO_PRODUCT_AD_BASIC=prod_xxxxxxxxxxxxx
DODO_PRODUCT_AD_PROFESSIONAL=prod_xxxxxxxxxxxxx
DODO_PRODUCT_AD_PREMIUM=prod_xxxxxxxxxxxxx

# Frontend URL for redirects
FRONTEND_URL=https://odelink.shop
```

**Important:** Never commit `.env` file to version control!

### Getting Product IDs

1. Log in to Dodo Payments Dashboard
2. Navigate to Products section
3. Create products for each plan:

   **Subscription Products:**
   - Name: "Standart Aylık Plan"
     - Price: ₺299
     - Billing: Monthly
     - Copy Product ID → `DODO_PRODUCT_STANDARD_MONTHLY`
   
   - Name: "Profesyonel Yıllık Plan"
     - Price: ₺399
     - Billing: Yearly
     - Copy Product ID → `DODO_PRODUCT_PROFESSIONAL_YEARLY`

   **Ad Package Products:**
   - Name: "Başlangıç Reklam Paketi"
     - Price: ₺500
     - Type: One-time
     - Copy Product ID → `DODO_PRODUCT_AD_BASIC`
   
   - Name: "Profesyonel Reklam Paketi"
     - Price: ₺1,200
     - Type: One-time
     - Copy Product ID → `DODO_PRODUCT_AD_PROFESSIONAL`
   
   - Name: "Premium Reklam Paketi"
     - Price: ₺2,500
     - Type: One-time
     - Copy Product ID → `DODO_PRODUCT_AD_PREMIUM`

## Step 3: Configure Webhook in Dodo Payments

1. **Go to Dodo Payments Dashboard** → Webhooks
2. **Add Webhook Endpoint:**
   - URL: `https://odelink.shop/api/payments/webhook/dodo`
   - Events to subscribe:
     - ✅ `payment.succeeded`
     - ✅ `payment.failed`
     - ✅ `subscription.active` (optional)
     - ✅ `subscription.cancelled` (optional)
3. **Copy Webhook Secret** → Add to `DODO_WEBHOOK_SECRET` in `.env`
4. **Test Webhook:**
   - Use Dodo Payments dashboard to send test webhook
   - Check backend logs for successful verification

## Step 4: Test in Test Mode

Before going live, test the integration in test mode:

1. **Enable Test Mode:**
   ```bash
   TEST_MODE=true
   DODO_PAYMENTS_API_KEY=your_test_api_key_here
   ```

2. **Restart Backend:**
   ```bash
   cd backend
   npm restart
   ```

3. **Test Payment Flow:**
   - Select a plan on pricing page
   - Complete payment with test card: `4242 4242 4242 4242`
   - Verify payment status updates
   - Check subscription/credits activated
   - Verify email notifications (logged, not sent)

4. **Test Webhook:**
   - Use Dodo Payments dashboard to send test webhooks
   - Verify webhook signature validation
   - Check payment processing logic

5. **Test Failed Payment:**
   - Use decline test card: `4000 0000 0000 0002`
   - Verify failure handling
   - Check failure notification

## Step 5: Deploy Backend

### Option A: VPS Deployment

1. **Pull Latest Code:**
   ```bash
   cd /path/to/odelink-shop
   git pull origin main
   ```

2. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Run Migrations:**
   ```bash
   node config/runMigrations.js
   ```

4. **Restart Backend Service:**
   ```bash
   pm2 restart odelink-backend
   # or
   systemctl restart odelink-backend
   ```

5. **Verify Backend Running:**
   ```bash
   pm2 logs odelink-backend
   # Check for "✅ Payment routes loaded"
   ```

### Option B: Docker Deployment

1. **Rebuild Docker Image:**
   ```bash
   docker-compose build backend
   ```

2. **Run Migrations:**
   ```bash
   docker-compose exec backend node config/runMigrations.js
   ```

3. **Restart Services:**
   ```bash
   docker-compose restart backend
   ```

4. **Check Logs:**
   ```bash
   docker-compose logs -f backend
   ```

## Step 6: Deploy Frontend

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Build:**
   ```bash
   # Copy build to web server
   rsync -avz build/ user@server:/var/www/odelink-shop/
   ```

3. **Verify Frontend:**
   - Visit https://odelink.shop
   - Check pricing page loads
   - Verify payment buttons work

## Step 7: Production Testing

### Test Complete Payment Flow

1. **Create Test Payment:**
   - Log in to Odelink
   - Go to pricing page
   - Select a plan
   - Click "Paketi Seç"
   - Verify redirect to Dodo Payments

2. **Complete Payment:**
   - Use real payment method (small amount recommended)
   - Complete payment on Dodo Payments
   - Verify redirect back to Odelink

3. **Verify Activation:**
   - Check payment status page shows "completed"
   - Verify subscription activated in dashboard
   - Check email received
   - Verify database records:
     ```sql
     SELECT * FROM payments WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1;
     SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 1;
     ```

4. **Test Payment History:**
   - Navigate to `/payment/history`
   - Verify payment appears in list
   - Check all details correct

### Test Webhook Delivery

1. **Monitor Webhook Logs:**
   ```bash
   # Backend logs
   pm2 logs odelink-backend | grep "Webhook"
   ```

2. **Check Webhook in Dodo Dashboard:**
   - Go to Webhooks section
   - View webhook delivery logs
   - Verify 200 OK responses

3. **Test Webhook Retry:**
   - Temporarily stop backend
   - Make a payment
   - Restart backend
   - Verify Dodo Payments retries webhook
   - Check payment processed correctly

## Step 8: Monitoring Setup

### Application Logs

Monitor payment-related logs:

```bash
# All payment operations
pm2 logs odelink-backend | grep "💳\|✅\|❌"

# Webhook events
pm2 logs odelink-backend | grep "📥\|📦"

# Errors only
pm2 logs odelink-backend --err
```

### Database Monitoring

Create monitoring queries:

```sql
-- Recent payments
SELECT 
  transaction_id,
  user_id,
  amount,
  product_type,
  status,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 20;

-- Payment statistics
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payments
GROUP BY status;

-- Failed payments (last 24 hours)
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

-- Pending payments (older than 1 hour)
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

### Alert Setup

Set up alerts for:

1. **Failed Payments > 10% in last hour**
2. **Webhook signature verification failures**
3. **Pending payments older than 2 hours**
4. **Payment processing errors**

## Step 9: Disable Old Payment System (Optional)

If migrating from Shopier:

1. **Keep Shopier code** (don't delete)
2. **Update environment:**
   ```bash
   PAYMENT_PROVIDER=dodo  # Switch to Dodo Payments
   ```
3. **Monitor for issues**
4. **After 30 days of stable operation**, consider removing Shopier code

## Rollback Plan

If issues occur, rollback procedure:

1. **Switch back to Shopier:**
   ```bash
   PAYMENT_PROVIDER=shopier
   ```

2. **Restart backend:**
   ```bash
   pm2 restart odelink-backend
   ```

3. **Verify Shopier payments work**

4. **Investigate Dodo Payments issues**

## Troubleshooting

### Issue: Payment link creation fails

**Check:**
- API key is correct and active
- Product IDs are valid
- User is authenticated
- Rate limits not exceeded

**Solution:**
```bash
# Check backend logs
pm2 logs odelink-backend | grep "Payment link creation error"

# Verify API key
curl -H "Authorization: Bearer $DODO_PAYMENTS_API_KEY" \
  https://api.dodopayments.com/v1/products
```

### Issue: Webhook signature verification fails

**Check:**
- Webhook secret is correct
- Request body is not modified
- Headers are present

**Solution:**
```bash
# Check webhook logs
pm2 logs odelink-backend | grep "Webhook signature verification"

# Verify webhook secret in Dodo dashboard matches .env
```

### Issue: Payment status stuck on "pending"

**Check:**
- Webhook endpoint is accessible
- Webhook is configured in Dodo dashboard
- No firewall blocking webhook requests

**Solution:**
```bash
# Check if webhook endpoint is accessible
curl -X POST https://odelink.shop/api/payments/webhook/dodo

# Check webhook delivery in Dodo dashboard
# Manually complete payment if needed (admin panel)
```

### Issue: Subscription not activated after payment

**Check:**
- Webhook processed successfully
- Payment status is "completed"
- Subscription creation logic executed

**Solution:**
```sql
-- Check payment record
SELECT * FROM payments WHERE transaction_id = 'txn_xxx';

-- Check subscription record
SELECT * FROM user_subscriptions WHERE user_id = 'user_xxx' ORDER BY created_at DESC LIMIT 1;

-- Manually activate if needed (admin panel)
```

## Security Checklist

Before going live:

- [ ] `TEST_MODE=false` in production
- [ ] API keys are production keys (not test keys)
- [ ] Webhook secret is configured correctly
- [ ] `.env` file is not in version control
- [ ] HTTPS is enabled for webhook endpoint
- [ ] Rate limiting is active
- [ ] CSRF protection is enabled
- [ ] Database backups are configured
- [ ] Monitoring and alerts are set up

## Post-Deployment

After successful deployment:

1. **Monitor for 24 hours:**
   - Check logs every 2 hours
   - Verify payments processing correctly
   - Monitor webhook delivery

2. **Test edge cases:**
   - Multiple simultaneous payments
   - Payment cancellation
   - Subscription renewal

3. **Update documentation:**
   - Document any issues encountered
   - Update runbooks
   - Train support team

4. **Communicate to users:**
   - Announce new payment system
   - Provide support contact
   - Monitor support tickets

## Support

For deployment issues:

- **Technical Issues:** Check logs and troubleshooting section
- **Dodo Payments Issues:** Contact Dodo Payments support
- **Database Issues:** Check migration logs and database status

---

**Deployment Checklist:**

- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Webhook configured in Dodo dashboard
- [ ] Test mode testing completed
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Production payment tested
- [ ] Webhook delivery verified
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Rollback plan documented
- [ ] Team trained

---

**Last Updated:** 2024-01-15
**Version:** 1.0
