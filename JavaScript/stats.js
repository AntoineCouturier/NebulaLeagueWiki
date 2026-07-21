// 🔥 COULEURS DEGRADÉES SELON TON ORDRE
const CLUB_COLORS = {
    "Bastard Munchen": { from: "#be0000", to: "#000000" },
    "PXG": { from: "#0009ab", to: "#c50d00" },
    "Ubers": { from: "#29ce00", to: "#ffffffff" },
    "Barcha": { from: "#ffe100", to: "#56007a" },
    "Manshine City": { from: "#00b3ff", to: "#a1ffff" },
    "Retraite": { from: "#ff8c00ff", to: "#c900dfff" },
};

// 🔥 LOGOS — nommage automatique (img/clubs/)
const CLUB_LOGOS = club => `images/clubs_icon/${club.replace(/\s+/g, "_")}.png`;


// ------------------------
// TES DONNÉES (NON MODIFIÉES)
// ------------------------
const DATA = {
    topScorer: { name: "Aucun", goals: 0, club: "Retraite" },
    topPasser: { name: "Aucun", passes: 0, club: "Retraite" },
    topDefender: { name: "Aucun", defenses: 0, club: "Retraite" },
    topPrice: { name: "Aucun", price: "0¥💎", club: "Retraite" },
    topClub: { name: "Aucun", titles: 0, club: "Retraite" },

    clubsAlltime: [
        { rank: 1, name: "Manshine City", points: 0, titles: 0, winpct: 0, diff: 0 },
        { rank: 2, name: "PXG", points: 0, titles: 0, winpct: 0, diff: 0 },
        { rank: 3, name: "Ubers", points: 0, titles: 0, winpct: 0, diff: 0 },
        { rank: 4, name: "Barcha", points: 0, titles: 0, winpct: 0, diff: 0 },
        { rank: 5, name: "Bastard Munchen", points: 0, titles: 0, winpct: 0, diff: 0 }
    ],

    scorers: [
        { rank: 1, name: "???", club: "Bastard Munchen", goals: 0, avg: 0 },
        { rank: 2, name: "???", club: "PXG", goals: 0, avg: 0 },
        { rank: 3, name: "???", club: "Ubers", goals: 0, avg: 0 },
        { rank: 4, name: "???", club: "Barcha", goals: 0, avg: 0 },
        { rank: 5, name: "???", club: "Manshine City", goals: 0, avg: 0 },
    ],


    records: [

        // ----------------------------
        // Records All Time
        // ----------------------------
        { title: "Match le plus prolifique", value: "??? — 0 Buts" }, // { title: "Match le plus prolifique", value: "Manshine City 13 - 2 PXG (15 buts)" },
        { title: "Plus grosse victoire", value: "??? — 0 Buts" }, // { title: "Plus grosse victoire", value: "Manshine City 13 - 2 PXG (11 buts)" },
        { title: "Série d'invincibilité", value: "??? — 0 Matchs" }, // { title: "Série d'invincibilité", value: "Manshine City — 1 matchs" },
        { title: "Meilleur Buteur en une seul Saison", value: "??? — 0 Buts" }, // { title: "Meilleur Buteur en une seul Saison", value: "Dylan — 6 Buts" },
        { title: "Meilleur Offense", value: "??? — 0 Buts Marqués" }, // { title: "Meilleur Offense", value: "Manshine City — 13 Buts Marqués" },
        { title: "Meilleur Defense", value: "??? — 0 Buts Encaissés" }, // { title: "Meilleur Defense", value: "Manshine City — 2 Buts Encaissés" },
        { title: "Buts le Plus Rapide", value: "??? — 0s" }, // { title: "Buts le Plus Rapide", value: "Dylan — 43s" },
        {
            title: "Meilleur But de tout les Temps",
            value: `<a href="Autre/greatest_goal.html" target=_blank class="record-btn">Voir →</a>`
        },
        {
            title: "Pire Raté de tout les Temps",
            value: `<a href="Autre/worst_goal.html" target=_blank class="record-btn">Voir →</a>`
        }

    ],

    clubsPerformance: [
        { club: "Manshine City", value: 0 },
        { club: "Bastard Munchen", value: 0 },
        { club: "Ubers", value: 0 },
        { club: "Barcha", value: 0 },
        { club: "PXG", value: 0 }
    ]
};


