/**
 * IMAGE OPTIMIZATION SERVICE
 * Shopier görsellerini Cloudinary ile optimize et
 */

/**
 * Shopier URL'lerini optimize et (HTTP → HTTPS, boyut upgrade)
 * Cloudinary kullanmıyoruz çünkü Shopier CDN 401 hatası veriyor
 */
function optimizeImageUrl(originalUrl, options = {}) {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return originalUrl;
  }

  let url = originalUrl;

  // HTTP'yi HTTPS'e çevir (Mixed Content önleme)
  url = url.replace(/^http:\/\//i, 'https://');

  // Shopier resim boyutlarını upgrade et
  // pictures_small → pictures_mid veya pictures_big
  if (url.includes('/pictures_small/')) {
    const targetSize = options.width && options.width > 800 ? 'pictures_big' : 'pictures_mid';
    url = url.replace('/pictures_small/', `/${targetSize}/`);
  } else if (url.includes('/pictures_mid/') && options.width && options.width > 1000) {
    url = url.replace('/pictures_mid/', '/pictures_big/');
  }

  return url;
}

/**
 * Ürün görseli için optimize URL
 */
function optimizeProductImage(url, size = 'medium') {
  const sizeConfig = {
    thumbnail: { width: 400 },
    small: { width: 600 },
    medium: { width: 800 },
    large: { width: 1200 },
    original: { width: 2000 }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  return optimizeImageUrl(url, config);
}

/**
 * Logo görseli için optimize URL
 */
function optimizeLogoImage(url) {
  return optimizeImageUrl(url, { width: 300 });
}

/**
 * Responsive image srcset oluştur
 */
function generateResponsiveSrcset(url) {
  if (!url) return '';

  const sizes = [
    { width: 400, descriptor: '400w' },
    { width: 800, descriptor: '800w' },
    { width: 1200, descriptor: '1200w' }
  ];

  const srcset = sizes
    .map(({ width, descriptor }) => {
      const optimizedUrl = optimizeImageUrl(url, { width });
      return `${optimizedUrl} ${descriptor}`;
    })
    .join(', ');

  return srcset;
}

/**
 * Ürün listesi için toplu optimize
 */
function optimizeProductImages(products) {
  if (!Array.isArray(products)) return products;

  return products.map(product => {
    const optimized = { ...product };

    // Ana görsel
    if (product.image) {
      optimized.image = optimizeProductImage(product.image, 'medium');
      optimized.image_thumbnail = optimizeProductImage(product.image, 'thumbnail');
      optimized.image_large = optimizeProductImage(product.image, 'large');
      optimized.image_srcset = generateResponsiveSrcset(product.image);
    }

    // Galeri görselleri
    if (Array.isArray(product.images) && product.images.length > 0) {
      optimized.images = product.images.map(img => ({
        original: img,
        optimized: optimizeProductImage(img, 'medium'),
        thumbnail: optimizeProductImage(img, 'thumbnail'),
        large: optimizeProductImage(img, 'large'),
        srcset: generateResponsiveSrcset(img)
      }));
    }

    return optimized;
  });
}

/**
 * Site ayarları için logo optimize
 */
function optimizeSiteSettings(settings) {
  if (!settings || typeof settings !== 'object') return settings;

  const optimized = { ...settings };

  // Logo
  if (settings.logo_url) {
    optimized.logo_url_optimized = optimizeLogoImage(settings.logo_url);
  }

  // Ürünler
  if (Array.isArray(settings.products_data)) {
    optimized.products_data = optimizeProductImages(settings.products_data);
  }

  return optimized;
}

/**
 * Image optimization durumunu kontrol et
 */
function checkCloudinaryConfig() {
  console.log('✅ Image optimization: Shopier HTTPS direct URLs');
  return true;
}

module.exports = {
  optimizeImageUrl,
  optimizeProductImage,
  optimizeLogoImage,
  generateResponsiveSrcset,
  optimizeProductImages,
  optimizeSiteSettings,
  checkCloudinaryConfig
};
