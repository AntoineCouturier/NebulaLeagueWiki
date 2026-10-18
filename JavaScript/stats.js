// Couleurs injectées : uniquement les jetons bleus de theme-monitor.css.
// `standby` = image de veille affichée tant qu'aucun détenteur n'existe.
const RECORD_CATEGORY_META = {
    buts: { code: "GLS", label: "Buts", accent: "var(--blue)", standby: "images/icons/shidou.webp" },
    passes: { code: "AST", label: "Passes décisives", accent: "var(--blue-2)", standby: "images/icons/hiori.webp" },
    defenses: { code: "DEF", label: "Défenses", accent: "var(--blue-3)", standby: "images/icons/aiku.webp" },
    dribbles: { code: "DRB", label: "Dribbles", accent: "var(--blue-2)", standby: "images/icons/bachira.webp" }
};
const RECORD_VALUE_STANDBY = "images/icons/reo.webp";

const RECORD_CLUB_COLORS = Object.fromEntries([
    ...(window.NEBULA_DATA?.clubs || []),
    ...Object.values(window.NEBULA_DATA?.groups || {})
].map(club => [club.key, club.color]));

// Temps entre deux leaders dans le signal des Records, en millisecondes.
const RECORD_SIGNAL_INTERVAL_MS = 2000;

