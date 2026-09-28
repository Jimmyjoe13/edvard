/**
 * Catalogue de règles partagé par le site React et les pages historiques.
 * Les valeurs de création reprennent le créateur publié ; les formules encore
 * absentes du livret restent à valider avant d'être utilisées en partie.
 */
(function (window) {
    const rules = {
        version: 1,
        attributes: [
            { id: 'force', label: 'Force' },
            { id: 'agilite', label: 'Agilité' },
            { id: 'constitution', label: 'Constitution' },
            { id: 'intelligence', label: 'Intelligence' },
            { id: 'sagesse', label: 'Sagesse' },
            { id: 'charisme', label: 'Charisme' }
        ],
        characterCreation: {
            minimumAttribute: 8,
            maximumAttribute: 15,
            initialAttributePoints: 27,
            pointCosts: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9, 16: 11, 17: 13, 18: 15 },
            baseSkillPoints: 2
        },
        origins: [
            {
                id: 'humain', name: 'HUMAIN', label: 'Humain', tagline: 'Polyvalent',
                description: 'Les humains sont connus pour leur adaptabilité et leur innovation.',
                bonus: {}, flexibleBonusCount: 2, freeSkillBonus: 1
            },
            {
                id: 'sylvain', name: 'SYLVAÏN', label: 'Sylvaïn', tagline: 'Bio-augmenté',
                description: 'Les Sylvaïns sont le fruit d’expériences de fusion entre ADN humain et biotechnologie végétale.',
                bonus: { sagesse: 2, constitution: 1 }, flexibleBonusCount: 0, freeSkillBonus: 0
            },
            {
                id: 'neo-forge', name: 'NÉO-FORGÉ', label: 'Néo-Forgé', tagline: 'Synthétique',
                description: 'Les Néo-Forgés sont des êtres cybernétiques avancés.',
                bonus: { intelligence: 2, force: 1 }, flexibleBonusCount: 0, freeSkillBonus: 0
            },
            {
                id: 'skarn', name: 'SKARN', label: 'Skarn', tagline: 'Cristallin',
                description: 'Les Skarns sont des êtres cristallins dotés d’une force physique impressionnante.',
                bonus: { force: 2, constitution: 1 }, flexibleBonusCount: 0, freeSkillBonus: 0
            },
            {
                id: 'ether-born', name: 'ÉTHÉRÉ', label: 'Éthéré', tagline: 'Énergétique',
                description: 'Nés des Flux Primordiaux, les Éthérés sont des entités d’énergie pure contenues dans des armures de confinement.',
                bonus: { intelligence: 2, charisme: 1, constitution: -1 }, flexibleBonusCount: 0, freeSkillBonus: 0
            }
        ],
        skills: [
            { id: 'athletics', name: 'Athlétisme', stat: 'force', desc: 'Courir, sauter, grimper.' },
            { id: 'stealth', name: 'Discrétion', stat: 'agilite', desc: 'Se déplacer sans bruit, se cacher.' },
            { id: 'mechanics', name: 'Mécanique', stat: 'intelligence', desc: 'Réparer et comprendre les machines.' },
            { id: 'hacking', name: 'Piratage', stat: 'intelligence', desc: 'S’introduire dans des systèmes informatiques.' },
            { id: 'perception', name: 'Perception', stat: 'sagesse', desc: 'Remarquer des détails, entendre des bruits.' },
            { id: 'survival', name: 'Survie', stat: 'sagesse', desc: 'Pister, trouver de la nourriture.' },
            { id: 'persuasion', name: 'Persuasion', stat: 'charisme', desc: 'Convaincre par la diplomatie.' },
            { id: 'intimidation', name: 'Intimidation', stat: 'force', desc: 'Convaincre par la menace.' },
            { id: 'arcana', name: 'Arcanes', stat: 'intelligence', desc: 'Connaissance des Flux et de la magie.' },
            { id: 'medicine', name: 'Médecine', stat: 'sagesse', desc: 'Soigner les blessures.' },
            { id: 'firearms', name: 'Tir', stat: 'agilite', desc: 'Viser et utiliser des armes à distance.' }
        ],
        specializations: [
            { id: 'techno-guerrier', name: 'Techno-Guerrier', skills: ['athletics', 'intimidation'] },
            { id: 'bio-ingenieur', name: 'Bio-Ingénieur', skills: ['medicine', 'survival'] },
            { id: 'techno-mage', name: 'Techno-Mage', skills: ['arcana', 'mechanics'] },
            { id: 'infiltrateur', name: 'Infiltrateur', skills: ['stealth', 'hacking'] }
        ],
        equipment: {
            weapons: [
                { id: 'combat-knife', name: 'Couteau de Combat', type: 'melee', dmg: '1d4', prop: 'Léger', rangeCells: 1, cost: 10 },
                { id: 'laser-pistol', name: 'Pistolet Laser', type: 'ranged', dmg: '1d6', prop: 'Portée 30m', rangeCells: 6, cost: 50 },
                { id: 'shock-baton', name: 'Matraque Électrique', type: 'melee', dmg: '1d6', prop: 'Étourdissement', rangeCells: 1, cost: 35 },
                { id: 'assault-rifle', name: 'Fusil d’Assaut', type: 'ranged', dmg: '1d8', prop: 'Rafale', rangeCells: 9, cost: 120 },
                { id: 'energy-sword', name: 'Épée Énergétique', type: 'melee', dmg: '1d8', prop: 'Tranchant', rangeCells: 1, cost: 150 }
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
                infiltrateur: { weapon: 'combat-knife', armor: 'nano-suit' }
            }
        },
        combat: {
            baseDefense: 10,
            weaponSkills: { melee: 'athletics', ranged: 'firearms' },
            criticalDamageMultiplier: 2
        },
        resolution: {
            diceCount: 2,
            dieSides: 10,
            advantageDiceCount: 3,
            keptDiceCount: 2,
            synergyBonus: 2,
            difficulties: [
                { label: 'Facile', value: 10 },
                { label: 'Moyen', value: 15 },
                { label: 'Difficile', value: 20 },
                { label: 'Très difficile', value: 25 },
                { label: 'Héroïque', value: 30 }
            ]
        },
        rulebook: [
            { id: 'test', category: 'Tests', title: 'Résoudre une action', summary: 'Lancez 2d10 et ajoutez la caractéristique et la compétence adaptées.', details: ['Le total doit atteindre ou dépasser la difficulté fixée par le MJ.', 'Double 10 : succès critique. Double 1 : échec critique.', 'Avec un avantage ou un désavantage, lancez 3d10 et gardez les deux meilleurs ou les deux plus faibles.'] },
            { id: 'synergie', category: 'Tests', title: 'Obtenir un bonus de synergie', summary: 'Une aide pertinente peut ajouter +2 au test.', details: ['+2 pour une compétence connexe.', '+2 pour un équipement adapté.', '+2 pour l’aide d’une autre personne.'] },
            { id: 'actions', category: 'Combat', title: 'Les actions d’un tour', summary: 'Un tour permet d’agir, de se déplacer et de saisir une occasion.', details: ['1 action principale.', '1 action de mouvement.', '1 action bonus.'] },
            { id: 'initiative', category: 'Combat', title: 'Déterminer l’initiative', summary: 'Au début du combat, chaque participant lance son initiative.', details: ['Lancez 1d10 et ajoutez votre Agilité.', 'Les tours se déroulent du résultat le plus élevé au plus faible.', 'En cas d’égalité, le personnage avec la meilleure Agilité passe en premier.'] },
            { id: 'attaque', category: 'Combat', title: 'Porter une attaque', summary: 'Lancez 2d10, ajoutez la caractéristique liée à l’arme et votre bonus de compétence si elle est connue.', details: ['Mêlée : Force + Athlétisme. À distance : Agilité + Tir.', 'Une cible doit se trouver dans la portée de l’arme, indiquée en cases sur la carte.', 'Défense : 10 + Agilité de la cible + protection de son armure.', 'Les dégâts suivent le dé de l’arme et sont réduits par l’armure.', 'Double 10 : dégâts doublés. Double 1 : échec critique.'] },
            { id: 'degats', category: 'Combat', title: 'Calculer les dégâts', summary: 'Les dégâts suivent le dé de l’arme et sont réduits par la protection.', details: ['Lancez le ou les dés indiqués sur l’arme.', 'Soustrayez la valeur de défense de l’armure ; une attaque réussie inflige au moins 1 dégât.', 'Double 10 : multipliez les dégâts de l’arme par deux avant la réduction d’armure.'] },
            { id: 'implants', category: 'Équipement', title: 'Utiliser un implant', summary: 'Les implants actifs ont un coût et occupent une action.', details: ['Un personnage peut avoir jusqu’à 3 implants actifs.', 'Activer ou désactiver un implant nécessite une action.', 'L’utilisation peut consommer de l’énergie.'] },
            { id: 'piratage', category: 'Équipement', title: 'Piratage', summary: 'Le piratage met l’Intelligence à l’épreuve face aux contre-mesures.', details: ['Le test utilise Intelligence + Technologie.', 'Les contre-mesures et le temps disponible dépendent de la complexité.'] },
            { id: 'experience', category: 'Progression', title: 'Gagner de l’expérience', summary: 'Les combats, le jeu de rôle et les objectifs peuvent rapporter des points.', details: ['Combat : 1 à 5 points.', 'Jeu de rôle : 1 à 3 points.', 'Objectif accompli : 3 à 5 points.'] },
            { id: 'ameliorations', category: 'Progression', title: 'Améliorer son personnage', summary: 'Dépensez de l’expérience pour développer ses capacités.', details: ['Nouvelle compétence : 5 points.', 'Amélioration de caractéristique : 10 points.', 'Nouveau talent : 8 points.'] }
        ]
    };

    window.EdvardRules = rules;
    window.EdvardSkills = {
        list: rules.skills,
        classBonus: Object.fromEntries(rules.specializations.map((specialization) => [specialization.id, specialization.skills])),
        baseFreePoints: rules.characterCreation.baseSkillPoints
    };
    window.EdvardEquipment = rules.equipment;
})(window);
