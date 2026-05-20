const https = require('https');

https.get('https://www.shopier.com/cansayerkekgiyim/47287399', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const scripts = data.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const script of scripts) {
      if (script.includes('"product"') && (script.includes('"price_formatted"') || script.includes('"price"'))) {
        const match = script.match(/=\s*(\{.+?\});?\s*$/m) || script.match(/({(?:[^{}]+|{(?:[^{}]+|{[^{}]*})*})*})/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            console.log('KEYS:', Object.keys(parsed.product));
            console.log('PRODUCT OBJECT:', JSON.stringify(parsed.product, null, 2).substring(0, 4000));
          } catch(e) {
            console.error('PARSE ERROR:', e.message);
          }
        }
        break;
      }
    }
  });
}).on('error', (err) => {
  console.error(err);
});
