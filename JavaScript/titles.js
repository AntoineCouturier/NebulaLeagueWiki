const characters = window.NEBULA_CHARACTERS || [];

window.NEBULA_DATA = window.NEBULA_DATA || {};
window.NEBULA_DATA.characters = characters;

// Raretés : une échelle de signal (1 à 6 barres) dans la gamme bleue de la
// salle de contrôle. Commun = signal faible, Mastery = blanc plein.
const rarityMeta = {
  commun: { label: "Commun", accent: "var(--muted)", short: "C", level: 1 },
  rare: { label: "Rare", accent: "var(--blue-3)", short: "R", level: 2 },
  legendary: { label: "Légendaire", accent: "var(--blue-2)", short: "L", level: 3 },
  mythical: { label: "Mythique", accent: "var(--blue)", short: "M", level: 4 },
  worldclass: { label: "World Class", accent: "var(--paper)", short: "WC", level: 5 },
  mastery: { label: "Mastery", accent: "var(--white)", short: "MX", level: 6 }
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

  // Dessins blueprint partagés avec les fiches joueurs (title-art.js).
  if (typeof getTechnicalTitleIllustration === "function") {
    document.querySelectorAll("[data-title-art]").forEach((slot) => {
      slot.innerHTML = getTechnicalTitleIllustration({ category: "Statistique", metric: slot.dataset.titleArt });
    });
  }

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
// ?personnage=nagi ouvre directement un dossier (liens de la recherche Ctrl+K).
const requestedCharacter = new URLSearchParams(window.location.search).get("personnage");
let selectedId = characters.some((character) => character.id === requestedCharacter) ? requestedCharacter : "isagi";
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

  const portraitOf = (character) => character.imagePath || `${imageBase}/${character.id}.webp`;
  const editionOf = (character) => character.edition && character.edition.toLowerCase() !== "mastery" ? "<em>" + character.edition + "</em>" : "";
  const camOf = (character) => String(characters.indexOf(character) + 1).padStart(2, "0");

  function syncRarityKeys() {
    document.querySelectorAll(".rarity-filters button").forEach((button) => {
      const isActive = button.dataset.rarity === activeRarity;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  // Compteurs du spectre de rareté et de l'OSD du héros.
  document.querySelectorAll("[data-rarity-total]").forEach((node) => {
    const key = node.dataset.rarityTotal;
    const total = key === "all" ? characters.length : characters.filter((character) => character.rarity === key).length;
    node.textContent = String(total).padStart(2, "0");
  });
  document.querySelectorAll("[data-title-total]").forEach((node) => {
    node.textContent = String(characters.length).padStart(2, "0");
  });

  // Héros : le mur des caméras, un flux par personnage (décoratif, kit .nl-feed).
  // Le personnage sélectionné occupe l'écran verrouillé (2 × 2, placé en CSS) ;
  // des mires « LIBRE » complètent la dernière rangée du mur de 8 colonnes.
  const WALL_COLUMNS = 8;
  function renderTitleWall() {
    const wall = document.querySelector("[data-title-wall]");
    if (!wall) return;
    const tiles = characters.map((character) => {
      const meta = rarityMeta[character.rarity] || {};
      const sealed = character.available === false;
      const isLocked = character.id === selectedId;
      const status = sealed ? '<span class="rec is-off">HORS LIGNE</span>' : isLocked ? '<span class="rec">REC</span>' : `<span>${meta.short || ""}</span>`;
      return `<span class="nl-feed title-wall-feed${isLocked ? " is-locked" : ""}${sealed ? " is-offline" : ""}" data-rarity="${character.rarity}">
          <img class="nl-feed-img" src="${portraitOf(character)}" alt="">
          ${isLocked ? '<span class="nl-feed-lock"></span>' : ""}
          <span class="nl-feed-osd"><span><b>CAM ${camOf(character)}</b></span>${status}</span>
          ${isLocked ? `<span class="nl-feed-caption"><small>Cible // ${meta.label}</small><b>${character.name}</b><em>${character.ultimate}</em></span>` : ""}
        </span>`;
    });
    const used = characters.length + (characters.some((character) => character.id === selectedId) ? 3 : 0);
    const spareCount = (WALL_COLUMNS - (used % WALL_COLUMNS)) % WALL_COLUMNS;
    const spare = Array.from({ length: spareCount }, (_, index) => `<span class="nl-feed title-wall-feed is-empty">
          <span class="nl-feed-mire" data-label="LIBRE"></span>
          <span class="nl-feed-osd"><span><b>CAM ${String(characters.length + index + 1).padStart(2, "0")}</b></span><span>--</span></span>
        </span>`);
    wall.innerHTML = tiles.join("") + spare.join("");
  }

  // Mur du codex : des mires « PAS DE SIGNAL » complètent la dernière rangée
  // (le nombre de colonnes dépend de la largeur d'écran).
  function fillCodexWall() {
    grid.querySelectorAll(".codex-filler").forEach((node) => node.remove());
    const cards = grid.querySelectorAll(".character-card").length;
    if (!cards) return;
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    const missing = (columns - (cards % columns)) % columns;
    grid.insertAdjacentHTML("beforeend", Array.from({ length: missing }, (_, index) => `<span class="nl-feed is-offline codex-filler" aria-hidden="true">
          <span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
          <span class="nl-feed-osd"><span><b>CAM ${String(characters.length + index + 1).padStart(2, "0")}</b></span><span class="rec is-off">LIBRE</span></span>
        </span>`).join(""));
  }

  let fillTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(fillTimer);
    fillTimer = setTimeout(fillCodexWall, 150);
  });

  function renderGrid() {
    const filtered = characters.filter((character) => {
      const rarityMatch = activeRarity === "all" || character.rarity === activeRarity;
      const queryMatch = !searchTerm || (character.name + " " + (character.edition || "") + " " + character.ultimate).toLowerCase().includes(searchTerm);
      return rarityMatch && queryMatch;
    });

    resultCount.textContent = String(filtered.length).padStart(2, "0") + " RÉSULTATS";
    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state nl-nosignal"><span class="nl-nosignal-code">SIGNAL 404</span><strong>Aucun ego détecté</strong><p>Aucun personnage ne correspond à cette recherche ou à cette rareté.</p><button type="button" class="nl-btn nl-btn-sm" id="reset-filters">Réinitialiser les filtres</button></div>';
      document.getElementById("reset-filters").addEventListener("click", () => {
        search.value = "";
        searchTerm = "";
        activeRarity = "all";
        syncRarityKeys();
        renderGrid();
      });
      return;
    }

    grid.innerHTML = filtered.map((character) => {
      const meta = rarityMeta[character.rarity];
      const isSelected = selectedId === character.id;
      const sealed = character.available === false;
      return `<button type="button" class="character-card ${isSelected ? "selected" : ""} ${sealed ? "locked" : ""}" style="--accent:${meta.accent}" data-id="${character.id}" data-rarity="${character.rarity}" aria-pressed="${isSelected}">
          <span class="card-index">${camOf(character)}</span>
          <span class="card-rarity">${meta.short}</span>
          <span class="portrait-wrap"><img src="${portraitOf(character)}" alt="" loading="lazy"></span>
          <span class="card-scanline"></span>
          <span class="card-signal" aria-hidden="true">${sealed ? "HORS LIGNE" : isSelected ? "À L’ÉCRAN" : ""}</span>
          <span class="card-info">
            <small>${character.rarityLabel}</small>
            <strong>${character.name}${editionOf(character)}</strong>
            <span>${character.ultimate}</span>
          </span>
          <span class="card-action">${sealed ? "DOSSIER SCELLÉ" : "INSPECTER"}<i>↗</i></span>
        </button>`;
    }).join("");
    fillCodexWall();

    grid.querySelectorAll(".character-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectedId = card.dataset.id;
        renderGrid();
        renderFile();
        renderTitleWall();
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
    const progress = character.conditions.length ? Math.round((checked.length / character.conditions.length) * 100) : 0;
    const sealed = character.available === false;
    const cam = camOf(character);
    playerFile.style.setProperty("--accent", meta.accent);
    playerFile.dataset.rarity = character.rarity;
    playerFile.classList.toggle("is-sealed", sealed);
    playerFile.innerHTML = `
        <div class="file-topline">
          <span><b>CAM ${cam}</b> // DOSSIER ${character.id.toUpperCase()}</span>
          <span class="file-status rec${sealed ? " is-off" : ""}">${sealed ? "HORS LIGNE // SCELLÉ" : "REC // ACTIF"}</span>
        </div>
        <div class="file-visual">
          <img src="${portraitOf(character)}" alt="${character.name}">
          <div class="file-target" aria-hidden="true"><span></span></div>
          <span class="file-osd" aria-hidden="true">ZOOM ×2.0 · ISO 800</span>
          <div class="file-number" aria-hidden="true"><small>N°</small>${cam}</div>
          <span class="file-rarity-code">${meta.short}</span>
          ${sealed ? '<span class="file-sealed" aria-hidden="true">DOSSIER SCELLÉ</span>' : ""}
        </div>
        <div class="file-identity">
          <p>${character.rarityLabel}</p>
          <h3>${character.name}${editionOf(character)}</h3>
          <div class="difficulty"><span>DIFFICULTÉ</span><div role="img" aria-label="${character.difficulty} sur 5">${[1, 2, 3, 4, 5].map((star) => '<i class="' + (star <= character.difficulty ? "filled" : "") + '"></i>').join("")}</div><b>${character.difficulty}/5</b></div>
          <p class="file-description">${character.description}</p>
        </div>
        <div class="ultimate-block"><small>TITRE ULTIME</small><strong>${character.ultimate}</strong></div>
        <div class="progress-heading"><div><span>PROTOCOLE D’ÉVEIL</span><small>${checked.length}/${character.conditions.length} OBJECTIFS</small></div><strong>${progress}<small>%</small></strong></div>
        <div class="progress-track" role="meter" aria-label="Progression du protocole d’éveil" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
        <div class="condition-list" data-reveal="off">
          ${character.conditions.map((condition, conditionIndex) => {
      const done = checked.includes(conditionIndex);
      return `<button type="button" class="${done ? "done" : ""}" data-condition="${conditionIndex}" aria-pressed="${done}"><span class="condition-box">${done ? "✓" : ""}</span><span><small>OBJECTIF ${String(conditionIndex + 1).padStart(2, "0")}</small>${condition}</span></button>`;
    }).join("")}
        </div>
        ${progress === 100 && !sealed ? `<div class="unlocked-banner"><span>✦</span><div><small>TITRE DÉBLOQUÉ</small><strong>${character.ultimate}</strong></div></div>` : ""}
      `;

    playerFile.querySelectorAll(".condition-list button").forEach((button) => {
      button.addEventListener("click", () => {
        const conditionIndex = Number(button.dataset.condition);
        const next = checked.includes(conditionIndex) ? checked.filter((item) => item !== conditionIndex) : [...checked, conditionIndex];
        saveChecked(character.id, next);
        renderFile();
        playerFile.querySelector(`[data-condition="${conditionIndex}"]`)?.focus({ preventScroll: true });
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
      syncRarityKeys();
      renderGrid();
    });
  });

  renderTitleWall();
  renderGrid();
  renderFile();
  if (selectedId === requestedCharacter) {
    requestAnimationFrame(() => playerFile.scrollIntoView({ block: "start" }));
  }
}
