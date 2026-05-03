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

// Sayfa açıldığında verileri çek
updatePopup();
// Her 5 saniyede bir güncelle (popup açıkken)
setInterval(updatePopup, 5000);
