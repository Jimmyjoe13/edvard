import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MISSIONS, Mission, Objective, DialogueNode, MissionEffect } from '../data/missionData';
import { IMPLANTS, Implant } from '../data/implantData';
import { soundEngine } from '../utils/soundEngine';
import { gameAssets } from '../data/assets';
import { GAME_RULES, ORIGINS, rollD10Pool } from '../data/rules';
import { SKILLS, WEAPONS } from '../data/gameData';
import { getArmorReduction, getAttackProfile, getDefenseScore, rollWeaponDamage } from '../data/combatRules';
import { AI_COMPANIONS } from '../data/companionData';
import { createCharacterFromRecord } from '../data/characterFactory';
import { characterStorage } from '../data/characterStorage';

export type Race = typeof ORIGINS[number];

export interface Decal { id: string; x: number; y: number; type: 'scorch' | 'blood'; }
export interface Obstacle { id: string; position: { x: number; y: number }; type: 'light' | 'heavy'; }
export interface FloatingText { id: string; x: number; y: number; content: string; type: 'damage' | 'miss' | 'crit' | 'info' | 'xp'; }

export interface InteractiveObject {
    id: string;
    name: string;
    position: { x: number; y: number };
    type: 'terminal' | 'door' | 'crate';
    isLocked: boolean;
    objectiveId?: string;
}

export interface WeatherEffect {
    id: string;
    name: string;
    desc: string;
    color: string;
}

export interface Character {
  id: string; name: string; avatar: string; level: number; xp: number; nextLevelXp: number;
  hp: number; maxHp: number; flux: number; maxFlux: number; ap: number; maxAp: number; mp: number; maxMp: number;
  isAI: boolean; race?: string;
  faction?: 'party' | 'opposition';
  tactic?: 'advance' | 'skirmish' | 'guard';
  objectiveId?: string;
  specializationId?: string | null;
  stats: { force: number; agilite: number; constitution: number; intelligence: number; sagesse: number; charisme: number; };
  inventory: string[]; equippedWeaponId: string | null; equippedArmorId: string | null;
  skills: string[]; position: { x: number; y: number };
  statuses: { id: string; label: string; type: 'buff' | 'debuff' }[];
  neuroCredits: number;
  unlockedImplants: string[];
}

export interface GameTable {
  id: string;
  name: string;
  status: 'setup' | 'playing';
  setupStep: 'character' | 'companions' | 'scenario';
  companionIds: string[];
  scenarioId: string | null;
  createdAt: string;
  completedMissionIds: string[];
  campaignFlags: string[];
  lastChoice: {
    missionId: string;
    choiceId: string;
    label: string;
    succeeded: boolean;
    outcome: string;
  } | null;
}

interface GameState {
  characters: Character[];
  obstacles: Obstacle[];
  interactiveObjects: InteractiveObject[];
  decals: Decal[];
  zoom: number;
  diceResult: { value: number; label: string; sides: number; dice?: number[]; isCrit?: boolean; formula?: string; difficulty?: number; outcome?: string } | null;
  logs: string[];
  selectedTokenId: string | null;
  targetTokenId: string | null;
  turnOrder: string[];
  currentTurnIndex: number;
  isAITurnProcessing: boolean;
  floatingTexts: FloatingText[];
  archiveOpen: boolean;
  inventoryOpen: boolean;
  creationMode: boolean;
  fogEnabled: boolean;
  discoveredCells: Set<string>;
  victory: boolean;
  defeat: boolean;
  activeMission: Mission | null;
  dialogueQueue: DialogueNode[];
  hackingActive: boolean;
  hackingTargetId: string | null;
  weather: WeatherEffect | null;
  table: GameTable | null;

  // Actions
  setZoom: (zoom: number) => void;
  rollCheck: (label?: string, modifier?: number) => number;
  performAttack: (attackerId: string, targetId: string, weaponId: string) => void;
  takeDamage: (id: string, amount: number, isCrit?: boolean) => void;
  moveCharacter: (id: string, x: number, y: number) => void;
  gainXp: (id: string, amount: number) => void;
  installImplant: (charId: string, implantId: string) => void;
  equipItem: (charId: string, itemId: string, itemType: 'weapon' | 'armor') => void;
  interact: (charId: string, objId: string) => void;
  startHacking: (id: string) => void;
  completeHacking: (success: boolean) => void;
  setSelectedToken: (id: string | null) => void;
  setTargetToken: (id: string | null) => void;
  setInventoryOpen: (open: boolean) => void;
  setArchiveOpen: (open: boolean) => void;
  setCreationMode: (open: boolean) => void;
  finalizeCharacter: (char: Character) => void;
  createTable: (name: string) => void;
  chooseSavedCharacter: () => void;
  setTableSetupStep: (step: GameTable['setupStep']) => void;
  setTableCompanions: (companionIds: string[]) => void;
  selectTableScenario: (scenarioId: string) => void;
  startTableGame: () => void;
  returnToTableSetup: () => void;
  toggleFog: () => void;
  startCombat: () => void;
  nextTurn: () => void;
  executeAITurn: (id: string) => Promise<void>;
  addLog: (msg: string) => void;
  processCommand: (cmd: string) => void;
  startMission: (missionId: string) => void;
  completeObjective: (objId: string) => void;
  advanceDialogue: () => void;
  resolveDialogueChoice: (choiceId: string) => void;
  activateAbility: (charId: string, abilityId: string) => void;
  addFloatingText: (x: number, y: number, content: string, type: FloatingText['type']) => void;
  addDecal: (x: number, y: number, type: Decal['type']) => void;
}

