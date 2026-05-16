const { fetchProductDetail } = require('./backend/services/shopierCatalogService');

// Exact link from user's screenshot
const testLink = 'https://www.shopier.com/ozdosaat/44859710';

async function test() {
    console.log('🧪 Testing:', testLink);
    try {
        const detail = await fetchProductDetail(testLink);
        console.log('✅ Title:', detail.title);
        console.log('✅ Price:', detail.price);
        console.log('✅ Discount Price:', detail.discountPrice);
        console.log('✅ Images:', detail.images?.length);
        if (detail.images?.length > 0) console.log('✅ First Image:', detail.images?.[0]);
        console.log('✅ Description Snippet:', detail.description?.substring(0, 100), '...');
        if (!detail.images || detail.images.length === 0) {
            console.error('❌ NO IMAGES FOUND - THIS IS THE BUG');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}
test();
