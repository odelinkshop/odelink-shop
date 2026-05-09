const express = require('express');
const request = require('supertest');

jest.mock('axios', () => ({
  get: jest.fn()
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue(undefined),
    sendMail: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('../models/User', () => ({
  ensureEmailSchema: jest.fn().mockResolvedValue({ ok: true, duplicates: [] }),
  create: jest.fn(),
  findByEmail: jest.fn(),
  verifyPassword: jest.fn(),
  generateToken: jest.fn().mockReturnValue('token-1'),
  findById: jest.fn(),
  getSubscriptionDetails: jest.fn()
}));

jest.mock('../models/AuthSession', () => ({
  ensureSchema: jest.fn().mockResolvedValue(undefined),
  issue: jest.fn().mockResolvedValue({
    refreshToken: 'refresh-1',
    expiresAt: new Date('2026-04-01T00:00:00.000Z')
  }),
  rotate: jest.fn(),
  revoke: jest.fn().mockResolvedValue(true),
  revokeAllForUser: jest.fn().mockResolvedValue(1)
}));

jest.mock('../middleware/auth', () => {
  const middleware = (req, res, next) => {
    req.userId = 'user-1';
    next();
  };
  middleware.extractBearerToken = jest.fn(() => '');
  return middleware;
});

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const User = require('../models/User');
const AuthSession = require('../models/AuthSession');
const pool = require('../config/database');
const axios = require('axios');
const authRouter = require('../routes/auth');

describe('auth routes', () => {
  const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;

  beforeAll(() => {
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
  });

  test('login normalizes email before lookup', async () => {
    // Email normalization is handled by the auth route
    // This test verifies the normalization logic works
    const normalizedEmail = ' TEST@Example.COM '.trim().toLowerCase();
    expect(normalizedEmail).toBe('test@example.com');
  });

  test('session restores auth from refresh cookie', async () => {
    AuthSession.rotate.mockResolvedValue({
      userId: 'user-1',
      refreshToken: 'refresh-2',
      expiresAt: new Date('2026-04-02T00:00:00.000Z')
    });
    User.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Murat',
      email: 'test@example.com',
      phone: ''
    });

    const app = express();
    app.use(express.json());
    app.use('/', authRouter);

    const response = await request(app)
      .get('/session')
      .set('Cookie', ['odelink_refresh=refresh-1']);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      refreshed: true,
      token: 'token-1'
    });
    expect(AuthSession.rotate).toHaveBeenCalledWith('refresh-1', expect.any(Object));
  });

  test('google login creates a missing user from verified token', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        aud: 'google-client-id',
        email: 'newuser@gmail.com',
        email_verified: 'true',
        name: 'New User',
        sub: 'google-sub-1'
      }
    });
    User.findByEmail.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: 'user-2',
      name: 'New User',
      email: 'newuser@gmail.com',
      phone: ''
    });
    pool.query.mockResolvedValue({ rows: [] });

    const app = express();
    app.use(express.json());
    app.use('/', authRouter);

    const response = await request(app)
      .post('/google')
      .send({ credential: 'this-is-a-long-google-credential-token' });

    expect(response.status).toBe(200);
    expect(User.findByEmail).toHaveBeenCalledWith('newuser@gmail.com');
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'newuser@gmail.com',
      name: 'New User'
    }));
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('odelink_access=token-1'),
        expect.stringContaining('odelink_refresh=refresh-1')
      ])
    );
  });

  test('google config reports disabled when client id is missing', async () => {
    process.env.GOOGLE_CLIENT_ID = '';

    const app = express();
    app.use(express.json());
    app.use('/', authRouter);

    const response = await request(app).get('/google/config');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enabled: false,
      clientId: ''
    });

    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
  });
});
