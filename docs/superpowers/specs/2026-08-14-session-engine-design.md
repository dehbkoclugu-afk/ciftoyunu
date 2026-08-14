# Session Engine Design

**Status:** Approved by the master implementation contract and the user's instruction to continue the next PR slice.

## Goal

Build a deterministic, offline session planner that selects eligible questions, shapes a safe intensity arc, avoids recent repeats, and assigns starters fairly without introducing gameplay UI.

## Scope

PR 6 includes the pure question-selection pipeline, seeded randomness, duration targets, intensity allocation and arc, entitlement/age/topic/region filtering, seen-history rules, player assignment, session snapshots, and versioned seen-history persistence.

PR 6 does not include session setup UI, special-card presentation, gameplay controls, timers, pause/resume UI, favorites, recap, analytics, or purchases. Special-card placement and active-session persistence remain PR 7 because their lifecycle depends on gameplay behavior.

## Considered Approaches

### 1. One monolithic `buildSession`

This is the shortest file, but selection, history fallback, allocation, arc repair, and player fairness become difficult to test independently. Edge-case fixes would risk unrelated rules.

### 2. Small pure pipeline functions with one orchestrator — selected

Each rule is a deterministic data transform with explicit inputs and outputs. `buildSession` composes them in the master-contract order. This keeps storage and Zustand out of the engine while making PR 7 consumption simple.

### 3. Class-based configurable rule engine

Pluggable policies might help a much larger catalog later, but interfaces, registrations, and mutation lifecycle are unnecessary for five embedded packs and one product policy.

## Core Types

```ts
type SessionDuration = 10 | 20 | 30;
type IntensityPreset = 'light' | 'mixed' | 'deep';

type SeenQuestion = {
  questionId: string;
  intentKey: string;
  seenAt: number;
};

type SessionInput = {
  bundle: ContentBundle;
  mode: GameMode;
  packIds: string[];
  entitledPackIds: string[];
  players: Player[];
  durationMinutes: SessionDuration;
  intensityPreset: IntensityPreset;
  ageConfirmed18: boolean;
  matureContentEnabled: boolean;
  excludedTopics: TopicTag[];
  country?: string;
  seenHistory: SeenQuestion[];
  seed: string;
  now: number;
};

type QuestionInstance = {
  instanceId: string;
  index: number;
  question: RuntimeQuestion;
  starterPlayerIds: string[];
};

type SessionPlan = {
  seed: string;
  locale: SupportedLocale;
  contentVersion: string;
  packIds: string[];
  targetQuestionCount: number;
  questions: QuestionInstance[];
  warnings: SessionWarning[];
};
```

`QuestionInstance.question` is a full runtime snapshot. Future content updates therefore cannot silently change an already-created plan.

## Pipeline

`buildSession` executes these stages:

1. Validate non-empty players, selected packs, and seed.
2. Select active packs compatible with the mode and locale.
3. Reject premium packs not present in `entitledPackIds`.
4. Filter questions by selected packs and mode.
5. Apply age/maturity, excluded-topic, and country allow/block policy.
6. Split the pool into fresh and recently seen questions.
7. Allocate fresh questions by intensity preset.
8. If fresh content is insufficient, reintroduce recently seen unique questions from oldest seen timestamp to newest.
9. Arrange a safe opening and closing arc when eligible questions make it possible.
10. Assign player starters deterministically.
11. Return immutable snapshots and explicit shortage/policy warnings.

No question ID may appear twice in one session.

## Deterministic Randomness

A tiny local string hash plus seeded PRNG powers Fisher–Yates shuffle. No dependency is added. Every random choice receives a namespaced derivative of the session seed, such as `seed:intensity:light` or `seed:players`, so adding one internal shuffle does not unexpectedly perturb every other phase.

Identical normalized input and seed must produce byte-equivalent question order and starter assignments. Different seeds should normally produce a different order without changing eligibility or counts.

## Duration and Shortage

Standard-question targets are:

