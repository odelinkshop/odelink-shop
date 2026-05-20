const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const shopUrl = 'https://www.shopier.com/Diezbrands';
  
  try {
    console.log(`Fetching shop page to find Prada: ${shopUrl}`);
    const response = await axios.get(shopUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const productLinks = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('Diezbrands/') || (href.match(/\/\d+$/) && !href.includes('/s/'))) {
        productLinks.push(href);
      }
    });

    const uniqueLinks = [...new Set(productLinks)];
    
    // Find the product containing Prada in its title
    let pradaLink = null;
    let pradaTitle = null;
    
    // In Shopier product grids, sometimes titles are in .product-title or similar elements.
    // Let's just fetch all unique product links and inspect their HTML for the word "prada"
    console.log(`Searching through ${uniqueLinks.length} products...`);
    for (const link of uniqueLinks) {
      const fullUrl = link.startsWith('http') ? link : `https://www.shopier.com${link.startsWith('/') ? '' : '/'}${link}`;
      const prRes = await axios.get(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });
      const prHtml = prRes.data;
      const pr$ = cheerio.load(prHtml);
      
      const title = pr$('h1').text() || pr$('title').text() || '';
      if (title.toLowerCase().includes('prada')) {
        pradaLink = fullUrl;
        pradaTitle = title.trim();
        console.log(`Found Prada Product: Title="${pradaTitle}", URL="${pradaLink}"`);
        
        // Print Svelte initialized state for this Prada product
        const extractBalancedJson = (str, startIdx) => {
          if (str[startIdx] !== '{') return null;
          let depth = 0;
          let inString = false;
          let escapeNext = false;
          for (let i = startIdx; i < str.length && i < startIdx + 500000; i++) {
            if (escapeNext) { escapeNext = false; continue; }
            if (str[i] === '\\') { escapeNext = true; continue; }
            if (str[i] === '"' && !escapeNext) { inString = !inString; continue; }
            if (inString) continue;
            if (str[i] === '{') depth++;
            else if (str[i] === '}') {
              depth--;
              if (depth === 0) return str.substring(startIdx, i + 1);
            }
          }
          return null;
        };

        pr$('script').each((sIdx, sel) => {
          const content = pr$(sel).html() || '';
          if (content.includes('"product"') || content.includes("'product'") || content.includes('product:')) {
            const assignmentRegex = /=\s*\{/g;
            let assignMatch;
            while ((assignMatch = assignmentRegex.exec(content)) !== null) {
              try {
                const jsonStr = extractBalancedJson(content, assignMatch.index + assignMatch[0].length - 1);
                if (!jsonStr || jsonStr.length < 100) continue;
                
                const data = JSON.parse(jsonStr);
                const p = data.product || data.$product || data.p;
                if (p) {
                  console.log("=== Prada Product Svelte State ===");
                  console.log(JSON.stringify(p, null, 2));
                }
              } catch (e) {}
            }
          }
        });
        
        break; // Stop after first match
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
