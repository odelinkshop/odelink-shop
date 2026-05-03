// Odelink Professional Exporter - Logic v4
document.getElementById('export-btn').addEventListener('click', async () => {
  const btn = document.getElementById('export-btn');
  const status = document.getElementById('status-msg');
  const originalText = btn.textContent;

  try {
    status.textContent = '🛰️ Mağaza Taranıyor...';
    btn.disabled = true;

    // Aktif tab'ı bul
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('shopier.com')) {
      status.textContent = '❌ Lütfen Shopier Mağazasında Çalıştırın.';
      btn.disabled = false;
      return;
    }

    // Content script'e "ürünleri çek" emri gönder
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extract_products' });
    
    if (response && response.success) {
      status.textContent = `🚀 ${response.products.length} Ürün Paketlendi!`;
      
      // JSON dosyasını oluştur ve indir
      const blob = new Blob([JSON.stringify(response.products, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `odelink_mağaza_paketi_${timestamp}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      status.textContent = '✅ Dosya İndirildi. Odelink Paneline Yükleyin.';
    } else {
      status.textContent = '❌ Ürünler Çekilemedi.';
    }
  } catch (e) {
    console.error('Export Error:', e);
    status.textContent = '❌ Hata: Sayfayı yenileyip deneyin.';
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = originalText;
    }, 3000);
  }
});
