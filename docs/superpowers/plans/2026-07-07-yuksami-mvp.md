# 육삼이 키우기 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-only React/TypeScript MVP for "육삼이 키우기" with automatic battle, growth, equipment, skills, quests, shop items, settings, and localStorage persistence.

**Architecture:** Use Vite + React + TypeScript with game state owned by `App.tsx`. Keep formulas, save handling, static data, game loop logic, and panels in separate files so a backend can replace storage later without rewriting UI.

**Tech Stack:** React, TypeScript, Vite, Vitest, CSS, localStorage.

## Global Constraints

- Use original CSS/SVG-style visuals and original naming.
- Do not copy MapleStory names, characters, monsters, maps, UI assets, images, or sounds.
- No backend for MVP.
- Save game data in localStorage and preserve it after refresh.
- Run with `npm install` and `npm run dev`.
- Verify TypeScript with `npm run build`.
- Prioritize a playable growth-loop MVP over a large game.

---

### Task 1: Project Scaffold And Domain Tests

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/types/game.ts`
- Create: `src/data/equipment.ts`
- Create: `src/data/skills.ts`
- Create: `src/data/quests.ts`
- Create: `src/utils/formulas.ts`
- Create: `src/utils/formulas.test.ts`
- Create: `src/utils/storage.ts`
- Create: `src/utils/storage.test.ts`
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: `createDefaultGameState(): GameState`, `calculateStats(state: GameState): PlayerStats`, `createMonster(level: number): MonsterState`, `loadGame(): GameState`, `saveGame(state: GameState): void`

- [ ] **Step 1: Write failing formula and storage tests**

```ts
import { describe, expect, it } from 'vitest';
import { createDefaultGameState } from './formulas';

describe('createDefaultGameState', () => {
  it('starts a new player with level 1, no exp, and starter gold', () => {
    const state = createDefaultGameState();
    expect(state.player.level).toBe(1);
    expect(state.player.exp).toBe(0);
    expect(state.player.gold).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run`

Expected before implementation: tests fail because modules are not implemented.

- [ ] **Step 3: Implement project config, types, data, formulas, and storage**

Create Vite config, TypeScript config, domain types, static data, pure formula helpers, and safe localStorage helpers.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run`

Expected: formula and storage tests pass.

### Task 2: Game Loop And Actions

**Files:**
- Create: `src/hooks/useGameLoop.ts`
- Modify: `src/App.tsx`
- Modify: `src/utils/formulas.ts`
- Modify: `src/utils/formulas.test.ts`

**Interfaces:**
- Consumes: `GameState`, `calculateStats`, `createMonster`, `saveGame`
- Produces: `useGameLoop({ state, setState, pushNotice }): RuntimeGame`

- [ ] **Step 1: Add tests for leveling, rewards, and combat formulas**

```ts
it('allows exp overflow to level up more than once', () => {
  const state = createDefaultGameState();
  const result = applyExperience(state, 500);
  expect(result.player.level).toBeGreaterThan(1);
  expect(result.player.exp).toBeLessThan(getRequiredExp(result.player.level));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run`

Expected: missing `applyExperience` failure.

- [ ] **Step 3: Implement combat helpers and `useGameLoop`**

Use interval ticks for player attacks, monster attacks, skill cooldowns, death, respawn, revive, reward grants, level-ups, buff expiry, floating damage events, and autosave.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run`

Expected: formula tests pass.

### Task 3: Main Battle UI And Panels

**Files:**
- Create: `src/components/GameScreen.tsx`
- Create: `src/components/CharacterPanel.tsx`
- Create: `src/components/EquipmentPanel.tsx`
- Create: `src/components/SkillPanel.tsx`
- Create: `src/components/ShopPanel.tsx`
- Create: `src/components/QuestPanel.tsx`
- Create: `src/components/SettingsPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `RuntimeGame`, `GameState`, `PlayerStats`
- Produces: playable tabbed UI and action callbacks for upgrades, purchases, quests, reset, export, and import.

- [ ] **Step 1: Implement battle screen**

Render original CSS character, monster, scrolling background, HP/EXP bars, damage numbers, attack motion, hit motion, level-up sparkle, and gold notices.

- [ ] **Step 2: Implement tab panels**

Render Character, Equipment, Skill, Shop, Quest, and Settings panels with large responsive buttons and disabled states for insufficient gold or incomplete quests.

- [ ] **Step 3: Wire actions in `App.tsx`**

Add callbacks for equipment upgrade, skill upgrade, shop buy, quest claim, reset, export, and import.

### Task 4: Styling, Responsiveness, And Verification

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: complete app
- Produces: responsive playable MVP.

- [ ] **Step 1: Run type and production build**

Run: `npm run build`

Expected: TypeScript build succeeds.

- [ ] **Step 2: Run tests**

Run: `npm test -- --run`

Expected: all tests pass.

- [ ] **Step 3: Run dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite serves the game and the main screen is playable in browser.

- [ ] **Step 4: Manual checklist**

Verify automatic combat, monster death/respawn, EXP/gold gain, level-up, equipment upgrade, skill upgrade, quest claim, localStorage refresh persistence, export/import, and reset.

