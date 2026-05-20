const https = require('https');
const cheerio = require('./backend/node_modules/cheerio');

https.get('https://www.shopier.com/Miestilogiyimcenter/47199750', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const $ = cheerio.load(data);
    const select = $('select');
    console.log('--- FOUND SELECT ELEMENTS ---');
    console.log('Count:', select.length);
    select.each((i, el) => {
      console.log(`Select [${i+1}] name:`, $(el).attr('name'));
      console.log(`Select [${i+1}] class:`, $(el).attr('class'));
      $(el).find('option').each((j, opt) => {
        console.log(`   Option [${j+1}] val: "${$(opt).val()}", text: "${$(opt).text().trim()}"`);
      });
    });
  });
}).on('error', (err) => {
  console.error(err);
});
