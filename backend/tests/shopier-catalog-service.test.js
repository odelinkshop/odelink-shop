jest.mock('../routes/shopier', () => ({
  scrapeShopier: jest.fn()
}));

const shopierRoutes = require('../routes/shopier');
const {
  buildShopDataFromScraped,
  fetchShopierCatalog,
  normalizeCatalogProducts
} = require('../services/shopierCatalogService');

describe('shopierCatalogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('buildShopDataFromScraped dedupes products and builds categories', () => {
    const result = buildShopDataFromScraped({
      storeName: 'Demo Store',
      totalCount: 4,
      products: [
        { name: 'Basic Tisort', url: 'https://shopier.com/p/1', category: 'Giyim' },
        { name: 'Basic Tisort', url: 'https://shopier.com/p/1', category: 'Giyim' },
        { name: 'Slim Pantolon', url: 'https://shopier.com/p/2', category: 'Giyim' },
        { name: 'Deri Cuzdan', url: 'https://shopier.com/p/3', category: 'Aksesuar' }
      ]
    }, 'https://shopier.com/demo-store');

    expect(result.products).toHaveLength(3);
    expect(result.totalProducts).toBe(4);
    expect(result.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Giyim', productIndices: [0, 1] }),
        expect.objectContaining({ name: 'Aksesuar', productIndices: [2] })
      ])
    );
  });

  test('fetchShopierCatalog uses shared scraper and returns normalized catalog', async () => {
    shopierRoutes.scrapeShopier.mockResolvedValue({
      storeName: 'Demo Store',
      totalCount: 2,
      products: [
        { name: 'Basic Tisort', url: 'https://shopier.com/p/1', category: 'Genel' },
        { name: 'Slim Pantolon', url: 'https://shopier.com/p/2', category: 'Genel' }
      ]
    });

    const result = await fetchShopierCatalog('https://shopier.com/demo-store');

    expect(shopierRoutes.scrapeShopier).toHaveBeenCalledWith({
      url: 'https://shopier.com/demo-store',
      force: true,
      debug: false,
      discoverAll: true
    });
    expect(result).toMatchObject({
      shopName: 'Demo Store',
      totalProducts: 2
    });
    expect(result.products).toHaveLength(2);
  });

  test('normalizeCatalogProducts filters placeholder and non-product shopier links', () => {
    const result = normalizeCatalogProducts([
      { name: 'Product Title', url: 'https://www.shopier.com/glossgiyim#' },
      { name: 'Urun 74', url: 'https://www.shopier.com/company/shopier' },
      { name: 'Basic Tisort', url: 'https://www.shopier.com/ShowProductNew/storefront.php?shop=demo&sid=abc', image: 'https://cdn.example.com/1.jpg', price: '799' },
      { name: 'Deri Cuzdan', url: 'https://www.shopier.com/p/demo-cuzdan', image: 'https://cdn.example.com/2.jpg', price: '499' }
    ]);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Basic Tisort' }),
        expect.objectContaining({ title: 'Deri Cuzdan' })
      ])
    );
  });
});
