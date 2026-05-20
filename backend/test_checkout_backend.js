const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const cleanUrl = 'https://www.shopier.com/Diezbrands/46679576';
  const size = '42';
  
  try {
    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let shopName = null;
    let productId = null;
    let variationId = null;
    let variationName = null;

    try {
      const parsedUrl = new URL(cleanUrl);
      if (parsedUrl.searchParams.has('id')) {
        productId = parsedUrl.searchParams.get('id');
      }

      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        if (!isNaN(Number(pathParts[1]))) {
          shopName = pathParts[0];
          productId = pathParts[1];
        }
      } else if (pathParts.length === 1) {
        if (!isNaN(Number(pathParts[0]))) {
          productId = pathParts[0];
        }
      }
    } catch (err) {
      console.error('URL parse error:', err.message);
    }

    if (!productId) {
      productId = $('input[name="product_id"]').val();
    }
    if (!shopName) {
      const formAction = $('#buy-form').attr('action') || '';
      if (formAction.includes('shipping/')) {
        shopName = formAction.split('shipping/')[1];
      }
    }

    console.log(`Extracted: ShopName=${shopName}, ProductID=${productId}`);

    if (size) {
      const targetSize = size.toString().trim().toLowerCase();
      let foundVariationId = null;
      let foundVariationName = null;

      // Svelte SPA JSON State'ten çekme denemesi (Yeni Shopier Mimarisi)
      try {
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

        $('script').each((i, el) => {
          if (foundVariationId) return;
          const content = $(el).html() || '';
          if (content.length < 50) return;

          if (content.includes('"product"') || content.includes("'product'") || content.includes('product:')) {
            const assignmentRegex = /=\s*\{/g;
            let assignMatch;
            while ((assignMatch = assignmentRegex.exec(content)) !== null) {
              try {
                const jsonStr = extractBalancedJson(content, assignMatch.index + assignMatch[0].length - 1);
                if (!jsonStr || jsonStr.length < 100) continue;
                
                const data = JSON.parse(jsonStr);
                const p = data.product || data.$product || data.p;
                
                if (p && p.variations) {
                  console.log("Variations JSON block found! Content is valid JSON.");
                  console.log("Product variations structure:", JSON.stringify(p.variations, null, 2));
                  for (let vNum = 1; vNum <= 3; vNum++) {
                    const vList = p.variations[`variation_${vNum}`] || [];
                    const vName = p.variations[`variation_${vNum}_name`] || '';
                    for (const opt of vList) {
                      const optionName = (opt.name || '').toLowerCase().trim();
                      const targetParts = targetSize.split('/').map(p => p.trim());
                      const optionParts = optionName.split('/').map(p => p.trim());
                      
                      let isMatch = false;
                      for (const tp of targetParts) {
                        for (const op of optionParts) {
                          if (tp === op || tp.includes(op) || op.includes(tp)) {
                            isMatch = true;
                            break;
                          }
                        }
                        if (isMatch) break;
                      }

                      if (isMatch) {
                        foundVariationId = opt.id;
                        foundVariationName = vName;
                        console.log(`Matched Option: name=${opt.name}, id=${opt.id}, variationName=${vName}`);
                        break;
                      }
                    }
                    if (foundVariationId) break;
                  }
                }
              } catch (jsonErr) {
                // Ignore parse error and continue
              }
            }
          }
        });
      } catch (err) {
        console.error('Variation JSON parse error:', err.message);
      }

      variationId = foundVariationId;
      variationName = foundVariationName;
    }

    console.log("Final Resolved:", {
      success: true,
      shopName,
      productId,
      variationId,
      variationName
    });

  } catch (error) {
    console.error('❌ Shopier checkout data error:', error.message);
  }
}

test();
