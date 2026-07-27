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

    const revealItems = [...document.querySelectorAll(".reveal")];
    document.body.classList.add("reveal-ready");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            });
        }, {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12
        });

        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
            observer.observe(item);
        });
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
