const { fetchProductDetail } = require('../backend/services/shopierCatalogService');
const fs = require('fs');
const path = require('path');

async function test() {
  const url = 'https://www.shopier.com/bypedrotr/27921255';
  console.log(`🔍 Testing scrape for: ${url}`);
  
  try {
    const result = await fetchProductDetail(url, 'https://www.shopier.com/rawstore01');
    fs.writeFileSync(path.join(__dirname, 'scrape_result.json'), JSON.stringify(result, null, 2));
    console.log('✅ Result written to scrape_result.json');
  } catch (e) {
    console.error('❌ Error:', e);
  }
}

test();
