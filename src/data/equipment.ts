import type { EquipmentDefinition, EquipmentSlot } from '../types/game';

export const equipmentDefinitions: EquipmentDefinition[] = [
  {
    slot: 'weapon',
    name: '별빛 나뭇가지',
    shortName: '무기',
    description: '공격력이 크게 오른다.',
    attackPerLevel: 5,
    defensePerLevel: 0,
    hpPerLevel: 0,
    critChancePerLevel: 0,
    critDamagePerLevel: 0,
    baseCost: 80,
    costGrowth: 42,
  },
  {
    slot: 'armor',
    name: '구름 조끼',
    shortName: '방어구',
    description: '방어력과 체력이 오른다.',
    attackPerLevel: 0,
    defensePerLevel: 4,
    hpPerLevel: 16,
    critChancePerLevel: 0,
    critDamagePerLevel: 0,
    baseCost: 70,
    costGrowth: 36,
  },
  {
    slot: 'gloves',
    name: '콩콩 장갑',
    shortName: '장갑',
    description: '치명타 확률이 조금씩 오른다.',
    attackPerLevel: 0,
    defensePerLevel: 0,
    hpPerLevel: 0,
    critChancePerLevel: 0.0004,
    critDamagePerLevel: 0,
    baseCost: 65,
    costGrowth: 35,
  },
  {
    slot: 'ring',
    name: '햇살 반지',
    shortName: '반지',
    description: '치명타 피해량이 오른다.',
    attackPerLevel: 0,
    defensePerLevel: 0,
    hpPerLevel: 0,
    critChancePerLevel: 0,
    critDamagePerLevel: 0.005,
    baseCost: 90,
    costGrowth: 48,
  },
];

export const equipmentBySlot = equipmentDefinitions.reduce(
  (map, item) => {
    map[item.slot] = item;
    return map;
  },
  {} as Record<EquipmentSlot, EquipmentDefinition>,
);
