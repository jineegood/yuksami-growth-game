import { useEffect, useMemo, useRef, useState } from 'react';
import { skillsById } from '../data/skills';
import type { FloatingText, GameState, MonsterState, RuntimeGame, SkillId } from '../types/game';
import {
  applyExperience,
  calculateStats,
  cloneGameState,
  createMonster,
  getHealAmount,
  getRewardMultipliers,
  getSkillDamageMultiplier,
} from '../utils/formulas';
import { saveGame } from '../utils/storage';

interface UseGameLoopOptions {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  isPaused?: boolean;
}

const TICK_MS = 120;
const REVIVE_MS = 10_000;
const PLAYER_ATTACK_MS = 1050;
const MONSTER_ATTACK_MS = 1450;

export function useGameLoop({ state, setState, isPaused = false }: UseGameLoopOptions): RuntimeGame {
  const [monster, setMonsterState] = useState<MonsterState>(() => createMonster(state.player.level));
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [notices, setNotices] = useState<FloatingText[]>([]);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [activeSkillEffect, setActiveSkillEffect] = useState<SkillId | null>(null);
  const [reviveLeftMs, setReviveLeftMs] = useState(0);

  const stateRef = useRef(state);
  const pausedRef = useRef(isPaused);
  const monsterRef = useRef(monster);
  const nextPlayerAttackAt = useRef(0);
  const nextMonsterAttackAt = useRef(Date.now() + MONSTER_ATTACK_MS);
  const skillCooldowns = useRef<Record<SkillId, number>>({
    powerSlash: 0,
    spinCut: 0,
    heal: 0,
  });
  const reviveAt = useRef(0);
  const respawning = useRef(false);
  const lastSaveAt = useRef(Date.now());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    monsterRef.current = monster;
  }, [monster]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tick();
    }, TICK_MS);

    return () => window.clearInterval(timer);
    // The loop reads fresh values through refs; recreating it would reset timers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMonster = (next: MonsterState) => {
    monsterRef.current = next;
    setMonsterState(next);
  };

  const pushFloating = (target: FloatingText['target'], text: string, tone: FloatingText['tone']) => {
    const item: FloatingText = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      target,
      text,
      tone,
    };

    setFloatingTexts((current) => [...current, item]);
    window.setTimeout(() => {
      setFloatingTexts((current) => current.filter((entry) => entry.id !== item.id));
    }, 900);
  };

  const pushNotice = (text: string, tone: FloatingText['tone'] = 'gold') => {
    const item: FloatingText = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      target: 'center',
      text,
      tone,
    };

    setNotices((current) => [item, ...current].slice(0, 4));
    window.setTimeout(() => {
      setNotices((current) => current.filter((entry) => entry.id !== item.id));
    }, 1800);
  };

  const tick = () => {
    const now = Date.now();
    const currentState = stateRef.current;
    const currentMonster = monsterRef.current;
    const stats = calculateStats(currentState, now);

    if (pausedRef.current || currentState.pendingLevelUp) {
      return;
    }

    if (currentState.player.hp <= 0) {
      if (reviveAt.current === 0) {
        reviveAt.current = now + REVIVE_MS;
        pushNotice('10초 후 자동 부활', 'damage');
      }

      const left = Math.max(0, reviveAt.current - now);
      setReviveLeftMs(left);

      if (left === 0) {
        reviveAt.current = 0;
        setState((previous) => {
          const next = cloneGameState(previous);
          next.player.hp = calculateStats(next, now).maxHp;
          return next;
        });
        pushNotice('부활 완료', 'heal');
      }
      return;
    }

    reviveAt.current = 0;
    setReviveLeftMs(0);

    if (!respawning.current && currentMonster.hp > 0 && now >= nextPlayerAttackAt.current) {
      runPlayerAction(now, currentState, currentMonster, stats);
    }

    if (!respawning.current && monsterRef.current.hp > 0 && now >= nextMonsterAttackAt.current) {
      runMonsterAttack(now, monsterRef.current);
    }

    if (now - lastSaveAt.current > 2500) {
      saveGame(stateRef.current);
      lastSaveAt.current = now;
    }
  };

  const runPlayerAction = (
    now: number,
    currentState: GameState,
    currentMonster: MonsterState,
    stats: ReturnType<typeof calculateStats>,
  ) => {
    const skillId = chooseSkill(currentState, stats, now);
    const skillLevel = skillId ? currentState.skills[skillId].level : 1;

    setIsPlayerAttacking(true);
    window.setTimeout(() => setIsPlayerAttacking(false), 220);

    if (skillId === 'heal') {
      const amount = getHealAmount(skillLevel);
      skillCooldowns.current.heal = now + skillsById.heal.cooldownMs;
      nextPlayerAttackAt.current = now + 650;
      showSkillEffect('heal');

      setState((previous) => {
        const next = cloneGameState(previous);
        next.player.hp = Math.min(calculateStats(next, now).maxHp, next.player.hp + amount);
        return next;
      });
      pushFloating('player', `+${amount}`, 'heal');
      return;
    }

    const multiplier = skillId ? getSkillDamageMultiplier(skillId, skillLevel) : 1;
    const variance = 0.9 + Math.random() * 0.22;
    const critical = Math.random() < stats.critChance;
    const criticalBonus = critical ? stats.critDamage : 1;
    const damage = Math.max(1, Math.floor(stats.attack * multiplier * variance * criticalBonus));
    const nextMonsterHp = Math.max(0, currentMonster.hp - damage);
    const defeated = nextMonsterHp <= 0;
    const nextMonster = {
      ...currentMonster,
      hp: nextMonsterHp,
    };

    if (skillId) {
      skillCooldowns.current[skillId] = now + skillsById[skillId].cooldownMs;
      showSkillEffect(skillId);
      pushNotice(skillsById[skillId].name, 'skill');
    }

    nextPlayerAttackAt.current = now + PLAYER_ATTACK_MS;
    setMonster(nextMonster);
    setIsMonsterHit(true);
    window.setTimeout(() => setIsMonsterHit(false), 180);
    pushFloating('monster', `${critical ? 'CRIT ' : ''}-${damage}`, critical ? 'critical' : 'damage');

    if (defeated) {
      handleMonsterDefeated(now, currentMonster);
    }
  };

  const runMonsterAttack = (now: number, currentMonster: MonsterState) => {
    nextMonsterAttackAt.current = now + MONSTER_ATTACK_MS;

    setState((previous) => {
      if (previous.player.hp <= 0 || previous.pendingLevelUp) {
        return previous;
      }

      const stats = calculateStats(previous, now);
      const damage = Math.max(1, currentMonster.attack - Math.floor(stats.defense * 0.8));
      const next = cloneGameState(previous);
      next.player.hp = Math.max(0, next.player.hp - damage);
      pushFloating('player', `-${damage}`, 'damage');
      return next;
    });
  };

  const handleMonsterDefeated = (now: number, defeatedMonster: MonsterState) => {
    respawning.current = true;

    setState((previous) => {
      const multipliers = getRewardMultipliers(previous, now);
      const gold = Math.floor(defeatedMonster.rewardGold * multipliers.gold);
      const exp = Math.floor(defeatedMonster.rewardExp * multipliers.exp);
      const beforeLevel = previous.player.level;
      const next = cloneGameState(previous);

      next.player.gold += gold;
      next.player.totalGoldEarned += gold;
      next.player.totalKills += 1;

      const withExp = applyExperience(next, exp);
      pushNotice(`+${gold} 골드`, 'gold');

      if (withExp.pendingLevelUp && withExp.pendingLevelUp.fromLevel === beforeLevel) {
        setIsLevelUp(true);
        pushNotice('레벨업 퀴즈!', 'level');
        window.setTimeout(() => setIsLevelUp(false), 950);
      }

      return withExp;
    });

    window.setTimeout(() => {
      const nextLevel = stateRef.current.pendingLevelUp
        ? stateRef.current.pendingLevelUp.targetLevel
        : stateRef.current.player.level;
      setMonster(createMonster(nextLevel));
      nextMonsterAttackAt.current = Date.now() + 900;
      respawning.current = false;
    }, 520);
  };

  const chooseSkill = (currentState: GameState, stats: ReturnType<typeof calculateStats>, now: number): SkillId | null => {
    if (
      currentState.player.hp / stats.maxHp < 0.45 &&
      now >= skillCooldowns.current.heal &&
      currentState.skills.heal.level > 0
    ) {
      return 'heal';
    }

    if (now >= skillCooldowns.current.spinCut) {
      return 'spinCut';
    }

    if (now >= skillCooldowns.current.powerSlash) {
      return 'powerSlash';
    }

    return null;
  };

  const showSkillEffect = (skillId: SkillId) => {
    setActiveSkillEffect(skillId);
    window.setTimeout(() => {
      setActiveSkillEffect((current) => (current === skillId ? null : current));
    }, 520);
  };

  return useMemo(
    () => ({
      monster,
      floatingTexts,
      notices,
      isPlayerAttacking,
      isMonsterHit,
      isLevelUp,
      isPlayerDown: state.player.hp <= 0,
      activeSkillEffect,
      reviveLeftMs,
    }),
    [
      activeSkillEffect,
      floatingTexts,
      isLevelUp,
      isMonsterHit,
      isPlayerAttacking,
      monster,
      notices,
      reviveLeftMs,
      state.player.hp,
    ],
  );
}
