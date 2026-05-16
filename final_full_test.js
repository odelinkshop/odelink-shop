const { fetchProductDetail } = require('./backend/services/shopierCatalogService');
const axios = require('axios');

async function runDeepTest() {
    const testLink = 'https://www.shopier.com/LenegeLSaaT/45258595'; // Beyaz polar gömlek
    console.log('🧪 [TEST 1] Scraper Veri Doğruluğu Testi Başlatılıyor...');
    
    try {
        const detail = await fetchProductDetail(testLink);
        console.log('------------------------------------');
        console.log(`✅ Başlık: "${detail.title}" (Unicode Hatası Giderildi mi: ${!detail.title.includes('\\u')})`);
        console.log(`✅ Fiyat: ${detail.price} TL (Doğru mu: ${detail.price === 450})`);
        console.log(`✅ Resim Sayısı: ${detail.images.length}`);
        
        if (detail.images.length > 0) {
            console.log('\n🧪 [TEST 2] Resim Proxy (Köprü) Testi Başlatılıyor...');
            const firstImg = detail.images[0];
            // Simulate the proxy logic
            try {
                const proxyResponse = await axios.get(firstImg, {
                    headers: { 'Referer': 'https://www.shopier.com/' },
                    timeout: 5000
                });
                console.log(`✅ Resim Proxy Durumu: ${proxyResponse.status} OK! (Resim indirilebilir durumda)`);
            } catch (e) {
                console.log(`❌ Resim Proxy Hatası: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('❌ Test sırasında hata oluştu:', error.message);
    }
}

runDeepTest();
