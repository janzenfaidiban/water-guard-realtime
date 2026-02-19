// Simple Admin Authentication
const AUTH_KEY = 'waterguard_auth';

// Default admin credentials (change in production)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
}

// Protect page - redirect to login if not authenticated
function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // If already logged in, redirect to dashboard
        if (isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            
            // Validate credentials
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                window.location.href = 'index.html';
            } else {
                errorMsg.textContent = 'Username atau password salah!';
                errorMsg.classList.remove('hidden');
            }
        });
    }
});
