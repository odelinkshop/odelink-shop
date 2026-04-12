jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');
const Site = require('../models/Site');

describe('Site model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('findByShopierSyncStatuses normalizes statuses and forwards limit', async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 'site-1', subdomain: 'store-1' }]
    });

    const result = await Site.findByShopierSyncStatuses([' RUNNING ', 'Queued'], 12);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("COALESCE(LOWER(settings->'shopier_sync'->>'status'), '') = ANY($1::text[])"),
      [['running', 'queued'], 12]
    );
    expect(result).toEqual([{ id: 'site-1', subdomain: 'store-1' }]);
  });

  test('findByShopierSyncStatuses returns empty list when no valid statuses are provided', async () => {
    const result = await Site.findByShopierSyncStatuses([null, '', '   '], 10);

    expect(result).toEqual([]);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
