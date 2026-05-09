const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using Key:', apiKey?.substring(0, 10) + '...');
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await axios.get(url);
        console.log('✅ AVAILABLE MODELS:');
        console.log(JSON.stringify(res.data.models.map(m => m.name), null, 2));
    } catch (e) {
        console.error('❌ FAILED to list models:', e.response?.data?.error?.message || e.message);
    }
}

test();
