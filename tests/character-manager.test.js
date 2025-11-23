import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to load utils first as character-manager might depend on it (though the code checks for it)
async function loadScripts() {
  const fs = await import('fs');
  const path = await import('path');

  // Load Utils
  const utilsCode = fs.readFileSync(path.resolve(__dirname, '../js/utils.js'), 'utf-8');
  new Function(utilsCode)();

  // Load Character Manager
  const managerCode = fs.readFileSync(path.resolve(__dirname, '../js/character-manager.js'), 'utf-8');
  new Function(managerCode)();
}

describe('CharacterManager', () => {
  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    // Reset window globals
    window.EdvardUtils = undefined;
    window.CharacterManager = undefined;

    await loadScripts();
  });

  it('should initialize with default state', () => {
    const manager = new window.CharacterManager();
    const state = manager.getState();

    expect(state.availablePoints).toBe(27);
    expect(state.stats.force).toBe(8);
    expect(state.stats.intelligence).toBe(8);
  });

  it('increaseStat should decrease available points', () => {
    const manager = new window.CharacterManager();
    // Force: 8 -> 9 costs 1 point
    const success = manager.increaseStat('force');

    expect(success).toBe(true);
    expect(manager.getState().stats.force).toBe(9);
    expect(manager.getState().availablePoints).toBe(26);
  });

  it('increaseStat should return false if not enough points', () => {
    const manager = new window.CharacterManager();
    // Artificially set low points
    manager.state.availablePoints = 0;

    const success = manager.increaseStat('force');
    expect(success).toBe(false);
    expect(manager.getState().stats.force).toBe(8);
  });

  it('racial bonuses should be applied in effective stats', () => {
    const manager = new window.CharacterManager();
    // Race 'sylvain' gives Sagesse +2
    manager.setRace('sylvain');

    const state = manager.getState();
    expect(state.race).toBe('sylvain');
    // Base 8 + 2 = 10
    expect(state.effectiveStats.sagesse).toBe(10);
    // Base 8 + 0 = 8
    expect(state.effectiveStats.force).toBe(8);
  });

  it('should save to localStorage', () => {
    const manager = new window.CharacterManager();
    manager.increaseStat('force');

    const saved = localStorage.getItem('edvard_character_autosave');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved);
    expect(parsed.stats.force).toBe(9);
  });

  it('should load from localStorage on init', () => {
    const preSavedState = {
      availablePoints: 20,
      stats: { force: 10, agilite: 8, constitution: 8, intelligence: 8, sagesse: 8, charisme: 8 },
      derived: { hp: 10, credits: 0 },
      lore: {},
      skills: [],
      equipment: []
    };
    localStorage.setItem('edvard_character_autosave', JSON.stringify(preSavedState));

    const manager = new window.CharacterManager();
    expect(manager.getState().stats.force).toBe(10);
    expect(manager.getState().availablePoints).toBe(20);
  });
});
