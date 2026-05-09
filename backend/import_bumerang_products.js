const fs = require('fs');
const path = require('path');
const Site = require('./models/Site');

async function importProducts() {
    const jsonPath = 'c:\\Users\\Murat\\Downloads\\ODELINK_FINAL_BOSS_266_LISTE.json';
    const shopierUrl = 'https://www.shopier.com/BUMERANGWEAR';
    
    console.log('🚀 Import süreci başladı...');

    try {
        // 1. JSON Verisini Oku
        if (!fs.existsSync(jsonPath)) {
            console.error(`❌ JSON dosyası bulunamadı: ${jsonPath}`);
            return;
        }
        let content = fs.readFileSync(jsonPath, 'utf8');
        // Strip BOM if it exists
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        const products = JSON.parse(content);
        console.log(`📦 JSON'dan ${products.length} ürün yüklendi.`);

        // 2. Siteyi Bul
        const sites = await Site.findAll();
        const site = sites.find(s => 
            (s.shopier_url && s.shopier_url.includes('BUMERANGWEAR')) || 
            (s.name && s.name.includes('BUMERANGWEAR'))
        );

        if (!site) {
            console.error('❌ Veritabanında BUMERANGWEAR sitesi bulunamadı!');
            return;
        }
        console.log(`✅ Site bulundu: ${site.name} (ID: ${site.id})`);

        // 3. Ayarları Güncelle
        const currentSettings = site.settings || {};
        const updatedSettings = {
            ...currentSettings,
            products_data: products,
            catalog_total_products: products.length,
            catalog_full_sync_complete: true,
            catalog_refreshed_at: new Date().toISOString(),
            last_sync_stats: {
                added: products.length,
                removed: 0,
                updated: 0,
                total: products.length,
                synced_at: new Date().toISOString(),
                method: 'Forensic HAR Import'
            }
        };

        // 4. Veritabanına Kaydet
        await Site.update(site.id, { settings: updatedSettings });
        
        console.log('🎉 İŞLEM BAŞARILI!');
        console.log(`✅ ${products.length} ürün BUMERANGWEAR sitesine aktarıldı.`);
        console.log('🔗 Siteni kontrol edebilirsin aga!');

    } catch (err) {
        console.error('💥 Hata oluştu:', err);
    } finally {
        process.exit();
    }
}

importProducts();
