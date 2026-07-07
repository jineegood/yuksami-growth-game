import type { GameState, PlayerStats, RuntimeGame } from '../types/game';
import { getActiveBuffLabels, getRequiredExp } from '../utils/formulas';

interface GameScreenProps {
  state: GameState;
  stats: PlayerStats;
  runtime: RuntimeGame;
}

export function GameScreen({ state, stats, runtime }: GameScreenProps) {
  const hpPercent = toPercent(state.player.hp, stats.maxHp);
  const expPercent = toPercent(state.player.exp, getRequiredExp(state.player.level));
  const monsterHpPercent = toPercent(runtime.monster.hp, runtime.monster.maxHp);
  const buffLabels = getActiveBuffLabels(state);

  return (
    <section
      className={`game-screen ${runtime.isLevelUp ? 'level-flash' : ''} ${state.pendingLevelUp ? 'quiz-paused' : ''}`}
      aria-label="메인 전투 화면"
    >
      <div className="top-hud">
        <div className="brand-block">
          <span className="eyebrow">2D 성장 RPG</span>
          <h1>육삼이 키우기</h1>
        </div>
        <div className="currency-pill">
          <span>골드</span>
          <strong>{state.player.gold.toLocaleString()}</strong>
        </div>
      </div>

      <div className="bar-grid">
        <StatusBar label={`HP ${state.player.hp}/${stats.maxHp}`} value={hpPercent} tone="hp" />
        <StatusBar label={`EXP ${state.player.exp}/${getRequiredExp(state.player.level)}`} value={expPercent} tone="exp" />
      </div>

      <div className="stage">
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <div className="hill hill-back" />
        <div className="hill hill-front" />
        <div className="ground-stripe" />

        <div className="player-zone">
          <div className="nameplate">Lv.{state.player.level} 육삼이</div>
          <div className={`hero ${runtime.isPlayerAttacking ? 'hero-attack' : ''} ${runtime.isPlayerDown ? 'hero-down' : ''}`}>
            <div className="hero-hair" />
            <div className="hero-face">
              <span className="eye eye-left" />
              <span className="eye eye-right" />
              <span className="smile" />
            </div>
            <div className="hero-body" />
            <div className="hero-arm hero-arm-left" />
            <div className="hero-arm hero-arm-right" />
            <div className="hero-weapon" />
          </div>
        </div>

        <div className="monster-zone">
          <div className="nameplate">
            Lv.{runtime.monster.level} {runtime.monster.name}
          </div>
          <div className="monster-hp">
            <span style={{ width: `${monsterHpPercent}%` }} />
          </div>
          <div
            className={`monster ${runtime.monster.visual.familyClass} ${runtime.monster.visual.variantClass} ${
              runtime.isMonsterHit ? 'monster-hit' : ''
            }`}
          >
            <span className="monster-eye monster-eye-left" />
            <span className="monster-eye monster-eye-right" />
            <span className="monster-mouth" />
          </div>
        </div>

        {runtime.activeSkillEffect && <div className={`skill-effect effect-${runtime.activeSkillEffect}`} />}

        {runtime.floatingTexts.map((item) => (
          <span key={item.id} className={`floating floating-${item.target} tone-${item.tone}`}>
            {item.text}
          </span>
        ))}

        {runtime.notices.map((item) => (
          <span key={item.id} className={`notice tone-${item.tone}`}>
            {item.text}
          </span>
        ))}

        {runtime.reviveLeftMs > 0 && (
          <div className="revive-badge">쓰러짐 · {Math.ceil(runtime.reviveLeftMs / 1000)}초 후 부활</div>
        )}

        {state.pendingLevelUp && (
          <div className="revive-badge quiz-badge">영단어 퀴즈 진행 중</div>
        )}
      </div>

      <div className="quick-stats">
        <span>전투력 {stats.combatPower.toLocaleString()}</span>
        <span>공격 {stats.attack}</span>
        <span>방어 {stats.defense}</span>
        <span>치명 {(stats.critChance * 100).toFixed(2)}%</span>
      </div>

      {buffLabels.length > 0 && (
        <div className="buff-row">
          {buffLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
    </section>
  );
}

interface StatusBarProps {
  label: string;
  value: number;
  tone: 'hp' | 'exp';
}

function StatusBar({ label, value, tone }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-label">{label}</div>
      <div className={`bar-track bar-${tone}`}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function toPercent(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (value / max) * 100));
}
