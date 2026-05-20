const https = require('https');

https.get('https://www.shopier.com/DUFO/31170077', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    
    // Let's search for "Teslimat bilgisi" or similar keywords
    console.log('--- Search Keywords ---');
    const keywords = ['Teslimat', 'teslimat', 'kargo', 'shipping', 'first_variation', 'second_variation'];
    keywords.forEach(kw => {
      const index = data.indexOf(kw);
      console.log(`Keyword "${kw}":`, index !== -1 ? `Found at ${index} (Context: ${data.substring(index - 50, index + 100)})` : 'Not Found');
    });

    // Let's search for the actual delivery info div or tab
    const tabsRegex = /<div[^>]*id="deliveryInformation"[^>]*>([\s\S]*?)<\/div>/gi;
    const match = tabsRegex.exec(data);
    if (match) {
      console.log('--- DELIVERY INFO BY ID ---');
      console.log(match[0].substring(0, 500));
    } else {
      // Search for any element containing "Bu dükkandaki tüm ürünler"
      const textIndex = data.indexOf('Bu dükkandaki tüm ürünler');
      if (textIndex !== -1) {
        console.log('--- FOUND TEXT CONTEXT ---');
        console.log(data.substring(textIndex - 200, textIndex + 300));
      }
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
