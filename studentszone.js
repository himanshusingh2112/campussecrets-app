// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// ======================================================
// 1. FIREBASE CONFIGURATION
// ======================================================
const firebaseConfig = {
  apiKey: "AIzaSyAvlhxYxEC61ZqIgSu0lq4wxMrXfi-ySCE",
  authDomain: "campussecrets-cc4b8.firebaseapp.com",
  projectId: "campussecrets-cc4b8",
  storageBucket: "campussecrets-cc4b8.firebasestorage.app",
  messagingSenderId: "375125385371",
  appId: "1:375125385371:web:c6978d28896e25c86ce63e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ======================================================
// 2. AUTHENTICATION CHECK (VERY IMPORTANT)
// ======================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in, initialize the app
        const username = user.email.split('@')[0]; // Extract username from dummy email
        initializeApp(username);
    } else {
        // User is not logged in, redirect to the login page
        console.log("No user is signed in.");
        window.location.href = 'index.html';
    }
});

function initializeApp(username) {
    // ======================================================
    // 3. GET HTML ELEMENTS
    // ======================================================
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const postModal = document.getElementById('post-modal');
    const postForm = document.getElementById('create-post-form');
    const postTextInput = document.querySelector('textarea[name="post-text"]');
    const postFeed = document.getElementById('post-feed');

    // Display welcome message
    welcomeMessage.textContent = `Hello, ${username}`;

    // ======================================================
    // 4. LOGOUT LOGIC
    // ======================================================
    logoutBtn.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    });

    // ======================================================
    // 5. MODAL LOGIC
    // ======================================================
    openModalBtn.addEventListener('click', () => postModal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => postModal.classList.remove('active'));

    // ======================================================
    // 6. CREATE NEW POST LOGIC (Saves to Firestore)
    // ======================================================
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postText = postTextInput.value.trim();

        if (postText) {
            try {
                // Add a new document to the "student_posts" collection in Firestore
                await addDoc(collection(db, "student_posts"), {
                    text: postText,
                    author: username, // Save the author's username
                    createdAt: serverTimestamp() // Add a server-side timestamp
                });
                postForm.reset(); // Clear the form
                postModal.classList.remove('active'); // Close the modal
            } catch (error) {
                console.error("Error adding post: ", error);
                alert("Could not create post. Please try again.");
            }
        }
    });

    // ======================================================
    // 7. DISPLAY ALL POSTS (REAL-TIME from Firestore)
    // ======================================================
    const postsCollection = collection(db, "student_posts");
    const q = query(postsCollection, orderBy("createdAt", "desc")); // Order by newest first

    onSnapshot(q, (snapshot) => {
        postFeed.innerHTML = ''; // Clear old posts
        if (snapshot.empty) {
            postFeed.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No posts yet. Be the first to share!</p>';
        } else {
            snapshot.forEach((doc) => {
                const postData = doc.data();
                const postElement = document.createElement('div');
                postElement.className = 'post';
                
                const postDate = postData.createdAt ? postData.createdAt.toDate().toLocaleString() : 'Just now';

                postElement.innerHTML = `
                    <div class="post-header">
                        <span class="username">${postData.author}</span>
                        <span class="timestamp">${postDate}</span>
                    </div>
                    <div class="post-body">
                        <p>${postData.text.replace(/\n/g, '<br>')}</p>
                    </div>
                `;
                postFeed.appendChild(postElement);
            });
        }
    });
}