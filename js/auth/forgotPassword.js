import { initializeFirebase } from './authConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase().then(({ auth }) => {
        const form = document.getElementById('forgotPasswordForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;

                if (!email.endsWith('@unah.hn')) {
                    return alert('Solo se permiten correos institucionales @unah.hn');
                }

                try {
                    await auth.sendPasswordResetEmail(email);
                    alert(`Enlace de restablecimiento enviado a ${email}. Revisa tu bandeja de entrada.`);
                } catch (error) {
                    console.error("Password reset error:", error);
                    alert(`Error: ${error.message}`);
                }
            });
        }
    }).catch(error => {
        console.error("Error initializing Firebase:", error);
        alert("Error de configuración. Por favor, recarga la página.");
    });
});