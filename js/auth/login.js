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

const googleProvider = new firebase.auth.GoogleAuthProvider();

document.getElementById('googleLogin').addEventListener('click', () => {
    firebase.auth().signInWithPopup(googleProvider)
        .then((result) => {
            // Verificar dominio si es requerido
            if (result.user.email.endsWith('@unah.hn')) {
                window.location.href = '../index.html';
            } else {
                firebase.auth().signOut();
                alert('Solo correos @unah.hn permitidos');
            }
        })
        .catch((error) => {
            console.error("Error en Google Sign-In:", error);
            alert(error.message);
        });
});