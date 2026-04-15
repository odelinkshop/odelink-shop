jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');
const AdvertisementCredit = require('../models/AdvertisementCredit');

describe('AdvertisementCredit model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        description: 'Ad package purchase'
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ total_balance: 0 }] })
        .mockResolvedValueOnce({ rows: [mockCredit] });

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        500.00,
        'purchase',
        'payment-1',
        'Ad package purchase'
      );

      expect(pool.query).toHaveBeenCalledTimes(2);
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

      pool.query
        .mockResolvedValueOnce({ rows: [{ total_balance: 500 }] })
        .mockResolvedValueOnce({ rows: [mockCredit] });

      const result = await AdvertisementCredit.addCredit(
        'user-1',
        1200.00,
        'purchase',
        'payment-2'
      );

      expect(result.balance_after).toBe(1700.00);
    });

    test('handles refund source', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total_balance: 500 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'credit-3', source: 'refund' }] });

      await AdvertisementCredit.addCredit(
        'user-1',
        -100.00,
        'refund',
        'payment-1'
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['user-1', -100.00, 'refund'])
      );
    });

    test('handles admin adjustment source', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total_balance: 500 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'credit-4', source: 'admin_adjustment' }] });

      await AdvertisementCredit.addCredit(
        'user-1',
        250.00,
        'admin_adjustment',
        null,
        'Admin bonus'
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['user-1', 250.00, 'admin_adjustment', null])
      );
    });
  });

  describe('getUserBalance', () => {
    test('returns user balance', async () => {
      pool.query.mockResolvedValue({ rows: [{ total_balance: 1500.50 }] });

      const balance = await AdvertisementCredit.getUserBalance('user-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SUM(amount)'),
        ['user-1']
      );
      expect(balance).toBe(1500.50);
    });

    test('returns 0 for user with no credits', async () => {
      pool.query.mockResolvedValue({ rows: [{ total_balance: 0 }] });

      const balance = await AdvertisementCredit.getUserBalance('user-2');

      expect(balance).toBe(0);
    });

    test('returns 0 when no rows returned', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const balance = await AdvertisementCredit.getUserBalance('user-3');

      expect(balance).toBe(0);
    });
  });

  describe('getUserCreditHistory', () => {
    test('returns paginated credit history', async () => {
      const mockCredits = [
        { id: 'credit-1', amount: 500.00, created_at: '2024-01-15' },
        { id: 'credit-2', amount: 1200.00, created_at: '2024-01-14' }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 2 }] })
        .mockResolvedValueOnce({ rows: mockCredits });

      const result = await AdvertisementCredit.getUserCreditHistory('user-1', { page: 1, limit: 20 });

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
        .mockResolvedValueOnce({ rows: [{ total: 45 }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await AdvertisementCredit.getUserCreditHistory('user-1', { page: 2, limit: 20 });

      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);
    });

    test('orders by created_at descending', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await AdvertisementCredit.getUserCreditHistory('user-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });
  });

  describe('findById', () => {
    test('finds credit by ID', async () => {
      const mockCredit = { id: 'credit-1', user_id: 'user-1', amount: 500.00 };
      pool.query.mockResolvedValue({ rows: [mockCredit] });

      const result = await AdvertisementCredit.findById('credit-1');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM advertisement_credits WHERE id = $1',
        ['credit-1']
      );
      expect(result).toEqual(mockCredit);
    });

    test('returns null when credit not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await AdvertisementCredit.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllCredits', () => {
    test('returns all credits for user', async () => {
      const mockCredits = [
        { id: 'credit-1', amount: 500.00 },
        { id: 'credit-2', amount: 1200.00 }
      ];
      pool.query.mockResolvedValue({ rows: mockCredits });

      const result = await AdvertisementCredit.getAllCredits('user-1');

      expect(result).toEqual(mockCredits);
    });

    test('returns empty array when no credits', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await AdvertisementCredit.getAllCredits('user-2');

      expect(result).toEqual([]);
    });
  });

  describe('ensureSchema', () => {
    test('creates advertisement_credits table and indexes', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await AdvertisementCredit.ensureSchema();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS advertisement_credits')
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_ad_credits_user_id')
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
