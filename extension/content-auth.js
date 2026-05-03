/**
 * ODELINK AUTH BRIDGE - CONTENT SCRIPT
 * Odelink panelinden giriş bilgilerini sessizce yakalayıp eklentiye aktarır.
 */

(function() {
  const isOdelink = window.location.hostname.includes('odelink.shop');
  
  if (isOdelink) {
    console.log('🏛️ Odelink Auth Bridge Active');
    
    // Panelden token ve siteId'yi çekmeye çalış
    const checkAuth = () => {
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const userDataStr = localStorage.getItem('user');
      let siteId = localStorage.getItem('currentSiteId');

      if (token) {
        // Eğer siteId yoksa ama user verisi varsa içinden çekmeyi dene
        if (!siteId && userDataStr) {
          try {
            const user = JSON.parse(userDataStr);
            siteId = user.sites?.[0]?.id || user.lastSiteId;
          } catch(e) {}
        }

        if (token && siteId) {
          chrome.runtime.sendMessage({
            action: 'store_auth',
            auth: { token, siteId }
          });
          console.log('✅ Odelink Auth Synced with Extension');
        }
      }
    };

    // Sayfa yüklendiğinde ve her saniye kontrol et (Giriş yapıldığında yakalamak için)
    checkAuth();
    setInterval(checkAuth, 3000);
  }
})();
