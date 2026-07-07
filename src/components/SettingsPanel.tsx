import { useState } from 'react';
import type { GameState } from '../types/game';

interface SettingsPanelProps {
  state: GameState;
  onToggleBgm: () => void;
  onToggleSfx: () => void;
  onReset: () => void;
  onExport: () => string;
  onImport: (text: string) => { ok: boolean; message: string };
  onStartFriendBattle: (code: string) => { ok: boolean; message: string };
  onCreateTestFriendCode: () => string;
}

export function SettingsPanel({
  state,
  onToggleBgm,
  onToggleSfx,
  onReset,
  onExport,
  onImport,
  onStartFriendBattle,
  onCreateTestFriendCode,
}: SettingsPanelProps) {
  const [saveText, setSaveText] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [message, setMessage] = useState('');

  return (
    <section className="panel">
      <div className="panel-title">
        <span>설정</span>
        <strong>저장</strong>
      </div>

      <div className="settings-grid">
        <button className={state.settings.bgm ? 'toggle-active' : ''} onClick={onToggleBgm}>
          배경음 {state.settings.bgm ? 'ON' : 'OFF'}
        </button>
        <button className={state.settings.sfx ? 'toggle-active' : ''} onClick={onToggleSfx}>
          효과음 {state.settings.sfx ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => {
            setSaveText(onExport());
            setMessage('내 캐릭터 저장하기 완료');
          }}
        >
          내 캐릭터 저장하기
        </button>
        <button
          onClick={() => {
            const result = onImport(saveText);
            setMessage(result.message);
          }}
        >
          내 캐릭터 불러오기
        </button>
      </div>

      <textarea
        value={saveText}
        onChange={(event) => setSaveText(event.target.value)}
        spellCheck={false}
        aria-label="게임 데이터"
      />

      <div className="friend-code-box">
        <div className="panel-title compact-title">
          <span>친구와 싸우기</span>
          <strong>코드 대전</strong>
        </div>
        <textarea
          value={friendCode}
          onChange={(event) => setFriendCode(event.target.value)}
          spellCheck={false}
          aria-label="친구 캐릭터 코드"
          placeholder="친구가 저장한 캐릭터 코드를 붙여넣으세요."
        />
        <div className="settings-grid friend-actions">
          <button
            onClick={() => {
              setFriendCode(onCreateTestFriendCode());
              setMessage('테스트 친구 코드 생성 완료');
            }}
          >
            테스트 친구 코드 만들기
          </button>
          <button
            onClick={() => {
              const result = onStartFriendBattle(friendCode);
              setMessage(result.message);
            }}
          >
            친구와 싸우기
          </button>
        </div>
      </div>

      <div className="settings-footer">
        <span>{message || `마지막 저장 ${formatSavedAt(state.lastSavedAt)}`}</span>
        <button className="danger-button" onClick={onReset}>
          저장 초기화
        </button>
      </div>
    </section>
  );
}

function formatSavedAt(value: number): string {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
