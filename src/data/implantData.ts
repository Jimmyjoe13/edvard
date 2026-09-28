export interface Implant {
    id: string;
    name: string;
    category: 'optique' | 'moteur' | 'neural' | 'dermique';
    desc: string;
    cost: number;
    requires?: string[]; // IDs des implants prérequis
    effect: {
        type: 'stat_boost' | 'new_skill' | 'passive';
        target?: string;
        value?: number;
    };
    icon: string;
}

export const IMPLANTS: Implant[] = [
    // --- OPTIQUE ---
    {
        id: 'opt_1', name: 'Oculus Kiroshi v1', category: 'optique', cost: 1,
        desc: 'Améliore l\'acuité visuelle basique. +1 Sagesse.',
        effect: { type: 'stat_boost', target: 'sagesse', value: 1 }, icon: 'Eye'
    },
    {
        id: 'opt_2', name: 'Vision Thermique', category: 'optique', cost: 2, requires: ['opt_1'],
        desc: 'Permet de voir à travers le brouillard de guerre léger. +2 Intelligence.',
        effect: { type: 'stat_boost', target: 'intelligence', value: 2 }, icon: 'Scan'
    },
    
    // --- MOTEUR (Jambes/Bras) ---
    {
        id: 'mot_1', name: 'Servomoteurs Basiques', category: 'moteur', cost: 1,
        desc: 'Renforce la structure musculaire. +1 Force.',
        effect: { type: 'stat_boost', target: 'force', value: 1 }, icon: 'Activity'
    },
    {
        id: 'mot_2', name: 'Jambes Hydrauliques', category: 'moteur', cost: 2, requires: ['mot_1'],
        desc: 'Augmente drastiquement la mobilité. +2 Points de Mouvement (PM) Max.',
        effect: { type: 'passive', target: 'maxMp', value: 2 }, icon: 'Footprints'
    },
    
    // --- NEURAL (Cerveau) ---
    {
        id: 'neu_1', name: 'Coprocesseur Tactique', category: 'neural', cost: 1,
        desc: 'Accélère les réflexes en combat. +1 Agilité.',
        effect: { type: 'stat_boost', target: 'agilite', value: 1 }, icon: 'Cpu'
    },
    {
        id: 'neu_2', name: 'Module d\'Overclocking', category: 'neural', cost: 3, requires: ['neu_1'],
        desc: 'Pousse le système à ses limites. +1 Point d\'Action (PA) Max.',
        effect: { type: 'passive', target: 'maxAp', value: 1 }, icon: 'Zap'
    },

    // --- DERMIQUE (Peau/Armure) ---
    {
        id: 'der_1', name: 'Sous-peau Synthétique', category: 'dermique', cost: 1,
        desc: 'Épaissit l\'épiderme pour mieux résister aux chocs. +1 Constitution.',
        effect: { type: 'stat_boost', target: 'constitution', value: 1 }, icon: 'Layers'
    },
    {
        id: 'der_2', name: 'Plaques Sous-Cutanées', category: 'dermique', cost: 2, requires: ['der_1'],
        desc: 'Armure interne lourde. +10 PV Max.',
        effect: { type: 'passive', target: 'maxHp', value: 10 }, icon: 'Shield'
    }
];
