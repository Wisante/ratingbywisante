import { initFirebase, auth } from './authConfig.js';

// Inicializa Firebase primero
initFirebase().then(() => {
  
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
}).catch(error => {
  console.error("Error al inicializar Firebase:", error);
  alert("Error de configuración. Por favor recarga la página.");
});