const axios = require('axios');
const fs = require('fs');

async function testPost() {
  const html = fs.readFileSync('krampon.html', 'utf-8');
  const csrfToken = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1];
  
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
  console.log((res.data.products || res.data.data || []).map(p => p.id));
}

testPost();
