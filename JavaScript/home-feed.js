// ========== FIL D'ACTIVITÉ DE L'ACCUEIL ==========
// Derniers résultats, prochaine rencontre et leaders, recalculés depuis
// nebula-data.js à chaque visite.

document.addEventListener("DOMContentLoaded", () => {
    const data = window.NEBULA_DATA;
    const slots = {
        results: document.querySelector('[data-feed="results"]'),
        next: document.querySelector('[data-feed="next"]'),
        leaders: document.querySelector('[data-feed="leaders"]')
    };
    if (!data || !slots.results) return;

    const escapeHtml = text => String(text ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
    const parseDate = value => {
        const [year, month, day] = String(value || "").split("-").map(Number);
        return year ? new Date(year, month - 1, day) : null;
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const shortFormat = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
    const yen = new Intl.NumberFormat("fr-FR");
    const activeSeason = data.getActiveSeason?.();
    const seasonLabel = activeSeason ? `saison ${String(activeSeason.number).padStart(2, "0")}` : "saison en cours";

    function clubBadge(key) {
        const club = key ? data.getClub?.(key) : null;
        if (!club) return `<span class="feed-club is-unknown"><i>?</i><b>À déterminer</b></span>`;
        return `<span class="feed-club" style="--club:${escapeHtml(club.color?.slice(0, 7) || "#fff")}">
            <img src="${escapeHtml(data.assetUrl(club.logoPath))}" alt="" loading="lazy">
            <b>${escapeHtml(club.shortName || club.name)}</b>
        </span>`;
    }

    // État vide « PAS DE SIGNAL » (kit .nl-nosignal de theme-monitor.css).
    function emptyState(code, title, text) {
        return `<div class="feed-empty nl-nosignal"><span class="nl-nosignal-code">${code}</span><strong>${title}</strong><p>${text}</p></div>`;
    }

    const playedCount = (data.matches || []).filter(match =>
        Number.isFinite(Number(match.scoreHome)) && Number.isFinite(Number(match.scoreAway))).length;

    // ---------- 00. Mur de surveillance du héros (décoratif) ----------
    // Un flux caméra par joueur, la cible n°1 verrouillée au centre du mur,
    // complété par des personnages pour remplir la grille.
    const wall = document.querySelector('[data-feed="wall"]');
    if (wall) {
        const rated = player => Number(player.technical?.global) || 0;
        const roster = [...(data.players || [])].sort((a, b) => rated(b) - rated(a));
        const fillers = ["isagi", "rin", "kaiser", "nagi", "bachira", "chigiri", "reo"]
            .map(name => ({ name, avatar: data.assetUrl(`images/icons/${name}.webp`), filler: true }));
        const timecode = index => {
            const seed = (index * 7919 + 1301) % 86400;
            const pad = value => String(value).padStart(2, "0");
            return `${pad(Math.floor(seed / 3600) % 24)}:${pad(Math.floor(seed / 60) % 60)}:${pad(seed % 60)}:${pad((index * 13) % 25)}`;
        };
        const tiles = [...roster, ...fillers].slice(0, 15).map((entry, index) => {
            const isTarget = index === 0 && !entry.filler;
            const retired = entry.club === "retraite";
            const club = entry.filler ? null : data.getClub?.(entry.club);
            const cam = String(index + 1).padStart(2, "0");
            const caption = isTarget
                ? `CIBLE #001 // ${club?.shortName || "LIBRE"} // ${entry.position || "--"}`
                : entry.filler
                ? "ARCHIVE // PERSONNAGE"
                : retired ? "RETRAITE // ARCHIVÉ" : `${club?.shortName || "LIBRE"} // ${entry.position || "--"}`;
            const status = retired || entry.filler
                ? `<span class="rec is-off">${retired ? "HORS LIGNE" : "ARCHIVE"}</span>`
                : `<span class="rec">REC</span>`;
            const classes = ["nl-feed", "wall-feed"];
            if (retired) classes.push("is-offline");
            if (entry.filler) classes.push("wall-filler");
            if (isTarget) classes.push("wall-target");
            return `<span class="${classes.join(" ")}">
                <img class="nl-feed-img" src="${escapeHtml(entry.avatar)}" alt="" loading="lazy" decoding="async">
                ${isTarget ? `<span class="nl-feed-lock"></span><span class="nl-reticle home-orbit"><i></i></span>` : ""}
                <span class="nl-feed-osd"><span><b>CAM ${cam}</b></span>${status}</span>
                <span class="nl-feed-tc">TC ${timecode(index + 1)}</span>
                ${isTarget && rated(entry) ? `<strong class="nl-feed-figure">${rated(entry)}<small>OVR</small></strong>` : ""}
                <span class="nl-feed-caption"><small>${escapeHtml(caption)}</small><b>${escapeHtml(entry.name)}</b></span>
            </span>`;
        });
        wall.innerHTML = tiles.join("");
    }

    // Écran « Matchs » du mur des canaux : hors ligne tant qu'aucun score n'existe.
    document.querySelectorAll('[data-feed-status="matches"]').forEach(tile => {
        if (playedCount) return;
        tile.classList.add("is-offline");
        tile.querySelector(".nl-feed-mire")?.removeAttribute("hidden");
        const rec = tile.querySelector("[data-feed-rec]");
        if (rec) {
            rec.classList.add("is-off");
            rec.textContent = "HORS LIGNE";
        }
    });

    // ---------- 01. Derniers résultats ----------
    const playedMatches = [...(data.matches || [])]
        .filter(match => Number.isFinite(Number(match.scoreHome)) && Number.isFinite(Number(match.scoreAway)))
        .sort((a, b) => `${b.date} ${b.time || ""}`.localeCompare(`${a.date} ${a.time || ""}`));

    slots.results.innerHTML = playedMatches.length
        ? `<ol class="feed-results">${playedMatches.slice(0, 3).map(match => {
            const homeWon = Number(match.scoreHome) > Number(match.scoreAway);
            const awayWon = Number(match.scoreAway) > Number(match.scoreHome);
            const date = parseDate(match.date);
            return `<li><a href="matchs.html?match=${encodeURIComponent(match.id)}">
                <small>${date ? shortFormat.format(date) : ""} · ${escapeHtml(match.category === "ncl" ? "NCL" : "Ligue")}</small>
                <span class="${homeWon ? "is-winner" : ""}">${clubBadge(match.home)}</span>
                <strong>${escapeHtml(match.scoreHome)}<em>–</em>${escapeHtml(match.scoreAway)}</strong>
                <span class="${awayWon ? "is-winner" : ""}">${clubBadge(match.away)}</span>
            </a></li>`;
        }).join("")}</ol>`
        : emptyState("SIGNAL 00", "Pas de signal", `Aucun match n’a encore été enregistré pour la ${seasonLabel}. Le premier score s’affichera ici.`);

    // ---------- 02. Prochaine rencontre ----------
    const pendingFixtures = (data.fixtures || []).filter(fixture =>
        fixture.status !== "completed" && !Number.isFinite(Number(fixture.scoreHome ?? NaN)));
    const upcoming = pendingFixtures
        .filter(fixture => parseDate(fixture.date) >= today)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const overdue = pendingFixtures.filter(fixture => parseDate(fixture.date) < today).length;
    const next = upcoming[0];

    if (next) {
        const date = parseDate(next.date);
        const days = Math.round((date - today) / 86400000);
        const countdown = days === 0 ? "AUJOURD’HUI" : days === 1 ? "DEMAIN" : `J-${days}`;
        slots.next.innerHTML = `
            <div class="feed-next">
                <p class="feed-next-stage">${escapeHtml(next.competitionLabel || "")}<span>${escapeHtml(next.stage || "")}</span></p>
                <div class="feed-versus">${clubBadge(next.home)}<em>VS</em>${clubBadge(next.away)}</div>
                <div class="feed-next-when">
                    <strong>${countdown}</strong>
                    <span>${dayFormat.format(date)}${next.time ? ` · ${escapeHtml(next.time)}` : ""}</span>
                </div>
            </div>
            ${overdue ? `<p class="feed-note">${overdue} rencontre${overdue > 1 ? "s" : ""} passée${overdue > 1 ? "s" : ""} en attente de résultat.</p>` : ""}`;
    } else {
        slots.next.innerHTML = emptyState("SIGNAL --", "Calendrier terminé", "Aucune rencontre programmée pour le moment.");
    }

    // ---------- 03. En tête de la ligue ----------
    const players = data.players || [];
    const ranking = (score) => players
        .map(player => ({ player, value: score(player) }))
        .filter(entry => Number.isFinite(entry.value) && entry.value > 0)
        .sort((a, b) => b.value - a.value);
    const formatRating = value => `${value}<small>OVR</small>`;
    const ratings = ranking(player => player.technical?.global);

    const leaders = [
        { label: "Meilleur buteur", entry: ranking(player => data.getPlayerMatchStats?.(player.name, activeSeason?.number)?.goals)[0], format: value => `${value}<small>but${value > 1 ? "s" : ""}</small>` },
        { label: "Plus forte cote", entry: ranking(player => player.value)[0], format: value => `${yen.format(value)}<small>¥</small>` },
        { label: "Meilleure note", entry: ratings[0], format: formatRating }
    ].filter(leader => leader.entry);

    // Avant les premiers matchs, on complète avec le podium des notes.
    ratings.slice(1).forEach((entry, index) => {
        if (leaders.length < 3) leaders.push({ label: `Note n°${index + 2}`, entry, format: formatRating });
    });

    slots.leaders.innerHTML = leaders.length
        ? `<ul class="feed-leaders">${leaders.map(({ label, entry, format }, index) => `
            <li><a href="${escapeHtml(data.playerPageHref(entry.player))}">
                <img src="${escapeHtml(entry.player.avatar)}" alt="" loading="lazy">
                <i class="feed-leader-cam" aria-hidden="true">CAM ${String(index + 1).padStart(2, "0")}</i>
                <span><small>${label}</small><b>${escapeHtml(entry.player.name)}</b></span>
                <strong>${format(entry.value)}</strong>
            </a></li>`).join("")}</ul>
            ${playedMatches.length ? "" : `<p class="feed-note">Buteurs et cotes apparaîtront après le premier match.</p>`}`
        : emptyState("SIGNAL --", "Pas encore de leader", "Les classements se rempliront avec les premiers matchs.");
});
