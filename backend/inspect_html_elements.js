const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const cleanUrl = 'https://www.shopier.com/sisbutiks/47342859';
  
  try {
    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    console.log("=== SELECT ELEMENT HTML ===");
    console.log($('select[name="size"]').html());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
