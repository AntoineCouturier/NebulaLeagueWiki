document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".fixtures-page");
    if (!page) return;

    const MATCH_FIXTURES = window.NEBULA_DATA?.fixtures || [];

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

    function categoryClass(category) {
        return `is-${category}`;
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
            MATCH_FIXTURES.flatMap(match => [match.homeTeam, match.awayTeam]).filter(team => team !== "???")
        );
        const activeMonths = new Set(upcomingFixtures.map(match => monthKey(match.date)));

        dom.heroStats.innerHTML = `
            <div><strong>${String(upcomingFixtures.length).padStart(2, "0")}</strong><span>RENCONTRES<br>À VENIR</span></div>
            <div><strong>${String(clubs.size).padStart(2, "0")}</strong><span>CLUBS<br>ENGAGÉS</span></div>
            <div><strong>${String(activeMonths.size).padStart(2, "0")}</strong><span>MOIS<br>ACTIFS</span></div>
        `;

        if (!nextFixture) {
            dom.nextMatch.innerHTML = `
                <p class="next-fixture-index">PROCHAINE TRANSMISSION</p>
                <h2>CALENDRIER<br>EN ATTENTE</h2>
            `;
            return;
        }

        dom.nextMatch.innerHTML = `
            <div class="next-fixture-topline">
                <span>PROCHAINE TRANSMISSION</span>
                <b class="${categoryClass(nextFixture.category)}">${CATEGORY_LABELS[nextFixture.category]}</b>
            </div>
            <p class="next-fixture-stage">${escapeHtml(nextFixture.stage)}</p>
            <div class="next-fixture-matchup">
                ${teamIdentity(nextFixture.homeTeam, nextFixture.homeLogo)}
                <div class="next-fixture-kickoff">
                    <small>${formatShortDate(nextFixture.date)}</small>
                    <strong>${escapeHtml(nextFixture.time)}</strong>
                    <span>COUP D’ENVOI</span>
                </div>
                ${teamIdentity(nextFixture.awayTeam, nextFixture.awayLogo)}
            </div>
            <div class="next-fixture-countdown" id="nextFixtureCountdown">
                <span>CALCUL DE LA SYNCHRONISATION…</span>
            </div>
            <button class="fixture-control-button next-fixture-open" type="button"
                data-open-fixture="${escapeHtml(nextFixture.id)}">OUVRIR LE DOSSIER <span>↗</span></button>
        `;
    }

    function teamIdentity(name, logo) {
        return `
            <div class="next-team">
                <img src="${escapeHtml(logo)}" alt="">
                <strong>${escapeHtml(name)}</strong>
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
                <span>OUVERTURE DANS</span>
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
                    <span>${String(index + 1).padStart(2, "0")}</span>
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
                    .map(match => match.category)
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
                <div class="fixture-empty-state">
                    <span>00</span>
                    <div>
                        <strong>AUCUNE TRANSMISSION</strong>
                        <p>Aucune rencontre ne correspond à cette date et aux filtres actifs.</p>
                    </div>
                    <button class="fixture-control-button" type="button" data-clear-fixture-filters>RÉINITIALISER ↺</button>
                </div>
            `;
            return;
        }

        dom.cards.innerHTML = fixtures.map((match, index) => fixtureCard(match, index)).join("");
    }

    function fixtureCard(match, index) {
        const date = parseDate(match.date);
        const isFinished = match.status === "finished";
        const centerValue = isFinished
            ? `<strong>${match.scoreHome}<i>—</i>${match.scoreAway}</strong><small>TERMINÉ</small>`
            : `<strong>${escapeHtml(match.time)}</strong><small>HEURE LOCALE</small>`;

        return `
            <article class="fixture-card ${categoryClass(match.category)}">
                <div class="fixture-card-rail">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <b>${String(date.getDate()).padStart(2, "0")}</b>
                    <small>${MONTHS_SHORT[date.getMonth()]}</small>
                </div>
                <div class="fixture-card-main">
                    <header class="fixture-card-meta">
                        <span class="fixture-category-tag ${categoryClass(match.category)}">
                            ${CATEGORY_LABELS[match.category]}
                        </span>
                        <span>${escapeHtml(match.stage)}</span>
                        <time datetime="${escapeHtml(match.date)}T${escapeHtml(match.time)}">
                            ${formatLongDate(match.date).toUpperCase()}
                        </time>
                    </header>
                    <div class="fixture-versus">
                        <div class="fixture-team is-home">
                            <div>
                                <small>DOMICILE</small>
                                <strong>${escapeHtml(match.homeTeam)}</strong>
                            </div>
                            <img src="${escapeHtml(match.homeLogo)}" alt="Logo ${escapeHtml(match.homeTeam)}">
                        </div>
                        <div class="fixture-kickoff">
                            ${centerValue}
                        </div>
                        <div class="fixture-team is-away">
                            <img src="${escapeHtml(match.awayLogo)}" alt="Logo ${escapeHtml(match.awayTeam)}">
                            <div>
                                <small>EXTÉRIEUR</small>
                                <strong>${escapeHtml(match.awayTeam)}</strong>
                            </div>
                        </div>
                    </div>
                    <footer class="fixture-card-footer">
                        <span>${escapeHtml(match.competitionLabel)}</span>
                        <button class="fixture-control-button fixture-open-button" type="button"
                            data-open-fixture="${escapeHtml(match.id)}">DOSSIER MATCH <b>↗</b></button>
                    </footer>
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

            return `
                <button class="fixture-control-button fixture-milestone" type="button" data-month-key="${key}">
                    <span class="milestone-index">${String(index + 1).padStart(2, "0")}</span>
                    <div class="milestone-copy">
                        <small>${date.getFullYear()} // FENÊTRE ${String(index + 1).padStart(2, "0")}</small>
                        <h3>${MONTHS[date.getMonth()]}</h3>
                        <p>${phase}</p>
                    </div>
                    <div class="milestone-volume">
                        <strong>${String(matches.length).padStart(2, "0")}</strong>
                        <span>RENCONTRES</span>
                    </div>
                    <div class="milestone-breakdown">
                        <span><i class="is-ligue"></i>${String(leagueCount).padStart(2, "0")} LIGUE</span>
                        <span><i class="is-ncl"></i>${String(nclCount).padStart(2, "0")} NCL</span>
                    </div>
                    <b class="milestone-arrow">↗</b>
                </button>
            `;
        }).join("");
    }

    function openFixtureModal(matchId) {
        const match = MATCH_FIXTURES.find(item => item.id === matchId);
        if (!match) return;

        const isFinished = match.status === "finished";
        dom.modalTitle.textContent = `${CATEGORY_LABELS[match.category]} // ${match.stage.toUpperCase()}`;
        dom.modalContent.innerHTML = `
            <div class="fixture-modal-summary ${categoryClass(match.category)}">
                <div class="fixture-modal-date">
                    <span>${formatShortDate(match.date)}</span>
                    <strong>${isFinished ? "RÉSULTAT FINAL" : match.time}</strong>
                    <small>${match.competitionLabel}</small>
                </div>
                <div class="fixture-modal-versus">
                    <div>
                        <img src="${escapeHtml(match.homeLogo)}" alt="">
                        <small>DOMICILE</small>
                        <strong>${escapeHtml(match.homeTeam)}</strong>
                    </div>
                    <p>
                        <strong>${isFinished ? `${match.scoreHome} — ${match.scoreAway}` : "VS"}</strong>
                        <span>${isFinished ? "ARCHIVE VALIDÉE" : "RENCONTRE PROGRAMMÉE"}</span>
                    </p>
                    <div>
                        <img src="${escapeHtml(match.awayLogo)}" alt="">
                        <small>EXTÉRIEUR</small>
                        <strong>${escapeHtml(match.awayTeam)}</strong>
                    </div>
                </div>
            </div>
            <div class="fixture-modal-grid">
                <div><small>DATE OFFICIELLE</small><strong>${formatLongDate(match.date).toUpperCase()}</strong></div>
                <div><small>COUP D’ENVOI</small><strong>${escapeHtml(match.time)}</strong></div>
                <div><small>COMPÉTITION</small><strong>${CATEGORY_LABELS[match.category]}</strong></div>
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
