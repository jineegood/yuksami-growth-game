import { useEffect, useMemo, useState } from 'react';
import type { GameState } from '../types/game';
import {
  createBattleCombatant,
  type BattleCombatant,
  type FriendBattleWinner,
  runFriendBattleRound,
} from '../utils/friendBattle';

interface FriendBattleModalProps {
  mine: GameState;
  friend: GameState;
  onClose: () => void;
}

export function FriendBattleModal({ mine, friend, onClose }: FriendBattleModalProps) {
  const initial = useMemo(
    () => ({
      mine: createBattleCombatant('나', mine),
      friend: createBattleCombatant('친구', friend),
    }),
    [friend, mine],
  );
  const [mineCombatant, setMineCombatant] = useState<BattleCombatant>(initial.mine);
  const [friendCombatant, setFriendCombatant] = useState<BattleCombatant>(initial.friend);
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState<FriendBattleWinner>(null);
  const [logs, setLogs] = useState<string[]>(['친구와 싸우기 시작!']);

  useEffect(() => {
    if (winner) {
      return;
    }

    const timer = window.setTimeout(() => {
      const result = runFriendBattleRound(mineCombatant, friendCombatant, round);
      setMineCombatant(result.mine);
      setFriendCombatant(result.friend);
      setRound((value) => value + 1);
      setWinner(result.winner);
      setLogs((current) => [...result.log, ...current].slice(0, 6));
    }, 800);

    return () => window.clearTimeout(timer);
  }, [friendCombatant, mineCombatant, round, winner]);

  useEffect(() => {
    if (!winner) {
      return;
    }
    setLogs((current) => [getWinnerText(winner), ...current].slice(0, 6));
  }, [winner]);

  return (
    <div className="battle-backdrop" role="dialog" aria-modal="true" aria-label="친구와 싸우기">
      <section className="battle-modal">
        <div className="battle-header">
          <span>친구와 싸우기</span>
          <strong>{winner ? getWinnerText(winner) : `${round}턴 진행 중`}</strong>
        </div>

        <div className="friend-arena">
          <CombatantView combatant={mineCombatant} />
          <div className="versus-mark">VS</div>
          <CombatantView combatant={friendCombatant} />
        </div>

        <div className="battle-log">
          {logs.map((log, index) => (
            <span key={`${log}-${index}`}>{log}</span>
          ))}
        </div>

        <button className="battle-close" onClick={onClose}>
          닫기
        </button>
      </section>
    </div>
  );
}

function CombatantView({ combatant }: { combatant: BattleCombatant }) {
  const hpPercent = Math.max(0, Math.min(100, (combatant.hp / combatant.maxHp) * 100));

  return (
    <div className="combatant-card">
      <strong>
        {combatant.name} Lv.{combatant.level}
      </strong>
      <div className="battle-avatar" />
      <div className="battle-hp">
        <span style={{ width: `${hpPercent}%` }} />
      </div>
      <small>
        HP {combatant.hp}/{combatant.maxHp}
      </small>
      <small>
        공격 {combatant.attack} · 방어 {combatant.defense}
      </small>
    </div>
  );
}

function getWinnerText(winner: FriendBattleWinner): string {
  if (winner === 'mine') {
    return '나의 승리!';
  }
  if (winner === 'friend') {
    return '친구 승리!';
  }
  if (winner === 'draw') {
    return '무승부!';
  }
  return '전투 중';
}
