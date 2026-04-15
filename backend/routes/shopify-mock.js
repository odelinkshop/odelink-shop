/**
 * Shopify API Mock - WEAR Teması İçin
 * WEAR teması Shopify API'ye istek atıyor, biz Odelink ürünlerini döndürüyoruz
 */

const express = require('express');
const router = express.Router();

// In-memory ürün cache (subdomain bazlı)
const productCache = new Map();

/**
 * Ürünleri cache'e kaydet
 */
function cacheProducts(subdomain, products) {
  productCache.set(subdomain, {
    products,
    timestamp: Date.now()
  });
}

/**
 * Cache'den ürünleri al
 */
function getCachedProducts(subdomain) {
  const cached = productCache.get(subdomain);
  if (!cached) return null;
  
  // 5 dakika cache
  if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
    productCache.delete(subdomain);
    return null;
  }
  
  return cached.products;
}

/**
 * POST /api/2024-07/graphql.json
 * Shopify GraphQL API mock - WEAR teması buraya istek atıyor
 */
router.post('/2024-07/graphql.json', express.json(), async (req, res) => {
  try {
    const { query, variables } = req.body;
    
    // Subdomain'i header'dan al (WEAR teması için)
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    console.log('📦 Shopify API Mock:', subdomain, query?.substring(0, 50));
    
    // Cache'den ürünleri al
    const products = getCachedProducts(subdomain);
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products in cache for:', subdomain);
      return res.json({
        data: {
          products: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            }
          }
        }
      });
    }
    
    // GraphQL query'ye göre response döndür
    if (query.includes('GetProductsByCountry') || query.includes('products(')) {
      // Ürün listesi isteği
      return res.json({
        data: {
          products: {
            edges: products.map(p => ({ node: p })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              endCursor: null
            }
          }
        }
      });
    }
    
    if (query.includes('GetProductsByIds') || query.includes('nodes(')) {
      // ID'ye göre ürün isteği
      const requestedIds = variables?.ids || [];
      const filtered = products.filter(p => requestedIds.includes(p.id));
      
      return res.json({
        data: {
          nodes: filtered
        }
      });
    }
    
    if (query.includes('GetCart') || query.includes('cart(')) {
      // Sepet isteği - boş sepet döndür
      return res.json({
        data: {
          cart: {
            id: 'gid://shopify/Cart/mock',
            lines: { edges: [] },
            cost: {
              totalAmount: { amount: '0', currencyCode: 'TRY' },
              subtotalAmount: { amount: '0', currencyCode: 'TRY' }
            }
          }
        }
      });
    }
    
    // Diğer query'ler için boş response
    return res.json({ data: {} });
    
  } catch (error) {
    console.error('❌ Shopify API Mock error:', error);
    return res.status(500).json({
      errors: [{ message: 'Internal server error' }]
    });
  }
});

/**
 * GET /api/shopify-mock/load-products/:subdomain
 * Ürünleri cache'e yükle (internal endpoint)
 */
router.post('/load-products/:subdomain', express.json(), (req, res) => {
  try {
    const { subdomain } = req.params;
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products must be an array' });
    }
    
    cacheProducts(subdomain, products);
    console.log(`✅ Loaded ${products.length} products for ${subdomain}`);
    
    return res.json({ ok: true, count: products.length });
    
  } catch (error) {
    console.error('❌ Load products error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = { router, cacheProducts, getCachedProducts };
