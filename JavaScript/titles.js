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
      // Retire l'état actif de tous les liens du même perso
      const parentPage = link.closest(".char-page");
      if (parentPage) {
        parentPage.querySelectorAll(".title-link").forEach(l => l.classList.remove("selected"));
      }
      link.classList.add("selected");

      // Masquer tous les autres détails
      document.querySelectorAll(".title-detail").forEach(d => d.style.display = "none");

      // Afficher le détail correspondant
      detail.style.display = "block";

      // Si ce titre a 2 variantes vidéo (data-video-a / data-video-b), tirage 50/50 à chaque clic
      const variantFrame = detail.querySelector("iframe[data-video-a][data-video-b]");
      if (variantFrame) {
        const pick = Math.random() < 0.5 ? variantFrame.dataset.videoA : variantFrame.dataset.videoB;
        variantFrame.src = pick;
      }

      // Scroll jusqu’au détail
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* ==================================================================
   AMÉLIORATIONS PAGE TITRES : regroupement par rareté,
   accent visuel selon rareté, badge "bientôt disponible"
   ================================================================== */

// Ordre d'affichage des rarétés + libellé du séparateur
const RARITY_ORDER = ["commun", "rare", "legendary", "mythical", "worldclass", "mastery"];
const RARITY_LABEL = {
  commun: "Communs",
  rare: "Rares",
  legendary: "Légendaires",
  mythical: "Mythiques",
  worldclass: "World Class",
  mastery: "Masteries"
};

