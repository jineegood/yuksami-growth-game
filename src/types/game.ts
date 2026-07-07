export type EquipmentSlot = 'weapon' | 'armor' | 'gloves' | 'ring';

export type SkillId = 'powerSlash' | 'spinCut' | 'heal';

export type ActiveTab = 'character' | 'equipment' | 'skills' | 'settings';

export interface PlayerState {
  level: number;
  exp: number;
  gold: number;
  hp: number;
  totalKills: number;
  totalGoldEarned: number;
}

export interface EquipmentState {
  level: number;
}

export interface SkillState {
  level: number;
}

export interface SettingsState {
  bgm: boolean;
  sfx: boolean;
}

export interface BuffState {
  attackUntil: number;
  expUntil: number;
  goldUntil: number;
}

export interface VocabularyEntry {
  id: string;
  word: string;
  meaning: string;
}

export interface QuizQuestion {
  id: string;
  word: string;
  correctMeaning: string;
  choices: string[];
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  passScore: number;
  createdAt: number;
}

export interface QuizResult {
  correctCount: number;
  totalCount: number;
  passed: boolean;
}

export interface PendingLevelUpState {
  fromLevel: number;
  targetLevel: number;
  overflowExp: number;
  quiz: QuizSession;
}

export interface GameState {
  player: PlayerState;
  equipment: Record<EquipmentSlot, EquipmentState>;
  skills: Record<SkillId, SkillState>;
  settings: SettingsState;
  buffs: BuffState;
  pendingLevelUp: PendingLevelUpState | null;
  lastSavedAt: number;
}

export interface PlayerStats {
  attack: number;
  defense: number;
  maxHp: number;
  critChance: number;
  critDamage: number;
  combatPower: number;
  equipmentAttack: number;
  equipmentDefense: number;
  equipmentHp: number;
}

export interface EquipmentDefinition {
  slot: EquipmentSlot;
  name: string;
  shortName: string;
  description: string;
  attackPerLevel: number;
  defensePerLevel: number;
  hpPerLevel: number;
  critChancePerLevel: number;
  critDamagePerLevel: number;
  baseCost: number;
  costGrowth: number;
}

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  cooldownMs: number;
  damageMultiplier: number;
  damageGrowth: number;
  healBase: number;
  healGrowth: number;
  baseCost: number;
  costGrowth: number;
}

export interface MonsterVisual {
  familyIndex: number;
  variantIndex: number;
  familyClass: string;
  variantClass: string;
}

export interface MonsterState {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  rewardGold: number;
  rewardExp: number;
  visual: MonsterVisual;
}

export interface FloatingText {
  id: string;
  target: 'monster' | 'player' | 'center';
  text: string;
  tone: 'damage' | 'critical' | 'heal' | 'gold' | 'level' | 'skill';
}

export interface RuntimeGame {
  monster: MonsterState;
  floatingTexts: FloatingText[];
  notices: FloatingText[];
  isPlayerAttacking: boolean;
  isMonsterHit: boolean;
  isLevelUp: boolean;
  isPlayerDown: boolean;
  activeSkillEffect: SkillId | null;
  reviveLeftMs: number;
}

export interface ImportResult {
  ok: boolean;
  state?: GameState;
  error?: string;
}
