const axios = require('axios');
const fs = require('fs');

async function testPost() {
  const html = fs.readFileSync('krampon.html', 'utf-8');
  const csrfToken = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1];
  
  console.log('Sending POST to start=24...');
  const start = Date.now();
  try {
    const res = await axios.post('http://api.scraperapi.com', `start=24&offset=0&filter=0&sort=0&filterMinPrice=&filterMaxPrice=&datesort=-1&pricesort=-1&value=`, {
      params: {
        api_key: 'eeb06f813ed7ad2ddda12ab18184d212',
        url: 'https://www.shopier.com/s/api/v1/search_product/KramponLab',
        keep_headers: 'true'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.shopier.com',
        'Referer': 'https://www.shopier.com/KramponLab',
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 120000
    });
    console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms`);
    console.log(`Data length:`, res.data.length || res.data.products?.length);
  } catch (e) {
    console.log(`Error: ${e.message}, Time: ${Date.now() - start}ms`);
    if (e.response) console.log(e.response.status, e.response.data);
  }
}

testPost();
