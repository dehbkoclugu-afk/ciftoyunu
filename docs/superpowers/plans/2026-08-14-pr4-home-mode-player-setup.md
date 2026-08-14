# Home, Mode, and Player Setup Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship a tested `home → mode → players` flow with safe 2–8 player rules and opt-in local name persistence.

**Architecture:** Pure roster helpers define all limits and normalization. A versioned repository owns durable setup data, a focused Zustand store owns the live draft, and three Expo Router screens consume that store without introducing PR 5 pack behavior.

**Tech Stack:** Expo Router, React Native, TypeScript 6, Zustand 5, AsyncStorage adapter, Jest, Testing Library React Native

## Global Constraints

- Couple mode always has two players; Friends mode has two to eight.
- Player names and emoji are persisted only when `rememberPlayers` is true.
- Duplicate names warn without blocking completion.
- No dead Pack, Daily, Favorites, Premium, or Settings navigation is added.
- No new dependency is introduced.

---

### Task 1: Define roster rules with pure tests

**Files:**

- Create: `src/features/player-setup/playerSetup.ts`
- Test: `src/features/player-setup/playerSetup.test.ts`

**Interfaces:**

- Consumes: `GameMode`, `PlayerDraft[]`
- Produces: `createDefaultPlayers`, `reshapePlayersForMode`, `resolvePlayers`, `findDuplicatePlayerNames`

- [x] **Step 1: Write failing tests** for Couple/Friends limits, blank-name fallbacks, trimmed names, stable IDs, and case-insensitive duplicates.
- [x] **Step 2: Run `jest --runInBand src/features/player-setup/playerSetup.test.ts`** and confirm the missing module failure.
- [x] **Step 3: Implement the minimum pure types and helpers** with no React or storage dependency.
- [x] **Step 4: Run the focused test** and expect all roster-rule cases to pass.

### Task 2: Add private, versioned setup persistence

**Files:**

- Modify: `src/storage/keys.ts`
- Create: `src/storage/playerSetupRepository.ts`
- Test: `src/storage/playerSetupRepository.test.ts`

**Interfaces:**

- Consumes: `StorageAdapter`, `{ mode, players }`, `rememberPlayers`
- Produces: `PlayerSetupSnapshot` with safe defaults and quarantine recovery

- [x] **Step 1: Write failing repository tests** for mode round-trip, remembered roster round-trip, roster omission when disabled, and corrupt JSON quarantine.
- [x] **Step 2: Run the focused repository test** and verify missing exports fail.
- [x] **Step 3: Add `PLAYER_SETUP_KEY`, version, quarantine key, parser, and repository** following the existing settings repository pattern.
- [x] **Step 4: Run the focused repository tests** and verify private persistence behavior.

### Task 3: Build and hydrate the setup store

**Files:**

- Create: `src/state/gameSetupStore.ts`
- Test: `src/state/gameSetupStore.test.ts`
- Modify: `src/state/appStore.ts`
- Modify: `src/state/settingsStore.ts`

**Interfaces:**

- Consumes: hydrated settings, repository snapshot, user edits
- Produces: mode, player draft, ready state, persistence state, bounded actions

- [x] **Step 1: Write failing store tests** covering mode reshaping, add/remove limits, editing, completion, and failed persistence.
- [x] **Step 2: Run the focused store test** and confirm the missing store failure.
- [x] **Step 3: Implement the focused Zustand store and `setRememberPlayers`** without mixing session-engine state into settings.
- [x] **Step 4: Hydrate the setup store from `appStore.hydrate`** after settings are loaded.
- [x] **Step 5: Run focused store, route-decision, and settings tests** and expect all to pass.

### Task 4: Implement the Mode and Player screens

**Files:**

- Create: `app/mode.tsx`
- Create: `app/players.tsx`
- Create: `src/features/player-setup/ModeCard.tsx`
- Create: `src/features/player-setup/PlayerRow.tsx`
- Test: `src/features/player-setup/PlayerSetupScreen.test.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: game setup store actions and settings remember toggle
- Produces: accessible mode selection and keyboard-safe player editing flow

- [x] **Step 1: Write failing screen tests** for selected mode, two Couple rows, Friends add/remove bounds, duplicate notice, and completion navigation.
- [x] **Step 2: Run the focused screen and route tests** and verify missing screens/components fail.
- [x] **Step 3: Implement two large accessible Mode cards** with an explicit Continue action.
- [x] **Step 4: Implement keyboard-safe Player setup** using native `TextInput`, built-in emoji choices, and the existing primitives.
- [x] **Step 5: Run focused screen and route tests** and expect all interactions to pass.

### Task 5: Replace the demo Home with the real entry surface

**Files:**

- Modify: `app/home.tsx`
- Test: `src/features/player-setup/HomeScreen.test.tsx`

**Interfaces:**

- Consumes: validated embedded English content and completed setup state
- Produces: one primary Play action, real content preview, and honest setup-ready summary

- [x] **Step 1: Write a failing Home test** asserting one Play action, real bundle preview, Mode navigation, and completed-player summary.
- [x] **Step 2: Run the focused Home test** and confirm the old demo behavior fails.
- [x] **Step 3: Implement the minimum responsive editorial Home** without nonfunctional downstream actions.
- [x] **Step 4: Run Home and route tests** and expect both to pass.

### Task 6: Validate and publish stacked PR 4

**Files:**

- Modify: `docs/superpowers/plans/2026-08-14-pr4-home-mode-player-setup.md`
- Modify: `skill-observations/log.md`

**Interfaces:**

- Consumes: completed PR 4 tree
- Produces: green local checks and a draft PR targeting `agent/pr3-content-schema`

- [x] Run Prettier, ESLint with zero warnings, TypeScript, and all Jest suites.
- [x] Run content validation, duplicate scan, inventory report, and generated drift check.
- [x] Run Expo Doctor and web export; rely on GitHub Actions for Doctor only if local registry access is blocked.
- [ ] Flush task observations and close every plan checkbox.
- [ ] Commit intentionally, publish the branch, open the stacked draft PR, and wait for green CI.
