// Ordre des paliers = ordre des <option> du select #typeMatch
const TIER_VALUES = ["0.5", "1", "2", "3", "4"];

function calculValeur() {
    const type = Number(document.getElementById("typeMatch").value);

    const victoire = Number(document.getElementById("victoire").value); // 0 ou 1
    const buts = Number(document.getElementById("buts").value);
    const passes = Number(document.getElementById("passes").value);
    const def = Number(document.getElementById("def").value);
    const dribbles = Number(document.getElementById("dribbles").value);
    const mvp = Number(document.getElementById("mvp").value);

    // Gains de base (par action) pour un match AMICAL
    const base = {
        but: 1500000,
        passe: 1000000,
        def: 200000,
        dribbles: 200000,
        mvp: 10000000
    };

    // Gains de victoire fixes selon type (ne pas confondre avec multiplicateur)
    const victoireGainByType = {
        0.5: 2500000,
        1: 5000000,
        2: 10000000,
        3: 15000000,
        4: 20000000
    };

    let total =
        (buts * base.but * type) +
        (passes * base.passe * type) +
        (def * base.def * type) +
        (dribbles * base.dribbles * type) +
        (mvp * base.mvp * type);

    if (victoire === 1) {
        const gainVictoire = victoireGainByType[type] || 0;
        total += gainVictoire;
    }

    document.getElementById("resultValeur").textContent =
        total.toLocaleString("en-US") + "¥";
}

// ------------------------------------------------------------
// Jauge de multiplicateur (signature visuelle) : place le curseur
// et remplit la barre en fonction du palier sélectionné.
// ------------------------------------------------------------
function updateMeter() {
    const select = document.getElementById("typeMatch");
    if (!select) return;

    const idx = TIER_VALUES.indexOf(select.value);
    const pct = idx === -1 ? 0 : (idx / (TIER_VALUES.length - 1)) * 100;

    const fill = document.getElementById("meterFill");
    const dot = document.getElementById("meterDot");
    if (fill) fill.style.width = pct + "%";
    if (dot) dot.style.left = pct + "%";

    highlightLedgerTier(idx);
}

// ------------------------------------------------------------
// Surligne, dans le Grand Livre, la colonne correspondant au palier
// actuellement sélectionné dans le simulateur.
// ------------------------------------------------------------
function highlightLedgerTier(idx) {
    document.querySelectorAll('[data-tier]').forEach(cell => {
        const isActive = Number(cell.dataset.tier) === idx;
        cell.classList.toggle('tier-active', isActive);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const typeMatch = document.getElementById("typeMatch");
    if (typeMatch) {
        typeMatch.addEventListener("change", updateMeter);
        updateMeter(); // état initial
    }

    document.querySelectorAll(".stepper-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;

            const min = Number(input.min) || 0;
            let value = Number(input.value) || 0;

            value = btn.classList.contains("stepper-plus") ? value + 1 : Math.max(min, value - 1);

            input.value = value;
        });
    });
});
