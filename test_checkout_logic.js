const cheerio = require('./backend/node_modules/cheerio');
const axios = require('axios');

async function testLogic() {
  const cleanUrl = 'https://www.shopier.com/Miestilogiyimcenter/47199750';
  const size = 'XXL';

  console.log(`🔍 [Test] Fetching page: ${cleanUrl}, Size: ${size}`);

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

  if (size) {
    const targetSize = size.toString().trim().toLowerCase();
    const selectElement = $('select[name="size"]');
    console.log('selectElement count:', selectElement.length);
    if (selectElement.length > 0) {
      selectElement.find('option').each((i, el) => {
        const optionText = $(el).text().trim().toLowerCase();
        const optionValue = $(el).val();
        
        console.log(`Checking option Text: "${optionText}", Value: "${optionValue}" against Target: "${targetSize}"`);
        
        if (!optionText || optionValue === '-1') return;
        
        if (optionText === targetSize || optionText.includes(targetSize) || targetSize.includes(optionText)) {
          variationId = optionValue;
          console.log(`🎉 MATCH FOUND! variationId = ${variationId}`);
          return false;
        }
      });
    }
  }

  console.log('RESULT:', {
    shopName,
    productId,
    variationId
  });
}

testLogic();
