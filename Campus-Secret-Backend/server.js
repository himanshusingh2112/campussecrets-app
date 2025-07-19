// server.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let users = [];
let posts = [];

// --- User Signup ---
app.post('/signup', (req, res) => {
    const { username, role } = req.body; // अब पासवर्ड नहीं ले रहे
    if (!username || !role) {
        return res.status(400).json({ message: 'Username and role are required' });
    }

    const existingUser = users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists!' });
    }

    const newUser = { username, role }; // पासवर्ड को हटा दिया गया
    users.push(newUser);
    console.log('Users:', users);
    res.status(201).json({ message: 'Account created successfully!', role: role });
});

// --- User Login ---
app.post('/login', (req, res) => {
    const { username } = req.body; // अब सिर्फ यूजरनेम ले रहे
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Account not found.' });
    }

    res.status(200).json({ message: `Login successful! Welcome, ${username}.`, role: user.role });
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});