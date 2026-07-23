// ==========================================================================
// Match Fixtures & Interactive Calendar - Nebula League
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {

    // ----------------------------------------------------------------------
    // 1. DATASET OF MATCH FIXTURES (Fixed Dates)
    // ----------------------------------------------------------------------
    const MATCH_FIXTURES = [
        // ============================ SAISON 0 MATCH 1 ============================
        {
            id: 'm-2022-04-01',
            date: '2022-04-01',
            time: '20:00',
            category: 'ligue',
            status: 'finished',
            competitionLabel: 'Ligue - Saison 0',
            homeTeam: 'Manshine City',
            homeLogo: 'images/clubs_icon/Manshine_City.png',
            awayTeam: 'PXG',
            awayLogo: 'images/clubs_icon/PXG.png',
            scoreHome: 13,
            scoreAway: 2,
        },
        // ============================ SAISON 1 MATCH 1 LIGUE ============================
        {
            id: 'm-2026-09-02',
            date: '2026-09-02',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 1',
            homeTeam: 'Bastard München',
            homeLogo: 'images/clubs_icon/Bastard_Munchen.png',
            awayTeam: 'Manshine City',
            awayLogo: 'images/clubs_icon/Manshine_City.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 2 LIGUE ============================
        {
            id: 'm-2026-09-05',
            date: '2026-09-05',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 2',
            homeTeam: 'PXG',
            homeLogo: 'images/clubs_icon/PXG.png',
            awayTeam: 'Barcha',
            awayLogo: 'images/clubs_icon/Barcha.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 3 LIGUE ============================
        {
            id: 'm-2026-09-09',
            date: '2026-09-09',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 3',
            homeTeam: 'Manshine City',
            homeLogo: 'images/clubs_icon/Manshine_City.png',
            awayTeam: 'Ubers',
            awayLogo: 'images/clubs_icon/Ubers.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 4 LIGUE ============================
        {
            id: 'm-2026-09-12',
            date: '2026-09-12',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 4',
            homeTeam: 'Bastard München',
            homeLogo: 'images/clubs_icon/Bastard_Munchen.png',
            awayTeam: 'PXG',
            awayLogo: 'images/clubs_icon/PXG.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 5 LIGUE ============================
        {
            id: 'm-2026-09-16',
            date: '2026-09-16',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 5',
            homeTeam: 'Barcha',
            homeLogo: 'images/clubs_icon/Barcha.png',
            awayTeam: 'Manshine City',
            awayLogo: 'images/clubs_icon/Manshine_City.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 6 LIGUE ============================
        {
            id: 'm-2026-09-19',
            date: '2026-09-19',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 6',
            homeTeam: 'Ubers',
            homeLogo: 'images/clubs_icon/Ubers.png',
            awayTeam: 'Barcha',
            awayLogo: 'images/clubs_icon/Barcha.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 7 LIGUE ============================
        {
            id: 'm-2026-09-23',
            date: '2026-09-23',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 7',
            homeTeam: 'PXG',
            homeLogo: 'images/clubs_icon/PXG.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 8 LIGUE ============================
        {
            id: 'm-2026-09-26',
            date: '2026-09-26',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 8',
            homeTeam: 'Ubers',
            homeLogo: 'images/clubs_icon/Ubers.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 9 LIGUE ============================
        {
            id: 'm-2026-09-30',
            date: '2026-09-30',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 9',
            homeTeam: 'Barcha',
            homeLogo: 'images/clubs_icon/Barcha.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 10 LIGUE ============================
        {
            id: 'm-2026-10-03',
            date: '2026-10-03',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 10',
            homeTeam: 'Ubers',
            homeLogo: 'images/clubs_icon/Ubers.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 11 LIGUE ============================
        {
            id: 'm-2026-10-07',
            date: '2026-10-07',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 11',
            homeTeam: 'Manshine City',
            homeLogo: 'images/clubs_icon/Manshine_City.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 12 LIGUE ============================
        {
            id: 'm-2026-10-10',
            date: '2026-10-10',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 12',
            homeTeam: 'PXG',
            homeLogo: 'images/clubs_icon/PXG.png',
            awayTeam: 'Barcha',
            awayLogo: 'images/clubs_icon/Barcha.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 13 LIGUE ============================
        {
            id: 'm-2026-10-14',
            date: '2026-10-14',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 13',
            homeTeam: 'Manshine City',
            homeLogo: 'images/clubs_icon/Manshine_City.png',
            awayTeam: 'Ubers',
            awayLogo: 'images/clubs_icon/Ubers.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 14 LIGUE ============================
        {
            id: 'm-2026-10-17',
            date: '2026-10-17',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 14',
            homeTeam: 'Bastard München',
            homeLogo: 'images/clubs_icon/Bastard_Munchen.png',
            awayTeam: 'PXG',
            awayLogo: 'images/clubs_icon/PXG.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 15 LIGUE ============================
        {
            id: 'm-2026-10-21',
            date: '2026-10-21',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 15',
            homeTeam: 'Barcha',
            homeLogo: 'images/clubs_icon/Barcha.png',
            awayTeam: 'Manshine City',
            awayLogo: 'images/clubs_icon/Manshine_City.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 16 LIGUE ============================
        {
            id: 'm-2026-10-24',
            date: '2026-10-24',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 16',
            homeTeam: 'Ubers',
            homeLogo: 'images/clubs_icon/Ubers.png',
            awayTeam: 'Barcha',
            awayLogo: 'images/clubs_icon/Barcha.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 17 LIGUE ============================
        {
            id: 'm-2026-10-28',
            date: '2026-10-28',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 17',
            homeTeam: 'PXG',
            homeLogo: 'images/clubs_icon/PXG.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 18 LIGUE ============================
        {
            id: 'm-2026-10-31',
            date: '2026-10-31',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 18',
            homeTeam: 'Ubers',
            homeLogo: 'images/clubs_icon/Ubers.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 19 LIGUE ============================
        {
            id: 'm-2026-11-04',
            date: '2026-11-04',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 19',
            homeTeam: 'Barcha',
            homeLogo: 'images/clubs_icon/Barcha.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 20 LIGUE ============================
        {
            id: 'm-2026-11-07',
            date: '2026-11-07',
            time: '18:00',
            category: 'ligue',
            status: 'upcoming',
            competitionLabel: 'Ligue - Saison 1 - Journée 20',
            homeTeam: 'Ubers',
            homeLogo: 'images/clubs_icon/Ubers.png',
            awayTeam: 'Bastard München',
            awayLogo: 'images/clubs_icon/Bastard_Munchen.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 1 NCL ============================
        {
            id: 'm-2026-11-14',
            date: '2026-11-14',
            time: '18:00',
            category: 'ncl',
            status: 'upcoming',
            competitionLabel: 'NCL - Saison 1 - Demi Finale',
            homeTeam: '???',
            homeLogo: 'images/clubs_icon/placeholder.png',
            awayTeam: '???',
            awayLogo: 'images/clubs_icon/placeholder.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 2 NCL ============================
        {
            id: 'm-2026-11-18',
            date: '2026-11-18',
            time: '18:00',
            category: 'ncl',
            status: 'upcoming',
            competitionLabel: 'NCL - Saison 1 - Demi Finale',
            homeTeam: '???',
            homeLogo: 'images/clubs_icon/placeholder.png',
            awayTeam: '???',
            awayLogo: 'images/clubs_icon/placeholder.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 3 NCL ============================
        {
            id: 'm-2026-11-21',
            date: '2026-11-21',
            time: '18:00',
            category: 'ncl',
            status: 'upcoming',
            competitionLabel: 'NCL - Saison 1 - Petite Finale',
            homeTeam: '???',
            homeLogo: 'images/clubs_icon/placeholder.png',
            awayTeam: '???',
            awayLogo: 'images/clubs_icon/placeholder.png',
            scoreHome: null,
            scoreAway: null,
        },
        // ============================ SAISON 1 MATCH 4 NCL ============================
        {
            id: 'm-2026-11-25',
            date: '2026-11-25',
            time: '18:00',
            category: 'ncl',
            status: 'upcoming',
            competitionLabel: 'NCL - Saison 1 - Finale',
            homeTeam: '???',
            homeLogo: 'images/clubs_icon/placeholder.png',
            awayTeam: '???',
            awayLogo: 'images/clubs_icon/placeholder.png',
            scoreHome: null,
            scoreAway: null,
        }
    ];

    // ----------------------------------------------------------------------
    // 2. STATE MANAGEMENT
    // ----------------------------------------------------------------------
    let currentDate = new Date(2026, 6, 1); // July 2026 default
    let selectedDateStr = null; // 'YYYY-MM-DD'
    let currentCatFilter = 'all';
    let currentClubFilter = 'all';
    let currentViewMode = 'calendar'; // 'calendar' or 'list'

    // DOM Elements
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const todayBtn = document.getElementById('today-btn');

    const catBtns = document.querySelectorAll('.fx-cat-btn');
    const clubSelect = document.getElementById('club-select');

    const viewCalendarBtn = document.getElementById('view-calendar-btn');
    const viewListBtn = document.getElementById('view-list-btn');
    const fixturesLayout = document.getElementById('fixtures-layout');

    const fixturesSectionTitle = document.getElementById('fixtures-section-title');
    const resetDateFilterBtn = document.getElementById('reset-date-filter-btn');
    const fixturesCardsContainer = document.getElementById('fixtures-cards-container');

    const modal = document.getElementById('fixture-details-modal');
    const modalContent = document.getElementById('modal-content-container');
    const modalCloseX = document.getElementById('modal-close-x');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // ----------------------------------------------------------------------
    // 3. CALENDAR GENERATION FUNCTIONS
    // ----------------------------------------------------------------------
    const MONTH_NAMES = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    function renderCalendar() {
        if (!calendarDaysGrid) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Title update
        calendarMonthYear.textContent = `${MONTH_NAMES[month]} ${year}`;

        // First day of current month (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(year, month, 1);
        let startingDayOfWeek = firstDayOfMonth.getDay() - 1; // Align to Monday (0)
        if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday = index 6

        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        calendarDaysGrid.innerHTML = '';

        // Fill previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('cal-day', 'other-month');
            dayDiv.textContent = dayNum;
            calendarDaysGrid.appendChild(dayDiv);
        }

        // Today comparison string
        const todayObj = new Date();
        const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

        // Current Month Days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('cal-day');
            dayDiv.dataset.date = dateStr;

            const dayNumSpan = document.createElement('span');
            dayNumSpan.textContent = day;
            dayDiv.appendChild(dayNumSpan);

            // Highlight if today
            if (dateStr === todayStr) {
                dayDiv.classList.add('is-today');
            }

            // Highlight if selected
            if (selectedDateStr === dateStr) {
                dayDiv.classList.add('selected');
            }

            // Find matches for this date
            const dayMatches = getFilteredMatches().filter(m => m.date === dateStr);

            if (dayMatches.length > 0) {
                dayDiv.classList.add('has-matches');
                const dotsRow = document.createElement('div');
                dotsRow.classList.add('match-dots-row');

                // Collect unique categories for this date
                const catsOnDay = [...new Set(dayMatches.map(m => m.category))];
                catsOnDay.forEach(cat => {
                    const dot = document.createElement('span');
                    dot.classList.add('dot', `${cat}-dot`);
                    dotsRow.appendChild(dot);
                });
                dayDiv.appendChild(dotsRow);
            }

            // Click Handler for Calendar Cell
            dayDiv.addEventListener('click', () => {
                if (selectedDateStr === dateStr) {
                    selectedDateStr = null; // Toggle off if clicked twice
                } else {
                    selectedDateStr = dateStr;
                }
                renderCalendar();
                renderFixtures();
            });

            calendarDaysGrid.appendChild(dayDiv);
        }

        // Fill remaining grid to complete week (42 cells total for 6 rows)
        const totalCellsSoFar = startingDayOfWeek + totalDaysInMonth;
        const nextMonthCellsNeeded = (totalCellsSoFar <= 35) ? (35 - totalCellsSoFar) : (42 - totalCellsSoFar);

        for (let day = 1; day <= nextMonthCellsNeeded; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('cal-day', 'other-month');
            dayDiv.textContent = day;
            calendarDaysGrid.appendChild(dayDiv);
        }
    }

    // ----------------------------------------------------------------------
    // 4. FILTERING & FIXTURES RENDERING
    // ----------------------------------------------------------------------
    function getFilteredMatches() {
        return MATCH_FIXTURES.filter(m => {
            // Category filter
            if (currentCatFilter !== 'all' && m.category !== currentCatFilter) {
                return false;
            }
            // Club filter
            if (currentClubFilter !== 'all') {
                if (m.homeTeam !== currentClubFilter && m.awayTeam !== currentClubFilter) {
                    return false;
                }
            }
            return true;
        });
    }

    function renderFixtures() {
        if (!fixturesCardsContainer) return;

        let filtered = getFilteredMatches();

        // If specific date selected
        if (selectedDateStr) {
            filtered = filtered.filter(m => m.date === selectedDateStr);
            const dateParts = selectedDateStr.split('-');
            const formattedDate = `${dateParts[2]} ${MONTH_NAMES[parseInt(dateParts[1], 10) - 1]} ${dateParts[0]}`;
            fixturesSectionTitle.textContent = `Matchs du ${formattedDate}`;
            resetDateFilterBtn.style.display = 'inline-block';
        } else {
            // If in calendar mode, show matches for current month by default or all upcoming
            if (currentViewMode === 'calendar') {
                const curYear = currentDate.getFullYear();
                const curMonth = currentDate.getMonth() + 1;
                const monthStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;

                // Try month matches first
                const monthMatches = filtered.filter(m => m.date.startsWith(monthStr));
                if (monthMatches.length > 0) {
                    filtered = monthMatches;
                    fixturesSectionTitle.textContent = `Matchs de ${MONTH_NAMES[currentDate.getMonth()]} ${curYear}`;
                } else {
                    fixturesSectionTitle.textContent = `Tous les Matchs Programmés`;
                }
            } else {
                fixturesSectionTitle.textContent = `Liste Chronologique de Tous les Matchs`;
            }
            resetDateFilterBtn.style.display = 'none';
        }

        // Sort chronologically
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        fixturesCardsContainer.innerHTML = '';

        if (filtered.length === 0) {
            fixturesCardsContainer.innerHTML = `
                <div class="no-fixtures-msg">
                    <p>⚽ Aucun match ne correspond à vos critères de recherche ou à la date sélectionnée.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(m => {
            const card = document.createElement('div');
            card.classList.add('fx-card', `cat-${m.category}`);

            // Formatted Date
            const [y, mm, d] = m.date.split('-');
            const dateDisplay = `${d}/${mm}/${y}`;

            // Status Badge Text
            let statusBadge = '';
            if (m.status === 'finished') {
                statusBadge = `<span class="fx-status-badge finished">Terminé</span>`;
            } else if (m.status === 'live') {
                statusBadge = `<span class="fx-status-badge live">● En Direct</span>`;
            } else {
                statusBadge = `<span class="fx-status-badge upcoming">À venir</span>`;
            }

            // Score or Time Box
            let centerBlock = '';
            if (m.status === 'finished') {
                centerBlock = `
                    <div class="fx-score-box">${m.scoreHome} - ${m.scoreAway}</div>
                `;
            } else {
                centerBlock = `
                    <div class="fx-time-box">⏰ ${m.time}</div>
                `;
            }

            // Footer Preview or Summary Text
            let footerContent = '';
            if (m.status === 'finished') {
                const text = m.summaryText || m.preview || generateSummary(m);
                footerContent = `<div class="fx-mvp-summary" style="opacity: 0.85; font-style: italic;">${text}</div>`;
            } else if (m.preview) {
                footerContent = `<div class="fx-mvp-summary" style="opacity: 0.85; font-style: italic;">${m.preview}</div>`;
            }

            card.innerHTML = `
                <div class="fx-card-top">
                    <div class="fx-badges">
                        <span class="fx-badge-cat ${m.category}">${m.competitionLabel}</span>
                        ${statusBadge}
                    </div>
                    <span class="fx-match-date-str">📅 ${dateDisplay}</span>
                </div>

                <div class="fx-match-body">
                    <div class="fx-team home">
                        <span class="fx-team-name">${m.homeTeam}</span>
                        <img src="${m.homeLogo}" alt="${m.homeTeam}" class="fx-team-logo">
                    </div>

                    <div class="fx-score-center">
                        ${centerBlock}
                    </div>

                    <div class="fx-team away">
                        <img src="${m.awayLogo}" alt="${m.awayTeam}" class="fx-team-logo">
                        <span class="fx-team-name">${m.awayTeam}</span>
                    </div>
                </div>

                <div class="fx-card-footer">
                    ${footerContent}
                </div>
            `;

            fixturesCardsContainer.appendChild(card);
        });
    }

    // ----------------------------------------------------------------------
    // 5. MATCH DETAILS MODAL
    // ----------------------------------------------------------------------
    function openMatchDetailsModal(match) {
        if (!modal || !modalContent) return;

        const [y, mm, d] = match.date.split('-');
        const dateDisplay = `${d}/${mm}/${y}`;

        let scoreOrTimeHtml = '';
        if (match.status === 'finished') {
            scoreOrTimeHtml = `<div class="modal-score-big">${match.scoreHome} - ${match.scoreAway}</div>`;
        } else {
            scoreOrTimeHtml = `<div class="modal-score-big" style="font-size:1.6rem; color:#00d4ff;">À venir (${match.time})</div>`;
        }

        let detailsSection = '';
        if (match.status === 'finished' && match.details) {
            const homeTimelineHtml = match.details.homeTimeline.map(li => `<li>${li}</li>`).join('');
            const awayTimelineHtml = match.details.awayTimeline.map(li => `<li>${li}</li>`).join('');

            detailsSection = `
                <div class="modal-details-grid">
                    <div class="modal-column">
                        <h4>${match.homeTeam}</h4>
                        <ul>${homeTimelineHtml}</ul>
                    </div>
                    <div class="modal-column">
                        <h4>${match.awayTeam}</h4>
                        <ul>${awayTimelineHtml}</ul>
                    </div>
                </div>
            `;
        } else {
            detailsSection = `
                <div style="margin-top: 20px; background: rgba(255,255,255,0.04); padding: 20px; border-radius: 12px; font-family:'Inter', sans-serif;">
                    <h4 style="font-family:'Orbitron'; color:#d89aff; margin-top:0;">Informations du Match</h4>
                    <p style="color:#e0e0e0; line-height:1.6;">${match.preview || 'Match officiellement programmé dans le calendrier de la Nebula League.'}</p>
                    <p style="margin-bottom:0; color:#aaa; font-size:0.9rem;"><strong>Compétition :</strong> ${match.competitionLabel}</p>
                </div>
            `;
        }

        modalContent.innerHTML = `
            <h3 style="font-family:'Orbitron'; text-align:center; color:#d89aff; margin-top:0;">${match.competitionLabel}</h3>
            <p style="text-align:center; color:#aaa; font-family:'Inter'; margin-bottom: 20px;">📅 Date : ${dateDisplay} à ${match.time}</p>

            <div class="modal-header-teams">
                <div class="modal-team-block">
                    <img src="${match.homeLogo}" alt="${match.homeTeam}" class="modal-team-logo">
                    <span class="modal-team-title">${match.homeTeam}</span>
                </div>

                ${scoreOrTimeHtml}

                <div class="modal-team-block">
                    <img src="${match.awayLogo}" alt="${match.awayTeam}" class="modal-team-logo">
                    <span class="modal-team-title">${match.awayTeam}</span>
                </div>
            </div>

            ${detailsSection}
        `;

        modal.style.display = 'flex';
    }

    function closeModal() {
        if (modal) modal.style.display = 'none';
    }

    if (modalCloseX) modalCloseX.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // ----------------------------------------------------------------------
    // 6. EVENT LISTENERS FOR CONTROLS
    // ----------------------------------------------------------------------
    function article(team) {
        return team === "Ubers" ? "les" : "le";
    }

    function generateSummary(match) {
        const diff = Math.abs(match.scoreHome - match.scoreAway);

        const winner = match.scoreHome > match.scoreAway ? match.homeTeam : match.awayTeam;
        const loser = match.scoreHome > match.scoreAway ? match.awayTeam : match.homeTeam;

        const categories = {

            draw: [
                `${winner} et ${loser} se neutralisent au terme d'un match très disputé.`,
                `Impossible de départager ${winner} et ${loser} aujourd'hui.`,
                `${winner} et ${loser} repartent avec un point chacun après une rencontre équilibrée.`,
                `Les deux équipes se quittent sur un score de parité.`
            ],

            close: [
                `${winner} s'impose dans la douleur face au ${loser}.`,
                `${winner} fait la différence sur les derniers détails.`,
                `${winner} décroche une courte mais précieuse victoire.`,
                `${loser} aura tout donné, mais ${winner} repart avec les trois points.`,
                `${winner} résiste jusqu'au bout pour l'emporter.`
            ],

            medium: [
                `${winner} prend logiquement le dessus sur ${loser}.`,
                `${winner} signe une victoire maîtrisée.`,
                `${winner} s'impose avec autorité.`,
                `${winner} contrôle parfaitement cette rencontre.`,
                `${winner} confirme sa supériorité du jour face au ${loser}.`
            ],

            large: [
                `${winner} domine largement les débats du début à la fin.`,
                `${winner} ne laisse que très peu d'espoir au ${loser}.`,
                `${winner} déroule son football et s'offre un large succès.`,
                `${winner} prend rapidement le contrôle du match.`,
                `${winner} s'impose avec une belle marge.`
            ],

            huge: [
                `${winner} livre une véritable démonstration de force.`,
                `${winner} surclasse complètement ${article(loser)} ${loser}.`,
                `${winner} fait parler toute sa puissance offensive.`,
                `${winner} récite parfaitement son football et s'offre une victoire éclatante.`,
                `${winner} signe l'une des performances les plus impressionnantes de la saison.`
            ],

            insane: [
                `${winner} inflige une correction historique au ${loser}.`,
                `${winner} écrase totalement son adversaire dans une rencontre à sens unique.`,
                `${winner} réalise un véritable festival offensif.`,
                `${winner} ne fait absolument aucun cadeau au ${loser}.`,
                `${winner} livre une prestation qui restera dans les mémoires de la Nebula League.`
            ]
        };

        let pool;

        if (diff === 0)
            pool = categories.draw;

        else if (diff === 1)
            pool = categories.close;

        else if (diff <= 3)
            pool = categories.medium;

        else if (diff <= 6)
            pool = categories.large;

        else if (diff <= 10)
            pool = categories.huge;

        else
            pool = categories.insane;

        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Month Navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
            renderFixtures();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
            renderFixtures();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            selectedDateStr = `${year}-${month}-${day}`;
            renderCalendar();
            renderFixtures();
        });
    }

    // Category Filter Buttons
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCatFilter = btn.dataset.cat;
            renderCalendar();
            renderFixtures();
        });
    });

    // Club Dropdown Selector
    if (clubSelect) {
        clubSelect.addEventListener('change', (e) => {
            currentClubFilter = e.target.value;
            renderCalendar();
            renderFixtures();
        });
    }

    // Reset Date Filter Button
    if (resetDateFilterBtn) {
        resetDateFilterBtn.addEventListener('click', () => {
            selectedDateStr = null;
            renderCalendar();
            renderFixtures();
        });
    }

    // View Switcher (Calendar vs List Only)
    if (viewCalendarBtn && viewListBtn && fixturesLayout) {
        viewCalendarBtn.addEventListener('click', () => {
            viewCalendarBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            fixturesLayout.classList.remove('list-only');
            currentViewMode = 'calendar';
            renderFixtures();
        });

        viewListBtn.addEventListener('click', () => {
            viewListBtn.classList.add('active');
            viewCalendarBtn.classList.remove('active');
            fixturesLayout.classList.add('list-only');
            currentViewMode = 'list';
            selectedDateStr = null; // Reset date selection in list view
            renderCalendar();
            renderFixtures();
        });
    }

    // Initialize
    renderCalendar();
    renderFixtures();
});
