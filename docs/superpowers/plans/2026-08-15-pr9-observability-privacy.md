# Observability and Privacy Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Add privacy-gated typed analytics, stable experiment assignments, recoverable crash reporting, and user-facing privacy controls without collecting conversation content.

**Architecture:** Provider-neutral analytics and crash services isolate PostHog and Sentry. Persisted settings and an on-device anonymous ID configure both runtimes after boot; feature code emits typed domain events while a deterministic local registry supplies experiment assignments.

**Tech Stack:** TypeScript 6, Expo 57, React Native 0.86, Zustand, AsyncStorage, PostHog React Native 4.63.0, Sentry React Native 7.11.0, Jest

## Global Constraints

- Analytics and crash reporting default off and cannot initialize a network provider before explicit opt-in.
- Never send player names, answers, question copy, free-form report text, contact data, advertising IDs, touch autocapture, screenshots, replay, or default PII.
- Provider failure must never block boot, free play, purchase state, or error recovery.
- Keep remote flags, dashboards, attribution, source-map credentials, and release upload jobs outside this PR.

---

### Task 1: Pin SDKs and add release-safe runtime configuration

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Modify: `app.config.ts`
- Create: `metro.config.js`
- Modify: `scripts/validate-release-env.ts`
- Modify: `scripts/validate-release-env.test.ts`
- Create: `src/config/observability.ts`
- Create: `src/config/observability.test.ts`
- Modify: `jest.setup.ts`

**Interfaces:**

- Consumes: `POSTHOG_API_KEY`, `POSTHOG_HOST`, `SENTRY_DSN`, `EAS_BUILD_PROFILE`, Expo platform configuration
- Produces: `ObservabilityRuntimeConfig`, production config rejection, Sentry-compatible Metro config, isolated SDK mocks

- [x] **Step 1: Write failing configuration tests** for missing values, HTTPS host validation, preview unavailable state, valid config, and production-env rejection listing all observability variables.
- [x] **Step 2: Run `jest --runInBand src/config/observability.test.ts scripts/validate-release-env.test.ts`** and confirm the missing module/requirements fail.
- [x] **Step 3: Install exact stable SDKs and Expo-supported peers:** `posthog-react-native@4.63.0`, Expo-compatible `@sentry/react-native@7.11.0`, `expo-application@~57.0.2`, `expo-device@~57.0.1`, `expo-file-system@~57.0.3`, and `expo-crypto@~57.0.1`.
- [x] **Step 4: Expose public runtime values, add `@sentry/react-native/expo`, create Sentry Metro config, and extend production validation** without exposing upload tokens.
- [x] **Step 5: Add global Jest SDK mocks**, run focused tests, TypeScript, preview config success, and production missing-env rejection.

### Task 2: Build the typed analytics boundary and anonymous identity

**Files:**

- Create: `src/services/analytics/events.ts`
- Create: `src/services/analytics/types.ts`
- Create: `src/services/analytics/privacy.ts`
- Create: `src/services/analytics/runtime.ts`
- Create: `src/services/analytics/postHogAdapter.ts`
- Create: `src/services/analytics/memoryAdapter.ts`
- Create: `src/services/analytics/analytics.test.ts`
- Create: `src/storage/anonymousIdRepository.ts`
- Create: `src/storage/anonymousIdRepository.test.ts`
- Modify: `src/storage/keys.ts`

**Interfaces:**

- Consumes: typed event properties, common-context callback, privacy state, PostHog runtime config, `StorageAdapter`
- Produces: catalog-safe `track`, `configureAnalytics`, `setAnalyticsEnabled`, stable anonymous ID, in-memory captured events

- [x] **Step 1: Write failing catalog/runtime tests** for exact event names, common-property enrichment, disabled no-capture, opt-in identify/capture, immediate opt-out shutdown, provider failure isolation, and forbidden-key rejection.
- [x] **Step 2: Write failing anonymous-ID tests** for UUID persistence, reuse, corrupt-value replacement, and storage failure fallback.
- [x] **Step 3: Define the complete event catalog and adapter contract**, limiting values to JSON-safe primitives, arrays, and controlled records.
- [x] **Step 4: Implement the privacy validator and runtime** so forbidden data is rejected before reaching any adapter and SDK errors resolve without throwing into product code.
- [x] **Step 5: Implement manual-only PostHog and in-memory adapters** with no provider, autocapture, replay, surveys, or feature-flag coupling.
- [x] **Step 6: Implement the anonymous ID repository with `expo-crypto.randomUUID()`**, then run focused suites and TypeScript.

### Task 3: Add deterministic typed experiments

**Files:**

- Create: `src/experiments/registry.ts`
- Create: `src/experiments/assignments.ts`
- Create: `src/experiments/assignments.test.ts`

**Interfaces:**

- Consumes: persistent anonymous ID, typed experiment key, optional enabled equal-split definition
- Produces: stable variant, full `ExperimentAssignments`, control fallback

- [x] **Step 1: Write failing tests** for all six registered keys, disabled-control fallback, same-ID stability, different-ID distribution, and order-independent full assignments.
- [x] **Step 2: Implement one deterministic 32-bit hash and equal-split selection** with no dependency and no persistence beyond the anonymous ID.
- [x] **Step 3: Keep every production registry entry disabled** and expose selection through pure testable functions, then run focused tests and TypeScript.

