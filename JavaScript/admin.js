document.addEventListener("DOMContentLoaded", () => {
    const data = window.NEBULA_DATA || {};
    const clubs = data.clubs || [];
    const players = data.players || [];
    const matches = data.matches || [];
    const draftKey = "nebula-local-match-draft-v1";
    const backupKey = "nebula-local-match-backups-v1";

    const form = document.getElementById("matchBuilder");
    const homeClub = document.getElementById("homeClub");
    const awayClub = document.getElementById("awayClub");
    const goalEvents = document.getElementById("goalEvents");
    const output = document.getElementById("matchOutput");
    const copyButton = document.getElementById("copyOutput");
    const feedback = document.getElementById("adminFeedback");
    const backupCount = document.getElementById("adminBackupCount");
    const restoreBackupButton = document.getElementById("restoreBackup");
    let goals = [];

    if (!form || !clubs.length) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const normalizeClock = value => {
        const input = String(value || "").trim();
        if (!input) return "";
        if (/^\d{1,2}'\d{1,2}"$/.test(input)) return input;
        const parts = input.replace(/[^\d:]/g, "").split(":");
        if (parts.length === 2) return `${Number(parts[0])}'${String(Number(parts[1])).padStart(2, "0")}"`;
        return input;
    };

    const clubPlayers = key => players.filter(player => player.club === key);
    const clubName = key => clubs.find(club => club.key === key)?.name || key || "Non sélectionné";
    const playerOptions = (clubKey, selected = "", allowBlank = false) => [
        allowBlank ? `<option value="">Aucune</option>` : `<option value="">Sélectionner</option>`,
        ...clubPlayers(clubKey).map(player => (
            `<option value="${escapeHtml(player.name)}"${player.name === selected ? " selected" : ""}>${escapeHtml(player.name)}</option>`
        ))
    ].join("");

    function setFeedback(type, title, message) {
        feedback.className = `admin-feedback${type ? ` is-${type}` : ""}`;
        feedback.innerHTML = `<span>${escapeHtml(title)}</span><p>${escapeHtml(message)}</p>`;
    }

    function readBackups() {
        try {
            const backups = JSON.parse(localStorage.getItem(backupKey));
            return Array.isArray(backups) ? backups : [];
        } catch {
            return [];
        }
    }

    function updateBackupCount() {
        const count = readBackups().length;
        if (backupCount) {
            backupCount.textContent = `${String(count).padStart(2, "0")} SAUVEGARDE${count > 1 ? "S" : ""} LOCALE${count > 1 ? "S" : ""}`;
        }
        if (restoreBackupButton) restoreBackupButton.disabled = count === 0;
    }

    function backupCurrentDraft(reason) {
        const current = localStorage.getItem(draftKey);
        if (!current) return;
        try {
            const backups = readBackups();
            backups.unshift({
                version: 1,
                savedAt: new Date().toISOString(),
                reason,
                draft: JSON.parse(current)
            });
            localStorage.setItem(backupKey, JSON.stringify(backups.slice(0, 10)));
            updateBackupCount();
        } catch {
            // Un ancien brouillon illisible ne doit pas bloquer l'interface.
        }
    }

    function downloadJson(payload, filename) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function populateClubs() {
        const options = clubs.map(club => `<option value="${club.key}">${escapeHtml(club.name)}</option>`).join("");
        homeClub.innerHTML = options;
        awayClub.innerHTML = options;
        homeClub.value = clubs[0]?.key || "";
        awayClub.value = clubs[1]?.key || clubs[0]?.key || "";
    }

    function renderGoals() {
        if (!goals.length) {
            goalEvents.innerHTML = `<div class="goal-empty">AUCUN BUT ENREGISTRÉ — LE SCORE RESTE À 00–00</div>`;
        } else {
            goalEvents.innerHTML = goals.map((goal, index) => {
                const teamKey = goal.side === "home" ? homeClub.value : awayClub.value;
                const accent = goal.side === "home" ? "#ff5368" : "#52dcff";
                return `
                    <div class="goal-row" style="--goal-accent:${accent}" data-goal-index="${index}">
                        <span class="goal-side">${goal.side === "home" ? "DOM." : "EXT."} ${String(index + 1).padStart(2, "0")}</span>
                        <input data-goal-field="time" value="${escapeHtml(goal.time)}" placeholder="2'10&quot;" aria-label="Temps du but">
                        <select data-goal-field="scorer" aria-label="Buteur">${playerOptions(teamKey, goal.scorer)}</select>
                        <select data-goal-field="assist" aria-label="Passeur">${playerOptions(teamKey, goal.assist, true)}</select>
                        <button class="goal-remove" type="button" data-remove-goal="${index}" aria-label="Supprimer ce but">×</button>
                    </div>`;
            }).join("");
        }

        document.getElementById("homeScore").textContent = String(goals.filter(goal => goal.side === "home").length).padStart(2, "0");
        document.getElementById("awayScore").textContent = String(goals.filter(goal => goal.side === "away").length).padStart(2, "0");
    }

    function readExistingNotes(side) {
        const host = document.getElementById(`${side}Notes`);
        return Object.fromEntries([...host.querySelectorAll("[data-note-player]")].map(row => [
            row.dataset.notePlayer,
            {
                note: row.querySelector('[data-note-field="note"]').value,
                defenses: row.querySelector('[data-note-field="defenses"]').value,
                dribbles: row.querySelector('[data-note-field="dribbles"]').value
            }
        ]));
    }

    function renderNotes(side, restored = {}) {
        const clubKey = side === "home" ? homeClub.value : awayClub.value;
        const roster = clubPlayers(clubKey);
        const host = document.getElementById(`${side}Notes`);
        document.getElementById(`${side}NotesName`).textContent = clubName(clubKey);
        host.innerHTML = roster.length ? roster.map(player => {
            const values = restored[player.name] || {};
            return `
                <div class="note-row" data-note-player="${escapeHtml(player.name)}">
                    <strong>${escapeHtml(player.name)}</strong>
                    <input data-note-field="note" type="number" min="0" max="10" step="0.1" value="${escapeHtml(values.note || "")}" placeholder="—" aria-label="Note de ${escapeHtml(player.name)}">
                    <input data-note-field="defenses" type="number" min="0" step="1" value="${escapeHtml(values.defenses || "")}" placeholder="—" aria-label="Défenses de ${escapeHtml(player.name)}">
                    <input data-note-field="dribbles" type="number" min="0" step="1" value="${escapeHtml(values.dribbles || "")}" placeholder="—" aria-label="Dribbles de ${escapeHtml(player.name)}">
                </div>`;
        }).join("") : `<div class="notes-empty">AUCUN JOUEUR DANS CE CLUB</div>`;
    }

    function refreshTeams() {
        const homeNotes = readExistingNotes("home");
        const awayNotes = readExistingNotes("away");
        goals = goals.map(goal => {
            const validNames = new Set(clubPlayers(goal.side === "home" ? homeClub.value : awayClub.value).map(player => player.name));
            return {
                ...goal,
                scorer: validNames.has(goal.scorer) ? goal.scorer : "",
                assist: validNames.has(goal.assist) ? goal.assist : ""
            };
        });
        renderGoals();
        renderNotes("home", homeNotes);
        renderNotes("away", awayNotes);
    }

    function collectNotes(side) {
        const host = document.getElementById(`${side}Notes`);
        return [...host.querySelectorAll("[data-note-player]")].flatMap(row => {
            const note = row.querySelector('[data-note-field="note"]').value;
            const defenses = row.querySelector('[data-note-field="defenses"]').value;
            const dribbles = row.querySelector('[data-note-field="dribbles"]').value;
            if (note === "" && defenses === "" && dribbles === "") return [];
            return [{
                name: row.dataset.notePlayer,
                note: Number(note || 0),
                defenses: Number(defenses || 0),
                dribbles: Number(dribbles || 0)
            }];
        });
    }

    function scorerTotals(side) {
        const totals = new Map();
        goals.filter(goal => goal.side === side).forEach(goal => {
            totals.set(goal.scorer, (totals.get(goal.scorer) || 0) + 1);
        });
        return [...totals].map(([name, count]) => ({ name, count }));
    }

    function validateMatch() {
        const errors = [];
        const id = document.getElementById("matchId").value.trim();
        if (!id) errors.push("Ajoute un identifiant unique.");
        if (matches.some(match => String(match.id) === id)) errors.push(`L’identifiant « ${id} » existe déjà.`);
        if (!document.getElementById("matchDate").value) errors.push("Ajoute la date du match.");
        if (homeClub.value === awayClub.value) errors.push("Les clubs domicile et extérieur doivent être différents.");

        goals.forEach((goal, index) => {
            const roster = new Set(clubPlayers(goal.side === "home" ? homeClub.value : awayClub.value).map(player => player.name));
            if (!goal.scorer || !roster.has(goal.scorer)) errors.push(`Sélectionne un buteur valide pour le but ${index + 1}.`);
            if (goal.assist && !roster.has(goal.assist)) errors.push(`Le passeur du but ${index + 1} n’appartient pas au bon club.`);
            if (goal.assist && goal.assist === goal.scorer) errors.push(`Le buteur et le passeur du but ${index + 1} ne peuvent pas être identiques.`);
            if (!normalizeClock(goal.time)) errors.push(`Ajoute le temps du but ${index + 1}.`);
        });
        return errors;
    }

    function buildMatchObject() {
        const category = document.getElementById("matchCategory").value;
        const valueTier = document.getElementById("matchTier").value || null;
        const videoUrl = document.getElementById("matchVideo").value.trim() || null;
        return {
            id: document.getElementById("matchId").value.trim(),
            date: document.getElementById("matchDate").value,
            time: document.getElementById("matchTime").value || "20:00",
            category,
            valueTier,
            season: Number(document.getElementById("matchSeason").value || 1),
            home: homeClub.value,
            away: awayClub.value,
            scoreHome: goals.filter(goal => goal.side === "home").length,
            scoreAway: goals.filter(goal => goal.side === "away").length,
            videoUrl,
            scorersHome: scorerTotals("home"),
            scorersAway: scorerTotals("away"),
            timelineHome: goals.filter(goal => goal.side === "home").map(goal => ({
                time: normalizeClock(goal.time),
                scorer: goal.scorer,
                assist: goal.assist || null
            })),
            timelineAway: goals.filter(goal => goal.side === "away").map(goal => ({
                time: normalizeClock(goal.time),
                scorer: goal.scorer,
                assist: goal.assist || null
            })),
            notesHome: collectNotes("home"),
            notesAway: collectNotes("away")
        };
    }

    function collectDraft() {
        return {
            fields: Object.fromEntries([...form.querySelectorAll("input[name], select[name]")].map(field => [field.name, field.value])),
            home: homeClub.value,
            away: awayClub.value,
            goals,
            homeNotes: readExistingNotes("home"),
            awayNotes: readExistingNotes("away")
        };
    }

    function restoreDraft(draft) {
        if (!draft) return;
        Object.entries(draft.fields || {}).forEach(([name, value]) => {
            const field = form.elements.namedItem(name);
            if (field) field.value = value;
        });
        if (clubs.some(club => club.key === draft.home)) homeClub.value = draft.home;
        if (clubs.some(club => club.key === draft.away)) awayClub.value = draft.away;
        goals = Array.isArray(draft.goals) ? draft.goals : [];
        renderGoals();
        renderNotes("home", draft.homeNotes || {});
        renderNotes("away", draft.awayNotes || {});
    }

    populateClubs();
    renderGoals();
    renderNotes("home");
    renderNotes("away");
    document.getElementById("adminDataSummary").textContent = `${String(clubs.length).padStart(2, "0")} CLUBS / ${String(players.length).padStart(2, "0")} JOUEURS / ${String(matches.length).padStart(2, "0")} MATCHS`;

    try {
        restoreDraft(JSON.parse(localStorage.getItem(draftKey)));
    } catch {
        localStorage.removeItem(draftKey);
    }
    updateBackupCount();

    homeClub.addEventListener("change", refreshTeams);
    awayClub.addEventListener("change", refreshTeams);

    document.querySelectorAll("[data-add-goal]").forEach(button => {
        button.addEventListener("click", () => {
            goals.push({ side: button.dataset.addGoal, time: "", scorer: "", assist: "" });
            renderGoals();
        });
    });

    goalEvents.addEventListener("input", event => {
        const row = event.target.closest("[data-goal-index]");
        if (!row || !event.target.dataset.goalField) return;
        goals[Number(row.dataset.goalIndex)][event.target.dataset.goalField] = event.target.value;
    });
    goalEvents.addEventListener("change", event => {
        const row = event.target.closest("[data-goal-index]");
        if (!row || !event.target.dataset.goalField) return;
        goals[Number(row.dataset.goalIndex)][event.target.dataset.goalField] = event.target.value;
    });
    goalEvents.addEventListener("click", event => {
        const button = event.target.closest("[data-remove-goal]");
        if (!button) return;
        goals.splice(Number(button.dataset.removeGoal), 1);
        renderGoals();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const errors = validateMatch();
        if (errors.length) {
            setFeedback("error", `${errors.length} ERREUR${errors.length > 1 ? "S" : ""}`, errors.join(" "));
            copyButton.disabled = true;
            return;
        }
        const match = buildMatchObject();
        output.textContent = `${JSON.stringify(match, null, 4)},`;
        copyButton.disabled = false;
        setFeedback("success", "MATCH VALIDÉ", `${clubName(match.home)} ${match.scoreHome}–${match.scoreAway} ${clubName(match.away)} est prêt à être ajouté au tableau matches.`);
    });

    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(output.textContent);
            setFeedback("success", "COPIÉ", "Le bloc du match est dans le presse-papiers.");
        } catch {
            setFeedback("error", "COPIE BLOQUÉE", "Sélectionne manuellement le bloc puis copie-le.");
        }
    });

    document.getElementById("saveDraft").addEventListener("click", () => {
        backupCurrentDraft("avant sauvegarde");
        localStorage.setItem(draftKey, JSON.stringify(collectDraft()));
        setFeedback("success", "BROUILLON SAUVÉ", "Tu pourras reprendre la saisie depuis ce navigateur.");
    });

    document.getElementById("resetBuilder").addEventListener("click", () => {
        backupCurrentDraft("avant réinitialisation");
        localStorage.removeItem(draftKey);
        form.reset();
        populateClubs();
        goals = [];
        renderGoals();
        renderNotes("home");
        renderNotes("away");
        output.textContent = "// Le match généré apparaîtra ici.";
        copyButton.disabled = true;
        setFeedback("", "EN ATTENTE", "Le formulaire a été réinitialisé.");
    });

    document.getElementById("exportDraft").addEventListener("click", () => {
        const now = new Date();
        const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
        downloadJson({
            type: "nebula-match-draft",
            version: 1,
            exportedAt: now.toISOString(),
            draft: collectDraft()
        }, `nebula-dossier-match-${stamp}.json`);
        setFeedback("success", "DOSSIER EXPORTÉ", "Le fichier JSON contient toutes les données actuelles du formulaire.");
    });

    document.getElementById("exportRegistry").addEventListener("click", () => {
        const now = new Date();
        const stamp = now.toISOString().slice(0, 10);
        downloadJson({
            type: "nebula-data-backup",
            version: 1,
            exportedAt: now.toISOString(),
            clubs: data.clubs || [],
            players: data.players || [],
            matches: data.matches || [],
            fixtures: data.fixtures || [],
            seasons: data.seasons || []
        }, `nebula-base-${stamp}.json`);
        setFeedback("success", "BASE EXPORTÉE", "Une copie portable des clubs, joueurs, matchs, saisons et du calendrier a été téléchargée.");
    });

    const importDraftFile = document.getElementById("importDraftFile");
    document.getElementById("importDraft").addEventListener("click", () => importDraftFile.click());
    importDraftFile.addEventListener("change", async () => {
        const file = importDraftFile.files?.[0];
        if (!file) return;
        try {
            const payload = JSON.parse(await file.text());
            const draft = payload?.type === "nebula-match-draft" ? payload.draft : payload;
            if (!draft || typeof draft !== "object" || !draft.fields) {
                throw new Error("Format de dossier invalide");
            }
            backupCurrentDraft("avant import");
            restoreDraft(draft);
            localStorage.setItem(draftKey, JSON.stringify(collectDraft()));
            updateBackupCount();
            setFeedback("success", "DOSSIER IMPORTÉ", `${file.name} est chargé et sauvegardé localement.`);
        } catch {
            setFeedback("error", "IMPORT REFUSÉ", "Le fichier ne correspond pas à un dossier de match Nebula valide.");
        } finally {
            importDraftFile.value = "";
        }
    });

    restoreBackupButton.addEventListener("click", () => {
        const backup = readBackups()[0];
        if (!backup?.draft) return;
        backupCurrentDraft("avant restauration");
        restoreDraft(backup.draft);
        localStorage.setItem(draftKey, JSON.stringify(collectDraft()));
        const date = new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date(backup.savedAt));
        setFeedback("success", "SAUVEGARDE RESTAURÉE", `La copie locale du ${date} est chargée.`);
    });
});
