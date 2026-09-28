export interface LoreEntry {
    id: string;
    title: string;
    category: 'factions' | 'lieux' | 'flux' | 'histoire';
    content: string;
    image?: string;
}

export const LORE_DATABASE: LoreEntry[] = [
    {
        id: 'neo-paris',
        title: 'Néo-Paris',
        category: 'lieux',
        content: 'Ancienne capitale transformée en mégalopole technologique sous dôme climatique. Cœur névralgique de la résistance et des corporations.',
        image: gameAssets.accueilOne
    },
    {
        id: 'les-flux',
        title: 'Le Flux Éthéré',
        category: 'flux',
        content: 'Une énergie mystique découverte après le Grand Effondrement. Elle permet de manipuler la réalité mais consume l\'intégrité physique de ceux qui ne sont pas protégés.',
        image: gameAssets.voidborn
    },
    {
        id: 'neoforge',
        title: 'La NeoForge',
        category: 'factions',
        content: 'Conglomérat industriel spécialisé dans l\'augmentation cybernétique. Ils croient que l\'humanité doit fusionner avec la machine pour survivre.',
        image: gameAssets.neoForgeAvatar
    }
];

export const SCENARIOS = [
    {
        id: 'convoi',
        title: 'Le Convoi de l\'Ombre',
        difficulty: 'Moyen',
        desc: 'Escortez un prototype volé à travers les Terres Dévastées.'
    },
    {
        id: 'profond',
        title: 'Les Profondeurs de Secteur 7',
        difficulty: 'Difficile',
        desc: 'Enquêtez sur une disparition dans les niveaux inférieurs de la ruche.'
    }
];
import { gameAssets } from './assets';
