document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la progression
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.creation-section');
    const progressBar = document.querySelector('.progress-bar');
    let currentStep = 1;

    // Mise à jour de la barre de progression
    function updateProgress() {
        const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
        
        steps.forEach((step, index) => {
            if (index + 1 < currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    // Navigation entre les étapes
    function showSection(stepNumber) {
        sections.forEach(section => section.classList.remove('active'));
        sections[stepNumber - 1].classList.add('active');
        currentStep = stepNumber;
        updateProgress();
    }

    // Gestion des races
    const raceCards = document.querySelectorAll('.race-card');
    let selectedRace = null;

    raceCards.forEach(card => {
        card.addEventListener('click', function() {
            raceCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedRace = this.dataset.race;
            
            // Mettre à jour les bonus raciaux
            updateRacialBonuses(selectedRace);
        });
    });

    // Gestion des caractéristiques
    const characteristicInputs = document.querySelectorAll('.stat-input');
    const pointsRemaining = document.querySelector('.points-remaining');
    let totalPoints = 27;
    let usedPoints = 0;

    function calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    function calculatePointCost(score) {
        const costs = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4,
            13: 5, 14: 7, 15: 9
        };
        return costs[score] || 0;
    }

    function updateCharacteristicModifiers() {
        characteristicInputs.forEach(input => {
            const card = input.closest('.characteristic-card');
            const modifierSpan = card.querySelector('.modifier-value');
            const modifier = calculateModifier(parseInt(input.value));
            modifierSpan.textContent = modifier >= 0 ? `+${modifier}` : modifier;
        });
    }

    function updatePointsRemaining() {
        usedPoints = 0;
        characteristicInputs.forEach(input => {
            usedPoints += calculatePointCost(parseInt(input.value));
        });
        pointsRemaining.textContent = totalPoints - usedPoints;
    }

    characteristicInputs.forEach(input => {
        input.addEventListener('change', function() {
            const newValue = parseInt(this.value);
            const oldValue = parseInt(this.dataset.lastValue || 8);
            const newCost = calculatePointCost(newValue);
            const oldCost = calculatePointCost(oldValue);
            
            if (usedPoints - oldCost + newCost > totalPoints) {
                this.value = oldValue;
                return;
            }
            
            this.dataset.lastValue = newValue;
            updateCharacteristicModifiers();
            updatePointsRemaining();
        });

        const decreaseBtn = input.previousElementSibling;
        const increaseBtn = input.nextElementSibling;

        decreaseBtn.addEventListener('click', () => {
            if (parseInt(input.value) > 8) {
                input.value = parseInt(input.value) - 1;
                input.dispatchEvent(new Event('change'));
            }
        });

        increaseBtn.addEventListener('click', () => {
            if (parseInt(input.value) < 15) {
                input.value = parseInt(input.value) + 1;
                input.dispatchEvent(new Event('change'));
            }
        });
    });

    // Gestion de la navigation
    const prevButtons = document.querySelectorAll('.prev-step');
    const nextButtons = document.querySelectorAll('.next-step');

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 1) {
                showSection(currentStep - 1);
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < sections.length) {
                    showSection(currentStep + 1);
                }
            }
        });
    });

    // Validation des étapes
    function validateCurrentStep() {
        switch(currentStep) {
            case 1: // Race
                if (!selectedRace) {
                    alert('Veuillez sélectionner une race avant de continuer.');
                    return false;
                }
                break;
            case 2: // Caractéristiques
                if (usedPoints > totalPoints) {
                    alert('Vous avez utilisé trop de points de caractéristiques.');
                    return false;
                }
                break;
            // Ajouter d'autres validations selon les étapes
        }
        return true;
    }

    // Initialisation
    updateProgress();
    updateCharacteristicModifiers();
    updatePointsRemaining();

    // Fonction pour mettre à jour les bonus raciaux
    function updateRacialBonuses(race) {
        const racialBonuses = {
            'humain': {
                // Les humains peuvent choisir deux caractéristiques pour +1
                bonusType: 'choice',
                numChoices: 2,
                bonusValue: 1
            },
            'sylvain': {
                'sagesse': 2,
                'constitution': 1
            },
            'neo-forge': {
                'intelligence': 2,
                'force': 1
            },
            'skarn': {
                'force': 2,
                'constitution': 1
            }
        };

        // Réinitialiser tous les bonus
        characteristicInputs.forEach(input => {
            const card = input.closest('.characteristic-card');
            card.classList.remove('has-racial-bonus');
            const bonusSpan = card.querySelector('.racial-bonus');
            if (bonusSpan) bonusSpan.remove();
        });

        // Appliquer les nouveaux bonus
        const bonuses = racialBonuses[race];
        if (bonuses) {
            if (bonuses.bonusType === 'choice') {
                // Implémenter la sélection des bonus pour les humains
                // TODO: Ajouter une interface pour choisir les caractéristiques
            } else {
                Object.entries(bonuses).forEach(([stat, bonus]) => {
                    const card = document.querySelector(`[data-stat="${stat}"]`);
                    if (card) {
                        card.classList.add('has-racial-bonus');
                        const header = card.querySelector('.char-header');
                        const bonusSpan = document.createElement('span');
                        bonusSpan.className = 'racial-bonus';
                        bonusSpan.textContent = `+${bonus}`;
                        header.appendChild(bonusSpan);
                    }
                });
            }
        }
    }
});
