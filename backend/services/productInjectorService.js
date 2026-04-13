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

      // Temayı Türkçeleştir
      themeHtml = this.translateThemeToTurkish(themeHtml);

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
   * Tema HTML'indeki tüm İngilizce metinleri Türkçeye çevir
   * @param {string} html - Tema HTML içeriği
   * @returns {string} - Türkçeleştirilmiş HTML
   */
  translateThemeToTurkish(html) {
    try {
      // Türkçe çeviri haritası - KAPSAMLI LİSTE
      const translations = {
        // Navigasyon
        '>Home<': '>Ana Sayfa<',
        '>About<': '>Hakkımızda<',
        '>Shop<': '>Mağaza<',
        '>Blog<': '>Blog<',
        '>Contact<': '>İletişim<',
        
        // Butonlar ve CTA'lar
        'Shop all items': 'Tüm Ürünler',
        'Shop All Items': 'Tüm Ürünler',
        'See all collections': 'Tüm Koleksiyonlar',
        'See All Collections': 'Tüm Koleksiyonlar',
        'View all': 'Tümünü Gör',
        'View All': 'Tümünü Gör',
        'Contact us': 'Bize Ulaşın',
        'Contact Us': 'Bize Ulaşın',
        'Get in touch': 'İletişime Geç',
        'Get In Touch': 'İletişime Geç',
        'Learn more': 'Daha Fazla',
        'Learn More': 'Daha Fazla',
        'Read more': 'Devamını Oku',
        'Read More': 'Devamını Oku',
        'Shop now': 'Hemen Al',
        'Shop Now': 'Hemen Al',
        'Buy now': 'Satın Al',
        'Buy Now': 'Satın Al',
        'Add to cart': 'Sepete Ekle',
        'Add to Cart': 'Sepete Ekle',
        'View product': 'Ürünü Gör',
        'View Product': 'Ürünü Gör',
        
        // İçerik metinleri
        'Premium wear for modern living': 'Modern yaşam için premium giyim',
        'Premium Wear for Modern Living': 'Modern Yaşam İçin Premium Giyim',
        'Premium wear': 'Premium giyim',
        'Premium Wear': 'Premium Giyim',
        'Modern living': 'Modern yaşam',
        'Modern Living': 'Modern Yaşam',
        'Quality clothing': 'Kaliteli giyim',
        'Quality Clothing': 'Kaliteli Giyim',
        'Fashion forward': 'Moda öncüsü',
        'Fashion Forward': 'Moda Öncüsü',
        'Style meets comfort': 'Stil ve konfor buluşuyor',
        'Style Meets Comfort': 'Stil ve Konfor Buluşuyor',
        
        // Ürün kategorileri
        'New arrivals': 'Yeni Gelenler',
        'New Arrivals': 'Yeni Gelenler',
        'Best sellers': 'Çok Satanlar',
        'Best Sellers': 'Çok Satanlar',
        'Featured': 'Öne Çıkanlar',
        'Collections': 'Koleksiyonlar',
        'Categories': 'Kategoriler',
        'Products': 'Ürünler',
        
        // Sayfa başlıkları
        'Welcome': 'Hoş Geldiniz',
        'Our Story': 'Hikayemiz',
        'Our Mission': 'Misyonumuz',
        'Our Vision': 'Vizyonumuz',
        'Our Values': 'Değerlerimiz',
        'Our Team': 'Ekibimiz',
        
        // Footer ve genel
        'All rights reserved': 'Tüm hakları saklıdır',
        'Privacy Policy': 'Gizlilik Politikası',
        'Terms of Service': 'Hizmet Şartları',
        'Terms & Conditions': 'Şartlar ve Koşullar',
        'Shipping': 'Kargo',
        'Returns': 'İadeler',
        'FAQ': 'SSS',
        'Customer Service': 'Müşteri Hizmetleri',
        'Support': 'Destek',
        'Follow us': 'Bizi Takip Edin',
        'Subscribe': 'Abone Ol',
        'Newsletter': 'Bülten',
        'Email': 'E-posta',
        'Phone': 'Telefon',
        'Address': 'Adres',
        
        // Ürün detayları
        'Size': 'Beden',
        'Color': 'Renk',
        'Price': 'Fiyat',
        'Quantity': 'Adet',
        'In stock': 'Stokta',
        'Out of stock': 'Stokta Yok',
        'Description': 'Açıklama',
        'Details': 'Detaylar',
        'Specifications': 'Özellikler',
        'Reviews': 'Yorumlar',
        'Rating': 'Değerlendirme',
        
        // Sepet ve ödeme
        'Cart': 'Sepet',
        'Checkout': 'Ödeme',
        'Total': 'Toplam',
        'Subtotal': 'Ara Toplam',
        'Shipping cost': 'Kargo Ücreti',
        'Tax': 'Vergi',
        'Discount': 'İndirim',
        'Coupon': 'Kupon',
        'Apply': 'Uygula',
        'Continue shopping': 'Alışverişe Devam',
        'Proceed to checkout': 'Ödemeye Geç',
        
        // Hesap ve kullanıcı
        'Account': 'Hesap',
        'Login': 'Giriş',
        'Sign in': 'Giriş Yap',
        'Sign up': 'Kayıt Ol',
        'Register': 'Kayıt',
        'Logout': 'Çıkış',
        'My account': 'Hesabım',
        'Profile': 'Profil',
        'Orders': 'Siparişler',
        'Wishlist': 'Favoriler',
        'Settings': 'Ayarlar',
        
        // Arama ve filtreler
        'Search': 'Ara',
        'Filter': 'Filtrele',
        'Sort by': 'Sırala',
        'Show': 'Göster',
        'Results': 'Sonuç',
        'No results found': 'Sonuç bulunamadı',
        
        // Mesajlar
        'Thank you': 'Teşekkürler',
        'Success': 'Başarılı',
        'Error': 'Hata',
        'Loading': 'Yükleniyor',
        'Please wait': 'Lütfen bekleyin',
        'Coming soon': 'Yakında',
        
        // Meta ve SEO
        'Modern Clothing E-commerce': 'Modern Giyim E-Ticaret',
        'Framer Template': 'Framer Şablonu',
        'E-commerce': 'E-Ticaret',
        'Online Store': 'Online Mağaza',
        'Fashion': 'Moda',
        'Clothing': 'Giyim',
        'Apparel': 'Giysi',
        'Wearix': 'Wearix'
      };

      // Her çeviriyi uygula
      for (const [english, turkish] of Object.entries(translations)) {
        // Global replace (tüm eşleşmeleri değiştir)
        const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        html = html.replace(regex, turkish);
      }

      // Title tag'i Türkçeleştir
      html = html.replace(
        /<title>.*?<\/title>/i,
        '<title>Wearix - Modern Giyim E-Ticaret Teması</title>'
      );

      // Meta description'ı Türkçeleştir
      html = html.replace(
        /<meta name="description" content=".*?">/i,
        '<meta name="description" content="Online mağazanızı Wearix ile yükseltin. Moda perakendecileri için çağdaş bir tema. Minimalist tasarım ve güçlü e-ticaret özellikleri ile modern, dönüşüm odaklı giyim markanız için mükemmel temel.">'
      );

      // OG meta tag'lerini Türkçeleştir
      html = html.replace(
        /<meta property="og:title" content=".*?">/i,
        '<meta property="og:title" content="Wearix - Modern Giyim E-Ticaret Teması">'
      );
      html = html.replace(
        /<meta property="og:description" content=".*?">/i,
        '<meta property="og:description" content="Online mağazanızı Wearix ile yükseltin. Moda perakendecileri için çağdaş bir tema.">'
      );

      // Twitter meta tag'lerini Türkçeleştir
      html = html.replace(
        /<meta name="twitter:title" content=".*?">/i,
        '<meta name="twitter:title" content="Wearix - Modern Giyim E-Ticaret Teması">'
      );
      html = html.replace(
        /<meta name="twitter:description" content=".*?">/i,
        '<meta name="twitter:description" content="Online mağazanızı Wearix ile yükseltin. Moda perakendecileri için çağdaş bir tema.">'
      );

      console.log('✅ Tema Türkçeleştirildi');
      return html;

    } catch (error) {
      console.error('❌ Translation error:', error);
      // Hata durumunda orijinal HTML'i döndür
      return html;
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
