/**
 * skills-data.js
 * Définition des compétences disponibles dans l'univers Edvard.
 */

window.EdvardSkills = {
    list: [
        { id: 'athletics', name: 'Athlétisme', stat: 'force', desc: 'Courir, sauter, grimper.' },
        { id: 'stealth', name: 'Discrétion', stat: 'agilite', desc: 'Se déplacer sans bruit, se cacher.' },
        { id: 'mechanics', name: 'Mécanique', stat: 'intelligence', desc: 'Réparer et comprendre les machines.' },
        { id: 'hacking', name: 'Piratage', stat: 'intelligence', desc: 'S\'introduire dans des systèmes informatiques.' },
        { id: 'perception', name: 'Perception', stat: 'sagesse', desc: 'Remarquer des détails, entendre des bruits.' },
        { id: 'survival', name: 'Survie', stat: 'sagesse', desc: 'Pister, trouver de la nourriture.' },
        { id: 'persuasion', name: 'Persuasion', stat: 'charisme', desc: 'Convaincre par la diplomatie.' },
        { id: 'intimidation', name: 'Intimidation', stat: 'force', desc: 'Convaincre par la menace.' },
        { id: 'arcana', name: 'Arcanes', stat: 'intelligence', desc: 'Connaissance des Flux et de la magie.' },
        { id: 'medicine', name: 'Médecine', stat: 'sagesse', desc: 'Soigner les blessures.' }
    ],

    // Compétences gratuites par classe (exemple)
    classBonus: {
        'techno-guerrier': ['athletics', 'intimidation'],
        'bio-ingenieur': ['medicine', 'survival'],
        'techno-mage': ['arcana', 'mechanics'],
        'infiltrateur': ['stealth', 'hacking']
    },

    // Nombre de points de compétences libres de base (en plus de celles de classe)
    baseFreePoints: 2
};
