const popup = document.getElementById("popupSeason");
const openBtn = document.getElementById("openSeasonPopup");
const closeBtn = document.getElementById("closeSeasonPopup");
const seasonSelect = document.getElementById("seasonSelect");
const seasonStatsDisplay = document.getElementById("seasonStatsDisplay");

function getStatsForSeason(season) {
    const elem = document.querySelector(
        `.season[data-season="${season}"]`
    );

    return {
        matchs: elem.dataset.matchs,
        buts: elem.dataset.buts,
        assists: elem.dataset.assists,
        saves: elem.dataset.saves,
        dribbles: elem.dataset.dribbles,
        mvp: elem.dataset.mvp,
        win: elem.dataset.win,
        lose: elem.dataset.lose
    };
}

function updateSeasonStats(season) {
    const s = getStatsForSeason(season);

    seasonStatsDisplay.innerHTML = `
        <p><strong>Matchs :</strong> ${s.matchs}</p>
        <p><strong>Buts :</strong> ${s.buts}</p>
        <p><strong>Assists :</strong> ${s.assists}</p>
        <p><strong>Defensive Save :</strong> ${s.saves}</p>
        <p><strong>Dribbles :</strong> ${s.dribbles}</p>
        <p><strong>MVP :</strong> ${s.mvp}</p>
        <p><strong>Victoire :</strong> ${s.win}</p>
        <p><strong>Défaite :</strong> ${s.lose}</p>
    `;
}

openBtn.onclick = () => {
    popup.style.display = "flex";
    updateSeasonStats(seasonSelect.value);
};

closeBtn.onclick = () => {
    popup.style.display = "none";
};

// Fermer en cliquant en dehors du pop-up
window.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.style.display = "none";
    }
});


seasonSelect.onchange = () => {
    updateSeasonStats(seasonSelect.value);
};
// ------------------ POPUP SECRET PAR MATCH ------------------

const popupMatch = document.getElementById("popupMatch");
const closeMatchBtn = document.getElementById("closeMatchPopup");
const matchSelect = document.getElementById("matchSelect");
const matchStatsDisplay = document.getElementById("matchStatsDisplay");

// Récupérer les données depuis <div class="match">
function getStatsForMatch(match) {
    const elem = document.querySelector(`.match[data-match="${match}"]`);

    return {
        title: elem.dataset.title,
        buts: elem.dataset.buts,
        pass: elem.dataset.pass,
        saves: elem.dataset.saves,
        dribbles: elem.dataset.dribbles
    };
}

function updateMatchStats(match) {
    const s = getStatsForMatch(match);

    matchStatsDisplay.innerHTML = `
        <h3 style="margin-top:5px;">${s.title}</h3>
        <p><strong>Buts :</strong> ${s.buts}</p>
        <p><strong>Passes D :</strong> ${s.pass}</p>
        <p><strong>Defenses :</strong> ${s.saves}</p>
        <p><strong>Dribbles :</strong> ${s.dribbles}</p>
    `;
}


// Ouvrir popup via Ctrl + Shift + S
document.addEventListener("keydown", (e) => {
    // Vérifie Ctrl + Shift + S
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        popupMatch.style.display = "flex";
        updateMatchStats(matchSelect.value);
    }
});


closeMatchBtn.onclick = () => {
    popupMatch.style.display = "none";
};

// Fermer en cliquant dehors
window.addEventListener("click", (e) => {
    if (e.target === popupMatch) popupMatch.style.display = "none";
});

// changement du match
matchSelect.onchange = () => {
    updateMatchStats(matchSelect.value);
};

// ==================== POPUP RADAR UNIVERSEL ====================

const popupRadar = document.getElementById("popupRadar");
const openRadarBtn = document.getElementById("openRadarPopup");
const closeRadarBtn = document.getElementById("closeRadarPopup");
let radarChart = null;

// Ouvrir popup
openRadarBtn.onclick = () => {
    popupRadar.style.display = "flex";
    setTimeout(createUniversalRadarChart, 50);
};

// Fermer popup
closeRadarBtn.onclick = closeRadarPopup;

// Fermer en cliquant dehors
window.addEventListener("click", (e) => {
    if (e.target === popupRadar) closeRadarPopup();
});

