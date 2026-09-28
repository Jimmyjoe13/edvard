export interface Creature {
    id: string;
    name: string;
    type: string;
    category: 'synthétique' | 'organique' | 'hybride' | 'éthérée';
    level: number;
    habitat: 'station' | 'planete' | 'ruines' | 'espace';
    stats: {
        hp: string;
        ac: number;
        init: number;
        speed: string;
        force: number;
        dexterite: number;
        constitution: number;
        intelligence: number;
        sagesse: number;
        charisme: number;
    };
    resistances: string[];
    abilities: { name: string; desc: string }[];
    description: string;
    dangerLevel: number;
}

export const BESTIARY: Creature[] = [
    {
        id: 'rodeur-mutant',
        name: 'Rôdeur Mutant',
        type: 'Humanoïde Mutant',
        category: 'organique',
        level: 5,
        habitat: 'ruines',
        stats: {
            hp: '45 (6d8 + 18)', ac: 13, init: 1, speed: '9m',
            force: 14, dexterite: 12, constitution: 16, intelligence: 8, sagesse: 10, charisme: 6
        },
        resistances: ['Radiation (Immunité)', 'Poison (Avantage)', 'Maladie (Résistant)'],
        abilities: [
            { name: 'Mutation Adaptative', desc: 'Une fois par jour, peut gagner une résistance temporaire au dernier type de dégâts subi.' },
            { name: 'Rage Mutante', desc: 'Sous 50% PV, gagne +2 aux jets d\'attaque et de dégâts.' }
        ],
        description: 'Anciens humains transformés par les radiations, guidés par des instincts bestiaux.',
        dangerLevel: 3
    },
    {
        id: 'chasseur-mecanique',
        name: 'Chasseur Mécanique',
        type: 'Robot Autonome',
        category: 'synthétique',
        level: 10,
        habitat: 'station',
        stats: {
            hp: '65 (8d8 + 32)', ac: 16, init: 2, speed: '12m',
            force: 16, dexterite: 14, constitution: 18, intelligence: 12, sagesse: 10, charisme: 6
        },
        resistances: ['Physique (Résistant)', 'Énergie (Vulnérable)', 'PEM (Vulnérable)'],
        abilities: [
            { name: 'Systèmes de Ciblage Avancés', desc: 'Avantage aux jets d\'attaque contre les cibles déjà touchées ce tour.' },
            { name: 'Protocole d\'Auto-Réparation', desc: 'Récupère 5 PV par tour si sous 50% max HP.' }
        ],
        description: 'Robots de combat pré-apocalypse dotés de systèmes de ciblage sophistiqués.',
        dangerLevel: 3
    },
    {
        id: 'bete-des-abysses',
        name: 'Bête des Abysses',
        type: 'Aberration',
        category: 'organique',
        level: 15,
        habitat: 'ruines',
        stats: {
            hp: '120 (12d12 + 72)', ac: 18, init: 3, speed: '15m',
            force: 20, dexterite: 16, constitution: 22, intelligence: 14, sagesse: 12, charisme: 8
        },
        resistances: ['Psychique (Immunité)', 'Radiation (Immunité)', 'Physique (Résistant)'],
        abilities: [
            { name: 'Aura de Terreur', desc: 'Rayon de 9m : jet de Sagesse DD 15 ou effrayé.' },
            { name: 'Régénération Abyssale', desc: 'Récupère 10 PV/tour hors lumière du soleil.' }
        ],
        description: 'Créature cauchemardesque née d\'expériences sombres, hantant les profondeurs.',
        dangerLevel: 4
    }
];
