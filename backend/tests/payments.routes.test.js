jest.mock('../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../services/dodoPaymentsService', () => ({
  dodoPaymentsService: {
    createCheckoutSession: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    parseWebhookPayload: jest.fn(),
    getPaymentStatus: jest.fn()
  },
  DodoPaymentsService: jest.fn(),
  PaymentError: Error
}));

jest.mock('../services/emailNotificationService', () => ({
  sendSubscriptionConfirmation: jest.fn(),
  sendPaymentFailure: jest.fn(),
  sendCreditConfirmation: jest.fn(),
  sendRenewalConfirmation: jest.fn()
}));

jest.mock('../models/Payment', () => ({
  create: jest.fn(),
  findByTransactionId: jest.fn(),
  findByDodoTransactionId: jest.fn(),
  updateStatus: jest.fn(),
  getUserPayments: jest.fn(),
  getAllPayments: jest.fn()
}));

jest.mock('../models/Subscription', () => ({
  getAll: jest.fn(),
  createSubscription: jest.fn(),
  getUserSubscription: jest.fn()
}));

jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../middleware/auth', () => (req, res, next) => {
  if (req.headers.authorization === 'Bearer admin-token') {
    req.userId = 'admin-user-id';
    req.isAdmin = true;
  } else if (req.headers.authorization === 'Bearer user-token') {
    req.userId = 'user-id';
    req.isAdmin = false;
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

jest.mock('../middleware/adminOnly', () => (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
});

const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../routes/payments');
const { dodoPaymentsService } = require('../services/dodoPaymentsService');
const EmailNotificationService = require('../services/emailNotificationService');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments/create-link', () => {
    test('creates payment link for subscription', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-id',
        transaction_id: 'txn_123',
        amount: 299.00,
        status: 'pending'
      };

      User.findById.mockResolvedValue(mockUser);
      Payment.create.mockResolvedValue(mockPayment);
      dodoPaymentsService.createCheckoutSession.mockResolvedValue({
        checkoutUrl: 'https://checkout.dodopayments.com/session_123',
        sessionId: 'session_123'
      });

      const response = await request(app)
        .post('/api/payments/create-link')
        .set('Authorization', 'Bearer user-token')
        .send({
          productType: 'subscription',
          productId: 'standard_monthly',
          tier: 'standart',
          billingCycle: 'monthly'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        paymentUrl: 'https://checkout.dodopayments.com/session_123',
        transactionId: expect.any(String),
        sessionId: 'session_123'
      });
      expect(Payment.create).toHaveBeenCalled();
      expect(dodoPaymentsService.createCheckoutSession).toHaveBeenCalled();
    });

    test('returns 400 for missing productType', async () => {
      const response = await request(app)
        .post('/api/payments/create-link')
        .set('Authorization', 'Bearer user-token')
        .send({
          productId: 'standard_monthly'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('productType');
    });

    test('returns 400 for invalid productType', async () => {
      const response = await request(app)
        .post('/api/payments/create-link')
        .set('Authorization', 'Bearer user-token')
        .send({
          productType: 'invalid_type',
          productId: 'standard_monthly'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Geçersiz');
    });

    test('returns 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/payments/create-link')
        .set('Authorization', 'Bearer user-token')
        .send({
          productType: 'subscription',
          productId: 'standard_monthly'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Kullanıcı');
    });

    test('returns 400 for invalid product ID', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com'
      };

      User.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/payments/create-link')
        .set('Authorization', 'Bearer user-token')
        .send({
          productType: 'subscription',
          productId: 'invalid_product'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Geçersiz');
    });
  });

  describe('GET /api/payments/status/:transactionId', () => {
    test('returns payment status for user', async () => {
      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-id',
        transaction_id: 'txn_123',
        status: 'completed',
        amount: 299.00,
        currency: 'TRY',
        product_type: 'subscription',
        product_id: 'standard_monthly',
        payment_method: 'credit_card',
        payment_date: new Date(),
        created_at: new Date()
      };

      Payment.findByTransactionId.mockResolvedValue(mockPayment);

      const response = await request(app)
        .get('/api/payments/status/txn_123')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'completed',
        amount: 299.00,
        currency: 'TRY',
        productType: 'subscription',
        productId: 'standard_monthly',
        paymentDate: mockPayment.payment_date.toISOString(),
        paymentMethod: 'credit_card',
        createdAt: mockPayment.created_at.toISOString()
      });
    });

    test('returns 404 when payment not found', async () => {
      Payment.findByTransactionId.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/payments/status/nonexistent')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('bulunamadı');
    });

    test('returns 403 when user tries to access other user payment', async () => {
      const mockPayment = {
        id: 'payment-1',
        user_id: 'other-user-id',
        transaction_id: 'txn_123',
        status: 'completed'
      };

      Payment.findByTransactionId.mockResolvedValue(mockPayment);

      const response = await request(app)
        .get('/api/payments/status/txn_123')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('yetkiniz');
    });

    test('queries Dodo API for pending payment older than 10 minutes', async () => {
      const createdAt = new Date(Date.now() - 11 * 60 * 1000); // 11 minutes ago
      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-id',
        transaction_id: 'txn_123',
        status: 'pending',
        dodo_transaction_id: 'dodo_123',
        amount: 299.00,
        currency: 'TRY',
        product_type: 'subscription',
        product_id: 'standard_monthly',
        payment_method: null,
        payment_date: null,
        created_at: createdAt
      };

      Payment.findByTransactionId.mockResolvedValue(mockPayment);
      dodoPaymentsService.getPaymentStatus.mockResolvedValue({
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentDate: new Date()
      });
      Payment.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: 'completed'
      });

      const response = await request(app)
        .get('/api/payments/status/txn_123')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(200);
      expect(dodoPaymentsService.getPaymentStatus).toHaveBeenCalledWith('dodo_123');
      expect(Payment.updateStatus).toHaveBeenCalled();
    });
  });

  describe('GET /api/payments/history', () => {
    test('returns user payment history with pagination', async () => {
      const mockResult = {
        payments: [
          { id: 'payment-1', amount: 299.00, status: 'completed' },
          { id: 'payment-2', amount: 500.00, status: 'completed' }
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1
      };

      Payment.getUserPayments.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(Payment.getUserPayments).toHaveBeenCalledWith('user-id', {
        page: 1,
        limit: 20
      });
    });

    test('supports custom pagination parameters', async () => {
      const mockResult = {
        payments: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0
      };

      Payment.getUserPayments.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/payments/history?page=2&limit=10')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(200);
      expect(Payment.getUserPayments).toHaveBeenCalledWith('user-id', {
        page: 2,
        limit: 10
      });
    });
  });

  describe('GET /api/payments/admin/all', () => {
    test('returns all payments for admin', async () => {
      const mockResult = {
        payments: [
          { id: 'payment-1', user_id: 'user-1', amount: 299.00 },
          { id: 'payment-2', user_id: 'user-2', amount: 500.00 }
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1
      };

      Payment.getAllPayments.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    test('returns 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(403);
    });

    test('supports filtering by status', async () => {
      const mockResult = {
        payments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };

      Payment.getAllPayments.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/payments/admin/all?status=completed')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(Payment.getAllPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed'
        })
      );
    });

    test('supports filtering by multiple criteria', async () => {
      const mockResult = {
        payments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };

      Payment.getAllPayments.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/payments/admin/all?userId=user-1&status=completed&productType=subscription')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(Payment.getAllPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          status: 'completed',
          productType: 'subscription'
        })
      );
    });
  });

  describe('POST /api/payments/admin/complete/:transactionId', () => {
    test('manually completes payment and activates subscription', async () => {
      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-id',
        transaction_id: 'txn_123',
        status: 'pending',
        amount: 299.00,
        product_type: 'subscription',
        tier: 'standart',
        billing_cycle: 'monthly'
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockPlan = {
        id: 'plan-1',
        name: 'Standart'
      };

      Payment.findByTransactionId.mockResolvedValue(mockPayment);
      Payment.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: 'completed'
      });
      User.findById.mockResolvedValue(mockUser);
      Subscription.getAll.mockResolvedValue([mockPlan]);
      Subscription.createSubscription.mockResolvedValue({ ok: true });
      EmailNotificationService.sendSubscriptionConfirmation.mockResolvedValue({ ok: true });

      const response = await request(app)
        .post('/api/payments/admin/complete/txn_123')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Payment.updateStatus).toHaveBeenCalledWith(
        'txn_123',
        'completed',
        expect.objectContaining({
          paymentMethod: 'manual_admin'
        })
      );
      expect(Subscription.createSubscription).toHaveBeenCalled();
    });

    test('returns 404 when payment not found', async () => {
      Payment.findByTransactionId.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/payments/admin/complete/nonexistent')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('bulunamadı');
    });

    test('returns 400 when payment already completed', async () => {
      const mockPayment = {
        id: 'payment-1',
        transaction_id: 'txn_123',
        status: 'completed'
      };

      Payment.findByTransactionId.mockResolvedValue(mockPayment);

      const response = await request(app)
        .post('/api/payments/admin/complete/txn_123')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('zaten');
    });

    test('returns 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/payments/admin/complete/txn_123')
        .set('Authorization', 'Bearer user-token');

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/payments/webhook/dodo', () => {
    test('processes successful payment webhook', async () => {
      const webhookPayload = {
        business_id: 'business_123',
        type: 'payment.succeeded',
        data: {
          payment_id: 'dodo_123',
          amount: 299.00,
          payment_method: 'credit_card',
          paid_at: new Date().toISOString(),
          metadata: {
            transaction_id: 'txn_123'
          }
        }
      };

      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-id',
        transaction_id: 'txn_123',
        status: 'pending',
        amount: 299.00,
        product_type: 'subscription',
        tier: 'standart',
        billing_cycle: 'monthly'
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockPlan = {
        id: 'plan-1',
        name: 'Standart'
      };

      dodoPaymentsService.verifyWebhookSignature.mockReturnValue(true);
      dodoPaymentsService.parseWebhookPayload.mockReturnValue({
        eventType: 'payment.succeeded',
        businessId: 'business_123',
        data: webhookPayload.data
      });
      Payment.findByDodoTransactionId.mockResolvedValue(null);
      Payment.findByTransactionId.mockResolvedValue(mockPayment);
      Payment.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: 'completed'
      });
      User.findById.mockResolvedValue(mockUser);
      Subscription.getAll.mockResolvedValue([mockPlan]);
      Subscription.createSubscription.mockResolvedValue({ ok: true });
      EmailNotificationService.sendSubscriptionConfirmation.mockResolvedValue({ ok: true });

      const response = await request(app)
        .post('/api/payments/webhook/dodo')
        .send(webhookPayload)
        .set('webhook-id', 'webhook_123')
        .set('webhook-timestamp', new Date().toISOString())
        .set('webhook-signature', 'sig_123');

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
      expect(dodoPaymentsService.verifyWebhookSignature).toHaveBeenCalled();
      expect(Payment.updateStatus).toHaveBeenCalledWith(
        'txn_123',
        'completed',
        expect.any(Object)
      );
    });

    test('rejects webhook with invalid signature', async () => {
      dodoPaymentsService.verifyWebhookSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/webhook/dodo')
        .send({ type: 'payment.succeeded' })
        .set('webhook-id', 'webhook_123')
        .set('webhook-timestamp', new Date().toISOString())
        .set('webhook-signature', 'invalid_sig');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    test('handles idempotent webhook processing', async () => {
      const webhookPayload = {
        business_id: 'business_123',
        type: 'payment.succeeded',
        data: {
          payment_id: 'dodo_123',
          metadata: {
            transaction_id: 'txn_123'
          }
        }
      };

      const mockExistingPayment = {
        id: 'payment-1',
        status: 'completed'
      };

      dodoPaymentsService.verifyWebhookSignature.mockReturnValue(true);
      dodoPaymentsService.parseWebhookPayload.mockReturnValue({
        eventType: 'payment.succeeded',
        data: webhookPayload.data
      });
      Payment.findByDodoTransactionId.mockResolvedValue(mockExistingPayment);

      const response = await request(app)
        .post('/api/payments/webhook/dodo')
        .send(webhookPayload)
        .set('webhook-id', 'webhook_123')
        .set('webhook-timestamp', new Date().toISOString())
        .set('webhook-signature', 'sig_123');

      expect(response.status).toBe(200);
      expect(response.body.idempotent).toBe(true);
    });

    test('processes failed payment webhook', async () => {
      const webhookPayload = {
        business_id: 'business_123',
        type: 'payment.failed',
        data: {
          payment_id: 'dodo_123',
          failure_reason: 'Insufficient funds',
          metadata: {
            transaction_id: 'txn_123'
          }
        }
      };

      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-id',
        transaction_id: 'txn_123',
        status: 'pending',
        product_type: 'subscription'
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      };

      dodoPaymentsService.verifyWebhookSignature.mockReturnValue(true);
      dodoPaymentsService.parseWebhookPayload.mockReturnValue({
        eventType: 'payment.failed',
        data: webhookPayload.data
      });
      Payment.findByDodoTransactionId.mockResolvedValue(null);
      Payment.findByTransactionId.mockResolvedValue(mockPayment);
      Payment.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: 'failed'
      });
      User.findById.mockResolvedValue(mockUser);
      EmailNotificationService.sendPaymentFailure.mockResolvedValue({ ok: true });

      const response = await request(app)
        .post('/api/payments/webhook/dodo')
        .send(webhookPayload)
        .set('webhook-id', 'webhook_123')
        .set('webhook-timestamp', new Date().toISOString())
        .set('webhook-signature', 'sig_123');

      expect(response.status).toBe(200);
      expect(Payment.updateStatus).toHaveBeenCalledWith(
        'txn_123',
        'failed',
        expect.any(Object)
      );
      expect(EmailNotificationService.sendPaymentFailure).toHaveBeenCalled();
    });
  });
});
