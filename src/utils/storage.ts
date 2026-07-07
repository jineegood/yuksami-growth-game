import { createDefaultGameState } from './formulas';
import type {
  EquipmentSlot,
  GameState,
  ImportResult,
  PendingLevelUpState,
  QuizQuestion,
  QuizSession,
  SkillId,
} from '../types/game';

export const SAVE_KEY = 'yuksami-growth-save-v1';

const EQUIPMENT_SLOTS: EquipmentSlot[] = ['weapon', 'armor', 'gloves', 'ring'];
const SKILL_IDS: SkillId[] = ['powerSlash', 'spinCut', 'heal'];

export function loadGame(storage = getBrowserStorage()): GameState {
  const fallback = createDefaultGameState();
  if (!storage) {
    return fallback;
  }

  const raw = storage.getItem(SAVE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    return normalizeGameState(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export function saveGame(state: GameState, storage = getBrowserStorage()): void {
  if (!storage) {
    return;
  }

  const saveState: GameState = {
    ...state,
    lastSavedAt: Date.now(),
  };
  storage.setItem(SAVE_KEY, JSON.stringify(saveState));
}

export function resetGame(storage = getBrowserStorage()): void {
  storage?.removeItem(SAVE_KEY);
}

export function exportGame(state: GameState): string {
  return JSON.stringify(
    {
      ...state,
      lastSavedAt: Date.now(),
    },
    null,
    2,
  );
}

export function importGame(text: string, storage = getBrowserStorage()): ImportResult {
  try {
    const parsed = JSON.parse(text);
    const state = normalizeGameState(parsed);
    saveGame(state, storage);
    return { ok: true, state };
  } catch {
    return {
      ok: false,
      error: '불러오기 실패: 저장 데이터 형식이 올바르지 않습니다.',
    };
  }
}

export function normalizeGameState(input: unknown): GameState {
  if (!isRecord(input) || !isRecord(input.player)) {
    throw new Error('Invalid save');
  }

  const base = createDefaultGameState();
  const player = input.player;
  const equipmentInput = isRecord(input.equipment) ? input.equipment : {};
  const skillsInput = isRecord(input.skills) ? input.skills : {};
  const settingsInput = isRecord(input.settings) ? input.settings : {};
  const buffsInput = isRecord(input.buffs) ? input.buffs : {};

  return {
    player: {
      level: readPositiveNumber(player.level, base.player.level),
      exp: readNumber(player.exp, base.player.exp),
      gold: readNumber(player.gold, base.player.gold),
      hp: readNumber(player.hp, base.player.hp),
      totalKills: readNumber(player.totalKills, base.player.totalKills),
      totalGoldEarned: readNumber(player.totalGoldEarned, base.player.totalGoldEarned),
    },
    equipment: Object.fromEntries(
      EQUIPMENT_SLOTS.map((slot) => [
        slot,
        {
          level: readNumber(isRecord(equipmentInput[slot]) ? equipmentInput[slot].level : undefined, 0),
        },
      ]),
    ) as GameState['equipment'],
    skills: Object.fromEntries(
      SKILL_IDS.map((id) => [
        id,
        {
          level: Math.max(1, readNumber(isRecord(skillsInput[id]) ? skillsInput[id].level : undefined, 1)),
        },
      ]),
    ) as GameState['skills'],
    settings: {
      bgm: typeof settingsInput.bgm === 'boolean' ? settingsInput.bgm : base.settings.bgm,
      sfx: typeof settingsInput.sfx === 'boolean' ? settingsInput.sfx : base.settings.sfx,
    },
    buffs: {
      attackUntil: readNumber(buffsInput.attackUntil, 0),
      expUntil: readNumber(buffsInput.expUntil, 0),
      goldUntil: readNumber(buffsInput.goldUntil, 0),
    },
    pendingLevelUp: normalizePendingLevelUp(input.pendingLevelUp),
    lastSavedAt: readNumber(input.lastSavedAt, Date.now()),
  };
}

function normalizePendingLevelUp(input: unknown): PendingLevelUpState | null {
  if (!isRecord(input) || !isRecord(input.quiz)) {
    return null;
  }

  const quiz = normalizeQuiz(input.quiz);
  if (!quiz) {
    return null;
  }

  return {
    fromLevel: readPositiveNumber(input.fromLevel, 1),
    targetLevel: readPositiveNumber(input.targetLevel, 2),
    overflowExp: readNumber(input.overflowExp, 0),
    quiz,
  };
}

function normalizeQuiz(input: unknown): QuizSession | null {
  if (!isRecord(input) || !Array.isArray(input.questions)) {
    return null;
  }

  const questions = input.questions.map(normalizeQuestion).filter((question): question is QuizQuestion => question !== null);
  if (questions.length === 0) {
    return null;
  }

  return {
    id: typeof input.id === 'string' ? input.id : `quiz-${Date.now()}`,
    questions,
    passScore: readNumber(input.passScore, 2),
    createdAt: readNumber(input.createdAt, Date.now()),
  };
}

function normalizeQuestion(input: unknown): QuizQuestion | null {
  if (!isRecord(input) || !Array.isArray(input.choices)) {
    return null;
  }

  if (typeof input.id !== 'string' || typeof input.word !== 'string' || typeof input.correctMeaning !== 'string') {
    return null;
  }

  const choices = input.choices.filter((choice): choice is string => typeof choice === 'string');
  if (choices.length < 2) {
    return null;
  }

  return {
    id: input.id,
    word: input.word,
    correctMeaning: input.correctMeaning,
    choices,
  };
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function readPositiveNumber(value: unknown, fallback: number): number {
  return Math.max(1, readNumber(value, fallback));
}