function closeRadarPopup() {
    popupRadar.style.display = "none";
    if (radarChart) {
        radarChart.destroy();
        radarChart = null;
    }
}

// ⭐ FONCTION UNIVERSELLE pour tous les joueurs
function createUniversalRadarChart() {
    const ctx = document.getElementById("skillsRadarChart").getContext("2d");
    
    // 1. RÉCUPÉRER LE NOM DU JOUEUR
    const playerName = document.querySelector('.player-header-bastard h2, ' +
                                           '.player-header-pxg h2, ' +
                                           '.player-header-ubers h2, ' +
                                           '.player-header-barcha h2, ' +
                                           '.player-header-manshine h2, ' +
                                           '.player-header-retraite h2').textContent;
    
    // 2. DÉTECTER LE CLUB (et sa couleur)
    const clubData = detectClub();
    
    // 3. RÉCUPÉRER LES STATS depuis le HTML
    const stats = extractStatsFromHTML();
    
    // 4. Calculer la moyenne globale
    const globalAverage = calculateGlobalAverage(stats);
    
    // 5. Créer le graphique
    radarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["DEFENSE", "PASSE", "DRIBBLE", "TIR", "OFFENSE", "POSITION"],
            datasets: [{
                label: playerName,
                data: [
                    stats.defense,
                    stats.passe,
                    stats.dribble,
                    stats.tir,
                    stats.offense,
                    stats.position
                ],
                backgroundColor: clubData.bgColor,
                borderColor: clubData.borderColor,
                pointBackgroundColor: clubData.borderColor,
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }]
        },
        options: getChartOptions(clubData.borderColor, globalAverage, playerName)
    });
    
    // 6. Animation
    animateRadarPoints();
}

// ⭐ DÉTECTER LE CLUB AUTOMATIQUEMENT
function detectClub() {
    const bodyClasses = document.body.innerHTML;
    
    if (bodyClasses.includes('player-header-bastard')) {
        return {
            name: 'Bastard Munchen',
            borderColor: '#ff0000',
            bgColor: 'rgba(255, 0, 0, 0.15)'
        };
    }
    if (bodyClasses.includes('player-header-pxg')) {
        return {
            name: 'PXG',
            borderColor: '#01049e',
            bgColor: 'rgba(1, 4, 158, 0.15)'
        };
    }
    if (bodyClasses.includes('player-header-ubers')) {
        return {
            name: 'Ubers',
            borderColor: '#0ba700',
            bgColor: 'rgba(11, 167, 0, 0.15)'
        };
    }
    if (bodyClasses.includes('player-header-barcha')) {
        return {
            name: 'Barcha',
            borderColor: '#e4c200',
            bgColor: 'rgba(228, 194, 0, 0.15)'
        };
    }
    if (bodyClasses.includes('player-header-manshine')) {
        return {
            name: 'Manshine',
            borderColor: '#00d5ff',
            bgColor: 'rgba(0, 213, 255, 0.15)'
        };
    }
    if (bodyClasses.includes('player-header-retraite')) {
        return {
            name: 'Retraite',
            borderColor: '#b300e4',
            bgColor: 'rgba(179, 0, 228, 0.15)'
        };
    }
    
    // Défaut
    return {
        name: 'Joueur',
        borderColor: '#ffffff',
        bgColor: 'rgba(255, 255, 255, 0.15)'
    };
}

// ⭐ EXTRACT STATS depuis le HTML (fiable)
function extractStatsFromHTML() {
    const statsContainer = document.querySelector('.player-card-fifa-stats');
    const statsText = statsContainer ? statsContainer.textContent : '';
    
    // Extraire les valeurs avec regex
    const defenseMatch = statsText.match(/Defense.*?(\d+)/);
    const passeMatch = statsText.match(/Passe.*?(\d+)/);
    const dribbleMatch = statsText.match(/Dribble.*?(\d+)/);
    const tirMatch = statsText.match(/Tir.*?(\d+)/);
    const offenseMatch = statsText.match(/Offense.*?(\d+)/);
    const positionMatch = statsText.match(/Positionement.*?(\d+)/);
    
    return {
        defense: defenseMatch ? parseInt(defenseMatch[1]) : 0,
        passe: passeMatch ? parseInt(passeMatch[1]) : 0,
        dribble: dribbleMatch ? parseInt(dribbleMatch[1]) : 0,
        tir: tirMatch ? parseInt(tirMatch[1]) : 0,
        offense: offenseMatch ? parseInt(offenseMatch[1]) : 0,
        position: positionMatch ? parseInt(positionMatch[1]) : 0
    };
}

