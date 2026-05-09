document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.innerText = "Taranıyor...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
    if (response && response.products && response.products.length > 0) {
      status.innerText = `${response.products.length} ürün bulundu! Excel hazırlanıyor...`;
      
      // XLSX creation
      const worksheet = XLSX.utils.json_to_sheet(response.products);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      
      // Save file
      const fileName = `${response.shopName || 'shopier'}_products.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      status.innerText = "İndirme Tamamlandı! Odelink Paneline Yükleyebilirsin.";
    } else {
      status.innerText = "Ürün bulunamadı. Lütfen mağaza sayfasında olduğunuzdan emin olun.";
    }
  });
});
