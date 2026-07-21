// Navigation simple via tout le div
document.querySelectorAll('.card-A').forEach(card => {
    card.style.cursor = 'pointer'; // montre que c'est cliquable
    card.addEventListener('click', () => {
        const link = card.dataset.link;
        if (link) {
            window.location.href = link;
        }
    });
});

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.nav-mobile-overlay');
    const closeBtn = document.querySelector('.nav-close-btn');
    const backdrop = document.querySelector('.nav-backdrop');

    function openMenu() {
        hamburger.classList.add('active');
        mobileNav.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    if (hamburger && mobileNav) {
        // Toggle menu with hamburger button
        hamburger.addEventListener('click', function () {
            if (mobileNav.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu with close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        // Close menu when clicking on backdrop
        if (backdrop) {
            backdrop.addEventListener('click', closeMenu);
        }

        // Close menu when clicking on a nav link
        const navLinks = mobileNav.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
});
