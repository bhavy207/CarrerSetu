require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const generateToken = require('./utils/generateToken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testIt() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne();
    if (!user) { console.log('No user'); process.exit(1); }
    
    const token = generateToken(user._id);

    const data = JSON.stringify({
        message: 'hello',
        history: []
    });

    const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: data
    });

    console.log(await res.text());
    process.exit(0);
}

testIt();
