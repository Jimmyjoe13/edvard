import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper to load the script content into the global scope
async function loadUtils() {
  // Since utils.js assigns to window.EdvardUtils, we need to ensure window exists
  // jsdom handles this, but we need to execute the file content.
  // We can't import it as a module because it's not a module.
  // We'll verify if it's already loaded or mock the loading.

  // Ideally, we should refactor utils.js to be testable/modular, but we must avoid regressions.
  // So we will assume the environment matches what the browser does.

  // We can just define the object here for testing logic if we want to isolate logic
  // OR we can read the file and eval it (dangerous but effective for legacy scripts in tests)
  // OR we can rely on the fact that we can just copy the logic or require it if we modify it to check for module.exports

  // Best approach for "Legacy script testing": Read file and eval in context.

  const fs = await import('fs');
  const path = await import('path');
  const code = fs.readFileSync(path.resolve(__dirname, '../js/utils.js'), 'utf-8');

  // Execute in global scope
  const script = new Function(code);
  script();
}

describe('EdvardUtils', () => {
  beforeEach(async () => {
    // Reset
    window.EdvardUtils = undefined;
    await loadUtils();
  });

  it('should be defined on window', () => {
    expect(window.EdvardUtils).toBeDefined();
  });

  it('calculateModifier should calculate correct D&D style modifiers', () => {
    const { calculateModifier } = window.EdvardUtils;
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(13)).toBe(1);
    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(9)).toBe(-1);
    expect(calculateModifier(1)).toBe(-5);
    expect(calculateModifier(20)).toBe(5);
  });

  it('formatModifier should add + sign for positive numbers', () => {
    const { formatModifier } = window.EdvardUtils;
    expect(formatModifier(2)).toBe('+2');
    expect(formatModifier(0)).toBe('0');
    expect(formatModifier(-1)).toBe('-1');
  });

  it('rollDice should return a number between 1 and sides', () => {
    const { rollDice } = window.EdvardUtils;
    // Mock Math.random
    const randomSpy = vi.spyOn(Math, 'random');

    randomSpy.mockReturnValue(0); // 0 * 6 = 0 -> +1 = 1
    expect(rollDice(6)).toBe(1);

    randomSpy.mockReturnValue(0.999); // 0.999 * 6 = 5.994 -> floor 5 -> +1 = 6
    expect(rollDice(6)).toBe(6);

    randomSpy.mockRestore();
  });

  it('costTable should be correct', () => {
     const { costTable } = window.EdvardUtils;
     expect(costTable[8]).toBe(0);
     expect(costTable[15]).toBe(9);
  });
});
