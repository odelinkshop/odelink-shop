const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeShopier(storeName) {
    console.log(`\n🚀 Odelink DEEP SCAN (Derin Tarama) Robotu Başlatılıyor... Hedef: ${storeName}`);
    
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    // BÖLÜM 1: LİNKLERİ VE TEMEL BİLGİLERİ TOPLA ---
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const url = `https://www.shopier.com/${storeName}`;
    console.log(`🌍 Vitrin taranıyor: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const totalCount = await page.evaluate(() => {
        const countEl = document.querySelector('#products-count, .product-count, [data-count]');
        return countEl ? parseInt(countEl.innerText.replace(/[^0-9]/g, '')) : 9999;
    });
    console.log(`📦 Vitrindeki Toplam Ürün: ${totalCount}`);

    console.log("⏳ Vitrin kazılıyor...");
    
    let productsCount = 0, sameCount = 0, previousHeight;
    const rawProducts = [];
    const seenUrls = new Set();

    while (productsCount < totalCount && sameCount < 10) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await page.evaluate(() => {
            document.querySelectorAll('button, a, div').forEach(el => {
                const t = (el.innerText || "").toLowerCase();
                if(t.includes('daha fazla') || t.includes('yükle')) { try{el.click()}catch(e){} }
            });
        });

        // O an ekranda olanları hemen hafızaya al (Virtual scrolling engellemesi için)
        const currentBatch = await page.evaluate(() => {
            const batch = [];
            document.querySelectorAll('.shopier--product-card, [data-product-id]').forEach(card => {
                const nameEl = card.querySelector('.product-card__title, .product-name, h3, h2, .title');
                const urlEl = card.querySelector('a');
                if (nameEl && urlEl && urlEl.href.includes('shopier.com')) {
                    const curPrice = card.querySelector('.price-current, .product-price, .price')?.innerText || "0";
                    const oldPrice = card.querySelector('.price-old, .old-price')?.innerText || "0";
                    batch.push({
                        name: nameEl.innerText.trim(),
                        url: urlEl.href,
                        currentPrice: parseFloat(curPrice.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.')) || 0,
                        oldPrice: parseFloat(oldPrice.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.')) || 0,
                        slug: nameEl.innerText.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                        images: [], 
                        category: "Genel" 
                    });
                }
            });
            return batch;
        });

        for(let p of currentBatch) {
            if(!seenUrls.has(p.url) && p.name) {
                seenUrls.add(p.url);
                rawProducts.push(p);
            }
        }

        const newHeight = await page.evaluate('document.body.scrollHeight');
        productsCount = rawProducts.length; // Toplanan benzersiz ürün sayısını baz al
        process.stdout.write(`\r🔄 Vitrinde Bulunan: ${productsCount} / ${totalCount} `);
        
        if (newHeight === previousHeight) sameCount++; else sameCount = 0;
    }
    console.log("\n✅ Vitrin taraması bitti, linkler toplanıyor...");

    const uniqueProducts = rawProducts;
    
    await page.close();
    console.log(`🔍 DERİN TARAMA (Deep Scan) başlıyor... Toplam ${uniqueProducts.length} ürünün içine tek tek girilecek.`);

    // --- BÖLÜM 2: DERİN TARAMA (İç sayfalara girip çoklu resim ve kategori çekme) ---
    const CONCURRENCY = 5; // Aynı anda 5 sekmeye girer (Hız için)
    let completed = 0;

    async function processProduct(product) {
        const pPage = await browser.newPage();
        await pPage.setRequestInterception(true);
        pPage.on('request', (req) => {
            // Resimlerin kendisini indirmeye gerek yok, sadece linklerini HTML'den okuyacağız (Çok hızlandırır)
            if(['stylesheet', 'font', 'media', 'image'].includes(req.resourceType())){
                req.abort();
            } else {
                req.continue();
            }
        });

        try {
            await pPage.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            const deepData = await pPage.evaluate(() => {
                // 1. Ürün içindeki tüm yüksek çözünürlüklü resimleri bul
                const imgUrls = Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src && src.includes('cdn.shopier.app/picture'))
                    .map(src => src.replace('pictures_mid', 'pictures').replace('pictures_small', 'pictures')); // En net haline çevir
                
                // Duplicate resimleri temizle
                const uniqueImages = [...new Set(imgUrls)];

                // 2. Kategoriyi bulmaya çalış
                let cat = "Genel";
                const breadcrumbs = Array.from(document.querySelectorAll('.breadcrumb li, .path span, [itemprop="itemListElement"]'));
                if (breadcrumbs.length > 1) {
                    cat = breadcrumbs[breadcrumbs.length - 2].innerText.trim();
                } else {
                    const catEl = document.querySelector('.category-name, .product-category a');
                    if (catEl) cat = catEl.innerText.trim();
                }

                return { images: uniqueImages, category: cat };
            });

            product.images = deepData.images;
            // İlk resmi kapak resmi olarak da koyalım
            product.image = deepData.images.length > 0 ? deepData.images[0] : "";
            
            if(deepData.category && deepData.category !== "Genel") {
                product.category = deepData.category;
            } else {
                // İsimden Yedek Kategori Tahmini (Özdemir saat vb. için)
                if (product.name.toLowerCase().includes("çelik")) product.category = "Çelik Modeller";
                if (product.name.toLowerCase().includes("armni") || product.name.toLowerCase().includes("kordon")) product.category = "ARMNİ Modeller";
            }

        } catch (err) {
            // Hata olursa varsayılan boş kalsın
            product.images = [];
        } finally {
            await pPage.close();
            completed++;
            process.stdout.write(`\r⚙️ İçine Girilen Ürün: ${completed} / ${uniqueProducts.length}`);
        }
    }

    // Paralel işleme (Aynı anda 5 ürünü açıp tarar, hızlı bitmesi için)
    for (let i = 0; i < uniqueProducts.length; i += CONCURRENCY) {
        const chunk = uniqueProducts.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(p => processProduct(p)));
    }

    await browser.close();
    
    // --- BÖLÜM 3: DOSYAYI KAYDET ---
    const fileName = `c:\\Users\\Murat\\Downloads\\DEEP_SCAN_${storeName}.json`;
    
    const outputData = {
        shopName: storeName,
        products: uniqueProducts,
        categories: [...new Set(uniqueProducts.map(p => p.category).filter(c => c && c !== 'Genel'))],
        source: 'shopier_deep_scan',
        exportDate: new Date().toISOString()
    };
    
    fs.writeFileSync(fileName, JSON.stringify(outputData, null, 2));
    
    console.log(`\n\n🎉 DERİN TARAMA BİTTİ AGA! Bütün çoklu resimler ve gerçek kategoriler söküldü.`);
    console.log(`📦 Dosya hazır: ${fileName}`);
}

const storeArg = process.argv[2];
if(!storeArg) {
    console.log("❌ Lütfen mağaza adı girin. Örn: node scraper_robot.js BUMERANGWEAR");
    process.exit();
}
scrapeShopier(storeArg);
