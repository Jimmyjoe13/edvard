/**
 * Persistance commune à la fiche React et au créateur historique.
 * Le format canonique reste volontairement limité aux choix déjà connus.
 */
(function (window) {
    const characterKey = 'edvard-character-sheet-v1';
    const legacyKey = 'edvard_character_autosave';

    const emptyLore = () => ({ name: '', age: '', origin: '', background: '', appearance: '' });

    function normalize(record) {
        return {
            schemaVersion: 1,
            name: String(record.name || record.lore?.name || ''),
            originId: record.originId || record.race || null,
            baseStats: { ...(record.baseStats || record.stats || {}) },
            flexibleBonusStats: Array.isArray(record.flexibleBonusStats)
                ? [...record.flexibleBonusStats]
                : Array.isArray(record.originBonusChoices) ? [...record.originBonusChoices] : [],
            specializationId: record.specializationId || record.specialization || null,
            skillIds: Array.isArray(record.skillIds) ? [...record.skillIds] : Array.isArray(record.skills) ? [...record.skills] : [],
            equipmentIds: Array.isArray(record.equipmentIds) ? [...record.equipmentIds] : Array.isArray(record.equipment) ? [...record.equipment] : [],
            lore: { ...emptyLore(), ...(record.lore || {}), name: String(record.name || record.lore?.name || '') },
            updatedAt: record.updatedAt || new Date().toISOString()
        };
    }

    function toLegacyState(record) {
        const character = normalize(record);
        const costs = window.EdvardRules.characterCreation.pointCosts;
        const budget = window.EdvardRules.characterCreation.initialAttributePoints;
        const spent = Object.values(character.baseStats).reduce((total, value) => total + (costs[value] || 0), 0);
        const constitution = character.baseStats.constitution || window.EdvardRules.characterCreation.minimumAttribute;

        return {
            availablePoints: budget - spent,
            stats: character.baseStats,
            derived: { hp: Math.max(1, 10 + Math.floor((constitution - 10) / 2)), credits: 100 },
            race: character.originId,
            originBonusChoices: character.flexibleBonusStats,
            specialization: character.specializationId,
            lore: character.lore,
            skills: character.skillIds,
            equipment: character.equipmentIds
        };
    }

    function read() {
        try {
            const saved = localStorage.getItem(characterKey);
            if (saved) return normalize(JSON.parse(saved));
            const legacy = localStorage.getItem(legacyKey);
            return legacy ? normalize(JSON.parse(legacy)) : null;
        } catch {
            return null;
        }
    }

    function readLegacyState() {
        try {
            const legacy = localStorage.getItem(legacyKey);
            if (legacy) return JSON.parse(legacy);
            const record = read();
            return record ? toLegacyState(record) : null;
        } catch {
            return null;
        }
    }

    function write(record) {
        try {
            const character = normalize(record);
            localStorage.setItem(characterKey, JSON.stringify(character));
            localStorage.setItem(legacyKey, JSON.stringify(toLegacyState(character)));
            return character;
        } catch {
            return null;
        }
    }

    window.EdvardCharacterStorage = {
        key: characterKey,
        read,
        readLegacyState,
        write,
        writeLegacyState(state) {
            return write(state);
        }
    };
})(window);
