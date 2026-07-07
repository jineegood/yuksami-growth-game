import { useEffect, useMemo, useState } from 'react';
import { CharacterPanel } from './components/CharacterPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { FriendBattleModal } from './components/FriendBattleModal';
import { GameScreen } from './components/GameScreen';
import { QuizModal } from './components/QuizModal';
import { SettingsPanel } from './components/SettingsPanel';
import { SkillPanel } from './components/SkillPanel';
import { useGameLoop } from './hooks/useGameLoop';
import type { ActiveTab, EquipmentSlot, GameState, SkillId } from './types/game';
import {
  applyLevelUpQuizResult,
  calculateStats,
  clampPlayerHp,
  cloneGameState,
  createDefaultGameState,
  getEquipmentUpgradeCost,
  getSkillUpgradeCost,
} from './utils/formulas';
import { gradeQuizSession } from './utils/quiz';
import { decodeGameCode, exportGame, importGame, loadGame, resetGame, saveGame } from './utils/storage';

const tabs: Array<{ id: ActiveTab; label: string }> = [
  { id: 'character', label: '캐릭터' },
  { id: 'equipment', label: '장비' },
  { id: 'skills', label: '스킬' },
  { id: 'settings', label: '설정' },
];

export default function App() {
  const [state, setState] = useState<GameState>(() => loadGame());
  const [activeTab, setActiveTab] = useState<ActiveTab>('character');
  const [friendBattle, setFriendBattle] = useState<GameState | null>(null);
  const [levelUpCelebration, setLevelUpCelebration] = useState(false);
  const runtime = useGameLoop({ state, setState, isPaused: Boolean(friendBattle) });
  const stats = useMemo(() => calculateStats(state), [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveGame(state);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [state]);

  const upgradeEquipment = (slot: EquipmentSlot) => {
    setState((previous) => {
      const level = previous.equipment[slot].level;
      const cost = getEquipmentUpgradeCost(slot, level);
      if (previous.player.gold < cost) {
        return previous;
      }

      const next = cloneGameState(previous);
      next.player.gold -= cost;
      next.equipment[slot].level += 1;
      return clampPlayerHp(next);
    });
  };

  const upgradeSkill = (skillId: SkillId) => {
    setState((previous) => {
      const level = previous.skills[skillId].level;
      const cost = getSkillUpgradeCost(skillId, level);
      if (previous.player.gold < cost) {
        return previous;
      }

      const next = cloneGameState(previous);
      next.player.gold -= cost;
      next.skills[skillId].level += 1;
      return next;
    });
  };

  const submitQuiz = (answers: Record<string, string>) => {
    if (!state.pendingLevelUp) {
      return;
    }

    const result = gradeQuizSession(state.pendingLevelUp.quiz, answers);
    setState((previous) => applyLevelUpQuizResult(previous, result.passed));
    if (result.passed) {
      setLevelUpCelebration(true);
      window.setTimeout(() => setLevelUpCelebration(false), 1800);
    }
  };

  const resetSave = () => {
    const ok = window.confirm('저장 데이터를 초기화할까요?');
    if (!ok) {
      return;
    }
    resetGame();
    setState(createDefaultGameState());
    setActiveTab('character');
  };

  const toggleSetting = (key: 'bgm' | 'sfx') => {
    setState((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        [key]: !previous.settings[key],
      },
    }));
  };

  const importSaveText = (text: string) => {
    const result = importGame(text);
    if (result.ok && result.state) {
      setState(result.state);
      return { ok: true, message: '내 캐릭터 불러오기 완료' };
    }
    return { ok: false, message: result.error ?? '내 캐릭터 불러오기 실패' };
  };

  const startFriendBattle = (code: string) => {
    try {
      const friend = decodeGameCode(code);
      setFriendBattle(friend);
      return { ok: true, message: '친구와 싸우기를 시작합니다.' };
    } catch {
      return { ok: false, message: '친구 코드를 읽을 수 없습니다.' };
    }
  };

  const createTestFriendCode = () => {
    const testFriend = createDefaultGameState();
    testFriend.player.level = Math.max(5, state.player.level + 2);
    testFriend.player.gold = 1200;
    testFriend.equipment.weapon.level = 4;
    testFriend.equipment.armor.level = 3;
    testFriend.equipment.gloves.level = 8;
    testFriend.equipment.ring.level = 3;
    testFriend.skills.powerSlash.level = 3;
    testFriend.skills.spinCut.level = 2;
    testFriend.skills.heal.level = 2;
    testFriend.player.hp = calculateStats(testFriend).maxHp;
    return exportGame(testFriend);
  };

  return (
    <main className="app-shell">
      <GameScreen state={state} stats={stats} runtime={runtime} />

      <nav className="bottom-tabs" aria-label="하단 메뉴">
        {tabs.map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="panel-wrap">
        {activeTab === 'character' && <CharacterPanel state={state} stats={stats} />}
        {activeTab === 'equipment' && <EquipmentPanel state={state} onUpgrade={upgradeEquipment} />}
        {activeTab === 'skills' && <SkillPanel state={state} onUpgrade={upgradeSkill} />}
        {activeTab === 'settings' && (
          <SettingsPanel
            state={state}
            onToggleBgm={() => toggleSetting('bgm')}
            onToggleSfx={() => toggleSetting('sfx')}
            onReset={resetSave}
            onExport={() => exportGame(state)}
            onImport={importSaveText}
            onStartFriendBattle={startFriendBattle}
            onCreateTestFriendCode={createTestFriendCode}
          />
        )}
      </div>

      {state.pendingLevelUp && <QuizModal pending={state.pendingLevelUp} onSubmit={submitQuiz} />}
      {levelUpCelebration && (
        <div className="level-up-celebration" aria-live="polite">
          <span>레벨업!</span>
        </div>
      )}
      {friendBattle && <FriendBattleModal mine={state} friend={friendBattle} onClose={() => setFriendBattle(null)} />}
    </main>
  );
}
