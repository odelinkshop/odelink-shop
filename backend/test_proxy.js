const axios = require('axios');

async function testProxy() {
    console.log('Testing public CORS proxy for merydian with axios...');
    try {
        const targetUrl = encodeURIComponent('https://www.shopier.com/merydian');
        const res = await axios.get(`https://api.allorigins.win/get?url=${targetUrl}`);
        const html = res.data.contents;
        console.log('HTML Length from proxy:', html ? html.length : 'No HTML');
        
        if (html) {
            const csrfMatch = html.match(/csrf-token/i);
            console.log('CSRF Token exists in proxy response?', !!csrfMatch);
        }
    } catch(e) {
        console.log('Error:', e.message);
    }
}
testProxy();
