import { describe, expect, it, vi } from 'vitest';
import { createDefaultGameState } from './formulas';
import { decodeGameCode, exportGame, importGame, loadGame, resetGame, saveGame } from './storage';

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
    expect(result.error).toContain('코드');
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

  it('exports an opaque character code without readable save numbers', () => {
    const state = createDefaultGameState();
    state.player.level = 12;
    state.player.gold = 98765;

    const exported = exportGame(state);

    expect(exported.startsWith('YSK1-')).toBe(true);
    expect(exported).not.toContain('"level"');
    expect(exported).not.toContain('98765');
    expect(decodeGameCode(exported).player.level).toBe(12);
  });

  it('rejects a character code when its contents are edited', () => {
    const state = createDefaultGameState();
    state.player.level = 8;
    const exported = exportGame(state);
    const tampered = `${exported.slice(0, -1)}${exported.endsWith('a') ? 'b' : 'a'}`;

    const result = importGame(tampered, makeStorage());

    expect(result.ok).toBe(false);
    expect(result.error).toContain('코드');
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
