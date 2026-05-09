// Odelink Omni-Scraper Content Script - TURBO GHOST EDITION
(function() {
  let isScanning = false;
  let products = [];

  const style = document.createElement('style');
  style.textContent = `
    #odelink-control-panel {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #111;
      padding: 15px;
      border: 1px solid #C5A059;
      border-radius: 12px;
      z-index: 1000001;
      box-shadow: 0 20px 40px rgba(0,0,0,0.9);
      font-family: sans-serif;
      text-align: center;
      min-width: 180px;
      color: #F2EBE1;
    }
    .odelink-btn {
      background: #C5A059;
      color: #000;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 900;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      transition: all 0.3s;
      text-transform: uppercase;
      font-size: 11px;
    }
    .odelink-status {
      font-size: 10px;
      color: #C5A059;
      letter-spacing: 2px;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .odelink-progress {
      font-size: 24px;
      font-weight: 900;
      margin: 10px 0;
      color: #fff;
    }
    .odelink-scanning-item {
      outline: 2px solid #C5A059 !important;
      outline-offset: 2px !important;
      transition: all 0.1s !important;
    }
  `;
  document.head.appendChild(style);

  const controlPanel = document.createElement('div');
  controlPanel.id = 'odelink-control-panel';
  controlPanel.innerHTML = `
    <div class="odelink-status">OMNI-SCRAPER V6.9</div>
    <div id="odelink-count" class="odelink-progress">0</div>
    <button id="odelink-main-btn" class="odelink-btn">PAKETLE</button>
  `;
  document.body.appendChild(controlPanel);

  const mainBtn = document.getElementById('odelink-main-btn');
  const countDisplay = document.getElementById('odelink-count');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const slugify = (text) => {
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const findImage = (el) => {
    if (!el) return "";
    if (el.tagName === 'IMG' && el.src && !el.src.includes('placeholder')) return el.src;
    const ds = el.getAttribute('data-src') || el.getAttribute('data-original') || el.getAttribute('data-img');
    if (ds) return ds;
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') return bg.slice(4, -1).replace(/"/g, "");
    return "";
  };

  async function scrapeItem(el) {
    el.classList.add('odelink-scanning-item');
    
    const titleEl = el.querySelector('.product-name, .title, h4, h3, .product-card__title, .product-item-title, [class*="title"]');
    const priceEl = el.querySelector('.product-price, .price, .current-price, .product-card__price, .product-item-price, [class*="price"]');
    const imgEl = el.querySelector('img, [style*="background-image"], .product-img');
    const linkEl = el.querySelector('a');
    
    const name = titleEl?.innerText?.trim() || 'İsimsiz Ürün';
    const scrapedImg = findImage(imgEl);
    const productUrl = linkEl?.href;

    const data = {
      id: Date.now() + Math.random(),
      name: name,
      price: parseFloat(priceEl?.innerText?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
      image: scrapedImg,
      imageUrl: scrapedImg,
      url: productUrl || window.location.href,
      slug: slugify(name),
      category: 'Genel',
      images: [scrapedImg].filter(Boolean)
    };

    // Detay sayfası sömürme (Arka planda hızlıca)
    if (productUrl && productUrl !== window.location.href) {
      try {
        const resp = await fetch(productUrl);
        const html = await resp.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        const detailImages = [];
        doc.querySelectorAll('img, [data-src], .slides img, .gallery img, [style*="background-image"]').forEach(img => {
          let src = findImage(img);
          if (src && (src.includes('cdn.shopier.app') || src.includes('shopier.app/pictures'))) {
            if (src.startsWith('http') && !detailImages.includes(src)) detailImages.push(src);
          }
        });
        if (detailImages.length > 0) {
          data.images = detailImages;
          data.image = detailImages[0];
        }

        const descEl = doc.querySelector('.product-description, #product-details, .description, .product-info');
        if (descEl) data.description = descEl.innerHTML;
      } catch (e) {}
    }

    products.push(data);
    countDisplay.innerText = products.length;
    await sleep(100);
    el.classList.remove('odelink-scanning-item');
  }

  async function startScan() {
    isScanning = true;
    products = [];
    const seenUrls = new Set(); // Mükerrer engelleme
    
    mainBtn.innerText = 'DURDUR';
    mainBtn.style.background = '#333';
    mainBtn.style.color = '#fff';

    // Shopier dükkanlarındaki her türlü ürün yapısını bulur
    const items = document.querySelectorAll('.product-item, .product-card, .product-list-item, .product-box, [class*="product"], [class*="item"]');
    
    for (const item of items) {
      if (!isScanning) break;
      
      const linkEl = item.querySelector('a');
      const link = linkEl?.href;
      
      // Linki olan ve içinde fiyat/isim barındıran her şeyi sömür
      if (!link || seenUrls.has(link) || !link.includes('shopier.com/')) continue;
      
      const hasTitle = !!item.querySelector('.product-name, .title, h4, h3, [class*="title"]');
      const hasPrice = !!item.querySelector('.product-price, .price, [class*="price"]');
      
      if (!hasTitle && !hasPrice) continue;

      seenUrls.add(link);
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await scrapeItem(item);
    }
    stopScan();
  }

  function stopScan() {
    isScanning = false;
    mainBtn.innerText = 'PAKETLE';
    mainBtn.style.background = '#C5A059';
    mainBtn.style.color = '#000';

    if (products.length > 0) {
      const shopName = document.querySelector('.shop-name, .logo, title')?.innerText?.split('|')[0]?.trim() || window.location.pathname.split('/')[1] || 'Mağazam';
      const blob = new Blob([JSON.stringify({
        products,
        shopName,
        source: 'shopier',
        timestamp: new Date().toISOString()
      }, null, 2)], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `odelink_paket_${slugify(shopName)}_v7.json`;
      a.click();
    }
  }

  mainBtn.addEventListener('click', () => {
    if (isScanning) stopScan();
    else startScan();
  });
})();
