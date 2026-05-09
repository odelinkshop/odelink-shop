const axios = require('axios');

async function test() {
    const keys = [
        'AIzaSyCXWr-TqnACh6mE5GpQCQeeRN9DCVXrAao', // Current
        'AIzaSyAY03TJYzPA_7d8NEkbmtWqOSUjtDutTVQ',
        'AIzaSyDXmiWQwXanfpPAAW_VK6VBRLsS2g8YJak'
    ];

    const v = 'v1beta';
    const m = 'gemini-1.5-flash';

    for (const key of keys) {
        try {
            console.log(`Testing Key: ${key.substring(0, 10)}...`);
            const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${key}`;
            const res = await axios.post(url, {
                contents: [{ parts: [{ text: "Hi" }] }]
            });
            console.log(`✅ SUCCESS with Key: ${key.substring(0, 10)}...`);
            console.log('Response:', res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
            return key;
        } catch (e) {
            console.error(`❌ Failed Key: ${key.substring(0, 10)}... Error: ${e.response?.data?.error?.message || e.message}`);
        }
    }
}

test();
