// ========== RECHERCHE GLOBALE (Ctrl+K) ==========
// Chargée par hamburger.js sur toutes les pages. Cherche dans les pages, les
// joueurs, les clubs, les personnages et les matchs.

(function () {
    const scriptUrl = document.currentScript?.src || new URL("JavaScript/command-palette.js", location.href).href;
    const rootUrl = new URL("../", scriptUrl);
    const resolve = path => new URL(path, rootUrl).href;
    const MAX_PER_GROUP = 6;

    const PAGES = [
        { label: "Accueil", path: "index.html", hint: "Hub de la ligue", keywords: "home hub" },
        { label: "Titres", path: "title.html", hint: "Personnages, raretés et titres ultimes", keywords: "codex personnages ego" },
        { label: "Clubs", path: "club.html", hint: "Effectifs, terrains et palmarès", keywords: "équipes teams" },
        { label: "Joueurs", path: "players.html", hint: "Registre des profils", keywords: "players profils" },
        { label: "Matchs", path: "matchs.html", hint: "Résultats et performances", keywords: "résultats scores" },
        { label: "Saisons", path: "saison.html", hint: "Classements et distinctions", keywords: "classement archives" },
        { label: "Calendrier", path: "fixtures.html", hint: "Prochaines rencontres", keywords: "fixtures planning dates" },
        { label: "Face à face", path: "headtohead.html", hint: "Comparer deux profils", keywords: "comparer duel h2h versus" },
        { label: "Valeurs", path: "valeur.html", hint: "Marché et cotes des joueurs", keywords: "argent yen marché" },
        { label: "Règles", path: "rules.html", hint: "Protocole de compétition", keywords: "règlement" },
        { label: "Records", path: "stats.html", hint: "Records par saison et par match", keywords: "stats statistiques" },
        { label: "Progression", path: "progression.html", hint: "Évolution des joueurs", keywords: "évolution" },
        { label: "Équipes idéales", path: "dream-team.html", hint: "Meilleurs onze automatiques", keywords: "dream team" },
        { label: "Plus beau but", path: "Autre/greatest_goal.html", hint: "Le but de l’histoire", keywords: "goal" },
        { label: "Pire raté", path: "Autre/worst_goal.html", hint: "Le raté de l’histoire", keywords: "miss" }
    ];

    const GROUP_LABELS = { page: "Pages", player: "Joueurs", club: "Clubs", character: "Personnages", match: "Matchs" };

    const normalize = text => String(text || "")
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toLowerCase().trim();
    const escapeHtml = text => String(text ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);

    function loadScript(path) {
        return new Promise(resolveLoad => {
            const script = document.createElement("script");
            script.src = resolve(path);
            script.onload = script.onerror = () => resolveLoad();
            document.head.appendChild(script);
        });
    }

    let indexPromise = null;
    function buildIndex() {
        indexPromise ??= (async () => {
            if (!window.NEBULA_DATA?.players) await loadScript("JavaScript/nebula-data.js");
            if (!window.NEBULA_CHARACTERS) await loadScript("JavaScript/characters-data.js");
            const data = window.NEBULA_DATA || {};
            const items = PAGES.map(page => ({
                type: "page", label: page.label, hint: page.hint,
                href: resolve(page.path), terms: `${page.label} ${page.keywords}`
            }));

            (data.players || []).forEach(player => items.push({
                type: "player",
                label: player.name,
                hint: [player.position, player.clubName, player.character].filter(Boolean).join(" · "),
                href: data.playerPageHref?.(player) || resolve(player.profilePath),
                image: player.avatar,
                terms: `${player.name} ${player.clubName} ${player.position} ${player.character}`
            }));

            (data.clubs || []).forEach(club => items.push({
                type: "club",
                label: club.name,
                hint: club.shortName && club.shortName !== club.name ? club.shortName : "Dossier club",
                href: data.clubPageHref?.(club.key) || resolve(`club.html?club=${club.key}`),
                image: club.logo || (club.logoPath && resolve(club.logoPath)),
                terms: `${club.name} ${club.shortName || ""} ${club.key}`
            }));

            (window.NEBULA_CHARACTERS || []).forEach(character => items.push({
                type: "character",
                label: character.edition ? `${character.name} (${character.edition})` : character.name,
                hint: `${character.ultimate} · ${character.rarityLabel?.split("·")[0].trim() || ""}`,
                href: resolve(`title.html?personnage=${encodeURIComponent(character.id)}`),
                image: resolve(character.imagePath || `images/icons/${character.id}.webp`),
                terms: `${character.name} ${character.edition || ""} ${character.ultimate} ${character.rarity}`
            }));

            [...(data.matches || [])].reverse().forEach(match => {
                const home = data.getClub?.(match.home)?.name || match.home;
                const away = data.getClub?.(match.away)?.name || match.away;
                items.push({
                    type: "match",
                    label: `${home} ${match.scoreHome}–${match.scoreAway} ${away}`,
                    hint: [match.date, match.category].filter(Boolean).join(" · "),
                    href: resolve(`matchs.html?match=${encodeURIComponent(match.id)}`),
                    terms: `${home} ${away} ${match.date} ${match.category}`
                });
            });

            items.forEach(item => {
                item.normLabel = normalize(item.label);
                item.normTerms = normalize(item.terms);
            });
            return items;
        })();
        return indexPromise;
    }

    function score(item, query) {
        if (!query) return item.type === "page" || item.type === "player" ? 1 : 0;
        if (item.normLabel === query) return 100;
        if (item.normLabel.startsWith(query)) return 80;
        if (item.normLabel.split(/[\s'’-]+/).some(word => word.startsWith(query))) return 60;
        if (item.normLabel.includes(query)) return 40;
        const termWords = item.normTerms.split(/[\s'’·-]+/);
        const words = query.split(/\s+/);
        if (words.every(word => termWords.some(term => term.startsWith(word)))) return 20;
        return 0;
    }

    // ---------- Interface ----------
    let overlay = null;
    let input = null;
    let list = null;
    let results = [];
    let activeIndex = 0;
    let lastFocus = null;

    function createOverlay() {
        overlay = document.createElement("div");
        overlay.className = "nl-palette";
        overlay.hidden = true;
        overlay.innerHTML = `
            <div class="nl-palette-backdrop" data-close></div>
            <div class="nl-palette-panel" role="dialog" aria-modal="true" aria-label="Recherche dans la Nebula League">
                <div class="nl-palette-field">
                    <span class="nl-palette-prompt" aria-hidden="true">&gt;</span>
                    <input type="text" role="combobox" aria-expanded="true" aria-controls="nl-palette-list"
                        aria-autocomplete="list" autocomplete="off" spellcheck="false"
                        placeholder="Joueur, club, personnage, page…">
                    <kbd>Échap</kbd>
                </div>
                <div class="nl-palette-list" id="nl-palette-list" role="listbox"></div>
                <div class="nl-palette-footer" aria-hidden="true">
                    <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
                    <span><kbd>Entrée</kbd> ouvrir</span>
                    <span>NL // INDEX GLOBAL</span>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        input = overlay.querySelector("input");
        list = overlay.querySelector(".nl-palette-list");

        overlay.addEventListener("click", event => {
            if (event.target.closest("[data-close]")) close();
        });
        input.addEventListener("input", render);
        input.addEventListener("keydown", event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                if (!results.length) return;
                const step = event.key === "ArrowDown" ? 1 : -1;
                setActive((activeIndex + step + results.length) % results.length);
            } else if (event.key === "Enter") {
                const target = results[activeIndex];
                if (target) {
                    event.preventDefault();
                    window.location.href = target.href;
                }
            } else if (event.key === "Tab") {
                event.preventDefault();
            }
        });
        list.addEventListener("mousemove", event => {
            const option = event.target.closest("[data-index]");
            if (option && Number(option.dataset.index) !== activeIndex) setActive(Number(option.dataset.index));
        });
    }

    function setActive(index) {
        activeIndex = index;
        list.querySelectorAll("[role=option]").forEach(option => {
            const isActive = Number(option.dataset.index) === index;
            option.setAttribute("aria-selected", String(isActive));
            if (isActive) {
                input.setAttribute("aria-activedescendant", option.id);
                option.scrollIntoView({ block: "nearest" });
            }
        });
    }

    async function render() {
        const items = await buildIndex();
        const query = normalize(input.value);
        const scored = items
            .map(item => ({ item, value: score(item, query) }))
            .filter(entry => entry.value > 0)
            .sort((a, b) => b.value - a.value);

        const groups = {};
        scored.forEach(({ item }) => {
            groups[item.type] ??= [];
            if (groups[item.type].length < MAX_PER_GROUP) groups[item.type].push(item);
        });

        // Les groupes apparaissent dans l'ordre de leur meilleur résultat.
        const order = [...new Set(scored.map(entry => entry.item.type))];
        results = order.flatMap(type => groups[type]);

        if (!results.length) {
            list.innerHTML = `<p class="nl-palette-empty"><strong>Aucun résultat</strong>Rien ne correspond à « ${escapeHtml(input.value)} ».</p>`;
            input.removeAttribute("aria-activedescendant");
            return;
        }

        let index = 0;
        list.innerHTML = order.map(type => `
            <div class="nl-palette-group" role="group" aria-label="${GROUP_LABELS[type]}">
                <p class="nl-palette-group-label">${GROUP_LABELS[type]}</p>
                ${groups[type].map(item => {
                    const i = index++;
                    return `<a class="nl-palette-option" id="nl-palette-option-${i}" role="option" data-index="${i}" data-type="${item.type}" href="${escapeHtml(item.href)}" tabindex="-1">
                        <span class="nl-palette-thumb">${item.image ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy" onerror="this.remove()">` : `<i>${escapeHtml(GROUP_LABELS[type].slice(0, 2))}</i>`}</span>
                        <span class="nl-palette-text"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.hint)}</small></span>
                        <span class="nl-palette-go" aria-hidden="true">↵</span>
                    </a>`;
                }).join("")}
            </div>`).join("");
        setActive(0);
    }

    function open() {
        if (!overlay) createOverlay();
        if (!overlay.hidden) return;
        lastFocus = document.activeElement;
        overlay.hidden = false;
        document.documentElement.classList.add("nl-palette-open");
        input.value = "";
        render();
        requestAnimationFrame(() => input.focus());
    }

    function close() {
        if (!overlay || overlay.hidden) return;
        overlay.hidden = true;
        document.documentElement.classList.remove("nl-palette-open");
        lastFocus?.focus?.();
    }

    const isTyping = target => target instanceof HTMLElement
        && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));

    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            overlay && !overlay.hidden ? close() : open();
        } else if (event.key === "/" && !isTyping(event.target) && (!overlay || overlay.hidden)) {
            event.preventDefault();
            open();
        } else if (event.key === "Escape" && overlay && !overlay.hidden) {
            event.stopPropagation();
            close();
        }
    }, true);

    // Bouton dans l'en-tête, pour la souris et le mobile.
    const actions = document.querySelector(".site-header .header-actions");
    if (actions && !actions.querySelector(".search-trigger")) {
        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "search-trigger";
        trigger.setAttribute("aria-label", "Rechercher dans la ligue");
        trigger.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg><span>Rechercher</span><kbd>${isMac ? "⌘" : "Ctrl"} K</kbd>`;
        trigger.addEventListener("click", open);
        actions.prepend(trigger);
    }

    window.NEBULA_SEARCH = { open, close };
})();