type PersistedGameState = Pick<GameState,
  | 'characters'
  | 'obstacles'
  | 'interactiveObjects'
  | 'decals'
  | 'zoom'
  | 'logs'
  | 'selectedTokenId'
  | 'targetTokenId'
  | 'turnOrder'
  | 'currentTurnIndex'
  | 'fogEnabled'
  | 'discoveredCells'
  | 'victory'
  | 'defeat'
  | 'activeMission'
  | 'dialogueQueue'
  | 'weather'
  | 'table'
  | 'creationMode'
>;

export const RACES: Race[] = ORIGINS;

export const WEATHERS: WeatherEffect[] = [
    { id: 'ion_storm', name: 'TEMPÊTE IONIQUE', desc: 'Surcharge les implants. Coût en Flux augmenté de 50%.', color: 'cyan' },
    { id: 'acid_fog', name: 'BROUILLARD ACIDE', desc: 'Atmosphère corrosive. Dégâts mineurs subis à chaque tour.', color: 'green' }
];

const sessionStorage = createJSONStorage<PersistedGameState>(() => localStorage, {
  replacer: (_key, value) => value instanceof Set ? { __edvardSet: true, values: [...value] } : value,
  reviver: (_key, value) => {
      if (value && typeof value === 'object' && '__edvardSet' in value && 'values' in value) {
          return new Set((value as { values: string[] }).values);
      }
      return value;
  },
});

