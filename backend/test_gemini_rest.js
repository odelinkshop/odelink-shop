const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using Key:', apiKey?.substring(0, 5) + '...');
    
    // Test both v1 and v1beta
    const versions = ['v1', 'v1beta'];
    const models = ['gemini-1.5-flash', 'gemini-pro'];

    for (const v of versions) {
        for (const m of models) {
            try {
                console.log(`Testing ${v} with ${m}...`);
                const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${apiKey}`;
                const res = await axios.post(url, {
                    contents: [{ parts: [{ text: "Hi" }] }]
                });
                console.log(`✅ Success ${v}/${m}:`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
                return;
            } catch (e) {
                console.error(`❌ Failed ${v}/${m}:`, e.response?.data?.error?.message || e.message);
            }
        }
    }
}

test();
