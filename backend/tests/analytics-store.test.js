jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');
const AnalyticsStore = require('../models/AnalyticsStore');

describe('AnalyticsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('trackSiteView records a page view and first unique visitor', async () => {
    pool.query.mockImplementation((sql) => {
      const query = String(sql || '');
      if (query.includes('SELECT CURRENT_DATE')) {
        return Promise.resolve({ rows: [{ d: '2026-03-07' }] });
      }
      if (query.includes('INSERT INTO site_daily_unique_visitors')) {
        return Promise.resolve({ rowCount: 1, rows: [{ visitor_id: 'visitor-1' }] });
      }
      return Promise.resolve({ rowCount: 1, rows: [] });
    });

    const result = await AnalyticsStore.trackSiteView({
      siteId: 'site-1',
      visitorId: 'visitor-1'
    });

    expect(result).toEqual({
      dateKey: '2026-03-07',
      pageViewIncrement: 1,
      uniqueIncrement: 1
    });
  });

  test('getActiveVisitorCount prunes stale rows then counts active visitors', async () => {
    pool.query.mockImplementation((sql) => {
      const query = String(sql || '');
      if (query.includes('SELECT COUNT(*)::int AS active_visitors')) {
        return Promise.resolve({ rows: [{ active_visitors: 7 }] });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    });

    const activeVisitors = await AnalyticsStore.getActiveVisitorCount({
      activeWindowMs: 60 * 1000,
      maxTrackMs: 10 * 60 * 1000
    });

    expect(activeVisitors).toBe(7);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM visitor_heartbeats'),
      [600]
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(*)::int AS active_visitors'),
      [60]
    );
  });
});
