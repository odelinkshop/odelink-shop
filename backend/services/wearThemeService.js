/**
 * WEAR Theme Service - GERÇEK ÇÖZÜM
 * Tüm Shopify validation'ları bypass et, API çağrılarını engelle
 */

const fs = require('fs').promises;
const path = require('path');

class WearThemeService {
  constructor() {
    this.themeBasePath = path.join(__dirname, '../themes/wear.framer.website');
    this.themeHtmlPath = path.join(this.themeBasePath, 'wear.framer.website/index.html');
  }

  /**
   * WEAR temasını render et
   */
  async renderTheme(products, siteSettings = {}) {
    try {
      // Tema HTML'ini oku
      let html = await fs.readFile(this.themeHtmlPath, 'utf-8');
      
      // Shopier ürünlerini Shopify formatına çevir
      const shopifyProducts = this.convertToShopifyFormat(products);
      
      // KRITIK: Shopify config'i override et - HTML'in EN BAŞINA
      const earlyScript = `
<script>
  // ============================================================
  // ODELINK - EARLY BYPASS (Shopify validation'ları engelle)
  // ============================================================
  
  // 1. Shopify config'i override et - BOŞSA HATA FIRLATMASIN
  window.fcConfigs = {
    storefrontDomain: 'odelink.shop',  // Fake domain
    storefrontAccessToken: 'fake-token-12345'  // Fake token
  };
  
  // 2. Config validation'ı bypass et
  window.configValidation = function() {
    console.log('✅ Odelink: Config validation bypassed');
    return true;
  };
  
  // 3. Domain validation'ı bypass et
  window.validateDomainForFreePlan = function() {
    console.log('✅ Odelink: Domain validation bypassed');
    return true;
  };
  
  // 4. Domain object'i oluştur (undefined hatası olmasın)
  window.domain = {
    host: 'odelink.shop',
    hostname: 'odelink.shop',
    protocol: 'https:',
    href: 'https://odelink.shop'
  };
  
  console.log('✅ Odelink: Early bypass complete');
</script>`;

      // HTML'in EN BAŞINA ekle (<!doctype html>'den hemen sonra)
      html = html.replace(/<!doctype html>/i, '<!doctype html>\n' + earlyScript);
      
      // KRITIK: Ürün yükleme script'i - </head> önce
      const productScript = `
<script>
  // ============================================================
  // ODELINK - PRODUCT INJECTION
  // ============================================================
  
  console.log('🚀 Odelink: Product injection starting');
  
  // Ürünleri hazırla
  window.ODELINK_PRODUCTS = ${JSON.stringify(shopifyProducts).replace(/</g, '\\u003c')};
  
  // Shopify API çağrılarını ENGELLE - fetch override
  (function() {
    var originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Shopify API çağrılarını engelle
      if (typeof url === 'string' && (url.includes('myshopify.com') || url.includes('/api/2024-07/graphql'))) {
        console.log('🚫 Odelink: Blocked Shopify API call:', url);
        
        // Fake response döndür
        return Promise.resolve({
          ok: true,
          status: 200,
          json: function() {
            return Promise.resolve({
              data: {
                products: {
                  edges: [],
                  pageInfo: { hasNextPage: false }
                }
              }
            });
          }
        });
      }
      
      // Diğer fetch çağrılarına izin ver
      return originalFetch.apply(this, arguments);
    };
  })();
  
  // WEAR temasının initialization'ını bekle ve override et
  var initAttempts = 0;
  var maxAttempts = 100; // 10 saniye (100ms * 100)
  
  var checkInterval = setInterval(function() {
    initAttempts++;
    
    // shopXtools hazır mı?
    if (window.shopXtools && typeof window.shopXtools.fetchProductsByCountry === 'function') {
      clearInterval(checkInterval);
      console.log('✅ Odelink: shopXtools detected, overriding...');
      
      // fetchProductsByCountry'yi override et
      window.shopXtools.fetchProductsByCountry = function(countryCode) {
        console.log('✅ Odelink: Loading ${shopifyProducts.length} products');
        
        // Ürünleri yükle
        window.shopXtools.products = window.ODELINK_PRODUCTS.map(function(p) {
          return { node: p };
        });
        
        // Country-based products
        window.shopXtools.productsWithPrices = {
          'TR': window.shopXtools.products,
          'US': window.shopXtools.products,
          'GB': window.shopXtools.products
        };
        
        window.shopXtools.status = 'ready';
        
        // Event dispatch et
        setTimeout(function() {
          if (window.shopXtools.dispatchEvent) {
            window.shopXtools.dispatchEvent('data__products-ready', {
              products: window.shopXtools.products,
              isInitialLoad: true
            });
          }
          console.log('✅ Odelink: Products loaded and event dispatched');
        }, 100);
        
        return Promise.resolve(window.shopXtools.products);
      };
      
      // fetchProductsByIds'i de override et
      window.shopXtools.fetchProductsByIds = function(productIds) {
        console.log('✅ Odelink: fetchProductsByIds called, returning empty');
        return Promise.resolve([]);
      };
      
      // Priority queue'yu devre dışı bırak
      window.shopXtools.processPriorityQueue = function() {
        return Promise.resolve();
      };
      
      // Hemen ürünleri yükle
      window.shopXtools.fetchProductsByCountry('TR');
    }
    
    // Timeout kontrolü
    if (initAttempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.error('❌ Odelink: Timeout - shopXtools not initialized');
      
      // Fallback: Manuel yükleme
      window.shopXtools = window.shopXtools || {};
      window.shopXtools.products = window.ODELINK_PRODUCTS.map(function(p) {
        return { node: p };
      });
      window.shopXtools.status = 'ready';
      console.log('⚠️ Odelink: Fallback - products loaded manually');
    }
  }, 100);
  
  console.log('✅ Odelink: Product injection ready');
</script>`;

      // </head> önce ekle
      html = html.replace('</head>', productScript + '\n</head>');
      
      // Meta tag'leri güncelle
      html = html.replace(/<title>.*?<\/title>/i, `<title>${siteSettings.name || 'Mağaza'}</title>`);
      
      console.log(`✅ WEAR teması hazır: ${shopifyProducts.length} ürün`);
      return html;
      
    } catch (error) {
      console.error('❌ WEAR theme error:', error);
      throw error;
    }
  }

