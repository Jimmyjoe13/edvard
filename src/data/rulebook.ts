import { GAME_RULES, RuleCategory, RuleEntry } from './rules';

export type { RuleCategory, RuleEntry };

export const RULE_DIFFICULTIES = GAME_RULES.resolution.difficulties;
export const RULE_ENTRIES: RuleEntry[] = GAME_RULES.rulebook;
