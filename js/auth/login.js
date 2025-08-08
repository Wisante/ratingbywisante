import { auth } from '../../auth/authConfig.js';
import { GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        
        // Verificar dominio UNAH
        if (!email.endsWith('@unah.hn')) {
            await auth.signOut();
            throw new Error('Solo correos @unah.hn permitidos');
        }

        window.location.href = '../index.html';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

const provider = new GoogleAuthProvider();

document.getElementById('googleLogin').addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then(() => window.location.href = '/profile.html')
    .catch(error => console.error("Google Sign-In Error:", error));
});