document.addEventListener("DOMContentLoaded", () => {
    const highlightGrid = document.getElementById("recordHighlights");
    if (!highlightGrid) return;

    const players = typeof PLAYERS === "undefined" ? [] : PLAYERS;
    const allMatches = typeof MATCHES === "undefined" ? [] : MATCHES;
    const clubKeys = typeof CLUB_META === "undefined" ? [] : Object.keys(CLUB_META);
    const profilesByName = new Map(players.map(player => [player.name.toLowerCase(), player]));
    const scopeParams = new URLSearchParams(window.location.search);
    const availableSeasons = [...new Set([
        ...(window.NEBULA_DATA?.seasons || []).map(season => Number(season.number)),
        ...allMatches.map(match => Number(match.season))
    ])].filter(Number.isFinite).sort((a, b) => b - a);
    const activeSeason = Number(window.NEBULA_DATA?.getActiveSeason?.()?.number)
        || availableSeasons[0]
        || 1;
    const requestedScope = scopeParams.get("scope");
    const recordScope = ["season", "match"].includes(requestedScope) ? requestedScope : "all";
    const requestedSeason = Number(scopeParams.get("season"));
    const selectedSeason = availableSeasons.includes(requestedSeason) ? requestedSeason : activeSeason;
    const requestedMatch = scopeParams.get("match");
    const selectedMatch = allMatches.find(match => match.id === requestedMatch) || allMatches[0] || null;
    const matches = recordScope === "season"
        ? allMatches.filter(match => Number(match.season) === selectedSeason)
        : recordScope === "match"
            ? allMatches.filter(match => match.id === selectedMatch?.id)
            : allMatches;

    function setScopeLocation(scope, value = null) {
        const url = new URL(window.location.href);
        if (scope === "all") {
            url.searchParams.delete("scope");
            url.searchParams.delete("season");
            url.searchParams.delete("match");
        } else {
            url.searchParams.set("scope", scope);
            url.searchParams.delete(scope === "season" ? "match" : "season");
            if (value !== null) url.searchParams.set(scope, value);
        }
        window.location.href = url.toString();
    }

    function setupScopeControls() {
        const tabs = document.getElementById("recordScopeTabs");
        const seasonSelect = document.getElementById("recordSeasonSelect");
        const matchSelect = document.getElementById("recordMatchSelect");
        const seasonShell = document.getElementById("recordSeasonShell");
        const matchShell = document.getElementById("recordMatchShell");

        seasonSelect.innerHTML = availableSeasons.length
            ? availableSeasons.map(season => (
                `<option value="${season}" ${season === selectedSeason ? "selected" : ""}>SAISON ${String(season).padStart(2, "0")}</option>`
            )).join("")
            : '<option value="">AUCUNE SAISON</option>';

        matchSelect.innerHTML = allMatches.length
            ? allMatches.map(match => {
                const home = clubInfo(match.home).name;
                const away = clubInfo(match.away).name;
                const selected = match.id === selectedMatch?.id ? "selected" : "";
                return `<option value="${match.id}" ${selected}>${match.date} · ${home} ${match.scoreHome}–${match.scoreAway} ${away}</option>`;
            }).join("")
            : '<option value="">AUCUN MATCH</option>';

        seasonSelect.disabled = !availableSeasons.length;
        matchSelect.disabled = !allMatches.length;
        seasonShell.classList.toggle("is-visible", recordScope === "season");
        matchShell.classList.toggle("is-visible", recordScope === "match");

        tabs.querySelectorAll("[data-record-scope]").forEach(button => {
            const active = button.dataset.recordScope === recordScope;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        tabs.addEventListener("click", event => {
            const button = event.target.closest("[data-record-scope]");
            if (!button) return;
            const scope = button.dataset.recordScope;
            if (scope === "season") setScopeLocation(scope, selectedSeason);
            else if (scope === "match") setScopeLocation(scope, selectedMatch?.id || "");
            else setScopeLocation("all");
        });
        seasonSelect.addEventListener("change", () => setScopeLocation("season", seasonSelect.value));
        matchSelect.addEventListener("change", () => setScopeLocation("match", matchSelect.value));

        const scopeLabel = recordScope === "season"
            ? `SAISON ${String(selectedSeason).padStart(2, "0")}`
            : recordScope === "match"
                ? (selectedMatch ? `MATCH ${selectedMatch.id.toUpperCase()}` : "MATCH SANS DONNÉE")
                : "ARCHIVES ABSOLUES";
        document.getElementById("recordScopeStatus").textContent = scopeLabel;
        document.getElementById("recordScopeSignal").textContent = `PÉRIMÈTRE // ${scopeLabel}`;
        document.getElementById("recordScopeEyebrow").textContent = recordScope === "all"
            ? "LEADERS ABSOLUS"
            : `LEADERS // ${scopeLabel}`;
    }

    function playerProfile(name) {
        return profilesByName.get(String(name).toLowerCase()) || null;
    }

    function playerHref(name) {
        const profile = playerProfile(name);
        return profile ? window.NEBULA_DATA.playerPageHref(profile) : null;
    }

    function playerClub(name) {
        const profile = playerProfile(name);
        return profile
            ? { key: profile.club, name: profile.clubName }
            : { key: "unknown", name: "Non référencé" };
    }

    function playerAvatar(name) {
        return playerProfile(name)?.avatar || "images/logos/nebula.png";
    }

    function clubInfo(key) {
        const fallback = { name: key || "???", logo: "", cls: key || "" };
        return typeof CLUB_META === "undefined" ? fallback : (CLUB_META[key] || fallback);
    }

    function clubTitles(key) {
        if (typeof CLUBS === "undefined") return 0;
        return CLUBS.find(clubItem => clubItem.key === key)?.titles || 0;
    }

    function formatCredits(value) {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B ¥`;
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M ¥`;
        }
        return `${value.toLocaleString("fr-FR")} ¥`;
    }

    function plural(value, singular, pluralForm = `${singular}s`) {
        return `${value} ${value === 1 ? singular : pluralForm}`;
    }

    // « 12,5 M ¥ » → { figure: "12,5", unit: "M ¥" } : le chiffre s'affiche en
    // grand, l'unité en petit à côté.
    function splitFigure(text) {
        const match = /^(-?[\d\s\u00a0\u202f.,]+?)\s*([^\d\s.,].*)?$/.exec(String(text).trim());
        return match
            ? { figure: match[1].trim(), unit: (match[2] || "").trim() }
            : { figure: String(text), unit: "" };
    }

    function pad2(value) {
        return String(value).padStart(2, "0");
    }

    // Numéro de caméra d'un joueur : sa place dans le registre (CAM 01 = premier).
    function camNumber(name) {
        const index = players.findIndex(player => player.name.toLowerCase() === String(name).toLowerCase());
        return index === -1 ? "--" : pad2(index + 1);
    }

    function isRetired(name) {
        return playerProfile(name)?.club === "retraite";
    }

    // Couleur d'identité d'un club (filet fin) ; les retraités passent en gris archive.
    function clubAccent(key) {
        if (key === "retraite" || key === "unknown") return "var(--offline)";
        return RECORD_CLUB_COLORS[key] || "var(--blue-2)";
    }

    function escapeAttribute(value) {
        return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    }

    function buildPlayerRecords() {
        const records = {};

        function ensure(name) {
            if (!records[name]) {
                records[name] = {
                    name,
                    buts: 0,
                    passes: 0,
                    defenses: 0,
                    dribbles: 0,
                    matchs: 0,
                    mvp: 0
                };
            }
            return records[name];
        }

        matches.forEach(match => {
            const matchStats = computePlayerStats(match);
            Object.entries(matchStats).forEach(([name, stats]) => {
                const record = ensure(name);
                record.buts += stats.buts || 0;
                record.passes += stats.passes || 0;
                record.defenses += stats.defenses || 0;
                record.dribbles += stats.dribbles || 0;
                record.matchs += 1;
            });
            const matchMvp = typeof computeMatchMvp === "function" ? computeMatchMvp(match)?.name : match.mvp;
            if (matchMvp) ensure(matchMvp).mvp += 1;
        });

        return Object.values(records);
    }

    function buildClubRecords() {
        const records = Object.fromEntries(clubKeys.map(key => [key, {
            key,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            gf: 0,
            ga: 0,
            titles: clubTitles(key)
        }]));

        matches.forEach(match => {
            if (!records[match.home] || !records[match.away]) return;
            const home = records[match.home];
            const away = records[match.away];
            home.played += 1;
            away.played += 1;
            home.gf += match.scoreHome;
            home.ga += match.scoreAway;
            away.gf += match.scoreAway;
            away.ga += match.scoreHome;

            if (match.scoreHome > match.scoreAway) {
                home.wins += 1;
                away.losses += 1;
                home.points += 3;
            } else if (match.scoreAway > match.scoreHome) {
                away.wins += 1;
                home.losses += 1;
                away.points += 3;
            } else {
                home.draws += 1;
                away.draws += 1;
                home.points += 1;
                away.points += 1;
            }
        });

        return Object.values(records)
            .map(record => ({
                ...record,
                diff: record.gf - record.ga,
                winpct: record.played ? Math.round((record.wins / record.played) * 100) : 0
            }))
            .sort((a, b) => b.points - a.points || b.diff - a.diff || b.gf - a.gf);
    }

    function categoryRanking(records, category) {
        return [...records].sort((a, b) =>
            b[category] - a[category] ||
            b.matchs - a.matchs ||
            a.name.localeCompare(b.name, "fr")
        );
    }

    function fastestGoalRecord() {
        let fastest = null;
        matches.forEach(match => {
            [...(match.timelineHome || []), ...(match.timelineAway || [])].forEach(event => {
                const timeMatch = /(\d+)'(\d+)/.exec(event.time || "");
                if (!timeMatch) return;
                const seconds = Number(timeMatch[1]) * 60 + Number(timeMatch[2]);
                if (!fastest || seconds < fastest.seconds) {
                    fastest = { ...event, seconds, season: Number(match.season) || null };
                }
            });
        });
        return fastest;
    }

    function longestUnbeatenRecord() {
        const state = Object.fromEntries(clubKeys.map(key => [key, { current: 0, best: 0 }]));
        [...matches].sort((a, b) => a.date.localeCompare(b.date)).forEach(match => {
            const draw = match.scoreHome === match.scoreAway;
            const homeUnbeaten = draw || match.scoreHome > match.scoreAway;
            const awayUnbeaten = draw || match.scoreAway > match.scoreHome;

            [[match.home, homeUnbeaten], [match.away, awayUnbeaten]].forEach(([key, unbeaten]) => {
                if (!state[key]) return;
                state[key].current = unbeaten ? state[key].current + 1 : 0;
                state[key].best = Math.max(state[key].best, state[key].current);
            });
        });

        return Object.entries(state)
            .map(([key, value]) => ({ key, value: value.best }))
            .sort((a, b) => b.value - a.value)[0] || { key: clubKeys[0], value: 0 };
    }

    const playerRecords = buildPlayerRecords();
    const clubRecords = buildClubRecords();
    const scorerRanking = categoryRanking(playerRecords, "buts");
    const passerRanking = categoryRanking(playerRecords, "passes");
    const defenderRanking = categoryRanking(playerRecords, "defenses");
    const dribblerRanking = categoryRanking(playerRecords, "dribbles");
    const mostValuable = [...players]
        .sort((a, b) => b.value - a.value)
        .find(player => Number(player.value) > 0) || null;
    const topScorer = scorerRanking[0];

    const totalGoals = matches.reduce((sum, match) => sum + match.scoreHome + match.scoreAway, 0);
    document.getElementById("archiveMatches").textContent = String(matches.length).padStart(2, "0");
    document.getElementById("archiveGoals").textContent = String(totalGoals).padStart(2, "0");
    document.getElementById("archivePlayers").textContent = String(playerRecords.length).padStart(2, "0");
    // Détenteurs : un flux caméra par record. Sans détenteur, le flux reste en
    // veille (image de veille grisée + mire) et affiche EN ATTENTE.
    function leaderCard(record, index) {
        const holder = Boolean(record.name);
        const profile = holder ? playerProfile(record.name) : null;
        const href = holder ? playerHref(record.name) : null;
        const tag = href ? "a" : "div";
        const retired = holder && isRetired(record.name);
        const club = holder
            ? playerClub(record.name)
            : { key: "unknown", name: "Aucune donnée" };
        const image = profile?.avatar || record.standby;
        const state = !holder
            ? " is-offline is-standby"
            : retired
                ? " is-offline is-retired"
                : index === 0 ? " is-locked" : "";
        const status = !holder
            ? '<span class="rec is-off">EN ATTENTE</span>'
            : retired
                ? '<span class="rec is-off">HORS LIGNE</span>'
                : '<span class="rec">RECORD ACTIF</span>';
        const { figure, unit } = splitFigure(record.value);
        const ariaLabel = `${record.label} : ${record.name}, ${record.value}`;
        const hrefAttribute = href ? ` href="${href}" aria-label="${escapeAttribute(ariaLabel)}"` : "";

        return `
            <${tag} class="record-leader-card nl-feed${state}" style="--record-accent:${record.accent};"${hrefAttribute}>
                <img class="nl-feed-img" src="${image}" alt="" loading="lazy" decoding="async">
                ${holder ? "" : '<span class="leader-card-mire" aria-hidden="true"></span>'}
                ${href ? '<span class="nl-feed-lock" aria-hidden="true"></span>' : ""}
                <span class="nl-feed-osd" aria-hidden="true"><span><b>CAM ${pad2(index + 1)}</b> // ${record.watermark}</span>${status}</span>
                ${holder ? "" : '<span class="leader-card-wait" aria-hidden="true">Signal en attente</span>'}
                <strong class="nl-feed-figure leader-card-figure">${figure}<small>${unit}</small></strong>
                <span class="nl-feed-caption"><small>${record.label}</small><b>${holder ? record.name : "Non attribué"}</b><em>${club.name}</em></span>
            </${tag}>
        `;
    }

    const highlights = [
        {
            code: "GLS // 01",
            label: "Meilleur buteur",
            name: topScorer?.name,
            value: topScorer ? plural(topScorer.buts, "but") : "0 but",
            watermark: "GLS",
            accent: RECORD_CATEGORY_META.buts.accent,
            standby: RECORD_CATEGORY_META.buts.standby
        },
        {
            code: "AST // 02",
            label: "Meilleur passeur",
            name: passerRanking[0]?.name,
            value: passerRanking[0] ? plural(passerRanking[0].passes, "passe D.", "passes D.") : "0 passe D.",
            watermark: "AST",
            accent: RECORD_CATEGORY_META.passes.accent,
            standby: RECORD_CATEGORY_META.passes.standby
        },
        {
            code: "DEF // 03",
            label: "Meilleur défenseur",
            name: defenderRanking[0]?.name,
            value: defenderRanking[0] ? plural(defenderRanking[0].defenses, "défense") : "0 défense",
            watermark: "DEF",
            accent: RECORD_CATEGORY_META.defenses.accent,
            standby: RECORD_CATEGORY_META.defenses.standby
        },
        {
            code: "DRB // 04",
            label: "Meilleur dribbleur",
            name: dribblerRanking[0]?.name,
            value: dribblerRanking[0] ? plural(dribblerRanking[0].dribbles, "dribble") : "0 dribble",
            watermark: "DRB",
            accent: RECORD_CATEGORY_META.dribbles.accent,
            standby: RECORD_CATEGORY_META.dribbles.standby
        },
        {
            code: "VAL // 05",
            label: "Plus forte valeur",
            name: mostValuable?.name,
            value: mostValuable ? formatCredits(mostValuable.value) : "0 ¥",
            watermark: "VAL",
            accent: "var(--paper)",
            standby: RECORD_VALUE_STANDBY
        }
    ];
    highlightGrid.innerHTML = highlights.map(leaderCard).join("");

    const signalEntries = [
        {
            label: "RECORD DE BUTS",
            name: topScorer?.name || "AUCUN",
            value: topScorer ? plural(topScorer.buts, "BUT", "BUTS") : "0 BUT"
        },
        {
            label: "RECORD DE PASSES",
            name: passerRanking[0]?.name || "AUCUN",
            value: passerRanking[0] ? plural(passerRanking[0].passes, "PASSE D.", "PASSES D.") : "0 PASSE D."
        },
        {
            label: "RECORD DE DÉFENSES",
            name: defenderRanking[0]?.name || "AUCUN",
            value: defenderRanking[0] ? plural(defenderRanking[0].defenses, "DÉFENSE", "DÉFENSES") : "0 DÉFENSE"
        },
        {
            label: "RECORD DE DRIBBLES",
            name: dribblerRanking[0]?.name || "AUCUN",
            value: dribblerRanking[0] ? plural(dribblerRanking[0].dribbles, "DRIBBLE", "DRIBBLES") : "0 DRIBBLE"
        },
        {
            label: "RECORD DE VALEUR",
            name: mostValuable?.name || "AUCUN",
            value: mostValuable ? formatCredits(mostValuable.value) : "0 ¥"
        }
    ].map((entry, index) => {
        const highlight = highlights[index];
        const holder = Boolean(highlight.name);
        return {
            ...entry,
            holder,
            code: highlight.watermark,
            accent: highlight.accent,
            image: (holder && playerProfile(highlight.name)?.avatar) || highlight.standby
        };
    });

    const signalPanel = document.querySelector(".record-signal");
    const signalReadout = signalPanel?.querySelector(".record-signal-readout");
    const signalImage = signalPanel?.querySelector("[data-record-signal-img]");
    const signalCode = signalPanel?.querySelector("[data-record-signal-code]");
    const signalStatus = signalPanel?.querySelector("[data-record-signal-status]");
    const signalPips = [...(signalPanel?.querySelectorAll("[data-record-signal-pips] > span") || [])];
    const signalLabel = document.getElementById("recordSignalLabel");
    const signalName = document.getElementById("recordSignalName");
    const signalValue = document.getElementById("recordSignalValue");
    let signalIndex = 0;
    let signalTransitionTimer = null;

    function applySignal(entry, index) {
        signalPanel?.style.setProperty("--signal-accent", entry.accent);
        signalPanel?.classList.toggle("is-offline", !entry.holder);
        if (signalImage && signalImage.getAttribute("src") !== entry.image) signalImage.src = entry.image;
        if (signalCode) signalCode.textContent = entry.code;
        if (signalStatus) {
            signalStatus.textContent = entry.holder ? "RECORD ACTIF" : "EN ATTENTE";
            signalStatus.classList.toggle("is-off", !entry.holder);
        }
        signalPips.forEach((pip, pipIndex) => pip.classList.toggle("is-active", pipIndex === index));
        signalLabel.textContent = entry.label;
        signalName.textContent = entry.name;
        signalValue.textContent = entry.value;
        signalReadout?.classList.remove("is-changing");
    }

    function showSignal(index, immediate = false) {
        const entry = signalEntries[index];
        if (!entry) return;
        if (immediate) {
            applySignal(entry, index);
            return;
        }
        signalReadout?.classList.add("is-changing");
        window.clearTimeout(signalTransitionTimer);
        signalTransitionTimer = window.setTimeout(() => applySignal(entry, index), 220);
    }

    showSignal(signalIndex, true);
    if (signalEntries.length > 1) {
        window.setInterval(() => {
            if (document.hidden) return;
            signalIndex = (signalIndex + 1) % signalEntries.length;
            showSignal(signalIndex);
        }, RECORD_SIGNAL_INTERVAL_MS);
    }

    // Classement des clubs : tableau « régie ». Tant qu'aucun club n'a joué,
    // le rang reste « -- » (pas de faux premier).
    const anyClubPlayed = clubRecords.some(record => record.played > 0);
    const clubArchiveState = document.getElementById("clubArchiveState");
    if (clubArchiveState) {
        clubArchiveState.textContent = anyClubPlayed ? "TRI // POINTS" : "EN ATTENTE // 0 MATCH JOUÉ";
    }
    document.getElementById("clubRecordsBody").innerHTML = clubRecords.map((record, index) => {
        const info = clubInfo(record.key);
        const accent = clubAccent(record.key);
        const isLeader = anyClubPlayed && index === 0;
        return `
            <tr class="${isLeader ? "is-leader" : ""}" style="--club:${accent}; --club-accent:${accent};">
                <td class="nl-num"><span class="club-record-rank">${anyClubPlayed ? pad2(index + 1) : "--"}</span></td>
                <td class="nl-strong"><span class="club-record-identity"><img src="${info.logo}" alt="" loading="lazy" decoding="async"><strong>${info.name}</strong></span></td>
                <td class="club-cell-mj" data-label="MJ">${record.played}</td>
                <td class="is-hl" data-label="Pts"><strong>${record.points}</strong></td>
                <td class="club-cell-vnd" data-label="V–N–D">${record.wins}–${record.draws}–${record.losses}</td>
                <td class="club-cell-diff${record.diff > 0 ? " positive" : record.diff < 0 ? " negative" : ""}" data-label="Diff.">${record.diff > 0 ? "+" : ""}${record.diff}</td>
                <td class="club-winrate-cell" data-label="Victoires">
                    <span class="club-winrate nl-vu" style="--v:${record.winpct}" role="meter" aria-label="Taux de victoire ${escapeAttribute(info.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${record.winpct}"></span>
                    <small>${record.winpct}%</small>
                </td>
            </tr>
        `;
    }).join("");

    function renderPlayerRanking(category) {
        const meta = RECORD_CATEGORY_META[category];
        const records = categoryRanking(playerRecords, category);
        const maximum = records[0]?.[category] || 1;
        const podium = records.slice(0, 3);

        document.getElementById("rankingSummary").innerHTML = podium.length ? `
            <div class="ranking-podium" style="--category-accent:${meta.accent};">
                ${podium.map((record, index) => {
                    const rank = index + 1;
                    const club = playerClub(record.name);
                    const href = playerHref(record.name);
                    const tag = href ? "a" : "div";
                    const retired = isRetired(record.name);
                    const ariaLabel = `Position ${pad2(rank)} : ${record.name}, ${record[category]} ${meta.label.toLowerCase()}`;
                    const hrefAttribute = href ? ` href="${href}" aria-label="${escapeAttribute(ariaLabel)}"` : "";
                    const state = retired ? " is-offline" : rank === 1 ? " is-locked" : "";
                    const status = retired
                        ? '<span class="rec is-off">HORS LIGNE</span>'
                        : rank === 1 ? '<span class="rec">EN TÊTE</span>' : "";
                    return `
                        <${tag} class="podium-entry podium-rank-${rank} nl-feed${state}"${hrefAttribute}>
                            <img class="nl-feed-img" src="${playerAvatar(record.name)}" alt="" loading="lazy" decoding="async">
                            ${href ? '<span class="nl-feed-lock" aria-hidden="true"></span>' : ""}
                            <span class="nl-feed-osd" aria-hidden="true"><span><b>CAM ${camNumber(record.name)}</b> // ${meta.code}</span>${status}</span>
                            <span class="podium-place" aria-hidden="true"><small>POS</small>${pad2(rank)}</span>
                            <strong class="nl-feed-figure podium-value">${record[category]}<small>${meta.code}</small></strong>
                            <span class="nl-feed-caption"><small>${club.name}</small><b>${record.name}</b></span>
                        </${tag}>
                    `;
                }).join("")}
            </div>
        ` : `
            <div class="nl-nosignal ranking-nosignal">
                <span class="nl-nosignal-code">SIGNAL 00 // ${meta.code}</span>
                <strong>Aucun classement</strong>
                <p>Les ${meta.label.toLowerCase()} apparaîtront ici dès le premier match archivé.</p>
            </div>
        `;

        document.getElementById("playerRecordList").innerHTML = records.slice(3).map((record, index) => {
            const club = playerClub(record.name);
            const href = playerHref(record.name);
            const tag = href ? "a" : "div";
            const hrefAttribute = href ? ` href="${href}"` : "";
            const width = record[category] > 0 ? Math.max(3, Math.round((record[category] / maximum) * 100)) : 0;
            const retired = isRetired(record.name);
            return `
                <${tag} class="player-record-row${retired ? " is-offline" : ""}" style="--category-accent:${meta.accent}; --club:${clubAccent(club.key)};"${hrefAttribute}>
                    <span class="player-record-rank">${pad2(index + 4)}</span>
                    <span class="player-record-thumb"><img src="${playerAvatar(record.name)}" alt="" loading="lazy" decoding="async"></span>
                    <span class="player-record-name"><small>${retired ? "Hors ligne // " : ""}${club.name}</small><strong>${record.name}</strong></span>
                    <span class="player-record-bar nl-vu" style="--v:${width}" aria-hidden="true"></span>
                    <span class="player-record-value"><strong>${record[category]}</strong><small>${meta.code}</small></span>
                </${tag}>
            `;
        }).join("");
    }

    const categoryTabs = document.getElementById("recordCategoryTabs");
    categoryTabs.addEventListener("click", event => {
        const button = event.target.closest("[data-record-category]");
        if (!button) return;
        categoryTabs.querySelectorAll("button").forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        renderPlayerRanking(button.dataset.recordCategory);
    });

    const prolificMatch = [...matches].sort((a, b) =>
        (b.scoreHome + b.scoreAway) - (a.scoreHome + a.scoreAway)
    )[0];
    const biggestWin = [...matches].sort((a, b) =>
        Math.abs(b.scoreHome - b.scoreAway) - Math.abs(a.scoreHome - a.scoreAway)
    )[0];
    const fastestGoal = fastestGoalRecord();
    const bestOffense = [...clubRecords].sort((a, b) => b.gf - a.gf)[0];
    const playedClubRecords = clubRecords.filter(record => record.played > 0);
    const bestDefense = [...playedClubRecords].sort((a, b) => a.ga - b.ga || b.points - a.points)[0];
    const unbeaten = longestUnbeatenRecord();
    const hasOffense = Boolean(bestOffense && bestOffense.gf > 0);
    const hasUnbeaten = unbeaten.value > 0;

    const vaultRecords = [
        {
            code: "MAT–01",
            label: "Match le plus prolifique",
            value: prolificMatch
                ? `${clubInfo(prolificMatch.home).name} ${prolificMatch.scoreHome}–${prolificMatch.scoreAway} ${clubInfo(prolificMatch.away).name}`
                : "Aucune donnée",
            detail: prolificMatch ? plural(prolificMatch.scoreHome + prolificMatch.scoreAway, "but") : "0 but",
            season: Number(prolificMatch?.season) || null,
            hasData: Boolean(prolificMatch)
        },
        {
            code: "MAT–02",
            label: "Plus grosse victoire",
            value: biggestWin
                ? `${clubInfo(biggestWin.home).name} ${biggestWin.scoreHome}–${biggestWin.scoreAway} ${clubInfo(biggestWin.away).name}`
                : "Aucune donnée",
            detail: biggestWin ? `Écart de ${Math.abs(biggestWin.scoreHome - biggestWin.scoreAway)} buts` : "Écart de 0",
            season: Number(biggestWin?.season) || null,
            hasData: Boolean(biggestWin)
        },
        {
            code: "PLR–03",
            label: "But le plus rapide",
            value: fastestGoal?.scorer || "Aucun",
            detail: fastestGoal ? fastestGoal.time : "0 seconde",
            season: Number(fastestGoal?.season) || null,
            hasData: Boolean(fastestGoal)
        },
        {
            code: "CLB–04",
            label: "Meilleure attaque",
            value: hasOffense ? clubInfo(bestOffense.key).name : "Aucun",
            detail: hasOffense ? plural(bestOffense.gf, "but marqué", "buts marqués") : "0 but marqué",
            hasData: hasOffense
        },
        {
            code: "CLB–05",
            label: "Meilleure défense",
            value: bestDefense ? clubInfo(bestDefense.key).name : "Aucun",
            detail: bestDefense ? plural(bestDefense.ga, "but encaissé", "buts encaissés") : "0 but encaissé",
            hasData: Boolean(bestDefense)
        },
        {
            code: "CLB–06",
            label: "Série d’invincibilité",
            value: hasUnbeaten ? clubInfo(unbeaten.key).name : "Aucun",
            detail: plural(unbeaten.value, "match"),
            hasData: hasUnbeaten
        }
    ];

    document.getElementById("recordVaultGrid").innerHTML = vaultRecords.map((record, index) => {
        const archiveIndex = pad2(index + 1);
        const seasonLabel = record.season
            ? `SAISON ${pad2(record.season)} · ${archiveIndex}`
            : `BANDE ${archiveIndex}`;
        if (record.href) {
            return `
                <a class="vault-record has-link vault-tape nl-feed" href="${record.href}" target="_blank" rel="noopener">
                    <img class="nl-feed-img" src="${record.image}" alt="" loading="lazy" decoding="async">
                    <span class="nl-feed-osd" aria-hidden="true"><span><b>${record.code}</b> // ${seasonLabel}</span><span class="vault-tape-state">▶ LECTURE</span></span>
                    <span class="vault-play" aria-hidden="true"></span>
                    <span class="nl-feed-caption"><small>${record.value}</small><b>${record.label}</b><em>${record.detail} ↗</em></span>
                </a>
            `;
        }
        return `
            <article class="vault-record${record.hasData ? "" : " is-empty"}">
                <div class="vault-record-osd"><span>${record.code}</span><small>${seasonLabel}</small></div>
                <strong>${record.label}</strong>
                <p>${String(record.value).replace(/(\d+\s*[–-]\s*\d+)/g, '<span class="vault-score">$1</span>')}</p>
                <span>${record.detail}</span>
            </article>
        `;
    }).join("");

    setupScopeControls();
    renderPlayerRanking("buts");
});
