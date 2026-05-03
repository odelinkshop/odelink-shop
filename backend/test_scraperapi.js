const axios = require('axios');

async function testScraperAPI() {
    const API_KEY = 'eeb06f813ed7ad2ddda12ab18184d212';
    const targetUrl = 'https://www.shopier.com/merydian';
    
    console.log('Testing ScraperAPI with merydian...');
    try {
        const res = await axios.get('http://api.scraperapi.com', {
            params: {
                api_key: API_KEY,
                url: targetUrl,
                render: 'false', // Let's try false first for speed
                premium: 'false'
            }
        });
        
        const html = res.data;
        console.log(`Status: ${res.status}`);
        console.log(`HTML Length: ${html.length}`);
        
        const csrfMatch = html.match(/csrf-token/i);
        console.log(`CSRF Token Bulundu Mu?: ${!!csrfMatch}`);
        
        if (csrfMatch) {
            const token = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1];
            console.log(`Token Değeri: ${token}`);
        }
        
    } catch(e) {
        console.log('Error:', e.message);
    }
}
testScraperAPI();
