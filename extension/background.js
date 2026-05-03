const API_URL = 'https://www.odelink.shop/api';
let lastActiveCount = 0;

// Alarm kur: Her 30 saniyede bir verileri kontrol et
chrome.alarms.create('poll_analytics', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'poll_analytics') {
    checkLiveVisitors();
  }
});

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
