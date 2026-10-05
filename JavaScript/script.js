document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("current-year");
    if (year) year.textContent = String(new Date().getFullYear());

    const leagueData = window.NEBULA_DATA || {};
    const counts = {
        characters: Array.isArray(leagueData.characters) ? leagueData.characters.length : null,
        players: Array.isArray(leagueData.players) ? leagueData.players.length : null,
        clubs: Array.isArray(leagueData.clubs) ? leagueData.clubs.length : null
    };

    document.querySelectorAll("[data-count]").forEach(element => {
        const count = counts[element.dataset.count];
        if (!Number.isFinite(count)) return;

        const padding = Number(element.dataset.pad || 0);
        element.textContent = String(count).padStart(padding, "0");
    });

    const activeSeason = leagueData.getActiveSeason?.()
        || leagueData.seasons?.find(season => season.status === "active");
    document.querySelectorAll("[data-active-season]").forEach(element => {
        element.textContent = activeSeason
            ? String(activeSeason.number).padStart(2, "0")
            : "--";
    });

    const revealItems = [...document.querySelectorAll(".reveal")];
    document.body.classList.add("reveal-ready");

    // Une fois l'apparition terminée, on retire la classe .reveal pour que
    // l'élément retrouve ses propres transitions (survol des cartes, etc.).
    function finishReveal(item) {
        item.classList.remove("reveal", "is-visible");
        item.style.transitionDelay = "";
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            // Décalage en cascade uniquement entre les éléments qui entrent
            // ensemble à l'écran, dans leur ordre visuel.
            entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top
                    || a.boundingClientRect.left - b.boundingClientRect.left)
                .forEach((entry, index) => {
                    const item = entry.target;
                    item.style.transitionDelay = `${Math.min(index, 3) * 60}ms`;
                    item.classList.add("is-visible");
                    const onEnd = event => {
                        if (event.target !== item || event.propertyName !== "opacity") return;
                        item.removeEventListener("transitionend", onEnd);
                        finishReveal(item);
                    };
                    item.addEventListener("transitionend", onEnd);
                    currentObserver.unobserve(item);
                });
        }, {
            rootMargin: "0px 0px 8% 0px",
            threshold: 0
        });

        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add("is-visible"));
    }

    const orbit = document.querySelector(".home-orbit");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (orbit && !reducedMotion.matches) {
        window.addEventListener("pointermove", event => {
            const x = (event.clientX / window.innerWidth - 0.5) * 12;
            const y = (event.clientY / window.innerHeight - 0.5) * 12;
            orbit.style.setProperty("--orbit-x", `${x}px`);
            orbit.style.setProperty("--orbit-y", `${y}px`);
        }, { passive: true });
    }
});
