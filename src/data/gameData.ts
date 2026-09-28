import { GAME_RULES } from './rules';

export type Skill = typeof GAME_RULES.skills[number];
export type Weapon = typeof GAME_RULES.equipment.weapons[number];
export type Armor = typeof GAME_RULES.equipment.armors[number];

export const SKILLS: Skill[] = GAME_RULES.skills;
export const WEAPONS: Weapon[] = GAME_RULES.equipment.weapons;
export const ARMORS: Armor[] = GAME_RULES.equipment.armors;
