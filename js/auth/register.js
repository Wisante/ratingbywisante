import { initializeFirebase } from './authConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase().then(({ auth, db, googleProvider }) => {
        setupEventListeners(auth, db, googleProvider);
    }).catch(error => {
        console.error("Initialization error:", error);
        alert("Error al inicializar la aplicación. Por favor recarga la página.");
    });
});

function setupEventListeners(auth, db, googleProvider) {
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const displayName = document.getElementById('displayName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!email.endsWith('@unah.hn')) {
                return alert('Solo se permiten correos institucionales @unah.hn');
            }
            if (password !== confirmPassword) {
                return alert('Las contraseñas no coinciden');
            }
            if (password.length < 8) {
                return alert('La contraseña debe tener al menos 8 caracteres');
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
    }

    const googleRegister = document.getElementById('googleRegister');
    if (googleRegister) {
        googleRegister.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithPopup(googleProvider);
                if (!result.user.email.endsWith('@unah.hn')) {
                    await auth.signOut();
                    throw new Error('Solo se permiten correos institucionales @unah.hn');
                }

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
}