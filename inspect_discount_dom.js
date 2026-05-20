const https = require('https');

https.get('https://www.shopier.com/Miestilogiyimcenter/47199750', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const idx = data.indexOf('1.100');
    if (idx !== -1) {
      console.log('--- FOUND 1.100 REGION ---');
      console.log(data.substring(idx - 300, idx + 300));
    } else {
      console.log('--- NOT FOUND 1.100 ---');
      // Let's print around the current price "699,99"
      const idx2 = data.indexOf('699,99');
      if (idx2 !== -1) {
        console.log('--- FOUND 699,99 REGION ---');
        console.log(data.substring(idx2 - 300, idx2 + 1000));
      }
    }
  });
}).on('error', (err) => {
  console.error(err);
});
