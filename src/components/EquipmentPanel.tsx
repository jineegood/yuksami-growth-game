import { equipmentDefinitions } from '../data/equipment';
import type { EquipmentSlot, GameState } from '../types/game';
import { getEquipmentUpgradeCost } from '../utils/formulas';

interface EquipmentPanelProps {
  state: GameState;
  onUpgrade: (slot: EquipmentSlot) => void;
}

export function EquipmentPanel({ state, onUpgrade }: EquipmentPanelProps) {
  return (
    <section className="panel">
      <div className="panel-title">
        <span>장비</span>
        <strong>강화</strong>
      </div>
      <div className="upgrade-list">
        {equipmentDefinitions.map((item) => {
          const level = state.equipment[item.slot].level;
          const cost = getEquipmentUpgradeCost(item.slot, level);
          const disabled = state.player.gold < cost;

          return (
            <article className="upgrade-row" key={item.slot}>
              <div className="slot-icon">{item.shortName}</div>
              <div className="upgrade-info">
                <strong>
                  {item.name} +{level}
                </strong>
                <span>{item.description}</span>
                <small>{buildEquipmentGain(item)}</small>
              </div>
              <button disabled={disabled} onClick={() => onUpgrade(item.slot)}>
                {cost.toLocaleString()} G
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function buildEquipmentGain(item: (typeof equipmentDefinitions)[number]): string {
  const gains = [
    item.attackPerLevel > 0 ? `공격 +${item.attackPerLevel}` : '',
    item.defensePerLevel > 0 ? `방어 +${item.defensePerLevel}` : '',
    item.hpPerLevel > 0 ? `체력 +${item.hpPerLevel}` : '',
    item.critChancePerLevel > 0 ? `치명 확률 +${(item.critChancePerLevel * 100).toFixed(2)}%` : '',
    item.critDamagePerLevel > 0 ? `치명 피해 +${(item.critDamagePerLevel * 100).toFixed(1)}%` : '',
  ].filter(Boolean);

  return gains.join(' / ');
}
