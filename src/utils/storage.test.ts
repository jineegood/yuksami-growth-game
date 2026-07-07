import { describe, expect, it, vi } from 'vitest';
import { createDefaultGameState } from './formulas';
import { exportGame, importGame, loadGame, resetGame, saveGame } from './storage';

describe('storage', () => {
  it('loads a default game when storage is empty', () => {
    const storage = makeStorage();

    const state = loadGame(storage);

    expect(state.player.level).toBe(1);
    expect(state.settings.bgm).toBe(true);
    expect(state.pendingLevelUp).toBeNull();
  });

  it('round-trips saved game data', () => {
    const storage = makeStorage();
    const state = createDefaultGameState();
    state.player.level = 7;
    state.player.gold = 1234;

    saveGame(state, storage);
    const loaded = loadGame(storage);

    expect(loaded.player.level).toBe(7);
    expect(loaded.player.gold).toBe(1234);
    expect(loaded.lastSavedAt).toBeGreaterThan(0);
  });

  it('rejects malformed imports and keeps a useful error', () => {
    const result = importGame('{ bad json', makeStorage());

    expect(result.ok).toBe(false);
    expect(result.error).toContain('불러오기');
  });

  it('exports importable JSON and reset removes the saved key', () => {
    const storage = makeStorage();
    const state = createDefaultGameState();
    saveGame(state, storage);

    const exported = exportGame(state);
    const imported = importGame(exported, storage);

    expect(imported.ok).toBe(true);
    resetGame(storage);
    expect(loadGame(storage).player.level).toBe(1);
  });

  it('normalizes old saves into the simplified equipment and skill set', () => {
    const storage = makeStorage();
    const oldSave = createDefaultGameState() as any;
    oldSave.equipment.shoes = { level: 99 };
    oldSave.equipment.necklace = { level: 99 };
    oldSave.skills.basicAttack = { level: 99 };

    storage.setItem('yuksami-growth-save-v1', JSON.stringify(oldSave));
    const loaded = loadGame(storage);

    expect(Object.keys(loaded.equipment)).toEqual(['weapon', 'armor', 'gloves', 'ring']);
    expect(Object.keys(loaded.skills)).toEqual(['powerSlash', 'spinCut', 'heal']);
    expect(loaded.pendingLevelUp).toBeNull();
  });
});

function makeStorage(): Storage {
  let data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: vi.fn(() => {
      data = new Map();
    }),
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(data.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      data.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
}
