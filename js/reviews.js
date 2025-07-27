fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json())
  .then(config => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    
    const db = firebase.firestore();

// En tu archivo reviews.js (al inicio)
const voteHelpful = function(reviewId, isHelpful) {
  const userId = localStorage.getItem("userId") || generateUserId();
  const votedReviews = JSON.parse(localStorage.getItem("votedReviews") || "[]");
  
  if (votedReviews.includes(reviewId)) {
    alert("Ya votaste esta reseña");
    return;
  }

  db.collection("reviews").doc(reviewId).update({
    helpfulCount: firebase.firestore.FieldValue.increment(1)
  }).then(() => {
    votedReviews.push(reviewId);
    localStorage.setItem("votedReviews", JSON.stringify(votedReviews));
    loadReviews();
  }).catch(error => console.error("Error al votar:", error));
};

const reportReview = function(reviewId) {
  if (confirm("¿Reportar esta reseña?")) {
    db.collection("reviews").doc(reviewId).update({
      reported: true,
      reportedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => alert("Reseña reportada"));
  }
};

// Obtener parámetro de URL (ej: reviews.html?campus=Tegucigalpa)
const urlParams = new URLSearchParams(window.location.search);
const campus = urlParams.get('campus');

// Mostrar título contextual
document.getElementById("pageTitle").textContent = 
    campus ? `Reseñas - Campus ${campus}` : "Todas las Reseñas";

// Cargar reseñas filtradas
function loadReviews() {
    const container = document.getElementById("reviewsList");
    container.innerHTML = `<p>Cargando reseñas...</p>`;

    // Consulta todas las reseñas ordenadas por fecha
    db.collection("reviews")
        .orderBy("date", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerHTML = "<p>No hay reseñas disponibles.</p>";
                return;
            }

            // Agrupar por profesor (opcional, si quieres mantener la estructura)
            const professorsMap = new Map();
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const professorKey = data.professorId || data.professor.toLowerCase();
                
                if (!professorsMap.has(professorKey)) {
                    professorsMap.set(professorKey, {
                        name: data.professor,
                        faculty: data.faculty,
                        reviews: [],
                        totalRating: 0
                    });
                }
                const professor = professorsMap.get(professorKey);
                professor.reviews.push(data);
                professor.totalRating += data.rating;
            });

            // Mostrar todas las reseñas en grid (sin agrupar por profesor)
            container.innerHTML = `
                <div class="reviews-grid">
                    ${querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        const reviewId = doc.id;
                        return `
                            <div class="review-card">
                            <div class="review-content">
                                <h4>${data.professor} <small>(${data.faculty} • ${data.campus}) - ${data.date.toDate().toLocaleDateString()}</small></h4>
                                <p><strong>${data.course}</strong> | <span class="stars">${"★".repeat(data.rating)}</span>${"☆".repeat(5 - data.rating)}</p>
                                <p>${data.comment}</p>
                            </div>
                                <div class="vote-buttons">
                                    <button class="card-button" data-review-id="${reviewId}">
                                        👍 Útil (${data.helpfulCount || 0})
                                    </button>
                                    <button class="card-report" data-review-id="${reviewId}">
                                        ⚠️ Reportar
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;
        })
        .catch((error) => {
            console.error("Error al cargar reseñas:", error);
            container.innerHTML = `<p class="error">Error al cargar reseñas: ${error.message}</p>`;
        });
}

let currentProfessors = [];

// Función para mostrar lista de profesores
function displayProfessorsList(professors) {
    const container = document.getElementById("reviewsList");
    const professorName = document.getElementById("professorSearch").value.trim().toLowerCase();
    container.innerHTML = `
        <h2>Profesores encontrados</h2>
        <div class="professors-list">
            ${professors.map(prof => {
            const averageRating = (prof.totalRating / prof.reviews.length).toFixed(1);
            const stars = "★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating));
                
            return`
                <div class="professor-item" data-id="${prof.id}">
                    <div class="professor-header">
                        <h3>${prof.name}</h3>
                        <div class="average-rating">
                            <span class="stars">${stars}</span>
                            <span class="score">${averageRating}/5 (${prof.reviews.length})</span>
                        </div>
                    </div>
                    <p>Facultad: ${prof.faculty}</p>
                    <div class="professor-meta">
                        <span>${prof.reviews.length} reseñas</span>
                    </div>
                    <button class="view-button">Ver reseñas</button>
                </div>
            `}).join('')}
        </div>
    `;

        if (professors.length === 0) {
        container.innerHTML = `
        <div class="no-results">
        <p>No se encontraron profesores con el nombre <b>"${professorName}"</b></p>
        <p>Intenta con un nombre más general o verifica la ortografía.</p>
        <div class="no-results-background">
        <p>Si el profesor no está registrado, puedes agregar una reseña con su nombre para que aparezca en la lista.</p>
        <button onclick="window.location.href='add-review.html'">Agregar Reseña</button>
        </div>
        </div>
        `;
        return;
    }

    // Agregar event listeners a los botones
    document.querySelectorAll('.professor-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-button')) return;
            const professorId = item.getAttribute('data-id');
            const professor = currentProfessors.find(p => p.id === professorId);
            displayProfessorProfile(professor);
        });
    });
}

