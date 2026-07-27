document.addEventListener("DOMContentLoaded", () => {
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
