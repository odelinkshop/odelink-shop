const API_URL = 'https://www.odelink.shop/api';

async function checkState() {
  const storage = await chrome.storage.local.get(['token', 'siteId']);
  if (storage.token) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    updatePopup();
  } else {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('main-container').style.display = 'none';
  }
}

async function updatePopup() {
  try {
    const { token, siteId } = await chrome.storage.local.get(['token', 'siteId']);
    if (!token || !siteId) return;

    const res = await fetch(`${API_URL}/sites/${siteId}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      document.getElementById('active-count').textContent = data.realtime?.activeVisitors || 0;
      document.getElementById('today-clicks').textContent = data.totals?.clicks || 0;
    }
  } catch (e) {
    console.error('Update Error:', e);
  }
}

// LOGIN LOGIC
document.getElementById('do-login').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = document.getElementById('do-login');
  const errEl = document.getElementById('login-error');

  if (!email || !password) return;

  btn.innerText = 'BAĞLANILIYOR...';
  btn.disabled = true;
  errEl.style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Get the first site of user automatically
      const sitesRes = await fetch(`${API_URL}/sites`, {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const sitesData = await sitesRes.json();
      const firstSiteId = sitesData[0]?.id || 'new'; // 'new' can trigger auto-create

      await chrome.storage.local.set({ 
        token: data.token, 
        siteId: firstSiteId,
        user: data.user
      });
      
      checkState();
    } else {
      errEl.innerText = data.message || 'Giriş başarısız.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.innerText = 'Bağlantı hatası.';
    errEl.style.display = 'block';
  } finally {
    btn.innerText = 'SİSTEME GİRİŞ YAP';
    btn.disabled = false;
  }
});

document.getElementById('google-login').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.odelink.shop/auth' });
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await chrome.storage.local.clear();
  checkState();
});

document.getElementById('open-panel').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.odelink.shop/panel' });
});

checkState();

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
