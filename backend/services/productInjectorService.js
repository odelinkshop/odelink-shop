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

      // JavaScript injection code'unu oluştur (ürün verisi + Türkçe çeviri)
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
  
  // KAPSAMLI TÜRKÇE ÇEVİRİ - Client-side DOM traversal
  window.ODELINK_TRANSLATIONS = {
    // Navigasyon
    'Home': 'Ana Sayfa',
    'About': 'Hakkımızda',
    'Shop': 'Mağaza',
    'Blog': 'Blog',
    'Contact': 'İletişim',
    
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
    'Discover': 'Keşfet',
    'Explore': 'Keşfet',
    'Browse': 'Gözat',
    
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
    'Elevate your style': 'Stilinizi yükseltin',
    'Elevate Your Style': 'Stilinizi Yükseltin',
    
    // Ürün kategorileri
    'New arrivals': 'Yeni Gelenler',
    'New Arrivals': 'Yeni Gelenler',
    'Best sellers': 'Çok Satanlar',
    'Best Sellers': 'Çok Satanlar',
    'Featured': 'Öne Çıkanlar',
    'Collections': 'Koleksiyonlar',
    'Categories': 'Kategoriler',
    'Products': 'Ürünler',
    'Latest': 'En Yeni',
    'Trending': 'Trend',
    'Popular': 'Popüler',
    
    // Sayfa başlıkları
    'Welcome': 'Hoş Geldiniz',
    'Our Story': 'Hikayemiz',
    'Our Mission': 'Misyonumuz',
    'Our Vision': 'Vizyonumuz',
    'Our Values': 'Değerlerimiz',
    'Our Team': 'Ekibimiz',
    'About Us': 'Hakkımızda',
    
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
    'Copyright': 'Telif Hakkı',
    
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
    'Available': 'Mevcut',
    'Unavailable': 'Mevcut Değil',
    
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
    'Payment': 'Ödeme',
    'Order': 'Sipariş',
    
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
    'Dashboard': 'Panel',
    
    // Arama ve filtreler
    'Search': 'Ara',
    'Filter': 'Filtrele',
    'Sort by': 'Sırala',
    'Show': 'Göster',
    'Results': 'Sonuç',
    'No results found': 'Sonuç bulunamadı',
    'Clear': 'Temizle',
    'Reset': 'Sıfırla',
    
    // Mesajlar
    'Thank you': 'Teşekkürler',
    'Success': 'Başarılı',
    'Error': 'Hata',
    'Loading': 'Yükleniyor',
    'Please wait': 'Lütfen bekleyin',
    'Coming soon': 'Yakında',
    'More': 'Daha Fazla',
    'Less': 'Daha Az',
    'Show more': 'Daha Fazla Göster',
    'Show less': 'Daha Az Göster',
    
    // Zaman ve tarih
    'Today': 'Bugün',
    'Yesterday': 'Dün',
    'Tomorrow': 'Yarın',
    'Week': 'Hafta',
    'Month': 'Ay',
    'Year': 'Yıl',
    
    // Genel kelimeler
    'Yes': 'Evet',
    'No': 'Hayır',
    'Save': 'Kaydet',
    'Cancel': 'İptal',
    'Delete': 'Sil',
    'Edit': 'Düzenle',
    'Update': 'Güncelle',
    'Submit': 'Gönder',
    'Send': 'Gönder',
    'Back': 'Geri',
    'Next': 'İleri',
    'Previous': 'Önceki',
    'Close': 'Kapat',
    'Open': 'Aç',
    'New': 'Yeni',
    'Old': 'Eski',
    'All': 'Tümü',
    'None': 'Hiçbiri',
    'Select': 'Seç',
    'Choose': 'Seç',
    'Upload': 'Yükle',
    'Download': 'İndir',
    'Share': 'Paylaş',
    'Copy': 'Kopyala',
    'Print': 'Yazdır',
    'Help': 'Yardım',
    'Info': 'Bilgi',
    'Warning': 'Uyarı',
    'Confirm': 'Onayla',
    'Continue': 'Devam',
    'Finish': 'Bitir',
    'Start': 'Başla',
    'Stop': 'Dur',
    'Pause': 'Duraklat',
    'Play': 'Oynat',
    'Refresh': 'Yenile',
    'Reload': 'Yeniden Yükle'
  };
  
  // Türkçe çeviri fonksiyonu - TÜM DOM'u tarar
  function translatePageToTurkish() {
    const translations = window.ODELINK_TRANSLATIONS;
    let translatedCount = 0;
    
    // Tüm text node'ları bul ve çevir
    function translateNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent.trim();
        if (text && translations[text]) {
          node.textContent = node.textContent.replace(text, translations[text]);
          translatedCount++;
        } else {
          // Kısmi eşleşmeleri de kontrol et
          for (const [eng, tur] of Object.entries(translations)) {
            if (node.textContent.includes(eng)) {
              node.textContent = node.textContent.replace(new RegExp(eng, 'g'), tur);
              translatedCount++;
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Placeholder, title, alt gibi attribute'ları da çevir
        if (node.placeholder && translations[node.placeholder]) {
          node.placeholder = translations[node.placeholder];
          translatedCount++;
        }
        if (node.title && translations[node.title]) {
          node.title = translations[node.title];
          translatedCount++;
        }
        if (node.alt && translations[node.alt]) {
          node.alt = translations[node.alt];
          translatedCount++;
        }
        
        // Child node'ları recursive olarak işle
        for (let child of node.childNodes) {
          translateNode(child);
        }
      }
    }
    
    // Body'deki tüm içeriği çevir
    translateNode(document.body);
    
    console.log('✅ Odelink Türkçeleştirme: ' + translatedCount + ' metin çevrildi');
  }
  
  // Sayfa yüklendiğinde çevir
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translatePageToTurkish);
  } else {
    translatePageToTurkish();
  }
  
  // Framer dinamik içerik için MutationObserver
  function startObserver() {
    if (!document.body) return;
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              var translations = window.ODELINK_TRANSLATIONS;
              function translateNewNode(n) {
                if (n.nodeType === Node.TEXT_NODE) {
                  var text = n.textContent.trim();
                  if (text && translations[text]) {
                    n.textContent = n.textContent.replace(text, translations[text]);
                  }
                } else if (n.nodeType === Node.ELEMENT_NODE) {
                  for (var i = 0; i < n.childNodes.length; i++) {
                    translateNewNode(n.childNodes[i]);
                  }
                }
              }
              translateNewNode(node);
            }
          });
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Body hazır olduğunda observer'ı başlat
  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }
  
  console.log('✅ Odelink: ' + window.ODELINK_PRODUCTS.length + ' ürün yüklendi');
  console.log('✅ Odelink: Türkçe çeviri aktif (DOM observer çalışıyor)');
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
          description: this._sanitizeString(product.description || '', 5000), // Increased for elite descriptions
          stock: parseInt(product.stock || product.stock_amount || 0, 10),
          category: this._sanitizeString(product.category || '', 100),
          // Deep Variation Support (Size, Color, etc.)
          variations: product.variations || {},
          images: Array.isArray(product.images) 
            ? product.images.slice(0, 15).map(img => this._sanitizeUrl(img))
            : [],
          sizes: Array.isArray(product.sizes)
            ? product.sizes.slice(0, 30).map(size => this._sanitizeString(size, 50))
            : [],
          colors: Array.isArray(product.colors)
            ? product.colors.slice(0, 30).map(color => this._sanitizeString(color, 50))
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
