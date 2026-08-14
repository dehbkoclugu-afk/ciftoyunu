# Gameplay and Recap Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship the complete offline free-pack play loop from session setup through resumable gameplay, favorites, and recap.

**Architecture:** Pure gameplay transforms create special cards and derive interaction state. An injectable Zustand store composes the PR 6 engine with two versioned persistence keys; route screens stay thin and consume immutable session snapshots.

**Tech Stack:** TypeScript 6, Expo Router, React Native 0.86, Zustand, AsyncStorage, Jest

## Global Constraints

- Never store player answers or include player names in share content.
- Every gesture has a visible button equivalent and every touch target is at least 44 points.
- Active sessions retain question snapshots and expire only when older than 24 hours.
- Premium entitlement and paywall behavior remain PR 8.
- Prefer React Native's native `PanResponder`; do not add a gesture dependency for one horizontal card action.

---

### Task 1: Add pure gameplay card transforms

**Files:**

- Create: `src/features/session/gameplay.ts`
- Create: `src/features/session/gameplay.test.ts`

**Interfaces:**

- Consumes: `SessionPlan`, players, pack ID, seed, dwell and gesture measurements
- Produces: `SessionCard[]`, text tier, swipe action, engagement class, recap metrics

- [x] **Step 1: Write failing tests** for 1/2/3 special counts, non-edge placement, seeded stability, type repetition maximum, immutable inputs, and `switch_starter` changing the next single starter.
- [x] **Step 2: Add failing tests** for 72-point/500-velocity swipe boundaries, 1/6-second dwell boundaries, long-text tiers, viewed-question extraction, and recap metrics.
- [x] **Step 3: Run `jest --runInBand src/features/session/gameplay.test.ts`** and confirm the missing module failure.
- [x] **Step 4: Implement the card union, nine original special definitions, deterministic insertion, starter switch, and small derivation helpers** using PR 6 `seededShuffle`.
- [x] **Step 5: Run the focused suite and TypeScript** and expect all pure gameplay tests to pass.

### Task 2: Persist active sessions and favorites

**Files:**

- Modify: `src/storage/keys.ts`
- Create: `src/storage/gameplayRepository.ts`
- Create: `src/storage/gameplayRepository.test.ts`

**Interfaces:**

- Consumes: `StorageAdapter`, `ActiveSession`, favorite question IDs, `now`
- Produces: versioned load/save/clear methods with independent quarantine recovery

- [x] **Step 1: Write failing tests** for empty load, active/favorite round-trips, exact 24-hour retention, stale-session removal, deduplicated favorites, independent corrupt-envelope quarantine, clear, and storage-provider failure.
- [x] **Step 2: Run the repository suite** and confirm the missing module failure.
- [x] **Step 3: Add active-session/favorites keys, versions, and quarantine helpers**, then implement strict-enough structural parsing and safe recovery following existing repositories.
- [x] **Step 4: Run repository tests and TypeScript** and expect persistence behavior to pass.

### Task 3: Add the resumable session state machine

**Files:**

- Create: `src/state/sessionStore.ts`
- Create: `src/state/sessionStore.test.ts`
- Modify: `src/state/appStore.ts`

**Interfaces:**

- Consumes: session start request, gameplay repository, seen-history repository, clock
- Produces: `activeSession`, favorites, persistence status, and async gameplay actions

- [x] **Step 1: Write failing tests** for hydration, engine-backed start, first-card seen marking, persistence, next/skip/report outcomes, exact dwell classes, automatic completion, and resume.
- [x] **Step 2: Add failing tests** proving favorites never advance, keeper selection is limited to viewed questions, clear retains favorites, and storage failures do not block play.
- [x] **Step 3: Run the store suite** and confirm the missing module failure.
- [x] **Step 4: Implement `createSessionStore` and the default store**, keeping clock/storage dependencies injectable and all card snapshots immutable.
- [x] **Step 5: Hydrate the session store during app boot**, then run focused tests and TypeScript.

### Task 4: Build and connect session setup

**Files:**

