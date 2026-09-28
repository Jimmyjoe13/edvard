export interface Objective {
    id: string;
    description: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface DialogueNode {
    speaker: string;
    avatar: string;
    text: string;
    choices?: DialogueChoice[];
}

export interface DialogueChoice {
    id: string;
    label: string;
    description: string;
    check: { skillId: string; difficulty: number };
    successText: string;
    failureText: string;
    successFlag?: string;
    failureFlag?: string;
    successEffect?: MissionEffect;
    failureEffect?: MissionEffect;
}

export type MissionEffect =
    | { type: 'damage-opposition'; amount: number }
    | { type: 'unlock-terminal' }
    | { type: 'restore-flux'; amount: number }
    | { type: 'damage-player'; amount: number }
    | { type: 'complete-objective'; objectiveId: string }
    | { type: 'add-objective'; objective: Objective; opponentId?: string };

export interface MissionScene {
    id: string;
    afterObjectiveId: string;
    node: DialogueNode;
}

const openingChoices: DialogueChoice[] = [
    {
        id: 'silent-approach',
        label: 'Prendre une approche discrète',
        description: 'Test de Discrétion. Une réussite surprend l’opposition et réduit sa garde.',
        check: { skillId: 'stealth', difficulty: 15 },
        successText: 'Vous contournez les défenses sans être repérés. L’équipe surprend l’opposition et entame son blindage.',
        failureText: 'L’alarme se déclenche pendant votre approche. Vous encaissez le choc et l’opposition se prépare.',
        successFlag: 'blackout-clean-entry',
        failureFlag: 'blackout-alarm-raised',
        successEffect: { type: 'damage-opposition', amount: 12 },
        failureEffect: { type: 'damage-player', amount: 5 },
    },
    {
        id: 'spoof-access',
        label: 'Intervenir sur le terminal à distance',
        description: 'Test de Piratage. Une réussite neutralise l’objectif informatique avant l’assaut.',
        check: { skillId: 'hacking', difficulty: 15 },
        successText: 'Vous contournez les défenses du système et neutralisez l’objectif informatique à distance.',
        failureText: 'Le pare-feu réplique l’intrusion. L’objectif reste verrouillé et un retour de Flux vous atteint.',
        successFlag: 'network-logs-cleared',
        failureFlag: 'network-trace-spotted',
        successEffect: { type: 'unlock-terminal' },
        failureEffect: { type: 'damage-player', amount: 5 },
    },
];

export interface MissionOpponent {
    id: string;
    name: string;
    avatar: string;
    hp: number;
    stats: { force: number; agilite: number; constitution: number; intelligence: number; sagesse: number; charisme: number };
    weaponId: string;
    position: { x: number; y: number };
    objectiveId?: string;
}

export interface MissionTerminal {
    id: string;
    name: string;
    position: { x: number; y: number };
    objectiveId: string;
}

export interface CampaignBriefing {
    requiresFlag: string;
    node: DialogueNode;
}

export interface CampaignOpponent {
    requiresFlags: string[];
    opponent: MissionOpponent;
}

export interface Mission {
    id: string;
    title: string;
    client: string;
    difficulty: number;
    description: string;
    estimatedMinutes: number;
    tags: string[];
    coverImage: string;
    objectives: Objective[];
    briefing: DialogueNode[];
    debrief: DialogueNode[];
    campaignCompletionFlag: string;
    campaignBriefings?: CampaignBriefing[];
    campaignOpponents?: CampaignOpponent[];
    scenes?: MissionScene[];
    resolvedSceneIds?: string[];
    opposition: MissionOpponent[];
    reserveOpposition?: MissionOpponent[];
    terminal: MissionTerminal;
}

const makeBriefing = (intro: string, directive: string, choices: DialogueChoice[] = openingChoices): DialogueNode[] => [
    { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: intro },
    { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: directive },
    { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Avant le déploiement, choisissez votre approche. Le résultat modifiera les conditions de la mission.', choices }
];

const makeDebrief = (report: string, consequence: string): DialogueNode[] => [
    { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: report },
    { speaker: 'SYSTEM', avatar: gameAssets.edvardLogo, text: consequence }
];

const makeOpponent = (id: string, name: string, hp: number, position: { x: number; y: number }): MissionOpponent => ({
    id,
    name,
    avatar: gameAssets.neoForgeAvatar,
    hp,
    stats: { force: 8, agilite: 14, constitution: 10, intelligence: 6, sagesse: 8, charisme: 1 },
    weaponId: 'laser-pistol',
    position,
    objectiveId: 'obj_2',
});

export const MISSIONS: Mission[] = [
    {
        id: 'op_blackout',
        title: 'Opération : Blackout',
        client: 'Dr. Elena Volkov · Résistance',
        difficulty: 2,
        estimatedMinutes: 30,
        tags: ['Infiltration', 'Technologie'],
        coverImage: gameAssets.accueilThree,
        description: 'Infiltrez l’avant-poste de la NeoForge dans le Secteur 7 et neutralisez son drone sentinelle avant qu’il ne transmette nos coordonnées.',
        objectives: [
            { id: 'obj_1', description: 'Atteindre la zone de déploiement tactique.', status: 'completed' },
            { id: 'obj_2', description: 'Neutraliser le drone sentinelle MK-II.', status: 'pending' },
            { id: 'obj_3', description: 'Pirater le terminal réseau pour effacer les journaux.', status: 'pending' }
        ],
        briefing: makeBriefing(
            'Agent, vous m’entendez ? Le lien neural est stable. Vous êtes largué dans le Secteur 7.',
            'La NeoForge a déployé un drone lourd. S’il scanne la zone, notre base est perdue. Abattez-le et piratez son terminal.'
        ),
        debrief: makeDebrief(
            'L’antenne est muette. Les journaux récupérés confirment que la NeoForge préparait une nouvelle vague de surveillance.',
            'OPÉRATION BLACKOUT // OBJECTIFS VALIDÉS // COORDONNÉES DE LA RÉSISTANCE EFFACÉES'
        ),
        campaignCompletionFlag: 'blackout-complete',
        scenes: [
            {
                id: 'blackout-drone-aftermath',
                afterObjectiveId: 'obj_2',
                node: {
                    speaker: 'HQ_VOLKOV',
                    avatar: gameAssets.drElena,
                    text: 'Le drone est hors service. Son noyau pulse encore ; un dernier paquet de données vient d’être transmis. Choisissez ce que vous récupérez.',
                    choices: [
                        {
                            id: 'blackout-siphon-core',
                            label: 'Siphonner le noyau du drone',
                            description: 'Test de Mécanique. Une réussite récupère du Flux ; le terminal reste à neutraliser.',
                            check: { skillId: 'mechanics', difficulty: 15 },
                            successText: 'Vous récupérez une cellule intacte. Le Flux revient dans votre réserve ; le terminal attend toujours votre équipe.',
                            failureText: 'La cellule surcharge. Vous perdez l’occasion et le retour électrique vous blesse.',
                            successFlag: 'drone-core-siphoned',
                            failureFlag: 'drone-core-overloaded',
                            successEffect: { type: 'restore-flux', amount: 5 },
                            failureEffect: { type: 'damage-player', amount: 4 },
                        },
                        {
                            id: 'blackout-capture-signal',
                            label: 'Analyser la dernière transmission',
                            description: 'Test de Perception. Une réussite récupère la piste envoyée par le drone.',
                            check: { skillId: 'perception', difficulty: 15 },
                            successText: 'Vous reconstituez le paquet avant sa purge. Il contient la route empruntée par les patrouilles NeoForge.',
                            failureText: 'Le paquet se corrompt sous vos yeux. Vous n’en tirez aucune piste exploitable.',
                            successFlag: 'drone-signal-captured',
                            failureFlag: 'drone-signal-lost',
                        },
                    ],
                },
            },
        ],
        opposition: [makeOpponent('enemy-blackout-sentry', 'Drone Sentinelle MK-II', 35, { x: 12, y: 4 })],
        terminal: { id: 'NODE_ALPHA_01', name: 'Terminal de sécurité', position: { x: 14, y: 4 }, objectiveId: 'obj_3' }
    },
    {
        id: 'convoi',
        title: 'Le Convoi de l’Ombre',
        client: 'Cellule de la Résistance',
        difficulty: 2,
        estimatedMinutes: 35,
        tags: ['Escorte', 'Terres Dévastées'],
        coverImage: gameAssets.accueilTwo,
        description: 'Escortez un prototype volé à travers les Terres Dévastées. Un intercepteur de la NeoForge suit déjà sa balise.',
        objectives: [
            { id: 'obj_1', description: 'Rejoindre le point de rendez-vous du convoi.', status: 'completed' },
            { id: 'obj_2', description: 'Repousser l’intercepteur de la NeoForge.', status: 'pending' },
            { id: 'obj_3', description: 'Désactiver la balise du prototype.', status: 'pending' }
        ],
        briefing: makeBriefing(
            'Le convoi est immobilisé à la lisière des Terres Dévastées. Vous arrivez juste à temps.',
            'Un éclaireur mécanique remonte la piste. Neutralisez-le, puis coupez la balise du prototype pour brouiller sa trace.'
        ),
        debrief: makeDebrief(
            'La balise s’éteint. Le prototype et son équipage peuvent enfin quitter les Terres Dévastées sans être suivis.',
            'CONVOI DE L’OMBRE // EXTRACTION CONFIRMÉE // ROUTE SÉCURISÉE'
        ),
        campaignCompletionFlag: 'prototype-secured',
        campaignBriefings: [
            { requiresFlag: 'blackout-complete', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Les journaux du Secteur 7 ont révélé la route du convoi. Vous savez où couper la balise.' } },
            { requiresFlag: 'blackout-clean-entry', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Votre approche discrète a laissé une porte ouverte dans le réseau NeoForge. L’équipe peut se déployer sans être repérée.' } },
            { requiresFlag: 'blackout-alarm-raised', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'L’alarme déclenchée au Secteur 7 a renforcé la surveillance du convoi. Attendez-vous à une interception.' } },
            { requiresFlag: 'network-logs-cleared', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Les journaux ont été effacés à distance. La NeoForge n’a pas encore identifié votre équipe.' } },
            { requiresFlag: 'network-trace-spotted', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Le pare-feu a signalé votre intrusion. Les patrouilles ont reçu l’ordre de vous intercepter.' } },
            { requiresFlag: 'drone-core-siphoned', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La cellule récupérée sur le drone alimente nos brouilleurs. Le convoi devrait traverser sans être suivi.' } },
            { requiresFlag: 'drone-core-overloaded', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La surcharge du noyau a laissé une signature énergétique. L’intercepteur a retrouvé la piste du convoi.' } },
            { requiresFlag: 'drone-signal-captured', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La transmission récupérée vous donne la route des patrouilles. Vous pouvez guider le convoi hors de leur portée.' } },
            { requiresFlag: 'drone-signal-lost', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La transmission du drone est perdue. Le convoi progresse sans savoir où se trouvent les patrouilles.' } },
        ],
        campaignOpponents: [
            {
                requiresFlags: ['blackout-alarm-raised', 'network-trace-spotted', 'drone-core-overloaded'],
                opponent: { ...makeOpponent('enemy-convoy-alert-scout', 'Éclaireur d’alerte', 26, { x: 17, y: 4 }), objectiveId: undefined },
            },
        ],
        scenes: [
            {
                id: 'convoy-beacon-aftermath',
                afterObjectiveId: 'obj_2',
                node: {
                    speaker: 'HQ_VOLKOV',
                    avatar: gameAssets.drElena,
                    text: 'L’intercepteur ne vous suit plus, mais la balise du prototype vient d’émettre un dernier burst. Coupez sa trace avant que la NeoForge ne localise l’extraction.',
                    choices: [
                        {
                            id: 'convoy-shadow-route',
                            label: 'Guider le convoi par la route aveugle',
                            description: 'Test de Survie. Une réussite identifie un passage sans signal et neutralise la balise.',
                            check: { skillId: 'survival', difficulty: 15 },
                            successText: 'Vous reconnaissez un couloir que les relevés NeoForge ignorent. Le convoi atteint l’extraction et la balise est coupée sur place.',
                            failureText: 'Le sol cède sur la route choisie. Le convoi reste bloqué pendant qu’un relais de poursuite verrouille la balise.',
                            successFlag: 'convoy-route-charted',
                            failureFlag: 'convoy-route-exposed',
                            successEffect: { type: 'complete-objective', objectiveId: 'obj_3' },
                            failureEffect: {
                                type: 'add-objective',
                                objective: { id: 'obj_4', description: 'Neutraliser le relais de poursuite avant l’extraction.', status: 'pending' },
                                opponentId: 'enemy-convoy-pursuer',
                            },
                        },
                        {
                            id: 'convoy-spoof-beacon',
                            label: 'Usurper le signal de la balise',
                            description: 'Test de Piratage. Une réussite efface la position du prototype dans le réseau NeoForge.',
                            check: { skillId: 'hacking', difficulty: 15 },
                            successText: 'Vous remplacez la position réelle par un leurre mobile. La balise se tait et le prototype franchit la zone.',
                            failureText: 'La NeoForge rejette l’usurpation et renvoie une signature de localisation. Un relais de poursuite s’active près du convoi.',
                            successFlag: 'beacon-signal-spoofed',
                            failureFlag: 'beacon-signal-rejected',
                            successEffect: { type: 'complete-objective', objectiveId: 'obj_3' },
                            failureEffect: {
                                type: 'add-objective',
                                objective: { id: 'obj_4', description: 'Détruire le relais qui guide la chasse NeoForge.', status: 'pending' },
                                opponentId: 'enemy-convoy-pursuer',
                            },
                        },
                    ],
                },
            },
        ],
        reserveOpposition: [
            { ...makeOpponent('enemy-convoy-pursuer', 'Relais de poursuite', 28, { x: 17, y: 8 }), objectiveId: 'obj_4' },
        ],
        opposition: [makeOpponent('enemy-convoy-interceptor', 'Intercepteur NeoForge', 30, { x: 15, y: 7 })],
        terminal: { id: 'CONVOY_BEACON', name: 'Balise du prototype', position: { x: 18, y: 6 }, objectiveId: 'obj_3' }
    },
    {
        id: 'profond',
        title: 'Les Profondeurs du Secteur 7',
        client: 'Dr. Elena Volkov · Résistance',
        difficulty: 3,
        estimatedMinutes: 45,
        tags: ['Enquête', 'Secteur 7'],
        coverImage: gameAssets.voidborn,
        description: 'Enquêtez sur une disparition dans les niveaux inférieurs de la ruche et récupérez le dernier signal de l’équipe.',
        objectives: [
            { id: 'obj_1', description: 'Descendre dans les niveaux inférieurs de la ruche.', status: 'completed' },
            { id: 'obj_2', description: 'Écarter le drone de fouille qui bloque le passage.', status: 'pending' },
            { id: 'obj_3', description: 'Extraire les données du relais abandonné.', status: 'pending' }
        ],
        briefing: makeBriefing(
            'Une équipe de reconnaissance a disparu dans les niveaux inférieurs. Son dernier signal vient de réapparaître.',
            'Un drone de fouille garde le relais. Sécurisez la zone et récupérez les données avant que le signal ne s’éteigne.'
        ),
        debrief: makeDebrief(
            'Le relais contient les dernières minutes de l’équipe disparue. Une voix inconnue apparaît dans le signal, puis la transmission s’interrompt.',
            'SECTEUR 7 // DONNÉES EXTRAITES // NOUVELLE PISTE AJOUTÉE AUX ARCHIVES'
        ),
        campaignCompletionFlag: 'relay-recovered',
        campaignBriefings: [
            { requiresFlag: 'prototype-secured', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Le prototype récupéré sert de leurre. Il masque votre descente dans les profondeurs.' } },
            { requiresFlag: 'blackout-clean-entry', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La méthode furtive du Secteur 7 vous a appris à contourner les sentinelles de cette ruche.' } },
            { requiresFlag: 'blackout-alarm-raised', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Après l’alarme du Secteur 7, la NeoForge a dépêché un drone de fouille sur le relais.' } },
            { requiresFlag: 'network-logs-cleared', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Les journaux effacés ont retardé la réponse NeoForge. Vous gardez une longueur d’avance au relais.' } },
            { requiresFlag: 'network-trace-spotted', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La NeoForge connaît votre signature. Un drone de fouille vous attend déjà au relais.' } },
            { requiresFlag: 'drone-core-siphoned', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La cellule du drone stabilise votre équipement. Elle vous aidera à traverser les niveaux contaminés.' } },
            { requiresFlag: 'drone-core-overloaded', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Le noyau endommagé a déclenché une alerte. Un drone de fouille vous attend au relais.' } },
            { requiresFlag: 'drone-signal-captured', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'La dernière transmission révèle un second signal sous le relais. C’est votre meilleure piste pour retrouver l’équipe.' } },
            { requiresFlag: 'drone-signal-lost', node: { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: 'Sans la dernière transmission du drone, l’origine du signal du relais reste inconnue.' } },
        ],
        campaignOpponents: [
            {
                requiresFlags: ['blackout-alarm-raised', 'network-trace-spotted', 'drone-core-overloaded'],
                opponent: { ...makeOpponent('sector-alert-hunter', 'Chasseur de signature', 34, { x: 16, y: 4 }), objectiveId: undefined },
            },
        ],
        scenes: [
            {
                id: 'depths-drone-aftermath',
                afterObjectiveId: 'obj_2',
                node: {
                    speaker: 'HQ_VOLKOV',
                    avatar: gameAssets.drElena,
                    text: 'Le drone de fouille est hors circuit. Son capteur conserve toutefois un fragment du signal manquant. Décidez comment rejoindre le relais.',
                    choices: [
                        {
                            id: 'depths-trace-signal',
                            label: 'Suivre la trajectoire du signal manquant',
                            description: 'Test de Perception. Une réussite stabilise le fragment et permet d’extraire les données.',
                            check: { skillId: 'perception', difficulty: 15 },
                            successText: 'Vous isolez la cadence du signal et l’alignez sur le relais. Les données de l’équipe sont extraites sans exposer la descente.',
                            failureText: 'Le fragment se superpose à plusieurs échos. Une unité de relève matérialise le corridor avant que vous puissiez extraire les données.',
                            successFlag: 'depths-signal-traced',
                            failureFlag: 'depths-signal-scattered',
                            successEffect: { type: 'complete-objective', objectiveId: 'obj_3' },
                            failureEffect: {
                                type: 'add-objective',
                                objective: { id: 'obj_4', description: 'Neutraliser l’unité de relève avant l’extraction.', status: 'pending' },
                                opponentId: 'enemy-sector-echo',
                            },
                        },
                        {
                            id: 'depths-stabilize-relay',
                            label: 'Stabiliser le relais à distance',
                            description: 'Test de Mécanique. Une réussite rétablit l’extraction avant que la zone ne se verrouille.',
                            check: { skillId: 'mechanics', difficulty: 15 },
                            successText: 'Vous rééquilibrez les capacitances du relais. Le signal est intégralement extrait pendant que l’équipe sécurise le corridor.',
                            failureText: 'La stabilisation provoque une alerte de proximité. Une unité de relève sort de l’ombre pendant que les données restent verrouillées.',
                            successFlag: 'relay-stabilized',
                            failureFlag: 'relay-alerted',
                            successEffect: { type: 'complete-objective', objectiveId: 'obj_3' },
                            failureEffect: {
                                type: 'add-objective',
                                objective: { id: 'obj_4', description: 'Éliminer la sentinelle avant de reprendre l’extraction.', status: 'pending' },
                                opponentId: 'enemy-sector-echo',
                            },
                        },
                    ],
                },
            },
        ],
        reserveOpposition: [
            { ...makeOpponent('enemy-sector-echo', 'Écho de fouille', 38, { x: 13, y: 7 }), objectiveId: 'obj_4' },
        ],
        opposition: [makeOpponent('enemy-sector-drone', 'Drone de fouille', 42, { x: 11, y: 6 })],
        terminal: { id: 'SECTOR_RELAY', name: 'Relais abandonné', position: { x: 14, y: 7 }, objectiveId: 'obj_3' }
    }
];
import { gameAssets } from './assets';

/**
 * Traduit un drapeau technique de campagne en consequence lisible pour le joueur,
 * en reutilisant le texte de briefing deja ecrit pour chaque mission.
 */
export const describeCampaignFlag = (flag: string | null | undefined): string | null => {
    if (!flag) return null;
    for (const mission of MISSIONS) {
        const briefing = mission.campaignBriefings?.find((entry) => entry.requiresFlag === flag);
        if (briefing) return briefing.node.text;
    }
    return null;
};
