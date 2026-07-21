const buttons = document.querySelectorAll(".dropdown-btn");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const isOpen = content.classList.contains("open");

        // Ferme tous les autres dropdowns
        document.querySelectorAll(".dropdown-content.open").forEach(openContent => {
            if (openContent !== content) {
                openContent.style.maxHeight = openContent.scrollHeight + "px";
                requestAnimationFrame(() => {
                    openContent.style.maxHeight = "0px";
                    openContent.style.opacity = "0";
                });
                openContent.classList.remove("open");
                openContent.previousElementSibling.classList.remove("active");
            }
        });

        // Toggle du dropdown cliqué
        if (isOpen) {
            // Ferme le dropdown
            content.style.maxHeight = content.scrollHeight + "px";
            requestAnimationFrame(() => {
                content.style.maxHeight = "0px";
                content.style.opacity = "0";
            });
            content.classList.remove("open");
            btn.classList.remove("active");

        } else {
            // Ouvre le dropdown
            content.classList.add("open");
            content.style.maxHeight = content.scrollHeight + "px";
            content.style.opacity = "1";
            btn.classList.add("active");
        }
    });
});


// Animation des catégories (tu le gardes)
const revealClubs = () => {
    document.querySelectorAll(".category").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) el.classList.add("reveal");
    });
};

window.addEventListener("scroll", revealClubs);
window.addEventListener("load", revealClubs);

const tabs = document.querySelectorAll(".char-btn");
const pages = document.querySelectorAll(".char-page");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.target;

    // Active le bouton
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // Affiche la page correspondante
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// Initialisation : Global actif
document.getElementById("global").classList.add("active");

const titleLinks = document.querySelectorAll(".title-link");

titleLinks.forEach(link => {
  link.addEventListener("click", () => {
    const titleId = link.dataset.title;
    const detail = document.getElementById(titleId);

    if (detail) {
      // Masquer tous les autres détails
      document.querySelectorAll(".title-detail").forEach(d => d.style.display = "none");

      // Afficher le détail correspondant
      detail.style.display = "block";

      // Scroll jusqu’au détail
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Sélectionne tous les titres
document.querySelectorAll('.title-link').forEach(link => {
  link.addEventListener('click', function() {
    const videoSrc = this.dataset.video;

    // Crée le conteneur vidéo
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');

    const iframe = document.createElement('iframe');
    iframe.src = videoSrc;
    iframe.width = "640";
    iframe.height = "360";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    videoContainer.appendChild(iframe);

    // Ajoute la vidéo à .titles-details du parent
    const parent = this.closest('.char-page').querySelector('.titles-details');
    parent.innerHTML = ''; // Supprime l'ancienne vidéo si elle existe
    parent.appendChild(videoContainer);

    // Scroll jusqu'à la vidéo
    videoContainer.scrollIntoView({behavior: "smooth"});
  });
});

// Lazy-load des vidéos Drive pour la page Titres
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.title-link').forEach(link => {
        link.addEventListener('click', function() {
            const videoSrc = this.dataset.video;
            const titleText = this.textContent;
            const descriptionText = this.dataset.desc || ""; // optionnel : description dans data-desc

            // Crée le conteneur complet
            const titleDetail = document.createElement('div');
            titleDetail.classList.add('title-detail');

            // Titre
            const h3 = document.createElement('h3');
            h3.textContent = titleText;
            titleDetail.appendChild(h3);

            // Description (si fournie)
            if(descriptionText) {
                const pDesc = document.createElement('p');
                pDesc.classList.add('title-desc');
                pDesc.textContent = descriptionText;
                titleDetail.appendChild(pDesc);
            }

            // Conteneur vidéo
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('video-container');

            const iframe = document.createElement('iframe');
            iframe.src = videoSrc;
            iframe.width = "640";
            iframe.height = "360";
            iframe.allow = "autoplay; fullscreen";
            iframe.allowFullscreen = true;

            videoContainer.appendChild(iframe);
            titleDetail.appendChild(videoContainer);

            // Ajoute le bloc complet à .titles-details
            const parent = this.closest('.char-page').querySelector('.titles-details');
            parent.innerHTML = ''; // Supprime l'ancienne vidéo si elle existe
            parent.appendChild(titleDetail);

            // Scroll jusqu'au bloc
            titleDetail.scrollIntoView({behavior: "smooth"});
        });
    });
});


