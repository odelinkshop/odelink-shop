/**
 * Odelink Auth Bridge v2
 * Sitedeki giriş verilerini saniyeler içinde eklentiye taşıyan köprü.
 */

function captureAndBridge() {
  // LocalStorage'dan verileri çek
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const siteId = localStorage.getItem('last_site_id') || 'new';

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      // Eklenti depolamasına (storage.local) gönder
      chrome.runtime.sendMessage({
        action: 'store_auth',
        data: { token, user, siteId }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Bridge Error:', chrome.runtime.lastError);
        } else {
          console.log('🏛️ Odelink Bridge: Auth data synced to extension.');
        }
      });
    } catch (e) {
      console.error('Bridge Parse Error:', e);
    }
  }
}

// Sürekli kontrol et (Giriş yapıldığı an yakalamak için)
setInterval(captureAndBridge, 2000);

// İlk yüklemede çalıştır
captureAndBridge();
