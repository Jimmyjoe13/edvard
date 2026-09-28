import { gameAssets } from './assets';

export interface CompanionProfile {
  id: string;
  name: string;
  role: string;
  origin: string;
  description: string;
  tactic: 'advance' | 'skirmish' | 'guard';
  avatar: string;
  hp: number;
  flux: number;
  stats: { force: number; agilite: number; constitution: number; intelligence: number; sagesse: number; charisme: number };
  weaponId: string;
  armorId: string | null;
  skills: string[];
}

// Archétypes tactiques pour la première table solo. Leurs noms et comportements
// restent éditables lors de la validation du contenu avec des tables de test.
export const AI_COMPANIONS: CompanionProfile[] = [
  {
    id: 'companion-vanguard', name: 'Vigie', role: 'Avant-garde', origin: 'Néo-Forgé',
    description: 'Va au contact et maintient la pression sur la menace la plus proche.',
    tactic: 'advance', avatar: gameAssets.neoForgeAvatar, hp: 42, flux: 12,
    stats: { force: 14, agilite: 11, constitution: 13, intelligence: 8, sagesse: 9, charisme: 6 },
    weaponId: 'shock-baton', armorId: 'riot-gear', skills: ['athletics', 'intimidation']
  },
  {
    id: 'companion-scout', name: 'Éclaireuse', role: 'Reconnaissance', origin: 'Sylvaïn',
    description: 'Repère les angles d’approche et frappe les cibles accessibles.',
    tactic: 'skirmish', avatar: gameAssets.humanPortrait, hp: 34, flux: 16,
    stats: { force: 8, agilite: 15, constitution: 9, intelligence: 11, sagesse: 13, charisme: 9 },
    weaponId: 'assault-rifle', armorId: 'light-kevlar', skills: ['perception', 'stealth', 'firearms']
  },
  {
    id: 'companion-analyst', name: 'Analyste', role: 'Appui technique', origin: 'Humain',
    description: 'Reste près du groupe et prend en charge les menaces liées aux systèmes.',
    tactic: 'guard', avatar: gameAssets.voidborn, hp: 36, flux: 22,
    stats: { force: 8, agilite: 10, constitution: 10, intelligence: 15, sagesse: 12, charisme: 10 },
    weaponId: 'laser-pistol', armorId: 'nano-suit', skills: ['hacking', 'mechanics', 'firearms']
  }
];
