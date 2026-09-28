import { gameAssets } from './assets';
import { SKILLS, WEAPONS, ARMORS } from './gameData';
import { ATTRIBUTES, CHARACTER_CREATION, ORIGINS, CharacterStats } from './rules';
import { SharedCharacterRecord } from './characterStorage';
import type { Character } from '../store/gameStore';

const baseStats = (): CharacterStats => Object.fromEntries(
  ATTRIBUTES.map(({ id }) => [id, CHARACTER_CREATION.minimumAttribute]),
) as CharacterStats;

export function createCharacterFromRecord(record: Partial<SharedCharacterRecord>, id = 'player-1'): Character {
  const stats = baseStats();
  Object.entries(record.baseStats || {}).forEach(([attribute, value]) => {
    if (typeof value === 'number' && attribute in stats) stats[attribute as keyof CharacterStats] = value;
  });

  const origin = ORIGINS.find((item) => item.id === record.originId);
  Object.entries(origin?.bonus || {}).forEach(([attribute, value]) => {
    if (typeof value === 'number') stats[attribute as keyof CharacterStats] += value;
  });
  (record.flexibleBonusStats || []).forEach((attribute) => { stats[attribute] += 1; });

  const skillIds = (record.skillIds || ['athletics']).filter((skillId) => SKILLS.some((skill) => skill.id === skillId));
  const equipmentIds = (record.equipmentIds || ['assault-rifle', 'light-kevlar']).filter((equipmentId) => (
    WEAPONS.some((weapon) => weapon.id === equipmentId) || ARMORS.some((armor) => armor.id === equipmentId)
  ));
  const constitution = stats.constitution;
  const intelligence = stats.intelligence;
  const agility = stats.agilite;
  const maxHp = Math.max(1, 50 + (constitution - 10) * 2);
  const maxFlux = Math.max(1, 20 + (intelligence - 10) * 2);
  const maxMp = Math.max(1, 6 + Math.floor((agility - 10) / 2));

  return {
    id,
    name: (record.name || record.lore?.name || 'Personnage').trim().toUpperCase(),
    avatar: record.originId === 'neo-forge' ? gameAssets.neoForgeAvatar : record.originId === 'ether-born' ? gameAssets.voidborn : gameAssets.humanAvatar,
    level: 1, xp: 0, nextLevelXp: 100,
    hp: maxHp, maxHp, flux: maxFlux, maxFlux, ap: 1, maxAp: 1, mp: maxMp, maxMp,
    isAI: false, faction: 'party', race: origin?.name || record.originId || undefined,
    specializationId: record.specializationId || null,
    stats,
    inventory: equipmentIds,
    equippedWeaponId: equipmentIds.find((equipmentId) => WEAPONS.some((weapon) => weapon.id === equipmentId)) || null,
    equippedArmorId: equipmentIds.find((equipmentId) => ARMORS.some((armor) => armor.id === equipmentId)) || null,
    skills: skillIds.length ? skillIds : ['athletics'],
    position: { x: 5, y: 15 }, statuses: [], neuroCredits: 0, unlockedImplants: []
  };
}
