import type { SkillDefinition, SkillId } from '../types/game';

export const skillDefinitions: SkillDefinition[] = [
  {
    id: 'powerSlash',
    name: '파워 슬래시',
    description: '큰 피해를 주는 묵직한 베기.',
    cooldownMs: 3500,
    damageMultiplier: 1.75,
    damageGrowth: 0.13,
    healBase: 0,
    healGrowth: 0,
    baseCost: 120,
    costGrowth: 58,
  },
  {
    id: 'spinCut',
    name: '회전 베기',
    description: '빙글 돌며 강한 연속 피해를 준다.',
    cooldownMs: 5200,
    damageMultiplier: 2.25,
    damageGrowth: 0.18,
    healBase: 0,
    healGrowth: 0,
    baseCost: 180,
    costGrowth: 72,
  },
  {
    id: 'heal',
    name: '회복',
    description: '체력이 낮을 때 자동으로 회복한다.',
    cooldownMs: 7600,
    damageMultiplier: 0,
    damageGrowth: 0,
    healBase: 30,
    healGrowth: 12,
    baseCost: 100,
    costGrowth: 55,
  },
];

export const skillsById = skillDefinitions.reduce(
  (map, skill) => {
    map[skill.id] = skill;
    return map;
  },
  {} as Record<SkillId, SkillDefinition>,
);
