# Session Engine Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship a deterministic offline session planner with policy filtering, recent-repeat avoidance, intensity shaping, fair player assignment, and durable seen history.

**Architecture:** One focused pure engine module exposes small testable transforms and the `buildSession` orchestrator. A separate versioned repository owns seen-history serialization and corruption recovery; gameplay state and UI remain outside this PR.

**Tech Stack:** TypeScript 6, Zod-derived content types, Jest, AsyncStorage adapter

## Global Constraints

- No question ID repeats within one session.
- The engine never crosses locale, selected-pack, age, policy, or entitlement boundaries to fill a target.
- Special cards, active-session resume, gameplay UI, and seen marking stay in PR 7.
- All randomness is seed-derived and deterministic.
- No new dependency is introduced.

---

### Task 1: Define engine types and deterministic random helpers

**Files:**

- Create: `src/features/session/sessionEngine.ts`
- Create: `src/features/session/sessionEngine.test.ts`

**Interfaces:**

- Consumes: string seeds and readonly arrays
- Produces: `SessionInput`, `SessionPlan`, `QuestionInstance`, `SeenQuestion`, `seededShuffle`

- [x] **Step 1: Write failing tests** asserting the same seed gives the same permutation, different seeds normally differ, input arrays remain unchanged, and empty seeds are rejected by `buildSession`.
- [x] **Step 2: Run `jest --runInBand src/features/session/sessionEngine.test.ts`** and confirm the missing module failure.
- [x] **Step 3: Implement the exported session types, a stable 32-bit string hash, a local PRNG, and namespaced Fisher–Yates `seededShuffle`** without external dependencies.
- [x] **Step 4: Run the focused tests** and expect deterministic random behavior to pass.

### Task 2: Implement eligibility and seen-history selection

**Files:**

- Modify: `src/features/session/sessionEngine.ts`
- Modify: `src/features/session/sessionEngine.test.ts`

**Interfaces:**

- Consumes: bundle, mode, selected/entitled packs, age/maturity, excluded topics, country, history, `now`
- Produces: eligible fresh questions and oldest-first unique recovery pool

- [x] **Step 1: Add failing tests** for mode and pack filtering, premium rejection, explicit/mature exclusion, excluded topics, country allow/block, 180-day question exclusion, 30-day intent-family exclusion, and exact cutoff boundaries.
- [x] **Step 2: Add failing tests** proving recently seen content returns oldest-first only when fresh unique content cannot fill the target and never duplicates a question ID.
- [x] **Step 3: Run the focused test** and confirm the new eligibility/history expectations fail.
- [x] **Step 4: Implement input validation, pack resolution, question policy filters, `partitionSeenQuestions`, and deterministic oldest-first recovery** with no storage dependency.
- [x] **Step 5: Run the focused test** and expect all eligibility/history cases to pass.

### Task 3: Allocate intensity and arrange the conversation arc

**Files:**

- Modify: `src/features/session/sessionEngine.ts`
- Modify: `src/features/session/sessionEngine.test.ts`

**Interfaces:**

- Consumes: unique eligible pool, `IntensityPreset`, target count, namespaced seed
- Produces: quota-shaped ordered questions plus `SessionWarning[]`

- [x] **Step 1: Add failing tests** for 70/30/0, 35/45/20, and 15/40/45 largest-remainder quotas using synthetic balanced pools.
- [x] **Step 2: Add failing tests** for deterministic nearest-bucket shortage fill, target capping without duplicates, safe first two cards, safe closing card, and `safe_arc_unavailable` when the selected pool cannot satisfy the arc.
- [x] **Step 3: Run the focused test** and confirm allocation/arc expectations fail.
- [x] **Step 4: Implement intensity bucketing, largest-remainder counts, quota draw, shortage redistribution, and best-effort arc rearrangement** without mutating source arrays.
- [x] **Step 5: Run the focused test** and expect intensity and arc cases to pass.

### Task 4: Assign players and compose complete plans

**Files:**

- Modify: `src/features/session/sessionEngine.ts`
- Modify: `src/features/session/sessionEngine.test.ts`

**Interfaces:**

- Consumes: ordered questions, resolved players, duration, seed, content snapshot metadata
- Produces: deterministic `QuestionInstance[]` and `SessionPlan`

- [x] **Step 1: Add failing tests** for Couple seeded starting side and alternation, `both` assigning all players without advancing the cursor, Friends seeded round-robin, full-round fairness, and no consecutive single starter.
- [x] **Step 2: Add failing orchestrator tests** for 10/18/26 targets, pool-shortage warnings, immutable runtime question snapshots, stable instance IDs, content metadata, and byte-equivalent same-seed plans.
- [x] **Step 3: Run the focused test** and confirm player/orchestrator expectations fail.
- [x] **Step 4: Implement `assignPlayers` and `buildSession`**, using independent seed namespaces and copying question arrays/objects into each returned plan.
- [x] **Step 5: Run the focused test** and expect the entire pure engine suite to pass.

### Task 5: Add versioned seen-history persistence

**Files:**

- Modify: `src/storage/keys.ts`
- Create: `src/storage/seenHistoryRepository.ts`
- Create: `src/storage/seenHistoryRepository.test.ts`

**Interfaces:**

- Consumes: `StorageAdapter`, `SeenQuestion[]`, `now`
- Produces: deduplicated/pruned history, `mergeSeenQuestion`, safe load/save/clear operations

- [x] **Step 1: Write failing repository tests** for empty load, round-trip, newest-timestamp deduplication, 180-day pruning, pure merge/upsert, corrupt JSON quarantine, clear, and storage-provider failure behavior.
- [x] **Step 2: Run `jest --runInBand src/storage/seenHistoryRepository.test.ts`** and confirm the missing module failure.
- [x] **Step 3: Add `SEEN_HISTORY_KEY`, version, and quarantine key**, then implement the versioned envelope parser, sanitizer, `mergeSeenQuestion`, and repository following existing storage recovery patterns.
- [x] **Step 4: Run the repository tests and TypeScript** and expect persistence behavior to pass.

### Task 6: Validate and publish stacked PR 6

**Files:**

- Modify: `docs/superpowers/plans/2026-08-14-pr6-session-engine.md`
- Modify: `skill-observations/log.md`

**Interfaces:**

- Consumes: completed PR 6 tree
- Produces: green local checks and a draft PR targeting `agent/pr5-pack-library`

- [x] Run Prettier, ESLint with zero warnings, TypeScript, and all Jest suites.
- [x] Run content validation, duplicate scan, inventory report, and generated drift check.
- [x] Run Expo Doctor and web export.
- [x] Flush task observations and close every plan checkbox.
- [x] Commit intentionally, publish the branch, open the stacked draft PR, and wait for green CI.