  /**
   * Shopier ürünlerini Shopify formatına çevir
   */
  convertToShopifyFormat(products) {
    if (!Array.isArray(products)) return [];
    
    return products.map((p, index) => {
      const productId = p.id || p.product_id || `product-${index}`;
      const price = parseFloat(p.price || p.unit_price || 0);
      const image = p.image || p.image_url || p.main_image || '';
      const images = Array.isArray(p.images) ? p.images : (image ? [image] : []);
      
      return {
        id: `gid://shopify/Product/${productId}`,
        title: p.name || p.title || 'Ürün',
        handle: this.slugify(p.name || p.title || `product-${index}`),
        vendor: p.brand || 'Mağaza',
        productType: p.category || '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        createdAt: new Date().toISOString(),
        
        // Görseller - WEAR teması bunu kullanıyor
        images: {
          edges: images.slice(0, 10).map(url => ({
            node: {
              url: url,
              altText: p.name || '',
              width: 800,
              height: 800
            }
          }))
        },
        
        // Fiyat aralığı
        priceRange: {
          minVariantPrice: {
            amount: price.toString(),
            currencyCode: 'TRY'
          },
          maxVariantPrice: {
            amount: price.toString(),
            currencyCode: 'TRY'
          }
        },
        
        compareAtPriceRange: p.old_price ? {
          minVariantPrice: {
            amount: parseFloat(p.old_price).toString(),
            currencyCode: 'TRY'
          },
          maxVariantPrice: {
            amount: parseFloat(p.old_price).toString(),
            currencyCode: 'TRY'
          }
        } : null,
        
        // Varyantlar
        variants: {
          edges: this.generateVariants(p, productId, price)
        },
        
        // Opsiyonlar
        options: this.generateOptions(p),
        
        // Koleksiyonlar
        collections: {
          edges: p.category ? [{
            node: {
              id: `gid://shopify/Collection/${this.slugify(p.category)}`,
              title: p.category,
              handle: this.slugify(p.category)
            }
          }] : []
        },
        
        // Metafields (renk, beden için)
        metafields: [],
        
        // Selling plans (abonelik - boş)
        sellingPlanGroups: {
          edges: []
        },
        
        // Stok durumu
        availableForSale: (p.stock || 0) > 0,
        
        // Açıklama
        description: p.description || '',
        
        // Shopier URL - sepete ekle için
        shopierUrl: p.url || p.product_url || ''
      };
    });
  }

