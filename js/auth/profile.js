import { initFirebase, auth, db } from './authConfig.js';

// Elementos del DOM
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const memberSince = document.getElementById('memberSince');
const reviewsCount = document.getElementById('reviewsCount');
const helpfulVotes = document.getElementById('helpfulVotes');
const averageRating = document.getElementById('averageRating');
const reviewsList = document.getElementById('reviewsList');
const logoutBtn = document.getElementById('logoutBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const passwordModal = document.getElementById('changePasswordModal');
const closeModal = document.querySelector('.close-modal');
const passwordForm = document.getElementById('passwordForm');

// Cargar datos del usuario
initFirebase().then(() => {
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Datos básicos
    userEmail.textContent = user.email;
    
    // Obtener datos adicionales de Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Mostrar datos
        userName.textContent = userData.displayName || 'Usuario UNAH';
        userPhoto.src = userData.photoURL || '../img/default-avatar.png';
        
        // Formatear fecha de registro
        if (userData.createdAt) {
            const joinDate = userData.createdAt.toDate();
            memberSince.textContent = `Miembro desde ${joinDate.getFullYear()}`;
        }
        
        // Estadísticas
        reviewsCount.textContent = userData.reviewsCount || 0;
    }

    // Cargar reseñas del usuario
    loadUserReviews(user.uid);
});
}).catch(error => {
    console.error("Error initializing Firebase:", error);
    window.location.href = 'error.html'; // Redirige a página de error
});

// Cargar reseñas del usuario
async function loadUserReviews(userId) {
    try {
        const querySnapshot = await db.collection('reviews')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        reviewsList.innerHTML = ''; // Limpiar spinner
        
        if (querySnapshot.empty) {
            reviewsList.innerHTML = '<p class="no-reviews">No has publicado reseñas aún.</p>';
            return;
        }

        // Calcular promedio de ratings
        let totalRating = 0;
        let totalHelpful = 0;

        querySnapshot.forEach(doc => {
            const review = doc.data();
            totalRating += review.rating;
            totalHelpful += review.helpfulCount || 0;

            const reviewDate = review.createdAt.toDate().toLocaleDateString();
            
            reviewsList.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-professor">${review.professor}</span>
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p class="review-comment">${review.comment}</p>
                    <div class="review-footer">
                        <span class="review-course">${review.course}</span>
                        <span class="review-date">${reviewDate}</span>
                    </div>
                </div>
            `;
        });

        // Actualizar estadísticas
        averageRating.textContent = (totalRating / querySnapshot.size).toFixed(1);
        helpfulVotes.textContent = totalHelpful;
        
    } catch (error) {
        console.error("Error cargando reseñas:", error);
        reviewsList.innerHTML = '<p class="error-message">Error al cargar reseñas. Intenta nuevamente.</p>';
    }
}

// Cambiar contraseña
changePasswordBtn.addEventListener('click', () => {
    passwordModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validaciones
    if (newPassword !== confirmNewPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (newPassword.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            currentPassword
        );
        
        // Reautenticar
        await user.reauthenticateWithCredential(credential);
        
        // Cambiar contraseña
        await user.updatePassword(newPassword);
        
        alert('¡Contraseña actualizada con éxito!');
        passwordModal.style.display = 'none';
        passwordForm.reset();
        
    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        alert(error.message);
    }
});

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
        passwordModal.style.display = 'none';
    }
});