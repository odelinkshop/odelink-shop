/**
 * ODELINK OMNI-SCRAPER v6.0 - THE TERMINATOR ENGINE
 * Ultra-Professional 3D/4D Scanning Experience
 */

(function() {
  if (window.odelinkInitialized) return;
  window.odelinkInitialized = true;

  console.log('%cODELINK OMNI-SCRAPER ACTIVE', 'color: #C5A059; font-size: 20px; font-weight: bold;');

  let isScanning = false;
  let scrapedData = {
    products: [],
    categories: new Set(),
    shopName: document.title.split('-')[0].trim()
  };

  // Inject 3D Scanning UI
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap');

    #odelink-scanner-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999999;
      pointer-events: none;
      font-family: 'Outfit', sans-serif;
      display: none;
    }

    #odelink-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 0, 0, 0.05) 1px, transparent 1px);
      background-size: 50px 50px;
      perspective: 1000px;
      transform: rotateX(20deg);
      opacity: 0;
      transition: opacity 1s ease;
    }

    #odelink-laser {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 4px;
      background: linear-gradient(90deg, transparent, #FF0000, #fff, #FF0000, transparent);
      box-shadow: 0 0 30px #FF0000, 0 0 60px #FF0000;
      z-index: 2;
      display: none;
    }

    #odelink-cursor-tracker {
      position: fixed;
      width: 120px;
      height: 120px;
      border: 3px solid #FF0000;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000000;
      display: none;
      transform: translate(-50%, -50%);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: radial-gradient(circle, rgba(255, 0, 0, 0.2) 0%, transparent 70%);
      box-shadow: 0 0 40px rgba(255, 0, 0, 0.4);
    }

    #odelink-cursor-tracker::before {
      content: '';
      position: absolute;
      inset: -10px;
      border: 2px dashed rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      animation: rotate-3d 10s linear infinite;
    }

    #odelink-cursor-count {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-weight: 900;
      font-size: 28px;
      text-shadow: 0 0 15px #FF0000;
    }

    #odelink-status-tag {
      position: absolute;
      bottom: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: #FF0000;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      padding: 4px 15px;
      border-radius: 4px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 2px;
      box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
    }

    @keyframes rotate-3d { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .odelink-product-lock {
      outline: 5px solid #FF0000 !important;
      outline-offset: -5px;
      position: relative;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(1.05) translateZ(50px);
      z-index: 100;
      box-shadow: 0 0 70px rgba(255, 0, 0, 0.6) !important;
    }

    #odelink-control-panel {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(20px);
      border: 2px solid #FF0000;
      padding: 12px 25px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 25px;
      z-index: 10000001;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
    }

    .odelink-btn {
      background: #FF0000;
      color: #fff;
      border: none;
      padding: 14px 30px;
      border-radius: 50px;
      font-weight: 900;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(255, 0, 0, 0.3);
    }

    .odelink-btn:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 15px 35px rgba(255, 0, 0, 0.5);
    }

    .odelink-btn.stop { background: #333; color: #fff; }
  `;
  document.head.appendChild(style);

  // Create UI Elements
  const overlay = document.createElement('div');
  overlay.id = 'odelink-scanner-overlay';
  overlay.innerHTML = `
    <div id="odelink-grid"></div>
    <div id="odelink-laser"></div>
    <div id="odelink-cursor-tracker">
      <div id="odelink-cursor-count">0</div>
      <div id="odelink-status-tag">Scanning...</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const controlPanel = document.createElement('div');
  controlPanel.id = 'odelink-control-panel';
  controlPanel.innerHTML = `
    <div style="color: #C5A059; font-weight: 900; font-size: 11px; letter-spacing: 2px;">OMNI-SCRAPER v6.0</div>
    <button id="odelink-main-btn" class="odelink-btn">PAKETLE</button>
  `;
  document.body.appendChild(controlPanel);

  const mainBtn = document.getElementById('odelink-main-btn');
  const cursorTracker = document.getElementById('odelink-cursor-tracker');
  const cursorCount = document.getElementById('odelink-cursor-count');
  const laser = document.getElementById('odelink-laser');
  const grid = document.getElementById('odelink-grid');

  // Track Mouse for 3D Cursor (Only when NOT scanning)
  document.addEventListener('mousemove', (e) => {
    if (!isScanning) {
      cursorTracker.style.left = e.clientX + 'px';
      cursorTracker.style.top = e.clientY + 'px';
    }
  });

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function deepScrapeProduct(productElement) {
    const rect = productElement.getBoundingClientRect();
    cursorTracker.style.display = 'block';
    cursorTracker.style.left = (rect.left + rect.width / 2) + 'px';
    cursorTracker.style.top = (rect.top + rect.height / 2) + 'px';
    cursorTracker.style.width = (rect.width + 40) + 'px';
    cursorTracker.style.height = (rect.height + 40) + 'px';
    productElement.classList.add('odelink-product-lock');
    
    const titleEl = productElement.querySelector('.product-name, .title, h4, h3, .product-card__title');
    const priceEl = productElement.querySelector('.product-price, .price, .current-price, .product-card__price');
    const imgEl = productElement.querySelector('img');
    const linkEl = productElement.querySelector('a');
    const productUrl = linkEl?.href;

    const data = {
      id: Date.now() + Math.random(),
      name: titleEl?.innerText?.trim() || 'İsimsiz Ürün',
      price: parseFloat(priceEl?.innerText?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
      imageUrl: imgEl?.src || '',
      image: imgEl?.src || '',
      url: productUrl || '',
      description: '',
      images: [imgEl?.src].filter(Boolean),
      variants: [],
      category: 'Genel',
      slug: (titleEl?.innerText || 'urun').toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    };

    if (productUrl) {
      try {
        // URL'yi garantiye al
        const fullUrl = productUrl.startsWith('http') ? productUrl : window.location.origin + productUrl;
        
        const resp = await fetch(fullUrl);
        if (!resp.ok) throw new Error('Fetch failed');
        
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 1. Resimleri sömür (Tüm ihtimaller)
        const foundImages = [];
        doc.querySelectorAll('img, [data-src], .product-images img, .slides img').forEach(el => {
          const src = el.getAttribute('data-src') || el.getAttribute('src') || el.src;
          if (src && src.includes('cdn.shopier.app/pictures')) {
            // xlarge bazı mağazalarda 404 verdiği için en güvenli ve yüksek çözünürlük olan 'large' kullanıyoruz
            const highRes = src.replace(/pictures_(mid|xlarge|small|mid_mid|standard|mid_large)/, 'pictures_large');
            if (highRes.startsWith('http')) foundImages.push(highRes);
          }
        });

        if (foundImages.length > 0) {
          data.images = [...new Set(foundImages)];
          data.imageUrl = data.images[0];
          data.image = data.images[0];
        }

        // 2. Açıklamayı sömür (Tüm ihtimaller)
        const descSelectors = ['.product-desc', '#productDescription', '.description', '.product-details-content', '.desc-text'];
        for (const sel of descSelectors) {
          const el = doc.querySelector(sel);
          if (el && el.innerText.trim().length > 2) {
            data.description = el.innerHTML.trim();
            break;
          }
        }
      } catch (e) {
        console.error('Deep scan error for:', productUrl, e);
      }
    }
    await sleep(300); 
    productElement.classList.remove('odelink-product-lock');
    return data;
  }

  async function startScanning() {
    isScanning = true;
    overlay.style.display = 'block';
    cursorTracker.style.display = 'block';
    laser.style.display = 'block';
    grid.style.opacity = '1';
    mainBtn.innerText = 'DURDUR';
    mainBtn.classList.add('stop');

    scrapedData.products = [];
    let processedIds = new Set();

    let laserPos = 0;
    const laserAnim = setInterval(() => {
      laserPos += 8;
      if (laserPos > window.innerHeight) laserPos = 0;
      laser.style.top = laserPos + 'px';
    }, 20);

    while (isScanning) {
      // Extended Selectors for Shopier
      const items = document.querySelectorAll('.product-item, .shop-product, .item, .product-item-column, .product-card');
      
      if (items.length === 0) {
        console.warn('No products found with standard selectors, trying broad search...');
      }

      for (const item of items) {
        if (!isScanning) break;
        
        const linkEl = item.querySelector('a');
        const itemKey = linkEl?.href || item.innerText.slice(0, 50); // URL varsa URL kullan, yoksa isim

        if (!processedIds.has(itemKey)) {
          processedIds.add(itemKey);
          
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await sleep(300); 
          
          const product = await deepScrapeProduct(item);
          scrapedData.products.push(product);
          cursorCount.innerText = scrapedData.products.length;
        }
      }

      const prevHeight = window.scrollY;
      window.scrollBy(0, 600);
      await sleep(1500);

      if (window.scrollY === prevHeight) {
        // Double check bottom
        window.scrollBy(0, 200);
        await sleep(500);
        if (window.scrollY === prevHeight) break;
      }
    }

    clearInterval(laserAnim);
    finishScanning();
  }

  function finishScanning() {
    isScanning = false;
    overlay.style.display = 'none';
    mainBtn.innerText = 'İNDİR (PAKET)';
    mainBtn.classList.remove('stop');
    mainBtn.onclick = downloadPackage;
    
    alert(`${scrapedData.products.length} Ürün Başarıyla Paketlendi!`);
  }

  function downloadPackage() {
    const finalData = {
      shopName: scrapedData.shopName,
      products: scrapedData.products,
      categories: Array.from(scrapedData.categories),
      timestamp: new Date().toISOString(),
      version: '6.0'
    };

    const blob = new Blob([JSON.stringify(finalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odelink_paket_${scrapedData.shopName.toLowerCase()}_v6.json`;
    a.click();
    
    mainBtn.innerText = 'PAKETLE';
    mainBtn.onclick = () => startScanning();
  }

  mainBtn.onclick = () => {
    if (isScanning) finishScanning();
    else startScanning();
  };

})();
