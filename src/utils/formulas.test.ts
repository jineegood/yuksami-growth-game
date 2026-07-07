import { describe, expect, it } from 'vitest';
import {
  applyLevelUpQuizResult,
  applyExperience,
  calculateStats,
  createDefaultGameState,
  createMonster,
  getRequiredExp,
} from './formulas';

describe('formulas', () => {
  it('starts a fresh save with level 1, no exp, and starter gold', () => {
    const state = createDefaultGameState();

    expect(state.player.level).toBe(1);
    expect(state.player.exp).toBe(0);
    expect(state.player.gold).toBe(250);
    expect(Object.keys(state.equipment)).toEqual(['weapon', 'armor', 'gloves', 'ring']);
    expect(Object.keys(state.skills)).toEqual(['powerSlash', 'spinCut', 'heal']);
  });

  it('calculates revised equipment stats and critical damage', () => {
    const state = createDefaultGameState();
    state.player.level = 4;
    state.equipment.weapon.level = 3;
    state.equipment.armor.level = 2;
    state.equipment.gloves.level = 10;
    state.equipment.ring.level = 2;

    const stats = calculateStats(state);

    expect(stats.attack).toBe(10 + 4 * 3 + 3 * 5);
    expect(stats.defense).toBe(2 + 4 + 2 * 4);
    expect(stats.maxHp).toBe(100 + 4 * 20 + 2 * 16);
    expect(stats.critChance).toBeCloseTo(0.05 + 10 * 0.0004);
    expect(stats.critDamage).toBeCloseTo(1.1 + 2 * 0.005);
  });

  it('creates monsters with level damage scaling and visual milestones', () => {
    const monster = createMonster(100);

    expect(monster.maxHp).toBe(30 + 100 * 15);
    expect(monster.attack).toBe(Math.ceil((5 + 100 * 2) * 2));
    expect(monster.visual.familyIndex).toBe(2);
    expect(monster.visual.variantIndex).toBeGreaterThanOrEqual(0);
  });

  it('starts a pending quiz instead of leveling immediately', () => {
    const state = createDefaultGameState();
    const result = applyExperience(state, getRequiredExp(1) + 20);

    expect(result.player.level).toBe(1);
    expect(result.player.exp).toBe(getRequiredExp(1));
    expect(result.pendingLevelUp?.overflowExp).toBe(20);
    expect(result.pendingLevelUp?.quiz.questions).toHaveLength(3);
  });

  it('applies a passed quiz and keeps overflow experience', () => {
    const state = applyExperience(createDefaultGameState(), getRequiredExp(1) + 20);
    const result = applyLevelUpQuizResult(state, true);

    expect(result.player.level).toBe(2);
    expect(result.player.exp).toBe(20);
    expect(result.pendingLevelUp).toBeNull();
    expect(result.player.hp).toBe(calculateStats(result).maxHp);
  });

  it('fails a quiz by dropping exp to half of the current required exp', () => {
    const state = applyExperience(createDefaultGameState(), getRequiredExp(1) + 20);
    const result = applyLevelUpQuizResult(state, false);

    expect(result.player.level).toBe(1);
    expect(result.player.exp).toBe(Math.floor(getRequiredExp(1) / 2));
    expect(result.pendingLevelUp).toBeNull();
  });
});
