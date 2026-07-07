import { describe, expect, it } from 'vitest';
import { createDefaultGameState } from './formulas';
import { createBattleCombatant, runFriendBattleRound } from './friendBattle';

describe('friend battle helpers', () => {
  it('creates a combatant from saved character stats', () => {
    const state = createDefaultGameState();
    state.player.level = 12;
    state.equipment.weapon.level = 3;

    const combatant = createBattleCombatant('나', state);

    expect(combatant.name).toBe('나');
    expect(combatant.level).toBe(12);
    expect(combatant.hp).toBe(combatant.maxHp);
    expect(combatant.attack).toBeGreaterThan(0);
  });

  it('applies simultaneous damage in one friend battle round', () => {
    const mine = createBattleCombatant('나', createDefaultGameState());
    const friend = createBattleCombatant('친구', createDefaultGameState());

    const result = runFriendBattleRound(
      { ...mine, hp: 10, attack: 20, defense: 0, critChance: 0, critDamage: 1.1 },
      { ...friend, hp: 10, attack: 20, defense: 0, critChance: 0, critDamage: 1.1 },
      1,
    );

    expect(result.mine.hp).toBe(0);
    expect(result.friend.hp).toBe(0);
    expect(result.winner).toBe('draw');
    expect(result.log[result.log.length - 1]).toContain('동시 공격');
  });
});
