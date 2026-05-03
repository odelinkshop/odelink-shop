const axios = require('axios');

async function testApi() {
    const API_KEY = 'eeb06f813ed7ad2ddda12ab18184d212';
    const targetUrl = 'https://www.shopier.com/merydian';
    const apiUrl = 'https://www.shopier.com/s/api/v1/search_product/merydian';
    
    try {
        console.log('1. Fetching HTML for CSRF...');
        const res = await axios.get('http://api.scraperapi.com', {
            params: { api_key: API_KEY, url: targetUrl, render: 'false' }
        });
        
        const html = res.data;
        const token = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1];
        console.log('CSRF Token:', token);
        
        console.log('2. Fetching API...');
        const postData = `start=24&offset=0&filter=0&sort=0&filterMinPrice=&filterMaxPrice=&datesort=-1&pricesort=-1&value=`;
        
        const apiRes = await axios.post('http://api.scraperapi.com', postData, {
            params: {
                api_key: API_KEY,
                url: apiUrl,
                keep_headers: 'true'
            },
            headers: {
                'X-CSRF-Token': token,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.shopier.com',
                'Referer': targetUrl
            }
        });
        
        const products = apiRes.data.products || apiRes.data.data;
        console.log(`API Products Found: ${products?.length || 0}`);
        
    } catch(e) {
        console.log('Error:', e.message);
    }
}
testApi();