  /**
   * Varyantlar oluştur (beden, renk kombinasyonları)
   */
  generateVariants(product, productId, price) {
    const variants = [];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    
    if (sizes.length === 0 && colors.length === 0) {
      // Default varyant
      variants.push({
        node: {
          id: `gid://shopify/ProductVariant/${productId}-default`,
          title: 'Default',
          price: {
            amount: price.toString(),
            currencyCode: 'TRY'
          },
          compareAtPrice: product.old_price ? {
            amount: parseFloat(product.old_price).toString(),
            currencyCode: 'TRY'
          } : null,
          availableForSale: (product.stock || 0) > 0,
          quantityAvailable: parseInt(product.stock || 0),
          selectedOptions: [],
          requiresShipping: true,
          sku: product.sku || productId,
          image: null
        }
      });
    } else if (sizes.length > 0 && colors.length === 0) {
      // Sadece beden
      sizes.forEach((size, idx) => {
        variants.push({
          node: {
            id: `gid://shopify/ProductVariant/${productId}-${idx}`,
            title: size,
            price: {
              amount: price.toString(),
              currencyCode: 'TRY'
            },
            compareAtPrice: product.old_price ? {
              amount: parseFloat(product.old_price).toString(),
              currencyCode: 'TRY'
            } : null,
            availableForSale: (product.stock || 0) > 0,
            quantityAvailable: parseInt(product.stock || 0),
            selectedOptions: [
              { name: 'Beden', value: size }
            ],
            requiresShipping: true,
            sku: `${product.sku || productId}-${size}`,
            image: null
          }
        });
      });
    } else if (colors.length > 0 && sizes.length === 0) {
      // Sadece renk
      colors.forEach((color, idx) => {
        variants.push({
          node: {
            id: `gid://shopify/ProductVariant/${productId}-${idx}`,
            title: color,
            price: {
              amount: price.toString(),
              currencyCode: 'TRY'
            },
            compareAtPrice: product.old_price ? {
              amount: parseFloat(product.old_price).toString(),
              currencyCode: 'TRY'
            } : null,
            availableForSale: (product.stock || 0) > 0,
            quantityAvailable: parseInt(product.stock || 0),
            selectedOptions: [
              { name: 'Renk', value: color }
            ],
            requiresShipping: true,
            sku: `${product.sku || productId}-${color}`,
            image: null
          }
        });
      });
    } else {
      // Hem beden hem renk - kombinasyonlar
      let idx = 0;
      colors.forEach(color => {
        sizes.forEach(size => {
          variants.push({
            node: {
              id: `gid://shopify/ProductVariant/${productId}-${idx}`,
              title: `${color} / ${size}`,
              price: {
                amount: price.toString(),
                currencyCode: 'TRY'
              },
              compareAtPrice: product.old_price ? {
                amount: parseFloat(product.old_price).toString(),
                currencyCode: 'TRY'
              } : null,
              availableForSale: (product.stock || 0) > 0,
              quantityAvailable: parseInt(product.stock || 0),
              selectedOptions: [
                { name: 'Renk', value: color },
                { name: 'Beden', value: size }
              ],
              requiresShipping: true,
              sku: `${product.sku || productId}-${color}-${size}`,
              image: null
            }
          });
          idx++;
        });
      });
    }
    
    return variants;
  }

  /**
   * Opsiyonlar oluştur
   */
  generateOptions(product) {
    const options = [];
    
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      options.push({
        id: 'gid://shopify/ProductOption/color',
        name: 'Renk',
        values: product.colors.slice(0, 20)
      });
    }
    
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      options.push({
        id: 'gid://shopify/ProductOption/size',
        name: 'Beden',
        values: product.sizes.slice(0, 20)
      });
    }
    
    return options;
  }

  slugify(text) {
    return (text || '')
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
  }
}

module.exports = new WearThemeService();
