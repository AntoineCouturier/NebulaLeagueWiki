document.addEventListener("DOMContentLoaded", () => {
    const registeredClubCount = window.NEBULA_DATA?.clubs?.length || 0;
    const nclQualifiedCount = registeredClubCount >= 8 ? 8 : 4;
    const nclQualifiedStat = document.getElementById("nclQualifiedStat");
    const nclFormatDescription = document.getElementById("nclFormatDescription");
    const nclQualificationLabel = document.getElementById("nclQualificationLabel");
    const nclOpeningRoundLabel = document.getElementById("nclOpeningRoundLabel");
    const rulesNclOpeningStage = document.getElementById("rulesNclOpeningStage");

    if (nclQualifiedStat) nclQualifiedStat.textContent = String(nclQualifiedCount).padStart(2, "0");
    if (nclQualificationLabel) nclQualificationLabel.textContent = `TOP ${String(nclQualifiedCount).padStart(2, "0")}`;
    if (nclOpeningRoundLabel) nclOpeningRoundLabel.textContent = nclQualifiedCount === 8 ? "QUARTS DE FINALE" : "DEMI-FINALES";
    if (nclFormatDescription) {
        nclFormatDescription.textContent = nclQualifiedCount === 8
            ? "Les huit meilleures équipes de Ligue accèdent à la NCL ; les deux dernières ne sont pas qualifiées."
            : "Les quatre meilleures équipes de Ligue accèdent au tournoi final.";
    }
    if (nclQualifiedCount === 8 && rulesNclOpeningStage) {
        rulesNclOpeningStage.classList.add("is-eight-team");
        rulesNclOpeningStage.innerHTML = `
            <span class="bracket-stage-label">01 // QUARTS DE FINALE</span>
            <div class="bracket-match"><small>MATCH A // 1er contre 8e</small><strong>QUART DE FINALE A</strong></div>
            <div class="bracket-match"><small>MATCH B // 4e contre 5e</small><strong>QUART DE FINALE B</strong></div>
            <div class="bracket-match"><small>MATCH C // 2e contre 7e</small><strong>QUART DE FINALE C</strong></div>
            <div class="bracket-match"><small>MATCH D // 3e contre 6e</small><strong>QUART DE FINALE D</strong></div>
            <div class="bracket-format-note"><small>TOUR 02 // A+B et C+D</small><strong>2 DEMI-FINALES AUTOMATIQUES</strong></div>
        `;
    }

    // Fils du tableau final : calés sur le centre réel des cases, quelle que soit
    // la hauteur des libellés (offsetTop ignore les animations d'apparition).
    const bracketMain = document.querySelector(".rules-bracket-main");
    const bracketConnector = bracketMain?.querySelector(".bracket-connector");

    function alignBracketWires() {
        const matches = [...(rulesNclOpeningStage?.querySelectorAll(".bracket-match") || [])];
        const finalMatch = bracketMain.querySelector(".final-match");
        if (!matches.length || !finalMatch) return;
        const centre = element => `${Math.round(element.offsetTop + element.offsetHeight / 2 - bracketConnector.offsetTop)}px`;
        bracketConnector.style.setProperty("--wire-top", centre(matches[0]));
        bracketConnector.style.setProperty("--wire-bottom", centre(matches[matches.length - 1]));
        bracketConnector.style.setProperty("--wire-out", centre(finalMatch));
    }

    if (bracketConnector) {
        new ResizeObserver(alignBracketWires).observe(bracketMain);
        document.fonts?.ready.then(alignBracketWires);
    }

    const progress = document.getElementById("rulesProgress");
    const sections = [...document.querySelectorAll("[data-rule-section]")];
    const links = [...document.querySelectorAll("[data-rule-link]")];
    const rail = links[0]?.parentElement;
    let ticking = false;
    let lastActive = null;

    // Sur mobile, les canaux défilent horizontalement : garde le canal actif visible.
    function revealActiveLink(link) {
        if (!rail || !link || rail.scrollWidth <= rail.clientWidth) return;
        const railBox = rail.getBoundingClientRect();
        const linkBox = link.getBoundingClientRect();
        if (linkBox.left < railBox.left || linkBox.right > railBox.right) {
            rail.scrollLeft += linkBox.left - railBox.left - 8;
        }
    }

    function updateReadingState() {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0;
        progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;

        const readingLine = window.scrollY + Math.min(220, window.innerHeight * 0.32);
        let activeSection = sections[0]?.id;

        sections.forEach(section => {
            if (section.offsetTop <= readingLine) activeSection = section.id;
        });

        links.forEach(link => {
            const active = link.dataset.ruleLink === activeSection;
            link.classList.toggle("active", active);
            if (active) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (activeSection !== lastActive) {
            lastActive = activeSection;
            revealActiveLink(links.find(link => link.dataset.ruleLink === activeSection));
        }

        ticking = false;
    }

    function requestReadingUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateReadingState);
    }

    links.forEach(link => {
        link.addEventListener("click", () => {
            links.forEach(item => item.classList.toggle("active", item === link));
        });
    });

    window.addEventListener("scroll", requestReadingUpdate, { passive: true });
    window.addEventListener("resize", requestReadingUpdate);
    updateReadingState();
});
