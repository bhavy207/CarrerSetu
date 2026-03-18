const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/authMiddleware');

// Initialize Gemini with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Global system instructions to configure the persona
const SYSTEM_INSTRUCTION = `You are a Career Counselor, Advisor, and Skills Explainer.
Your primary goal is to help students and professionals navigate their career paths, explain skills required for various jobs, and give actionable, practical advice.
Be encouraging, professional, structure your responses with bullet points if necessary, and use a friendly tone. Limit responses to 200 words.`;

// Post message to chat
router.post('/', protect, async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            // Give a mock response if API key is missing so development doesn't crash completely
            console.warn("GEMINI_API_KEY is not set. Using mock response.");
            return res.json({
                response: "Hello! I am your AI Career Advisor. However, the administrator has not configured my Gemini API key yet. Please add it to the .env file!"
            });
        }

        // Initialize model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
        });

        // Format history for Gemini API
        // Gemini expects history as: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', ... }]
        const formattedHistory = [];
        if (history && Array.isArray(history)) {
            for (const msg of history) {
                formattedHistory.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                });
            }
        }

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ response: responseText });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: 'Error processing chat message', details: error.message });
    }
});

module.exports = router;
