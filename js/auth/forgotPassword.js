import { auth } from '../../auth/authConfig.js';

document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (!email.endsWith('@unah.hn')) {
        alert('Solo correos @unah.hn permitidos');
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        alert(`Enlace enviado a ${email}. Revisa tu bandeja de entrada.`);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});