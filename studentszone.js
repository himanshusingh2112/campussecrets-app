// studentszone.js

// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// ======================================================
// 1. FIREBASE CONFIGURATION
// ======================================================
const firebaseConfig = {
    apiKey: "AIzaSyAvlhxYxEC61ZqIgSu0lq4wxMrXfi-ySCE", // **यहाँ अपनी असली KEY डालें**
    authDomain: "campussecrets-cc4b8.firebaseapp.com",
    projectId: "campussecrets-cc4b8",
    storageBucket: "campussecrets-cc4b8.appspot.com",
    messagingSenderId: "375125385371",
    appId: "1:375125385371:web:c6978d28896e25c86ce63e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ======================================================
// 2. AUTHENTICATION CHECK
// ======================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        const username = user.email.split('@')[0];
        // **सुधार:** फंक्शन का नया नाम कॉल करें
        runStudentZoneApp(username);
    } else {
        window.location.href = 'index.html';
    }
});

// **सुधार:** फंक्शन का नाम बदल दिया गया है
function runStudentZoneApp(username) {
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const postModal = document.getElementById('post-modal');
    const postForm = document.getElementById('create-post-form');
    const postTextInput = document.querySelector('textarea[name="post-text"]');
    const postImageInput = document.querySelector('input[name="post-image"]');
    const postFeed = document.getElementById('post-feed');

    postImageInput.addEventListener('click', (event) => {
        // यह फाइल चुनने वाले डायलॉग को खुलने से रोकता है
        event.preventDefault(); 
        alert('Image upload is currently not working.');
    });
    
    welcomeMessage.textContent = `Hello, ${username}`;

    logoutBtn.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    });

    openModalBtn.addEventListener('click', () => postModal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => postModal.classList.remove('active'));

    // postForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const postText = postTextInput.value.trim();
    //     const postImageFile = postImageInput.files[0];

    //     if (!postText && !postImageFile) {
    //         alert("Please write something or upload an image.");
    //         return;
    //     }

    //     let imageUrl = null;
    //     if (postImageFile) {
    //         const storageRef = ref(storage, `post_images/${Date.now()}_${postImageFile.name}`);
    //         const reader = new FileReader();
    //         reader.readAsDataURL(postImageFile);
    //         reader.onload = async () => {
    //             const dataUrl = reader.result;
    //             await uploadString(storageRef, dataUrl, 'data_url');
    //             imageUrl = await getDownloadURL(storageRef);
    //             savePost(postText, imageUrl, username);
    //         };
    //     } else {
    //         savePost(postText, imageUrl, username);
    //     }
    // });

    // ✅ यह नया और सही कोड है
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postText = postTextInput.value.trim();

    // सिर्फ यह चेक करें कि टेक्स्ट खाली तो नहीं है
    if (!postText) {
        alert("Please write something to post.");
        return;
    }

    // सीधे पोस्ट को सेव करें (बिना इमेज के)
    // यहाँ imageUrl को null भेज रहे हैं
    savePost(postText, null, username); 
});
    
    async function savePost(text, imageUrl, author) {
        try {
            await addDoc(collection(db, "student_posts"), {
                text: text,
                imageUrl: imageUrl,
                author: author,
                createdAt: serverTimestamp()
            });
            postForm.reset();
            postModal.classList.remove('active');
        } catch (error) {
            console.error("Error adding post: ", error);
            alert("Could not create the post.");
        }
    }

    const postsQuery = query(collection(db, "student_posts"), orderBy("createdAt", "desc"));
    
    onSnapshot(postsQuery, (snapshot) => {
        postFeed.innerHTML = '';
        if (snapshot.empty) {
            postFeed.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No posts yet. Be the first to share!</p>';
        } else {
            snapshot.forEach((doc) => {
                const postData = doc.data();
                const postElement = document.createElement('div');
                postElement.className = 'post';
                
                const postDate = postData.createdAt ? postData.createdAt.toDate().toLocaleString() : 'Just now';
                const imageHTML = postData.imageUrl ? `<img src="${postData.imageUrl}" style="max-width:100%; border-radius:8px; margin-top:10px;">` : '';

                postElement.innerHTML = `
                    <div class="post-header">
                        <span class="username">${postData.author}</span>
                        <span class="timestamp">${postDate}</span>
                    </div>
                    <div class="post-body">
                        <p>${postData.text ? postData.text.replace(/\n/g, '<br>') : ''}</p>
                        ${imageHTML}
                    </div>
                `;
                postFeed.appendChild(postElement);
            });
        }
    });
}