// ----------------------------
// Injection des stat-cards
// ----------------------------
document.getElementById("topScorer").textContent = DATA.topScorer.name + " (" + DATA.topScorer.goals + ")";
document.getElementById("topPasser").textContent = DATA.topPasser.name + " (" + DATA.topPasser.passes + ")";
document.getElementById("topDefender").textContent = DATA.topDefender.name + " (" + DATA.topDefender.defenses + ")";
document.getElementById("topPrice").textContent = DATA.topPrice.name + " (" + DATA.topPrice.price + ")";
document.getElementById("topClub").textContent = DATA.topClub.name + " (" + DATA.topClub.titles + ")";


// ----------------------------
// FONCTION LIGNE CLUB avec LOGO
// ----------------------------
const clubRow = c => `
<tr>
    <td>${c.rank}</td>
    <td>
        <img src="${CLUB_LOGOS(c.name)}" class="club-icon"> 
        ${c.name}
    </td>
    <td>${c.points}</td>
    <td>${c.titles}</td>
    <td>${c.winpct}%</td>
    <td>${c.diff}</td>
</tr>
`;


// ----------------------------
// Tableau all-time + TRI
// ----------------------------
let clubsTableData = [...DATA.clubsAlltime];

// Créer une copie pour le classement naturel (toujours décroissant)
function getNaturalRanking() {
    // Trier par points décroissant pour le classement naturel
    return [...DATA.clubsAlltime].sort((a, b) => b.points - a.points);
}

// Calculer les rangs une fois pour toutes selon le classement naturel
const naturalRanking = getNaturalRanking();
const rankMap = {};
naturalRanking.forEach((club, index) => {
    rankMap[club.name] = index + 1; // #1, #2, etc.
});

const tbodyAll = document.querySelector("#alltime-table tbody");

function renderAllTime() {
    tbodyAll.innerHTML = "";

    clubsTableData.forEach(c => {
        // Utiliser le rang naturel (toujours le même) peu importe le tri
        const rank = rankMap[c.name] || 0;

        tbodyAll.innerHTML += `
        <tr>
            <td>${rank}</td>
            <td>
                <img src="${CLUB_LOGOS(c.name)}" class="club-icon"> 
                ${c.name}
            </td>
            <td>${c.points}</td>
            <td>${c.titles}</td>
            <td>${c.winpct}%</td>
            <td>${c.diff}</td>
        </tr>
        `;
    });
}

// Trier par défaut selon les points (décroissant) au chargement
clubsTableData.sort((a, b) => b.points - a.points);
renderAllTime();

document.querySelectorAll("#alltime-table th").forEach((th, index) => {
    if (index < 2) return; // On ne trie pas Rank / Nom

    let asc = false;
    th.style.cursor = "pointer";

    th.addEventListener("click", () => {
        const keys = ["points", "titles", "winpct", "diff"];
        const key = keys[index - 2];

        asc = !asc;

        clubsTableData.sort((a, b) => {
            if (a[key] === "No Data") return 1;
            if (b[key] === "No Data") return -1;
            return asc ? a[key] - b[key] : b[key] - a[key];
        });

        renderAllTime();
    });
});


// ----------------------------
// Tableau buteurs (+ logos)
// ----------------------------
const tbodySc = document.querySelector("#scorers-table tbody");

DATA.scorers.forEach(s => {
    tbodySc.innerHTML += `
        <tr>
            <td>${s.rank}</td>
            <td>${s.name}</td>
            <td>
                <img src="${CLUB_LOGOS(s.club)}" class="club-icon">
                ${s.club}
            </td>
            <td>${s.goals}</td>
            <td>${s.avg}</td>
        </tr>
    `;
});


