# Notifications and Daily Implementation Plan

**Goal:** Add a deterministic free Daily card, deferred local notification permission, one persisted reminder schedule, and safe notification routing.

**Tech Stack:** Expo 57, `expo-notifications ~57.0.11`, Expo Router, Zustand, TypeScript, Jest.

### Task 1: Daily selector

- [ ] Add pure selector tests for date/locale stability, next-day movement, free-pack eligibility, maturity exclusion, empty content, and deterministic ordering.
- [ ] Implement `src/features/daily/dailyQuestion.ts` without persistence or runtime randomness.

### Task 2: Notification boundary

- [ ] Pin `expo-notifications`, add its config plugin, and extend Jest mocks.
- [ ] Define provider-neutral notification types, Expo adapter, permission interpretation, Android channel, safe generic payload, schedule/cancel, and controlled response parsing.
- [ ] Test granted, denied, blocked, unavailable, scheduling failure, replacement, and route rejection states.

### Task 3: Daily surface and preferences

- [ ] Extend settings actions for notification enablement and reminder time using the existing additive migration.
- [ ] Build `/daily` with the deterministic question, three time choices, contextual rationale, permission recovery, and no answer input.
- [ ] Add a secondary Home entry and tests for question copy, no mature selection, time selection, schedule success, denial recovery, and analytics metadata.

### Task 4: Routing and validation

- [ ] Install one root notification-response observer and route only `destination: 'daily'`.
- [ ] Run TypeScript, ESLint, all Jest suites, Prettier, content gates, Expo dependency/config checks, provider-import audit, and web export.
- [ ] Update observations, close this plan, publish a stacked draft PR targeting `agent/pr9-observability-privacy`, and wait for green CI.
