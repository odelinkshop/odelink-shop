jest.mock('axios', () => ({
  get: jest.fn(),
  request: jest.fn()
}));

jest.mock('puppeteer-core', () => ({
  launch: jest.fn()
}));

jest.mock('@sparticuz/chromium', () => ({
  args: [],
  headless: true,
  executablePath: jest.fn().mockResolvedValue('/tmp/chrome')
}));

jest.mock('../models/Site', () => ({
  findBySubdomain: jest.fn(),
  findByShopierSyncStatuses: jest.fn().mockResolvedValue([]),
  update: jest.fn()
}));

const axios = require('axios');
const shopierRouter = require('../routes/shopier');

describe('shopier routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup axios.request mock
    axios.request = axios.request || jest.fn();
  });

  test('shopier routes module loads successfully', () => {
    // This test verifies that the shopier routes module can be loaded
    // Actual scraping functionality is tested in shopier-catalog-service.test.js
    expect(shopierRouter).toBeDefined();
    expect(typeof shopierRouter).toBe('function');
  });
});
