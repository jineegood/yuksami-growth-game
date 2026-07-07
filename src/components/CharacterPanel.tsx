import type { GameState, PlayerStats } from '../types/game';
import { getRequiredExp } from '../utils/formulas';

interface CharacterPanelProps {
  state: GameState;
  stats: PlayerStats;
}

export function CharacterPanel({ state, stats }: CharacterPanelProps) {
  return (
    <section className="panel">
      <div className="panel-title">
        <span>캐릭터</span>
        <strong>Lv.{state.player.level}</strong>
      </div>
      <div className="stat-grid">
        <Stat label="경험치" value={`${state.player.exp} / ${getRequiredExp(state.player.level)}`} />
        <Stat label="골드" value={state.player.gold.toLocaleString()} />
        <Stat label="공격력" value={stats.attack.toLocaleString()} />
        <Stat label="방어력" value={stats.defense.toLocaleString()} />
        <Stat label="최대 체력" value={stats.maxHp.toLocaleString()} />
        <Stat label="치명타 확률" value={`${(stats.critChance * 100).toFixed(2)}%`} />
        <Stat label="치명타 피해" value={`${(stats.critDamage * 100).toFixed(1)}%`} />
        <Stat label="처치 수" value={state.player.totalKills.toLocaleString()} />
        <Stat label="전투력" value={stats.combatPower.toLocaleString()} strong />
      </div>
    </section>
  );
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`stat-cell ${strong ? 'stat-strong' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
