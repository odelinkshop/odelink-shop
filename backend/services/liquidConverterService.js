/**
 * Liquid Converter Service
 * 
 * Converts Shopify Liquid templates to static HTML and injects Shopier API calls.
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

const { Liquid } = require('liquidjs');

/**
 * LiquidConverterService class
 * Handles conversion of Shopify Liquid templates to static HTML with Shopier integration
 */
class LiquidConverterService {
  constructor() {
    // Initialize liquidjs engine
    this.engine = new Liquid({
      strictFilters: false,
      strictVariables: false,
      lenientIf: true
    });

    // Shopify to Shopier object mappings
    this.objectMappings = {
      'product': 'shopierProduct',
      'collection': 'shopierCollection',
      'cart': 'shopierCart',
      'all_products': 'shopierProducts',
      'collections': 'shopierCollections',
      'customer': 'shopierCustomer'
    };
  }

  /**
   * Convert a Liquid template to static HTML
   * 
   * @param {Object} template - LiquidTemplate object
   * @param {string} template.name - Template name
   * @param {string} template.content - Liquid template content
   * @param {string[]} template.variables - Template variables
   * @param {string[]} template.filters - Template filters
   * @param {string[]} template.tags - Template tags
   * @returns {Promise<Object>} ConvertedTemplate object
   */
  async convertTemplate(template) {
    try {
      if (!template || !template.content) {
        throw new Error('Invalid template: content is required');
      }

      // Step 1: Parse Liquid syntax
      const ast = await this.parseLiquidSyntax(template.content);

      // Step 2: Replace Shopify objects with Shopier equivalents
      const modifiedAst = this.replaceShopifyObjects(ast);

      // Step 3: Generate static HTML
      let html = await this.generateStaticHTML(modifiedAst, template.content);

      // Step 4: Inject Shopier API calls
      html = this.injectShopierAPICalls(html);

      // Identify dynamic sections and required API calls
      const dynamicSections = this.identifyDynamicSections(html);
      const requiredAPICalls = this.extractRequiredAPICalls(dynamicSections);

      return {
        html,
        requiredAPICalls,
        dynamicSections,
        errors: []
      };
    } catch (error) {
      return {
        html: this.generateFallbackHTML(template.name),
        requiredAPICalls: [],
        dynamicSections: [],
        errors: [{
          step: 'convertTemplate',
          message: error.message,
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Parse Liquid syntax into an Abstract Syntax Tree
   * 
   * @param {string} content - Liquid template content
   * @returns {Promise<Object>} Liquid AST
   */
  async parseLiquidSyntax(content) {
    try {
      // Parse the template using liquidjs
      const templates = this.engine.parse(content);
      
      return {
        type: 'root',
        children: templates,
        value: content
      };
    } catch (error) {
      throw new Error(`Liquid syntax parsing failed: ${error.message}`);
    }
  }

  /**
   * Replace Shopify objects with Shopier equivalents in the AST
   * 
   * @param {Object} ast - Liquid AST
   * @returns {Object} Modified AST with Shopier objects
   */
  replaceShopifyObjects(ast) {
    if (!ast || !ast.value) {
      return ast;
    }

    let modifiedContent = ast.value;

    // Replace Shopify object references with Shopier equivalents
    for (const [shopifyObj, shopierObj] of Object.entries(this.objectMappings)) {
      // Replace in output tags: {{ product.title }} -> {{ shopierProduct.title }}
      const outputRegex = new RegExp(`{{\\s*${shopifyObj}([.\\s])`, 'g');
      modifiedContent = modifiedContent.replace(outputRegex, `{{ ${shopierObj}$1`);

      // Replace object.property patterns: collection.products -> shopierCollection.products
      const propertyRegex = new RegExp(`\\b${shopifyObj}\\.`, 'g');
      modifiedContent = modifiedContent.replace(propertyRegex, `${shopierObj}.`);

      // Replace in tag conditions: {% if product %} -> {% if shopierProduct %}
      const tagRegex = new RegExp(`{%\\s*(\\w+)\\s+${shopifyObj}([\\s%])`, 'g');
      modifiedContent = modifiedContent.replace(tagRegex, `{% $1 ${shopierObj}$2`);

      // Replace in for loops: {% for product in products %} -> {% for product in shopierProducts %}
      const forRegex = new RegExp(`{%\\s*for\\s+(\\w+)\\s+in\\s+${shopifyObj}s?\\s*%}`, 'g');
      modifiedContent = modifiedContent.replace(forRegex, `{% for $1 in ${shopierObj}s %}`);
    }

    return {
      ...ast,
      value: modifiedContent
    };
  }

  /**
   * Inject Shopier API calls into the HTML for dynamic content
   * 
   * @param {string} html - Static HTML content
   * @returns {string} HTML with injected API calls
   */
  injectShopierAPICalls(html) {
    let modifiedHtml = html;

    // Ensure HTML has a closing body tag for script injection
    if (!modifiedHtml.includes('</body>')) {
      modifiedHtml = modifiedHtml + '\n</body>';
    }

    // Inject product loading script
    if (html.includes('shopierProduct') || html.includes('data-product')) {
      const productScript = `
<script>
  // Load Shopier product data
  async function loadShopierProducts() {
    try {
      const response = await fetch('/api/shopier/products');
      const products = await response.json();
      window.shopierProducts = products;
      updateProductElements(products);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }
  
  function updateProductElements(products) {
    document.querySelectorAll('[data-product-id]').forEach(el => {
      const productId = el.getAttribute('data-product-id');
      const product = products.find(p => p.id === productId);
      if (product) {
        el.dispatchEvent(new CustomEvent('product-loaded', { detail: product }));
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadShopierProducts);
  } else {
    loadShopierProducts();
  }
</script>`;
      
      modifiedHtml = modifiedHtml.replace('</body>', `${productScript}\n</body>`);
    }

    // Inject cart functionality
    if (html.includes('shopierCart') || html.includes('data-cart')) {
      const cartScript = `
<script>
  // Shopier cart operations
  window.shopierCart = {
    async add(productId, quantity = 1) {
      try {
        const response = await fetch('/api/shopier/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
        return await response.json();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
      }
    },
    
    async remove(productId) {
      try {
        const response = await fetch('/api/shopier/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
        return await response.json();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        throw error;
      }
    },
    
    async update(productId, quantity) {
      try {
        const response = await fetch('/api/shopier/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
        return await response.json();
      } catch (error) {
        console.error('Failed to update cart:', error);
        throw error;
      }
    },
    
    async get() {
      try {
        const response = await fetch('/api/shopier/cart');
        return await response.json();
      } catch (error) {
        console.error('Failed to get cart:', error);
        throw error;
      }
    }
  };
</script>`;
      
      modifiedHtml = modifiedHtml.replace('</body>', `${cartScript}\n</body>`);
    }

    // Inject collection/category loading
    if (html.includes('shopierCollection') || html.includes('data-collection')) {
      const collectionScript = `
<script>
  // Load Shopier collections
  async function loadShopierCollections() {
    try {
      const response = await fetch('/api/shopier/collections');
      const collections = await response.json();
      window.shopierCollections = collections;
      updateCollectionElements(collections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  }
  
  function updateCollectionElements(collections) {
    document.querySelectorAll('[data-collection-id]').forEach(el => {
      const collectionId = el.getAttribute('data-collection-id');
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        el.dispatchEvent(new CustomEvent('collection-loaded', { detail: collection }));
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadShopierCollections);
  } else {
    loadShopierCollections();
  }
</script>`;
      
      modifiedHtml = modifiedHtml.replace('</body>', `${collectionScript}\n</body>`);
    }

    return modifiedHtml;
  }

  /**
   * Generate static HTML from modified AST
   * 
   * @param {Object} ast - Modified Liquid AST
   * @param {string} originalContent - Original template content
   * @returns {Promise<string>} Static HTML
   */
  async generateStaticHTML(ast, originalContent) {
    try {
      // Use the modified content from AST
      const content = ast.value || originalContent;

      // Render with empty context to generate static HTML
      // Dynamic parts will be handled by injected API calls
      const html = await this.engine.parseAndRender(content, {
        shopierProduct: {},
        shopierProducts: [],
        shopierCollection: {},
        shopierCollections: [],
        shopierCart: { items: [], total: 0 },
        shopierCustomer: null
      });

      return html;
    } catch (error) {
      // If rendering fails, return the content with Liquid tags stripped
      return this.stripLiquidTags(ast.value || originalContent);
    }
  }

  /**
   * Strip Liquid tags from content as fallback
   * 
   * @param {string} content - Content with Liquid tags
   * @returns {string} Content without Liquid tags
   */
  stripLiquidTags(content) {
    // Remove Liquid output tags: {{ ... }}
    let stripped = content.replace(/\{\{[^}]*\}\}/g, '');
    
    // Remove Liquid tag blocks: {% ... %}
    stripped = stripped.replace(/\{%[^%]*%\}/g, '');
    
    return stripped;
  }

  /**
   * Identify dynamic sections in the HTML
   * 
   * @param {string} html - HTML content
   * @returns {Array<Object>} Dynamic sections
   */
  identifyDynamicSections(html) {
    const sections = [];

    if (html.includes('shopierProduct') || html.includes('data-product')) {
      sections.push({
        id: 'products',
        type: 'products',
        placeholder: '[SHOPIER_PRODUCTS]'
      });
    }

    if (html.includes('shopierCart') || html.includes('data-cart')) {
      sections.push({
        id: 'cart',
        type: 'cart',
        placeholder: '[SHOPIER_CART]'
      });
    }

    if (html.includes('shopierCollection') || html.includes('data-collection')) {
      sections.push({
        id: 'collections',
        type: 'collections',
        placeholder: '[SHOPIER_COLLECTIONS]'
      });
    }

    return sections;
  }

  /**
   * Extract required API calls from dynamic sections
   * 
   * @param {Array<Object>} dynamicSections - Dynamic sections
   * @returns {Array<Object>} Required API calls
   */
  extractRequiredAPICalls(dynamicSections) {
    const apiCalls = [];

    for (const section of dynamicSections) {
      switch (section.type) {
        case 'products':
          apiCalls.push({
            endpoint: '/api/shopier/products',
            method: 'GET',
            params: {},
            targetElement: '[data-product-id]'
          });
          break;

        case 'cart':
          apiCalls.push({
            endpoint: '/api/shopier/cart',
            method: 'GET',
            params: {},
            targetElement: '[data-cart]'
          });
          break;

        case 'collections':
          apiCalls.push({
            endpoint: '/api/shopier/collections',
            method: 'GET',
            params: {},
            targetElement: '[data-collection-id]'
          });
          break;
      }
    }

    return apiCalls;
  }

  /**
   * Generate fallback HTML for failed conversions
   * 
   * @param {string} templateName - Name of the template
   * @returns {string} Fallback HTML
   */
  generateFallbackHTML(templateName) {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName || 'Page'}</title>
</head>
<body>
  <div class="error-message">
    <h1>Template Conversion Error</h1>
    <p>The template "${templateName}" could not be converted. Please contact support.</p>
  </div>
</body>
</html>`;
  }
}

module.exports = LiquidConverterService;