// Función para mostrar perfil de profesor con sus reseñas
function displayProfessorProfile(professor) {
    const container = document.getElementById("reviewsList");
    const campus = professor.reviews[0].campus || "Tegucigalpa"; // Asumir campus del primer review
    container.innerHTML = `
    <button class="back-button" data-action="back">← Volver</button>
        <div class="professor-profile-header">
            <h2>${professor.name}</h2>
            <p>Profesor de la facultad de <span class="faculty-badge">${professor.faculty}</span> en el campus de <span class="faculty-badge">${campus}</span></p>
            <div class="professor-stats">
                <div class="stat">
                    <span class="value">${professor.reviews.length}</span>
                    <span class="label">Reseñas</span>
                </div>
                <div class="stat">
                    <span class="value">${professor.averageRating}</span>
                    <span class="label">Promedio</span>
                </div>
            </div>
        </div>
                    <div class="reviews-grid">
                        ${professor.reviews.map(review => `
                            <div class="review-card">
                            <div class="review-content">
                            <small><strong>${professor.faculty} • ${review.campus} - ${review.date.toDate().toLocaleDateString()}</strong></small>
                                <p><strong>${review.course}</strong> | <span class="stars">${"★".repeat(review.rating)}</span>${"☆".repeat(5 - review.rating)}</p>
                                <p><span>${review.userId || "Anónimo"}</span> opina esto:</p>
                                <p>${review.comment}</p>
                            </div>

                                <div class="vote-buttons">
                                    <button class="card-button" onclick="voteHelpful('${review.id}', true)">
                                        👍 Útil (${review.helpfulCount || 0})
                                    </button>
                                    <button class="card-report" onclick="reportReview('${review.id}')">
                                        ⚠️ Reportar
                                    </button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
    `;
}

// Modificar la función de búsqueda
document.getElementById("searchButton").addEventListener("click", async () => {
    const professorName = document.getElementById("professorSearch").value.trim().toLowerCase();
    const faculty = document.getElementById("facultySearch").value;

    const snapshot = await db.collection("reviews").get();
    
    // Filtrado manual
    const filtered = snapshot.docs.filter(doc => {
        const data = doc.data();
        const matchesProfessor = data.professor.toLowerCase().includes(professorName);
        const matchesFaculty = faculty ? data.faculty === faculty : true;
        return matchesProfessor && matchesFaculty;
    });

    // Procesar resultados
    const professorsMap = new Map();
    filtered.forEach(doc => {
        const data = doc.data();
        const professorKey = data.professorId || data.professor.toLowerCase();
        
        if (!professorsMap.has(professorKey)) {
            professorsMap.set(professorKey, {
                id: professorKey,
                name: data.professor,
                faculty: data.faculty,
                reviews: [],
                totalRating: 0
            });
        }
        const professor = professorsMap.get(professorKey);
        professor.reviews.push({
            ...data,
            id: doc.id
        });
        professor.totalRating += data.rating;
    });

    // Calcular promedio para cada profesor
    currentProfessors = Array.from(professorsMap.values()).map(prof => ({
        ...prof,
        averageRating: (prof.totalRating / prof.reviews.length).toFixed(1)
    }));

    // Mostrar lista de profesores
    displayProfessorsList(currentProfessors);
});

// Generar ID único para usuario anónimo
function generateUserId() {
    const id = 'user-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", id);
    return id;
}

// Event delegation para votar y reportar
document.addEventListener('click', (e) => {
  // Para botones de votar/reportar
  const cardButton = e.target.closest('.card-button');
  const cardReport = e.target.closest('.card-report');
  
  if (cardButton) voteHelpful(cardButton.dataset.reviewId, true);
  if (cardReport) reportReview(cardReport.dataset.reviewId);

  // Para el botón de volver
  if (e.target.closest('.back-button')) {
    if (currentProfessors.length > 0) {
      displayProfessorsList(currentProfessors);
    } else {
      loadReviews();
    }
  }
});

// Iniciar carga
loadReviews();

  })
  .catch(error => console.error("Error loading Firebase config:", error));