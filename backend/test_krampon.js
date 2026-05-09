const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = 'eeb06f813ed7ad2ddda12ab18184d212';
const shopierUrl = 'https://www.shopier.com/KramponLab';
const shopSlug = 'KramponLab';

async function testFetch() {
    console.log(`Testing fetch for ${shopSlug}...`);
    try {
        const res = await axios.get('http://api.scraperapi.com', {
            params: { api_key: SCRAPER_API_KEY, url: shopierUrl, render: 'false' },
            timeout: 60000
        });
        
        const html = res.data;
        console.log(`HTML received. Length: ${html.length}`);
        
        // 1. Check for CSRF token
        const csrfMatch = html.match(/var\s+csrfToken\s*=\s*['"]([^'"]+)['"]/);
        console.log(`CSRF Token: ${csrfMatch ? csrfMatch[1] : 'NOT FOUND'}`);
        
        // 2. Parse products from HTML
        const $ = cheerio.load(html);
        const products = [];
        
        // Let's check both new and old structures
        const items = $('.product-item, .shopier-product, [data-product-id]');
        console.log(`Matched product elements: ${items.length}`);
        
        items.each((i, el) => {
            const $el = $(el);
            const id = $el.attr('data-product-id');
            const name = $el.find('.product-title').text().trim();
            if (id) {
                products.push({ id, name });
            }
        });
        
        console.log(`Products extracted from HTML: ${products.length}`);
        
        // Shopier internal API call to get more products if CSRF exists
        if (csrfMatch) {
            console.log('Testing internal API call...');
            const apiRes = await axios.post('http://api.scraperapi.com', 
              `shopId=${shopSlug}&page=1&limit=24`,
              {
                params: {
                    api_key: SCRAPER_API_KEY,
                    url: 'https://www.shopier.com/ShowProductNew/products.php',
                    render: 'false'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-Token': csrfMatch[1],
                    'X-Requested-With': 'XMLHttpRequest'
                }
              }
            );
            console.log(`API Status: ${apiRes.status}`);
            console.log(`API Data Length:`, Array.isArray(apiRes.data) ? apiRes.data.length : 'Not Array');
        }

    } catch (e) {
        console.error('ERROR:', e.message);
        if (e.response) {
            console.error('Response Status:', e.response.status);
            console.error('Response Data:', e.response.data);
        }
    }
}

testFetch();
