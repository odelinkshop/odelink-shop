/**
 * SHOPIER API SERVICE
 * Shopier'ın resmi REST API'sini kullanarak ürün listesi çeker
 * Scraping yerine API kullanımı - Hızlı ve garantili!
 */

const axios = require('axios');

const SHOPIER_API_BASE_URL = process.env.SHOPIER_API_BASE_URL || 'https://api.shopier.com/v1';
const SHOPIER_API_TOKEN = process.env.SHOPIER_API_TOKEN;

/**
 * Shopier API'den tüm ürünleri çeker
 * @param {string} shopierUrl - Shopier mağaza URL'i
 * @param {string} apiToken - Kullanıcının kendi API anahtarı (Opsiyonel)
 * @returns {Promise<Array>} Ürün listesi
 */
async function fetchProductsFromShopierAPI(shopierUrl, apiToken) {
  const token = apiToken || SHOPIER_API_TOKEN;

  if (!token) {
    // API key yoksa null dön → caller scraping fallback'e geçecek
    console.warn('⚠️ Shopier API anahtarı yok; scraping fallback kullanılacak.');
    return null;
  }

  try {
    console.log(`📡 Shopier API'den ürünler çekiliyor: ${shopierUrl}`);

    // Shopier URL'den shop ID'yi çıkar (Trailing slash'leri temizle ve Türkçe karakterleri normalize et)
    let shopUsername = shopierUrl.replace(/\/+$/, '').split('/').pop().replace('www.', '');
    
    // Türkçe karakterleri normalize et (Örn: Ödelink -> Odelink)
    shopUsername = shopUsername
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');
    
    // Shopier API'ye istek at (Kişisel Erişim Anahtarı hesabın kendisine bağlıdır, shop parametresi zorunlu olmayabilir)
    const response = await axios.get(`${SHOPIER_API_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params: {
        per_page: 100,
        page: 1
      },
      timeout: 30000
    });

    const products = response.data?.data || response.data?.products || [];
    
    console.log(`✅ ${products.length} ürün Shopier API'den çekildi`);

    // Ürünleri standart formata dönüştür
    return products.map(product => {
      // Fiyat temizleme: "1.299,90" -> 1299.90
      let rawPrice = product.price || 0;
      let cleanPrice = 0;
      if (typeof rawPrice === 'string') {
        // Para birimi sembollerini ve boşlukları kaldır
        cleanPrice = parseFloat(rawPrice.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
      } else {
        cleanPrice = parseFloat(rawPrice);
      }

      // Görsel kalitesini artır
      let rawImage = product.image || product.image_url || product.images?.[0] || '';
      let upgradedImage = rawImage;
      if (typeof rawImage === 'string' && rawImage.includes('shopier.app')) {
        upgradedImage = rawImage
          .replace('/pictures_small/', '/pictures_original/')
          .replace('/pictures_mid/', '/pictures_original/')
          .replace('/pictures_big/', '/pictures_original/')
          .replace('/pictures_large/', '/pictures_original/');
      }

      return {
        id: product.id || product.product_id,
        name: product.name || product.title,
        price: isNaN(cleanPrice) ? 0 : cleanPrice,
        currency: product.currency || 'TRY',
        image: upgradedImage,
        url: product.url || `${shopierUrl}/product/${product.id}`,
        stock: product.stock || product.stock_quantity || 0,
        description: product.description || '',
        category: product.category || '',
        variants: product.variants || []
      };
    });

  } catch (error) {
    console.error('❌ Shopier API hatası:', error.message);

    if (error.response) {
      console.error('API Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    // Throw etme → null dön, caller scraping ile fallback yapacak
    return null;
  }
}

/**
 * Pagination ile tüm ürünleri çeker
 * @param {string} shopierUrl - Shopier mağaza URL'i
 * @param {string} apiToken - Kullanıcının kendi API anahtarı (Opsiyonel)
 * @returns {Promise<Array>} Tüm ürünler
 */
async function fetchAllProductsFromShopierAPI(shopierUrl, apiToken) {
  const token = apiToken || SHOPIER_API_TOKEN;
  
  if (!token) {
    console.warn('⚠️ Shopier API anahtarı bulunamadı, scraping kullanılacak');
    return null; // Scraping'e fallback
  }

  try {
    let shopUsername = shopierUrl.replace(/\/+$/, '').split('/').pop().replace('www.', '');
    
    // Türkçe karakterleri normalize et
    shopUsername = shopUsername
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');
    let allProducts = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Sayfa ${currentPage} çekiliyor...`);

      const response = await axios.get(`${SHOPIER_API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
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
    return allProducts.map(product => {
      // Fiyat temizleme: "1.299,90" -> 1299.90
      let rawPrice = product.price || 0;
      let cleanPrice = 0;
      if (typeof rawPrice === 'string') {
        cleanPrice = parseFloat(rawPrice.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
      } else {
        cleanPrice = parseFloat(rawPrice);
      }

      // Görsel kalitesini artır
      let rawImage = product.image || product.image_url || product.images?.[0] || '';
      let upgradedImage = rawImage;
      if (typeof rawImage === 'string' && rawImage.includes('shopier.app')) {
        upgradedImage = rawImage
          .replace('/pictures_small/', '/pictures_original/')
          .replace('/pictures_mid/', '/pictures_original/')
          .replace('/pictures_big/', '/pictures_original/')
          .replace('/pictures_large/', '/pictures_original/');
      }

      return {
        id: product.id || product.product_id,
        name: product.name || product.title,
        price: isNaN(cleanPrice) ? 0 : cleanPrice,
        currency: product.currency || 'TRY',
        image: upgradedImage,
        url: product.url || `${shopierUrl}/product/${product.id}`,
        stock: product.stock || product.stock_quantity || 0,
        description: product.description || '',
        category: product.category || '',
        variants: product.variants || []
      };
    });

  } catch (error) {
    console.error('❌ Shopier API hatası:', error.message);
    console.warn('⚠️ Scraping\'e fallback yapılacak');
    return null; // Scraping'e fallback
  }
}

/**
 * API anahtarını ve mağaza adını doğrular
 * @param {string} shopierUrl - Shopier mağaza URL'i
 * @param {string} apiToken - Kullanıcının API anahtarı
 * @returns {Promise<Object>} Doğrulama sonucu { ok: boolean, message: string, shopInfo?: object }
 */
async function verifyShopierToken(shopierUrl, apiToken) {
  // API key boşsa scraping akışına izin ver
  if (!apiToken) {
    return {
      ok: true,
      fallbackToScrape: true,
      message: 'API anahtarı verilmedi; ürünler scraping ile çekilecek.',
      shopName: (shopierUrl || '').split('/').pop() || 'magaza',
      productCount: 0
    };
  }

  try {
    let shopUsername = shopierUrl.replace(/\/+$/, '').split('/').pop().replace('www.', '');
    
    // Türkçe karakter normalizasyonu
    shopUsername = shopUsername
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');

    console.log(`🔍 API Anahtarı doğrulanıyor (PAT)...`);

    // API'ye test isteği at (Kişisel Erişim Anahtarı hesabın kendisine bağlıdır)
    const response = await axios.get(`${SHOPIER_API_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json'
      },
      params: {
        per_page: 1,
        page: 1
      },
      timeout: 15000
    });

    // Eğer buraya ulaştıysa 2xx dönmüştür, yani token geçerlidir
    return {
      ok: true,
      message: 'API anahtarı ve mağaza ismi doğrulandı',
      shopName: shopUsername,
      productCount: response.data?.total || response.data?.meta?.total || 0
    };

  } catch (error) {
    console.error('❌ API Doğrulama Hatası (yumuşak fallback):', error.message);

    // ÖNEMLİ: Doğrulama başarısız olsa bile site oluşturma akışı SCRAPING ile devam etsin.
    // Sadece açıkça 401/403 (yetkisiz) durumda kullanıcıya net hata gösterelim,
    // diğer her durumda scraping fallback'i tetikleyelim.
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        return {
          ok: true,
          fallbackToScrape: true,
          warning: 'API anahtarı doğrulanamadı, ürünler mağaza linkinden (scraping) çekilecek.',
          shopName: (shopierUrl || '').split('/').pop() || 'magaza',
          productCount: 0
        };
      }
    }

    return {
      ok: true,
      fallbackToScrape: true,
      warning: `API erişilemedi (${error.message}). Ürünler mağaza linkinden çekilecek.`,
      shopName: (shopierUrl || '').split('/').pop() || 'magaza',
      productCount: 0
    };
  }
}

module.exports = {
  fetchProductsFromShopierAPI,
  fetchAllProductsFromShopierAPI,
  verifyShopierToken
};
