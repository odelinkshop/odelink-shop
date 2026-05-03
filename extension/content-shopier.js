/**
 * ODELINK PROFESSIONAL EXPORTER v4.2
 * Shopier Infinite Scroll + Doğru Seçiciler
 */

console.log('%c🏛️ ODELINK PRO EXPORTER v4.2', 'color: #C5A059; font-weight: bold; font-size: 16px;');

// ─── SHOPIER KESİN SEÇİCİLER ───
const PRODUCT_SELECTOR = 'a.product-card__link.product-image-link-store';

// ─── ELITE UI ───
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
  #odelink-root { all: initial; font-family: 'Outfit', sans-serif; }
  .odelink-floating-btn {
    position: fixed; bottom: 30px; right: 30px;
    background: linear-gradient(135deg, #C5A059 0%, #9A7B4F 100%);
    color: #000; padding: 14px 28px; border-radius: 16px;
    cursor: pointer; z-index: 2147483647;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3);
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    border: 1px solid rgba(0,0,0,0.1); user-select: none;
    animation: odelink-bounce 2s infinite ease-in-out;
  }
  .odelink-floating-btn:hover {
    transform: scale(1.05) translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 15px rgba(197,160,89,0.4);
    animation: none;
  }
  .odelink-logo-box {
    width: 28px; height: 28px; background: #000; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #C5A059; font-size: 14px;
  }
  .odelink-btn-text { font-weight: 800; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; }
  .odelink-scanner {
    position: fixed; top: 0; left: 0; width: 100%; height: 4px;
    background: linear-gradient(90deg, transparent, #C5A059, transparent);
    z-index: 2147483646; box-shadow: 0 0 20px #C5A059; display: none;
  }
  @keyframes odelink-scan { 0% { top: 0; opacity: 1; } 100% { top: 100%; opacity: 0; } }
  @keyframes odelink-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .odelink-toast {
    position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
    background: rgba(10, 10, 10, 0.9); backdrop-filter: blur(15px);
    border: 1px solid rgba(197, 160, 89, 0.3); color: #F2EBE1;
    padding: 16px 32px; border-radius: 50px; font-size: 13px;
    font-weight: 700; letter-spacing: 1px; z-index: 2147483647;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6); opacity: 0; transition: all 0.5s;
  }
