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

    function emptyState(code, title, text) {
        return `<div class="feed-empty"><span>${code}</span><strong>${title}</strong><p>${text}</p></div>`;
    }

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
        : emptyState("00", "Aucun résultat", `Aucun match n’a encore été enregistré pour la ${seasonLabel}.`);

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
        slots.next.innerHTML = emptyState("--", "Calendrier terminé", "Aucune rencontre programmée pour le moment.");
    }

    // ---------- 03. En tête de la ligue ----------
    const players = data.players || [];
    const ranking = (score) => players
        .map(player => ({ player, value: score(player) }))
        .filter(entry => Number.isFinite(entry.value) && entry.value > 0)
        .sort((a, b) => b.value - a.value);
    const formatRating = value => `${value} OVR`;
    const ratings = ranking(player => player.technical?.global);

    const leaders = [
        { label: "Meilleur buteur", entry: ranking(player => data.getPlayerMatchStats?.(player.name, activeSeason?.number)?.goals)[0], format: value => `${value} but${value > 1 ? "s" : ""}` },
        { label: "Plus forte cote", entry: ranking(player => player.value)[0], format: value => `${yen.format(value)} ¥` },
        { label: "Meilleure note", entry: ratings[0], format: formatRating }
    ].filter(leader => leader.entry);

    // Avant les premiers matchs, on complète avec le podium des notes.
    ratings.slice(1).forEach((entry, index) => {
        if (leaders.length < 3) leaders.push({ label: `Note n°${index + 2}`, entry, format: formatRating });
    });

    slots.leaders.innerHTML = leaders.length
        ? `<ul class="feed-leaders">${leaders.map(({ label, entry, format }) => `
            <li><a href="${escapeHtml(data.playerPageHref(entry.player))}">
                <img src="${escapeHtml(entry.player.avatar)}" alt="" loading="lazy">
                <span><small>${label}</small><b>${escapeHtml(entry.player.name)}</b></span>
                <strong>${format(entry.value)}</strong>
            </a></li>`).join("")}</ul>
            ${playedMatches.length ? "" : `<p class="feed-note">Buteurs et cotes apparaîtront après le premier match.</p>`}`
        : emptyState("--", "Pas encore de leader", "Les classements se rempliront avec les premiers matchs.");
});
