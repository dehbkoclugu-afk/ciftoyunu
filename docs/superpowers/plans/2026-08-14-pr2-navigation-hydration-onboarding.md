# Navigation, Hydration, and Onboarding Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Deliver deterministic boot routing, a three-screen onboarding flow, and versioned local settings persistence.

**Architecture:** Expo Router owns navigation, Zustand owns hydrated application/settings state, and AsyncStorage is accessed only through a versioned adapter. Pure locale, migration, and route-decision functions carry the testable behavior.

**Tech Stack:** Expo SDK 57, Expo Router, React Native, Zustand 5, AsyncStorage 2.2, Expo Localization, Expo Splash Screen, Jest, React Native Testing Library.

## Global Constraints

- Preserve the PR 1 design system and keep the existing demo available at /home.
- Never block launch on storage failure.
- Never enable mature content without explicit 18+ confirmation.
- Do not add translated question content in this PR.

---

### Task 1: Install PR 2 runtime dependencies

**Files:** Modify package.json and package-lock.json.

**Interfaces:** Consume Expo SDK 57 bundled versions; produce AsyncStorage, localization, splash, and Zustand dependencies.

- [x] Confirm Expo-bundled native versions.
- [x] Install the minimum four dependencies.
- [x] Run dependency and type validation.
- [x] Commit dependency changes with the PR slice.

### Task 2: Add locale catalog and selection

**Files:** Create src/i18n/localeCatalog.ts, src/i18n/localeCatalog.test.ts, and src/i18n/index.ts.

**Interfaces:** Consume a device locale string; produce SupportedLocale, native labels, and RTL metadata.

- [x] Write failing normalization tests.
- [x] Verify the missing-module failure.
- [x] Implement locale normalization and catalog.
- [x] Run the locale tests.
- [x] Commit with the remaining PR implementation.

### Task 3: Add versioned settings storage

**Files:** Create src/storage/keys.ts, adapter.ts, migrations.ts, settingsRepository.ts, settingsRepository.test.ts, and src/state/settingsStore.ts.

**Interfaces:** Consume unknown persisted settings and a StorageAdapter; produce normalized SettingsData, quarantine-on-corruption, and settings actions.

- [x] Write failing migration and quarantine tests.
- [x] Verify expected missing exports.
- [x] Implement defaults, migration, repository, and store.
- [x] Run storage tests.
- [x] Commit with the remaining PR implementation.

### Task 4: Coordinate hydration and routing

**Files:** Create src/state/appStore.ts, routeDecision.ts, routeDecision.test.ts, modify app/_layout.tsx and app/index.tsx, and create app/home.tsx.

**Interfaces:** Consume hydration state and onboardingCompleted; produce no premature render, then onboarding or home redirect.

- [x] Write failing route-decision tests.
- [x] Verify expected failure.
- [x] Implement boot store, splash coordination, redirects, and home move.
- [x] Run route and component tests.
- [x] Commit with the remaining PR implementation.

### Task 5: Build the onboarding screens

**Files:** Create shared onboarding components, comfortPolicy.ts/tests, and the three app/onboarding routes.

**Interfaces:** Consume settings actions and Expo Router; produce persisted locale, explicit age/comfort state, and onboarding completion.

- [x] Write failing mature-content policy tests.
- [x] Verify expected failure.
- [x] Implement shared components and screens.
- [x] Verify accessibility states and navigation.
- [x] Commit with the remaining PR implementation.

### Task 6: Validate and publish the stacked PR

**Files:** Modify skill-observations/log.md.

**Interfaces:** Consume the completed tree; produce green checks and a draft PR targeting agent/pr1-bootstrap.

- [x] Run Prettier, ESLint, TypeScript, and Jest.
- [x] Run Expo Doctor and web export.
- [x] Perform one bounded onboarding UI inspection.
- [x] Flush task observations.
- [x] Commit, publish, and open the draft PR.
