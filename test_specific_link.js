const { fetchProductDetail } = require('./backend/services/shopierCatalogService');

const testLink = 'https://www.shopier.com/saatlier/36930739';

async function test() {
    console.log('🧪 Testing Shopier Scraper for:', testLink);
    try {
        const detail = await fetchProductDetail(testLink);
        console.log('✅ Result:', JSON.stringify(detail, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}
test();
