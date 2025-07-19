const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- अस्थायी (temporary) डेटाबेस ---
let users = [];
let posts = [];

// ===============================================
// API ENDPOINTS
// ===============================================

// --- User Signup ---
app.post('/signup', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists!' });
    }

    const newUser = { username, password, role };
    users.push(newUser);
    console.log('Users:', users);
    res.status(201).json({ message: 'Account created successfully! Please login.' });
});

// --- User Login ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Account not found. Please sign up first.' });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({ message: `Login successful! Welcome, ${username}.`, role: user.role });
});


// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});