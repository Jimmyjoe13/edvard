// Alias conservé pour les pages historiques : les données viennent du catalogue partagé.
if (!window.EdvardRules) throw new Error('Chargez js/shared-rules.js avant js/equipment-data.js.');

window.EdvardEquipment = window.EdvardRules.equipment;
