const axios = require('axios');

async function testProduct() {
    const API_KEY = 'eeb06f813ed7ad2ddda12ab18184d212';
    const targetUrl = 'https://www.shopier.com/merydian/46591792'; // Örnek ürün
    
    console.log('Fetching Product Page...');
    try {
        const res = await axios.get('http://api.scraperapi.com', {
            params: { api_key: API_KEY, url: targetUrl, render: 'false' }
        });
        
        const html = res.data;
        console.log(`HTML Length: ${html.length}`);
        
        // Find variations (e.g., sizes like S, M, L)
        // Shopier usually uses <select name="options[x]"> or similar for variations
        const selectMatch = html.match(/<select[^>]*>([\\s\\S]*?)<\\/select>/gi) || [];
        console.log('Select tags found:', selectMatch.length);
        if (selectMatch.length > 0) {
            console.log('Sample Select:', selectMatch[0].substring(0, 200));
        }
        
        // Find all images
        // Shopier product images are usually in a swiper or gallery
        const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
        console.log('Images found:', imgMatch.length);
        
        const cdnImages = imgMatch.filter(i => i.includes('cdn.shopier.app')).slice(0, 5);
        console.log('Sample CDN Images:', cdnImages);
        
        // Categories
        const catMatch = html.match(/<a[^>]+href=["'][^"']+category=[^"']+["'][^>]*>(.*?)<\\/a>/i);
        if (catMatch) console.log('Category found:', catMatch[1]);
        
    } catch(e) {
        console.log('Error:', e.message);
    }
}
testProduct();