- Create: `src/features/session/SessionSetupScreen.tsx`
- Create: `src/features/session/SessionSetupScreen.test.tsx`
- Create: `app/session-setup.tsx`
- Modify: `app/packs.tsx`
- Modify: `src/features/packs/PackLibraryScreen.test.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: selected pack, bundle, players, policy settings
- Produces: default 20/Mixed start request and navigation to `/play`

- [x] **Step 1: Write failing screen tests** for Standard/Mixed defaults, duration estimates, exclusion chips, mature-policy visibility, missing content, start loading/error, and successful navigation.
- [x] **Step 2: Update the pack test** to require free-pack selection to open setup and the route smoke test to import the new route.
- [x] **Step 3: Run focused tests** and confirm missing route/screen failures.
- [x] **Step 4: Implement the setup screen and route**, using existing chips/buttons/tokens and no settings-dashboard chrome.
- [x] **Step 5: Wire free pack selection to setup**, then run focused tests and TypeScript.

### Task 5: Build accessible gameplay, gestures, and pause

**Files:**

- Create: `src/features/session/SessionProgress.tsx`
- Create: `src/features/session/QuestionCard.tsx`
- Create: `src/features/session/PauseSheet.tsx`
- Create: `src/features/session/GameplayScreen.tsx`
- Create: `src/features/session/GameplayScreen.test.tsx`
- Create: `app/play.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: active session/store actions and horizontal pan gestures
- Produces: progress, responsive/RTL cards, button equivalents, pause/report/end navigation

- [x] **Step 1: Use React Native's native `PanResponder`** with a horizontal threshold and no new dependency.
- [x] **Step 2: Write failing tests** for missing-session redirect, progress accessibility, starter copy, long/RTL question rendering, favorite non-advance, Pass/Next, and completed navigation.
- [x] **Step 3: Add failing pause tests** for Continue, another question, report confirmation, filter-change confirmation, early exit, and recap exit after five questions.
- [x] **Step 4: Run focused tests** and confirm the gameplay surfaces are missing.
- [x] **Step 5: Implement progress, question/special cards, gesture translation, and visible actions**, using restrained state-transition motion only.
- [x] **Step 6: Implement the pause sheet and route decisions**, then run focused tests and TypeScript.

### Task 6: Build recap, favorites, sharing, and Home resume

**Files:**

- Create: `src/features/session/RecapScreen.tsx`
- Create: `src/features/session/RecapScreen.test.tsx`
- Create: `src/features/favorites/FavoritesScreen.tsx`
- Create: `src/features/favorites/FavoritesScreen.test.tsx`
- Create: `app/recap.tsx`
- Create: `app/favorites.tsx`
- Modify: `app/home.tsx`
- Modify: `src/features/player-setup/HomeScreen.test.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: completed/unfinished session, resolved locale questions, native Share
- Produces: recap metrics/actions, keeper selection, filtered saved-question viewer, resume entry point

- [x] **Step 1: Write failing recap tests** for viewed/favorite/time metrics, keeper selection, privacy-safe share text, share cancellation/error, replay, pack selection, favorites, and Done.
- [x] **Step 2: Write failing favorites tests** for empty state, unavailable-ID hiding, pack/topic filters, one-card navigation, and unfavorite.
- [x] **Step 3: Extend Home tests** for Resume and View recap actions, then run focused tests and confirm failures.
- [x] **Step 4: Implement recap and favorites screens/routes** with existing design tokens and accessible controls.
- [x] **Step 5: Add the Home resume/recap entry point**, run all focused suites and TypeScript, and perform a visible-copy self-audit.

### Task 7: Validate and publish stacked PR 7

**Files:**

- Modify: `docs/superpowers/plans/2026-08-14-pr7-gameplay-recap.md`
- Modify: `skill-observations/log.md`

**Interfaces:**

- Consumes: completed PR 7 tree
- Produces: green local checks and a draft PR targeting `agent/pr6-session-engine`

- [x] Run Prettier, ESLint with zero warnings, TypeScript, and all Jest suites.
- [x] Run content validation, duplicate scan, inventory report, and generated drift check.
- [x] Run Expo Doctor and web export.
- [x] Perform one batched mobile/desktop UI audit, apply material fixes, and confirm once. The offline Playwright runner remained unavailable, so this used responsive source/test coverage plus the production web bundle rather than screenshots.
- [x] Read the UI pre-delivery rules, flush task observations, and close every plan checkbox.
- [ ] Commit intentionally, publish the branch, open the stacked draft PR, and wait for green CI.
