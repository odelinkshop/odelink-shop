const axios = require('axios');

async function test() {
  const url = 'https://www.shopier.com/Diezbrands/46679576';
  const size = '42';
  
  try {
    const response = await axios.get(`https://api.odelink.shop/api/payments/shopier-checkout-data?url=${encodeURIComponent(url)}&size=${encodeURIComponent(size)}`);
    console.log("Production Response:", response.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
