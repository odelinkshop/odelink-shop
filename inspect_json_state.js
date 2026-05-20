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
        console.log('--- FOUND PRODUCT SCRIPT MATCH ---');
        console.log(script.substring(0, 5000));
        break;
      }
    }
  });
}).on('error', (err) => {
  console.error(err);
});
