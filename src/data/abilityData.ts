export interface Ability {
    id: string;
    name: string;
    desc: string;
    cost: number;
    type: 'active' | 'passive';
}

export const RACE_ABILITIES: Record<string, Ability[]> = {
    'HUMAIN': [
        { id: 'adrenaline', name: 'Injection d\'Adrénaline', desc: 'Gain immédiat de 1 Point d\'Action supplémentaire.', cost: 5, type: 'active' }
    ],
    'SYLVAÏN': [
        { id: 'regrowth', name: 'Poussée de Croissance', desc: 'Active les nano-puces de régénération pour soigner 15 PV.', cost: 8, type: 'active' }
    ],
    'SKARN': [
        { id: 'fortify', name: 'Blindage Réactif', desc: 'Durcit la peau de Skarn. Réduit les prochains dégâts subis.', cost: 6, type: 'active' }
    ],
    'SYNTHÉTIQUE': [
        { id: 'overclock', name: 'Surcadence CPU', desc: 'Augmente la vitesse de calcul pour gagner +4 Points de Mouvement.', cost: 4, type: 'active' }
    ]
};
