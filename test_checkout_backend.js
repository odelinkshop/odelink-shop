const axios = require('axios');

async function test() {
  const url = 'https://www.shopier.com/sisbutiks/47342859';
  const size = '4';
  
  try {
    const response = await axios.get(`http://localhost:5000/api/payments/shopier-checkout-data?url=${encodeURIComponent(url)}&size=${encodeURIComponent(size)}`);
    console.log("Response:", response.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
