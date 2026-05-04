/**
 * ODELINK OMNI-SCRAPER v6.1 - POPUP LOGIC
 */

document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const originalText = btn.textContent;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('shopier.com')) {
      btn.textContent = 'LÜTFEN SHOPIER MAĞAZASINA GİDİN';
      btn.style.background = '#ff4444';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#C5A059';
      }, 3000);
      return;
    }

    // Try to trigger the scanner
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const mainBtn = document.getElementById('odelink-main-btn');
        if (mainBtn) {
          mainBtn.click();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return true;
        }
        return false;
      }
    }, (results) => {
      if (chrome.runtime.lastError || !results || !results[0].result) {
        btn.textContent = 'SAYFAYI YENİLEYİN';
        btn.style.background = '#ff8800';
      } else {
        btn.textContent = 'BAŞLATILDI!';
        btn.style.background = '#F2EBE1';
        btn.style.color = '#0A0A0A';
        setTimeout(() => window.close(), 1000);
      }
    });

  } catch (e) {
    console.error('Omni-Scraper Error:', e);
    btn.textContent = 'BAĞLANTI HATASI';
  }
});