// ----------------------------
// Records
// ----------------------------


// ----------------------------
// CLUB MINI-BARRES ANIMÉES + LOGO
// ----------------------------
const clubsPerf = document.getElementById("clubsPerfs");

DATA.clubsPerformance.forEach((c) => {
    const barID = "bar_" + c.club.replace(/\s+/g, "_");

    // Création du conteneur
    const clubDiv = document.createElement("div");
    clubDiv.className = "club-mini";

    // Titre + logo
    const h4 = document.createElement("h4");
    const img = document.createElement("img");
    img.src = CLUB_LOGOS(c.club);
    img.className = "club-icon";
    img.alt = c.club;
    h4.appendChild(img);
    h4.appendChild(document.createTextNode(c.club));
    clubDiv.appendChild(h4);

    // Conteneur de la barre
    const container = document.createElement("div");
    container.className = "mini-bar-container";

    // Barre
    const bar = document.createElement("div");
    bar.className = "mini-bar";
    bar.id = barID;

    // Dégradé selon le club
    const colors = CLUB_COLORS[c.club] || { from: "#ddd", to: "#aaa" };
    bar.style.background = `linear-gradient(90deg, ${colors.from}, ${colors.to})`;
    bar.style.width = "0%"; // départ pour animation

    container.appendChild(bar);
    clubDiv.appendChild(container);

    clubsPerf.appendChild(clubDiv);

    // Animation fluide
    setTimeout(() => {
        bar.style.width = c.value + "%";
    }, 50);
});

const alltimeList = document.getElementById("records-alltime");
const seasonList = document.getElementById("records-season");

// On sépare les records selon leur type (ici je suppose que tu as All-Time et Saison)
const allTimeRecords = DATA.records.filter(r => !r.season);
const seasonRecords = DATA.records.filter(r => r.season);

// Injection
allTimeRecords.forEach(r => {
    alltimeList.innerHTML += `<li><strong>${r.title}:</strong> ${r.value}</li>`;
});

seasonRecords.forEach(r => {
    seasonList.innerHTML += `<li><strong>${r.title}:</strong> ${r.value}</li>`;
});

// Toggle boutons
document.querySelectorAll(".records-toggle .record-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".records-toggle .record-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const target = btn.getAttribute("data-target");
        if (target === "alltime") {
            alltimeList.style.display = "block";
            seasonList.style.display = "none";
        } else {
            alltimeList.style.display = "none";
            seasonList.style.display = "block";
        }
    });
});

// Exemple pour topScorer
const topScorerCard = document.getElementById("topScorer");
topScorerCard.innerHTML = `
    ${DATA.topScorer.name} (${DATA.topScorer.goals})
    <img src="${CLUB_LOGOS(DATA.topScorer.club)}" class="stat-card-img" alt="Logo Club">
`;

// Même principe pour les autres cartes
const topPasserCard = document.getElementById("topPasser");
topPasserCard.innerHTML = `
    ${DATA.topPasser.name} (${DATA.topPasser.passes})
    <img src="${CLUB_LOGOS(DATA.topPasser.club)}" class="stat-card-img" alt="Logo Club">
`;

const topDefenderCard = document.getElementById("topDefender");
topDefenderCard.innerHTML = `
    ${DATA.topDefender.name} (${DATA.topDefender.defenses})
    <img src="${CLUB_LOGOS(DATA.topDefender.club)}" class="stat-card-img" alt="Logo Club">
`;

const topPriceCard = document.getElementById("topPrice");
topPriceCard.innerHTML = `
    ${DATA.topPrice.name} (${DATA.topPrice.price})
    <img src="${CLUB_LOGOS(DATA.topPrice.club)}" class="stat-card-img" alt="Logo Club">
`;

const topClubCard = document.getElementById("topClub");
topClubCard.innerHTML = `
    ${DATA.topClub.name} (${DATA.topClub.titles})
    <img src="${CLUB_LOGOS(DATA.topClub.club)}" class="stat-card-img" alt="Logo Club">
`;
