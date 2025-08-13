import { initializeFirebase } from './authConfig.js';

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
initializeFirebase().then(({ auth, db }) => {
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
        loadUserReviews(db, user.uid);
    });

    // Attach listeners that need auth and db
    setupEventListeners(auth, db);

}).catch(error => {
    console.error("Error initializing Firebase:", error);
    // Consider showing an error message on the page instead of redirecting
});

// Cargar reseñas del usuario
async function loadUserReviews(db, userId) {
    try {
        const querySnapshot = await db.collection('reviews')
            .where('userId', '==', userId)
            .orderBy('date', 'desc') // Assuming 'date' field exists from review creation
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

function setupEventListeners(auth, db) {
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

        if (newPassword !== confirmNewPassword) {
            return alert('Las contraseñas no coinciden');
        }
        if (newPassword.length < 8) {
            return alert('La contraseña debe tener al menos 8 caracteres');
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user is signed in.");

            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await user.reauthenticateWithCredential(credential);
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
}