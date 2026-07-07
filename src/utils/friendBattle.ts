import type { GameState } from '../types/game';
import { calculateStats } from './formulas';

export type FriendBattleWinner = 'mine' | 'friend' | 'draw' | null;

export interface BattleCombatant {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  critChance: number;
  critDamage: number;
}

export interface FriendBattleRound {
  mine: BattleCombatant;
  friend: BattleCombatant;
  winner: FriendBattleWinner;
  log: string[];
}

export function createBattleCombatant(name: string, state: GameState): BattleCombatant {
  const stats = calculateStats(state);

  return {
    name,
    level: state.player.level,
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    critChance: stats.critChance,
    critDamage: stats.critDamage,
  };
}

export function runFriendBattleRound(mine: BattleCombatant, friend: BattleCombatant, round: number): FriendBattleRound {
  const mineDamage = calculateBattleDamage(mine, friend, round);
  const friendDamage = calculateBattleDamage(friend, mine, round + 11);
  const nextMine = {
    ...mine,
    hp: Math.max(0, mine.hp - friendDamage),
  };
  const nextFriend = {
    ...friend,
    hp: Math.max(0, friend.hp - mineDamage),
  };

  return {
    mine: nextMine,
    friend: nextFriend,
    winner: decideWinner(nextMine, nextFriend),
    log: [`${round}턴 동시 공격 · 나 ${mineDamage} / 친구 ${friendDamage}`],
  };
}

function calculateBattleDamage(attacker: BattleCombatant, defender: BattleCombatant, salt: number): number {
  const critical = deterministicCritical(attacker, salt);
  const criticalBonus = critical ? attacker.critDamage : 1;
  return Math.max(1, Math.floor(attacker.attack * criticalBonus - defender.defense * 0.7));
}

function deterministicCritical(attacker: BattleCombatant, salt: number): boolean {
  const roll = ((attacker.level * 37 + attacker.attack * 13 + salt * 17) % 1000) / 1000;
  return roll < attacker.critChance;
}

function decideWinner(mine: BattleCombatant, friend: BattleCombatant): FriendBattleWinner {
  if (mine.hp <= 0 && friend.hp <= 0) {
    return 'draw';
  }
  if (friend.hp <= 0) {
    return 'mine';
  }
  if (mine.hp <= 0) {
    return 'friend';
  }
  return null;
}
