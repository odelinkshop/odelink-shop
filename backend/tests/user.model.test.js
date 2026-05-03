jest.mock('../config/database', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('signed-token')
}));

const pool = require('../config/database');
const User = require('../models/User');

describe('User model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create normalizes name, email and phone before insert', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'user-1' }] });

    await User.create({
      name: '  Murat   Bayram  ',
      email: ' TEST@Example.COM ',
      password: 'secret123',
      phone: ' 0555 111 22 33 '
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['Murat Bayram', 'test@example.com', 'hashed-password', '0555 111 22 33']
    );
  });

  test('findByEmail lowercases and trims email', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'user-1' }] });

    await User.findByEmail(' TEST@Example.COM ');

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      ['test@example.com']
    );
  });

  test('findWithPasswordById returns auth row', async () => {
    const row = { id: 'user-1', password: 'hash' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await User.findWithPasswordById('user-1');

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id, name, email, phone, password, subscription_id, created_at, updated_at FROM users WHERE id = $1',
      ['user-1']
    );
    expect(result).toBe(row);
  });

  test('ensureEmailSchema skips unique index creation when duplicate lowercase emails exist', async () => {
    pool.query.mockImplementation((sql) => {
      const query = String(sql || '');
      if (query.includes('GROUP BY LOWER(email)')) {
        return Promise.resolve({
          rows: [{ email_key: 'test@example.com', duplicate_count: 2 }]
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await User.ensureEmailSchema();

    expect(result.ok).toBe(false);
    expect(result.duplicates).toHaveLength(1);
    expect(pool.query).not.toHaveBeenCalledWith(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON users (LOWER(email))'
    );
  });
});
