// ========== HAMBURGER MENU FUNCTIONALITY ==========
// This code handles the mobile hamburger menu - include in every JS file

document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.menu-button');
    const mainNav = document.querySelector('.main-nav');
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.nav-mobile-overlay');
    const closeBtn = document.querySelector('.nav-close-btn');
    const backdrop = document.querySelector('.nav-backdrop');

    if (menuButton && mainNav) {
        function closeMainNav() {
            mainNav.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.setAttribute('aria-label', 'Ouvrir le menu');
        }

        menuButton.addEventListener('click', function () {
            const isOpen = mainNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMainNav);
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 960) closeMainNav();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMainNav();
        });
    }

    function openMenu() {
        if (hamburger) hamburger.classList.add('active');
        if (mobileNav) mobileNav.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        if (hamburger) hamburger.classList.remove('active');
        if (mobileNav) mobileNav.classList.remove('active');
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
