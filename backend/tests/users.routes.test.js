const express = require('express');
const request = require('supertest');

jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findWithPasswordById: jest.fn(),
  getSubscriptionDetails: jest.fn(),
  verifyPassword: jest.fn()
}));

jest.mock('../models/AuthSession', () => ({
  revokeAllForUser: jest.fn().mockResolvedValue(1)
}));

jest.mock('../models/Site', () => ({
  findDashboardByUserId: jest.fn(),
  getSiteStats: jest.fn()
}));

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../utils/transactions', () => ({
  withTransaction: jest.fn()
}));

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.userId = 'user-1';
  next();
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('new-hash')
}));

const bcrypt = require('bcryptjs');
const AuthSession = require('../models/AuthSession');
const User = require('../models/User');
const pool = require('../config/database');
const { withTransaction } = require('../utils/transactions');
const usersRouter = require('../routes/users');

describe('users routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/', usersRouter);
  });

  test('password change uses authenticated user record only', async () => {
    User.findWithPasswordById.mockResolvedValue({
      id: 'user-1',
      password: 'stored-hash'
    });
    User.verifyPassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    pool.query.mockResolvedValue({ rowCount: 1 });

    const response = await request(app)
      .put('/password')
      .send({
        email: 'attacker@example.com',
        currentPassword: 'secret123',
        newPassword: 'new-secret-123'
      });

    expect(response.status).toBe(200);
    expect(User.findWithPasswordById).toHaveBeenCalledWith('user-1');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      ['new-hash', 'user-1']
    );
    expect(AuthSession.revokeAllForUser).toHaveBeenCalledWith('user-1', 'password_change');
    expect(bcrypt.hash).toHaveBeenCalledWith('new-secret-123', 12);
  });

  test('account delete requires current password', async () => {
    const response = await request(app)
      .delete('/account')
      .send({});

    expect(response.status).toBe(400);
    expect(withTransaction).not.toHaveBeenCalled();
  });

  test('account delete verifies password and deletes inside transaction', async () => {
    User.findWithPasswordById.mockResolvedValue({
      id: 'user-1',
      password: 'stored-hash'
    });
    User.verifyPassword.mockResolvedValue(true);

    const client = {
      query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'user-1' }] })
    };
    withTransaction.mockImplementation(async (_pool, handler) => handler(client));

    const response = await request(app)
      .delete('/account')
      .send({ currentPassword: 'secret123' });

    expect(response.status).toBe(200);
    expect(withTransaction).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      ['user-1']
    );
  });
});
