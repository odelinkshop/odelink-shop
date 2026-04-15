jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');
const Payment = require('../models/Payment');

describe('Payment model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('creates payment record with required fields', async () => {
      const mockPayment = {
        id: 'payment-1',
        user_id: 'user-1',
        transaction_id: 'txn_123',
        amount: 299.00,
        currency: 'TRY',
        product_type: 'subscription',
        product_id: 'standard_monthly',
        tier: 'standart',
        billing_cycle: 'monthly',
        status: 'pending'
      };

      pool.query.mockResolvedValue({ rows: [mockPayment] });

      const result = await Payment.create({
        userId: 'user-1',
        transactionId: 'txn_123',
        amount: 299.00,
        productType: 'subscription',
        productId: 'standard_monthly',
        tier: 'standart',
        billingCycle: 'monthly'
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO payments'),
        expect.arrayContaining([
          'user-1',
          'txn_123',
          299.00,
          'TRY',
          'subscription',
          'standard_monthly',
          'standart',
          'monthly',
          expect.any(String) // metadata JSON
        ])
      );
      expect(result).toEqual(mockPayment);
    });

    test('creates payment with default currency TRY', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 'payment-1' }] });

      await Payment.create({
        userId: 'user-1',
        transactionId: 'txn_123',
        amount: 500.00,
        productType: 'ad_package',
        productId: 'ad_basic'
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['TRY'])
      );
    });
  });

  describe('findByTransactionId', () => {
    test('finds payment by transaction ID', async () => {
      const mockPayment = { id: 'payment-1', transaction_id: 'txn_123' };
      pool.query.mockResolvedValue({ rows: [mockPayment] });

      const result = await Payment.findByTransactionId('txn_123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM payments WHERE transaction_id = $1',
        ['txn_123']
      );
      expect(result).toEqual(mockPayment);
    });

    test('returns null when payment not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Payment.findByTransactionId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByDodoTransactionId', () => {
    test('finds payment by Dodo transaction ID', async () => {
      const mockPayment = { id: 'payment-1', dodo_transaction_id: 'dodo_123' };
      pool.query.mockResolvedValue({ rows: [mockPayment] });

      const result = await Payment.findByDodoTransactionId('dodo_123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM payments WHERE dodo_transaction_id = $1',
        ['dodo_123']
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('updateStatus', () => {
    test('updates payment status to completed', async () => {
      const mockUpdated = {
        id: 'payment-1',
        status: 'completed',
        dodo_transaction_id: 'dodo_123',
        payment_method: 'credit_card',
        payment_date: new Date()
      };
      pool.query.mockResolvedValue({ rows: [mockUpdated] });

      const result = await Payment.updateStatus('txn_123', 'completed', {
        dodoTransactionId: 'dodo_123',
        paymentMethod: 'credit_card',
        paymentDate: new Date()
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE payments'),
        expect.arrayContaining([
          'txn_123',
          'completed',
          'dodo_123',
          'credit_card'
        ])
      );
      expect(result).toEqual(mockUpdated);
    });

    test('updates payment status to failed with reason', async () => {
      const mockUpdated = {
        id: 'payment-1',
        status: 'failed',
        failure_reason: 'Insufficient funds'
      };
      pool.query.mockResolvedValue({ rows: [mockUpdated] });

      await Payment.updateStatus('txn_123', 'failed', {
        failureReason: 'Insufficient funds'
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'txn_123',
          'failed',
          null,
          null,
          null,
          'Insufficient funds'
        ])
      );
    });
  });

  describe('getUserPayments', () => {
    test('returns paginated payment history for user', async () => {
      const mockPayments = [
        { id: 'payment-1', amount: 299.00 },
        { id: 'payment-2', amount: 500.00 }
      ];
      
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 2 }] })
        .mockResolvedValueOnce({ rows: mockPayments });

      const result = await Payment.getUserPayments('user-1', { page: 1, limit: 20 });

      expect(result).toEqual({
        payments: mockPayments,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1
      });
    });

    test('calculates pagination correctly', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 45 }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await Payment.getUserPayments('user-1', { page: 2, limit: 20 });

      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);
    });
  });

  describe('getAllPayments', () => {
    test('returns all payments with user info', async () => {
      const mockPayments = [
        { id: 'payment-1', user_id: 'user-1', email: 'test@example.com' }
      ];
      
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 1 }] })
        .mockResolvedValueOnce({ rows: mockPayments });

      const result = await Payment.getAllPayments();

      expect(result.payments).toEqual(mockPayments);
      expect(result.total).toBe(1);
    });

    test('filters by status', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 5 }] })
        .mockResolvedValueOnce({ rows: [] });

      await Payment.getAllPayments({ status: 'completed' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        expect.arrayContaining(['completed'])
      );
    });

    test('filters by multiple criteria', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 3 }] })
        .mockResolvedValueOnce({ rows: [] });

      await Payment.getAllPayments({
        userId: 'user-1',
        status: 'completed',
        productType: 'subscription'
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND status = $2 AND product_type = $3'),
        expect.arrayContaining(['user-1', 'completed', 'subscription'])
      );
    });
  });

  describe('ensureSchema', () => {
    test('returns success when schema is created', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Payment.ensureSchema();

      expect(result).toEqual({ ok: true });
    });
  });
});
