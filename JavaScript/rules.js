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
            <div class="bracket-match"><small>MATCH A</small><strong>QUART DE FINALE A</strong></div>
            <div class="bracket-match"><small>MATCH B</small><strong>QUART DE FINALE B</strong></div>
            <div class="bracket-match"><small>MATCH C</small><strong>QUART DE FINALE C</strong></div>
            <div class="bracket-match"><small>MATCH D</small><strong>QUART DE FINALE D</strong></div>
            <div class="bracket-format-note"><small>ROUND 02</small><strong>2 DEMI-FINALES AUTOMATIQUES</strong></div>
        `;
    }

    const progress = document.getElementById("rulesProgress");
    const sections = [...document.querySelectorAll("[data-rule-section]")];
    const links = [...document.querySelectorAll("[data-rule-link]")];
    let ticking = false;

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
