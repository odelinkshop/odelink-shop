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
      if (document.getElementById('active-count')) {
        document.getElementById('active-count').textContent = data.realtime?.activeVisitors || 0;
      }
      if (document.getElementById('today-clicks')) {
        document.getElementById('today-clicks').textContent = data.totals?.clicks || 0;
      }
    }
  } catch (e) {
    console.error('Update Error:', e);
  }
}

// LOGIN LOGIC
if (document.getElementById('do-login')) {
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
        const sitesRes = await fetch(`${API_URL}/sites`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const sitesData = await sitesRes.json();
        const firstSiteId = sitesData[0]?.id || 'new';

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
}

if (document.getElementById('google-login')) {
  document.getElementById('google-login').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.odelink.shop/auth' });
  });
}

if (document.getElementById('logout-btn')) {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await chrome.storage.local.clear();
    checkState();
  });
}

if (document.getElementById('open-panel')) {
  document.getElementById('open-panel').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.odelink.shop/panel' });
  });
}

if (document.getElementById('sync-shopier')) {
  document.getElementById('sync-shopier').addEventListener('click', async () => {
    const btn = document.getElementById('sync-shopier');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = 'Syncing...';
      btn.disabled = true;

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('shopier.com')) {
        alert('Lütfen bu işlemi Shopier panelindeyken yapın.');
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extract_products' });
      if (!response || !response.success) {
        throw new Error('Eklenti tepki vermedi.');
      }
    } catch (e) {
      console.error('Sync Error:', e);
      alert('Hata: ' + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// Depolama değiştiğinde (Giriş yapıldığında) popup'ı yenile
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.token || changes.siteId)) {
    checkState();
  }
});

checkState();
setInterval(updatePopup, 5000);
