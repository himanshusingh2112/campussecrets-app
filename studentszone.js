

        // --- Global Variables ---
        let loggedInUser = null; // To store the current user's info
        const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

        // --- DOM Elements ---
        const loginScreen = document.getElementById('login-screen');
        const appScreen = document.getElementById('student-zone-app');
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('username-input');
        const postFeed = document.getElementById('post-feed');
        const emptyFeedMessage = document.getElementById('empty-feed-message');
        const openModalBtn = document.getElementById('open-modal-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const postModal = document.getElementById('post-modal');
        const postForm = document.getElementById('create-post-form');
        const welcomeMessage = document.getElementById('welcome-message');

        // --- 1. LOGIN LOGIC ---
        loginBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (!username) {
                alert('Please enter a username!');
                return;
            }
            loggedInUser = { username: username }; // Set the logged in user
            
            // Switch screens
            loginScreen.style.display = 'none';
            appScreen.style.display = 'block';
            
            welcomeMessage.textContent = `Hello, ${loggedInUser.username}`;
            loadPostsFromStorage(); // Load posts after logging in
        });

        // --- 2. LOGIC FOR TEMPORARY POSTS & LOADING ---
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
        
        function renderPosts(posts) {
            postFeed.innerHTML = ''; // Clear the feed first
            if (posts.length === 0) {
                postFeed.appendChild(emptyFeedMessage);
            } else {
                posts.forEach(post => {
                    const postElement = createPostElement(post);
                    postFeed.appendChild(postElement);
                });
            }
        }

        // --- 3. LOGIC FOR POST CREATION ---
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
            emptyFeedMessage.remove();

            // Save the new post to our browser "database"
            const allPosts = JSON.parse(localStorage.getItem('studentPosts') || '[]');
            allPosts.unshift(newPostData); // Add to the beginning
            localStorage.setItem('studentPosts', JSON.stringify(allPosts));

            postModal.classList.remove('active');
            postForm.reset();
        });

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

        // --- Modal open/close logic ---
        openModalBtn.addEventListener('click', () => postModal.classList.add('active'));
        closeModalBtn.addEventListener('click', () => postModal.classList.remove('active'));

