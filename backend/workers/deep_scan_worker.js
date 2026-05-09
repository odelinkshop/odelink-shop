require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const pool = require('../config/database');
const Site = require('../models/Site');
const { GoogleGenerativeAI } = require("@google/generative-ai");

puppeteer.use(StealthPlugin());

const siteId = process.argv[2];
const shopierUrl = process.argv[3];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDeepScan() {
    let browser;
    try {
        console.log(`[NOVA v17] Starting Indestructible Engine for Site: ${siteId}`);
        const storeName = shopierUrl.split('shopier.com/')[1]?.split('/')[0]?.split('?')[0] || 'shop';

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(shopierUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Phase 1: Regex Brute Force (Backup)
        console.log(`[NOVA] Running Phase 1: Regex Brute Force...`);
        const bruteProducts = await page.evaluate((sName) => {
            const results = [];
            const links = Array.from(document.querySelectorAll('a'));
            
            links.forEach(a => {
                const href = a.href;
                const parts = href.split('/');
                const id = parts.pop() || parts.pop();
                
                // Check if it's a product link (ends in numeric ID and contains store name)
                if (href.includes(sName) && /^\d+$/.test(id)) {
                    const parent = a.closest('.product-card, .product-box, div') || a.parentElement?.parentElement;
                    if (!parent) return;

                    const text = parent.innerText || '';
                    const priceMatch = text.match(/(\d+[.,]?\d*)\s*TL/i);
                    const title = text.split('\n')[0].substring(0, 100).trim();
                    const img = parent.querySelector('img');
                    const image = img ? (img.getAttribute('data-src') || img.src) : '';

                    results.push({
                        id,
                        title: title || 'Ürün',
                        price: priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0,
                        url: href,
                        image: image
                    });
                }
            });
            return results;
        }, storeName);

        // Deduplicate
        const seen = new Set();
        let finalProducts = bruteProducts.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return p.price > 0;
        });

        console.log(`[NOVA] Regex found ${finalProducts.length} items.`);

        // Phase 2: AI Enrichment (Optional but preferred)
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && finalProducts.length < 20) {
            try {
                console.log(`[NOVA] Attempting AI Enrichment for higher quality...`);
                const domData = await page.evaluate(() => document.body.innerText.substring(0, 15000));
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Extract Shopier products as JSON array: [{id, title, price, url, image}]. \n\n ${domData}`;
                const aiRes = await model.generateContent(prompt);
                const aiProducts = JSON.parse(aiRes.response.text().replace(/```json|```/g, '').trim());
                
                if (aiProducts && aiProducts.length > 5) {
                    console.log(`[NOVA] AI Success! Using AI data (${aiProducts.length} items).`);
                    finalProducts = aiProducts;
                }
            } catch (e) {
                console.log(`[NOVA] AI Failed (${e.message}), sticking with Regex data.`);
            }
        }

        // Polish images
        finalProducts = finalProducts.map(p => ({
            ...p,
            image: p.image?.replace('/mid/', '/xlarge/').replace('/small/', '/xlarge/') || ''
        }));

        // DB Update
        const siteResult = await pool.query("SELECT settings FROM sites WHERE id = $1", [siteId]);
        if(siteResult.rows.length > 0) {
            const updatedSettings = {
                ...(siteResult.rows[0].settings || {}),
                products_data: finalProducts,
                build_progress: 100,
                build_status: 'completed',
                build_status_text: 'Mağazanız Hazır!'
            };
            await pool.query("UPDATE sites SET settings = $1 WHERE id = $2", [JSON.stringify(updatedSettings), siteId]);
            console.log(`[NOVA SUCCESS] Saved ${finalProducts.length} products.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("[NOVA FATAL]", error.message);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
}

runDeepScan();
