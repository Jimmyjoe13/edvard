/**
 * equipment-data.js
 * Définition de l'équipement disponible (Armes, Armures, Items).
 */

window.EdvardEquipment = {
    weapons: [
        { id: 'combat-knife', name: 'Couteau de Combat', type: 'melee', dmg: '1d4', prop: 'Léger', cost: 10 },
        { id: 'laser-pistol', name: 'Pistolet Laser', type: 'ranged', dmg: '1d6', prop: 'Portée 30m', cost: 50 },
        { id: 'shock-baton', name: 'Matraque Électrique', type: 'melee', dmg: '1d6', prop: 'Étourdissement', cost: 35 },
        { id: 'assault-rifle', name: 'Fusil d\'Assaut', type: 'ranged', dmg: '1d8', prop: 'Rafale', cost: 120 },
        { id: 'energy-sword', name: 'Épée Énergétique', type: 'melee', dmg: '1d8', prop: 'Tranchant', cost: 150 }
    ],

    armors: [
        { id: 'synth-cloth', name: 'Vêtements Synthétiques', defense: 0, cost: 5, desc: 'Protection minimale.' },
        { id: 'light-kevlar', name: 'Gilet Kevlar Léger', defense: 2, cost: 50, desc: 'Standard pour la sécurité.' },
        { id: 'riot-gear', name: 'Armure Anti-Émeute', defense: 4, cost: 150, desc: 'Lourde mais protectrice.' },
        { id: 'nano-suit', name: 'Nano-Combinaison', defense: 3, cost: 200, desc: 'Flexible et auto-réparatrice.' }
    ],

    startingKits: {
        'techno-guerrier': { weapon: 'assault-rifle', armor: 'riot-gear' },
        'bio-ingenieur': { weapon: 'laser-pistol', armor: 'light-kevlar' },
        'techno-mage': { weapon: 'energy-sword', armor: 'synth-cloth' },
        'infiltrateur': { weapon: 'combat-knife', armor: 'nano-suit' }
    }
};
