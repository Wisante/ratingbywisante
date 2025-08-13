// js/auth/authCheck.js
import { initFirebase, auth } from './authConfig.js';

// Inicializamos Firebase y verificamos autenticación
async function checkAuth() {
  try {
    await initFirebase();
    
    auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = '/auth/login.html';
      }
    });
  } catch (error) {
    console.error("Authentication check failed:", error);
    window.location.href = 'login.html';
  }
}

// Ejecutamos la verificación
checkAuth();