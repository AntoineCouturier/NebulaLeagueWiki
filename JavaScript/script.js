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
