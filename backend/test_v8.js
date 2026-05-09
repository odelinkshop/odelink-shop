const { fetchShopierCatalog } = require('./services/shopierCatalogService');

async function test() {
    const shopUrl = 'https://www.shopier.com/BUMERANGWEAR';
    console.log(`🧪 [TEST] BUMERANGWEAR FULL + FULL Testi: ${shopUrl}`);
    
    try {
        const catalog = await fetchShopierCatalog(shopUrl, {
            debug: true,
            skipDetails: false,
            detailMaxProducts: 3 // Hız için 3 ürün detayı
        });
        
        console.log(`✅ [TEST] Başarılı!`);
        console.log(`📦 Toplam Ürün: ${catalog.products.length}`);
        console.log(`📂 Yakalanan Kategoriler:`, catalog.categories.map(c => c.name));
        
        if (catalog.products.length > 0) {
            const p = catalog.products[0];
            console.log(`🔍 Örnek Ürün:`, {
                name: p.name,
                price: p.price,
                category: p.category,
                description: p.description?.substring(0, 100) + '...',
                variations: p.variations
            });
        }
    } catch (error) {
        console.error('❌ [TEST] Hata:', error.message);
        console.error(error.stack);
    }
}

test();
