const puppeteer = require('puppeteer');

async function test() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    console.log("Navigating to product...");
    await page.goto('https://www.shopier.com/Diezbrands/46679576', { waitUntil: 'networkidle2' });
    
    // Select option "42" (value "1085751")
    console.log("Selecting size 42...");
    await page.select('select[name="size"]', '1085751');
    
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('shipping/')) {
        console.log("🔥 INTERCEPTED POST PAYLOAD:", request.postData());
      }
      request.continue();
    });
    
    // Click "Hemen Al"
    console.log("Clicking buy...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.evaluate(() => document.querySelector('#buy-form').submit())
    ]);
    
    console.log("Current URL:", page.url());
    
    // Check if it has (,)
    const content = await page.content();
    if (content.includes('(,)')) {
      console.log("❌ Result has (,)");
    } else {
      console.log("✅ Result DOES NOT have (,)");
      
      const summaryText = await page.evaluate(() => {
        let text = '';
        document.querySelectorAll('.product-title, .product-name, [class*="product"]').forEach(el => {
          text += el.innerText.trim() + ' | ';
        });
        return text;
      });
      console.log("Summary:", summaryText);
    }
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (browser) await browser.close();
  }
}

test();
