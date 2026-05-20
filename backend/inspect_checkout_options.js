const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const shopUrl = 'https://www.shopier.com/Diezbrands';
  
  try {
    console.log(`Fetching shop page: ${shopUrl}`);
    const response = await axios.get(shopUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    console.log("=== PRODUCTS FOUND ON SHOP PAGE ===");
    // Find all product links
    const productLinks = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('Diezbrands/') || (href.match(/\/\d+$/) && !href.includes('/s/'))) {
        productLinks.push(href);
      }
    });

    const uniqueLinks = [...new Set(productLinks)];
    console.log("Unique links:", uniqueLinks);

    // Let's inspect the first few product pages to see variation select inputs!
    for (const link of uniqueLinks.slice(0, 3)) {
      const fullUrl = link.startsWith('http') ? link : `https://www.shopier.com${link.startsWith('/') ? '' : '/'}${link}`;
      console.log(`\n--------------------------------------------`);
      console.log(`Inspecting product: ${fullUrl}`);
      
      const prRes = await axios.get(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });
      
      const prHtml = prRes.data;
      const pr$ = cheerio.load(prHtml);
      
      pr$('form').each((fIdx, form) => {
        const action = pr$(form).attr('action') || '';
        if (action.includes('shipping/')) {
          console.log(`Found buy form! Action: ${action}`);
          pr$(form).find('input, select').each((iIdx, input) => {
            const tagName = pr$(input).get(0).tagName;
            const name = pr$(input).attr('name');
            const type = pr$(input).attr('type') || '';
            const val = pr$(input).attr('value') || '';
            console.log(`  - <${tagName}> Name="${name}" Type="${type}" Value="${val}"`);
            
            if (tagName === 'select') {
              console.log(`    Options:`);
              pr$(input).find('option').each((oIdx, opt) => {
                console.log(`      * Value="${pr$(opt).attr('value')}" Text="${pr$(opt).text().trim()}"`);
              });
            }
          });
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
