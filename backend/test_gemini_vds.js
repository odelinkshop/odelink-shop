const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './.env' });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using Key:', apiKey?.substring(0, 5) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ Success with ${modelName}:`, result.response.text());
            return;
        } catch (e) {
            console.error(`❌ Failed ${modelName}:`, e.message);
        }
    }
}

test();
