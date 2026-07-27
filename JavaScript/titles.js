const characters = [
  {
    id: "isagi",
    name: "Isagi",
    rarity: "commun",
    rarityLabel: "Commun · 85,1 %",
    difficulty: 0,
    ultimate: "Heart of Blue Lock",
    description:
      "Le point d’entrée idéal dans la ligue. Isagi transforme la lecture du jeu en arme et récompense les décisions simples, prises au bon moment.",
    conditions: [
      "Marquer 10 fois avec Direct Shot",
      "Marquer 1 fois avec My Direct Shot",
      "Marquer 1 fois avec Reflex Shot",
      "Voler 5 fois la balle d’un allié avec « Move It »",
    ],
  },
  {
    id: "gagamaru",
    name: "Gagamaru",
    rarity: "commun",
    rarityLabel: "Commun · 85,1 %",
    difficulty: 5,
    ultimate: "The Overseer",
    description:
      "Un gardien sauvage, spectaculaire et totalement imprévisible. Son jeu aérien crée des séquences qu’aucun autre personnage ne peut reproduire.",
    conditions: [
      "Marquer 5 fois avec Scorpion",
      "Sauver 5 tirs avec Diving Header",
      "Sauver 5 tirs avec Scorpion",
      "Terminer un match sans encaisser de but",
    ],
  },
  {
    id: "nagi",
    name: "Nagi",
    rarity: "rare",
    rarityLabel: "Rare · 8,5 %",
    difficulty: 2,
    ultimate: "The Fallen Genius",
    description:
      "Un contrôle de balle irréel et un moveset parmi les plus complets du jeu. Facile à comprendre, beaucoup plus exigeant à perfectionner.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "chigiri",
    name: "Chigiri",
    rarity: "rare",
    rarityLabel: "Rare · 8,5 %",
    difficulty: 1,
    ultimate: "The Red Panther",
    description:
      "La vitesse à l’état pur. Chigiri fend les lignes, force les duels et possède l’un des ultimes les plus oppressants de la ligue.",
    conditions: [
      "Marquer 10 fois avec « Mach Cut-In »",
      "Marquer 1 fois depuis la Golden Zone",
      "Voler 5 fois la balle avec « Non-Stop Dribble » en ultime",
    ],
  },
  {
    id: "bachira",
    name: "Bachira",
    rarity: "rare",
    rarityLabel: "Rare · 8,5 %",
    difficulty: 2,
    ultimate: "The Monster",
    description:
      "Trois dribbles, un tir instinctif et une créativité permanente. Bachira invite à provoquer chaque défenseur jusqu’à faire sortir le monstre.",
    conditions: [
      "Marquer 10 fois avec « Bon! », toutes variantes",
      "Marquer 5 fois avec Monster Leap",
      "Marquer 1 fois avec « Bee Shot »",
      "Marquer 1 fois avec « Monster Trance »",
      "Réussir 5 contres",
      "Dribbler toute l’équipe adverse en ultime puis marquer",
    ],
  },
  {
    id: "shidou",
    name: "Shidou",
    rarity: "rare",
    rarityLabel: "Rare · 8,5 %",
    difficulty: 5,
    ultimate: "The Devil",
    description:
      "Un finisseur explosif qui dépend des passes et punit chaque ballon bien servi. Difficile à dompter, terrifiant quand le rythme s’installe.",
    conditions: [
      "Marquer 10 fois avec « Formless »",
      "Réussir 5 Diving Header",
      "Marquer 1 fois avec Big Bang Drive",
      "Marquer 1 fois avec Dragon Drive",
      "Marquer 5 fois avec Backheel Shot Pivot",
      "Déclencher l’Auto Goal",
    ],
  }, /*
  {
    id: "niko",
    name: "Niko",
    rarity: "rare",
    rarityLabel: "Rare · à venir",
    difficulty: 3,
    ultimate: "The Watchtower",
    description:
      "Encore en observation. Sa lecture défensive rejoindra bientôt les archives officielles de la Nebula League.",
    conditions: ["Conditions à découvrir lors de sa sortie."],
    available: false,
  }, */
  {
    id: "kurona",
    name: "Kurona",
    rarity: "legendary",
    rarityLabel: "Légendaire · 4,3 %",
    difficulty: 4,
    ultimate: "Planet Hotline",
    description:
      "Un passeur orbital qui crée des circuits impossibles à défendre. Son efficacité grimpe avec la qualité et l’anticipation de ses partenaires.",
    conditions: [
      "Voler 10 ballons avec « Guard Dog »",
      "Voler 5 fois la balle avec « Close Quarter Dribble » en ultime",
      "Réussir l’Auto Goal de « Orbital Resonance »",
    ],
  },
  {
    id: "charles",
    name: "Charles",
    rarity: "legendary",
    rarityLabel: "Légendaire · 4,3 %",
    difficulty: 3,
    ultimate: "The Imp",
    description:
      "L’imprévisible prodige est encore classé confidentiel. Ses défis seront révélés avec sa sortie.",
    conditions: ["Conditions à découvrir lors de sa sortie."],
    available: false,
  },
  {
    id: "kunigami",
    name: "Kunigami",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 3,
    ultimate: "The Wild Card",
    description:
      "Puissance, impact et contrôle physique. Kunigami peut étouffer une action en défense avant de la terminer lui-même en attaque.",
    conditions: [
      "Marquer 10 fois avec « Lefty Shot »",
      "Marquer 5 fois avec « Justice Header »",
      "Récupérer 10 ballons avec « Hero’s Instinct »",
      "Voler 5 ballons avec Heroic Clash",
      "Marquer avec « Demon’s Contract » en ultime",
      "Déclencher l’Auto Goal",
    ],
  },
  {
    id: "yukimiya",
    name: "Yukimiya",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 4,
    ultimate: "The 1-on-1 Emperor",
    description:
      "Un spécialiste du duel qui mêle dribbles précis et Predator Eye. Une fois lancé, chaque un-contre-un devient son terrain de chasse.",
    conditions: [
      "Marquer 10 fois avec « Gyro Shot », toutes variantes",
      "Réussir un contre Street Tag parfait",
      "Marquer avec « Pacifist Gyro Shot » en ultime",
      "Dribbler toute l’équipe adverse avec Street-Style puis marquer",
    ],
  },
  {
    id: "aiku",
    name: "Aiku",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 3,
    ultimate: "The Snake",
    description:
      "Un pur défenseur, méthodique et venimeux. Bien joué, Aiku ne se contente pas de fermer l’espace : il retourne le match.",
    conditions: [
      "Voler 15 ballons avec « Reflex Tackle »",
      "Intercepter 10 ballons avec « Venom Trap »",
      "Intercepter 3 ballons avec « Ultimate Defense »",
      "Marquer 1 fois avec « Former Striker »",
    ],
  },
  {
    id: "barou",
    name: "Barou",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 2,
    ultimate: "The KING",
    description:
      "Une machine à buts sans détour. Ses dribbles avancent, ses tirs punissent et son Stealth Shot transforme la moindre ouverture en sentence.",
    conditions: [
      "Marquer 10 fois avec « Long Shot »",
      "Marquer 5 fois avec « Stealth Shot: Apex Predator »",
      "Voler 3 ballons avec « Predator Eye »",
      "Réussir l’Auto Goal de « DEVOUR. »",
    ],
  },
  {
    id: "sae",
    name: "Sae",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 3,
    ultimate: "Japan’s Greatest Treasure",
    description:
      "Élégant, direct et redoutablement efficace. Ses dribbles protègent, ses passes découpent et ses tirs pardonnent très peu d’erreurs.",
    conditions: [
      "Marquer 10 fois avec « Drive Shot », toutes variantes",
      "Réussir 3 fois le combo Rabona Nutmeg → Magic Pass",
      "Déclencher l’Auto Goal de « Control »",
      "Faire 5 passes avec « Magic Pass: Calculated »",
      "Marquer 1 fois avec « Cross Elastico »",
    ],
  },
  {
    id: "kiyora",
    name: "Kiyora",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 4,
    ultimate: "God’s Unknown Plan",
    description:
      "Un dribbleur-passeur aux trajectoires difficiles à lire. Son contrôle du borderline peut créer le génie comme le chaos.",
    conditions: [
      "Marquer 10 fois avec « Windmill Shot »",
      "Faire une passe avec « Twister Pass » en ultime",
      "Faire une passe avec « Borderline »",
      "Marquer 1 fois avec « Borderline »",
      "Réussir la Chemical Reaction avec Kaiser",
    ],
  },
  {
    id: "karasu",
    name: "Karasu",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 2,
    ultimate: "The Crow",
    description:
      "Exceptionnel à la récupération, excellent pour casser les lignes. Karasu gagne les duels sales et transforme la défense en première passe.",
    conditions: [
      "Étourdir 2 adversaires avec « Wing-Arm Block » puis passer",
      "Voler 10 fois la balle avec « Silent Steal »",
      "Voler la balle avec « Silent Steal » en ultime",
      "Faire une passe décisive avec « New Goal Method »",
      "Marquer 1 fois avec « Talon’s Grasp »",
    ],
  },
  {
    id: "otoya",
    name: "Otoya",
    rarity: "mythical",
    rarityLabel: "Mythique · 1,7 %",
    difficulty: 5,
    ultimate: "Stealthy Ninja",
    description:
      "Polyvalent, mobile et discret. Otoya infiltre les intervalles, mais demande une exécution précise pour convertir son large arsenal.",
    conditions: [
      "Marquer 10 fois avec « Shuriken Shot »",
      "Marquer avec « Kusarigama Slash » sur la passe d’un allié",
      "Marquer 1 fois avec « Center of The World »",
      "Marquer 1 fois avec « Extraordinary Combo »",
      "Récupérer la balle avec « Not Gonna Happen »",
    ],
  }, /*
  {
    id: "ness",
    name: "Ness",
    rarity: "mythical",
    rarityLabel: "Mythique · à venir",
    difficulty: 3,
    ultimate: "The Magician",
    description:
      "Le magicien attend encore son entrée officielle. Sa fiche complète sera ouverte dès son arrivée dans la ligue.",
    conditions: ["Conditions à découvrir lors de sa sortie."],
    available: false,
  }, */
  {
    id: "kaiser",
    name: "Kaiser",
    rarity: "worldclass",
    rarityLabel: "World Class · 0,4 %",
    difficulty: 2,
    ultimate: "The Blue Rose",
    description:
      "Un empereur immédiatement dangereux. Facile à prendre en main, il réserve sa véritable exigence à la maîtrise du Magnus.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "lorenzo",
    name: "Lorenzo",
    rarity: "worldclass",
    rarityLabel: "World Class · 0,4 %",
    difficulty: 4,
    ultimate: "The Zombie",
    description:
      "Un défenseur qui devient dangereux à mesure que le duel s’étire. Son ultime dévore les possessions et ouvre la transition.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "rin",
    name: "Rin",
    rarity: "worldclass",
    rarityLabel: "World Class · 0,4 %",
    difficulty: 1,
    ultimate: "The Beast",
    description:
      "Des I-Frames, une courbe terrifiante et un ultime aux possibilités presque abusives. Rin impose son scénario au match.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "reo",
    name: "Reo",
    rarity: "worldclass",
    rarityLabel: "World Class · 0,4 %",
    difficulty: 4,
    ultimate: "Master of All Trades",
    description:
      "Une boîte à outils totale. Reo sait tout faire, mais son nombre de variantes transforme chaque décision en test de maîtrise.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "nel-isagi",
    name: "Isagi",
    edition: "NEL",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 2,
    ultimate: "Genius of Adaptation",
    description:
      "Une évolution silencieuse et létale. Raumdeuter le fait disparaître des radars avant que l’un des meilleurs tirs du jeu ne termine l’action.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "hiori",
    name: "Hiori",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 4,
    ultimate: "Ultra Sadist",
    description:
      "Un support chirurgical. Bien piloté, Hiori contrôle le tempo, fabrique les angles et transforme ses alliés en armes.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "lorenzo2",
    name: "Lorenzo",
    edition: "Mastery",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 3,
    ultimate: "The Ace Eater",
    description:
      "Deux fois plus d’options, deux fois plus de danger. Cette maîtrise transforme chaque move de Lorenzo en embranchement défensif.",
    conditions: [
      "Marquer 10 fois avec « Heavy »",
      "Utiliser « Control » en l’air puis marquer 3 fois",
      "Déclencher l’Auto Goal de « Control »",
      "Marquer 1 fois avec Jumping Turn",
      "Marquer avec « Heavy » en ultime",
      "Réaliser le Five Stage Revolver Shoot",
    ],
  },
  {
    id: "aiku2",
    name: "Aiku",
    edition: "Mastery",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 3,
    ultimate: "The Final Wall",
    description:
      "La dernière muraille est encore verrouillée. Son dossier sera déclassifié lors de sa sortie officielle.",
    conditions: ["Conditions à découvrir lors de sa sortie."],
  },
  {
    id: "kaiser2",
    name: "Kaiser",
    edition: "Mastery",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 3,
    ultimate: "Emperor's Chosen One",
    description:
      "La dernière muraille est encore verrouillée. Son dossier sera déclassifié lors de sa sortie officielle.",
    conditions: ["Conditions à découvrir lors de sa sortie."],
  },
  {
    id: "rin2",
    name: "Rin",
    edition: "Mastery",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 3,
    ultimate: "The Berserker",
    description:
      "La dernière muraille est encore verrouillée. Son dossier sera déclassifié lors de sa sortie officielle.",
    conditions: ["Conditions à découvrir lors de sa sortie."],
  },
];

