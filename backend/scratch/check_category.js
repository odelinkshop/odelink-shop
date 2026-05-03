const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
    const url = 'https://www.shopier.com/BUMERANGWEAR/30026607';
    try {
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(res.data);
        console.log('--- BREADCRUMB ---');
        console.log($('.breadcrumb').html());
        console.log($('.shopier-breadcrumb').html());
        console.log('--- CATEGORY TEXT ---');
        console.log($('.breadcrumb li').text());
        console.log('--- META CATEGORY ---');
        console.log($('meta[property="product:category"]').attr('content'));
        console.log('--- ALL LI ---');
        $('li').each((i, el) => {
            if ($(el).text().includes('Hırka') || $(el).text().includes('Giyim')) {
                console.log($(el).text().trim());
            }
        });
    } catch (e) {
        console.error(e.message);
    }
}
check();
