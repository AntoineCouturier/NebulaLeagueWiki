// match.js - Version simplifiée alignée sur le thème

document.addEventListener('DOMContentLoaded', function() {
    // Tri et filtrage
    const categoryBtns = document.querySelectorAll('.category-btn');
    const matchCards = document.querySelectorAll('.match-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const cat = btn.dataset.cat;
            
            matchCards.forEach(card => {
                card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'block' : 'none';
            });
            
            // Tri par date
            const visibleCards = Array.from(matchCards).filter(c => c.style.display !== 'none');
            visibleCards.sort((a,b) => new Date(b.dataset.date) - new Date(a.dataset.date));
            
            const parent = document.querySelector('.match-list');
            visibleCards.forEach(c => parent.appendChild(c));
        });
    });
    
    // Activer le filtre par défaut
    document.querySelector('.category-btn.active').click();
    
    // Popup system
    document.querySelectorAll(".details-btn").forEach(button => {
        button.addEventListener("click", () => {
            const popupID = button.dataset.popup;
            document.getElementById(popupID).style.display = "flex";
        });
    });
    
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.closest(".popup-bg").style.display = "none";
        });
    });
    
    document.querySelectorAll(".popup-bg").forEach(p => {
        p.addEventListener("click", e => {
            if (e.target === p) p.style.display = "none";
        });
    });
    
    // Notes colors - version simplifiée
    document.querySelectorAll('.note-bar').forEach(bar => {
        const note = parseFloat(bar.dataset.note);
        
        let color;
        if (note <= 2) color = '#c70000ff';
        else if (note <= 2.5) color = '#ff2a00ff';
        else if (note <= 3) color = '#ff3c00ff';
        else if (note <= 3.5) color = '#fb7100ff';
        else if (note <= 4) color = '#ffa600ff';
        else if (note <= 4.5) color = '#ffbf00ff';
        else if (note <= 5) color = '#cbb705ff';
        else if (note <= 5.5) color = '#ffe600ff';
        else if (note <= 6) color = '#f2ff00ff';
        else if (note <= 6.5) color = '#fffc34ff';
        else if (note <= 7) color = '#c8ff00ff';
        else if (note <= 7.5) color = '#aaff00ff';
        else if (note <= 8) color = '#91ff00ff';
        else if (note <= 8.5) color = '#59ff00ff';
        else if (note <= 9) color = '#0dff00ff';
        else if (note <= 9.5) color = '#00ff9dff';
        else color = '#00a6ffff';
        
        const fill = document.createElement('div');
        fill.style.width = `${note * 10}%`;
        fill.style.height = '100%';
        fill.style.backgroundColor = color;
        fill.style.borderRadius = '4px';
        
        bar.appendChild(fill);
    });
});