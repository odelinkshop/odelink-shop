const { fetchAllProducts } = require('./services/shopierCatalogService');

async function test() {
  const url = 'https://www.shopier.com/TheoryJewelry';
  console.log(`🚀 Testing sync for: ${url}`);
  
  try {
    const products = await fetchAllProducts(url, {
      skipDetails: false, // Deep sync to test variants and images
      debug: true
    });
    
    console.log(`\n✅ FETCH COMPLETED!`);
    console.log(`📊 Total products: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n--- FIRST PRODUCT SAMPLE ---');
      const p = products[0];
      console.log(`Name: ${p.name}`);
      console.log(`Price: ${p.price}`);
      console.log(`Image: ${p.image}`);
      console.log(`Variants:`, JSON.stringify(p.variants, null, 2));
      console.log('----------------------------\n');
    }
    
    if (products.length < 50) {
      console.warn(`⚠️ Only ${products.length} products found. Expected around 106.`);
    } else {
      console.log(`🎉 Success! Found ${products.length} products.`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit();
  }
}

test();
