const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let users = [];
let posts = []; // पोस्ट को स्टोर करने के लिए ऐरे

// ===============================================
// API ENDPOINTS
// ===============================================

// --- User Signup ---
app.post('/signup', (req, res) => {
    const { username, role } = req.body;
    if (!username || !role) {
        return res.status(400).json({ message: 'Username and role are required' });
    }

    const existingUser = users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists!' });
    }

    const newUser = { username, role };
    users.push(newUser);
    console.log('Users:', users);
    res.status(201).json({ message: 'Account created successfully!', role: role });
});

// --- User Login ---
app.post('/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Account not found.' });
    }

    res.status(200).json({ message: `Login successful! Welcome, ${username}.`, role: user.role });
});

// --- Create a New Post ---
app.post('/api/create-post', (req, res) => {
    const { username, text, image } = req.body;
    if (!username || !text) {
        return res.status(400).json({ message: 'Username and text are required for a post.' });
    }

    const newPost = {
        username: username,
        text: text,
        image: image,
        createdAt: Date.now()
    };
    posts.push(newPost);
    console.log('Posts:', posts);
    res.status(201).json({ message: 'Post created successfully!', post: newPost });
});

// --- Get All Posts ---
app.get('/api/posts', (req, res) => {
    res.status(200).json(posts);
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});