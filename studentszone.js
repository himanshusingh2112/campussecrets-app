// studentszone.js

// --- Global Variables ---
let loggedInUser = null; // To store the current user's info (will be populated from localStorage)
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen'); // Assuming this is present if login was not successful initially
const appScreen = document.getElementById('student-zone-app');
const loginBtn = document.getElementById('login-btn'); // Assuming this is for a direct login on this page (if you decide to add one later)
const usernameInput = document.getElementById('username-input'); // Assuming this is for a direct login on this page (if you decide to add one later)
const postFeed = document.getElementById('post-feed');
const emptyFeedMessage = document.getElementById('empty-feed-message'); // Make sure this element exists in your studentszone.html
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const postModal = document.getElementById('post-modal');
const postForm = document.getElementById('create-post-form');
const welcomeMessage = document.getElementById('welcome-message');

// Helper function to create the HTML for a post
function createPostElement(postData) {
    const article = document.createElement('article');
    article.className = 'post';

    const timeAgo = Math.round((Date.now() - postData.createdAt) / 60000); // in minutes
    const imageHTML = postData.image ? `<img src="${postData.image}" class="post-image">` : '';

    article.innerHTML = `
        <div class="post-header">
            <span class="username">${postData.username}</span>
            <span class="post-time" style="margin-left:auto; font-size:12px; color: #888;">${timeAgo} mins ago</span>
        </div>
        <div class="post-body">
            <p>${postData.text}</p>
            ${imageHTML}
        </div>
    `;
    return article;
}

function renderPosts(posts) {
    postFeed.innerHTML = ''; // Clear the feed first
    if (posts.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.id = 'empty-feed-message';
        emptyMessage.textContent = 'No posts yet. Create your first post!';
        postFeed.appendChild(emptyMessage);
    } else {
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postFeed.appendChild(postElement);
        });
    }
}

function loadPostsFromStorage() {
    // Get posts from browser's local storage
    const storedPosts = JSON.parse(localStorage.getItem('studentPosts') || '[]');

    const now = Date.now();

    // Filter out posts that are older than 1 week
    const validPosts = storedPosts.filter(post => {
        return (now - post.createdAt) < ONE_WEEK_IN_MS;
    });

    // Update the local storage with only valid (non-expired) posts
    localStorage.setItem('studentPosts', JSON.stringify(validPosts));

    // Display the valid posts on the screen
    renderPosts(validPosts);
}

// पेज लोड होते ही यह फंक्शन चलेगा
document.addEventListener('DOMContentLoaded', () => {
    // 1. ब्राउज़र की मेमोरी से यूजरनेम निकालो
    const storedUsername = localStorage.getItem('loggedInUser');

    // 2. चेक करो कि यूजरनेम है या नहीं
    if (!storedUsername) {
        // अगर यूजरनेम नहीं है, तो उसे लॉगिन पेज पर वापस भेज दो
        alert('You are not logged in. Redirecting to home page.');
        window.location.href = 'home.html';
    } else {
        loggedInUser = { username: storedUsername }; // Set the logged in user
        // अगर यूजरनेम है, तो ऐप शुरू करो
        initializeApp(storedUsername);
    }
});

function initializeApp(username) {
    // वेलकम मैसेज दिखाओ
    welcomeMessage.textContent = `Hello, ${username}`;

    // लोड करें पहले से मौजूद पोस्ट्स
    loadPostsFromStorage();

    // Modal खोलने और बंद करने का लॉजिक
    openModalBtn.addEventListener('click', () => postModal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => postModal.classList.remove('active'));

    // पोस्ट बनाने का लॉजिक
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const postText = event.target['post-text'].value;
        const postImageFile = event.target['post-image'].files[0];

        // Create a post object with the LOGGED IN USER's name and a timestamp
        const newPostData = {
            username: loggedInUser.username, // Dynamic username!
            text: postText,
            image: postImageFile ? URL.createObjectURL(postImageFile) : null,
            createdAt: Date.now() // Timestamp for expiry
        };

        // Add to the top of the feed visually
        const postElement = createPostElement(newPostData);
        postFeed.prepend(postElement);
        const emptyFeedMessageElement = document.getElementById('empty-feed-message');
        if (emptyFeedMessageElement) {
            emptyFeedMessageElement.remove();
        }

        // Save the new post to our browser "database"
        const allPosts = JSON.parse(localStorage.getItem('studentPosts') || '[]');
        allPosts.unshift(newPostData); // Add to the beginning
        localStorage.setItem('studentPosts', JSON.stringify(allPosts));

        postModal.classList.remove('active');
        postForm.reset();
    });
}