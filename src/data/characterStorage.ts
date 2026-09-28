import { AttributeId, CharacterStats } from './rules';

export interface SharedCharacterRecord {
  schemaVersion: 1;
  name: string;
  originId: string | null;
  baseStats: Partial<CharacterStats>;
  flexibleBonusStats: AttributeId[];
  specializationId: string | null;
  skillIds: string[];
  equipmentIds: string[];
  lore: { name: string; age: string; origin: string; background: string; appearance: string };
  updatedAt: string;
}

interface SharedCharacterStorage {
  key: string;
  read: () => SharedCharacterRecord | null;
  readLegacyState: () => Record<string, unknown> | null;
  write: (record: Partial<SharedCharacterRecord> & Record<string, unknown>) => SharedCharacterRecord | null;
}

export const characterStorage = window.EdvardCharacterStorage as SharedCharacterStorage;
