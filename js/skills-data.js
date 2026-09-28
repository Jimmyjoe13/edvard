// Alias conservé pour les pages historiques : les données viennent du catalogue partagé.
if (!window.EdvardRules) throw new Error('Chargez js/shared-rules.js avant js/skills-data.js.');

window.EdvardSkills = {
    list: window.EdvardRules.skills,
    classBonus: Object.fromEntries(window.EdvardRules.specializations.map((specialization) => [specialization.id, specialization.skills])),
    baseFreePoints: window.EdvardRules.characterCreation.baseSkillPoints
};
