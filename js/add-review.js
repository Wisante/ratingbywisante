fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json())
  .then(config => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    // El resto de tu código (db, auth, etc.)
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

    const professorName = document.getElementById("professorName").value;
    const courseName = document.getElementById("courseName").value;
    const campus = document.getElementById("campus").value;
    const faculty = document.getElementById("faculty").value;
    const rating = document.getElementById("rating").value;
    const comment = sanitizeInput(document.getElementById("comment").value);
    const professorId = generateProfessorId(professorName);

  const user = firebase.auth().currentUser;
  if (!user) return window.location.href = '/auth/login.html';

  // Verificar límite de 3 reseñas/día (usando función helper)
  const reviewsToday = await checkDailyLimit(user.uid);
  if (reviewsToday >= 3) {
    alert('Límite de 3 reseñas por día alcanzado');
    return;
  }

// En add-review.js
if (!professorName || professorName.length < 2 || professorName.length > 50) {
  alert("El nombre del profesor debe tener entre 2 y 50 caracteres");
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
        userId: user.uid,
        helpfulCount: 0, // Inicializar votos útiles
        reported: false // Por defecto no reportado
    })
    .then(() => {
        alert("¡Reseña enviada con éxito!");
        window.location.href = "reviews.html";
    })
    .catch((error) => {
        console.error("Error al enviar:", error);
        alert("Ocurrió un error. Intenta nuevamente.");
    });
});

// Función para verificar límite diario
async function checkDailyLimit(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const snapshot = await db.collection('reviews')
    .where('userId', '==', userId)
    .where('date', '>=', today)
    .get();

  return snapshot.size;
}

  })
  .catch(error => console.error("Error loading Firebase config:", error));