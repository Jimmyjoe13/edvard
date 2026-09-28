import { ARMORS, SKILLS, WEAPONS } from './gameData';
import { GAME_RULES, CharacterStats } from './rules';

export interface AttackProfile {
  weapon: typeof WEAPONS[number];
  skill: typeof SKILLS[number];
  attributeId: keyof CharacterStats;
  attributeValue: number;
  skillBonus: number;
}

export function getAttackProfile(
  stats: CharacterStats,
  knownSkills: string[],
  weaponId: string,
): AttackProfile | null {
  const weapon = WEAPONS.find((item) => item.id === weaponId);
  if (!weapon) return null;
  const skillId = GAME_RULES.combat.weaponSkills[weapon.type];
  const skill = SKILLS.find((item) => item.id === skillId);
  if (!skill) return null;

  return {
    weapon,
    skill,
    attributeId: skill.stat,
    attributeValue: stats[skill.stat],
    skillBonus: knownSkills.includes(skill.id) ? GAME_RULES.resolution.synergyBonus : 0,
  };
}

export function getDefenseScore(stats: CharacterStats, armorId: string | null): number {
  const armor = ARMORS.find((item) => item.id === armorId);
  return GAME_RULES.combat.baseDefense + stats.agilite + (armor?.defense || 0);
}

export function getArmorReduction(armorId: string | null): number {
  return ARMORS.find((item) => item.id === armorId)?.defense || 0;
}

export function rollWeaponDamage(formula: string, random = Math.random): { dice: number[]; total: number } {
  const match = /^(\d+)d(\d+)$/i.exec(formula);
  if (!match) return { dice: [1], total: 1 };

  const count = Number(match[1]);
  const sides = Number(match[2]);
  const dice = Array.from({ length: count }, () => Math.floor(random() * sides) + 1);
  return { dice, total: dice.reduce((sum, value) => sum + value, 0) };
}