export const useGameStore = create<GameState>()(persist<GameState, [], [], PersistedGameState>((set, get) => ({
  characters: [],
  creationMode: true,
  obstacles: [
      { id: 'o1', position: { x: 8, y: 8 }, type: 'heavy' },
      { id: 'o2', position: { x: 8, y: 9 }, type: 'heavy' },
  ],
  interactiveObjects: [
      { id: 'NODE_ALPHA_01', name: 'Terminal de Sécurité', position: { x: 14, y: 4 }, type: 'terminal', isLocked: true }
  ],
  decals: [],
  zoom: 1,
  diceResult: null,
  logs: ['[Système] Nexus Supremacy : Holotable Tactique initialisée.'],
  selectedTokenId: null,
  targetTokenId: null,
  turnOrder: [],
  currentTurnIndex: 0,
  isAITurnProcessing: false,
  floatingTexts: [],
  archiveOpen: false,
  inventoryOpen: false,
  fogEnabled: true,
  discoveredCells: new Set(),
  victory: false,
  defeat: false,
  activeMission: null,
  dialogueQueue: [],
  hackingActive: false,
  hackingTargetId: null,
  weather: null,
  table: null,

  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.5, zoom)) }),

  rollCheck: (label = "TEST", modifier = 0) => {
    soundEngine.play('dice');
    const roll = rollD10Pool();
    const val = roll.total + modifier;
    set({ diceResult: { value: val, label, sides: 10, dice: roll.rolled, isCrit: roll.criticalSuccess } });
    setTimeout(() => set({ diceResult: null }), 2500);
    return val;
  },

  performAttack: (attackerId, targetId, weaponId) => {
      const attacker = get().characters.find(c => c.id === attackerId);
      const target = get().characters.find(c => c.id === targetId);
      const factionOf = (character: Character) => character.faction || (character.isAI ? 'opposition' : 'party');
      if (!attacker || !target || attacker.hp <= 0 || target.hp <= 0 || factionOf(attacker) === factionOf(target) || attacker.ap < 1 || !get().turnOrder.length) return;
      if (get().turnOrder[get().currentTurnIndex] !== attackerId) return;
      if (attacker.isAI && !get().isAITurnProcessing) return;

      const profile = getAttackProfile(attacker.stats, attacker.skills, weaponId);
      if (!profile) return;
      const distance = Math.abs(attacker.position.x - target.position.x) + Math.abs(attacker.position.y - target.position.y);
      if (distance > profile.weapon.rangeCells) {
          get().addLog(`[Combat] ${target.name} est hors de portée de ${profile.weapon.name} (${distance}/${profile.weapon.rangeCells} cases).`);
          return;
      }
      const attackRoll = rollD10Pool();
      const defense = getDefenseScore(target.stats, target.equippedArmorId);
      const total = attackRoll.total + profile.attributeValue + profile.skillBonus;
      const hit = attackRoll.criticalSuccess || (!attackRoll.criticalFailure && total >= defense);
      const attributeName = GAME_RULES.attributes.find((attribute) => attribute.id === profile.attributeId)?.label || profile.attributeId;
      const outcome = attackRoll.criticalSuccess ? 'Réussite critique' : attackRoll.criticalFailure ? 'Échec critique' : hit ? 'Réussite' : 'Échec';

      set({
          diceResult: {
              value: total, label: profile.skill.name, sides: 10, dice: attackRoll.rolled, isCrit: attackRoll.criticalSuccess,
              formula: `2d10 (${attackRoll.rolled.join(' + ')}) + ${attributeName} ${profile.attributeValue}${profile.skillBonus ? ` + ${profile.skill.name} ${profile.skillBonus}` : ''} = ${total}`,
              difficulty: defense, outcome,
          },
      });
      window.setTimeout(() => set({ diceResult: null }), 3500);
      
      set(state => ({ characters: state.characters.map(c => c.id === attackerId ? { ...c, ap: c.ap - 1 } : c) }));

      if (hit) {
          const damageRoll = rollWeaponDamage(profile.weapon.dmg);
          const armorReduction = getArmorReduction(target.equippedArmorId);
          const critMultiplier = attackRoll.criticalSuccess ? GAME_RULES.combat.criticalDamageMultiplier : 1;
          const dmg = Math.max(1, damageRoll.total * critMultiplier - armorReduction);
          get().takeDamage(targetId, dmg, attackRoll.criticalSuccess);
          get().addDecal(target.position.x, target.position.y, 'scorch');
          soundEngine.play('hit');
          get().addLog(`[Combat] ${attacker.name} touche ${target.name} avec ${profile.weapon.name} : ${damageRoll.dice.join(' + ')}${critMultiplier > 1 ? ` × ${critMultiplier}` : ''} − ${armorReduction} armure = ${dmg} dégâts.`);
      } else {
          soundEngine.play('miss');
          get().addFloatingText(target.position.x, target.position.y, "MISS", 'miss');
          get().addLog(`[Combat] ${attacker.name} échoue : ${total} contre une Défense de ${defense}.`);
      }
  },

  takeDamage: (id, amount, isCrit = false) => {
    const char = get().characters.find(c => c.id === id);
    if (!char || char.hp <= 0) return;
    const newHp = Math.max(0, char.hp - amount);
    set(state => ({ characters: state.characters.map(c => c.id === id ? { ...c, hp: newHp } : c) }));
    get().addFloatingText(char.position.x, char.position.y, isCrit ? `CRIT! -${amount}` : `-${amount}`, isCrit ? 'crit' : 'damage');
    if (newHp <= 0) {
        if (char.faction === 'opposition') {
            get().addLog(`[Système] ${char.name} Neutralisé.`);
            get().gainXp('player-1', 50);
            if (char.objectiveId) get().completeObjective(char.objectiveId);
        }
        const protagonistIsDown = get().characters.some((character) => !character.isAI && character.hp <= 0);
        const partyIsDown = get().characters.filter((character) => (character.faction || (character.isAI ? 'opposition' : 'party')) === 'party').every((character) => character.hp <= 0);
        if (protagonistIsDown || partyIsDown) {
            set({ defeat: true, turnOrder: [], currentTurnIndex: 0 });
            get().addLog('[Mission] Équipe neutralisée. La mission peut être relancée.');
        } else if (char.faction === 'opposition' && !get().characters.some((character) => character.faction === 'opposition' && character.hp > 0)) {
            set({ turnOrder: [], currentTurnIndex: 0 });
            get().addLog('[Combat] Zone sécurisée. Reprenez l’objectif restant.');
        }
    }
  },

  gainXp: (id, amount) => {
      set(state => ({
          characters: state.characters.map(c => {
              if (c.id !== id) return c;
              let newXp = c.xp + amount;
              let newLevel = c.level;
              let newCredits = c.neuroCredits || 0;
              
              if (newXp >= c.nextLevelXp) { 
                  newLevel++; 
                  newXp -= c.nextLevelXp; 
                  newCredits += 2; // Gagné 2 Neuro-Crédits par niveau
                  get().addLog(`[Niveau] ${c.name} monte au niveau ${newLevel} ! +2 NC.`); 
                  get().addFloatingText(c.position.x, c.position.y, "LEVEL UP", 'info');
              }
              return { ...c, xp: newXp, level: newLevel, neuroCredits: newCredits };
          })
      }));
  },

  installImplant: (charId, implantId) => {
      const implant = IMPLANTS.find(i => i.id === implantId);
      if (!implant) return;

      set(state => ({
          characters: state.characters.map(c => {
              if (c.id !== charId) return c;
              if (c.neuroCredits < implant.cost) {
                  get().addLog(`[Erreur] Fonds insuffisants pour ${implant.name}.`);
                  return c;
              }
              
              const newChar = { 
                  ...c, 
                  neuroCredits: c.neuroCredits - implant.cost,
                  unlockedImplants: [...c.unlockedImplants, implantId]
              };

              // Appliquer les effets
              if (implant.effect.type === 'stat_boost' && implant.effect.target) {
                  (newChar.stats as any)[implant.effect.target] += implant.effect.value || 0;
              } else if (implant.effect.type === 'passive' && implant.effect.target) {
                  (newChar as any)[implant.effect.target] += implant.effect.value || 0;
                  // Si on augmente les max, on remplit l'actuel aussi
                  if (implant.effect.target === 'maxHp') newChar.hp += implant.effect.value || 0;
                  if (implant.effect.target === 'maxMp') newChar.mp += implant.effect.value || 0;
                  if (implant.effect.target === 'maxAp') newChar.ap += implant.effect.value || 0;
              }
              
              get().addLog(`[Cyber] ${c.name} a installé : ${implant.name}`);
              return newChar;
          })
      }));
      soundEngine.play('hacking'); // Reuse hacking sound for tech-install vibe
  },

  equipItem: (charId, itemId, itemType) => {
      set(state => ({
          characters: state.characters.map(character => {
              if (character.id !== charId) return character;
              if (itemType === 'weapon') {
                  return { ...character, equippedWeaponId: character.equippedWeaponId === itemId ? null : itemId };
              }
              return { ...character, equippedArmorId: character.equippedArmorId === itemId ? null : itemId };
          })
      }));
  },

  moveCharacter: (id, x, y) => {
    const char = get().characters.find(c => c.id === id);
    if (!char || char.hp <= 0 || get().dialogueQueue.length > 0 || (char.isAI && !get().isAITurnProcessing) || (get().turnOrder.length > 0 && get().turnOrder[get().currentTurnIndex] !== id) || get().obstacles.some(o => o.position.x === x && o.position.y === y)) return;
    const dist = Math.abs(char.position.x - x) + Math.abs(char.position.y - y);
    if (get().turnOrder.length > 0 && char.mp < dist) return;
    
    set(state => ({ 
        characters: state.characters.map(c => c.id === id ? { ...c, position: { x, y }, mp: state.turnOrder.length > 0 ? c.mp - dist : c.mp } : c),
        discoveredCells: id === 'player-1' ? new Set([...state.discoveredCells, `${x},${y}`, `${x+1},${y}`, `${x-1},${y}`, `${x},${y+1}`, `${x},${y-1}`]) : state.discoveredCells
    }));

    // Check interaction range
    get().interactiveObjects.forEach(obj => {
        const d = Math.abs(x - obj.position.x) + Math.abs(y - obj.position.y);
        if (d <= 1 && obj.isLocked && id === 'player-1') {
            get().addLog(`[Système] Proximité ${obj.name} détectée. Interaction disponible.`);
        }
    });
  },

  interact: (charId, objId) => {
      if (get().dialogueQueue.length > 0) return;
      const char = get().characters.find(c => c.id === charId);
      const obj = get().interactiveObjects.find(o => o.id === objId);
      if (!char || char.hp <= 0 || !obj) return;
      if (get().turnOrder.length > 0 && get().turnOrder[get().currentTurnIndex] !== charId) return;

      const dist = Math.abs(char.position.x - obj.position.x) + Math.abs(char.position.y - obj.position.y);
      if (dist > 1) {
          get().addLog("[Système] Trop loin pour interagir.");
          return;
      }

      if (obj.type === 'terminal' && obj.isLocked) {
          get().startHacking(obj.id);
      }
  },

  startHacking: (id) => {
      soundEngine.play('hacking');
      set({ hackingActive: true, hackingTargetId: id });
  },

  completeHacking: (success) => {
      const targetId = get().hackingTargetId;
      set({ hackingActive: false, hackingTargetId: null });
      
      if (success && targetId) {
          soundEngine.play('victory');
          get().addLog(`[Hacking] Succès ! Terminal ${targetId} déverrouillé.`);
          set(state => ({
              interactiveObjects: state.interactiveObjects.map(o => o.id === targetId ? { ...o, isLocked: false } : o)
          }));
          const objectiveId = get().interactiveObjects.find((object) => object.id === targetId)?.objectiveId;
          if (objectiveId) get().completeObjective(objectiveId);
      } else {
          get().addLog("[Hacking] Échec de l'intrusion.");
      }
  },

  activateAbility: (charId, abilityId) => {
      set(state => ({
          characters: state.characters.map(c => {
              if (c.id !== charId) return c;
              
              let cost = RACE_ABILITIES[c.race?.toUpperCase() || '']?.find((ability: { id: string; cost: number }) => ability.id === abilityId)?.cost || 0;
              if (state.weather?.id === 'ion_storm') cost = Math.floor(cost * 1.5);

              if (c.flux < cost) return c;

              if (abilityId === 'adrenaline') {
                  return { ...c, ap: c.ap + 1, flux: c.flux - cost };
              }
              if (abilityId === 'regrowth') {
                  get().addFloatingText(c.position.x, c.position.y, "+15 PV", 'info');
                  return { ...c, hp: Math.min(c.maxHp, c.hp + 15), flux: c.flux - cost };
              }
              if (abilityId === 'fortify') {
                  return { ...c, flux: c.flux - cost, statuses: [...c.statuses, { id: 'fortified', label: 'BLINDAGE', type: 'buff' }] };
              }
              if (abilityId === 'overclock') {
                  return { ...c, mp: c.mp + 4, flux: c.flux - cost };
              }
              return c;
          })
      }));
      soundEngine.play('click');
  },

  addDecal: (x, y, type) => {
      const id = Math.random().toString();
      set(state => ({ decals: [...state.decals, { id, x, y, type }] }));
  },

  addFloatingText: (x, y, content, type) => {
    const id = Math.random().toString();
    set(state => ({ floatingTexts: [...state.floatingTexts, { id, x, y, content, type }] }));
    setTimeout(() => set(state => ({ floatingTexts: state.floatingTexts.filter(t => t.id !== id) })), 2000);
  },

  startCombat: () => {
    const state = get();
    const livingOpposition = state.characters.some((character) => (
        (character.faction || (character.isAI ? 'opposition' : 'party')) === 'opposition' && character.hp > 0
    ));
    if (state.dialogueQueue.length > 0 || !state.activeMission || !livingOpposition) return;
    const initiative = state.characters.filter((character) => character.hp > 0).map((character) => {
        const die = Math.floor(Math.random() * 10) + 1;
        return { character, die, total: die + character.stats.agilite };
    }).sort((left, right) => right.total - left.total || right.character.stats.agilite - left.character.stats.agilite);
    const order = initiative.map(({ character }) => character.id);
    const randWeather = Math.random() > 0.5 ? WEATHERS[Math.floor(Math.random() * WEATHERS.length)] : null;
    set({ turnOrder: order, currentTurnIndex: 0, victory: false, defeat: false, weather: randWeather });
    get().addLog("COMBAT_ENGAGÉ");
    initiative.forEach(({ character, die, total }) => get().addLog(`[Initiative] ${character.name} : 1d10 (${die}) + Agilité ${character.stats.agilite} = ${total}.`));
    if (randWeather) get().addLog(`[Météo] Alerte : ${randWeather.name} détectée !`);
    const firstActor = get().characters.find((character) => character.id === order[0]);
    if (firstActor?.isAI) get().executeAITurn(firstActor.id);
  },

  nextTurn: () => {
    const currentState = get();
    if (!currentState.turnOrder.length) return;
    const endingId = currentState.turnOrder[currentState.currentTurnIndex];
    if (currentState.weather?.id === 'acid_fog' && endingId) get().takeDamage(endingId, 2);
    const state = get();
    if (!state.turnOrder.length) return;
    const livingOrder = state.turnOrder.filter((id) => state.characters.some((character) => character.id === id && character.hp > 0));
    if (!livingOrder.length) {
        set({ turnOrder: [], currentTurnIndex: 0 });
        return;
    }
    const currentId = state.turnOrder[state.currentTurnIndex];
    const currentPosition = livingOrder.indexOf(currentId);
    const nextIdx = currentPosition < 0 ? 0 : (currentPosition + 1) % livingOrder.length;
    const nextCharId = livingOrder[nextIdx];
    
    const nextChar = get().characters.find(c => c.id === nextCharId);
    set({
        turnOrder: livingOrder,
        currentTurnIndex: nextIdx,
        selectedTokenId: nextChar && !nextChar.isAI ? nextChar.id : get().selectedTokenId,
        characters: get().characters.map(c => c.id === nextCharId ? { ...c, ap: c.maxAp, mp: c.maxMp } : c),
    });
    if (nextChar?.isAI) get().executeAITurn(nextCharId);
  },

  executeAITurn: async (id) => {
      set({ isAITurnProcessing: true });
      await new Promise(r => setTimeout(r, 1200));
      const ai = get().characters.find(c => c.id === id);
      const faction = ai?.faction || (ai?.isAI ? 'opposition' : 'party');
      const targets = get().characters.filter((character) => (
          character.hp > 0 && (character.faction || (character.isAI ? 'opposition' : 'party')) !== faction
      ));
      if (ai && targets.length && ai.hp > 0) {
          const player = get().characters.find((character) => !character.isAI && character.hp > 0);
          const nearestTarget = (origin: Character) => [...targets].sort((a, b) => {
              const distanceA = Math.abs(a.position.x - origin.position.x) + Math.abs(a.position.y - origin.position.y);
              const distanceB = Math.abs(b.position.x - origin.position.x) + Math.abs(b.position.y - origin.position.y);
              return distanceA - distanceB;
          })[0];
          const target = ai.tactic === 'guard' && faction === 'party' && player
              ? nearestTarget(player)
              : nearestTarget(ai);
          const dist = Math.abs(ai.position.x - target.position.x) + Math.abs(ai.position.y - target.position.y);
          const weaponId = ai.equippedWeaponId || ai.inventory[0];
          const weapon = WEAPONS.find((item) => item.id === weaponId);
          if (weaponId && weapon && dist <= weapon.rangeCells) get().performAttack(ai.id, target.id, weaponId);
          else {
              const dx = Math.sign(target.position.x - ai.position.x);
              const dy = Math.sign(target.position.y - ai.position.y);
              const firstStep = Math.abs(target.position.x - ai.position.x) >= Math.abs(target.position.y - ai.position.y)
                  ? { x: ai.position.x + dx, y: ai.position.y }
                  : { x: ai.position.x, y: ai.position.y + dy };
              const secondStep = { x: ai.position.x + dx, y: ai.position.y + dy };
              const blocked = get().obstacles.some((obstacle) => obstacle.position.x === firstStep.x && obstacle.position.y === firstStep.y);
              const step = blocked ? secondStep : firstStep;
              get().moveCharacter(ai.id, step.x, step.y);
          }
      }
      await new Promise(r => setTimeout(r, 500));
      set({ isAITurnProcessing: false });
      get().nextTurn();
  },

  setSelectedToken: (id) => set({ selectedTokenId: id }),
  setTargetToken: (id) => {
      const selected = get().characters.find((character) => character.id === get().selectedTokenId);
      const target = get().characters.find((character) => character.id === id);
      const factionOf = (character: Character) => character.faction || (character.isAI ? 'opposition' : 'party');
      if (!selected || !target || factionOf(selected) === factionOf(target)) return;
      set({ targetTokenId: get().targetTokenId === id ? null : id });
  },
  setInventoryOpen: (o) => set({ inventoryOpen: o }),
  setArchiveOpen: (o) => set({ archiveOpen: o }),
  setCreationMode: (m) => set({ creationMode: m }),
  createTable: (name) => set({
      table: {
          id: `table-${Date.now()}`,
          name: name.trim() || 'Ma première table',
          status: 'setup',
          setupStep: 'character',
          companionIds: [],
          scenarioId: null,
          createdAt: new Date().toISOString(),
          completedMissionIds: [],
          campaignFlags: [],
          lastChoice: null,
      },
      characters: [], activeMission: null, dialogueQueue: [], turnOrder: [], currentTurnIndex: 0,
      targetTokenId: null, selectedTokenId: null, obstacles: [], interactiveObjects: [], decals: [],
      discoveredCells: new Set(), creationMode: true, victory: false, defeat: false, logs: ['[Table] Nouvelle table créée.']
  }),
  chooseSavedCharacter: () => {
      const record = characterStorage.read();
      if (!record) return;
      const player = createCharacterFromRecord(record);
      set((state) => ({
          characters: [player], creationMode: false, selectedTokenId: player.id,
          table: state.table ? { ...state.table, setupStep: 'companions' } : state.table,
          discoveredCells: new Set([`${player.position.x},${player.position.y}`]),
          logs: [`[Fiche] ${player.name} rejoint la table.`]
      }));
  },
  setTableSetupStep: (setupStep) => set((state) => state.table ? { table: { ...state.table, setupStep } } : state),
  setTableCompanions: (companionIds) => set((state) => state.table ? {
      table: { ...state.table, companionIds: AI_COMPANIONS.filter((companion) => companionIds.includes(companion.id)).slice(0, 2).map((companion) => companion.id) }
  } : state),
  selectTableScenario: (scenarioId) => set((state) => (
      state.table && MISSIONS.some((mission) => mission.id === scenarioId)
          ? { table: { ...state.table, scenarioId } }
          : state
  )),
  finalizeCharacter: (char) => {
      const finalChar = { ...char, faction: 'party' as const, neuroCredits: 0, unlockedImplants: [] };
      set((state) => ({
          characters: [finalChar],
          creationMode: false,
          selectedTokenId: finalChar.id,
          targetTokenId: null,
          activeMission: null,
          dialogueQueue: [],
          turnOrder: [],
          currentTurnIndex: 0,
          obstacles: [],
          interactiveObjects: [],
          discoveredCells: new Set([`${finalChar.position.x},${finalChar.position.y}`]),
          table: state.table ? { ...state.table, setupStep: 'companions' } : state.table,
          logs: [`[Fiche] ${finalChar.name} est prêt·e. Choisissez son équipe et son aventure.`]
      }));
  },
  startTableGame: () => {
      const state = get();
      const table = state.table;
      const player = state.characters.find((character) => !character.isAI);
      const mission = MISSIONS.find((item) => item.id === table?.scenarioId);
      if (!table || !player || !mission || table.companionIds.length < 1) return;

      const companions = AI_COMPANIONS.filter((item) => table.companionIds.includes(item.id)).map((profile, index): Character => ({
          id: profile.id, name: profile.name, avatar: profile.avatar, level: 1, xp: 0, nextLevelXp: 100,
          hp: profile.hp, maxHp: profile.hp, flux: profile.flux, maxFlux: profile.flux, ap: 1, maxAp: 1, mp: 6, maxMp: 6,
          isAI: true, faction: 'party', tactic: profile.tactic, race: profile.origin,
          stats: profile.stats, inventory: [profile.weaponId, ...(profile.armorId ? [profile.armorId] : [])],
          equippedWeaponId: profile.weaponId, equippedArmorId: profile.armorId,
          skills: profile.skills, position: { x: 5 + index, y: 17 }, statuses: [], neuroCredits: 0, unlockedImplants: []
      }));
      const campaignOpponents = (mission.campaignOpponents || [])
          .filter((entry) => entry.requiresFlags.some((flag) => table.campaignFlags.includes(flag)))
          .map((entry) => entry.opponent);
      const opposition = [...mission.opposition, ...campaignOpponents].map((opponent): Character => {
          const weapon = WEAPONS.find((item) => item.id === opponent.weaponId);
          return {
              id: opponent.id, name: opponent.name, avatar: opponent.avatar, level: 1, xp: 0, nextLevelXp: 100,
              hp: opponent.hp, maxHp: opponent.hp, flux: 0, maxFlux: 0, ap: 1, maxAp: 1, mp: 6, maxMp: 6,
              isAI: true, faction: 'opposition', objectiveId: opponent.objectiveId,
              stats: opponent.stats, inventory: [opponent.weaponId], equippedWeaponId: opponent.weaponId, equippedArmorId: null,
              skills: weapon ? [GAME_RULES.combat.weaponSkills[weapon.type]] : [],
              position: opponent.position, statuses: [], neuroCredits: 0, unlockedImplants: []
          };
      });
      const campaignBriefings = (mission.campaignBriefings || [])
          .filter((briefing) => table.campaignFlags.includes(briefing.requiresFlag))
          .map((briefing) => briefing.node);
      const briefing = mission.briefing.length > 1
          ? [mission.briefing[0], ...campaignBriefings, ...mission.briefing.slice(1)]
          : [...campaignBriefings, ...mission.briefing];
      const activeMission = {
          ...mission,
          objectives: mission.objectives.map((objective) => ({ ...objective })),
          resolvedSceneIds: [],
          briefing,
      };
      set({
          table: { ...table, status: 'playing' },
          characters: [player, ...companions, ...opposition],
          activeMission,
          dialogueQueue: [...activeMission.briefing],
          obstacles: [
              { id: 'cover-west', position: { x: 8, y: 8 }, type: 'heavy' },
              { id: 'cover-east', position: { x: 8, y: 9 }, type: 'heavy' },
          ],
          interactiveObjects: [{ ...mission.terminal, type: 'terminal', isLocked: true, objectiveId: mission.terminal.objectiveId }],
          decals: [], turnOrder: [], currentTurnIndex: 0, victory: false, defeat: false, weather: null,
          selectedTokenId: player.id, targetTokenId: null, creationMode: false,
          discoveredCells: new Set([`${player.position.x},${player.position.y}`]),
          logs: [`[Table] ${table.name} · ${mission.title}`]
      });
  },
  returnToTableSetup: () => set((state) => {
      if (!state.table) return state;
      const savedPlayer = state.characters.find((character) => !character.isAI);
      const player = savedPlayer ? {
          ...savedPlayer,
          hp: savedPlayer.maxHp,
          flux: savedPlayer.maxFlux,
          ap: savedPlayer.maxAp,
          mp: savedPlayer.maxMp,
          position: { x: 5, y: 15 },
          statuses: [],
      } : undefined;
      return {
          table: { ...state.table, status: 'setup', setupStep: 'scenario' },
          characters: player ? [player] : [],
          activeMission: null, dialogueQueue: [], turnOrder: [], currentTurnIndex: 0,
          obstacles: [], interactiveObjects: [], decals: [], targetTokenId: null,
          selectedTokenId: player?.id || null, victory: false, defeat: false, weather: null,
          discoveredCells: player ? new Set([`${player.position.x},${player.position.y}`]) : new Set<string>(),
          logs: ['[Table] Choisissez la prochaine mission.'],
      };
  }),
  toggleFog: () => set(state => ({ fogEnabled: !state.fogEnabled })),
  addLog: (m) => set(state => ({ logs: [m, ...state.logs.slice(0, 49)] })),
  processCommand: (c) => {},
  
  startMission: (missionId) => {
      const mission = MISSIONS.find(m => m.id === missionId);
      if (!mission) return;
      const activeMission = {
          ...mission,
          objectives: mission.objectives.map((objective) => ({ ...objective })),
          resolvedSceneIds: [],
      };
      set({ activeMission, dialogueQueue: [...activeMission.briefing] });
  },

  completeObjective: (objId) => {
      let debrief: DialogueNode[] | null = null;
      set(state => {
          if (!state.activeMission) return state;
          const objective = state.activeMission.objectives.find((item) => item.id === objId);
          if (!objective || objective.status !== 'pending') return state;
          const updatedObjectives = state.activeMission.objectives.map(o => 
              o.id === objId ? { ...o, status: 'completed' as const } : o
          );
          const resolvedSceneIds = state.activeMission.resolvedSceneIds || [];
          const scene = state.activeMission.scenes?.find((item) => (
              item.afterObjectiveId === objId && !resolvedSceneIds.includes(item.id)
          ));
          const allDone = updatedObjectives.every(o => o.status === 'completed');
          const missionReadyToClose = allDone && !scene;
          if (missionReadyToClose) {
              debrief = [...(state.activeMission.debrief || [])];
          }
          const completedMissionIds = missionReadyToClose && state.table
              ? [...new Set([...state.table.completedMissionIds, state.activeMission.id])]
              : state.table?.completedMissionIds || [];
          const campaignFlags = missionReadyToClose && state.table && state.activeMission.campaignCompletionFlag
              ? [...new Set([...state.table.campaignFlags, state.activeMission.campaignCompletionFlag])]
              : state.table?.campaignFlags || [];
          return {
              activeMission: {
                  ...state.activeMission,
                  objectives: updatedObjectives,
                  resolvedSceneIds: scene ? [...resolvedSceneIds, scene.id] : resolvedSceneIds,
              },
              ...(scene ? { dialogueQueue: [...state.dialogueQueue, scene.node] } : {}),
              ...(state.table ? { table: { ...state.table, completedMissionIds, campaignFlags } } : {}),
          };
      });
      if (debrief !== null) {
          const debriefNodes = debrief;
          soundEngine.play('victory');
          set((state) => ({ victory: true, dialogueQueue: [...state.dialogueQueue, ...debriefNodes] }));
      }
  },

  advanceDialogue: () => set((state) => {
      const dialogueQueue = state.dialogueQueue.slice(1);
      const sceneCompletedMission = dialogueQueue.length === 0
          && !!state.activeMission
          && state.activeMission.objectives.every((objective) => objective.status === 'completed')
          && !state.victory;
      if (!sceneCompletedMission || !state.activeMission) return { dialogueQueue };
      const completedMissionIds = state.table
          ? [...new Set([...state.table.completedMissionIds, state.activeMission.id])]
          : [];
      const campaignFlags = state.table && state.activeMission.campaignCompletionFlag
          ? [...new Set([...state.table.campaignFlags, state.activeMission.campaignCompletionFlag])]
          : state.table?.campaignFlags || [];
      return {
          victory: true,
          dialogueQueue: [...state.activeMission.debrief],
          ...(state.table ? { table: { ...state.table, completedMissionIds, campaignFlags } } : {}),
      };
  }),
  resolveDialogueChoice: (choiceId) => {
      const state = get();
      const current = state.dialogueQueue[0];
      const choice = current?.choices?.find((item) => item.id === choiceId);
      const player = state.characters.find((character) => !character.isAI);
      const skill = choice ? SKILLS.find((item) => item.id === choice.check.skillId) : undefined;
      if (!current || !choice || !player || !skill) return;

      const roll = rollD10Pool();
      const skillBonus = player.skills.includes(skill.id) ? GAME_RULES.resolution.synergyBonus : 0;
      const modifier = player.stats[skill.stat] + skillBonus;
      const total = roll.total + modifier;
      const succeeded = roll.criticalSuccess || (!roll.criticalFailure && total >= choice.check.difficulty);
      const outcome = roll.criticalSuccess ? 'Réussite critique' : roll.criticalFailure ? 'Échec critique' : succeeded ? 'Réussite' : 'Échec';
      const effect: MissionEffect | undefined = succeeded ? choice.successEffect : choice.failureEffect;
      const resultFlag = succeeded ? choice.successFlag : choice.failureFlag;
      const attribute = GAME_RULES.attributes.find((item) => item.id === skill.stat)?.label || skill.stat;

      soundEngine.play('dice');
      set({
          diceResult: {
              value: total,
              label: skill.name,
              sides: 10,
              dice: roll.rolled,
              isCrit: roll.criticalSuccess,
              formula: `2d10 (${roll.rolled.join(' + ')}) + ${attribute} ${player.stats[skill.stat]}${skillBonus ? ` + compétence ${skillBonus}` : ''} = ${total}`,
              difficulty: choice.check.difficulty,
              outcome,
          },
          dialogueQueue: [
              { speaker: 'HQ_VOLKOV', avatar: gameAssets.drElena, text: succeeded ? choice.successText : choice.failureText },
              ...state.dialogueQueue.slice(1),
          ],
          ...(state.table ? {
              table: {
                  ...state.table,
                  campaignFlags: resultFlag ? [...new Set([...state.table.campaignFlags, resultFlag])] : state.table.campaignFlags,
                  lastChoice: {
                      missionId: state.activeMission?.id || state.table.scenarioId || 'unknown',
                      choiceId: choice.id,
                      label: choice.label,
                      succeeded,
                      outcome,
                  },
              },
          } : {}),
      });
      window.setTimeout(() => set({ diceResult: null }), 5000);
      get().addLog(`[Test] ${skill.name} : ${total} contre ${choice.check.difficulty} · ${outcome}.`);

      if (effect?.type === 'damage-opposition') {
          const opponent = get().characters.find((character) => character.faction === 'opposition' && character.hp > 0);
          if (opponent) get().takeDamage(opponent.id, effect.amount);
      } else if (effect?.type === 'unlock-terminal') {
          const terminal = get().interactiveObjects.find((object) => object.objectiveId === get().activeMission?.terminal.objectiveId);
          if (terminal) {
              set((currentState) => ({
                  interactiveObjects: currentState.interactiveObjects.map((object) => object.id === terminal.id ? { ...object, isLocked: false } : object),
              }));
              if (terminal.objectiveId) get().completeObjective(terminal.objectiveId);
          }
      } else if (effect?.type === 'damage-player') {
          get().takeDamage(player.id, effect.amount);
      } else if (effect?.type === 'restore-flux') {
          set((currentState) => ({
              characters: currentState.characters.map((character) => character.id === player.id
                  ? { ...character, flux: Math.min(character.maxFlux, character.flux + effect.amount) }
                  : character),
          }));
          get().addFloatingText(player.position.x, player.position.y, `+${effect.amount} FLUX`, 'info');
      } else if (effect?.type === 'complete-objective') {
          get().completeObjective(effect.objectiveId);
          get().addLog(`[Objectif] ${effect.objectiveId} validé par la décision de l’équipe.`);
      } else if (effect?.type === 'add-objective') {
          set((currentState) => {
              if (!currentState.activeMission || currentState.activeMission.objectives.some((objective) => objective.id === effect.objective.id)) {
                  return currentState;
              }
              return {
                  activeMission: {
                      ...currentState.activeMission,
                      objectives: [...currentState.activeMission.objectives, { ...effect.objective }],
                  },
              };
          });
          get().addLog(`[Objectif] Nouvel objectif : ${effect.objective.description}`);

          const opponentProfile = effect.opponentId
              ? get().activeMission?.reserveOpposition?.find((opponent) => opponent.id === effect.opponentId)
              : undefined;
          const opponentExists = opponentProfile && get().characters.some((character) => character.id === opponentProfile.id);
          if (opponentProfile && !opponentExists) {
              const weapon = WEAPONS.find((item) => item.id === opponentProfile.weaponId);
              const reinforcement: Character = {
                  id: opponentProfile.id, name: opponentProfile.name, avatar: opponentProfile.avatar,
                  level: 1, xp: 0, nextLevelXp: 100, hp: opponentProfile.hp, maxHp: opponentProfile.hp,
                  flux: 0, maxFlux: 0, ap: 1, maxAp: 1, mp: 6, maxMp: 6,
                  isAI: true, faction: 'opposition', objectiveId: opponentProfile.objectiveId,
                  stats: opponentProfile.stats, inventory: [opponentProfile.weaponId],
                  equippedWeaponId: opponentProfile.weaponId, equippedArmorId: null,
                  skills: weapon ? [GAME_RULES.combat.weaponSkills[weapon.type]] : [],
                  position: opponentProfile.position, statuses: [], neuroCredits: 0, unlockedImplants: [],
              };
              set((currentState) => ({ characters: [...currentState.characters, reinforcement] }));
              get().addLog(`[Renfort] ${opponentProfile.name} entre en scène.`);
          }
      }
  },
}), {
  name: 'edvard-game-state-v1',
  storage: sessionStorage,
  merge: (persistedState, currentState) => {
      const persisted = (persistedState || {}) as Partial<PersistedGameState>;
      const characters = (persisted.characters || currentState.characters).map((character) => ({
          ...character,
          faction: character.faction || (character.isAI ? 'opposition' : 'party') as Character['faction'],
          maxAp: character.unlockedImplants?.includes('neu_2') ? 2 : 1,
          ap: Math.min(character.ap, character.unlockedImplants?.includes('neu_2') ? 2 : 1),
      }));
      const activeMission = persisted.activeMission || currentState.activeMission;
      const legacyTable: GameTable | null = !persisted.table && activeMission && characters.length
          ? {
              id: 'table-restored-session',
              name: `Partie · ${activeMission.title}`,
              status: 'playing',
              setupStep: 'scenario',
              companionIds: characters.filter((character) => character.isAI && character.faction === 'party').map((character) => character.id),
              scenarioId: activeMission.id,
              createdAt: new Date().toISOString(),
              completedMissionIds: [],
              campaignFlags: [],
              lastChoice: null,
          }
          : null;
      const savedTable = persisted.table as Partial<GameTable> | null | undefined;
      const normalizedTable: GameTable | null = savedTable
          ? {
              ...savedTable,
              completedMissionIds: Array.isArray(savedTable.completedMissionIds) ? savedTable.completedMissionIds : [],
              campaignFlags: Array.isArray(savedTable.campaignFlags) ? savedTable.campaignFlags : [],
              lastChoice: savedTable.lastChoice || null,
          } as GameTable
          : legacyTable;
      return {
          ...currentState,
          ...persisted,
          characters,
          table: normalizedTable,
      };
  },
  partialize: (state) => ({
      characters: state.characters,
      obstacles: state.obstacles,
      interactiveObjects: state.interactiveObjects,
      decals: state.decals,
      zoom: state.zoom,
      logs: state.logs,
      selectedTokenId: state.selectedTokenId,
      targetTokenId: state.targetTokenId,
      turnOrder: state.turnOrder,
      currentTurnIndex: state.currentTurnIndex,
      fogEnabled: state.fogEnabled,
      discoveredCells: state.discoveredCells,
      victory: state.victory,
      activeMission: state.activeMission,
      dialogueQueue: state.dialogueQueue,
      weather: state.weather,
      defeat: state.defeat,
      table: state.table,
      creationMode: state.creationMode,
  }),
}));

const RACE_ABILITIES: any = {
    'HUMAIN': [{ id: 'adrenaline', cost: 5 }],
    'SYLVAÏN': [{ id: 'regrowth', cost: 8 }],
    'SKARN': [{ id: 'fortify', cost: 6 }],
    'SYNTHÉTIQUE': [{ id: 'overclock', cost: 4 }]
};
