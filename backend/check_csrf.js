const fs = require('fs');
const html = fs.readFileSync('krampon.html', 'utf-8');
const csrfToken = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1];
console.log('CSRF:', csrfToken);

const defaultProductCountMatch = html.match(/"default_product_count":(\d+)/);
const increment = defaultProductCountMatch ? parseInt(defaultProductCountMatch[1]) : 24;
console.log('Increment:', increment);
