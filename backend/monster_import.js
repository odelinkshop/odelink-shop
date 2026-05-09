const fs = require('fs');
const Site = require('./models/Site');
const pool = require('./config/database');

async function monsterImport() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('❌ Kullanım: node monster_import.js <JSON_PATH> <STORE_NAME> [SUBDOMAIN]');
        console.log('Örnek: node monster_import.js c:\\data\\urunler.json MYSTORE mystore');
        process.exit();
    }

    const [jsonPath, storeName, subdomainArg] = args;
    const shopierUrl = `https://www.shopier.com/${storeName}`;
    const subdomain = subdomainArg || storeName.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
        console.log(`🔍 Mağaza: ${storeName} için süreç başladı...`);
        
        // 1. JSON Oku
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`Dosya bulunamadı: ${jsonPath}`);
        }
        let content = fs.readFileSync(jsonPath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        let products = JSON.parse(content);
        
        // Frontend 'price' alanını bekliyor, 'currentPrice' gelirse dönüştür
        products = products.map(p => ({
            ...p,
            price: p.currentPrice !== undefined ? p.currentPrice : p.price
        }));
        
        console.log(`📦 ${products.length} ürün yüklendi.`);

        // 2. Siteyi Bul (Daha kapsamlı arama)
        const allSites = await Site.findAll();
        let site = allSites.find(s => 
            (s.shopier_url && s.shopier_url.toLowerCase().includes(storeName.toLowerCase())) || 
            (s.name && s.name.toLowerCase().includes(storeName.toLowerCase())) ||
            (s.subdomain && s.subdomain.toLowerCase() === subdomain.toLowerCase())
        );

        const settingsUpdate = {
            products_data: products,
            catalog_total_products: products.length,
            catalog_refreshed_at: new Date().toISOString(),
            catalog_full_sync_complete: true
        };

        if (!site) {
            console.log(`⚠️ ${storeName} bulunamadı, SIFIRDAN OLUŞTURULUYOR...`);
            const userRes = await pool.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
            const userId = userRes.rows[0] ? userRes.rows[0].id : 1;

            site = await Site.create({
                userId,
                name: storeName,
                shopierUrl,
                subdomain,
                settings: settingsUpdate
            });
            console.log(`✅ Yeni mağaza [${storeName}] (Subdomain: ${subdomain}) oluşturuldu!`);
        } else {
            console.log(`✅ Mevcut mağaza [${site.name}] (ID: ${site.id}) güncelleniyor...`);
            const newSettings = { ...(site.settings || {}), ...settingsUpdate };
            await Site.update(site.id, { settings: newSettings });
            console.log(`✅ ${storeName} ürünleri güncellendi!`);
        }

        console.log(`🎉 İŞLEM TAMAM! Mağaza: ${storeName}, Ürün: ${products.length}`);
    } catch (err) {
        console.error('💥 HATA:', err.message);
    } finally {
        process.exit();
    }
}
monsterImport();
