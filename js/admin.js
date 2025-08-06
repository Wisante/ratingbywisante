fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json())
  .then(config => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

const deleteReview = async (reviewId) => {
  try {
    if (!confirm("¿Eliminar reseña?")) return;
    await db.collection("reviews").doc(reviewId).delete();
    loadReportedReviews();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error al eliminar. Revisa la consola.");
  }
};

const approveReview = async (reviewId) => {
  try {
    await db.collection("reviews").doc(reviewId).update({ reported: false });
    loadReportedReviews();
  } catch (error) {
    console.error("Error al aprobar:", error);
    alert("Error al aprobar. Revisa la consola.");
  }
};

// Login
document.getElementById("loginButton").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("loginForm").style.display = "none";
            document.getElementById("adminPanel").style.display = "block";
            loadReportedReviews();
        })
        .catch((error) => alert("Error: " + error.message));
});

// Cargar reseñas reportadas
function loadReportedReviews() {
    const container = document.getElementById("reportedReviews");
    container.innerHTML = "<p>Cargando reseñas reportadas...</p>";

    // Escuchar cambios en tiempo real
    db.collection("reviews")
        .where("reported", "==", true)
        .orderBy("reportedAt", "desc") // Ordenar por fecha de reporte
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
                
                // Agrega event listeners aquí
                reviewItem.querySelector('.delete-button').addEventListener('click', () => deleteReview(doc.id));
                reviewItem.querySelector('.approve-button').addEventListener('click', () => approveReview(doc.id));
                
                container.appendChild(reviewItem);
            });
        }, (error) => {
            console.error("Error al cargar reseñas:", error);
            container.innerHTML = "<p>Error al cargar reseñas reportadas.</p>";
        });
}

// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
    auth.signOut()
        .then(() => location.reload());
});

// Verificar autenticación al cargar
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadReportedReviews();
    }
});

  })
  .catch(error => console.error("Error loading Firebase config:", error));