document.addEventListener("DOMContentLoaded", () => {

  // 0) Page Global : compte automatiquement le nombre de titres par catégorie
  document.querySelectorAll(".category-card").forEach(card => {
    const count = card.querySelectorAll(".title-item").length;
    const header = card.querySelector(".category-header");
    if (header && !header.querySelector(".category-count")) {
      const badge = document.createElement("span");
      badge.className = "category-count";
      badge.textContent = `${count} titre${count > 1 ? "s" : ""}`;
      header.appendChild(badge);
    }
  });

  // 1) Pour chaque page perso, on lit sa rareté réelle (span déjà présent dans le HTML)
  //    et on l'applique à l'image + au nom, pour un accent visuel cohérent.
  document.querySelectorAll(".char-page").forEach(page => {
    if (page.id === "global") return;

    const rareteSpan = page.querySelector(".info-text .star")?.closest(".info-text")
      ?.querySelector("p:nth-of-type(2) span");
    if (!rareteSpan) return;

    const rarityClass = RARITY_ORDER.find(r => rareteSpan.classList.contains(r));
    if (!rarityClass) return;

    page.dataset.rarity = rarityClass;

    const img = page.querySelector(".char-info img");
    const h2 = page.querySelector("h2");
    if (img) img.classList.add("rarity-frame", rarityClass);
    if (h2) h2.classList.add("rarity-name", rarityClass);

    // Nouveau système de titre unique : la couleur de rareté habille le badge + la checklist
    const prestigeWrap = page.querySelector(".prestige-title-wrap");
    if (prestigeWrap) prestigeWrap.classList.add(rarityClass);

    // Associe la même rareté au bouton d'onglet correspondant
    const btn = document.querySelector(`.char-btn[data-target="${page.id}"]`);
    if (btn) btn.dataset.rarity = rarityClass;

    // 2) Remplace les "à voir" par un texte placeholder plus lisible
    //    (le badge "bientôt disponible" et l'estompage ont été retirés)
    const desc = page.querySelector(".char-description p");
    if (desc && desc.textContent.includes("n'est pas encore sorti")) {
      page.querySelectorAll(".title-desc").forEach(p => {
        if (p.textContent.trim() === "à voir") {
          p.textContent = "Détails à venir avec la sortie du personnage";
          p.classList.add("placeholder-text");
        }
      });
    }
  });

  // 3) Regroupe réellement les onglets par rareté (les déplace dans la barre),
  //    peu importe leur ordre d'origine dans le HTML : évite les séparateurs en double
  //    si un perso "changé de rareté" n'est pas physiquement à côté des autres du même groupe.
  const tabsBar = document.querySelector(".character-tabs");
  if (tabsBar) {
    const btns = Array.from(tabsBar.querySelectorAll(".char-btn"));
    const groups = {};

    btns.forEach(btn => {
      const rarity = btn.dataset.rarity;
      if (!rarity) return; // bouton "Global" : reste à sa place, non regroupé
      if (!groups[rarity]) groups[rarity] = [];
      groups[rarity].push(btn);
    });

    // Supprime d'anciens séparateurs éventuels avant de reconstruire
    tabsBar.querySelectorAll(".tab-divider").forEach(d => d.remove());

    RARITY_ORDER.forEach(rarity => {
      const group = groups[rarity];
      if (!group || group.length === 0) return;

      const divider = document.createElement("span");
      divider.className = `tab-divider ${rarity}`;
      divider.textContent = RARITY_LABEL[rarity] || rarity;
      tabsBar.appendChild(divider);

      // Déplace chaque bouton du groupe à la suite du séparateur (ordre interne conservé)
      group.forEach(btn => tabsBar.appendChild(btn));
    });

    // Recherche en temps réel dans la liste des personnages
    const searchInput = document.getElementById("charSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        tabsBar.querySelectorAll(".char-btn").forEach(btn => {
          if (btn.dataset.target === "global") return;
          const name = btn.textContent.toLowerCase();
          const match = name.includes(term);
          btn.style.display = match ? "inline-block" : "none";
        });

        // Masquer les séparateurs dont tous les boutons sont cachés
        tabsBar.querySelectorAll(".tab-divider").forEach(divider => {
          let next = divider.nextElementSibling;
          let hasVisible = false;
          while (next && !next.classList.contains("tab-divider")) {
            if (next.classList.contains("char-btn") && next.style.display !== "none") {
              hasVisible = true;
              break;
            }
            next = next.nextElementSibling;
          }
          divider.style.display = hasVisible ? "flex" : "none";
        });
      });
    }
  }

  // 4) Sidebar rétractable : bouton flèche pour épingler/fermer
  const tabsToggle = document.querySelector(".tabs-toggle");
  const charTabs = document.querySelector(".character-tabs");

  if (tabsToggle && charTabs) {
    tabsToggle.addEventListener("click", () => {
      const isOpen = charTabs.classList.toggle("open");
      tabsToggle.classList.toggle("open", isOpen);
      tabsToggle.textContent = isOpen ? "◀" : "▶";
    });

    // Fermer la sidebar épinglée si on clique ailleurs sur la page
    document.addEventListener("click", (e) => {
      const clickedInside = charTabs.contains(e.target) || tabsToggle.contains(e.target);
      if (!clickedInside && charTabs.classList.contains("open")) {
        charTabs.classList.remove("open");
        tabsToggle.classList.remove("open");
        tabsToggle.textContent = "▶";
      }
    });

    // Fermer automatiquement la sidebar (si épinglée) après avoir choisi un perso
    charTabs.querySelectorAll(".char-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        charTabs.classList.remove("open");
        tabsToggle.classList.remove("open");
        tabsToggle.textContent = "▶";
      });
    });
  }

  // 5) NOUVEAU SYSTEME DE TITRES : 1 titre ultime par perso + checklist de conditions
  //    (remplace l'ancien système de plusieurs petits titres cliquables)

  // Stoppe toute vidéo Google Drive en cours de lecture dans un conteneur donné
  // (recharger l'iframe sur elle-même coupe la lecture sans perdre l'URL)
  function stopVideosIn(container) {
    container.querySelectorAll("iframe").forEach(f => {
      if (f.src) f.src = f.src;
    });
  }

  document.querySelectorAll(".prestige-title-wrap").forEach(wrap => {
    const trigger = wrap.querySelector(".prestige-title");
    const panel = wrap.querySelector(".prestige-checklist");
    if (!trigger || !panel) return;

    const closePanel = () => {
      panel.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      stopVideosIn(panel);
    };

    trigger.addEventListener("click", () => {
      const isOpen = panel.classList.contains("open");

      // Ferme tout autre panneau ouvert (sur un autre perso) et stoppe ses vidéos
      document.querySelectorAll(".prestige-checklist.open").forEach(p => {
        if (p !== panel) {
          p.classList.remove("open");
          const otherTrigger = p.closest(".prestige-title-wrap")?.querySelector(".prestige-title");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          stopVideosIn(p);
        }
      });

      if (isOpen) {
        closePanel();
      } else {
        panel.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    const closeBtn = panel.querySelector(".checklist-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closePanel();
      });
    }

    // Cases à cocher : progression sauvegardée par perso dans le navigateur (localStorage)
    const items = Array.from(panel.querySelectorAll(".checklist-item"));
    const progressBar = panel.querySelector(".checklist-progress-bar");
    const progressLabel = panel.querySelector(".checklist-progress-label");
    const storageKey = `nebula_title_progress_${panel.id}`;

    function updateProgress() {
      const total = items.length;
      const done = items.filter(i => i.classList.contains("checked")).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressLabel) progressLabel.textContent = `${done}/${total} conditions remplies`;
      panel.classList.toggle("complete", total > 0 && done === total);
    }

    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (e) { saved = {}; }

    items.forEach((item, i) => {
      if (saved[i]) item.classList.add("checked");
      item.addEventListener("click", () => {
        item.classList.toggle("checked");
        saved[i] = item.classList.contains("checked");
        localStorage.setItem(storageKey, JSON.stringify(saved));
        updateProgress();
      });
    });

    updateProgress();
  });

  // Change de perso => ferme tout panneau checklist ouvert et stoppe ses vidéos
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".prestige-checklist.open").forEach(p => {
        p.classList.remove("open");
        stopVideosIn(p);
        const t = p.closest(".prestige-title-wrap")?.querySelector(".prestige-title");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    });
  });
});