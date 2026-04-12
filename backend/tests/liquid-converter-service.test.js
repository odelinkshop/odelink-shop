/**
 * Unit tests for LiquidConverterService
 * Tests Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

const LiquidConverterService = require('../services/liquidConverterService');

describe('LiquidConverterService', () => {
  let service;

  beforeEach(() => {
    service = new LiquidConverterService();
  });

  describe('convertTemplate', () => {
    it('should convert a simple Liquid template to HTML', async () => {
      const template = {
        name: 'test-template',
        content: '<h1>{{ product.title }}</h1>',
        variables: ['product'],
        filters: [],
        tags: []
      };

      const result = await service.convertTemplate(template);

      expect(result.html).toBeDefined();
      expect(result.errors).toHaveLength(0);
      expect(result.html).not.toContain('{{');
      expect(result.html).not.toContain('}}');
    });

    it('should replace Shopify objects with Shopier equivalents', async () => {
      const template = {
        name: 'product-template',
        content: '<div>{{ product.title }}</div><p>{{ product.price }}</p>',
        variables: ['product'],
        filters: [],
        tags: []
      };

      const result = await service.convertTemplate(template);

      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid template gracefully', async () => {
      const template = {
        name: 'invalid-template',
        content: null,
        variables: [],
        filters: [],
        tags: []
      };

      const result = await service.convertTemplate(template);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.html).toContain('Template Conversion Error');
    });

    it('should inject Shopier API calls for products', async () => {
      const template = {
        name: 'product-list',
        content: '<div data-product-id="123">{{ product.title }}</div>',
        variables: ['product'],
        filters: [],
        tags: []
      };

      const result = await service.convertTemplate(template);

      expect(result.html).toContain('loadShopierProducts');
      expect(result.html).toContain('/api/shopier/products');
    });

    it('should inject cart functionality when cart is referenced', async () => {
      const template = {
        name: 'cart-template',
        content: '<div data-cart>{{ cart.total }}</div>',
        variables: ['cart'],
        filters: [],
        tags: []
      };

      const result = await service.convertTemplate(template);

      expect(result.html).toContain('shopierCart');
      expect(result.html).toContain('/api/shopier/cart');
    });
  });

  describe('parseLiquidSyntax', () => {
    it('should parse valid Liquid syntax', async () => {
      const content = '{{ product.title }}';
      const ast = await service.parseLiquidSyntax(content);

      expect(ast).toBeDefined();
      expect(ast.type).toBe('root');
      expect(ast.children).toBeDefined();
    });

    it('should throw error for invalid Liquid syntax', async () => {
      const content = '{% invalid tag without closing';
      
      await expect(service.parseLiquidSyntax(content))
        .rejects.toThrow();
    });
  });

  describe('replaceShopifyObjects', () => {
    it('should replace product with shopierProduct', () => {
      const ast = {
        type: 'root',
        value: '{{ product.title }}',
        children: []
      };

      const result = service.replaceShopifyObjects(ast);

      expect(result.value).toContain('shopierProduct');
      expect(result.value).not.toContain('{{ product.');
    });

    it('should replace collection with shopierCollection', () => {
      const ast = {
        type: 'root',
        value: '{% for item in collection.products %}',
        children: []
      };

      const result = service.replaceShopifyObjects(ast);

      expect(result.value).toContain('shopierCollection');
    });

    it('should replace cart with shopierCart', () => {
      const ast = {
        type: 'root',
        value: '{{ cart.total_price }}',
        children: []
      };

      const result = service.replaceShopifyObjects(ast);

      expect(result.value).toContain('shopierCart');
    });

    it('should replace all_products with shopierProducts', () => {
      const ast = {
        type: 'root',
        value: '{% for product in all_products %}',
        children: []
      };

      const result = service.replaceShopifyObjects(ast);

      expect(result.value).toContain('shopierProducts');
    });

    it('should handle null or empty AST', () => {
      const result = service.replaceShopifyObjects(null);
      expect(result).toBeNull();

      const emptyAst = { type: 'root', children: [] };
      const emptyResult = service.replaceShopifyObjects(emptyAst);
      expect(emptyResult).toEqual(emptyAst);
    });
  });

  describe('injectShopierAPICalls', () => {
    it('should inject product loading script', () => {
      const html = '<div data-product-id="123"></div><body></body>';
      const result = service.injectShopierAPICalls(html);

      expect(result).toContain('loadShopierProducts');
      expect(result).toContain('/api/shopier/products');
      expect(result).toContain('<script>');
    });

    it('should inject cart operations script', () => {
      const html = '<div data-cart></div><body></body>';
      const result = service.injectShopierAPICalls(html);

      expect(result).toContain('shopierCart');
      expect(result).toContain('/api/shopier/cart/add');
      expect(result).toContain('/api/shopier/cart/remove');
    });

    it('should inject collection loading script', () => {
      const html = '<div data-collection-id="456"></div><body></body>';
      const result = service.injectShopierAPICalls(html);

      expect(result).toContain('loadShopierCollections');
      expect(result).toContain('/api/shopier/collections');
    });

    it('should not inject scripts when no dynamic content', () => {
      const html = '<div>Static content</div><body></body>';
      const result = service.injectShopierAPICalls(html);

      expect(result).toBe(html);
    });
  });

  describe('identifyDynamicSections', () => {
    it('should identify product sections', () => {
      const html = '<div data-product-id="123"></div>';
      const sections = service.identifyDynamicSections(html);

      expect(sections).toContainEqual(
        expect.objectContaining({ type: 'products' })
      );
    });

    it('should identify cart sections', () => {
      const html = '<div data-cart></div>';
      const sections = service.identifyDynamicSections(html);

      expect(sections).toContainEqual(
        expect.objectContaining({ type: 'cart' })
      );
    });

    it('should identify collection sections', () => {
      const html = '<div data-collection-id="456"></div>';
      const sections = service.identifyDynamicSections(html);

      expect(sections).toContainEqual(
        expect.objectContaining({ type: 'collections' })
      );
    });

    it('should return empty array for static content', () => {
      const html = '<div>Static content</div>';
      const sections = service.identifyDynamicSections(html);

      expect(sections).toHaveLength(0);
    });
  });

  describe('extractRequiredAPICalls', () => {
    it('should extract product API calls', () => {
      const sections = [{ id: 'products', type: 'products', placeholder: '[SHOPIER_PRODUCTS]' }];
      const apiCalls = service.extractRequiredAPICalls(sections);

      expect(apiCalls).toContainEqual(
        expect.objectContaining({
          endpoint: '/api/shopier/products',
          method: 'GET'
        })
      );
    });

    it('should extract cart API calls', () => {
      const sections = [{ id: 'cart', type: 'cart', placeholder: '[SHOPIER_CART]' }];
      const apiCalls = service.extractRequiredAPICalls(sections);

      expect(apiCalls).toContainEqual(
        expect.objectContaining({
          endpoint: '/api/shopier/cart',
          method: 'GET'
        })
      );
    });

    it('should extract collection API calls', () => {
      const sections = [{ id: 'collections', type: 'collections', placeholder: '[SHOPIER_COLLECTIONS]' }];
      const apiCalls = service.extractRequiredAPICalls(sections);

      expect(apiCalls).toContainEqual(
        expect.objectContaining({
          endpoint: '/api/shopier/collections',
          method: 'GET'
        })
      );
    });
  });

  describe('generateFallbackHTML', () => {
    it('should generate fallback HTML with template name', () => {
      const html = service.generateFallbackHTML('test-template');

      expect(html).toContain('test-template');
      expect(html).toContain('Template Conversion Error');
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should handle missing template name', () => {
      const html = service.generateFallbackHTML();

      expect(html).toContain('Page');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });
});
