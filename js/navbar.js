/**
 * Renders the navbar HTML based on user and admin status.
 * @param {object|null} user - The Firebase user object, or null if logged out.
 * @param {boolean} isAdmin - True if the user is an admin.
 * @returns {string} - The HTML string for the navbar.
 */
export function renderNavbar(user, isAdmin) {
    const adminLink = isAdmin ? `<li><a href="/admin.html"><i class="fa-solid fa-screwdriver-wrench"></i> Moderación</a></li>` : '';

    let authSection;
    if (user) {
        // User is logged in, show Profile link
        authSection = `
            <ul class="navbar-menu auth-links">
                <li><a href="/auth/profile.html"><i class="fas fa-user"></i> Perfil</a></li>
            </ul>
        `;
    } else {
        // User is logged out, show Login button
        authSection = `
            <div id="auth-container">
                <a href="/auth/login.html" class="button" id="login-button">Iniciar Sesión</a>
            </div>
        `;
    }

    const navHTML = `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/index.html" class="navbar-logo">
                    <img src="/img/unahrate-logo.webp" loading="lazy" width="40" class="navbar-logo-img" alt="Unah Rate Logo">
                    <span>UnahRate</span>
                </a>

                <ul class="navbar-menu">
                    <li><a href="/index.html"><i class="fas fa-home"></i> Inicio</a></li>
                    <li><a href="/reviews.html"><i class="fa-solid fa-rectangle-list"></i> Reseñas</a></li>
                    <li><a href="/add-review.html"><i class="fas fa-user-edit"></i> Agregar Reseña</a></li>
                    ${adminLink}
                </ul>

                ${authSection}

                <button class="navbar-toggle" aria-label="Menú">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
        </nav>
    `;
    return navHTML;
}

/**
 * Attaches event listeners and sets the active link for the navbar.
 * This should be called after the navbar is rendered to the DOM.
 */
export function attachNavbarListeners() {
    const toggleButton = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (toggleButton && navbarMenu) {
        toggleButton.addEventListener('click', () => {
            // This logic is for mobile view to show/hide menu items
            const allMenus = document.querySelectorAll('.navbar-menu');
            allMenus.forEach(menu => menu.classList.toggle('active'));
        });
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-menu a').forEach(link => {
        // Handle cases where href might be /reviews.html or reviews.html
        const linkHref = link.getAttribute('href').replace(/^\//, '');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initial render on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        // Render a default (logged-out) navbar first to prevent layout shift
        placeholder.innerHTML = renderNavbar(null, false);
        attachNavbarListeners();
    }
});