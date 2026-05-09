require('dotenv').config();
const fs = require('fs');
const pool = require('./config/database');
const Site = require('./models/Site');
const nodemailer = require('nodemailer');

const ticketId = process.argv[2];
const jsonPath = process.argv[3];

if (!ticketId || !jsonPath) {
    console.error("❌ Kullanım: node deliver_store.js <Bilet_No> <JSON_Dosya_Yolu>");
    console.error("Örnek: node deliver_store.js ODL-4829 c:\\Users\\Murat\\Downloads\\DEEP_SCAN_BUMERANGWEAR.json");
    process.exit(1);
}

async function deliverStore() {
    try {
        console.log(`🚀 Teslimat Başlatılıyor... Bilet: ${ticketId}`);

        // 1. Dosyayı oku
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`Dosya bulunamadı: ${jsonPath}`);
        }
        let content = fs.readFileSync(jsonPath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        
        let data = JSON.parse(content);
        let products = Array.isArray(data) ? data : (data.products || []);
        let categories = Array.isArray(data.categories) ? data.categories : [];
        let shopName = data.shopName || null;

        // Fiyat düzeltmesi (Eski bug için garanti)
        products = products.map(p => ({
            ...p,
            price: p.currentPrice !== undefined ? p.currentPrice : p.price
        }));

        console.log(`📦 JSON'dan ${products.length} ürün okundu.`);

        // 2. İlgili siteyi bul
        // JSONB içinde vip_ticket_id arıyoruz
        const result = await pool.query(
            "SELECT * FROM sites WHERE settings->>'vip_ticket_id' = $1 LIMIT 1",
            [ticketId]
        );

        if (result.rows.length === 0) {
            throw new Error(`❌ Bu bilet numarasına (${ticketId}) sahip bekleyen bir site bulunamadı!`);
        }

        const site = result.rows[0];
        console.log(`✅ Site bulundu: ${site.subdomain}.odelink.shop (ID: ${site.id})`);

        // 3. Veritabanını güncelle
        const updatedSettings = {
            ...(site.settings || {}),
            products_data: products,
            collections: categories,
            catalog_total_products: products.length,
            catalog_refreshed_at: new Date().toISOString(),
            catalog_full_sync_complete: true,
            last_sync_method: 'export_import', // Auto-heal'i kapatır
            build_status: 'completed'
        };

        const updateData = { settings: updatedSettings };
        if (shopName && (!site.name || site.name === 'Yeni Mağaza')) {
            updateData.name = shopName;
        }

        await Site.update(site.id, updateData);
        console.log(`💾 Veritabanına başarıyla işlendi!`);

        // 4. Müşteriye Mail Gönder
        // Müşterinin mail adresi user tablosunda.
        const userRes = await pool.query("SELECT email, first_name FROM users WHERE id = $1", [site.user_id]);
        if (userRes.rows.length > 0) {
            const user = userRes.rows[0];
            const siteUrl = `https://${site.subdomain}.odelink.shop`;
            
            console.log(`📧 Müşteriye (${user.email}) teslimat maili gönderiliyor...`);
            
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: `"${process.env.APP_NAME || 'Odelink'}" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `🎉 Premium Mağazanız Hazır! (${siteUrl})`,
                    html: `
                        <h2>Tebrikler ${user.first_name || ''}!</h2>
                        <p>Odelink mağazanız robotlarımız tarafından başarıyla tarandı ve VIP kalitesinde teslimata hazır.</p>
                        <p>Aşağıdaki bağlantıya tıklayarak mağazanızı hemen incelemeye başlayabilirsiniz:</p>
                        <h3><a href="${siteUrl}">${siteUrl}</a></h3>
                        <br/>
                        <p>Bizi tercih ettiğiniz için teşekkürler,</p>
                        <p><strong>Odelink Destek Ekibi</strong></p>
                    `
                });
                console.log(`✅ Mail başarıyla gönderildi!`);
            } catch (mailErr) {
                console.error("⚠️ Mail gönderilirken hata oluştu, ancak mağaza oluşturuldu:", mailErr.message);
            }
        }

        console.log(`\n🎉 BÜTÜN İŞLEM TAMAM! Müşterinin mağazası 10 numara 5 yıldız teslim edildi.`);
        process.exit(0);

    } catch (e) {
        console.error("❌ Hata:", e.message);
        process.exit(1);
    }
}

deliverStore();
