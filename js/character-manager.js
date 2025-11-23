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
                'humain': { stats: {}, free: 2 },
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
                skills: [], // Tableau des IDs de compétences choisies
                equipment: [] // Tableau des IDs d'objets (ou objets complets si besoin)
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
            const effectiveStats = this.getEffectiveStats();
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
         */
        calculateDerivedStats() {
            const stats = this.getEffectiveStats();
            const con = stats.constitution;
            const modCon = window.EdvardUtils ? window.EdvardUtils.calculateModifier(con) : Math.floor((con - 10) / 2);

            this.state.derived.hp = Math.max(1, 10 + modCon);

            if (this.state.derived.credits === 0) {
                this.state.derived.credits = 100;
            }
        }

        loadState(newState) {
            if (!newState) return;

            if (newState.availablePoints !== undefined) this.state.availablePoints = newState.availablePoints;
            if (newState.race) this.state.race = newState.race;
            if (newState.specialization) this.state.specialization = newState.specialization;

            if (newState.stats) this.state.stats = { ...this.state.stats, ...newState.stats };
            if (newState.lore) this.state.lore = { ...this.state.lore, ...newState.lore };
            if (newState.skills) this.state.skills = [...newState.skills];

            // Equipment loading
            if (newState.equipment) this.state.equipment = [...newState.equipment];

            this.calculateDerivedStats();
            this.saveCharacter();
        }

        increaseStat(statName) {
            const currentVal = this.state.stats[statName];
            if (currentVal >= 15) return false;

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
            if (currentVal <= 8) return false;

            const costTable = window.EdvardUtils ? window.EdvardUtils.costTable : this._getCostTable();

            const currentCost = costTable[currentVal] || 0;
            const prevCost = costTable[currentVal - 1] || 0;
            const diff = currentCost - prevCost;

            this.state.stats[statName]--;
            this.state.availablePoints += diff;
            this.calculateDerivedStats();
            this.saveCharacter();
            return true;
        }

        // --- Gestion des Compétences ---

        toggleSkill(skillId) {
            const index = this.state.skills.indexOf(skillId);

            if (index > -1) {
                this.state.skills.splice(index, 1);
            } else {
                if (window.EdvardSkills) {
                    const classSkills = (this.state.specialization && window.EdvardSkills.classBonus[this.state.specialization]) || [];
                    const isClassSkill = classSkills.includes(skillId);

                    if (!isClassSkill) {
                        const currentFree = this.state.skills.filter(s => !classSkills.includes(s)).length;
                        if (currentFree >= window.EdvardSkills.baseFreePoints) {
                            return false;
                        }
                    }
                }
                this.state.skills.push(skillId);
            }
            this.saveCharacter();
            return true;
        }

        getAvailableSkillPoints() {
             if (window.EdvardSkills) {
                const classSkills = (this.state.specialization && window.EdvardSkills.classBonus[this.state.specialization]) || [];
                const currentFree = this.state.skills.filter(s => !classSkills.includes(s)).length;
                return Math.max(0, window.EdvardSkills.baseFreePoints - currentFree);
             }
             return 0;
        }

        // --- Gestion de l'Équipement ---

        setEquipment(weaponId, armorId) {
            this.state.equipment = [];
            if(weaponId) this.state.equipment.push(weaponId);
            if(armorId) this.state.equipment.push(armorId);
            this.saveCharacter();
        }

        // -------------------------------

        _getCostTable() {
            return {
                8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
                14: 7, 15: 9, 16: 11, 17: 13, 18: 15
            };
        }

        setRace(raceId) {
            this.state.race = raceId;
            this.calculateDerivedStats();
            this.saveCharacter();
        }

        setSpecialization(specId) {
            this.state.specialization = specId;
            this.state.skills = [];
            this.saveCharacter();
        }

        updateLore(key, value) {
            if (this.state.lore.hasOwnProperty(key)) {
                this.state.lore[key] = value;
                this.saveCharacter();
            }
        }

        saveCharacter() {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
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
