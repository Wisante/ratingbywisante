import { initializeFirebase } from './authConfig.js';
import { renderNavbar, attachNavbarListeners } from '../navbar.js';
import { checkAdminStatus } from '../utils.js';

// This function will be called whenever the auth state changes.
async function updateNavbarForAuthState(user) {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) {
        // No navbar on this page, so do nothing.
        return;
    }

    let isAdmin = false;
    if (user) {
        isAdmin = await checkAdminStatus(user.email);
    }

    // Render the new navbar HTML
    placeholder.innerHTML = renderNavbar(user, isAdmin);

    // Re-initialize listeners and active link logic for the new navbar
    attachNavbarListeners();
}

// Initialize Firebase and then listen for auth changes
initializeFirebase()
    .then(({ auth }) => {
        auth.onAuthStateChanged(updateNavbarForAuthState);
    })
    .catch(error => {
        console.error("Failed to initialize Firebase for auth manager.", error);
    });
