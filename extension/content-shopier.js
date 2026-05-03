/**
 * ODELINK SHOP CONNECTOR - CONTENT SCRIPT
 * Shopier panelinden ürün verilerini söküp alan Neural Parser v1
 */

console.log('%c🏛️ ODELINK NEURAL CONNECTOR ACTIVE', 'color: #C5A059; font-weight: bold; font-size: 16px;');

// ELITE UI ELEMENTS
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
  
  #odelink-root {
    all: initial;
    font-family: 'Outfit', sans-serif;
  }

  .odelink-floating-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #C5A059 0%, #9A7B4F 100%);
    color: #000;
    padding: 14px 28px;
    border-radius: 16px;
    cursor: pointer;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    border: 1px solid rgba(0,0,0,0.1);
    user-select: none;
    animation: odelink-bounce 2s infinite ease-in-out;
  }

  .odelink-floating-btn:hover {
    transform: scale(1.05) translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 15px rgba(197,160,89,0.4);
    animation: none;
  }

  .odelink-floating-btn:active {
    transform: scale(0.95);
  }

  .odelink-logo-box {
    width: 28px;
    height: 28px;
    background: #000;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: #C5A059;
    font-size: 14px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  .odelink-btn-text {
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .odelink-scanner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, transparent, #C5A059, transparent);
    z-index: 2147483646;
    box-shadow: 0 0 20px #C5A059;
    display: none;
  }

  @keyframes odelink-scan {
    0% { top: 0; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  @keyframes odelink-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .odelink-toast {
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 10, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(197, 160, 89, 0.3);
    color: #F2EBE1;
    padding: 16px 32px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    opacity: 0;
    transition: all 0.5s;
  }
`;

function injectStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

function createFloatingUI() {
  if (document.getElementById('odelink-root')) return;

  const root = document.createElement('div');
  root.id = 'odelink-root';
  
  const scanner = document.createElement('div');
  scanner.className = 'odelink-scanner';
  
  const btn = document.createElement('div');
  btn.className = 'odelink-floating-btn';
  btn.innerHTML = `
    <div class="odelink-logo-box">O</div>
    <span class="odelink-btn-text">Elite Sync</span>
  `;

  const toast = document.createElement('div');
  toast.className = 'odelink-toast';

  root.appendChild(scanner);
  root.appendChild(btn);
  root.appendChild(toast);
  document.body.appendChild(root);

  btn.onclick = () => startNeuralSync(btn, scanner, toast);
}

async function startNeuralSync(btn, scanner, toast) {
  // UI States
  btn.style.opacity = '0.5';
  btn.style.pointerEvents = 'none';
  scanner.style.display = 'block';
  scanner.style.animation = 'odelink-scan 2s infinite linear';

  showToast(toast, '💎 Nova Neural: Derin Tarama Başlatıldı...');

  try {
    // 🚀 SMOOTH NEURAL SCROLL (Yavaş ve Kesin Kaydırma)
    let totalHeight = document.body.scrollHeight;
    let currentPos = 0;
    const step = 600; // Her adımda 600px kaydır
    const delay = 400; // Her adımda 0.4 saniye bekle (lazy load için)

    while (currentPos < document.body.scrollHeight) {
      window.scrollBy(0, step);
      currentPos += step;
      
      const foundCount = document.querySelectorAll('.product-card, .shopier-product-card, [class*="product"]').length;
      showToast(toast, `🛰️ Taranıyor: ${foundCount} Ürün Tespit Edildi...`);
      
      await new Promise(r => setTimeout(r, delay));
      
      // Eğer sayfa aşağı indikçe büyüdüyse totalHeight'ı güncelle
      if (document.body.scrollHeight > totalHeight) {
        totalHeight = document.body.scrollHeight;
      }
    }

    // En üste geri dön (Şık bir hareket)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));

    const products = extractShopierProducts();
    
    if (products.length > 0) {
      showToast(toast, `🚀 ${products.length} Ürün Paketleniyor...`);
      await new Promise(r => setTimeout(r, 1000));
      
      chrome.runtime.sendMessage({ action: 'sync_products', products }, (response) => {
        if (response?.success) {
          showToast(toast, '👑 İşlem Başarılı! Mağazanız Güncellendi.');
          scanner.style.display = 'none';
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          setTimeout(() => {
            hideToast(toast);
            if(confirm(`${products.length} ürün başarıyla aktarıldı. Panelde görmek ister misiniz?`)) {
              window.open('https://www.odelink.shop/panel', '_blank');
            }
          }, 3000);
        } else {
          showToast(toast, '⚠️ Hata: Sunucu Bağlantısı Kesildi.');
          resetUI(btn, scanner, toast);
        }
      });
    } else {
      showToast(toast, '❌ Sayfada Ürün Tespit Edilemedi.');
      resetUI(btn, scanner, toast);
    }
  } catch (e) {
    showToast(toast, '❌ Kritik Sistem Hatası.');
    resetUI(btn, scanner, toast);
  }
}

function showToast(el, msg) {
  el.innerHTML = msg;
  el.style.opacity = '1';
  el.style.top = '40px';
}

function hideToast(el) {
  el.style.opacity = '0';
  el.style.top = '30px';
}

function resetUI(btn, scanner, toast) {
  scanner.style.display = 'none';
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
  setTimeout(() => hideToast(toast), 3000);
}

// Global initialization
injectStyles();
createFloatingUI();

// Mesaj dinleyici - Popup'tan gelen komutları al
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_products') {
    const btn = document.querySelector('.odelink-floating-btn');
    const scanner = document.querySelector('.odelink-scanner');
    const toast = document.querySelector('.odelink-toast');
    
    startNeuralSync(btn, scanner, toast).then(() => {
      sendResponse({ success: true });
    });
    return true; // Asenkron yanıt için
  }
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
