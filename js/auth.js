// js/auth.js - Complete Firebase Authentication with Google OAuth

// Firebase configuration - Replace with your Firebase project credentials
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
    updateUIBasedOnAuth(user);
});

// Update UI based on authentication state
function updateUIBasedOnAuth(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const logoutLink = document.getElementById('logout-link');

    if (user) {
        // User is signed in
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        
        // Set user avatar
        if (userAvatar && user.photoURL) {
            userAvatar.src = user.photoURL;
        }
        
        // Update mobile menu
        updateMobileMenu(true);
    } else {
        // User is signed out
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        
        // Update mobile menu
        updateMobileMenu(false);
    }
}

// Login with Email/Password
async function loginWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Check if admin login
        if (email === 'admin@admin.com' && password === 'admin') {
            // Update user role to admin
            await db.collection('users').doc(userCredential.user.uid).update({
                role: 'admin'
            });
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        
        return userCredential;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Login with Google
async function loginWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Check if user exists in database
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user document
            await db.collection('users').doc(user.uid).set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        window.location.href = 'dashboard.html';
        return result;
    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
}

// Register with Email/Password
async function registerWithEmail(name, email, password, company) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: name
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            displayName: name,
            email: email,
            company: company,
            role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window.location.href = 'dashboard.html';
        return userCredential;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update mobile menu based on auth state
function updateMobileMenu(isAuthenticated) {
    const mobileNavLinks = document.querySelector('.mobile-nav-links');
    
    if (mobileNavLinks) {
        const authLinks = mobileNavLinks.querySelectorAll('li:last-child, li:nth-last-child(2)');
        
        if (isAuthenticated) {
            // Replace login/signup with dashboard/logout
            authLinks[0].innerHTML = '<a href="dashboard.html">Dashboard</a>';
            authLinks[1].innerHTML = '<a href="#" onclick="logout()">Logout</a>';
        } else {
            // Show login/signup
            authLinks[0].innerHTML = '<a href="login.html">Log In</a>';
            authLinks[1].innerHTML = '<a href="register.html">Sign Up</a>';
        }
    }
}

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        
        try {
            await loginWithEmail(email, password);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    });
    
    // Google login button
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                await loginWithGoogle();
            } catch (error) {
                const errorDiv = document.getElementById('login-error');
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
    }
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const company = document.getElementById('company').value;
        const errorDiv = document.getElementById('register-error');
        
        try {
            await registerWithEmail(name, email, password, company);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    });
}

// Logout handlers
document.addEventListener('DOMContentLoaded', () => {
    // Desktop logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Dashboard logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Admin logout
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

// Password toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});

// Export functions for use in other modules
window.auth = auth;
window.db = db;
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.registerWithEmail = registerWithEmail;
window.logout = logout;