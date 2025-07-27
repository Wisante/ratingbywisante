document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    toggleButton.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
    });
});

const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.navbar-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

document.querySelector('.navbar-toggle').addEventListener('click', () => {
  const menu = document.querySelector('.navbar-menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});