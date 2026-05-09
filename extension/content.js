// Odelink Shopier Scraper Content Script
console.log("🚀 Odelink Scraper Active");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    const products = [];
    const seenLinks = new Set();
    
    // Daha spesifik selectors
    const productElements = document.querySelectorAll('.product-item, .sp-product-item, .product-detail, .shop-product');
    
    productElements.forEach((el) => {
      try {
        const nameEl = el.querySelector('.product-title, .sp-product-title, .title, h3, h2');
        const priceEl = el.querySelector('.product-price, .sp-product-price, .price');
        const linkEl = el.querySelector('a');
        const imgEl = el.querySelector('img');

        if (!nameEl || !priceEl) return;

        const name = nameEl.innerText.trim();
        const priceText = priceEl.innerText.trim();
        const link = linkEl?.href || window.location.href;
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || "";

        // Temizlik ve Validasyon
        if (name && priceText !== "0 TL" && !seenLinks.has(link)) {
          seenLinks.add(link);
          products.push({
            "Ürün Adı": name,
            "Fiyat": priceText.replace(/\n/g, ' ').replace(/\s+/g, ' '),
            "Ürün Linki": link,
            "Resim": image,
            "Kategori": "Genel"
          });
        }
      } catch (err) {
        console.error("Scraping error:", err);
      }
    });

    sendResponse({ products: products, shopName: document.title.split('|')[0].trim() });
  }
  return true;
});
