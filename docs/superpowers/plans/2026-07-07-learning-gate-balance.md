# Learning Gate And Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add vocabulary quiz level-up gates, simplify menus/equipment/skills, rebalance monsters and death, and update save/import wording.

**Architecture:** Keep game state in `App.tsx`, pure learning/combat helpers in `src/utils`, static vocabulary and definitions in `src/data`, and visual rendering in components/CSS. `useGameLoop` pauses whenever a quiz session is active.

**Tech Stack:** React, TypeScript, Vite, Vitest, CSS, localStorage.

## Global Constraints

- No server is required for this change.
- Keep the game playable as a browser-only static web app.
- Do not use external paid assets.
- Use original CSS-based visuals.
- Preserve localStorage save/load behavior with normalization for older saves.

---

### Task 1: Learning And Balance Domain

**Files:**
- Create: `src/data/vocabulary.ts`
- Create: `src/utils/quiz.ts`
- Create: `src/utils/quiz.test.ts`
- Modify: `src/types/game.ts`
- Modify: `src/data/equipment.ts`
- Modify: `src/data/skills.ts`
- Modify: `src/utils/formulas.ts`
- Modify: `src/utils/formulas.test.ts`
- Modify: `src/utils/storage.ts`
- Modify: `src/utils/storage.test.ts`

**Interfaces:**
- Produces: `createQuizSession`, `gradeQuizSession`, `applyLevelUpQuizResult`, `getMonsterVisual`, updated `GameState`.

- [ ] Write failing tests for quiz generation, quiz pass/fail, equipment/skill defaults, and monster scaling.
- [ ] Run `pnpm exec vitest run` and confirm failures.
- [ ] Implement vocabulary data, quiz helpers, new equipment/skill data, formula changes, and storage normalization.
- [ ] Run `pnpm exec vitest run` and confirm pass.

### Task 2: Game Loop And Actions

**Files:**
- Modify: `src/hooks/useGameLoop.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: quiz helpers and updated state.
- Produces: paused combat during quiz, 10-second player knockdown revive, skill effects, and four-tab actions.

- [ ] Pause `useGameLoop` while quiz is active.
- [ ] Trigger quiz session instead of instant level-up when EXP crosses threshold.
- [ ] Apply quiz pass/fail results from `App.tsx`.
- [ ] Remove shop/quest actions and tabs.
- [ ] Add skill effect state for power slash, spin cut, and heal.

### Task 3: UI And Styling

**Files:**
- Create: `src/components/QuizModal.tsx`
- Modify: `src/components/GameScreen.tsx`
- Modify: `src/components/CharacterPanel.tsx`
- Modify: `src/components/EquipmentPanel.tsx`
- Modify: `src/components/SkillPanel.tsx`
- Modify: `src/components/SettingsPanel.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: quiz session, monster visual metadata, skill effect state.
- Produces: quiz modal, knocked-down player visual, monster family/color variants, skill effects, and simplified UI.

- [ ] Add quiz modal with 3 multiple choice questions and result submission.
- [ ] Update battle scene for player knocked-down state and monster variants.
- [ ] Update panels to remove deleted content and use revised labels.
- [ ] Add CSS effects for each remaining skill.

### Task 4: Verification

**Files:**
- All changed files.

- [ ] Run `pnpm exec vitest run`.
- [ ] Run `pnpm run build`.
- [ ] Verify local page at `http://localhost:4173/` responds.
- [ ] Browser-check that quiz appears on level-up and combat text renders.

