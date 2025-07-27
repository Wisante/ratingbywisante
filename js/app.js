document.getElementById("searchCampusButton").addEventListener("click", () => {
  const campus = document.getElementById("campusSelect").value;
  window.location.href = `reviews.html?campus=${encodeURIComponent(campus)}`;
});

document.addEventListener('click', (e) => {
  const card = e.target.closest('[data-nav-link]');
  if (card) {
    window.location.href = card.dataset.navLink;
  }
});