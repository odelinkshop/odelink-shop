const { fetchProductDetail } = require('./backend/services/shopierCatalogService');

// Exact link from user's screenshot
const testLink = 'https://www.shopier.com/saatlier/36930668';

async function test() {
    console.log('🧪 Testing:', testLink);
    try {
        const detail = await fetchProductDetail(testLink);
        console.log('✅ Title:', detail.title);
        console.log('✅ Price:', detail.price);
        console.log('✅ Images:', detail.images?.length);
        console.log('✅ First Image:', detail.images?.[0]);
        if (!detail.images || detail.images.length === 0) {
            console.error('❌ NO IMAGES FOUND - THIS IS THE BUG');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}
test();