window.NEBULA_DATA = window.NEBULA_DATA || {};
window.NEBULA_DATA.characters = characters;

const rarityMeta = {
  commun: { label: "Commun", accent: "#62f6bd", short: "C" },
  rare: { label: "Rare", accent: "#63a9ff", short: "R" },
  legendary: { label: "Légendaire", accent: "#ffd45b", short: "L" },
  mythical: { label: "Mythique", accent: "#ff71ffff", short: "M" },
  worldclass: { label: "World Class", accent: "#ff5f5fff", short: "WC" },
  mastery: { label: "Mastery", accent: "#ffffffff", short: "MX" }
};
const imageBase = "images/icons";
let selectedId = "isagi";
let activeRarity = "all";
let searchTerm = "";

const grid = document.getElementById("character-grid");
const playerFile = document.getElementById("player-file");
const search = document.getElementById("search");
const resultCount = document.getElementById("result-count");
const profileCount = document.getElementById("profile-count");
const challengeCount = document.getElementById("challenge-count");

if (grid && playerFile && search && resultCount && profileCount && challengeCount) {
  profileCount.textContent = String(characters.length).padStart(2, "0");
  challengeCount.textContent = characters.reduce((sum, character) => sum + character.conditions.length, 0);

  function getChecked(id) {
    try { return JSON.parse(localStorage.getItem("nebula-title-progress-" + id) || "[]"); }
    catch { return []; }
  }

  function saveChecked(id, checked) {
    localStorage.setItem("nebula-title-progress-" + id, JSON.stringify(checked));
  }

  function renderGrid() {
    const filtered = characters.filter((character) => {
      const rarityMatch = activeRarity === "all" || character.rarity === activeRarity;
      const queryMatch = !searchTerm || (character.name + " " + (character.edition || "") + " " + character.ultimate).toLowerCase().includes(searchTerm);
      return rarityMatch && queryMatch;
    });

    resultCount.textContent = String(filtered.length).padStart(2, "0") + " RÉSULTATS";
    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state"><span>404</span><strong>Aucun ego détecté.</strong><button type="button" id="reset-filters">Réinitialiser les filtres</button></div>';
      document.getElementById("reset-filters").addEventListener("click", () => {
        search.value = "";
        searchTerm = "";
        activeRarity = "all";
        document.querySelectorAll(".rarity-filters button").forEach((button) => button.classList.toggle("active", button.dataset.rarity === "all"));
        renderGrid();
      });
      return;
    }

    grid.innerHTML = filtered.map((character) => {
      const meta = rarityMeta[character.rarity];
      const index = characters.indexOf(character);
      return `<button type="button" class="character-card ${selectedId === character.id ? "selected" : ""} ${character.available === false ? "locked" : ""}" style="--accent:${meta.accent}" data-id="${character.id}">
          <span class="card-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="card-rarity">${meta.short}</span>
          <span class="portrait-wrap"><img src="${imageBase}/${character.id}.png" alt="" loading="lazy"></span>
          <span class="card-scanline"></span>
          <span class="card-info">
            <small>${character.rarityLabel}</small>
            <strong>${character.name}${character.edition ? "<em>" + character.edition + "</em>" : ""}</strong>
            <span>${character.ultimate}</span>
          </span>
          <span class="card-action">${character.available === false ? "DOSSIER SCELLÉ" : "INSPECTER"}<i>↗</i></span>
        </button>`;
    }).join("");

    grid.querySelectorAll(".character-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedId = card.dataset.id;
        renderGrid();
        renderFile();
        if (innerWidth < 1080) {
          playerFile.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          const questSection = playerFile.querySelector(".progress-heading");
          playerFile.scrollTo({
            top: Math.max(0, questSection.offsetTop - 56),
            behavior: "smooth"
          });
        }
      });
    });
  }

  function renderFile() {
    const character = characters.find((item) => item.id === selectedId) || characters[0];
    const meta = rarityMeta[character.rarity];
    const checked = getChecked(character.id);
    const progress = Math.round((checked.length / character.conditions.length) * 100);
    const index = characters.indexOf(character);
    playerFile.style.setProperty("--accent", meta.accent);
    playerFile.innerHTML = `
        <div class="file-topline">
          <span>DOSSIER // ${character.id.toUpperCase()}</span>
          <span class="file-status"><i></i> ${character.available === false ? "SCELLÉ" : "ACTIF"}</span>
        </div>
        <div class="file-visual">
          <div class="file-number">${String(index + 1).padStart(2, "0")}</div>
          <div class="file-target" aria-hidden="true"><span></span></div>
          <img src="${imageBase}/${character.id}.png" alt="${character.name}">
          <span class="file-rarity-code">${meta.short}</span>
        </div>
        <div class="file-identity">
          <p>${character.rarityLabel}</p>
          <h3>${character.name}${character.edition ? "<em>" + character.edition + "</em>" : ""}</h3>
          <div class="difficulty"><span>DIFFICULTÉ</span><div aria-label="${character.difficulty} sur 5">${[1, 2, 3, 4, 5].map((star) => '<i class="' + (star <= character.difficulty ? "filled" : "") + '"></i>').join("")}</div></div>
          <p class="file-description">${character.description}</p>
        </div>
        <div class="ultimate-block"><small>TITRE ULTIME</small><strong>${character.ultimate}</strong></div>
        <div class="progress-heading"><div><span>PROTOCOLE D’ÉVEIL</span><small>${checked.length}/${character.conditions.length} OBJECTIFS</small></div><strong>${progress}%</strong></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <div class="condition-list">
          ${character.conditions.map((condition, conditionIndex) => {
      const done = checked.includes(conditionIndex);
      return `<button type="button" class="${done ? "done" : ""}" data-condition="${conditionIndex}"><span class="condition-box">${done ? "✓" : ""}</span><span><small>OBJECTIF ${String(conditionIndex + 1).padStart(2, "0")}</small>${condition}</span></button>`;
    }).join("")}
        </div>
        ${progress === 100 && character.available !== false ? `<div class="unlocked-banner"><span>✦</span><div><small>TITRE DÉBLOQUÉ</small><strong>${character.ultimate}</strong></div></div>` : ""}
      `;

    playerFile.querySelectorAll(".condition-list button").forEach((button) => {
      button.addEventListener("click", () => {
        const conditionIndex = Number(button.dataset.condition);
        const next = checked.includes(conditionIndex) ? checked.filter((item) => item !== conditionIndex) : [...checked, conditionIndex];
        saveChecked(character.id, next);
        renderFile();
      });
    });
  }

  search.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderGrid();
  });

  document.querySelectorAll(".rarity-filters button").forEach((button) => {
    button.addEventListener("click", () => {
      activeRarity = button.dataset.rarity;
      document.querySelectorAll(".rarity-filters button").forEach((item) => item.classList.toggle("active", item === button));
      renderGrid();
    });
  });

  const menuButton = document.querySelector(".menu-button");
  const mainNav = document.querySelector(".main-nav");
  menuButton.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  renderGrid();
  renderFile();
}
