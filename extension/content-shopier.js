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
        linear-gradient(rgba(197, 160, 89, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(197, 160, 89, 0.05) 1px, transparent 1px);
      background-size: 50px 50px;
      perspective: 1000px;
      transform: rotateX(20deg);
      opacity: 0;
      transition: opacity 1s ease;
    }

    #odelink-laser {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 4px;
      background: linear-gradient(90deg, transparent, #C5A059, #fff, #C5A059, transparent);
      box-shadow: 0 0 30px #C5A059, 0 0 60px #C5A059;
      z-index: 2;
      display: none;
    }

    #odelink-cursor-tracker {
      position: fixed;
      width: 120px;
      height: 120px;
      border: 2px solid rgba(197, 160, 89, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000000;
      display: none;
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s;
      background: radial-gradient(circle, rgba(197, 160, 89, 0.1) 0%, transparent 70%);
    }

    #odelink-cursor-tracker::before {
      content: '';
      position: absolute;
      inset: -10px;
      border: 1px dashed rgba(255,255,255,0.2);
      border-radius: 50%;
      animation: rotate-3d 10s linear infinite;
    }

    #odelink-cursor-count {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-weight: 900;
      font-size: 24px;
      text-shadow: 0 0 10px #C5A059;
    }

    #odelink-status-tag {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #C5A059;
      color: #000;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 10px;
      border-radius: 4px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @keyframes rotate-3d { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .odelink-product-lock {
      outline: 4px solid #C5A059 !important;
      outline-offset: -4px;
      position: relative;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(1.02) translateZ(50px);
      z-index: 100;
      box-shadow: 0 0 50px rgba(197, 160, 89, 0.5) !important;
    }

    #odelink-control-panel {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(197, 160, 89, 0.3);
      padding: 10px 20px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 10000001;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .odelink-btn {
      background: #C5A059;
      color: #000;
      border: none;
      padding: 12px 24px;
      border-radius: 50px;
      font-weight: 900;
      font-size: 13px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .odelink-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(197, 160, 89, 0.4);
    }

    .odelink-btn.stop { background: #ff4444; color: #fff; }
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
    // Move cursor to product for 4D feel
    const rect = productElement.getBoundingClientRect();
    const scrollY = window.scrollY;
    
    // Auto-Targeting Animation
    cursorTracker.style.display = 'block';
    cursorTracker.style.left = (rect.left + rect.width / 2) + 'px';
    cursorTracker.style.top = (rect.top + rect.height / 2) + 'px';
    cursorTracker.style.width = (rect.width + 40) + 'px';
    cursorTracker.style.height = (rect.height + 40) + 'px';
    
    productElement.classList.add('odelink-product-lock');
    
    // Comprehensive Shopier Selectors
    const titleEl = productElement.querySelector('.product-name, .title, h4, h3, .product-card__title');
    const priceEl = productElement.querySelector('.product-price, .price, .current-price, .product-card__price');
    const imgEl = productElement.querySelector('img');
    const linkEl = productElement.querySelector('a');

    const data = {
      id: Date.now() + Math.random(),
      title: titleEl?.innerText?.trim() || 'İsimsiz Ürün',
      price: parseFloat(priceEl?.innerText?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
      image: imgEl?.src || '',
      url: linkEl?.href || '',
      description: '',
      images: [imgEl?.src].filter(Boolean),
      variants: [],
      category: 'Genel'
    };

    const descEl = productElement.querySelector('.product-desc, .description');
    if (descEl) data.description = descEl.innerText.trim();
    
    await sleep(400); // Analysis time
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
        // Check visibility
        const rect = item.getBoundingClientRect();
        if (rect.height < 50) continue; 

        const itemKey = item.innerText.slice(0, 100);
        if (!processedIds.has(itemKey)) {
          processedIds.add(itemKey);
          
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await sleep(500); // Wait for scroll
          
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
