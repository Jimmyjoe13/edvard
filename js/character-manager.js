/**
 * character-manager.js
 * Gère l'état global du personnage et la persistance des données (LocalStorage, JSON).
 * Adapté pour correspondre à l'API attendue par character-creation-logic.js
 */

(function(window) {
    class CharacterManager {
        constructor() {
            // Configuration de base
            this.storageKey = 'edvard_character_autosave';

            // Bonus raciaux définis
            this.racialBonuses = {
                'humain': { stats: {}, free: 2 }, // Spécial: +1 à deux stats au choix (non implémenté auto ici, laissé à la base)
                'sylvain': { stats: { 'sagesse': 2, 'constitution': 1 } },
                'neo-forge': { stats: { 'intelligence': 2, 'force': 1 } },
                'skarn': { stats: { 'force': 2, 'constitution': 1 } },
                'ether-born': { stats: { 'intelligence': 2, 'charisme': 1, 'constitution': -1 } }
            };

            // État initial
            this.state = {
                availablePoints: 27,
                stats: {
                    force: 8,
                    agilite: 8,
                    constitution: 8,
                    intelligence: 8,
                    sagesse: 8,
                    charisme: 8
                },
                derived: {
                    hp: 10,
                    credits: 0
                },
                race: null,
                specialization: null,
                lore: {
                    name: "",
                    age: "",
                    origin: "",
                    background: "",
                    appearance: ""
                },
                skills: [],
                equipment: []
            };

            // Initialise derived stats
            this.calculateDerivedStats();

            // Chargement auto
            this.initialize();
        }

        initialize() {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    this.loadState(parsed);
                    console.log("Personnage chargé depuis la sauvegarde automatique.");
                } catch (e) {
                    console.error("Erreur chargement sauvegarde:", e);
                }
            }
        }

        /**
         * Retourne l'état complet du personnage avec les stats effectives ajoutées.
         */
        getState() {
            // Calculer les stats effectives à la volée pour l'affichage
            const effectiveStats = this.getEffectiveStats();
            // On retourne une copie de l'état enrichie
            return {
                ...this.state,
                effectiveStats: effectiveStats
            };
        }

        /**
         * Calcule les stats finales (Base + Racial).
         */
        getEffectiveStats() {
            const effective = { ...this.state.stats };

            if (this.state.race && this.racialBonuses[this.state.race]) {
                const bonuses = this.racialBonuses[this.state.race].stats;
                for (const [stat, bonus] of Object.entries(bonuses)) {
                    if (effective[stat] !== undefined) {
                        effective[stat] += bonus;
                    }
                }
            }
            return effective;
        }

        /**
         * Calcule les stats dérivées (HP, Credits, etc.)
         * Utilise la Constitution effective (Base + Race).
         */
        calculateDerivedStats() {
            // Récupérer stats avec bonus
            const stats = this.getEffectiveStats();

            // Calcul HP
            const con = stats.constitution;
            const modCon = window.EdvardUtils ? window.EdvardUtils.calculateModifier(con) : Math.floor((con - 10) / 2);

            // Minimum 1 PV
            this.state.derived.hp = Math.max(1, 10 + modCon);

            // Credits (Placeholder logic)
            if (this.state.derived.credits === 0) {
                this.state.derived.credits = 100;
            }
        }

        /**
         * Charge un état donné (fusionne avec l'état actuel).
         */
        loadState(newState) {
            if (!newState) return;

            // Fusion prudente
            if (newState.availablePoints !== undefined) this.state.availablePoints = newState.availablePoints;
            if (newState.race) this.state.race = newState.race;
            if (newState.specialization) this.state.specialization = newState.specialization;

            if (newState.stats) {
                this.state.stats = { ...this.state.stats, ...newState.stats };
            }
            if (newState.lore) {
                this.state.lore = { ...this.state.lore, ...newState.lore };
            }

            // Calculer les dérivés après le chargement pour être sûr d'être synchro avec les stats
            this.calculateDerivedStats();

            this.saveCharacter(); // Sauvegarde immédiate
        }

        increaseStat(statName) {
            const currentVal = this.state.stats[statName];
            if (currentVal >= 15) return false; // Max pour Point Buy avant raciaux

            const costTable = window.EdvardUtils ? window.EdvardUtils.costTable : this._getCostTable();

            const currentCost = costTable[currentVal] || 0;
            const nextCost = costTable[currentVal + 1] || 0;
            const diff = nextCost - currentCost;

            if (this.state.availablePoints >= diff) {
                this.state.stats[statName]++;
                this.state.availablePoints -= diff;

                this.calculateDerivedStats();
                this.saveCharacter();
                return true;
            }
            return false;
        }

        decreaseStat(statName) {
            const currentVal = this.state.stats[statName];
            if (currentVal <= 8) return false; // Min pour Point Buy

            const costTable = window.EdvardUtils ? window.EdvardUtils.costTable : this._getCostTable();

            const currentCost = costTable[currentVal] || 0;
            const prevCost = costTable[currentVal - 1] || 0;
            const diff = currentCost - prevCost; // Points à rendre

            this.state.stats[statName]--;
            this.state.availablePoints += diff;

            this.calculateDerivedStats();
            this.saveCharacter();
            return true;
        }

        _getCostTable() {
            return {
                8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
                14: 7, 15: 9, 16: 11, 17: 13, 18: 15
            };
        }

        setRace(raceId) {
            this.state.race = raceId;
            // Recalculer derived stats car la race change la constitution potentiellement
            this.calculateDerivedStats();
            this.saveCharacter();
        }

        setSpecialization(specId) {
            this.state.specialization = specId;
            this.saveCharacter();
        }

        updateLore(key, value) {
            if (this.state.lore.hasOwnProperty(key)) {
                this.state.lore[key] = value;
                this.saveCharacter();
            }
        }

        saveCharacter() {
            // On sauvegarde l'état brut (sans effectiveStats qui est calculé)
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));

            // Pour l'event, on envoie l'état enrichi pour que l'UI n'ait pas à recalculer
            const fullState = this.getState();
            const event = new CustomEvent('characterStateUpdated', { detail: fullState });
            window.dispatchEvent(event);
        }

        exportJSON() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", (this.state.lore.name || "personnage") + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }

        importJSON(file, callback) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    this.loadState(parsed);
                    if(callback) callback(true);
                } catch (e) {
                    console.error("Erreur parsing JSON", e);
                    if(callback) callback(false);
                }
            };
            reader.readAsText(file);
        }
    }

    window.CharacterManager = CharacterManager;

})(window);
