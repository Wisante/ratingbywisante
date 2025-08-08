import { auth, db } from '../../auth/authConfig.js';

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userEmail').textContent = user.email;
    
    // Cargar reseñas del usuario
    db.collection('reviews')
      .where('userId', '==', user.uid)
      .get()
      .then((querySnapshot) => {
          const reviewsContainer = document.getElementById('myReviews');
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              reviewsContainer.innerHTML += `
                  <div class="review">
                      <p>${data.professor} - ${data.rating}★</p>
                      <p>${data.comment}</p>
                  </div>
              `;
          });
      });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});