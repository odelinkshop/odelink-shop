const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.goto('https://www.shopier.com/CLUPPOLOCOLLECTION', {waitUntil: 'domcontentloaded'});
    
    const links = await page.evaluate(() => {
        const data = [];
        document.querySelectorAll('a').forEach(a => {
            const hasImg = a.querySelector('img') !== null;
            const text = a.innerText.replace(/\n/g, ' ').trim();
            data.push({ href: a.href, text: text, hasImg });
        });
        return data;
    });
    
    console.log(links.filter(l => l.href && l.href.length > 20));
    await browser.close();
})();
