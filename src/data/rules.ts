import '../../js/shared-rules.js';
import '../../js/character-storage.js';

export type AttributeId = 'force' | 'agilite' | 'constitution' | 'intelligence' | 'sagesse' | 'charisme';
export type CharacterStats = Record<AttributeId, number>;
export type RuleCategory = 'Tests' | 'Combat' | 'Équipement' | 'Progression';

export interface AttributeDefinition {
  id: AttributeId;
  label: string;
}

export interface OriginDefinition {
  id: string;
  name: string;
  label: string;
  tagline: string;
  description: string;
  bonus: Partial<CharacterStats>;
  flexibleBonusCount: number;
  freeSkillBonus: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  stat: AttributeId;
  desc: string;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  type: 'melee' | 'ranged';
  dmg: string;
  prop: string;
  rangeCells: number;
  cost: number;
}

export interface ArmorDefinition {
  id: string;
  name: string;
  defense: number;
  cost: number;
  desc: string;
}

export interface RuleEntry {
  id: string;
  category: RuleCategory;
  title: string;
  summary: string;
  details: string[];
}

export interface GameRules {
  version: number;
  attributes: AttributeDefinition[];
  characterCreation: {
    minimumAttribute: number;
    maximumAttribute: number;
    initialAttributePoints: number;
    pointCosts: Record<number, number>;
    baseSkillPoints: number;
  };
  origins: OriginDefinition[];
  skills: SkillDefinition[];
  specializations: { id: string; name: string; skills: string[] }[];
  equipment: {
    weapons: WeaponDefinition[];
    armors: ArmorDefinition[];
    startingKits: Record<string, { weapon: string; armor: string }>;
  };
  combat: {
    baseDefense: number;
    weaponSkills: Record<'melee' | 'ranged', string>;
    criticalDamageMultiplier: number;
  };
  resolution: {
    diceCount: number;
    dieSides: number;
    advantageDiceCount: number;
    keptDiceCount: number;
    synergyBonus: number;
    difficulties: { label: string; value: number }[];
  };
  rulebook: RuleEntry[];
}

export const GAME_RULES = window.EdvardRules as GameRules;
export const ATTRIBUTES = GAME_RULES.attributes;
export const CHARACTER_CREATION = GAME_RULES.characterCreation;
export const ORIGINS = GAME_RULES.origins;

export function getAttributePointCost(value: number): number {
  return CHARACTER_CREATION.pointCosts[value] ?? Number.POSITIVE_INFINITY;
}

export function getTotalAttributePointCost(stats: CharacterStats): number {
  return Object.values(stats).reduce((total, value) => total + getAttributePointCost(value), 0);
}

export function rollD10Pool(mode: 'normal' | 'advantage' | 'disadvantage' = 'normal', random = Math.random) {
  const { diceCount, dieSides, advantageDiceCount, keptDiceCount } = GAME_RULES.resolution;
  const count = mode === 'normal' ? diceCount : advantageDiceCount;
  const rolled = Array.from({ length: count }, () => Math.floor(random() * dieSides) + 1);
  const sortedIndices = rolled.map((_value, index) => index).sort((a, b) => (
    mode === 'advantage' ? rolled[b] - rolled[a] : rolled[a] - rolled[b]
  ));
  const keptIndices = mode === 'normal' ? sortedIndices : sortedIndices.slice(0, keptDiceCount);
  const kept = keptIndices.map((index) => rolled[index]);

  return {
    rolled,
    keptIndices,
    kept,
    total: kept.reduce((sum, value) => sum + value, 0),
    criticalSuccess: kept.every((value) => value === dieSides),
    criticalFailure: kept.every((value) => value === 1),
  };
}
