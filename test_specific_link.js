const { fetchProductDetail } = require('./backend/services/shopierCatalogService');

// Exact link from user's screenshot
const testLink = 'https://www.shopier.com/cluppolocollection/40366971';

async function test() {
    console.log('🧪 Testing:', testLink);
    try {
        const detail = await fetchProductDetail(testLink);
        console.log('✅ Title:', detail.title);
        console.log('✅ Price:', detail.price);
        console.log('✅ Discount Price:', detail.discountPrice);
        console.log('✅ Images Found:', detail.images?.length);
        detail.images?.forEach((img, i) => console.log(`   📸 [${i+1}] ${img}`));
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