### Task 4: Build the crash boundary and privacy-aware runtime

**Files:**

- Create: `src/services/crash/types.ts`
- Create: `src/services/crash/runtime.ts`
- Create: `src/services/crash/sentryAdapter.ts`
- Create: `src/services/crash/runtime.test.ts`
- Create: `src/components/feedback/AppErrorBoundary.tsx`
- Create: `src/components/feedback/AppErrorBoundary.test.tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**

- Consumes: crash consent, Sentry DSN, thrown errors, retry callback, router recovery
- Produces: gated initialization/capture/shutdown and a recoverable branded error surface

- [x] **Step 1: Write failing runtime tests** for disabled initialization, opt-in initialization, opt-out shutdown, capture gating, scrubbed Sentry configuration, and provider failure isolation.
- [x] **Step 2: Write failing boundary tests** for fallback copy, consent-aware capture, retry, and return-home recovery.
- [x] **Step 3: Implement the minimum crash runtime and Sentry adapter** with default PII, traces, replay, screenshots, and attachments disabled.
- [x] **Step 4: Implement and mount the provider-neutral error boundary** inside the theme provider and around the root stack while preserving safe-area and theme behavior.
- [x] **Step 5: Run crash/boundary suites, route smoke, TypeScript, and offline web export.**

### Task 5: Persist preferences and ship the Privacy & diagnostics screen

**Files:**

- Modify: `src/storage/migrations.ts`
- Modify: `src/storage/settingsRepository.test.ts`
- Modify: `src/state/settingsStore.ts`
- Create: `src/features/settings/PrivacySettingsScreen.tsx`
- Create: `src/features/settings/PrivacySettingsScreen.test.tsx`
- Create: `app/settings.tsx`
- Modify: `app/home.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: persisted privacy booleans and runtime enable/disable actions
- Produces: two default-off semantic switches, immediate persistence/runtime changes, privacy route

- [x] **Step 1: Add migration/store coverage** proving legacy settings default both controls off and explicit choices round-trip.
- [x] **Step 2: Add screen tests** for copy, switch roles/states, independent persistence, and route/home entry.
- [x] **Step 3: Extend settings data/actions and persist both booleans** through the existing repository without a version bump because migration already tolerates additive fields.
- [x] **Step 4: Build the settings receipt screen** using existing tokens/primitives, visible back, two switch rows, and a “Never collected” ledger; add one low-emphasis Home entry.
- [x] **Step 5: Run settings, screen, route, TypeScript, and accessibility-focused tests.**

### Task 6: Configure boot and instrument critical funnels

**Files:**

- Modify: `src/state/appStore.ts`
- Create: `src/state/appStore.test.ts`
- Modify: `app/onboarding/comfort.tsx`
- Modify: `app/mode.tsx`
- Modify: `app/players.tsx`
- Modify: `app/packs.tsx`
- Modify: `src/features/packs/PackDetailModal.tsx`
- Modify: `src/state/sessionStore.ts`
- Modify: `src/features/session/GameplayScreen.tsx`
- Modify: `src/features/session/RecapScreen.tsx`
- Modify: `src/features/paywall/PaywallScreen.tsx`
- Modify focused tests beside each affected surface/store

**Interfaces:**

- Consumes: hydrated settings, anonymous ID, current locale/theme/entitlement, user actions and stable content IDs
- Produces: privacy-gated activation, gameplay, recap, and monetization events with experiment assignments

- [x] **Step 1: Write boot tests** proving default-off configuration follows settings hydration and app readiness survives observability failure.
- [x] **Step 2: Add focused event assertions** for mode/player configuration, question actions, paywall operations, and boot, with the remaining boundaries covered by their existing interaction suites.
- [x] **Step 3: Configure common context and both runtimes in app boot**, capture `app_opened`, and keep boot readiness independent of all telemetry promises.
- [x] **Step 4: Instrument only central action boundaries** with controlled IDs/enum metadata; do not add provider imports or duplicated events to leaf presentation components.
- [x] **Step 5: Audit emitted payloads** for forbidden keys/free-form content and run all affected suites plus TypeScript.

### Task 7: Validate and publish stacked PR 9

**Files:**

- Modify: `docs/superpowers/plans/2026-08-15-pr9-observability-privacy.md`
- Modify: `skill-observations/log.md`

**Interfaces:**

- Consumes: completed PR 9 tree
- Produces: green local gates and a draft PR targeting `agent/pr8-purchases-paywall`

- [x] Run Prettier, ESLint with zero warnings, TypeScript, and all Jest suites.
- [x] Run content validation, duplicate scan, inventory report, and generated drift check.
- [x] Run preview and production env assertions, Expo config, Expo Doctor attempt, and offline web export.
- [x] Run forbidden-payload and provider-import audits across application code.
- [x] Read UI pre-delivery rules and audit settings semantics, layout growth, themes, touch targets, and Dynamic Type risk.
- [x] Flush task observations and close every plan checkbox.
- [x] Commit intentionally, publish `agent/pr9-observability-privacy`, open a stacked draft PR, and wait for green CI.
