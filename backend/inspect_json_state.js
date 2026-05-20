const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const cleanUrl = 'https://www.shopier.com/sisbutiks/47342859';
  
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
      const content = $(el).html() || '';
      if (content.includes('"product"') || content.includes("'product'") || content.includes('product:')) {
        const assignmentRegex = /=\s*\{/g;
        let assignMatch;
        while ((assignMatch = assignmentRegex.exec(content)) !== null) {
          try {
            const jsonStr = extractBalancedJson(content, assignMatch.index + assignMatch[0].length - 1);
            if (!jsonStr || jsonStr.length < 100) continue;
            
            const data = JSON.parse(jsonStr);
            console.log(JSON.stringify(data, null, 2));
            break;
          } catch (e) {}
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
