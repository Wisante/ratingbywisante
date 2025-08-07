document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener valores
    const displayName = document.getElementById('displayName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones
    if (!email.endsWith('@unah.hn')) {
        alert('Solo se permiten correos institucionales @unah.hn');
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
        // Crear usuario
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Actualizar perfil
        await userCredential.user.updateProfile({
            displayName: displayName
        });

        // Guardar datos adicionales en Firestore
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
            displayName: displayName,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'estudiante',
            avatarUrl: '../img/default-avatar.png'
        });

        // Enviar verificación por correo (opcional)
        await userCredential.user.sendEmailVerification();
        
        alert('¡Registro exitoso! Se ha enviado un correo de verificación.');
        window.location.href = 'profile.html';
    } catch (error) {
        console.error("Error en registro:", error);
        showAuthError(error);
    }
});

// Registro con Google
document.getElementById('googleRegister').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        
        // Verificar dominio UNAH
        if (!result.user.email.endsWith('@unah.hn')) {
            await firebase.auth().signOut();
            throw new Error('Solo correos @unah.hn permitidos');
        }

        // Guardar datos adicionales si es nuevo usuario
        if (result.additionalUserInfo.isNewUser) {
            await firebase.firestore().collection('users').doc(result.user.uid).set({
                displayName: result.user.displayName,
                email: result.user.email,
                avatarUrl: result.user.photoURL || '../img/default-avatar.png',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'estudiante'
            });
        }
        
        window.location.href = '../index.html';
    } catch (error) {
        showAuthError(error);
    }
});

// Mostrar errores amigables
function showAuthError(error) {
    const errorMessages = {
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email': 'Correo electrónico inválido',
        'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres',
        'auth/popup-closed-by-user': 'Cancelaste el registro con Google'
    };
    
    alert(errorMessages[error.code] || 'Error en el registro: ' + error.message);
}