fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json())
  .then(config => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

window.deleteReview = async (reviewId) => {
  try {
    if (!confirm("¿Eliminar reseña?")) return;
    await db.collection("reviews").doc(reviewId).delete();
    loadReportedReviews();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error al eliminar. Revisa la consola.");
  }
};

window.approveReview = async (reviewId) => {
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
                const data = doc.data();
                container.innerHTML += `
                    <div class="review-item" data-id="${doc.id}">
                        <p><strong>${data.professor}</strong> - ${data.course}</p>
                        <p>${data.comment}</p>
                        <small>Reportado el: ${data.reportedAt?.toDate().toLocaleString() || "Fecha desconocida"}</small>
                        <button id="deleteButton" onclick="deleteReview('${doc.id}')">Eliminar</button>
                        <button id="approveButton" onclick="approveReview('${doc.id}')">Aprobar</button>
                    </div>
                `;
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