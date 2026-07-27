const RECORD_CATEGORY_META = {
    buts: { code: "GLS", label: "Buts", accent: "#ff5d66" },
    passes: { code: "AST", label: "Passes décisives", accent: "#63e7ff" },
    defenses: { code: "DEF", label: "Défenses", accent: "#43f58b" },
    dribbles: { code: "DRB", label: "Dribbles", accent: "#c879ff" }
};

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
    const matches = typeof MATCHES === "undefined" ? [] : MATCHES;
    const clubKeys = typeof CLUB_META === "undefined" ? [] : Object.keys(CLUB_META);
    const profilesByName = new Map(players.map(player => [player.name.toLowerCase(), player]));

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
                if (!fastest || seconds < fastest.seconds) fastest = { ...event, seconds };
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
    const mostValuable = [...players].sort((a, b) => b.value - a.value)[0];
    const topScorer = scorerRanking[0];

    const totalGoals = matches.reduce((sum, match) => sum + match.scoreHome + match.scoreAway, 0);
    document.getElementById("archiveMatches").textContent = String(matches.length).padStart(2, "0");
    document.getElementById("archiveGoals").textContent = String(totalGoals).padStart(2, "0");
    document.getElementById("archivePlayers").textContent = String(playerRecords.length).padStart(2, "0");
    function leaderCard(record) {
        const profile = record.name ? playerProfile(record.name) : null;
        const href = record.name ? playerHref(record.name) : null;
        const tag = href ? "a" : "article";
        const hrefAttribute = href ? ` href="${href}"` : "";
        const avatar = profile?.avatar || "images/logos/nebula.png";
        const club = record.name ? playerClub(record.name) : { key: "unknown", name: record.subtitle || "Archive" };

        return `
            <${tag} class="record-leader-card" style="--record-accent:${record.accent};"${hrefAttribute}>
                <div class="leader-card-topline"><span>${record.code}</span><span><i></i> RECORD ACTIF</span></div>
                <div class="leader-card-visual">
                    <img src="${avatar}" alt="${record.name || record.label}">
                    <span>${record.watermark}</span>
                </div>
                <div class="leader-card-body">
                    <small>${record.label}</small>
                    <strong>${record.name || "Aucun"}</strong>
                    <span>${club.name}</span>
                    <div><b>${record.value}</b><i>↗</i></div>
                </div>
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
            accent: "#ff5d66"
        },
        {
            code: "AST // 02",
            label: "Meilleur passeur",
            name: passerRanking[0]?.name,
            value: passerRanking[0] ? plural(passerRanking[0].passes, "passe D.", "passes D.") : "0 passe D.",
            watermark: "AST",
            accent: "#63e7ff"
        },
        {
            code: "DEF // 03",
            label: "Meilleur défenseur",
            name: defenderRanking[0]?.name,
            value: defenderRanking[0] ? plural(defenderRanking[0].defenses, "défense") : "0 défense",
            watermark: "DEF",
            accent: "#43f58b"
        },
        {
            code: "DRB // 04",
            label: "Meilleur dribbleur",
            name: dribblerRanking[0]?.name,
            value: dribblerRanking[0] ? plural(dribblerRanking[0].dribbles, "dribble") : "0 dribble",
            watermark: "DRB",
            accent: "#c879ff"
        },
        {
            code: "VAL // 05",
            label: "Plus forte valeur",
            name: mostValuable?.name,
            value: mostValuable ? formatCredits(mostValuable.value) : "0 ¥",
            watermark: "VAL",
            accent: "#ffd84d"
        }
    ];
    highlightGrid.innerHTML = highlights.map(leaderCard).join("");

    const signalEntries = [
        {
            label: "RECORD DE BUTS",
            name: topScorer?.name || "AUCUN",
            value: topScorer ? plural(topScorer.buts, "BUT", "BUTS") : "0 BUT",
            accent: "#ff5d66"
        },
        {
            label: "RECORD DE PASSES",
            name: passerRanking[0]?.name || "AUCUN",
            value: passerRanking[0] ? plural(passerRanking[0].passes, "PASSE D.", "PASSES D.") : "0 PASSE D.",
            accent: "#63e7ff"
        },
        {
            label: "RECORD DE DÉFENSES",
            name: defenderRanking[0]?.name || "AUCUN",
            value: defenderRanking[0] ? plural(defenderRanking[0].defenses, "DÉFENSE", "DÉFENSES") : "0 DÉFENSE",
            accent: "#43f58b"
        },
        {
            label: "RECORD DE DRIBBLES",
            name: dribblerRanking[0]?.name || "AUCUN",
            value: dribblerRanking[0] ? plural(dribblerRanking[0].dribbles, "DRIBBLE", "DRIBBLES") : "0 DRIBBLE",
            accent: "#c879ff"
        },
        {
            label: "RECORD DE VALEUR",
            name: mostValuable?.name || "AUCUN",
            value: mostValuable ? formatCredits(mostValuable.value) : "0 ¥",
            accent: "#ffd84d"
        }
    ];

    const signalPanel = document.querySelector(".record-signal");
    const signalReadout = signalPanel?.querySelector(".record-signal-readout");
    const signalLabel = document.getElementById("recordSignalLabel");
    const signalName = document.getElementById("recordSignalName");
    const signalValue = document.getElementById("recordSignalValue");
    let signalIndex = 0;
    let signalTransitionTimer = null;

    function applySignal(entry) {
        signalPanel?.style.setProperty("--signal-accent", entry.accent);
        signalLabel.textContent = entry.label;
        signalName.textContent = entry.name;
        signalValue.textContent = entry.value;
        signalReadout?.classList.remove("is-changing");
    }

    function showSignal(index, immediate = false) {
        const entry = signalEntries[index];
        if (!entry) return;
        if (immediate) {
            applySignal(entry);
            return;
        }
        signalReadout?.classList.add("is-changing");
        window.clearTimeout(signalTransitionTimer);
        signalTransitionTimer = window.setTimeout(() => applySignal(entry), 220);
    }

    showSignal(signalIndex, true);
    if (signalEntries.length > 1) {
        window.setInterval(() => {
            signalIndex = (signalIndex + 1) % signalEntries.length;
            showSignal(signalIndex);
        }, RECORD_SIGNAL_INTERVAL_MS);
    }

    document.getElementById("clubRecordsBody").innerHTML = clubRecords.map((record, index) => {
        const info = clubInfo(record.key);
        const accent = RECORD_CLUB_COLORS[record.key] || "#63e7ff";
        return `
            <tr style="--club-accent:${accent};">
                <td><span class="club-record-rank">${String(index + 1).padStart(2, "0")}</span></td>
                <td><span class="club-record-identity"><img src="${info.logo}" alt=""><strong>${info.name}</strong></span></td>
                <td>${record.played}</td>
                <td><strong>${record.points}</strong></td>
                <td>${record.wins}–${record.draws}–${record.losses}</td>
                <td class="${record.diff > 0 ? "positive" : record.diff < 0 ? "negative" : ""}">${record.diff > 0 ? "+" : ""}${record.diff}</td>
                <td>
                    <span class="club-winrate"><i style="width:${record.winpct}%"></i></span>
                    <small>${record.winpct}%</small>
                </td>
            </tr>
        `;
    }).join("");

    function renderPlayerRanking(category) {
        const meta = RECORD_CATEGORY_META[category];
        const records = categoryRanking(playerRecords, category);
        const maximum = records[0]?.[category] || 1;
        const leader = records[0];

        document.getElementById("rankingSummary").innerHTML = leader ? `
          <div class="ranking-summary-code"><span>${meta.code}</span></div>
            <img src="${playerAvatar(leader.name)}" alt="">
            <div><small>LEADER // ${meta.label.toUpperCase()}</small><strong>${leader.name}</strong></div>
            <span>${leader[category]}</span>
        ` : `<p>Aucune donnée enregistrée.</p>`;

        document.getElementById("playerRecordList").innerHTML = records.map((record, index) => {
            const club = playerClub(record.name);
            const href = playerHref(record.name);
            const tag = href ? "a" : "div";
            const hrefAttribute = href ? ` href="${href}"` : "";
            const width = record[category] > 0 ? Math.max(3, (record[category] / maximum) * 100) : 0;
            return `
                <${tag} class="player-record-row" style="--category-accent:${meta.accent};"${hrefAttribute}>
                    <span class="player-record-rank">${String(index + 1).padStart(2, "0")}</span>
                    <img src="${playerAvatar(record.name)}" alt="">
                    <span class="player-record-name"><small>${club.name}</small><strong>${record.name}</strong></span>
                    <span class="player-record-bar"><i style="width:${width}%"></i></span>
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

    const vaultRecords = [
        {
            code: "MAT–01",
            label: "Match le plus prolifique",
            value: prolificMatch
                ? `${clubInfo(prolificMatch.home).name} ${prolificMatch.scoreHome}–${prolificMatch.scoreAway} ${clubInfo(prolificMatch.away).name}`
                : "Aucune donnée",
            detail: prolificMatch ? plural(prolificMatch.scoreHome + prolificMatch.scoreAway, "but") : "0 but"
        },
        {
            code: "MAT–02",
            label: "Plus grosse victoire",
            value: biggestWin
                ? `${clubInfo(biggestWin.home).name} ${biggestWin.scoreHome}–${biggestWin.scoreAway} ${clubInfo(biggestWin.away).name}`
                : "Aucune donnée",
            detail: biggestWin ? `Écart de ${Math.abs(biggestWin.scoreHome - biggestWin.scoreAway)} buts` : "Écart de 0"
        },
        {
            code: "PLR–03",
            label: "But le plus rapide",
            value: fastestGoal?.scorer || "Aucun",
            detail: fastestGoal ? fastestGoal.time : "0 seconde"
        },
        {
            code: "CLB–04",
            label: "Meilleure attaque",
            value: bestOffense ? clubInfo(bestOffense.key).name : "Aucun",
            detail: bestOffense ? plural(bestOffense.gf, "but marqué", "buts marqués") : "0 but marqué"
        },
        {
            code: "CLB–05",
            label: "Meilleure défense",
            value: bestDefense ? clubInfo(bestDefense.key).name : "Aucun",
            detail: bestDefense ? plural(bestDefense.ga, "but encaissé", "buts encaissés") : "0 but encaissé"
        },
        {
            code: "CLB–06",
            label: "Série d’invincibilité",
            value: clubInfo(unbeaten.key).name,
            detail: plural(unbeaten.value, "match")
        },
        {
            code: "VID–07",
            label: "Meilleur but",
            value: "Archive vidéo",
            detail: "Ouvrir l’enregistrement",
            href: "Autre/greatest_goal.html"
        },
        {
            code: "VID–08",
            label: "Pire raté",
            value: "Archive vidéo",
            detail: "Ouvrir l’enregistrement",
            href: "Autre/worst_goal.html"
        }
    ];

    document.getElementById("recordVaultGrid").innerHTML = vaultRecords.map((record, index) => {
        const tag = record.href ? "a" : "article";
        const href = record.href ? ` href="${record.href}" target="_blank" rel="noopener"` : "";
        return `
            <${tag} class="vault-record ${record.href ? "has-link" : ""}"${href}>
                <div><span>${record.code}</span><small>${String(index + 1).padStart(2, "0")}</small></div>
                <strong>${record.label}</strong>
                <p>${record.value}</p>
                <span>${record.detail}</span>
            </${tag}>
        `;
    }).join("");

    renderPlayerRanking("buts");
});
