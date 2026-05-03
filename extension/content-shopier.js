/**
 * ODELINK SHOP CONNECTOR - CONTENT SCRIPT
 * Shopier panelinden ürün verilerini söküp alan Neural Parser v1
 */

console.log('🏛️ Odelink Connector Active on Shopier');

// YÜZEN BUTON OLUŞTUR (Floating Sync Button)
function injectFloatingButton() {
  if (document.getElementById('odelink-sync-btn')) return;

  const btn = document.createElement('div');
  btn.id = 'odelink-sync-btn';
  btn.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 24px; height: 24px; background: #000; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #C5A059; font-size: 14px;">O</div>
      <span style="font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">ODELINK'E AKTAR</span>
    </div>
  `;

  // Premium Styles
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#C5A059',
    color: 'black',
    padding: '12px 20px',
    borderRadius: '50px',
    cursor: 'pointer',
    zIndex: '999999',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(197,160,89,0.5)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none'
  });

  btn.onmouseover = () => { btn.style.transform = 'scale(1.05) translateY(-5px)'; btn.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)'; };
  btn.onmouseout = () => { btn.style.transform = 'scale(1) translateY(0)'; btn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'; };

  btn.onclick = async () => {
    btn.innerHTML = 'AKTARIILIYOR...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    try {
      const products = extractShopierProducts();
      if (products.length > 0) {
        // Background script üzerinden API'ye gönder (CORS için en güvenli yol)
        chrome.runtime.sendMessage({ action: 'sync_products', products }, (response) => {
          if (response?.success) {
            btn.innerHTML = `✅ ${products.length} ÜRÜN AKTARILDI!`;
            setTimeout(injectFloatingButton, 3000);
          } else {
            btn.innerHTML = '❌ HATA OLUŞTU';
            setTimeout(injectFloatingButton, 3000);
          }
        });
      } else {
        btn.innerHTML = '❌ ÜRÜN BULUNAMADI';
        setTimeout(injectFloatingButton, 3000);
      }
    } catch (e) {
      btn.innerHTML = '❌ HATA';
      setTimeout(injectFloatingButton, 3000);
    }
  };

  document.body.appendChild(btn);
}

// Sayfa yüklendiğinde butonu bas
if (document.readyState === 'complete') injectFloatingButton();
else window.addEventListener('load', injectFloatingButton);

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
