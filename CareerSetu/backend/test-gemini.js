require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    try {
        console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a Career Counselor.",
        });

        const chat = model.startChat({ history: [] });
        console.log("Sending message...");
        const result = await chat.sendMessage("Hi, I want to be a web developer.");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
    }
}
run();
