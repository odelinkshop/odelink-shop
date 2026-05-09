const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('krampon.html', 'utf-8');
const shopSlug = 'KramponLab';

function parseProductsFromHtml(html, shopSlug) {
  const $ = cheerio.load(html);
  const products = [];

  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (href.toLowerCase().includes(`/${shopSlug.toLowerCase()}/`) && /\d+$/.test(href)) {
      const id = href.split('/').pop();
      const text = $(el).text().trim();
      if (products.find(p => p.id === id)) return;
      
      let name = text.replace(/\d+([.,]\d+)?\s*TL/i, '').trim();
      let price = text.match(/\d+([.,]\d+)?\s*TL/i)?.[0] || '';

      if (!name) {
        name = $(el).closest('div').find('h3').text().trim() || $(el).parent().find('h3').text().trim();
      }

      if (name && id) {
        products.push({
          id,
          name,
          price,
          url: href.startsWith('http') ? href : `https://www.shopier.com${href}`,
          image: $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || ''
        });
      } else {
        console.log(`Failed for id ${id}: name is empty. Text was: '${text}'`);
      }
    }
  });
  return products;
}

console.log(parseProductsFromHtml(html, shopSlug));
