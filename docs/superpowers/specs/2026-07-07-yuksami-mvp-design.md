# 육삼이 키우기 MVP Design

## Goal

Build a browser-only MVP for "육삼이 키우기", a cute 2D side-scrolling idle growth RPG inspired by the strengths of Maple-like games: compact characters, automatic hunting, level growth, equipment upgrades, skill upgrades, currency collection, and repeatable quests.

The game will use original CSS/SVG-style visuals and original naming. It will not copy MapleStory names, characters, monsters, maps, UI assets, images, or sounds.

## Scope

The MVP must run with `npm install` and `npm run dev`, with no backend. Game state persists in `localStorage` and survives refreshes.

Included:

- Main 2D side-scrolling battle scene with player, monster, sky, grass, clouds, attack motion, hit feedback, floating damage numbers, gold notices, and level-up sparkle.
- Automatic combat where the player and monster attack on timers, skills fire on cooldown, monsters respawn, and the player revives automatically after death.
- Character stats panel with level, EXP, gold, attack, defense, max HP, crit chance, and combat power.
- Equipment panel with weapon, armor, gloves, shoes, ring, and necklace upgrades.
- Skill panel with basic attack, power slash, spin cut, and heal upgrades.
- Shop panel with HP potion and temporary attack, EXP, and gold buffs.
- Quest panel with monster kills, gold collection, and level milestone reward claiming.
- Settings panel with reset, sound toggles, export, and import.

Out of scope:

- Backend, accounts, database, real-money systems, network saves, audio assets, copyrighted assets, multiplayer, and large content progression.

## Architecture

Use a new Vite + React + TypeScript project because the repository is currently empty.

Core files:

- `src/types/game.ts`: state and domain types.
- `src/data/equipment.ts`: equipment slot definitions, stat types, and upgrade cost metadata.
- `src/data/skills.ts`: skill definitions, cooldowns, multipliers, and upgrade cost metadata.
- `src/data/quests.ts`: quest definitions and reward metadata.
- `src/utils/formulas.ts`: level, combat, monster, reward, equipment, and skill formulas.
- `src/utils/storage.ts`: localStorage load, save, reset, export, and import helpers.
- `src/hooks/useGameLoop.ts`: automatic combat tick, cooldown handling, monster respawn, revive, rewards, level-up, buffs, and autosave.
- `src/components/*Panel.tsx`: tab panels for each menu.
- `src/components/GameScreen.tsx`: battle scene and animation rendering.
- `src/styles/global.css`: responsive layout, cute RPG styling, CSS characters, and animations.

The state is owned by `App.tsx` for the MVP. Formula and storage helpers are pure or mostly pure so they can later move behind a backend/API layer.

## Data Flow

`App.tsx` loads saved data from `localStorage` once on startup, initializes runtime-only combat state, and passes state/actions into panels.

`useGameLoop` updates combat state on an interval:

- Player attacks if alive and the monster is alive.
- Skill cooldowns are checked and eligible skills are used automatically.
- Monster attacks the player on its timer.
- Monster death grants EXP, gold, kill progress, and respawns a stronger monster.
- EXP overflow can trigger one or more level-ups.
- Player death starts a revive timer and restores HP after the delay.
- State autosaves regularly and after meaningful user actions.

Panels call typed action helpers to buy items, enhance equipment, level skills, claim quests, reset saves, export saves, and import saves.

## Formulas

Initial formulas follow the requested MVP values and remain centralized:

- Required EXP: `100 + level * 50`
- Attack: `10 + level * 3 + equipmentAttack + skillPassiveAttack + buffs`
- Defense: `2 + level + equipmentDefense`
- Max HP: `100 + level * 20 + equipmentHp`
- Monster HP: `30 + playerLevel * 15`
- Monster attack: `5 + playerLevel * 2`
- Monster gold: `10 + playerLevel * 5`
- Monster EXP: `20 + playerLevel * 8`

Upgrade costs and stat gains are also centralized so balance can be tuned without rewriting UI components.

## UI Design

The first screen is the playable game, not a landing page. It uses a bright 2D side-scrolling composition: sky, clouds, layered hills, grass, player on the left, monster on the right, and large readable stat bars.

The bottom menu uses large touch-friendly buttons for Character, Equipment, Skill, Shop, Quest, and Settings. Panels are compact, scannable, and responsive for mobile and desktop.

The visual direction should feel close to a cute 2D RPG growth game while staying original through simple CSS/SVG shapes, custom names, and custom UI treatment.

## Error Handling

Storage import validates the basic shape before replacing current data. If import fails, the UI shows a short error message and keeps the current save.

Insufficient gold disables or rejects upgrade and purchase actions with clear button text or feedback.

If a corrupted localStorage save is found, the game falls back to a fresh default save instead of crashing.

## Testing And Verification

Add focused tests for formulas and storage-safe parsing if a test runner is available during setup. Always run TypeScript build verification with `npm run build`.

Manual MVP verification:

- Automatic combat runs.
- Monster can die and respawn.
- EXP and gold increase.
- Level-up changes stats.
- Equipment and skill upgrades spend gold and increase power.
- Quest rewards can be claimed once.
- Save survives refresh.
- Reset clears progress.
- Export/import round-trips data.

