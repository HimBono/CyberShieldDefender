// Check if user is logged in as admin
function checkAdminAuth() {
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isAdminLoggedIn) {
        window.location.href = 'admin-login.html';
    }
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (username === 'admin' && password === 'admin') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        const errorMsg = document.getElementById('login-error');
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.style.display = 'block';
    }
}

// Handle admin logout
function handleAdminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// Add event listener if on login page
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }

    // Check auth on admin pages
    if (window.location.pathname.includes('admin.html')) {
        checkAdminAuth();
    }
}); 