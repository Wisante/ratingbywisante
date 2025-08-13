import { initializeFirebase } from './authConfig.js';

/**
 * Checks if a user is authenticated. If not, redirects to the login page.
 * This script is intended for pages that require a user to be logged in.
 */
function authGuard() {
    initializeFirebase().then(({ auth }) => {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                // User is not logged in, redirect to login page.
                // Use absolute path for robustness.
                console.log("User not authenticated, redirecting to login.");
                window.location.href = '/auth/login.html';
            }
            // If user is logged in, do nothing. The page can load.
        });
    }).catch(error => {
        console.error("Auth guard initialization failed:", error);
        // If Firebase fails, redirect to login as a fallback.
        window.location.href = '/auth/login.html';
    });
}

// Run the authentication guard
authGuard();