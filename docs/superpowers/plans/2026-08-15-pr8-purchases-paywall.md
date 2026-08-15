# Purchases and Paywall Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship a real RevenueCat-backed premium boundary with transparent pricing, verified entitlement, purchase/restore recovery, and contextual access from premium packs.

**Architecture:** Provider-neutral purchase types and a single adapter isolate `react-native-purchases`. An injectable Zustand store owns the complete state machine; screens consume domain DTOs and the existing session engine remains the final entitlement guard.

**Tech Stack:** TypeScript 6, Expo 57, React Native 0.86, Expo Router, Zustand, RevenueCat `react-native-purchases` 10.7.1, Jest

## Global Constraints

- Never hard-code price or trial amounts and never grant premium without a verified `premium` entitlement.
- Never select a mock adapter automatically; missing preview configuration must remain an explicit unavailable state.
- Purchase initialization must not block boot longer than four seconds or block free play on failure.
- Keep analytics, experiments, settings, remote paywalls, and store-dashboard configuration outside PR 8.

---

### Task 1: Pin the SDK and add release-safe configuration

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Modify: `app.config.ts`
- Create: `src/config/purchases.ts`
- Create: `src/config/purchases.test.ts`
- Create: `scripts/validate-release-env.ts`
- Create: `scripts/validate-release-env.test.ts`

**Interfaces:**

- Consumes: Expo `extra`, `Platform.OS`, `EAS_BUILD_PROFILE`, platform SDK keys, Terms and Privacy URLs
- Produces: `PurchaseRuntimeConfig` or an explicit unavailable reason; failing production-env validation

- [x] **Step 1: Write failing config tests** with cases equivalent to:
  ```ts
  expect(resolvePurchaseRuntimeConfig('ios', { revenueCatIosApiKey: 'appl_x' })).toEqual({
    available: true,
    apiKey: 'appl_x',
  });
  expect(resolvePurchaseRuntimeConfig('web', {})).toEqual({
    available: false,
    reason: 'unsupported_platform',
  });
  expect(() => validateReleaseEnv({ EAS_BUILD_PROFILE: 'production' })).toThrow(
    /REVENUECAT_IOS_API_KEY/,
  );
  ```
- [x] **Step 2: Run `jest --runInBand src/config/purchases.test.ts scripts/validate-release-env.test.ts`** and confirm missing-module failures.
- [x] **Step 3: Install `react-native-purchases@10.7.1`, add `release:env:check`, expose keys/legal URLs through Expo `extra`, and implement pure configuration helpers** without logging key values.
- [x] **Step 4: Run the focused tests, TypeScript, `EAS_BUILD_PROFILE=preview npm run release:env:check`, and a production missing-env failure assertion.**

### Task 2: Build the provider-neutral adapter

**Files:**

- Create: `src/services/purchases/types.ts`
- Create: `src/services/purchases/revenueCatAdapter.ts`
- Create: `src/services/purchases/revenueCatAdapter.test.ts`
- Create: `src/services/purchases/unavailableAdapter.ts`

**Interfaces:**

- Consumes: RevenueCat customer info, current offering, package, purchase, restore, and customer-update callbacks
- Produces: `PurchaseCustomer`, `PurchaseOffering`, `PurchaseResult`, classified `PurchaseFailure`, and `PurchasesAdapter`

- [x] **Step 1: Write failing adapter tests** that mock the SDK and assert `premium` entitlement mapping, store price/trial text preservation, annual-first ordering metadata, cancellation classification, offline/configuration classification, verified purchase/restore results, and listener removal.
- [x] **Step 2: Run `jest --runInBand src/services/purchases/revenueCatAdapter.test.ts`** and confirm missing-module failures.
- [x] **Step 3: Define the DTOs and adapter contract**, then map only current offering packages into immutable domain values; package purchase must resolve by stable package ID.
- [x] **Step 4: Implement the unavailable adapter** so every method returns its configured reason and can never return premium or purchase success.
- [x] **Step 5: Run the focused adapter suite and TypeScript** and expect all provider details to remain inside this folder.

### Task 3: Implement the purchase state machine and boot hydration

**Files:**

- Create: `src/state/purchaseStore.ts`
- Create: `src/state/purchaseStore.test.ts`
- Modify: `src/state/appStore.ts`

**Interfaces:**

- Consumes: `PurchasesAdapter`, `PurchaseRuntimeConfig`, clock, four-second timeout
- Produces: purchase state, verified entitlement, offering, and guarded `hydrate`, `refresh`, `purchase`, `restore`, `resetResult` actions

