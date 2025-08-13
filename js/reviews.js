fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json())
  .then(config => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    
    const db = firebase.firestore();

async function voteHelpful(reviewId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = '/auth/login.html';
        return;
    }

    const reviewRef = db.collection('reviews').doc(reviewId);

    try {
        await db.runTransaction(async (transaction) => {
            const reviewDoc = await transaction.get(reviewRef);
            if (!reviewDoc.exists) {
                throw new Error("La reseña no existe.");
            }

            const data = reviewDoc.data();

            // Verificar si el usuario ya votó
            if (data.votedBy && data.votedBy.includes(user.uid)) {
                throw new Error('Ya votaste esta reseña.');
            }

            // Actualizar el contador y el array de votantes
            transaction.update(reviewRef, {
                helpfulCount: firebase.firestore.FieldValue.increment(1),
                votedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
            });
        });

        // Actualizar UI optimisticamente
        const button = document.querySelector(`.card-button[data-review-id="${reviewId}"]`);
        if (button) {
            const count = (parseInt(button.textContent.match(/\d+/)[0] || 0, 10)) + 1;
            button.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> Útil (${count})`;
            button.disabled = true; // Deshabilitar para evitar doble voto
        }
    } catch (error) {
        console.error("Error al votar:", error);
        // No mostrar la alerta si el usuario ya votó, es un estado esperado
        if (error.message !== 'Ya votaste esta reseña.') {
            alert(`Error: ${error.message}`);
        }
    }
}

async function reportReview(reviewId) {
    const user = firebase.auth().currentUser;
    if (!user) return window.location.href = '/auth/login.html';

    const reason = prompt("Motivo del reporte (Spam, Inapropiado, etc):");
    if (!reason) return;

    try {
        // Crear reporte
        await db.collection('reports').add({
            reviewId: reviewId,
            userId: user.uid,
            reason: reason,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Opcional: Marcar reseña como reportada
        await db.collection('reviews').doc(reviewId).update({
            reported: true,
            reportedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Reporte enviado. ¡Gracias!');
    } catch (error) {
        console.error("Error al reportar:", error);
        alert(`Error: ${error.message}`);
    }
}

// Obtener parámetro de URL (ej: reviews.html?campus=Tegucigalpa)
const urlParams = new URLSearchParams(window.location.search);
const searchProfessor = urlParams.get('professor')?.toLowerCase() || '';
const searchCampus = urlParams.get('campus') || '';

// Mostrar título contextual
document.getElementById("pageTitle").textContent = 
    searchCampus ? `Reseñas - Campus ${searchCampus}` : "Todas las Reseñas";

// Cargar reseñas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
});

// Cargar reseñas filtradas
async function loadReviews() {
    const container = document.getElementById("reviewsList");
    container.innerHTML = `<p>Cargando reseñas...</p>`;

    let query = db.collection("reviews");

    // Aplicar filtros de búsqueda
    if (searchProfessor) {
        query = query.where('professor_lowercase', '>=', searchProfessor)
                     .where('professor_lowercase', '<=', searchProfessor + '\uf8ff')
                     .orderBy('professor_lowercase', 'asc'); // Necesario para el filtro de rango
    }

    if (searchCampus) {
        query = query.where("campus", "==", searchCampus);
    }

    // Ordenar por fecha si no hay búsqueda por profesor
    if (!searchProfessor) {
        query = query.orderBy("date", "desc");
    }

    try {
        const querySnapshot = await query.get();
        displayReviews(querySnapshot.docs);
    } catch (error) {
        console.error("Error al cargar reseñas:", error);
        container.innerHTML = `
            <div class="error">
                <p>Error al cargar reseñas</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Nueva función para mostrar resultados
function displayReviews(reviews) {
  const container = document.getElementById("reviewsList");
  
  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>No se encontraron reseñas</p>
        ${searchProfessor ? `<p>para el profesor: <strong>${searchProfessor}</strong></p>` : ''}
        ${searchCampus ? `<p>en el campus: <strong>${searchCampus}</strong></p>` : ''}
      </div>
    `;
    return;
  }

  const reviewsHTML = reviews.map(doc => renderReviewCard(doc.id, doc.data())).join('');
  container.innerHTML = `<div class="reviews-grid">${reviewsHTML}</div>`;
}

function renderReviewCard(reviewId, data) {
    const reviewDate = data.date ? data.date.toDate().toLocaleDateString() : 'Fecha no disponible';
    const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);

    return `
        <div class="review-card">
            <div class="review-content">
                <h4>${data.professor} <small>(${data.faculty} • ${data.campus}) - ${reviewDate}</small></h4>
                <p><strong>${data.course}</strong> | <span class="stars">${stars}</span></p>
                <p>${data.comment}</p>
            </div>
            <div class="vote-buttons">
                <button class="card-button" data-review-id="${reviewId}">
                    <i class="fa-regular fa-thumbs-up"></i> Útil (${data.helpfulCount || 0})
                </button>
                <button class="card-report" data-review-id="${reviewId}">
                    <i class="fa-regular fa-flag"></i> Reportar
                </button>
            </div>
        </div>
    `;
}

let currentProfessors = [];

function displayProfessorsList(professors) {
    const container = document.getElementById("reviewsList");
    const professorName = document.getElementById("professorSearch").value.trim().toLowerCase();

    if (professors.length === 0) {
        container.innerHTML = `
        <div class="no-results">
        <p>No se encontraron profesores con el nombre <b>"${professorName}"</b></p>
        <p>Intenta con un nombre más general o verifica la ortografía.</p>
        <div class="no-results-background">
        <p>Si el profesor no está registrado, puedes agregar una reseña con su nombre para que aparezca en la lista.</p>
        <button data-action="add-review">Agregar Reseña</button>
        </div>
        </div>
        `;
        return;
    }

    const professorsHTML = professors.map(prof => renderProfessorListItem(prof)).join('');
    container.innerHTML = `
        <h2>Profesores encontrados</h2>
        <div class="professors-list">
            ${professorsHTML}
        </div>
    `;
}

function renderProfessorListItem(prof) {
    const averageRating = (prof.totalRating / prof.reviews.length).toFixed(1);
    const stars = "★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating));

    return `
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
    `;
}

function renderProfessorProfileHeader(professor) {
    const campus = professor.reviews[0]?.campus || "No especificado";
    return `
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
    `;
}

// Función para mostrar perfil de profesor con sus reseñas
function displayProfessorProfile(professor) {
    const container = document.getElementById("reviewsList");
    const headerHTML = renderProfessorProfileHeader(professor);
    const reviewsHTML = professor.reviews.map(review => renderReviewCard(review.id, review)).join('');

    container.innerHTML = `
        ${headerHTML}
        <div class="reviews-grid">
            ${reviewsHTML}
        </div>
    `;
}

// Modificar la función de búsqueda
document.getElementById("searchButton").addEventListener("click", async () => {
    const professorName = document.getElementById("professorSearch").value.trim().toLowerCase();
    const faculty = document.getElementById("facultySearch").value;

    let query = db.collection("reviews");

    if (professorName) {
        query = query.where('professor_lowercase', '>=', professorName)
                     .where('professor_lowercase', '<=', professorName + '\uf8ff')
                     .orderBy('professor_lowercase');
    }
    if (faculty) {
        query = query.where("faculty", "==", faculty);
    }

    // Si no hay filtros, no ejecutar una consulta vacía (o decidir un comportamiento)
    if (!professorName && !faculty) {
        // Podrías cargar las reseñas más recientes o mostrar un mensaje
        loadReviews(); // Carga por defecto
        return;
    }

    let professorsMap = new Map();

    try {
        const snapshot = await query.get();

        // Procesar resultados
        snapshot.docs.forEach(doc => {
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
    } catch (error) {
        console.error("Error al buscar reseñas:", error);
        alert("Ocurrió un error al realizar la búsqueda.");
    }

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
  const target = e.target;

  // Manejar clics en los botones de acción
  const actionButton = target.closest('[data-action]') || target.closest('.card-button') || target.closest('.card-report') || target.closest('.view-button');
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const reviewId = actionButton.closest('.review-card')?.dataset.reviewId || actionButton.dataset.reviewId;
  const professorId = actionButton.closest('.professor-item')?.dataset.id;

  if (action === 'add-review') {
    window.location.href = 'add-review.html';
  } else if (actionButton.matches('.card-button') && reviewId) {
    voteHelpful(reviewId, true);
  } else if (actionButton.matches('.card-report') && reviewId) {
    reportReview(reviewId);
  } else if (actionButton.matches('.view-button') && professorId) {
    const professor = currentProfessors.find(p => p.id === professorId);
    if (professor) {
        displayProfessorProfile(professor);
    }
  } else if (action === 'back') {
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