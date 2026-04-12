/**
 * Product Injector Service
 * Shopier ürünlerini tema HTML'ine güvenli bir şekilde enjekte eder
 */
class ProductInjectorService {
  /**
   * Ürün verilerini tema HTML'ine enjekte et
   * @param {string} themeHtml - Tema HTML içeriği
   * @param {Array} products - Shopier ürün listesi
   * @param {Object} siteSettings - Site ayarları
   * @returns {string} - Enjekte edilmiş HTML
   */
  injectProducts(themeHtml, products, siteSettings = {}) {
    try {
      // Ürün verilerini formatla ve sanitize et
      const formattedProducts = this.formatProducts(products);
      
      // Site verilerini hazırla
      const siteData = {
        name: siteSettings.name || '',
        subdomain: siteSettings.subdomain || '',
        currency: 'TRY',
        logoUrl: siteSettings.logoUrl || '',
        description: siteSettings.description || '',
        contact: siteSettings.contact || {},
        social: siteSettings.social || {}
      };

      // JavaScript injection code'unu oluştur
      const injectionScript = `
<script>
  // Odelink Product Data
  window.ODELINK_PRODUCTS = ${JSON.stringify(formattedProducts).replace(/</g, '\\u003c')};
  
  // Odelink Site Data
  window.ODELINK_SITE = ${JSON.stringify(siteData).replace(/</g, '\\u003c')};
  
  // Helper function to get products
  window.getOdelinkProducts = function() {
    return window.ODELINK_PRODUCTS || [];
  };
  
  // Helper function to get site info
  window.getOdelinkSite = function() {
    return window.ODELINK_SITE || {};
  };
  
  console.log('✅ Odelink: ' + window.ODELINK_PRODUCTS.length + ' ürün yüklendi');
</script>`;

      // </head> tag'inden önce enjekte et
      if (themeHtml.includes('</head>')) {
        return themeHtml.replace('</head>', injectionScript + '\n</head>');
      }
      
      // </head> yoksa <body> tag'inden önce enjekte et
      if (themeHtml.includes('<body')) {
        return themeHtml.replace('<body', injectionScript + '\n<body');
      }
      
      // Hiçbiri yoksa HTML'in başına ekle
      return injectionScript + '\n' + themeHtml;

    } catch (error) {
      console.error('❌ Product injection error:', error);
      // Hata durumunda orijinal HTML'i döndür
      return themeHtml;
    }
  }

  /**
   * Ürün verilerini JSON formatına dönüştür ve sanitize et
   * @param {Array} products - Ham ürün verisi
   * @returns {Array} - Formatlanmış ve sanitize edilmiş ürün verisi
   */
  formatProducts(products) {
    if (!Array.isArray(products)) {
      return [];
    }

    return products.map(product => {
      try {
        return {
          id: this._sanitizeString(product.id || product.product_id || '', 100),
          name: this._sanitizeString(product.name || product.title || '', 200),
          price: this._sanitizePrice(product.price || product.unit_price || 0),
          currency: 'TRY',
          image: this._sanitizeUrl(product.image || product.image_url || product.main_image || ''),
          url: this._sanitizeUrl(product.url || product.product_url || ''),
          description: this._sanitizeString(product.description || '', 1000),
          stock: parseInt(product.stock || product.stock_amount || 0, 10),
          category: this._sanitizeString(product.category || '', 100),
          // Ek alanlar (opsiyonel)
          images: Array.isArray(product.images) 
            ? product.images.slice(0, 10).map(img => this._sanitizeUrl(img))
            : [],
          sizes: Array.isArray(product.sizes)
            ? product.sizes.slice(0, 20).map(size => this._sanitizeString(size, 50))
            : [],
          colors: Array.isArray(product.colors)
            ? product.colors.slice(0, 20).map(color => this._sanitizeString(color, 50))
            : []
        };
      } catch (error) {
        console.error('❌ Product formatting error:', error);
        return null;
      }
    }).filter(Boolean); // null değerleri filtrele
  }

  /**
   * String'i sanitize et (XSS koruması)
   * @private
   */
  _sanitizeString(value, maxLength = 500) {
    if (typeof value !== 'string') {
      value = String(value || '');
    }
    
    // HTML karakterlerini escape et
    value = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    // Maksimum uzunluğa kırp
    return value.slice(0, maxLength);
  }

  /**
   * URL'i sanitize et
   * @private
   */
  _sanitizeUrl(value) {
    if (typeof value !== 'string') {
      return '';
    }
    
    // Sadece http/https protokollerine izin ver
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return '';
    }
    
    // Tehlikeli karakterleri temizle
    value = value
      .replace(/[<>"']/g, '')
      .trim();
    
    // Maksimum 2000 karakter
    return value.slice(0, 2000);
  }

  /**
   * Fiyatı sanitize et
   * @private
   */
  _sanitizePrice(value) {
    const price = parseFloat(value);
    if (isNaN(price) || price < 0) {
      return 0;
    }
    // Maksimum 1 milyon TL
    return Math.min(price, 1000000);
  }
}

module.exports = new ProductInjectorService();
