/**
 * ODELINK OMNI-SCRAPER v6.0 - POPUP LOGIC
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

    // Trigger the siber-scanner in the content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const mainBtn = document.getElementById('odelink-main-btn');
        if (mainBtn) {
          mainBtn.click();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          alert('Omni-Scraper v6.0 Hazırlanıyor... Sayfayı yenileyip tekrar deneyin.');
        }
      }
    });

    btn.textContent = 'TARAMA BAŞLATILDI!';
    btn.style.background = '#F2EBE1';
    btn.style.color = '#0A0A0A';
    
    setTimeout(() => {
      window.close();
    }, 1500);

  } catch (e) {
    console.error('Omni-Scraper Error:', e);
    btn.textContent = 'BAĞLANTI HATASI';
  }
});
