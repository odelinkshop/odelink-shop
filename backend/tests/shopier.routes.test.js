jest.mock('axios', () => ({
  get: jest.fn()
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
  });

  test('scrapeShopier uses axios catalog scraping without undefined helper errors', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: `
        <html>
          <head>
            <title>Gloss Giyim | Shopier</title>
            <meta name="description" content="Magaza aciklamasi" />
          </head>
          <body>
            <div class="product-count">1 urun</div>
            <div class="product">
              <a href="/glossgiyim/123456">
                <img src="/images/urun.jpg" />
                <h3 class="product-title">Saten Elbise</h3>
              </a>
              <div class="price">550,00 TL</div>
            </div>
          </body>
        </html>
      `
    });

    const result = await shopierRouter.scrapeShopier({
      url: 'https://www.shopier.com/glossgiyim',
      force: true
    });

    expect(result.storeName).toBe('Gloss Giyim');
    expect(result.totalCount).toBe(1);
    expect(result.products).toEqual([
      expect.objectContaining({
        name: 'Saten Elbise',
        price: expect.stringContaining('550'),
        url: 'https://www.shopier.com/glossgiyim/123456'
      })
    ]);
  });
});
