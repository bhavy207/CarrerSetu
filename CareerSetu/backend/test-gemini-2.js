require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const resp = await fetch(URL);
        const data = await resp.json();
        console.log(data.models.map(m => m.name).join("\n"));
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
    }
}
run();
