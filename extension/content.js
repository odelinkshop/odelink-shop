// Odelink Shopier Scraper Content Script
console.log("🚀 Odelink Scraper Active");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    const products = [];
    
    // Shopier product selectors
    const productElements = document.querySelectorAll('.product-item, .sp-product-item, [class*="product"]');
    
    productElements.forEach((el, index) => {
      try {
        const name = el.querySelector('.product-title, .sp-product-title, h3, h2')?.innerText?.trim() || "Adsız Ürün";
        const price = el.querySelector('.product-price, .sp-product-price, .price')?.innerText?.trim() || "0 TL";
        const link = el.querySelector('a')?.href || window.location.href;
        const image = el.querySelector('img')?.src || "";
        
        if (name !== "Adsız Ürün") {
          products.push({
            "Ürün Adı": name,
            "Fiyat": price,
            "Ürün Linki": link,
            "Resim": image,
            "Kategori": "Genel"
          });
        }
      } catch (err) {
        console.error("Error scraping product:", err);
      }
    });

    sendResponse({ products: products, shopName: document.title.split('|')[0].trim() });
  }
  return true;
});
