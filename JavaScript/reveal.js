// reveal.js - Animations d'apparition, communes à toutes les pages.
// Chargé dans le <head> (sans defer) pour être prêt avant le premier affichage.
//
// Rien à déclarer page par page : le script parcourt la page, repère les
// blocs (sections, panneaux, cartes...) et les fait apparaître quand ils
// entrent à l'écran. Les listes de cartes (joueurs, matchs, calendrier...)
// apparaissent carte par carte, y compris quand un filtre les ré-affiche.
//
//   - data-reveal="off"  sur un élément : pas d'animation pour lui ni son contenu.
//   - data-reveal="each" sur un conteneur : chaque enfant apparaît séparément.

(function () {

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !Element.prototype.animate || !("IntersectionObserver" in window)) return;

    /* ============================================================
       0. RÉGLAGES
       ============================================================ */

    // Jamais animés : en-tête, menus, popups, palette de commandes, décor.
    const IGNORE = [
        ".site-header", ".nav-mobile-overlay", ".nav-backdrop", ".ambient",
        "dialog", "[role='dialog']", "[class*='modal']", "[class*='popup']",
        "[class*='palette']", "[aria-hidden='true']", "[data-reveal='off']",
        "script", "style", "template", "link", "noscript"
    ].join(",");

    // Titres qui se "déchiffrent" lettre par lettre.
    const HEADINGS = "h1, h2";

    // Textes mis à jour par d'autres scripts : on n'y touche pas.
    const LIVE_TEXT = "[data-count], [data-active-season], #current-year";

    const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
    const STAGGER = 65;     // ms entre deux blocs qui apparaissent ensemble
    const MAX_DELAY = 520;  // délai max, pour ne pas faire attendre sur les longues listes
    const FIRST_DELAY = 90; // petit temps mort à l'arrivée sur la page

    let firstBatch = true;
    let viaPageTransition = false;

    // Arrivée par une transition entre pages (Chrome, Edge, Safari) : on le
    // note pour ne pas cacher le portrait du joueur qui "glisse" d'une page à l'autre.
    window.addEventListener("pagereveal", event => {
        if (event.viewTransition) viaPageTransition = true;
    });

    /* ============================================================
       1. REPÉRAGE DES BLOCS
       ============================================================ */

    const io = new IntersectionObserver(onIntersect, {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.06
    });

    function isIgnored(el) {
        return el.matches(IGNORE) || !!el.closest("[data-reveal='off'], .site-header, dialog, [class*='modal']");
    }

    function isHidden(el) {
        if (!el.getClientRects().length) return true;
        const style = getComputedStyle(el);
        return style.visibility === "hidden" || style.position === "fixed";
    }

    // Une liste = au moins 3 enfants qui se ressemblent (même balise + même 1re classe).
    function isCollection(el) {
        if (el.dataset.reveal === "each") return true;
        const kids = [...el.children].filter(k => !k.matches("script, template"));
        if (kids.length < 3) return false;
        const counts = {};
        kids.forEach(k => {
            const key = k.tagName + "." + (k.classList[0] || "");
            counts[key] = (counts[key] || 0) + 1;
        });
        return Math.max(...Object.values(counts)) / kids.length >= 0.6;
    }

    function isTall(el) {
        return el.getBoundingClientRect().height > window.innerHeight * 0.85;
    }

    // Décide si un élément est un bloc à animer, une liste, ou un simple
    // emballage dont il faut regarder le contenu.
    function visit(el, depth) {
        if (isIgnored(el) || isHidden(el)) return;
        if (el.hasAttribute("data-nl")) return;

        const style = getComputedStyle(el);
        if (style.position === "absolute") return; // décor posé par-dessus

        if (el.tagName === "MAIN") {
            [...el.children].forEach(child => visit(child, depth));
            return;
        }

        if (isCollection(el)) {
            el.setAttribute("data-nl-list", "");
            [...el.children].forEach(child => {
                if (!isIgnored(child) && !isHidden(child)) register(child);
            });
            return;
        }

        // Contient déjà des blocs animés, ou trop grand pour apparaître d'un coup :
        // on regarde son contenu.
        if (el.children.length && depth < 5
            && (el.children.length === 1 || isTall(el) || el.querySelector("[data-nl]"))) {
            [...el.children].forEach(child => visit(child, depth + 1));
            return;
        }

        register(el);
    }

    function register(el) {
        if (el.hasAttribute("data-nl")) return;
        if (el.parentElement && el.parentElement.closest("[data-nl]")) return;

        // Coupe les anciennes animations d'entrée (celles qui ne tournent pas
        // en boucle) pour éviter deux effets l'un sur l'autre.
        el.getAnimations().forEach(animation => {
            const timing = animation.effect && animation.effect.getComputedTiming();
            if (animation.animationName && timing && timing.iterations !== Infinity) animation.cancel();
        });
        if (getComputedStyle(el).opacity === "0") el.style.opacity = "1";

        el.setAttribute("data-nl", "");
        el.classList.add("nl-pending");
        io.observe(el);
    }

    /* ============================================================
       2. APPARITION
       ============================================================ */

    function onIntersect(entries) {
        const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top)
                || (a.boundingClientRect.left - b.boundingClientRect.left));
        if (!visible.length) return;

        const base = firstBatch ? FIRST_DELAY : 0;
        const keepStill = firstBatch && viaPageTransition;
        firstBatch = false;

        visible.forEach((entry, index) => {
            const el = entry.target;
            io.unobserve(el);
            el.classList.remove("nl-pending");

            // Le portrait qui glisse depuis la page précédente reste en place.
            if (keepStill && el.querySelector("[style*='view-transition-name']")) return;

            const delay = base + Math.min(index * STAGGER, MAX_DELAY);
            reveal(el, delay);
            const headings = el.matches(HEADINGS) ? [el] : [...el.querySelectorAll(HEADINGS)];
            headings.forEach(heading => decrypt(heading, delay + 80));
        });
    }

    // Le bloc "se scanne" de haut en bas : il monte, sort du flou avec un
    // flash lumineux qui s'éteint. Une fois fini, l'élément retrouve tous
    // ses styles normaux (survol, glow...).
    function reveal(el, delay) {
        el.animate([
            {
                opacity: 0,
                transform: "translateY(26px) scale(0.985)",
                filter: "blur(8px) brightness(1.8)",
                clipPath: "inset(-40px -40px 100% -40px)"
            },
            {
                offset: 0.55,
                opacity: 1,
                filter: "blur(0px) brightness(1.3)",
                clipPath: "inset(-40px -40px -40px -40px)"
            },
            {
                opacity: 1,
                transform: "none",
                filter: "blur(0px) brightness(1)",
                clipPath: "inset(-40px -40px -40px -40px)"
            }
        ], { duration: 720, delay, easing: EASE, fill: "backwards" });
    }

    /* ============================================================
       3. TITRES "DÉCHIFFRÉS"
       ============================================================ */

    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*+=";
    const SCRAMBLABLE = /[A-Za-zÀ-ÿ0-9]/;

    function decrypt(el, delay) {
        if (el.dataset.nlDecrypted || el.closest(LIVE_TEXT) || el.querySelector(LIVE_TEXT)) return;
        el.dataset.nlDecrypted = "1";

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) if (walker.currentNode.data.trim()) nodes.push(walker.currentNode);
        const total = nodes.reduce((sum, node) => sum + node.data.length, 0);
        if (!nodes.length || total > 70) return;

        setTimeout(() => {
            const originals = nodes.map(node => Array.from(node.data));
            const written = nodes.map(node => node.data);
            const duration = Math.min(900, 320 + total * 18);
            let position = 0;
            // Chaque lettre se fixe à un instant un peu aléatoire, de gauche à droite.
            const lockAt = originals.map(chars => chars.map(() => {
                const at = (position++ / total) * duration * 0.75 + Math.random() * duration * 0.25;
                return at;
            }));

            // Hauteur figée pendant l'effet : le titre ne fait pas sauter la page.
            const height = el.getBoundingClientRect().height;
            el.style.minHeight = height + "px";
            el.setAttribute("aria-label", el.textContent);
            let start = null;

            function frame(now) {
                if (start === null) start = now;
                const t = now - start;
                const done = t >= duration;

                nodes.forEach((node, i) => {
                    // Un autre script a changé ce texte entre-temps : on le laisse.
                    if (written[i] === null || node.data !== written[i]) { written[i] = null; return; }
                    const text = done
                        ? originals[i].join("")
                        : originals[i].map((c, j) => (t >= lockAt[i][j] || !SCRAMBLABLE.test(c))
                            ? c
                            : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
                    node.data = text;
                    written[i] = text;
                });

                if (!done) {
                    requestAnimationFrame(frame);
                } else {
                    el.style.minHeight = "";
                    el.removeAttribute("aria-label");
                }
            }

            requestAnimationFrame(frame);
        }, delay);
    }

    /* ============================================================
       4. EN-TÊTE (1re page de la visite seulement)
       ============================================================ */

    function animateHeader() {
        let seen = false;
        try {
            seen = sessionStorage.getItem("nl-intro-seen") === "1";
            sessionStorage.setItem("nl-intro-seen", "1");
        } catch (error) { /* navigation privée : on anime à chaque fois */ }
        if (seen || viaPageTransition) return;

        const header = document.querySelector(".site-header");
        if (!header) return;

        header.animate([
            { transform: "translateY(-100%)", opacity: 0 },
            { transform: "none", opacity: 1 }
        ], { duration: 600, easing: EASE, fill: "backwards" });

        header.querySelectorAll(".main-nav > *").forEach((item, index) => {
            item.animate([
                { transform: "translateY(-10px)", opacity: 0, filter: "blur(4px)" },
                { transform: "none", opacity: 1, filter: "blur(0px)" }
            ], { duration: 420, delay: 220 + index * 50, easing: EASE, fill: "backwards" });
        });
    }

    /* ============================================================
       5. CONTENU AJOUTÉ PLUS TARD (rendu JS, filtres, onglets...)
       ============================================================ */

    function onMutations(mutations) {
        const parents = new Set();
        mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.isConnected) parents.add(node.parentElement);
        }));

        parents.forEach(parent => {
            if (!parent || !parent.isConnected || isIgnored(parent)) return;

            const block = parent.closest("[data-nl]");
            if (block) {
                // Le bloc n'est pas encore apparu et vient de se remplir : on le
                // redécoupe pour que son nouveau contenu apparaisse morceau par morceau.
                if (block.classList.contains("nl-pending")) {
                    io.unobserve(block);
                    block.removeAttribute("data-nl");
                    block.classList.remove("nl-pending");
                    visit(block, 2);
                }
                // Déjà apparu : le contenu suit son bloc.
                return;
            }

            if (parent.hasAttribute("data-nl-list") || isCollection(parent)) {
                parent.setAttribute("data-nl-list", "");
                [...parent.children].forEach(child => {
                    if (!isIgnored(child) && !isHidden(child)) register(child);
                });
                return;
            }

            [...parent.children].forEach(child => {
                if (!child.hasAttribute("data-nl")) visit(child, 2);
            });
        });
    }

    /* ============================================================
       6. DÉMARRAGE
       ============================================================ */

    function start() {
        animateHeader();
        [...document.body.children].forEach(child => visit(child, 0));
        new MutationObserver(onMutations).observe(document.body, { childList: true, subtree: true });
    }

    // On attend que les scripts des pages aient rempli leur contenu (juste
    // avant le premier affichage), pour repérer les cartes déjà présentes.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(start));
    } else {
        requestAnimationFrame(start);
    }

})();
