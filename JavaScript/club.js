const buttons = document.querySelectorAll(".dropdown-btn");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const isOpen = content.classList.contains("open");

        // Ferme tous les autres dropdowns
        document.querySelectorAll(".dropdown-content.open").forEach(openContent => {
            if (openContent !== content) {
                openContent.classList.remove("open");
                openContent.previousElementSibling.classList.remove("active");
            }
        });

        // Toggle du dropdown cliqué
        if (isOpen) {
            content.classList.remove("open");
            btn.classList.remove("active");
        } else {
            content.classList.add("open");
            btn.classList.add("active");
        }
    });
});

// -------- SCROLL REVEAL --------
const revealClubs = () => {
    document.querySelectorAll(".club").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
            el.classList.add("reveal");
        }
    });
};

window.addEventListener("scroll", revealClubs);
window.addEventListener("load", revealClubs);

// -------- COMPTEUR DE JOUEURS AUTOMATIQUE --------
// Compte les postes réellement pourvus (liens joueurs) dans chaque club
// et met à jour le petit texte "X joueurs" affiché sur l'en-tête de la carte.
document.querySelectorAll(".club").forEach(club => {
    const filled = club.querySelectorAll(".roster-list a").length;
    const countEl = club.querySelector(".meta-count");
    if (countEl) {
        countEl.textContent = `${filled} joueur${filled > 1 ? "s" : ""}`;
    }
});