- 10 minutes → 10 questions
- 20 minutes → 18 questions
- 30 minutes → 26 questions

Special-card counts are not included in PR 6.

The current seed packs contain ten questions each. When the eligible unique pool is smaller than the target, the engine returns every eligible question once, sets `actual < target`, and emits `insufficient_unique_questions`. It never pads a session by duplicating a question.

## Intensity Allocation and Arc

Intensity buckets are:

- Light: levels 1–2
- Medium: level 3
- Deep: levels 4–5

Preset quotas use largest-remainder allocation:

- Light: 70% / 30% / 0%
- Mixed: 35% / 45% / 20%
- Deep: 15% / 40% / 45%

Questions are first drawn from their quota buckets. If a bucket lacks enough unique content, remaining slots are filled from the nearest available intensity, deterministically shuffled. This keeps thematic packs playable without inventing content.

The first two questions must be intensity 1–2 and the last must be intensity 1–3 whenever such candidates exist. The arranger moves eligible cards into those positions after allocation. If a selected pack has no safe-range card, it uses the lowest available intensity and emits `safe_arc_unavailable` rather than failing or silently borrowing another pack.

## Seen History

Exact question IDs seen during the previous 180 days are initially excluded. Questions sharing an `intentKey` seen during the previous 30 days are also excluded.

When fresh content cannot fill the target, excluded questions are reintroduced oldest-seen first. A question blocked by both windows uses its most recent relevant timestamp. The current session still remains unique.

`seenHistoryRepository` stores a versioned array locally, quarantines corrupt data, deduplicates by question ID using the newest timestamp, and prunes records older than 180 days. `mergeSeenQuestion` is a pure helper that PR 7 will call only when a card is actually displayed; building a plan does not mark questions as seen.

## Player Assignment

- `starter: both` assigns every current player ID and does not advance the single-starter cursor.
- Couple mode alternates the two players for every non-`both` card, with a seeded starting side.
- Friends mode creates a seeded permutation of player IDs and cycles round-robin through it.
- No single starter repeats consecutively when at least two players exist.
- Every Friends player appears once per full player-count round.

The master phrase “no player waits three cards” is mathematically impossible for single-starter cards with four to eight players. One full seeded round is the strict fair bound that preserves one starter per card and supports all allowed player counts.

## Category Constraint

The current runtime question schema contains `topicTags` but no question-level category, and PR 5 sessions select one thematic pack. Therefore “same category at most twice” cannot be meaningfully enforced without inventing metadata or rejecting normal single-pack play. PR 6 does not fake this rule. A future multi-pack/category schema can add it as another pure arranger.

## Error and Warning Behavior

Programming/input errors throw before selection:

- empty seed;
- fewer than two players;
- no selected packs;
- selected pack missing, incompatible with mode, or unavailable in the locale;
- premium pack without entitlement.

Valid but constrained sessions return warnings:

- `insufficient_unique_questions`;
- `safe_arc_unavailable`;
- `no_eligible_questions`.

The engine never falls back to another locale, another pack, or unentitled content.

## Testing

- Seeded random tests: repeatability, seed variance, stable input immutability.
- Eligibility tests: mode, pack, premium entitlement, maturity, topics, region allow/block.
- History tests: 180-day question exclusion, 30-day intent exclusion, oldest-first recovery, no duplicate IDs.
- Allocation tests: exact largest-remainder quotas, shortage redistribution, safe first two and closing card, best-effort warning.
- Rotation tests: Couple alternation, `both` behavior, Friends seeded round-robin, no consecutive single starter.
- Repository tests: round-trip, deduplication, pruning, corruption quarantine, storage failure behavior.
- Orchestrator tests: duration targets, snapshot fields, deterministic full plan, pool shortage.

## Future Boundaries

PR 7 will add session setup/gameplay state, mark history when cards appear, persist an active session for 24-hour resume, insert and render special cards, and consume `SessionPlan` snapshots. PR 8 will supply real entitled pack IDs from RevenueCat.
