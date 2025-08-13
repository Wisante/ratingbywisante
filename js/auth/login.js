// js/auth/login.js
import { initFirebase, auth, googleProvider } from './authConfig.js';

// Inicializamos Firebase al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initFirebase();
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    alert("Error al inicializar la aplicación. Por favor recarga la página.");
  }
});

function setupEventListeners() {
  // Login con email/contraseña
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
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

  // Login con Google
  document.getElementById('googleLogin').addEventListener('click', async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      if (!result.user.email.endsWith('@unah.hn')) {
        await auth.signOut();
        throw new Error('Solo correos @unah.hn permitidos');
      }
      window.location.href = '../index.html';
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  });
}