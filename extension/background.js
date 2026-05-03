const API_URL = 'https://www.odelink.shop/api';
let lastActiveCount = 0;

// Alarm kur: Her 30 saniyede bir verileri kontrol et
chrome.alarms.create('poll_analytics', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'poll_analytics') {
    checkLiveVisitors();
  }
});

// Sync Mesajlarını Dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sync_products') {
    syncProducts(request.products).then(sendResponse);
    return true; 
  }
  
  if (request.action === 'store_auth') {
    chrome.storage.local.set(request.auth);
    return true;
  }
});

async function syncProducts(products) {
  try {
    const storage = await chrome.storage.local.get(['token', 'siteId']);
    if (!storage.token || !storage.siteId) return { success: false, error: 'Auth missing' };

    const res = await fetch(`${API_URL}/sites/${storage.siteId}/sync-from-extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.token}`
      },
      body: JSON.stringify({ products })
    });

    return { success: res.ok };
  } catch (e) {
    console.error('Sync Error:', e);
    return { success: false };
  }
}

async function checkLiveVisitors() {
  try {
    const storage = await chrome.storage.local.get(['token', 'siteId']);
    if (!storage.token || !storage.siteId) return;

    const res = await fetch(`${API_URL}/sites/${storage.siteId}/analytics`, {
      headers: {
        'Authorization': `Bearer ${storage.token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      const currentActive = data.realtime?.activeVisitors || 0;

      // Ziyaretçi sayısı arttıysa bildirim gönder
      if (currentActive > lastActiveCount) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Odelink: Yeni Ziyaretçi!',
          message: `Şu an mağazanda ${currentActive} kişi geziyor.`,
          priority: 2
        });
      }

      lastActiveCount = currentActive;
      
      // Badge güncelle (İkonun üzerindeki sayı)
      chrome.action.setBadgeText({ text: currentActive.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#06b6d4' });
    }
  } catch (e) {
    console.error('Odelink Extension Error:', e);
  }
}
