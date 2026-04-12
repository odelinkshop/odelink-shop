const express = require('express');
const request = require('supertest');

jest.mock('../models/User', () => ({
  findById: jest.fn(),
  getSubscriptionDetails: jest.fn()
}));

jest.mock('../models/Site', () => ({
  findDashboardByUserId: jest.fn(),
  getSiteStats: jest.fn()
}));

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.userId = 'user-1';
  next();
});

const User = require('../models/User');
const Site = require('../models/Site');
const usersRouter = require('../routes/users');

describe('users dashboard route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns partial dashboard response from subscription fallback', async () => {
    User.findById.mockRejectedValue(new Error('user lookup failed'));
    User.getSubscriptionDetails.mockResolvedValue({
      id: 'user-1',
      name: 'Murat',
      email: 'murat@example.com',
      phone: '0555',
      subscription_id: 'sub-1',
      created_at: '2026-03-07T00:00:00.000Z',
      updated_at: '2026-03-07T00:00:00.000Z',
      subscription_name: 'Standart'
    });
    Site.findDashboardByUserId.mockResolvedValue([{ id: 'site-1', status: 'active' }]);
    Site.getSiteStats.mockRejectedValue(new Error('stats failed'));

    const app = express();
    app.use(express.json());
    app.use('/', usersRouter);

    const response = await request(app).get('/dashboard');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('murat@example.com');
    expect(response.body.stats).toEqual({
      total_sites: '1',
      active_sites: '1',
      recent_sites: '0'
    });
    expect(response.body.subscription.subscription_name).toBe('Standart');
  });
});
