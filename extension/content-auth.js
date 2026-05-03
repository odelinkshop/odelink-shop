/**
 * Odelink Auth Bridge v3 - Elite Force
 * Sitedeki giriş verilerini saniyeler içinde eklentiye taşıyan köprü.
 */

function captureAndBridge() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const siteId = localStorage.getItem('last_site_id') || 'new';

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      // Eklentiye gönder
      chrome.runtime.sendMessage({
        action: 'store_auth',
        auth: { token, user, siteId } // 'auth' anahtarını background.js bekliyor
      });
      console.log('🏛️ Odelink Bridge: Auth data beamed to extension.');
    } catch (e) {}
  }
}

// Daha hızlı kontrol (Her 1 saniyede bir)
setInterval(captureAndBridge, 1000);
captureAndBridge();
