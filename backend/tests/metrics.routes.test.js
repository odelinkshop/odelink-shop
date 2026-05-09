const express = require('express');
const request = require('supertest');

jest.mock('../models/AnalyticsStore', () => ({
  recordVisitorHeartbeat: jest.fn(),
  getActiveVisitorCount: jest.fn()
}));

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.userId = 'user-1';
  next();
});

const AnalyticsStore = require('../models/AnalyticsStore');
const metricsRouter = require('../routes/metrics');

describe('metrics routes', () => {
  const originalAdminMetricsKey = process.env.ADMIN_METRICS_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_METRICS_KEY = '';
  });

  afterAll(() => {
    process.env.ADMIN_METRICS_KEY = originalAdminMetricsKey;
  });

  test('heartbeat persists visitor activity via analytics store', async () => {
    AnalyticsStore.recordVisitorHeartbeat.mockResolvedValue(true);

    const app = express();
    app.use(express.json());
    app.use('/', metricsRouter);

    const response = await request(app)
      .post('/heartbeat')
      .send({ visitorId: 'visitor-1', path: '/panel' });

    expect(response.status).toBe(200);
    expect(AnalyticsStore.recordVisitorHeartbeat).toHaveBeenCalledWith({
      visitorId: 'visitor-1',
      path: '/panel'
    });
  });

  test('active-visitors returns database-backed count', async () => {
    AnalyticsStore.getActiveVisitorCount.mockResolvedValue(5);

    const app = express();
    app.use(express.json());
    app.use('/', metricsRouter);

    const response = await request(app).get('/active-visitors');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      activeVisitors: 5,
      windowSeconds: 60
    });
  });
});
