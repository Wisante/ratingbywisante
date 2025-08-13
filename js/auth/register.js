// js/auth/register.js
import { initFirebase, auth, db, googleProvider } from './authConfig.js';

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
  // Registro con email/contraseña
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const displayName = document.getElementById('displayName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones
    if (!email.endsWith('@unah.hn')) {
        alert('Solo correos @unah.hn permitidos');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(userCredential.user.uid).set({
            displayName: displayName,
            email: email,
            photoURL: '../img/default-avatar.png',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'user',
            reviewsCount: 0
      });
      alert('¡Registro exitoso!');
      window.location.href = 'profile.html';
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message);
    }
  });

  // Registro con Google
  document.getElementById('googleRegister').addEventListener('click', async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      if (!result.user.email.endsWith('@unah.hn')) {
        await auth.signOut();
        throw new Error('Solo correos @unah.hn permitidos');
      }

        // Verificar si es nuevo usuario
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(result.user.uid).set({
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user',
                reviewsCount: 0
            });
        }

      window.location.href = '../index.html';
    } catch (error) {
      console.error("Google registration error:", error);
      alert(error.message);
    }
  });
}