// ⭐ CALCULER MOYENNE GLOBALE
function calculateGlobalAverage(stats) {
    const values = Object.values(stats);
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
}

// ⭐ OPTIONS DU GRAPHIQUE (avec min 50)
function getChartOptions(borderColor, globalAverage, playerName) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: "rgba(255, 255, 255, 0.15)"
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.1)"
                },
                pointLabels: {
                    color: "#ffffff",
                    font: {
                        size: 13,
                        weight: "bold"
                    },
                    padding: 15
                },
                ticks: {
                    display: true,
                    color: "#aaa",
                    backdropColor: "rgba(0, 0, 0, 0.5)",
                    font: {
                        size: 11
                    },
                    min: 50,      // ⭐ MINIMUM 50
                    max: 100,     // ⭐ MAXIMUM 100
                    stepSize: 5,
                    callback: function(value) {
                        if (value === 30 || value === 100) {
                            return value;
                        }
                        return '';
                    }
                },
                suggestedMin: 50,
                suggestedMax: 100
            }
        },
        
        plugins: {
            legend: {
                display: false
            },
            
            tooltip: {
                backgroundColor: "rgba(20, 20, 20, 0.95)",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: borderColor,
                borderWidth: 2,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 16
                },
                padding: 12,
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        let rating = getFIFARating(value);
                        return `${playerName}: ${value} ${rating}`;
                    },
                    afterLabel: function(context) {
                        const value = context.raw;
                        if (value >= 100) return "🌟🌟🌟 Rang Absolu";
                        if (value >= 95) return "⭐⭐⭐ Rang Ultime";
                        if (value >= 90) return "⭐⭐ Rang Élite";
                        if (value >= 85) return "⭐ Rang Avancé";
                        return "";
                    }
                }
            }
        },
        
        interaction: {
            intersect: false,
            mode: 'nearest'
        },
        
        animation: {
            duration: 1200,
            easing: 'easeOutQuart'
        }
    };
}

// ⭐ NOTATION FIFA
function getFIFARating(value) {
    if (value >= 95) return "| SSS";
    if (value >= 90) return "| SS";
    if (value >= 85) return "| S";
    if (value >= 80) return "| A";
    if (value >= 75) return "| B";
    if (value >= 70) return "| C";
    if (value >= 65) return "| D";
    if (value >= 60) return "| E";
    if (value >= 55) return "| F";
    if (value >= 50) return "| G";
    return "";
}

// Animation des points
function animateRadarPoints() {
    if (!radarChart) return;
    
    const meta = radarChart.getDatasetMeta(0);
    
    meta.data.forEach((point, index) => {
        setTimeout(() => {
            point.radius = 6;
            radarChart.update('none');
        }, index * 150);
    });
}

// ==================== INITIALISATION RADAR ====================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script radar chargé pour", document.title);
    
    // Vérifier si les éléments radar existent sur cette page
    const openRadarBtn = document.getElementById("openRadarPopup");
    const popupRadar = document.getElementById("popupRadar");
    const closeRadarBtn = document.getElementById("closeRadarPopup");
    
    if (openRadarBtn && popupRadar) {
        console.log("Éléments radar détectés, initialisation...");
        
        // Réassigner les événements (au cas où ils soient perdus)
        openRadarBtn.onclick = () => {
            console.log("Ouverture popup radar");
            popupRadar.style.display = "flex";
            setTimeout(createUniversalRadarChart, 100);
        };
        
        if (closeRadarBtn) {
            closeRadarBtn.onclick = closeRadarPopup;
        }
        
        // Fermer en cliquant dehors
        window.addEventListener("click", (e) => {
            if (e.target === popupRadar) closeRadarPopup();
        });
    } else {
        console.log("Pas d'éléments radar sur cette page");
    }
});

// Fonction de fermeture (doit être accessible globalement)
function closeRadarPopup() {
    const popupRadar = document.getElementById("popupRadar");
    if (popupRadar) {
        popupRadar.style.display = "none";
    }
    if (radarChart) {
        radarChart.destroy();
        radarChart = null;
    }
}

