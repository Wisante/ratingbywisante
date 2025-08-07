document.getElementById("searchButton").addEventListener("click", () => {
  const professor = document.getElementById("searchInput").value.trim();
  const campus = document.getElementById("campusSelect").value;
  
  // Construye la URL con parámetros
  let url = 'reviews.html';
  if (professor || campus) {
    url += '?';
    if (professor) url += `professor=${encodeURIComponent(professor)}`;
    if (professor && campus) url += '&';
    if (campus) url += `campus=${encodeURIComponent(campus)}`;
  }
  
  window.location.href = url;
});

document.addEventListener('click', (e) => {
  const card = e.target.closest('[data-nav-link]');
  if (card) {
    window.location.href = card.dataset.navLink;
  }
});