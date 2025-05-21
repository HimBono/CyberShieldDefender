// Auth Guard for Protected Pages
import { auth, onAuthStateChanged } from './auth.js';

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
  // Get current page path
  const currentPath = window.location.pathname;
  
  // List of pages that require authentication
  const protectedPages = [
    'dashboard.html',
    'dashboard-courses.html',
    'dashboard-certificates.html',
    'dashboard-profile.html',
    'dashboard-settings.html',
    'admin.html'
  ];
  
  // Check if current page is protected
  const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
  
  // If page is protected and user is not authenticated, redirect to login
  if (isProtectedPage && !user) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPath);
  }
  
  // If admin page and user is not admin, redirect to dashboard
  if (currentPath.includes('admin.html') && user && user.role !== 'admin') {
    window.location.href = 'dashboard.html';
  }
  
  // If login/register page and user is authenticated, redirect to dashboard
  if ((currentPath.includes('login.html') || currentPath.includes('register.html')) && user) {
    // Check if there's a redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = 'dashboard.html';
    }
  }
});