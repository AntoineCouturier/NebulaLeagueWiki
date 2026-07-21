function calculValeur() {
    const type = Number(document.getElementById("typeMatch").value);

    const victoire = Number(document.getElementById("victoire").value); // 0 ou 1
    const buts = Number(document.getElementById("buts").value);
    const passes = Number(document.getElementById("passes").value);
    const inter = Number(document.getElementById("inter").value);
    const dribbles = Number(document.getElementById("dribbles").value);
    const mvp = Number(document.getElementById("mvp").value);

    // Gains de base (par action) pour un match AMICAL
    const base = {
        but: 1500000,
        passe: 1000000,
        inter: 250000,
        dribbles: 250000,
        mvp: 12500000
    };

    // Gains de victoire fixes selon type (ne pas confondre avec multiplicateur)
    // On respecte le tableau : Amical 5M, Compétitif 10M, NCL 15M, Finale 25M
    const victoireGainByType = {
        1: 5000000,
        2: 10000000,
        3: 15000000,
        4: 20000000,
        5: 25000000
    };

    let total =
        (buts * base.but * type) +
        (passes * base.passe * type) +
        (inter * base.inter * type) +
        (dribbles * base.dribbles * type) +
        (mvp * base.mvp * type);

    // Ajouter gain victoire si victoire === 1
    if (victoire === 1) {
        const gainVictoire = victoireGainByType[type] || 0;
        total += gainVictoire;
    }

    document.getElementById("resultValeur").textContent =
        total.toLocaleString("fr-FR") + "¥";
}
