import { skillDefinitions } from '../data/skills';
import type { GameState, SkillId } from '../types/game';
import { getHealAmount, getSkillDamageMultiplier, getSkillUpgradeCost } from '../utils/formulas';

interface SkillPanelProps {
  state: GameState;
  onUpgrade: (skillId: SkillId) => void;
}

export function SkillPanel({ state, onUpgrade }: SkillPanelProps) {
  return (
    <section className="panel">
      <div className="panel-title">
        <span>스킬</span>
        <strong>자동 사용</strong>
      </div>
      <div className="upgrade-list">
        {skillDefinitions.map((skill) => {
          const level = state.skills[skill.id].level;
          const cost = getSkillUpgradeCost(skill.id, level);
          const disabled = state.player.gold < cost;

          return (
            <article className="upgrade-row skill-row" key={skill.id}>
              <div className="skill-gem">{level}</div>
              <div className="upgrade-info">
                <strong>
                  {skill.name} Lv.{level}
                </strong>
                <span>{skill.description}</span>
                <small>
                  {skill.id === 'heal' ? `회복 ${getHealAmount(level)}` : `피해 ${getSkillDamageMultiplier(skill.id, level).toFixed(2)}배`} / 쿨타임{' '}
                  {(skill.cooldownMs / 1000).toFixed(1)}초
                </small>
              </div>
              <button disabled={disabled} onClick={() => onUpgrade(skill.id)}>
                {cost.toLocaleString()} G
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