- [x] **Step 1: Write failing store tests** for unconfigured, loading-to-ready, offline, empty offering, configuration error, exact timeout, listener update, and free app boot after failure.
- [x] **Step 2: Add failing operation tests** for duplicate purchase/restore guards, cancellation without error, verified success, success-without-entitlement rejection, purchase error, restore success, nothing-to-restore, restore error, and retained selected offering after retry.
- [x] **Step 3: Run `jest --runInBand src/state/purchaseStore.test.ts`** and confirm the store is missing.
- [x] **Step 4: Implement `createPurchaseStore` and the production-composed store** with one subscription, immutable offering state, and a bounded timeout that does not cancel free boot.
- [x] **Step 5: Hydrate purchases alongside settings, setup, and session state in `appStore`**, then run store tests and TypeScript.

### Task 4: Build the complete paywall surface

**Files:**

- Create: `src/features/paywall/PaywallScreen.tsx`
- Create: `src/features/paywall/PaywallScreen.test.tsx`
- Create: `app/premium.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: purchase store state, optional `packId`, localized pack copy, legal URLs
- Produces: plan selection, purchase/restore/retry/close actions, legal navigation, and post-success continuation

- [x] **Step 1: Write failing screen tests** for loading, ready, annual default, store-sourced prices, trial/renewal detail, plan radio semantics, close, purchase busy lock, cancellation, error retry, restore, and success continuation.
- [x] **Step 2: Add failing tests** for offline, empty offering, configuration/test-build limitation, nothing to restore, restore error, missing legal URLs, and the route smoke import.
- [x] **Step 3: Run the focused paywall and route suites** and confirm the screen/route are missing.
- [x] **Step 4: Implement one scroll-safe paywall** using existing primitives/tokens, 48-point targets, visible close, a selected package, transparent billing copy, Restore, Terms, and Privacy.
- [x] **Step 5: Implement state-specific copy and actions** without fake products or delayed dismissal, then run focused tests and TypeScript.

### Task 5: Connect premium packs and the engine boundary

**Files:**

- Modify: `src/features/packs/PackDetailModal.tsx`
- Modify: `src/features/packs/PackLibraryScreen.test.tsx`
- Modify: `app/packs.tsx`
- Modify: `src/features/session/SessionSetupScreen.tsx`
- Modify: `src/features/session/SessionSetupScreen.test.tsx`
- Modify: `src/features/session/RecapScreen.tsx`
- Modify: `src/features/session/RecapScreen.test.tsx`

**Interfaces:**

- Consumes: selected premium pack and verified `purchaseStore.entitlement`
- Produces: detail-first paywall navigation for free users, direct setup for premium users, entitled engine input, and one recap upsell

- [x] **Step 1: Update failing pack tests** so free users see `Unlock all packs`, preserve the selected premium pack, and navigate to `/premium`; premium users see `Choose <pack>` and navigate to setup.
- [x] **Step 2: Update failing setup tests** so an unentitled premium selection redirects to the paywall while verified premium passes that pack ID through `entitledPackIds` and can start.
- [x] **Step 3: Add failing recap tests** for one free-user premium action and its absence for premium users.
- [x] **Step 4: Run the three focused suites** and confirm the new entitlement behavior fails.
- [x] **Step 5: Wire the pack detail, setup, and recap surfaces to the verified store state** while leaving `sessionEngine.assertSelectedPacks` unchanged as the final guard.
- [x] **Step 6: Run focused tests and TypeScript**, then audit all premium code for hard-coded prices, optimistic entitlement, fake success, and player data sent to RevenueCat.

### Task 6: Validate and publish stacked PR 8

**Files:**

- Modify: `docs/superpowers/plans/2026-08-15-pr8-purchases-paywall.md`
- Modify: `skill-observations/log.md`

**Interfaces:**

- Consumes: completed PR 8 tree
- Produces: green local gates and a draft PR targeting `agent/pr7-gameplay-recap`

- [ ] Run Prettier, ESLint with zero warnings, TypeScript, and all Jest suites.
- [ ] Run content validation, duplicate scan, inventory report, and generated drift check.
- [ ] Run release-env preview success and production missing-env failure checks.
- [ ] Run Expo Doctor and offline production web export.
- [ ] Perform a paywall accessibility/copy/state audit against the approved design and UI pre-delivery rules.
- [ ] Flush task observations and close every plan checkbox.
- [ ] Commit intentionally, publish `agent/pr8-purchases-paywall`, open a stacked draft PR, and wait for green CI.
