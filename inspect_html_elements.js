const https = require('https');

https.get('https://www.shopier.com/cansayerkekgiyim/47287399', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // Look for "Bu ürünleri beğenebilirsiniz" or "beğenebilirsiniz" and output surrounding HTML
    const idx = data.indexOf('beğenebilirsiniz');
    if (idx !== -1) {
      console.log('--- FOUND RECOMMENDATION REGION ---');
      console.log(data.substring(idx - 1000, idx + 2000));
    } else {
      console.log('--- NOT FOUND TEXT "beğenebilirsiniz" ---');
    }
  });
}).on('error', (err) => {
  console.error(err);
});
