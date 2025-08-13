import { initializeFirebase } from './auth/authConfig.js';
import { checkAdminStatus } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("loginForm");
    const adminPanel = document.getElementById("adminPanel");
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'admin-loading';
    loadingContainer.innerHTML = '<h2>Verificando permisos...</h2>';

    // Hide main content and show loading
    if(adminPanel) adminPanel.style.display = 'none';
    if(loginForm) loginForm.style.display = 'none';
    document.body.appendChild(loadingContainer);

    initializeFirebase().then(({ auth, db }) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                // Not logged in, show login form
                loadingContainer.remove();
                if(loginForm) loginForm.style.display = 'block';

                const loginButton = document.getElementById("loginButton");
                if (loginButton) {
                    loginButton.addEventListener("click", () => {
                        const email = document.getElementById("email").value;
                        const password = document.getElementById("password").value;
                        auth.signInWithEmailAndPassword(email, password)
                            .catch((error) => alert("Error: " + error.message));
                    });
                }
                return;
            }

            const isAdmin = await checkAdminStatus(user.email);

            if (!isAdmin) {
                loadingContainer.remove();
                alert('Acceso denegado: No tienes permisos de administrador');
                window.location.href = '/index.html';
                return;
            }

            // Is admin, show admin panel
            loadingContainer.remove();
            if(adminPanel) adminPanel.style.display = 'block';
            loadAdminContent(auth, db);
        });
    }).catch(error => {
        loadingContainer.innerHTML = `<h2>Error de configuración</h2><p>No se pudo cargar la configuración de Firebase.</p>`;
        console.error("Error initializing Firebase:", error);
    });
});

function loadAdminContent(auth, db) {
    const logoutButton = document.getElementById("logoutButton");
    if(logoutButton) {
        logoutButton.addEventListener("click", () => {
            auth.signOut().then(() => location.reload());
        });
    }

    const container = document.getElementById("reportedReviews");
    if (!container) return;
    container.innerHTML = "<p>Cargando reseñas reportadas...</p>";

    db.collection("reviews")
        .where("reported", "==", true)
        .orderBy("reportedAt", "desc")
        .onSnapshot((querySnapshot) => {
            container.innerHTML = "";
            if (querySnapshot.empty) {
                container.innerHTML = "<p>No hay reseñas reportadas.</p>";
                return;
            }
            querySnapshot.forEach((doc) => {
                const reviewItem = document.createElement("div");
                reviewItem.className = "review-item";
                reviewItem.dataset.id = doc.id;
                reviewItem.innerHTML = `
                    <p><strong>${doc.data().professor}</strong> - ${doc.data().course}</p>
                    <p>${doc.data().comment}</p>
                    <small>Reportado el: ${doc.data().reportedAt?.toDate().toLocaleString() || "Fecha desconocida"}</small>
                    <button class="delete-button">Eliminar</button>
                    <button class="approve-button">Aprobar</button>
                `;
                reviewItem.querySelector('.delete-button').addEventListener('click', () => deleteReview(db, doc.id));
                reviewItem.querySelector('.approve-button').addEventListener('click', () => approveReview(db, doc.id));
                container.appendChild(reviewItem);
            });
        }, (error) => {
            console.error("Error al cargar reseñas:", error);
            container.innerHTML = "<p>Error al cargar reseñas reportadas.</p>";
        });
}

async function deleteReview(db, reviewId) {
    try {
        if (!confirm("¿Eliminar reseña?")) return;
        await db.collection("reviews").doc(reviewId).delete();
        // The onSnapshot listener will auto-update the UI, no need to call loadReportedReviews
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar. Revisa la consola.");
    }
}

async function approveReview(db, reviewId) {
    try {
        await db.collection("reviews").doc(reviewId).update({ reported: false });
        // The onSnapshot listener will auto-update the UI
    } catch (error) {
        console.error("Error al aprobar:", error);
        alert("Error al aprobar. Revisa la consola.");
    }
}