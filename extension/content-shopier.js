/**
 * ODELINK ELITE EXPORTER v5.0 (ULTIMATE EDITION)
 * Shopier için Deep Scrape + Pro UI + Progress Counter
 */

console.log('%c🏛️ ODELINK ELITE v5.0', 'color: #C5A059; font-weight: bold; font-size: 20px; text-shadow: 0 0 10px rgba(197,160,89,0.5);');

const PRODUCT_SELECTOR = 'a.product-card__link.product-image-link-store';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap');
  
  #odelink-root { all: initial; font-family: 'Outfit', sans-serif; }
  
  .odelink-floating-btn {
    position: fixed; bottom: 30px; right: 30px;
    background: linear-gradient(135deg, #C5A059 0%, #9A7B4F 100%);
    color: #000; padding: 16px 32px; border-radius: 20px;
    cursor: pointer; z-index: 2147483647;
    display: flex; align-items: center; gap: 14px;
    box-shadow: 0 15px 45px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4);
    transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    border: 1px solid rgba(0,0,0,0.1); user-select: none;
  }

  .odelink-floating-btn:hover {
    transform: scale(1.08) translateY(-8px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 25px rgba(197,160,89,0.6);
  }

  .odelink-logo-box {
    width: 32px; height: 32px; background: #000; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #C5A059; font-size: 16px;
    box-shadow: 0 0 10px rgba(197,160,89,0.3);
  }

  .odelink-btn-text { font-weight: 900; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }

  .odelink-scanner-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
    z-index: 2147483645; display: none; pointer-events: none;
  }

  .odelink-scan-line {
    position: fixed; top: 0; left: 0; width: 100%; height: 2px;
    background: #C5A059; box-shadow: 0 0 30px #C5A059, 0 0 60px #C5A059;
    z-index: 2147483646; display: none;
    animation: odelink-scan-move 3s infinite ease-in-out;
  }

  @keyframes odelink-scan-move {
    0% { top: 0; opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .odelink-panel {
    position: fixed; top: 40px; right: 40px;
    background: rgba(10, 10, 10, 0.85); backdrop-filter: blur(25px);
    border: 1px solid rgba(197, 160, 89, 0.4);
    padding: 24px; border-radius: 24px; width: 320px;
    color: #fff; z-index: 2147483647;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    transform: translateX(400px); transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .odelink-panel.active { transform: translateX(0); }

  .odelink-progress-container { margin-top: 20px; }
  .odelink-progress-bar {
    height: 8px; background: rgba(255,255,255,0.1);
    border-radius: 4px; overflow: hidden; margin-bottom: 12px;
  }
  .odelink-progress-fill {
    height: 100%; width: 0%;
    background: linear-gradient(90deg, #9A7B4F, #C5A059);
    box-shadow: 0 0 15px #C5A059; transition: width 0.3s;
  }

  .odelink-stats { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #C5A059; }
  .odelink-status-text { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 8px; font-style: italic; }

  .odelink-pulse {
    width: 8px; height: 8px; background: #C5A059; border-radius: 50%;
    display: inline-block; margin-right: 8px;
    animation: odelink-pulse-anim 1.5s infinite;
  }
  @keyframes odelink-pulse-anim { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
`;

function injectStyles() {
  const s = document.createElement('style');
  s.textContent = styles;
  document.head.appendChild(s);
}

function createEliteUI() {
  if (document.getElementById('odelink-root')) return;
  const root = document.createElement('div');
  root.id = 'odelink-root';
  
  root.innerHTML = `
    <div class="odelink-scanner-overlay"></div>
    <div class="odelink-scan-line"></div>
    <div class="odelink-floating-btn">
      <div class="odelink-logo-box">O</div>
      <span class="odelink-btn-text">PROFESYONEL PAKETLE</span>
    </div>
    <div class="odelink-panel">
      <div style="font-weight: 900; font-size: 18px; color: #C5A059;">ELITE SCANNER</div>
      <div class="odelink-progress-container">
        <div class="odelink-progress-bar"><div class="odelink-progress-fill"></div></div>
        <div class="odelink-stats">
          <span id="odelink-count">0 / 0</span>
          <span id="odelink-percent">%0</span>
        </div>
        <div class="odelink-status-text"><span class="odelink-pulse"></span><span id="odelink-msg">Sistem hazır...</span></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(root);
  root.querySelector('.odelink-floating-btn').onclick = () => startEliteExport();
}

async function startEliteExport() {
  const panel = document.querySelector('.odelink-panel');
  const overlay = document.querySelector('.odelink-scanner-overlay');
  const scanLine = document.querySelector('.odelink-scan-line');
  const msg = document.getElementById('odelink-msg');
  const countLabel = document.getElementById('odelink-count');
  const fill = document.querySelector('.odelink-progress-fill');

  panel.classList.add('active');
  overlay.style.display = 'block';
  scanLine.style.display = 'block';
  msg.innerText = 'Sayfa taranıyor...';

  // 1. SCROLL VE TOPLAMA
  const productCards = await performInfiniteScroll(countLabel, fill);
  
  // 2. DERİN DETAY ÇEKİMİ (DEEP SCRAPE)
  msg.innerText = 'Ürün detayları arka planda çekiliyor...';
  const eliteProducts = await deepScrapeDetails(productCards, countLabel, fill, msg);

  // 3. İNDİRME
  downloadEliteJSON(eliteProducts);

  msg.innerText = 'Tamamlandı!';
  setTimeout(() => {
    panel.classList.remove('active');
    overlay.style.display = 'none';
    scanLine.style.display = 'none';
  }, 3000);
}

async function performInfiniteScroll(label, fill) {
  window.scrollTo(0, 0);
  let previousCount = 0;
  let sameCountRetries = 0;
  
  // Mağazadaki toplam ürün sayısını bulmaya çalış (296 urun yazısından)
  const totalText = document.body.innerText.match(/(\d+)\s+ürün/i)?.[1] || 0;

  while (sameCountRetries < 8) { // 8 kez bekle (Shopier bazen çok yavaş)
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 2000));

    const currentCards = document.querySelectorAll(PRODUCT_SELECTOR);
    const count = currentCards.length;
    
    label.innerText = `${count} / ${totalText || '?'}`;
    if (totalText > 0) fill.style.width = `${Math.min(95, (count / totalText) * 100)}%`;

    if (count === previousCount) {
      sameCountRetries++;
    } else {
      sameCountRetries = 0;
    }
    previousCount = count;

    // Eğer toplam sayıya ulaştıysak dur
    if (totalText > 0 && count >= parseInt(totalText)) break;
  }
  
  return Array.from(document.querySelectorAll(PRODUCT_SELECTOR));
}

async function deepScrapeDetails(cards, label, fill, msg) {
  const products = [];
  const total = cards.length;

  for (let i = 0; i < total; i++) {
    const card = cards[i];
    const href = card.getAttribute('href');
    const fullUrl = href.startsWith('http') ? href : `https://www.shopier.com${href}`;
    
    label.innerText = `Detay: ${i + 1} / ${total}`;
    fill.style.width = `${(i / total) * 100}%`;
    msg.innerText = `${card.querySelector('h3')?.textContent || 'Ürün'} işleniyor...`;

    try {
      // Ürün sayfasını arka planda çek (Fetch) - Tek tek girmeden!
      const res = await fetch(fullUrl);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Detaylı verileri ayıkla
      const description = doc.querySelector('.product-description')?.innerText?.trim() || '';
      
      // BEDEN VE RENK (Varyasyonlar)
      const variants = [];
      doc.querySelectorAll('.product-variant-item, select option').forEach(opt => {
        const text = opt.innerText?.trim();
        if (text && !text.includes('Seçiniz')) variants.push(text);
      });

      // EK GÖRSELLER
      const images = [];
      doc.querySelectorAll('.product-image-thumb img, .swiper-slide img').forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src) images.push(src.replace('/pictures_small/', '/pictures_original/'));
      });

      products.push({
        id: fullUrl.split('/').pop(),
        name: doc.querySelector('h1')?.innerText?.trim() || card.querySelector('h3')?.innerText?.trim(),
        price: doc.querySelector('.product-price')?.innerText?.trim() || '0 TL',
        description,
        variants: [...new Set(variants)],
        images: [...new Set(images)],
        url: fullUrl
      });

      // Rate limit'e takılmamak için hafif bekleme
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 300));

    } catch (e) {
      console.error('Deep Scrape Hatası:', e);
      // Fallback: Sadece kart verisi
      products.push({
        id: fullUrl.split('/').pop(),
        name: card.querySelector('h3')?.innerText?.trim(),
        price: card.querySelector('span')?.innerText?.trim(),
        url: fullUrl,
        error: 'Detay çekilemedi'
      });
    }
  }
  return products;
}

function downloadEliteJSON(products) {
  const data = {
    exportDate: new Date().toISOString(),
    totalExported: products.length,
    products: products
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `odelink_elite_export_${new Date().getTime()}.json`;
  a.click();
}

injectStyles();
createEliteUI();
