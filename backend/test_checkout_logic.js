const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

async function testPost(variationName) {
  const url = 'https://www.shopier.com/s/shipping/Diezbrands';
  const payload = {
    product_id: '46679576',
    first_variation_name: variationName,
    first_variation_id: '0',
    size: '1085751',
    quantity: '1'
  };

  try {
    const response = await axios.post(url, qs.stringify(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(response.data);
    const summaryText = $('.summary-item-title').text().replace(/\s+/g, ' ').trim() || $('.product-name').text().replace(/\s+/g, ' ').trim() || $('body').text().substring(0, 500);
    
    // Look for the exact product title area in the summary
    let productDesc = '';
    $('.product-title, .product-name, [class*="product"]').each((i, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text.includes('Prada') || text.includes('(,)')) {
            productDesc += text + ' | ';
        }
    });
    
    // The variations are usually displayed in a specific span
    const variationText = $('.variation-details, .product-variation, [class*="variation"]').text().replace(/\s+/g, ' ').trim() || 'NOT FOUND';
    
    console.log(`\n=== POST with first_variation_name: "${variationName}" ===`);
    console.log(`Product Summary Area: ${productDesc}`);
    console.log(`Variation Text: ${variationText}`);
    
    // Check if the HTML contains "(,)"
    if (response.data.includes('(,)')) {
      console.log(`❌ Result contains "(,)"`);
    } else {
      console.log(`✅ Result DOES NOT contain "(,)"`);
      // Find what it contains instead
      const match = response.data.match(/\([^)]+\)/g);
      console.log(`Parentheses found: ${match ? match.join(', ') : 'none'}`);
    }

  } catch (err) {
    console.error(`Error with "${variationName}":`, err.message);
  }
}

async function run() {
  await testPost('beden');
  await testPost('Beden ');
  await testPost('Renk Seçeneği');
}

run();
