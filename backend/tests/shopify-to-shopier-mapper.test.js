/**
 * Unit tests for Shopify to Shopier API Mapper Service
 */

const {
  mapProductData,
  mapCollectionData,
  mapCartOperations,
  transformAPIResponse
} = require('../services/shopifyToShopierMapper');

describe('Shopify to Shopier Mapper Service', () => {
  describe('mapProductData', () => {
    test('should map basic Shopify product to Shopier format', () => {
      const shopifyProduct = {
        id: '12345',
        title: 'Premium T-Shirt',
        price: '50.00',
        variants: [
          { size: 'M', price: '50.00', inventory_quantity: 10 },
          { size: 'L', price: '50.00', inventory_quantity: 5 }
        ],
        images: [
          { src: 'https://cdn.shopify.com/image1.jpg' },
          { src: 'https://cdn.shopify.com/image2.jpg' }
        ],
        body_html: '<p>Great shirt</p>',
        product_type: 'Apparel'
      };

      const result = mapProductData(shopifyProduct);

      expect(result.id).toBe('12345');
      expect(result.name).toBe('Premium T-Shirt');
      expect(result.currency).toBe('TRY');
      expect(result.price).toBeGreaterThan(0);
      expect(result.sizes).toEqual(['M', 'L']);
      expect(result.images).toHaveLength(2);
      expect(result.url).toBe('/product/12345');
    });

    test('should throw error for invalid product', () => {
      expect(() => mapProductData(null)).toThrow('Invalid Shopify product');
      expect(() => mapProductData({})).toThrow('Invalid Shopify product');
    });

    test('should handle product without variants', () => {
      const shopifyProduct = {
        id: '67890',
        title: 'Simple Product',
        price: '25.00',
        images: ['https://cdn.shopify.com/image.jpg']
      };

      const result = mapProductData(shopifyProduct);

      expect(result.id).toBe('67890');
      expect(result.name).toBe('Simple Product');
      expect(result.sizes).toEqual([]);
    });
  });

  describe('mapCollectionData', () => {
    test('should map Shopify collection to Shopier format', () => {
      const shopifyCollection = {
        id: 'col-123',
        title: 'Summer Collection',
        description: 'Hot summer items',
        image: { src: 'https://cdn.shopify.com/collection.jpg' },
        handle: 'summer-collection',
        products_count: 15
      };

      const result = mapCollectionData(shopifyCollection);

      expect(result.id).toBe('col-123');
      expect(result.name).toBe('Summer Collection');
      expect(result.description).toBe('Hot summer items');
      expect(result.url).toBe('/collection/summer-collection');
      expect(result.productCount).toBe(15);
    });

    test('should throw error for invalid collection', () => {
      expect(() => mapCollectionData(null)).toThrow('Invalid Shopify collection');
      expect(() => mapCollectionData({})).toThrow('Invalid Shopify collection');
    });
  });

  describe('mapCartOperations', () => {
    test('should map add to cart operation', () => {
      const operation = {
        type: 'add',
        productId: 'prod-123',
        quantity: 2,
        variantId: 'var-456'
      };

      const result = mapCartOperations(operation);

      expect(result.action).toBe('add');
      expect(result.productId).toBe('prod-123');
      expect(result.quantity).toBe(2);
      expect(result.variantId).toBe('var-456');
    });

    test('should map remove from cart operation', () => {
      const operation = {
        type: 'remove',
        productId: 'prod-123'
      };

      const result = mapCartOperations(operation);

      expect(result.action).toBe('remove');
      expect(result.productId).toBe('prod-123');
      expect(result.quantity).toBe(1);
    });

    test('should throw error for invalid operation', () => {
      expect(() => mapCartOperations(null)).toThrow('Invalid cart operation');
      expect(() => mapCartOperations({ type: 'invalid' })).toThrow('Invalid cart operation type');
    });
  });

  describe('transformAPIResponse', () => {
    test('should transform product response', () => {
      const shopierResponse = {
        id: 'prod-123',
        name: 'Test Product',
        price: 100,
        currency: 'TRY'
      };

      const result = transformAPIResponse(shopierResponse, 'product');

      expect(result.id).toBe('prod-123');
      expect(result.name).toBe('Test Product');
      expect(result.price).toBe(100);
      expect(result.currency).toBe('TRY');
    });

    test('should transform array of products', () => {
      const shopierResponse = [
        { id: '1', name: 'Product 1', price: 50 },
        { id: '2', name: 'Product 2', price: 75 }
      ];

      const result = transformAPIResponse(shopierResponse, 'product');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    test('should transform cart response', () => {
      const shopierResponse = {
        items: [{ id: '1', quantity: 2 }],
        total: 200,
        currency: 'TRY'
      };

      const result = transformAPIResponse(shopierResponse, 'cart');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(200);
      expect(result.currency).toBe('TRY');
      expect(result.itemCount).toBe(1);
    });

    test('should return null for null response', () => {
      const result = transformAPIResponse(null, 'product');
      expect(result).toBeNull();
    });
  });
});
