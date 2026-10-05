const characters = window.NEBULA_CHARACTERS || [];

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
          <span class="portrait-wrap"><img src="${character.imagePath || `${imageBase}/${character.id}.webp`}" alt="" loading="lazy"></span>
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
    const progress = character.conditions.length ? Math.round((checked.length / character.conditions.length) * 100) : 0;
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
          <img src="${character.imagePath || `${imageBase}/${character.id}.webp`}" alt="${character.name}">
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

  renderGrid();
  renderFile();
  if (selectedId === requestedCharacter) {
    requestAnimationFrame(() => playerFile.scrollIntoView({ block: "start" }));
  }
}
