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
        loadUserReviewsAndStats(db, user.uid);
    });

    // Attach listeners that need auth and db
    setupEventListeners(auth, db);

}).catch(error => {
    console.error("Error initializing Firebase:", error);
    // Consider showing an error message on the page instead of redirecting
});

// Cargar reseñas y estadísticas del usuario
async function loadUserReviewsAndStats(db, userId) {
    try {
        const querySnapshot = await db.collection('reviews')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .get();

        if (querySnapshot.empty) {
            reviewsList.innerHTML = '<p class="no-reviews">No has publicado reseñas aún.</p>';
            reviewsCount.textContent = 0;
            helpfulVotes.textContent = 0;
            averageRating.textContent = 'N/A';
            return;
        }

        let totalRating = 0;
        let totalHelpful = 0;
        const allReviews = [];

        querySnapshot.forEach(doc => {
            const review = doc.data();
            allReviews.push(review);
            totalRating += review.rating;
            totalHelpful += review.helpfulCount || 0;
        });

        // Actualizar estadísticas globales
        reviewsCount.textContent = querySnapshot.size;
        averageRating.textContent = (totalRating / querySnapshot.size).toFixed(1);
        helpfulVotes.textContent = totalHelpful;

        // Mostrar solo las 5 más recientes
        const recentReviews = allReviews.slice(0, 5);
        reviewsList.innerHTML = ''; // Limpiar spinner
        recentReviews.forEach(review => {
            const reviewDate = review.date ? review.date.toDate().toLocaleDateString() : 'Fecha no disponible';
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

    } catch (error) {
        console.error("Error cargando reseñas:", error);
        reviewsList.innerHTML = '<p class="error-message">Error al cargar reseñas. Intenta nuevamente.</p>';
    }
}

function setupEventListeners(auth, db) {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditProfile = document.getElementById('closeEditProfile');
    const editProfileForm = document.getElementById('editProfileForm');

    // Abrir modal de editar perfil
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'flex';
            document.getElementById('newDisplayName').value = auth.currentUser.displayName || '';
        });
    }

    // Cerrar modal de editar perfil
    if (closeEditProfile) {
        closeEditProfile.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });
    }

    // Guardar cambios del perfil
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newDisplayName = document.getElementById('newDisplayName').value.trim();
            if (!newDisplayName) return alert('El nombre no puede estar vacío.');

            const user = auth.currentUser;
            const userDocRef = db.collection('users').doc(user.uid);

            try {
                // Actualizar en Firebase Auth y Firestore en paralelo
                await Promise.all([
                    user.updateProfile({ displayName: newDisplayName }),
                    userDocRef.update({ displayName: newDisplayName })
                ]);

                // Actualizar UI
                document.getElementById('userName').textContent = newDisplayName;
                alert('Perfil actualizado con éxito.');
                editProfileModal.style.display = 'none';
            } catch (error) {
                console.error("Error updating profile:", error);
                alert('Error al actualizar el perfil.');
            }
        });
    }


    // Cambiar contraseña
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                return alert('Debes iniciar sesión para cambiar tu contraseña.');
            }
            if (confirm('Se enviará un enlace para restablecer la contraseña a tu correo. ¿Deseas continuar?')) {
                try {
                    await auth.sendPasswordResetEmail(user.email);
                    alert(`Enlace enviado a ${user.email}. Revisa tu bandeja de entrada.`);
                } catch (error) {
                    console.error("Error sending password reset email:", error);
                    alert(`Error al enviar el correo: ${error.message}`);
                }
            }
        });
    }

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