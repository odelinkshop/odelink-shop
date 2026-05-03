const API_URL = 'https://www.odelink.shop/api';

async function updatePopup() {
  try {
    const storage = await chrome.storage.local.get(['token', 'siteId']);
    if (!storage.token || !storage.siteId) {
      document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; font-size: 11px;">Lütfen önce Odelink paneline giriş yapın.</div>';
      return;
    }

    const res = await fetch(`${API_URL}/sites/${storage.siteId}/analytics`, {
      headers: {
        'Authorization': `Bearer ${storage.token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      document.getElementById('active-count').textContent = data.realtime?.activeVisitors || 0;
      document.getElementById('today-clicks').textContent = data.totals?.clicks || 0;
    }
  } catch (e) {
    console.error('Popup Update Error:', e);
  }
}

document.getElementById('open-panel').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.odelink.shop/panel' });
});

document.getElementById('sync-shopier').addEventListener('click', async () => {
  const btn = document.getElementById('sync-shopier');
  const originalText = btn.textContent;
  
  try {
    btn.textContent = 'Syncing...';
    btn.disabled = true;

    // Aktif tab'ı bul
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('shopier.com')) {
      alert('Lütfen bu işlemi Shopier panelindeyken yapın.');
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }

    // Content script'e "ürünleri çek" emri gönder
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extract_products' });
    
    if (response && response.success && response.products.length > 0) {
      const storage = await chrome.storage.local.get(['token', 'siteId']);
      
      // Verileri Odelink API'ye gönder
      const apiRes = await fetch(`${API_URL}/sites/${storage.siteId}/sync-from-extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.token}`
        },
        body: JSON.stringify({ products: response.products })
      });

      if (apiRes.ok) {
        alert(`${response.products.length} ürün başarıyla senkronize edildi!`);
      } else {
        alert('API hatası oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      alert('Sayfada ürün bulunamadı. Lütfen ürünler listesinin açık olduğundan emin olun.');
    }
  } catch (e) {
    console.error('Sync Error:', e);
    alert('Bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Sayfa açıldığında verileri çek
updatePopup();
// Her 5 saniyede bir güncelle (popup açıkken)
setInterval(updatePopup, 5000);
