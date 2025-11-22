document.addEventListener('DOMContentLoaded', function() {
    // Gestion des caractéristiques
    const characteristicCards = document.querySelectorAll('.characteristic-card');
    const availablePointsSpan = document.getElementById('available-points');
    let totalPoints = 27;

    // Table des coûts
    const costTable = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
        14: 7, 15: 9, 16: 11, 17: 13, 18: 15
    };

    // Table des modificateurs
    const modifierTable = {
        8: -1, 9: -1, 10: 0, 11: 0, 12: 1, 13: 1,
        14: 2, 15: 2, 16: 3, 17: 3, 18: 4
    };

    function updateModifier(card, value) {
        const modSpan = card.querySelector('.mod-value');
        const modifier = modifierTable[value];
        modSpan.textContent = modifier >= 0 ? `+${modifier}` : modifier;
    }

    function updatePointsDisplay() {
        availablePointsSpan.textContent = totalPoints;
    }

    function canIncrease(currentValue) {
        if (currentValue >= 18) return false;
        const nextCost = costTable[currentValue + 1] - costTable[currentValue];
        return totalPoints >= nextCost;
    }

    function updateAllButtons() {
        characteristicCards.forEach(card => {
            const valueSpan = card.querySelector('.char-value');
            const increaseBtn = card.querySelector('.increase-stat');
            const decreaseBtn = card.querySelector('.decrease-stat');
            const currentValue = parseInt(valueSpan.textContent);

            increaseBtn.disabled = !canIncrease(currentValue);
            decreaseBtn.disabled = currentValue <= 8;
        });
    }

    characteristicCards.forEach(card => {
        const decreaseBtn = card.querySelector('.decrease-stat');
        const increaseBtn = card.querySelector('.increase-stat');
        const valueSpan = card.querySelector('.char-value');

        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(valueSpan.textContent);
            if (currentValue > 8) {
                const newValue = currentValue - 1;

                // Refund points
                const currentCost = costTable[currentValue];
                const newCost = costTable[newValue];
                const pointsToRefund = currentCost - newCost;

                totalPoints += pointsToRefund;

                valueSpan.textContent = newValue;
                updateModifier(card, newValue);
                updatePointsDisplay();
                updateAllButtons();
            }
        });

        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(valueSpan.textContent);
            if (canIncrease(currentValue)) {
                const newValue = currentValue + 1;

                // Spend points
                const currentCost = costTable[currentValue];
                const nextCost = costTable[newValue];
                const costDifference = nextCost - currentCost;

                totalPoints -= costDifference;

                valueSpan.textContent = newValue;
                updateModifier(card, newValue);
                updatePointsDisplay();
                updateAllButtons();
            }
        });

        // Initial state for this card
        const initialValue = parseInt(valueSpan.textContent);
        updateModifier(card, initialValue);
    });

    // Initial global state update
    updatePointsDisplay();
    updateAllButtons();

    // Calculateur de points de vie
    const calculateHP = document.getElementById('calculate-hp');
    const charSpec = document.getElementById('char-spec');
    const charLevel = document.getElementById('char-level');
    const totalHP = document.getElementById('total-hp');

    const baseHP = {
        'techno-guerrier': 10,
        'bio-ingenieur': 8,
        'techno-mage': 6,
        'infiltrateur': 8
    };

    if (calculateHP) {
        calculateHP.addEventListener('click', () => {
            const conCard = document.querySelector('.characteristic-card[data-stat="constitution"]');
            const conModifier = parseInt(conCard.querySelector('.mod-value').textContent);
            const level = parseInt(charLevel.value);
            const specBase = baseHP[charSpec.value];

            if (level < 1 || level > 20) {
                alert('Le niveau doit être entre 1 et 20');
                return;
            }

            // Niveau 1 : PV maximum
            let hp = specBase + conModifier;

            // Niveaux suivants : moyenne des dés + modificateur de Constitution
            if (level > 1) {
                const averageRoll = Math.ceil((specBase + 1) / 2);
                hp += (averageRoll + conModifier) * (level - 1);
            }

            // Minimum 1 PV par niveau
            hp = Math.max(level, hp);

            // Afficher le résultat avec animation
            totalHP.textContent = hp;
            totalHP.style.animation = 'none';
            totalHP.offsetHeight; // Forcer le reflow
            totalHP.style.animation = 'pulse 0.5s';
        });
    }

    // Animation pour le résultat
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});
