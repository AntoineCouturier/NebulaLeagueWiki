const characters = [
  {
    id: "isagi",
    name: "Isagi",
    rarity: "commun",
    rarityLabel: "Commun · 85,1 %",
    difficulty: 0,
    ultimate: "Heart of Blue Lock",
    description:
      "« Become the one who chooses, not the one waiting to be chosen. »",
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
      "« My greatest weapon is my close-quarter plays. »",
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
      "« You sure bark a lot for a loser. I’ll win and make you my servant. »",
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
      "« The best striker in the world, is me! »",
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
      "« My creativity cannot stop! »",
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
      "« RIGHT IN THE WOMB! »",
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
      "« Let’s go. Blue Lock.. Domination... »",
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
      "« Alright! I Will... GIVE YOU THE NASTIEST PASS!! »",
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
      "« I'm not a Hero Anymore. I Left that Immature Joke Back in Hell »",
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
      "« God only gives us trials that we can overcome. »",
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
      "« For the rebirth of Japanese football, I am the final wall! »",
    conditions: [
      "Voler 15 ballons avec « Reflex Tackle »",
      "Intercepter 10 ballons ennemis avec « Venom Trap »",
      "Voler la balle 3 fois avec « Flow Steal »",
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
      "« On the field, I’m the King. »",
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
      "« Only the Idiots who can follow me... Get to see the Scenery that comes Next »",
    conditions: [
      "Marquer 10 fois avec « Drive Shot », toutes variantes",
      "Réussir 3 fois le combo Rabona Nutmeg → Magic Pass",
      "Déclencher l’Auto Goal de « Control »",
      "Faire 3 passes avec « Magic Pass: Calculated »",
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
      "« Sharpen your blade, and prepare for the battle. »",
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
      "« If you can't prove your value, there's no meaning to you playing. »",
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
      "« I've Seen that move more than my own parents. »",
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
      "« Get on your damn knees, Blue Lock. »",
    conditions: [
      "Marquer 10 fois avec « Kaiser Impact »",
      "Marquer 5 fois avec « Kaiser Impact: Magnus »",
      "Marquer 3 fois avec « Insta-Kill Flash »",
      "Marquer 1 fois avec « Kaiser Impact: Beinschuss »",
      "Marquer 1 fois avec « Super-Star »",
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
      "« Yo, Michael... »",
    conditions: [
      "Bloquer/Intercepter 10 Ballons avec soit « Defensive Stence » ou « Horrific Intercept »",
      "Marquer 1 fois avec « Ace Eater »",
      "Voler la Balle 3 fois avec « Yo Michael »",
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
      "« Disgusting, it makes me want to puke… I’LL MANGLE YOU! »",
    conditions: [
      "Marquer 10 fois avec « Curve Shot »",
      "Marquer 5 fois avec « Curve Shot: Obliterate »",
      "Marquer 1 fois avec « Crash Shot »",
      "Marquer 1 fois avec « Kill. »",
      "Marquer 1 fois avec « VIP Seat »",
      "Detruire 3 Joueurs avec « Center of Gravity: Full-Burst »",
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
      "« Even God... Decided to become my Ally..! »",
    conditions: [
      "Contrer 5 fois avec « Cross Elastico »",
      "Faire un Pressing sur 5 Joueurs qui se la font apres voler par un mate grace à « Dobermann Press »",
      "Marquer 5 fois avec « Draconic Shot »",
      "Intercepter 3 Ballons avec l'activation d'Ulti Defensif",
      "Marquer 1 fois avec « Panther Shot: Mirror Shot »",
      "Marquer 1 fois avec Un Move d'Ulti copié",
      "Marquer 1 fois avec « Chameleon Volley »",
      "Voler la balle 1 fois avec « Breakdancing Tackle »",
      "Voler la balle 1 fois avec « Meta-Vision! »"
    ],
  },
  {
    id: "nel-isagi",
    name: "NEL Isagi",
    rarity: "mastery",
    rarityLabel: "Mastery",
    difficulty: 2,
    ultimate: "Genius of Adaptation",
    description:
      "« Keep Playing Crazy Soccer you Damn Geniuses... You'll Never Outsmart Us. »",
    conditions: [
      "Marquer 10 fois avec « Neo-Direct Shot »",
      "Marquer 3 fois avec « Neo-Volley Shot »",
      "Intercepter 3 Ballons avec « Meta-Burst Point Trap »",
      "Reussir 3 fois « Feint »",
      "Marquer 1 fois avec « Lefty Shot »",
      "Marquer 1 fois avec « Rebirt » ou « Two-Gun Volley »",
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
      "« For the first time in my life, I'm going to believe in myself. »",
    conditions: [
      "Bloquer 5 Tirs avec « Frost Guard »",
      "Marquer 3 fois avec « Solo Link Up »",
      "Contrer 3 fois avec « Chilling Counter »",
      "Faire une Passe qui Menera à une passe Decisive avec « No-Look Alley Cross »",
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
      "« There's Nothin' in this World that Money Can't Buy, 'Kay? »",
    conditions: [
      "Contrer 3 fois avec « Zombie Step Feint »",
      "Bloquer/Intercepter 10 Ballons avec soit « Defensive Stence » ou « Horrific Intercept »",
      "Bloquer 1 tir avec « Penalty Flow Awakening »",
      "Voler la Balle 3 fois avec « Yo Michael »",
      "Reussir les 2 Dribbles puis marquer avec « Ace Eater »",
      "Voler la balle Grace à « Chow Time »",
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
      "That Kind of Shitty Bluff, Won't Work on me Lil' Burglar!",
    conditions: [
      "Degager 3 Balles avec  « Serpentine Clear »",
      "Voler 15 ballons avec « Reflex Tackle »",
      "Intercepter 10 Ballons ennemis avec « Venom Trap »",
      "Reussir 5 Pressing avec « Snake's Grasp »",
      "Voler la balle 3 fois avec « Flow Steal »",
      "Intercepter 1 ballons avec « Ultimate Defense »",
      "Voler 3 fois avec « Blooming Halt »",
      "Voler 3 fois avec « Ultimate Snake's Grasp »",
    ],
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
      "« Eat Shit, you Fucking Losers. »",
    conditions: ["Conditions à découvrir lors de sa sortie."],
    available: false
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
      "« HAVE YOU EVER PLAYED FOOTBALL WITH YOUR LIFE ON THE LINE?!! »",
    conditions: ["Conditions à découvrir lors de sa sortie."],
    available: false
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

function syncGlobalTitleCatalog() {
  const technicalRules = window.NEBULA_DATA?.technicalTitleRules || [];
  const careerTracks = window.NEBULA_DATA?.careerTitleTracks || [];

  document.querySelectorAll(".stat-title[data-code]").forEach((card) => {
    const rule = technicalRules.find((item) => item.code === card.dataset.code);
    if (!rule) return;

    const threshold = Number(rule.threshold ?? 95);
    const readout = card.querySelector(".stat-readout strong");
    const title = card.querySelector("h4");
    if (readout) readout.innerHTML = `${threshold}<sup>+</sup>`;
    if (title) title.textContent = rule.name;
  });

  const uniqueTechnicalThresholds = [...new Set(technicalRules.map((rule) => Number(rule.threshold ?? 95)))];
  const thresholdCopy = document.querySelector("[data-technical-threshold-copy]");
  if (thresholdCopy && uniqueTechnicalThresholds.length) {
    thresholdCopy.textContent = uniqueTechnicalThresholds.length === 1
      ? `Atteindre ${uniqueTechnicalThresholds[0]} dans une statistique déverrouille son titre spécialisé.`
      : "Chaque statistique possède son propre seuil de titre spécialisé.";
  }

  const unitLabels = {
    STK: "BUTS",
    PAS: "PASSES D.",
    DEF: "SAUV.",
    DRI: "DRIBBLES"
  };

  document.querySelectorAll(".career-track").forEach((section) => {
    const code = section.querySelector(".career-track-heading > span")?.textContent.trim();
    const track = careerTracks.find((item) => item.code === code);
    if (!track) return;

    const ultimateThreshold = track.titles.at(-1)?.[0];
    const headingThreshold = section.querySelector(".career-track-heading > strong");
    if (headingThreshold && ultimateThreshold !== undefined) {
      headingThreshold.textContent = ultimateThreshold;
    }

    section.querySelectorAll("ol > li").forEach((row, index) => {
      const tier = track.titles[index];
      if (!tier) return;
      const [threshold, name] = tier;
      const title = row.querySelector("div strong");
      const requirement = row.querySelector(":scope > span");
      if (title) title.textContent = name;
      if (requirement) requirement.textContent = `${threshold} ${unitLabels[track.code] || track.unit.toUpperCase()}`;
    });
  });
}

syncGlobalTitleCatalog();

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
const rarityCount = document.getElementById("rarity-count");

if (rarityCount) {
  rarityCount.textContent = String(Object.keys(rarityMeta).length).padStart(2, "0");
}

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
            <strong>${character.name}${character.edition && character.edition.toLowerCase() !== "mastery" ? "<em>" + character.edition + "</em>" : ""}</strong>
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
          <h3>${character.name}${character.edition && character.edition.toLowerCase() !== "mastery" ? "<em>" + character.edition + "</em>" : ""}</h3>
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
