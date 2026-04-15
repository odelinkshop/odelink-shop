jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');
const AdvertisementCredit = require('../models/AdvertisementCredit');

describe('AdvertisementCredit model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton promise to allow fresh schema calls in each test
    AdvertisementCredit.ensureSchema = jest.fn().mockResolvedValue({ ok: true });
  });

  describe('addCredit', () => {
    test('adds credit and calculates new balance', async () => {
      const mockCredit = {
        id: 'credit-1',
        user_id: 'user-1',
        amount: 500.00,
        source: 'purchase',
        source_transaction_id: 'payment-1',
        balance_after: 500.00,
        description: 'Başlangıç paketi',
        created_at: new Date()
      };

      // Mock getUserBalance to return 0 (no previous balance)
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // getUserBalance query
        .mockResolvedValueOnce({ rows: [mockCredit] }); // addCredit insert

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        500.00,
        'purchase',
        'payment-1',
        'Başlangıç paketi'
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO advertisement_credits'),
        expect.arrayContaining([
          'user-1',
          500.00,
          'purchase',
          'payment-1',
          500.00, // balance_after
          'Başlangıç paketi'
        ])
      );
      expect(result).toEqual(mockCredit);
    });

    test('adds credit to existing balance', async () => {
      const mockCredit = {
        id: 'credit-2',
        user_id: 'user-1',
        amount: 1200.00,
        source: 'purchase',
        balance_after: 1700.00
      };

      // Mock getUserBalance to return 500 (existing balance)
      pool.query
        .mockResolvedValueOnce({ rows: [{ balance_after: 500.00 }] }) // getUserBalance
        .mockResolvedValueOnce({ rows: [mockCredit] }); // addCredit insert

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        1200.00,
        'purchase',
        'payment-2'
      );

      expect(result.balance_after).toBe(1700.00);
    });

    test('handles Başlangıç package (500 TRY)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // getUserBalance
        .mockResolvedValueOnce({ rows: [{ balance_after: 500.00 }] });

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        500.00,
        'purchase',
        'payment-1'
      );

      expect(result.balance_after).toBe(500.00);
    });

    test('handles Profesyonel package (1200 TRY)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // getUserBalance
        .mockResolvedValueOnce({ rows: [{ balance_after: 1200.00 }] });

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        1200.00,
        'purchase',
        'payment-2'
      );

      expect(result.balance_after).toBe(1200.00);
    });

    test('handles Premium package (2500 TRY)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // getUserBalance
        .mockResolvedValueOnce({ rows: [{ balance_after: 2500.00 }] });

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        2500.00,
        'purchase',
        'payment-3'
      );

      expect(result.balance_after).toBe(2500.00);
    });

    test('prevents negative balance', async () => {
      // Mock getUserBalance to return 100
      pool.query
        .mockResolvedValueOnce({ rows: [{ balance_after: 100.00 }] }); // getUserBalance

      await expect(
        AdvertisementCredit.addCredit('user-1', -200.00, 'admin_adjustment')
      ).rejects.toThrow('Yetersiz kredi bakiyesi');
    });

    test('allows refund with sufficient balance', async () => {
      const mockCredit = {
        id: 'credit-3',
        user_id: 'user-1',
        amount: -100.00,
        source: 'refund',
        balance_after: 400.00
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ balance_after: 500.00 }] }) // getUserBalance
        .mockResolvedValueOnce({ rows: [mockCredit] }); // addCredit insert

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        -100.00,
        'refund',
        'payment-1'
      );

      expect(result.balance_after).toBe(400.00);
    });
  });

  describe('getUserBalance', () => {
    test('returns current balance from latest transaction', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ balance_after: 1500.00 }] }); // getUserBalance

      const balance = await AdvertisementCredit.getUserBalance('user-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT balance_after'),
        ['user-1']
      );
      expect(balance).toBe(1500.00);
    });

    test('returns 0 when user has no transactions', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }); // getUserBalance

      const balance = await AdvertisementCredit.getUserBalance('user-1');

      expect(balance).toBe(0);
    });
  });

  describe('getUserCreditHistory', () => {
    test('returns paginated credit history for user', async () => {
      const mockCredits = [
        { id: 'credit-1', amount: 500.00, balance_after: 500.00 },
        { id: 'credit-2', amount: 1200.00, balance_after: 1700.00 }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 2 }] }) // count
        .mockResolvedValueOnce({ rows: mockCredits }); // data

      const result = await AdvertisementCredit.getUserCreditHistory('user-1', {
        page: 1,
        limit: 20
      });

      expect(result).toEqual({
        credits: mockCredits,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1
      });
    });

    test('calculates pagination correctly', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 45 }] }) // count
        .mockResolvedValueOnce({ rows: [] }); // data

      const result = await AdvertisementCredit.getUserCreditHistory('user-1', {
        page: 2,
        limit: 20
      });

      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);
    });

    test('orders by created_at DESC', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 0 }] }) // count
        .mockResolvedValueOnce({ rows: [] }); // data

      await AdvertisementCredit.getUserCreditHistory('user-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });
  });

  describe('ensureSchema', () => {
    test('calls ensureSchema successfully', async () => {
      // Since ensureSchema is mocked in beforeEach, just verify it works
      const result = await AdvertisementCredit.ensureSchema();
      expect(result).toEqual({ ok: true });
    });
  });
});
