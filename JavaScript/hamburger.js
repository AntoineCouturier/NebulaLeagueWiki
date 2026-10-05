// ========== HAMBURGER MENU FUNCTIONALITY ==========
// Menu principal (groupes, ouverture mobile), recherche globale et images.
// À inclure sur toutes les pages.

const hamburgerScriptUrl = document.currentScript?.src;

document.addEventListener('DOMContentLoaded', function () {
    // Recherche globale (Ctrl+K), chargée sur toutes les pages.
    if (hamburgerScriptUrl && !document.querySelector('script[src$="command-palette.js"]')) {
        const paletteScript = document.createElement('script');
        paletteScript.src = new URL('command-palette.js', hamburgerScriptUrl).href;
        document.body.appendChild(paletteScript);
    }

    const activeSeason = window.NEBULA_DATA?.getActiveSeason?.();
    const seasonPill = document.querySelector('.live-pill');
    if (seasonPill && Number.isFinite(Number(activeSeason?.number))) {
        seasonPill.innerHTML = `<i></i> SAISON ${String(activeSeason.number).padStart(2, '0')}`;
    }

    const menuButton = document.querySelector('.menu-button');
    const mainNav = document.querySelector('.main-nav');

    // ========== MENU GROUPÉ ==========
    // Les pages gardent la liste de liens à plat dans leur HTML : on les range
    // ici en sous-menus pour alléger la barre de navigation.
    const NAV_GROUPS = [
        { label: 'Ligue', pages: ['saison.html', 'fixtures.html', 'matchs.html'] },
        { label: 'Effectifs', pages: ['players.html', 'club.html', 'valeur.html', 'progression.html'] },
        { label: 'Compétition', pages: ['title.html', 'stats.html', 'headtohead.html', 'dream-team.html'] }
    ];

    function closeNavGroups(except) {
        mainNav?.querySelectorAll('.nav-group.is-open').forEach(group => {
            if (group === except) return;
            group.classList.remove('is-open');
            group.querySelector('.nav-group-toggle')?.setAttribute('aria-expanded', 'false');
        });
    }

    function groupMainNav() {
        if (!mainNav || mainNav.classList.contains('is-grouped')) return;
        const links = [...mainNav.querySelectorAll(':scope > a')];
        const pageOf = link => (link.getAttribute('href') || '').split(/[?#]/)[0].split('/').pop();
        const rulesLink = links.find(link => pageOf(link) === 'rules.html');

        NAV_GROUPS.forEach((groupDef, groupIndex) => {
            const groupLinks = groupDef.pages
                .map(page => links.find(link => pageOf(link) === page))
                .filter(Boolean);
            if (!groupLinks.length) return;

            const group = document.createElement('div');
            group.className = 'nav-group';
            const panelId = `nav-group-panel-${groupIndex}`;
            const isActive = groupLinks.some(link => link.classList.contains('nav-active'));
            if (isActive) group.classList.add('has-active');

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'nav-group-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-controls', panelId);
            toggle.innerHTML = `<span>${groupDef.label}</span><i aria-hidden="true"></i>`;

            const panel = document.createElement('div');
            panel.className = 'nav-group-panel';
            panel.id = panelId;
            groupLinks.forEach(link => panel.appendChild(link));

            group.append(toggle, panel);
            mainNav.insertBefore(group, rulesLink && rulesLink.parentElement === mainNav ? rulesLink : null);

            toggle.addEventListener('click', () => {
                const isOpen = group.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(isOpen));
                closeNavGroups(group);
            });
        });

        mainNav.classList.add('is-grouped');

        document.addEventListener('click', event => {
            if (!event.target.closest('.nav-group')) closeNavGroups();
        });
        mainNav.addEventListener('focusout', event => {
            if (!mainNav.contains(event.relatedTarget)) closeNavGroups();
        });
    }

    groupMainNav();

    if (menuButton && mainNav) {
        function closeMainNav() {
            closeNavGroups();
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

    // Optimisation globale des images : les éléments hors en-tête sont décodés
    // de façon asynchrone et chargés seulement lorsqu'ils approchent de l'écran.
    function optimizeImage(image) {
        if (!(image instanceof HTMLImageElement)) return;
        if (!image.hasAttribute('decoding')) image.decoding = 'async';
        if (
            !image.hasAttribute('loading')
            && !image.closest('header, [data-eager-image]')
        ) {
            image.loading = 'lazy';
        }
    }

    document.querySelectorAll('img').forEach(optimizeImage);
    const imageObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof Element)) return;
                if (node.matches('img')) optimizeImage(node);
                node.querySelectorAll?.('img').forEach(optimizeImage);
            });
        });
    });
    imageObserver.observe(document.body, { childList: true, subtree: true });
});
