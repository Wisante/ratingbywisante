import { initializeFirebase } from './auth/authConfig.js';
import { sanitizeInput } from '../utils.js';

initializeFirebase().then(({ auth, db }) => {

    function generateProfessorId(name) {
    return name.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina acentos
              .replace(/\s+/g, "-") // Reemplaza espacios con guiones
              .replace(/[^\w-]/g, ""); // Elimina caracteres especiales
}

// Enviar reseña
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return window.location.href = '/auth/login.html';

    const professorName = sanitizeInput(document.getElementById("professorName").value);
    const courseName = sanitizeInput(document.getElementById("courseName").value);
    const campus = document.getElementById("campus").value;
    const faculty = document.getElementById("faculty").value;
    const rating = parseInt(document.getElementById("rating").value);
    const comment = sanitizeInput(document.getElementById("comment").value);

  // Verificar límite de 3 reseñas/día (usando función helper)
  const reviewsToday = await checkDailyLimit(db, user.uid);
  if (reviewsToday >= 3) {
    alert('Límite de 3 reseñas por día alcanzado');
    return;
  }

// En add-review.js
if (!professorName || professorName.length < 2 || professorName.length > 50) {
  alert("El nombre del profesor debe tener entre 2 y 50 caracteres");
  return;
}

    try {
        // Generar ID único para el profesor
        const professorId = generateProfessorId(professorName);
        
        // Crear la reseña
        await db.collection("reviews").add({
            professor: professorName,
            professor_lowercase: professorName.toLowerCase(), // Campo para búsquedas
            votedBy: [], // Array para registrar votos
            professorId: professorId,
            faculty: faculty,
            course: courseName,
            campus: campus,
            rating: rating,
            comment: comment,
            userId: user.uid,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            helpfulCount: 0,
            reported: false
        });
        
        alert("¡Reseña enviada con éxito!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error al enviar:", error);
        alert(`Error: ${error.message}`);
    }
});

// Función para verificar límite diario
async function checkDailyLimit(db, userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const snapshot = await db.collection('reviews')
    .where('userId', '==', userId)
    .where('date', '>=', today)
    .get();

  return snapshot.size;
}

}).catch(error => {
    console.error("Failed to initialize Firebase for add-review page.", error);
});