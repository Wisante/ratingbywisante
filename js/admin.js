const firebaseConfig = {
    apiKey: "AIzaSyB6OcysAu9gywwtdQgwh0jABjXGV1lUKis",
    authDomain: "unahrate.firebaseapp.com",
    projectId: "unah-rate",
    storageBucket: "unahrate.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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

// Funciones de moderación
function deleteReview(id) {
    db.collection("reviews").doc(id).delete()
        .then(() => loadReportedReviews());
}

function approveReview(id) {
    db.collection("reviews").doc(id).update({ reported: false })
        .then(() => loadReportedReviews());
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