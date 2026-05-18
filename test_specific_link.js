const { fetchProductDetail } = require('./backend/services/shopierCatalogService');

// Exact link from user's request
const testLink = 'https://www.shopier.com/DUFO/31170077';

async function test() {
    console.log('🧪 Testing:', testLink);
    try {
        const detail = await fetchProductDetail(testLink);
        console.log('✅ Title:', detail.title);
        console.log('✅ Price:', detail.price);
        console.log('✅ Discount Price:', detail.discountPrice);
        console.log('✅ Images Found:', detail.images?.length);
        detail.images?.forEach((img, i) => console.log(`   📸 [${i+1}] ${img}`));
        console.log('✅ Variations:', JSON.stringify(detail.variations, null, 2));
        console.log('✅ Sizes Array:', JSON.stringify(detail.sizes, null, 2));
        console.log('✅ Delivery Info:', detail.deliveryInfo);
        console.log('✅ Description Snippet:', detail.description?.substring(0, 150), '...');
        if (!detail.images || detail.images.length === 0) {
            console.error('❌ NO IMAGES FOUND - THIS IS THE BUG');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}
test();
