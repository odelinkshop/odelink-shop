const fs = require('fs');
const Site = require('./models/Site');

async function forceImport() {
    const jsonPath = 'c:\\Users\\Murat\\Downloads\\ODELINK_FINAL_BOSS_266_LISTE.json';
    const shopierUrl = 'https://www.shopier.com/BUMERANGWEAR';
    
    try {
        console.log('🚀 Force Import Başladı...');
        let content = fs.readFileSync(jsonPath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        const products = JSON.parse(content);
        console.log(`📦 ${products.length} ürün yüklendi.`);

        let sites = await Site.findAll();
        let site = sites.find(s => 
            (s.shopier_url && s.shopier_url.includes('BUMERANGWEAR')) || 
            (s.name && s.name.includes('BUMERANGWEAR'))
        );
        
        if (!site) {
            console.log('⚠️ Site bulunamadı, SIFIRDAN OLUŞTURULUYOR...');
            // Try to find any user first
            const pool = require('./config/database');
            const userRes = await pool.query('SELECT id FROM users LIMIT 1');
            const userId = userRes.rows[0] ? userRes.rows[0].id : 1;

            site = await Site.create({
                userId: userId,
                name: 'BUMERANGWEAR',
                shopierUrl: shopierUrl,
                subdomain: 'bumerangwear',
                settings: { 
                    products_data: products,
                    catalog_total_products: products.length,
                    catalog_refreshed_at: new Date().toISOString()
                }
            });
            console.log('✅ Yeni site oluşturuldu ve ürünler basıldı!');
        } else {
            console.log(`✅ Mevcut site bulundu (ID: ${site.id}), GÜNCELLENİYOR...`);
            const updatedSettings = {
                ...(site.settings || {}),
                products_data: products,
                catalog_total_products: products.length,
                catalog_refreshed_at: new Date().toISOString()
            };
            await Site.update(site.id, { settings: updatedSettings });
            console.log('✅ Ürünler güncellendi!');
        }
        
        console.log('🎉 İŞLEM TAMAM! 266 ürün sahada.');
    } catch (err) {
        console.error('💥 HATA:', err.message);
    } finally {
        process.exit();
    }
}
forceImport();