`;

function injectStyles() {
  const s = document.createElement('style');
  s.textContent = styles;
  document.head.appendChild(s);
}

function createFloatingUI() {
  if (document.getElementById('odelink-root')) return;
  const root = document.createElement('div');
  root.id = 'odelink-root';
  const scanner = document.createElement('div');
  scanner.className = 'odelink-scanner';
  const btn = document.createElement('div');
  btn.className = 'odelink-floating-btn';
  btn.innerHTML = `<div class="odelink-logo-box">O</div><span class="odelink-btn-text">PAKETLE</span>`;
  const toast = document.createElement('div');
  toast.className = 'odelink-toast';
  root.appendChild(scanner);
  root.appendChild(btn);
  root.appendChild(toast);
  document.body.appendChild(root);
  btn.onclick = () => doFullScanAndExport();
}

// ─── ANA TARAMA MOTORU ───
async function doFullScanAndExport() {
  const btn = document.querySelector('.odelink-floating-btn');
  const scanner = document.querySelector('.odelink-scanner');
  const toast = document.querySelector('.odelink-toast');

  btn.style.opacity = '0.5';
  btn.style.pointerEvents = 'none';
  scanner.style.display = 'block';
  scanner.style.animation = 'odelink-scan 2s infinite linear';
  showToast(toast, '💎 Derin Tarama Başlatıldı...');

  const products = await deepScanProducts(toast);

  scanner.style.display = 'none';
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';

  if (products.length > 0) {
    showToast(toast, `✅ ${products.length} Ürün Paketlendi! Dosya İndiriliyor...`);
    downloadJSON(products);
    setTimeout(() => hideToast(toast), 5000);
  } else {
    showToast(toast, '❌ Sayfada Ürün Bulunamadı.');
    setTimeout(() => hideToast(toast), 3000);
  }
}

// ─── DERİN TARAMA (Infinite Scroll Desteği) ───
async function deepScanProducts(toast) {
  // Sayfayı en başa al
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 500));

  let previousCount = 0;
  let sameCountRetries = 0;
  const maxRetries = 5; // Aynı sayıda 5 kez üst üste gelirse dur

  while (sameCountRetries < maxRetries) {
    // Sayfanın en altına kaydır (infinite scroll tetiklemek için)
    window.scrollTo(0, document.body.scrollHeight);
    
    // Shopier'in AJAX isteğini tamamlaması için UZUN BEKLE
    await new Promise(r => setTimeout(r, 1500));

    const currentCount = document.querySelectorAll(PRODUCT_SELECTOR).length;
    showToast(toast, `🛰️ Taranıyor: ${currentCount} Ürün Yüklendi...`);

    if (currentCount === previousCount) {
      sameCountRetries++;
      // Biraz daha bekle, belki yavaş yükleniyor
      await new Promise(r => setTimeout(r, 1000));
    } else {
      sameCountRetries = 0; // Yeni ürünler geldi, sayacı sıfırla
    }
    
    previousCount = currentCount;
  }

  showToast(toast, `📦 ${previousCount} Ürün Bulundu, Paketleniyor...`);

  // En üste geri dön
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await new Promise(r => setTimeout(r, 500));

  return extractAllProducts();
}

// ─── ÜRÜN ÇEKME MOTORU ───
function extractAllProducts() {
  const products = [];
  const seen = new Set();

  const cards = document.querySelectorAll(PRODUCT_SELECTOR);
  console.log(`🔍 [Odelink] ${cards.length} gerçek ürün kartı bulundu.`);

  cards.forEach((card, index) => {
    try {
      const href = card.getAttribute('href') || '';
      
      // javascript:void(0) gibi sahte linkleri atla
      if (!href || href.includes('javascript:') || href === '#') return;
      
      const fullUrl = href.startsWith('http') ? href : `https://www.shopier.com${href}`;
      if (seen.has(fullUrl)) return;
      seen.add(fullUrl);

      const name = card.querySelector('h3')?.textContent?.trim() || `Ürün ${index + 1}`;
      
      // Fiyat: Tüm span'ları topla (örn: "1.699" + "TL")
      const spans = card.querySelectorAll('span');
      let price = '';
      spans.forEach(s => { price += s.textContent?.trim() + ' '; });
      price = price.trim() || '0 TL';
      
      const img = card.querySelector('img')?.getAttribute('src') || 
                  card.querySelector('img')?.getAttribute('data-src') || '';
      const id = href.split('/').filter(Boolean).pop() || `p${index}`;

      products.push({ id, name, price, image: img, url: fullUrl });
    } catch (e) {
      console.warn('⚠️ Ürün parse hatası:', e);
    }
  });

  console.log(`✅ [Odelink] ${products.length} ürün başarıyla ayıklandı.`);
  return products;
}

// ─── JSON İNDİRME ───
function downloadJSON(products) {
  const data = {
    exportDate: new Date().toISOString(),
    totalProducts: products.length,
    source: window.location.href,
    products: products
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `odelink_magaza_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── YARDIMCI ───
function showToast(el, msg) { el.innerHTML = msg; el.style.opacity = '1'; el.style.top = '40px'; }
function hideToast(el) { el.style.opacity = '0'; el.style.top = '30px'; }

// ─── POPUP KOMUTLARI ───
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_products') {
    deepScanProducts(document.querySelector('.odelink-toast') || document.createElement('div'))
      .then(products => { sendResponse({ success: true, products }); });
    return true;
  }
});

// ─── BAŞLAT ───
injectStyles();
createFloatingUI();
