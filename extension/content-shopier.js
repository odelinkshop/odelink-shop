/**
 * ODELINK SHOP CONNECTOR - CONTENT SCRIPT
 * Shopier panelinden ürün verilerini söküp alan Neural Parser v1
 */

console.log('🏛️ Odelink Connector Active on Shopier');

// Mesaj dinleyici - Popup'tan gelen komutları al
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_products') {
    const products = extractShopierProducts();
    sendResponse({ products, success: true });
  }
  return true;
});

/**
 * Shopier sayfasındaki ürünleri ayıkla
 */
function extractShopierProducts() {
  const products = [];
  
  // Shopier'in mevcut panel yapısına göre seçiciler (Selectors)
  // Not: Yeni/Eski panel farkını yönetmek için çoklu seçici kullanıyoruz
  const cards = document.querySelectorAll('.product-card, .shopier-product, [class*="product-item"]');
  
  console.log(`🔍 [Odelink] ${cards.length} ürün kartı tespit edildi.`);

  cards.forEach((card, index) => {
    try {
      const name = card.querySelector('h3, .product-title, [class*="title"]')?.textContent?.trim() || 'İsimsiz Ürün';
      const priceRaw = card.querySelector('.product-price, [class*="price"]')?.textContent?.trim() || '0 TL';
      const img = card.querySelector('img')?.getAttribute('src') || card.querySelector('img')?.getAttribute('data-src') || '';
      const link = card.querySelector('a')?.getAttribute('href') || '';
      const id = link.split('/').pop() || index.toString();

      if (name && id) {
        products.push({
          id,
          name,
          price: priceRaw,
          image: img,
          url: link.startsWith('http') ? link : `https://www.shopier.com${link}`
        });
      }
    } catch (e) {
      console.warn('⚠️ Ürün ayıklanırken hata:', e);
    }
  });

  return products;
}
