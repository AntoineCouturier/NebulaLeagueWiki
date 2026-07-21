// saison.js - Version avec animations améliorées

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== GESTION DES POPUPS =====
    document.querySelectorAll(".details-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const popupID = button.dataset.popup;
            const popup = document.getElementById(popupID);
            
            // Afficher le popup
            popup.style.display = "flex";
            
            // Réinitialiser le scroll au top du contenu
            const popupContent = popup.querySelector('.popup-content');
            if (popupContent) {
                popupContent.scrollTop = 0;
            }
            
            // Animation d'entrée
            setTimeout(() => {
                const popupBox = popup.querySelector('.popup-box');
                popupBox.style.opacity = '1';
                popupBox.style.transform = 'scale(1)';
            }, 10);
        });
    });

    // Fonction de fermeture générique
    function closePopup(popup) {
        const popupBox = popup.querySelector('.popup-box');
        
        // Animation de sortie
        popupBox.style.opacity = '0';
        popupBox.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            popup.style.display = "none";
        }, 300);
    }

    // Fermeture par bouton
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const popup = btn.closest(".popup-bg");
            closePopup(popup);
        });
    });

    // Fermeture en cliquant à l'extérieur
    document.querySelectorAll(".popup-bg").forEach(p => {
        p.addEventListener("click", e => {
            if (e.target === p) {
                closePopup(p);
            }
        });
    });

    // Fermeture avec ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup-bg').forEach(p => {
                if (p.style.display === 'flex') {
                    closePopup(p);
                }
            });
        }
    });

    // ===== TRI DES SAISONS =====
    const seasonList = document.querySelector(".season-list");
    const cards = Array.from(document.querySelectorAll(".season-card"));

    // Trier par date décroissante
    cards.sort((a, b) => new Date(b.dataset.start) - new Date(a.dataset.start));

    // Animation d'apparition progressive
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
        
        seasonList.appendChild(card);
    });
    
    // ===== BOUTON "EN COURS" SPÉCIAL =====
    const currentSeason = document.querySelector('.season-card[data-popup="popup1"]');
    if (currentSeason) {
        // Ajouter un effet pulsant pour la saison en cours
        const header = currentSeason.querySelector('.season-header h1');
        if (header) {
            header.style.animation = 'pulse 2s infinite';
            
            // Ajouter l'animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
});