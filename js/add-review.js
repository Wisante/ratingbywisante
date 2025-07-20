// Configuración de Firebase (reemplaza con tus datos)
const firebaseConfig = {
    apiKey: "AIzaSyB6OcysAu9gywwtdQgwh0jABjXGV1lUKis",
    authDomain: "unahrate.firebaseapp.com",
    projectId: "unah-rate",
    storageBucket: "unahrate.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function generateProfessorId(name) {
    return name.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina acentos
              .replace(/\s+/g, "-") // Reemplaza espacios con guiones
              .replace(/[^\w-]/g, ""); // Elimina caracteres especiales
}

// Enviar reseña
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
    e.preventDefault();

        // Verificar límite diario (con await)
        const today = new Date().toISOString().split('T')[0];
        const userReviews = await db.collection("reviews")
            .where("userId", "==", user.uid)
            .where("date", ">=", today)
            .get();

        if (userReviews.size >= 3) {
            alert("Has alcanzado el límite diario de reseñas");
            return;
        }

    const professorName = document.getElementById("professorName").value;
    const courseName = document.getElementById("courseName").value;
    const campus = document.getElementById("campus").value;
    const faculty = document.getElementById("faculty").value;
    const rating = document.getElementById("rating").value;
    const comment = sanitizeInput(document.getElementById("comment").value);
    const professorId = generateProfessorId(professorName);

// En add-review.js
if (professorName.length < 2 || professorName.length > 50) {
  alert("Nombre de profesor inválido");
  return;
}

    db.collection("reviews").add({
        professor: professorName,
        professorId: professorId, // Campo nuevo para agrupar reseñas
        faculty: faculty,
        course: courseName,
        campus: campus,
        rating: parseInt(rating),
        comment: comment,
        date: new Date(),
        helpfulCount: 0, // Inicializar votos útiles
        reported: false // Por defecto no reportado
    })
    .then(() => {
        alert("¡Reseña enviada con éxito!");
        window.location.href = "index.html";
    })
    .catch((error) => {
        console.error("Error al enviar:", error);
        alert("Ocurrió un error. Intenta nuevamente.");
    });
});