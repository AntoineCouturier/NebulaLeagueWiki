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
    // On respecte le tableau : Amical 5M, Compétitif 10M, NCL 15M, Finale 25M
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

    // Ajouter gain victoire si victoire === 1
    if (victoire === 1) {
        const gainVictoire = victoireGainByType[type] || 0;
        total += gainVictoire;
    }

    document.getElementById("resultValeur").textContent =
        total.toLocaleString("en-US") + "¥";
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