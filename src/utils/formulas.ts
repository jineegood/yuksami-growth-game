import { equipmentDefinitions, equipmentBySlot } from '../data/equipment';
import { skillDefinitions, skillsById } from '../data/skills';
import type { EquipmentSlot, GameState, MonsterState, MonsterVisual, PlayerStats, SkillId } from '../types/game';
import { createQuizSession } from './quiz';

const MONSTER_FAMILIES = ['말랑버섯', '통통슬라임', '리본돼지', '밤송이도치', '솜사탕유령', '크리스탈골렘', '별빛용'];

export function getRequiredExp(level: number): number {
  return 100 + level * 50;
}

export function createDefaultGameState(): GameState {
  const state: GameState = {
    player: {
      level: 1,
      exp: 0,
      gold: 250,
      hp: 120,
      totalKills: 0,
      totalGoldEarned: 0,
    },
    equipment: {
      weapon: { level: 0 },
      armor: { level: 0 },
      gloves: { level: 0 },
      ring: { level: 0 },
    },
    skills: {
      powerSlash: { level: 1 },
      spinCut: { level: 1 },
      heal: { level: 1 },
    },
    settings: {
      bgm: true,
      sfx: true,
    },
    buffs: {
      attackUntil: 0,
      expUntil: 0,
      goldUntil: 0,
    },
    pendingLevelUp: null,
    lastSavedAt: Date.now(),
  };

  state.player.hp = calculateStats(state).maxHp;
  return state;
}

export function calculateStats(state: GameState, now = Date.now()): PlayerStats {
  let equipmentAttack = 0;
  let equipmentDefense = 0;
  let equipmentHp = 0;
  let equipmentCritChance = 0;
  let equipmentCritDamage = 0;

  for (const item of equipmentDefinitions) {
    const level = state.equipment[item.slot]?.level ?? 0;
    equipmentAttack += item.attackPerLevel * level;
    equipmentDefense += item.defensePerLevel * level;
    equipmentHp += item.hpPerLevel * level;
    equipmentCritChance += item.critChancePerLevel * level;
    equipmentCritDamage += item.critDamagePerLevel * level;
  }

  const skillAttack =
    Math.max(0, (state.skills.powerSlash?.level ?? 1) - 1) * 2 +
    Math.max(0, (state.skills.spinCut?.level ?? 1) - 1) * 3;
  const attackBuff = state.buffs.attackUntil > now ? 10 + state.player.level * 2 : 0;

  const attack = Math.floor(10 + state.player.level * 3 + equipmentAttack + skillAttack + attackBuff);
  const defense = Math.floor(2 + state.player.level + equipmentDefense);
  const maxHp = Math.floor(100 + state.player.level * 20 + equipmentHp);
  const critChance = Math.min(0.5, 0.05 + equipmentCritChance);
  const critDamage = 1.1 + equipmentCritDamage;
  const combatPower = Math.floor(
    attack * 5 + defense * 4 + maxHp + critChance * 900 + (critDamage - 1) * 650 + state.player.level * 15,
  );

  return {
    attack,
    defense,
    maxHp,
    critChance,
    critDamage,
    combatPower,
    equipmentAttack,
    equipmentDefense,
    equipmentHp,
  };
}

export function createMonster(playerLevel: number): MonsterState {
  const level = Math.max(1, playerLevel);
  const maxHp = 30 + level * 15;
  const visual = getMonsterVisual(level);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: MONSTER_FAMILIES[visual.familyIndex],
    level,
    hp: maxHp,
    maxHp,
    attack: Math.ceil((5 + level * 2) * (1 + level * 0.01)),
    rewardGold: 10 + level * 5,
    rewardExp: 20 + level * 8,
    visual,
  };
}

export function getMonsterVisual(level: number): MonsterVisual {
  const familyIndex = Math.min(MONSTER_FAMILIES.length - 1, Math.floor(Math.max(1, level) / 50));
  const variantIndex = Math.floor(Math.max(1, level) / 10) % 5;

  return {
    familyIndex,
    variantIndex,
    familyClass: `monster-family-${familyIndex}`,
    variantClass: `monster-variant-${variantIndex}`,
  };
}

export function applyExperience(state: GameState, amount: number): GameState {
  const next = cloneGameState(state);
  if (next.pendingLevelUp) {
    return next;
  }

  next.player.exp += Math.max(0, Math.floor(amount));
  return maybeStartPendingLevelUp(next);
}

export function applyLevelUpQuizResult(state: GameState, passed: boolean): GameState {
  const pending = state.pendingLevelUp;
  const next = cloneGameState(state);
  if (!pending) {
    return next;
  }

  if (!passed) {
    next.player.level = pending.fromLevel;
    next.player.exp = Math.floor(getRequiredExp(pending.fromLevel) / 2);
    next.pendingLevelUp = null;
    return clampPlayerHp(next);
  }

  next.player.level = pending.targetLevel;
  next.player.exp = pending.overflowExp;
  next.pendingLevelUp = null;
  next.player.hp = calculateStats(next).maxHp;
  return maybeStartPendingLevelUp(next);
}

export function getEquipmentUpgradeCost(slot: EquipmentSlot, level: number): number {
  const item = equipmentBySlot[slot];
  return item.baseCost + level * item.costGrowth + Math.floor(level * level * 8);
}

export function getSkillUpgradeCost(id: SkillId, level: number): number {
  const skill = skillsById[id];
  return skill.baseCost + level * skill.costGrowth + Math.floor(level * level * 10);
}

export function getSkillDamageMultiplier(id: SkillId, level: number): number {
  const skill = skillsById[id];
  return skill.damageMultiplier + Math.max(0, level - 1) * skill.damageGrowth;
}

export function getHealAmount(level: number): number {
  const skill = skillsById.heal;
  return skill.healBase + Math.max(0, level - 1) * skill.healGrowth;
}

export function getActiveBuffLabels(state: GameState, now = Date.now()): string[] {
  const buffs: string[] = [];
  if (state.buffs.attackUntil > now) {
    buffs.push('공격 버프');
  }
  if (state.buffs.expUntil > now) {
    buffs.push('경험치 버프');
  }
  if (state.buffs.goldUntil > now) {
    buffs.push('골드 버프');
  }
  return buffs;
}

export function getRewardMultipliers(state: GameState, now = Date.now()): { exp: number; gold: number } {
  return {
    exp: state.buffs.expUntil > now ? 1.5 : 1,
    gold: state.buffs.goldUntil > now ? 1.5 : 1,
  };
}

export function clampPlayerHp(state: GameState): GameState {
  const next = cloneGameState(state);
  const maxHp = calculateStats(next).maxHp;
  next.player.hp = Math.max(0, Math.min(maxHp, next.player.hp));
  return next;
}

export function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function maybeStartPendingLevelUp(state: GameState): GameState {
  const next = cloneGameState(state);
  const required = getRequiredExp(next.player.level);
  if (next.player.exp < required) {
    return next;
  }

  const overflowExp = next.player.exp - required;
  next.player.exp = required;
  next.pendingLevelUp = {
    fromLevel: next.player.level,
    targetLevel: next.player.level + 1,
    overflowExp,
    quiz: createQuizSession(),
  };
  return next;
}

export { equipmentDefinitions, skillDefinitions };
