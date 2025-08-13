import { initializeFirebase } from './authConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase().then(({ auth, googleProvider }) => {
        setupEventListeners(auth, googleProvider);
    }).catch(error => {
        console.error("Initialization error:", error);
        alert("Error al inicializar la aplicación. Por favor recarga la página.");
    });
});

function setupEventListeners(auth, googleProvider) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                await auth.signInWithEmailAndPassword(email, password);
                window.location.href = '../index.html';
            } catch (error) {
                console.error("Login error:", error);
                alert(error.message);
            }
        });
    }

    const googleLogin = document.getElementById('googleLogin');
    if (googleLogin) {
        googleLogin.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithPopup(googleProvider);
                // The check for @unah.hn should ideally be in a security rule or backend if possible
                if (!result.user.email.endsWith('@unah.hn')) {
                    await auth.signOut();
                    throw new Error('Solo se permiten correos institucionales @unah.hn');
                }
                window.location.href = '../index.html';
            } catch (error) {
                console.error("Google sign-in error:", error);
                alert(error.message);
            }
        });
    }
}