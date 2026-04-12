/**
 * SHOPIER API SERVICE
 * Shopier'ın resmi REST API'sini kullanarak ürün listesi çeker
 * Scraping yerine API kullanımı - Hızlı ve garantili!
 */

const axios = require('axios');

const SHOPIER_API_BASE_URL = 'https://api.shopier.com/v1';
const SHOPIER_API_TOKEN = process.env.SHOPIER_API_TOKEN;

/**
 * Shopier API'den tüm ürünleri çeker
 * @param {string} shopierUrl - Shopier mağaza URL'i (örn: https://shopier.com/takikjewelry)
 * @returns {Promise<Array>} Ürün listesi
 */
async function fetchProductsFromShopierAPI(shopierUrl) {
  if (!SHOPIER_API_TOKEN) {
    throw new Error('SHOPIER_API_TOKEN environment variable is not set');
  }

  try {
    console.log(`📡 Shopier API'den ürünler çekiliyor: ${shopierUrl}`);

    // Shopier URL'den shop ID'yi çıkar
    const shopUsername = shopierUrl.split('/').pop().replace('www.', '');
    
    // Shopier API'ye istek at
    const response = await axios.get(`${SHOPIER_API_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${SHOPIER_API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params: {
        shop: shopUsername,
        per_page: 100, // Sayfa başına ürün sayısı
        page: 1
      },
      timeout: 30000
    });

    const products = response.data?.data || response.data?.products || [];
    
    console.log(`✅ ${products.length} ürün Shopier API'den çekildi`);

    // Ürünleri standart formata dönüştür
    return products.map(product => ({
      id: product.id || product.product_id,
      name: product.name || product.title,
      price: parseFloat(product.price || 0),
      currency: product.currency || 'TRY',
      image: product.image || product.image_url || product.images?.[0],
      url: product.url || `${shopierUrl}/product/${product.id}`,
      stock: product.stock || product.stock_quantity || 0,
      description: product.description || '',
      category: product.category || '',
      variants: product.variants || []
    }));

  } catch (error) {
    console.error('❌ Shopier API hatası:', error.message);
    
    if (error.response) {
      console.error('API Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    throw new Error(`Shopier API error: ${error.message}`);
  }
}

/**
 * Pagination ile tüm ürünleri çeker
 * @param {string} shopierUrl - Shopier mağaza URL'i
 * @returns {Promise<Array>} Tüm ürünler
 */
async function fetchAllProductsFromShopierAPI(shopierUrl) {
  if (!SHOPIER_API_TOKEN) {
    console.warn('⚠️ SHOPIER_API_TOKEN bulunamadı, scraping kullanılacak');
    return null; // Scraping'e fallback
  }

  try {
    const shopUsername = shopierUrl.split('/').pop().replace('www.', '');
    let allProducts = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Sayfa ${currentPage} çekiliyor...`);

      const response = await axios.get(`${SHOPIER_API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${SHOPIER_API_TOKEN}`,
          'Accept': 'application/json'
        },
        params: {
          shop: shopUsername,
          per_page: 100,
          page: currentPage
        },
        timeout: 30000
      });

      const products = response.data?.data || response.data?.products || [];
      
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts = allProducts.concat(products);
        currentPage++;
        
        // Rate limit'e saygılı ol
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Toplam ${allProducts.length} ürün Shopier API'den çekildi`);

    // Standart formata dönüştür
    return allProducts.map(product => ({
      id: product.id || product.product_id,
      name: product.name || product.title,
      price: parseFloat(product.price || 0),
      currency: product.currency || 'TRY',
      image: product.image || product.image_url || product.images?.[0],
      url: product.url || `${shopierUrl}/product/${product.id}`,
      stock: product.stock || product.stock_quantity || 0,
      description: product.description || '',
      category: product.category || '',
      variants: product.variants || []
    }));

  } catch (error) {
    console.error('❌ Shopier API hatası:', error.message);
    console.warn('⚠️ Scraping\'e fallback yapılacak');
    return null; // Scraping'e fallback
  }
}

module.exports = {
  fetchProductsFromShopierAPI,
  fetchAllProductsFromShopierAPI
};
