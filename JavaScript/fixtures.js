document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".fixtures-page");
    if (!page) return;

    const DATA = window.NEBULA_DATA || {};
    const MATCH_FIXTURES = DATA.fixtures || [];

    window.NEBULA_FIXTURES = MATCH_FIXTURES;

    const MONTHS = [
        "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
        "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"
    ];
    const MONTHS_SHORT = [
        "JAN", "FÉV", "MAR", "AVR", "MAI", "JUN",
        "JUL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"
    ];
    const CATEGORY_LABELS = {
        ligue: "LIGUE",
        ncl: "NCL",
        amical: "AMICAL"
    };
    const WEEKDAYS_SHORT = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];

    const dom = {
        heroStats: document.getElementById("scheduleHeroStats"),
        nextMatch: document.getElementById("nextMatchCard"),
        range: document.getElementById("calendarRange"),
        categoryButtons: [...document.querySelectorAll(".fx-cat-btn")],
        clubSelect: document.getElementById("club-select"),
        calendarView: document.getElementById("view-calendar-btn"),
        listView: document.getElementById("view-list-btn"),
        layout: document.getElementById("fixtures-layout"),
        monthTitle: document.getElementById("calendar-month-year"),
        daysGrid: document.getElementById("calendar-days-grid"),
        previousMonth: document.getElementById("prev-month-btn"),
        nextMonth: document.getElementById("next-month-btn"),
        nextDate: document.getElementById("today-btn"),
        listTitle: document.getElementById("fixtures-section-title"),
        resultCount: document.getElementById("fixtures-result-count"),
        resetDate: document.getElementById("reset-date-filter-btn"),
        cards: document.getElementById("fixtures-cards-container"),
        milestones: document.getElementById("fixtureMilestones"),
        modal: document.getElementById("fixture-details-modal"),
        modalTitle: document.getElementById("fixtureModalTitle"),
        modalContent: document.getElementById("modal-content-container")
    };

    const sortedFixtures = [...MATCH_FIXTURES].sort((a, b) => matchTime(a) - matchTime(b));
    const upcomingFixtures = sortedFixtures.filter(match => match.status !== "finished");
    const nextFixture = upcomingFixtures.find(match => matchTime(match) >= Date.now()) || upcomingFixtures[0];

    let currentDate = nextFixture ? parseDate(nextFixture.date) : new Date();
    let selectedDate = null;
    let categoryFilter = "all";
    let clubFilter = "all";
    let viewMode = "calendar";
    let countdownTimer = null;

    populateClubFilter();
    renderCategoryCounts();
    renderHero();
    renderMonthRange();
    renderMilestones();
    renderAll();
    startCountdown();

    function parseDate(dateString) {
        return new Date(`${dateString}T12:00:00`);
    }

    function matchTime(match) {
        return new Date(`${match.date}T${match.time || "00:00"}:00`).getTime();
    }

    function dateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function monthKey(value) {
        const date = typeof value === "string" ? parseDate(value) : value;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatLongDate(dateString) {
        return new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(parseDate(dateString));
    }

    function formatShortDate(dateString) {
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short"
        }).format(parseDate(dateString)).replace(".", "").toUpperCase();
    }

    function isNclFinal(match) {
        if (!match || typeof match !== "object" || match.category !== "ncl") return false;
        const stage = String(match.stage || "").trim().toLowerCase();
        return String(match.valueTier || "").toLowerCase() === "finale" || stage === "finale";
    }

    function visualCategory(match) {
        return isNclFinal(match) ? "finale" : match.category;
    }

    function categoryClass(categoryOrMatch) {
        const category = typeof categoryOrMatch === "object"
            ? visualCategory(categoryOrMatch)
            : categoryOrMatch;
        return `is-${category}`;
    }

    function categoryLabel(match) {
        return isNclFinal(match) ? "FINALE NCL" : CATEGORY_LABELS[match.category];
    }

    function isUnknownTeam(name) {
        return !name || name === "???";
    }

    function teamLabel(name) {
        return isUnknownTeam(name) ? "À déterminer" : name;
    }

    function clubColor(key) {
        const color = key ? DATA.getClub?.(key)?.color : null;
        return color || "var(--offline)";
    }

    function categoryTag(match) {
        const category = visualCategory(match);
        const kit = category === "finale" ? "ncl" : category;
        return `<span class="fixture-category-tag nl-tag nl-tag--${kit} ${categoryClass(match)}">${categoryLabel(match)}</span>`;
    }

    function getBaseFilteredFixtures() {
        return sortedFixtures.filter(match => {
            const categoryMatches = categoryFilter === "all" || match.category === categoryFilter;
            const clubMatches = clubFilter === "all"
                || match.homeTeam === clubFilter
                || match.awayTeam === clubFilter;
            return categoryMatches && clubMatches;
        });
    }

    function populateClubFilter() {
        const clubs = [...new Set(MATCH_FIXTURES.flatMap(match => [match.homeTeam, match.awayTeam]))]
            .filter(club => club && club !== "???")
            .sort((a, b) => a.localeCompare(b, "fr"));

        dom.clubSelect.insertAdjacentHTML("beforeend", clubs.map(club => (
            `<option value="${escapeHtml(club)}">${escapeHtml(club.toUpperCase())}</option>`
        )).join(""));
    }

    function renderCategoryCounts() {
        ["all", "ligue", "ncl", "amical"].forEach(category => {
            const count = category === "all"
                ? MATCH_FIXTURES.length
                : MATCH_FIXTURES.filter(match => match.category === category).length;
            const target = document.getElementById(`cat-count-${category}`);
            if (target) target.textContent = String(count).padStart(2, "0");
        });
    }

    function renderHero() {
        const clubs = new Set(
            MATCH_FIXTURES.flatMap(match => [match.homeTeam, match.awayTeam]).filter(team => !isUnknownTeam(team))
        );
        const activeMonths = new Set(upcomingFixtures.map(match => monthKey(match.date)));
        const pad = value => String(value).padStart(2, "0");

        dom.heroStats.innerHTML = `
            <div class="nl-stat nl-stat--solid"><span class="nl-stat-label">Rencontres à venir</span><strong class="nl-stat-value">${pad(upcomingFixtures.length)}</strong><span class="nl-stat-note">Sur ${pad(MATCH_FIXTURES.length)} programmées</span></div>
            <div class="nl-stat"><span class="nl-stat-label">Clubs engagés</span><strong class="nl-stat-value">${pad(clubs.size)}</strong><span class="nl-stat-note">Ligue et NCL</span></div>
            <div class="nl-stat"><span class="nl-stat-label">Mois actifs</span><strong class="nl-stat-value">${pad(activeMonths.size)}</strong><span class="nl-stat-note">Fenêtres ouvertes</span></div>
        `;

        if (!nextFixture) {
            dom.nextMatch.innerHTML = `
                <div class="next-fixture-empty nl-nosignal">
                    <span class="nl-nosignal-code">SIGNAL 00</span>
                    <strong>Calendrier en attente</strong>
                    <p>Aucune rencontre n’est programmée pour le moment. La prochaine diffusion apparaîtra sur cet écran.</p>
                </div>
            `;
            return;
        }

        const date = parseDate(nextFixture.date);
        dom.nextMatch.innerHTML = `
            <div class="next-fixture-topline">
                <span><b>CAM 10-A</b> // PROCHAINE DIFFUSION</span>
                ${categoryTag(nextFixture)}
            </div>
            <div class="next-fixture-matchup">
                ${teamIdentity(nextFixture.homeTeam, nextFixture.homeLogo, nextFixture.home, "A", "Domicile")}
                <div class="next-fixture-kickoff">
                    <p class="next-fixture-stage">${escapeHtml(nextFixture.stage)}</p>
                    <em>VS</em>
                    <small>${WEEKDAYS_SHORT[date.getDay()]} ${formatShortDate(nextFixture.date)}</small>
                    <strong>${escapeHtml(nextFixture.time)}</strong>
                    <span>COUP D’ENVOI</span>
                </div>
                ${teamIdentity(nextFixture.awayTeam, nextFixture.awayLogo, nextFixture.away, "B", "Extérieur")}
            </div>
            <div class="next-fixture-bar">
                <div class="next-fixture-countdown" id="nextFixtureCountdown">
                    <span>CALCUL DE LA SYNCHRONISATION…</span>
                </div>
                <button class="fixture-control-button next-fixture-open nl-btn" type="button"
                    data-open-fixture="${escapeHtml(nextFixture.id)}">Ouvrir le dossier <span>↗</span></button>
            </div>
        `;
    }

    function teamIdentity(name, logo, key, cam, side, className = "next-team", archived = false) {
        const unknown = isUnknownTeam(name);
        return `
            <div class="${className} nl-feed${unknown ? " is-offline" : ""}" style="--club:${clubColor(key)}">
                <img class="nl-feed-img team-feed-backdrop" src="${escapeHtml(logo)}" alt="">
                <img class="team-feed-crest" src="${escapeHtml(logo)}" alt="">
                <span class="nl-feed-osd"><span><b>CAM ${cam}</b><span class="team-feed-side"> // ${side.toUpperCase()}</span></span>${unknown
                    ? '<span class="rec is-off">HORS LIGNE</span>'
                    : archived ? '<span class="rec is-off">ARCHIVE</span>' : '<span class="rec">REC</span>'}</span>
                <span class="nl-feed-caption"><small>${side}</small><b>${escapeHtml(teamLabel(name))}</b></span>
            </div>
        `;
    }

    function startCountdown() {
        if (!nextFixture) return;

        const update = () => {
            const target = dom.nextMatch.querySelector("#nextFixtureCountdown");
            if (!target) return;

            const remaining = Math.max(0, matchTime(nextFixture) - Date.now());
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining % 86400000) / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);

            target.innerHTML = `
                <span class="next-fixture-countdown-label">Ouverture dans</span>
                <strong>${String(days).padStart(2, "0")}<small>J</small></strong>
                <strong>${String(hours).padStart(2, "0")}<small>H</small></strong>
                <strong>${String(minutes).padStart(2, "0")}<small>M</small></strong>
            `;
        };

        update();
        countdownTimer = window.setInterval(update, 60000);
    }

    function renderMonthRange() {
        const months = [...new Set(upcomingFixtures.map(match => monthKey(match.date)))];

        dom.range.innerHTML = months.map((key, index) => {
            const [year, month] = key.split("-").map(Number);
            const count = upcomingFixtures.filter(match => monthKey(match.date) === key).length;
            const active = monthKey(currentDate) === key;
            return `
                <button class="fixture-control-button season-month${active ? " is-current" : ""}" type="button"
                    data-month-key="${key}" aria-pressed="${active}">
                    <span>CH ${String(index + 1).padStart(2, "0")}</span>
                    <strong>${MONTHS[month - 1]}</strong>
                    <small>${year} // ${String(count).padStart(2, "0")} MATCHS</small>
                </button>
            `;
        }).join("");
    }

    function renderAll() {
        renderCalendar();
        renderFixtureList();
        renderMonthRange();
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const first = new Date(year, month, 1);
        const mondayOffset = (first.getDay() + 6) % 7;
        const gridStart = new Date(year, month, 1 - mondayOffset);
        const today = dateKey(new Date());
        const filtered = getBaseFilteredFixtures();

        dom.monthTitle.textContent = `${MONTHS[month]} ${year}`;
        dom.daysGrid.innerHTML = "";

        for (let index = 0; index < 42; index += 1) {
            const cellDate = new Date(gridStart);
            cellDate.setDate(gridStart.getDate() + index);
            const key = dateKey(cellDate);
            const dayMatches = filtered.filter(match => match.date === key);
            const finishedMatches = dayMatches.filter(match => match.status === "finished");
            const upcomingCategories = [...new Set(
                dayMatches
                    .filter(match => match.status !== "finished")
                    .map(match => visualCategory(match))
            )];
            const isCurrentMonth = cellDate.getMonth() === month;
            const isSelected = selectedDate === key;

            const day = document.createElement("button");
            day.type = "button";
            day.className = [
                "fixture-control-button",
                "calendar-day",
                !isCurrentMonth ? "is-outside" : "",
                key === today ? "is-today" : "",
                isSelected ? "is-selected" : "",
                dayMatches.length ? "has-fixture" : "",
                finishedMatches.length ? "has-finished" : ""
            ].filter(Boolean).join(" ");
            day.dataset.calendarDate = key;
            day.setAttribute(
                "aria-label",
                `${formatLongDate(key)}${dayMatches.length ? `, ${dayMatches.length} match` : ""}`
                + `${finishedMatches.length ? `, ${finishedMatches.length} terminé` : ""}`
            );
            day.setAttribute("aria-pressed", String(isSelected));
            day.innerHTML = `
                <span class="calendar-day-number">${String(cellDate.getDate()).padStart(2, "0")}</span>
                ${dayMatches.length ? `<strong>${String(dayMatches.length).padStart(2, "0")}</strong>` : ""}
                <span class="calendar-day-signals">
                    ${finishedMatches.length ? '<b class="calendar-day-completed" aria-hidden="true"></b>' : ""}
                    ${upcomingCategories.map(category => `<i class="${categoryClass(category)}"></i>`).join("")}
                </span>
            `;
            dom.daysGrid.appendChild(day);
        }
    }

    function renderFixtureList() {
        let fixtures = getBaseFilteredFixtures();
        const currentMonthKey = monthKey(currentDate);

        if (selectedDate) {
            fixtures = fixtures.filter(match => match.date === selectedDate);
            dom.listTitle.textContent = formatLongDate(selectedDate).toUpperCase();
            dom.resetDate.hidden = false;
        } else if (viewMode === "calendar") {
            fixtures = fixtures.filter(match => monthKey(match.date) === currentMonthKey);
            dom.listTitle.textContent = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            dom.resetDate.hidden = true;
        } else {
            dom.listTitle.textContent = "CHRONOLOGIE COMPLÈTE";
            dom.resetDate.hidden = true;
        }

        dom.resultCount.textContent = `${String(fixtures.length).padStart(2, "0")} ${fixtures.length > 1 ? "RENCONTRES" : "RENCONTRE"}`;

        if (!fixtures.length) {
            dom.cards.innerHTML = `
                <div class="fixture-empty-state nl-nosignal">
                    <span class="nl-nosignal-code">SIGNAL 00</span>
                    <strong>Aucune transmission</strong>
                    <p>Aucune rencontre ne correspond à cette date et aux filtres actifs.</p>
                    <button class="fixture-control-button nl-btn nl-btn-sm" type="button" data-clear-fixture-filters>Réinitialiser <span>↺</span></button>
                </div>
            `;
            return;
        }

        dom.cards.innerHTML = fixtures.map((match, index) => fixtureCard(match, index)).join("");
    }

    function fixtureCard(match, index) {
        const date = parseDate(match.date);
        const isFinished = match.status === "finished";
        const homeName = teamLabel(match.homeTeam);
        const awayName = teamLabel(match.awayTeam);
        const centerValue = isFinished
            ? `<strong class="is-score">${match.scoreHome}<i>–</i>${match.scoreAway}</strong><small>TERMINÉ</small>`
            : `<strong>${escapeHtml(match.time)}</strong><small>HEURE LOCALE</small>`;

        return `
            <article class="fixture-card ${categoryClass(match)}${isFinished ? " is-finished" : ""}"
                style="--home:${clubColor(match.home)};--away:${clubColor(match.away)}">
                <div class="fixture-card-rail">
                    <span>PRG ${String(index + 1).padStart(2, "0")}</span>
                    <b>${String(date.getDate()).padStart(2, "0")}</b>
                    <small>${WEEKDAYS_SHORT[date.getDay()]} · ${MONTHS_SHORT[date.getMonth()]}</small>
                </div>
                <div class="fixture-card-main">
                    <div class="fixture-card-meta">
                        ${categoryTag(match)}
                        <span class="fixture-card-stage">${escapeHtml(match.stage)}</span>
                        <time datetime="${escapeHtml(match.date)}T${escapeHtml(match.time)}">
                            ${formatLongDate(match.date).toUpperCase()}
                        </time>
                    </div>
                    <div class="fixture-versus">
                        <div class="fixture-team is-home${isUnknownTeam(match.homeTeam) ? " is-unknown" : ""}">
                            <div>
                                <small>DOMICILE</small>
                                <strong>${escapeHtml(homeName)}</strong>
                            </div>
                            <img src="${escapeHtml(match.homeLogo)}" alt="Logo ${escapeHtml(homeName)}">
                        </div>
                        <div class="fixture-kickoff">
                            ${centerValue}
                        </div>
                        <div class="fixture-team is-away${isUnknownTeam(match.awayTeam) ? " is-unknown" : ""}">
                            <img src="${escapeHtml(match.awayLogo)}" alt="Logo ${escapeHtml(awayName)}">
                            <div>
                                <small>EXTÉRIEUR</small>
                                <strong>${escapeHtml(awayName)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="fixture-card-footer">
                    <span>${escapeHtml(match.competitionLabel)}</span>
                    <button class="fixture-control-button fixture-open-button" type="button"
                        data-open-fixture="${escapeHtml(match.id)}"
                        aria-label="Ouvrir le dossier : ${escapeHtml(homeName)} contre ${escapeHtml(awayName)}">Dossier <b>↗</b></button>
                </div>
            </article>
        `;
    }

    function renderMilestones() {
        const grouped = upcomingFixtures.reduce((groups, match) => {
            const key = monthKey(match.date);
            if (!groups[key]) groups[key] = [];
            groups[key].push(match);
            return groups;
        }, {});

        dom.milestones.innerHTML = Object.entries(grouped).map(([key, matches], index) => {
            const date = parseDate(`${key}-01`);
            const leagueCount = matches.filter(match => match.category === "ligue").length;
            const nclCount = matches.filter(match => match.category === "ncl").length;
            const phase = nclCount
                ? "PHASE FINALE NCL"
                : index === 0
                    ? "OUVERTURE DE SAISON"
                    : "CHAMPIONNAT RÉGULIER";

            const pad = value => String(value).padStart(2, "0");

            return `
                <button class="fixture-control-button fixture-milestone" type="button" data-month-key="${key}"
                    style="--ligue:${leagueCount};--ncl:${nclCount};--total:${Math.max(matches.length, 1)}">
                    <span class="milestone-index"><b>CAM ${pad(index + 1)}</b> // FENÊTRE ${pad(index + 1)}</span>
                    <span class="milestone-copy">
                        <small>${date.getFullYear()} // ${phase}</small>
                        <strong class="milestone-month">${MONTHS[date.getMonth()]}</strong>
                    </span>
                    <span class="milestone-volume">
                        <strong>${pad(matches.length)}</strong>
                        <span>RENCONTRES</span>
                    </span>
                    <span class="milestone-meter" aria-hidden="true"><i class="is-ligue"></i><i class="is-ncl"></i></span>
                    <span class="milestone-breakdown">
                        <span><i class="is-ligue"></i>${pad(leagueCount)} LIGUE</span>
                        <span><i class="is-ncl"></i>${pad(nclCount)} NCL</span>
                    </span>
                    <b class="milestone-arrow" aria-hidden="true">↗</b>
                </button>
            `;
        }).join("");
    }

    function openFixtureModal(matchId) {
        const match = MATCH_FIXTURES.find(item => item.id === matchId);
        if (!match) return;

        const isFinished = match.status === "finished";
        dom.modalTitle.textContent = `${categoryLabel(match)} // ${match.stage.toUpperCase()}`;
        dom.modalContent.innerHTML = `
            <div class="fixture-modal-summary ${categoryClass(match)}">
                <div class="fixture-modal-date">
                    <span>${formatShortDate(match.date)}</span>
                    <strong>${isFinished ? "RÉSULTAT FINAL" : escapeHtml(match.time)}</strong>
                    <small>${escapeHtml(match.competitionLabel)}</small>
                </div>
                <div class="fixture-modal-versus">
                    ${teamIdentity(match.homeTeam, match.homeLogo, match.home, "A", "Domicile", "fixture-modal-team", isFinished)}
                    <p class="fixture-modal-center">
                        <strong>${isFinished ? `${match.scoreHome}–${match.scoreAway}` : "VS"}</strong>
                        <span>${isFinished ? "ARCHIVE VALIDÉE" : "RENCONTRE PROGRAMMÉE"}</span>
                    </p>
                    ${teamIdentity(match.awayTeam, match.awayLogo, match.away, "B", "Extérieur", "fixture-modal-team", isFinished)}
                </div>
            </div>
            <div class="fixture-modal-grid">
                <div><small>DATE OFFICIELLE</small><strong>${formatLongDate(match.date).toUpperCase()}</strong></div>
                <div><small>COUP D’ENVOI</small><strong>${escapeHtml(match.time)}</strong></div>
                <div><small>COMPÉTITION</small><strong>${categoryLabel(match)}</strong></div>
                <div><small>ÉTAT DU SIGNAL</small><strong>${isFinished ? "ARCHIVÉ" : "PROGRAMMÉ"}</strong></div>
            </div>
            <div class="fixture-modal-note">
                <span>NOTE DE PROGRAMMATION</span>
                <p>${isFinished
                    ? "Cette rencontre est terminée et son résultat a été enregistré dans les archives de la ligue."
                    : "La rencontre est officiellement inscrite au calendrier. Les compositions et statistiques seront synchronisées après le coup d’envoi."
                }</p>
            </div>
        `;

        dom.modal.hidden = false;
        document.body.classList.add("fixture-modal-open");
        dom.modal.querySelector(".fixture-modal-close")?.focus();
    }

    function closeFixtureModal() {
        dom.modal.hidden = true;
        document.body.classList.remove("fixture-modal-open");
    }

    function selectMonth(key) {
        const [year, month] = key.split("-").map(Number);
        currentDate = new Date(year, month - 1, 1);
        selectedDate = null;
        viewMode = "calendar";
        updateViewButtons();
        dom.layout.classList.remove("is-list-view");
        renderAll();
        document.querySelector(".fixture-console")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function clearFilters() {
        categoryFilter = "all";
        clubFilter = "all";
        selectedDate = null;
        dom.clubSelect.value = "all";
        dom.categoryButtons.forEach(button => {
            const active = button.dataset.cat === "all";
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
        });
        if (nextFixture) currentDate = parseDate(nextFixture.date);
        renderAll();
    }

    function updateViewButtons() {
        const calendarActive = viewMode === "calendar";
        dom.calendarView.classList.toggle("is-active", calendarActive);
        dom.calendarView.setAttribute("aria-pressed", String(calendarActive));
        dom.listView.classList.toggle("is-active", !calendarActive);
        dom.listView.setAttribute("aria-pressed", String(!calendarActive));
    }

    dom.previousMonth.addEventListener("click", () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        selectedDate = null;
        renderAll();
    });

    dom.nextMonth.addEventListener("click", () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        selectedDate = null;
        renderAll();
    });

    dom.nextDate.addEventListener("click", () => {
        if (!nextFixture) return;
        currentDate = parseDate(nextFixture.date);
        selectedDate = nextFixture.date;
        viewMode = "calendar";
        updateViewButtons();
        dom.layout.classList.remove("is-list-view");
        renderAll();
    });

    dom.resetDate.addEventListener("click", () => {
        selectedDate = null;
        renderAll();
    });

    dom.categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryFilter = button.dataset.cat;
            selectedDate = null;
            dom.categoryButtons.forEach(item => {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
            });
            renderAll();
        });
    });

    dom.clubSelect.addEventListener("change", event => {
        clubFilter = event.target.value;
        selectedDate = null;
        renderAll();
    });

    dom.calendarView.addEventListener("click", () => {
        viewMode = "calendar";
        dom.layout.classList.remove("is-list-view");
        updateViewButtons();
        renderFixtureList();
    });

    dom.listView.addEventListener("click", () => {
        viewMode = "list";
        selectedDate = null;
        dom.layout.classList.add("is-list-view");
        updateViewButtons();
        renderFixtureList();
    });

    document.addEventListener("click", event => {
        const day = event.target.closest("[data-calendar-date]");
        if (day) {
            const key = day.dataset.calendarDate;
            const clickedDate = parseDate(key);
            if (monthKey(clickedDate) !== monthKey(currentDate)) {
                currentDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1);
            }
            selectedDate = selectedDate === key ? null : key;
            renderAll();
            return;
        }

        const monthButton = event.target.closest("[data-month-key]");
        if (monthButton) {
            selectMonth(monthButton.dataset.monthKey);
            return;
        }

        const fixtureButton = event.target.closest("[data-open-fixture]");
        if (fixtureButton) {
            openFixtureModal(fixtureButton.dataset.openFixture);
            return;
        }

        if (event.target.closest("[data-clear-fixture-filters]")) {
            clearFilters();
            return;
        }

        if (event.target.closest("[data-close-fixture-modal]")) {
            closeFixtureModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !dom.modal.hidden) closeFixtureModal();
    });

    window.addEventListener("beforeunload", () => {
        if (countdownTimer) window.clearInterval(countdownTimer);
    });
});
