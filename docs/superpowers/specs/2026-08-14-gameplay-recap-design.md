# Gameplay and Recap Design

**Date:** 2026-08-14  
**Status:** Approved by the master implementation contract and the user's continue instruction  
**Stack:** Expo Router, React Native, Zustand, AsyncStorage, Jest

## Goal

Turn a selected free pack into a complete offline play loop: low-friction setup, deterministic standard and special cards, accessible swipe/button controls, durable resume, favorites, pause actions, and an honest recap.

## Scope

PR 7 includes session setup, gameplay, special-card insertion, active-session persistence, pause/resume, question reporting state, favorites, recap, and route wiring. It consumes the immutable question snapshots produced by PR 6.

PR 7 does not include RevenueCat, a paywall, analytics transport, crash reporting, remote content, daily questions, notifications, completed-session history, or image export. Share uses the native share sheet with a locally rendered recap preview and no answers or player names. Premium packs remain unavailable until PR 8 supplies verified entitlements.

## Design Direction

**Reading:** an operate-mode face-to-face card table for couples and friends, using the established warm cream, plum, coral, and category colors with restrained native motion.

The setup screen is a compact “set the tempo” surface, not a settings dashboard. Gameplay gives almost the full viewport to one physical-feeling card. A narrow intensity-colored edge and a starter ribbon are the memorable elements; all surrounding chrome stays quiet. The card always has button alternatives to gestures, supports light and dark themes, and uses 44-point minimum targets.

Design dials are variance 6, motion 4, and density 4. Motion communicates card replacement and press feedback only. The rejected database suggestion of green casino felt and high-cost 3D is not compatible with the existing product identity or the face-to-face usage scene.

## Routes and Flow

```text
packs -> session-setup -> play -> recap
  ^            ^          |
  |            +----------+ pause: change topics/start fresh
  +-----------------------+ recap: choose another pack

home -> play/recap when a resumable session exists
home -> favorites -> one saved question at a time
```

Selecting a free pack immediately opens session setup. Setup defaults to 20 minutes and Mixed intensity. It exposes the seven master-contract exclusion topics and shows the estimated standard/special counts. Mature content appears only when age and comfort policy allow it.

Starting creates and persists the complete session before navigation. A current unfinished session younger than 24 hours appears on Home as a clear Resume action; completed sessions awaiting recap appear as View recap. Stale or corrupt sessions are quarantined or removed without blocking launch.

## Domain Model

```ts
type SpecialCardType =
  | 'both_answer'
  | 'predict_partner'
  | 'rapid_fire'
  | 'rank_three'
  | 'gratitude'
  | 'tell_story'
  | 'switch_starter'
  | 'take_breath'
  | 'wildcard';

type QuestionSessionCard = QuestionInstance & { kind: 'question' };

type SpecialSessionCard = {
  kind: 'special';
  instanceId: string;
  type: SpecialCardType;
  title: string;
  instruction: string;
  starterPlayerIds: string[];
};

type SessionCard = QuestionSessionCard | SpecialSessionCard;

type CardOutcome = {
  cardId: string;
  viewedAt: number;
  leftAt: number;
  action: 'next' | 'skip' | 'reported';
  engagement: 'rapid_skip' | 'neutral' | 'engaged_card';
};

type ActiveSession = {
  id: string;
  locale: SupportedLocale;
  contentVersion: string;
  mode: GameMode;
  packIds: string[];
  packTitle: string;
  players: Player[];
  durationMinutes: SessionDuration;
  intensityPreset: IntensityPreset;
  allowMature: boolean;
  excludedTopics: TopicTag[];
  seed: string;
  cards: SessionCard[];
  currentIndex: number;
  currentViewedAt: number;
  favoriteIdsAtStart: string[];
  skippedIds: string[];
  reportedIds: string[];
  outcomes: CardOutcome[];
  startedAt: number;
  lastActiveAt: number;
  completedAt?: number;
  keeperQuestionId?: string;
};
```

No player answer, question response, or free-text note is stored.

## Special Cards

`insertSpecialCards` is a pure seed-driven transform. It inserts one, two, or three special cards into 10, 18, or 26 standard-question plans, keeping the rate between 10% and 15%. Specials never open or close a session and are spaced through the standard sequence.

The type order is a seeded shuffle of all nine types. No type appears more than twice. The text is original, mode-neutral English UI copy and never claims therapeutic benefit. Pack categories constrain the preferred type order so a playful deck does not receive an unexpectedly heavy interlude. `switch_starter` changes the next single-starter question to the next player; it is not decorative copy.

## Store and Persistence

One injectable Zustand `sessionStore` owns `{ activeSession, favoriteIds, persistenceFailed }` and calls a small `gameplayRepository` boundary. The repository stores separate versioned envelopes for the active session and favorite question IDs. The session snapshot records `favoriteIdsAtStart` only so recap can calculate additions without duplicating the live favorites source of truth.

Store actions:

- `hydrate()` loads favorites and a session no older than 24 hours.
- `start(plan, config, packTitle, now)` inserts specials, persists the session, and marks the first displayed standard question as seen.
- `advance(action, now)` records dwell classification, marks skipped/reported IDs, advances, marks the next displayed standard question as seen, and persists.
- `toggleFavorite()` changes only favorites; it never advances the card.
- `complete(now)` records the final outcome, sets `completedAt`, and preserves the snapshot for recap.
- `chooseKeeper(questionId)` stores a viewed question ID for the recap.
- `clear()` removes the active session but retains favorites.

The dwell thresholds are exact: under 1,000 ms is `rapid_skip`, over 6,000 ms is `engaged_card`, and boundaries are neutral. Persistence failure is visible but never blocks continued offline play.

## Gameplay UI

The header contains Pause, a determinate accessible progress bar, and the pack title. The card contains a category label, starter instruction, question, optional follow-up, and a quiet “take your time” cue. Special cards use the same footprint with a coral/plum treatment so the deck remains visually coherent.

Question text tiers by length and still respects system font scaling. Long content moves into a bounded vertical scroll region; it is never clipped. RTL locales set writing direction and alignment on card copy.

Horizontal gesture handling uses `react-native-gesture-handler`: left means Pass and right means Next. A 72-point translation or 500-point/second velocity commits; shorter movement resets. Pass, Favorite, and Next buttons remain visible and fully equivalent. Favorite toggling does not advance.

## Pause and Exit

The native modal sheet offers:

- Continue
- Another question, which records a skip and advances
- Change topic filters, which confirms ending the current run and opens setup for a fresh deterministic plan
- Report this question, which confirms, records the stable question ID locally in the active session, and advances
- End session, which always confirms

Ending after at least five displayed standard questions opens recap. Ending earlier returns Home after clearing the active session. No action uses blame, loss framing, or fake success.

## Recap and Favorites

Recap shows standard cards viewed, favorites added during the session, and elapsed duration. Users can select one viewed question as the keeper for the night. The actions are Play this pack again, Choose another pack, Share recap, Open saved questions, and Done.

The share preview contains counts, pack title, and optionally the keeper question's `shortShareText` or question text. It excludes player names and answers. Native Share cancellation is not shown as an error.

Favorites persist as stable question IDs. The library resolves IDs against the current locale bundle, silently hides unavailable IDs, supports pack/category filtering, and opens one saved question at a time. It does not start a favorites-only session in V1.

## Error Handling

- Missing selected pack or locale bundle: setup explains that content is unavailable and returns to packs.
- Empty eligible pool: setup shows the engine warning and does not navigate to a blank game.
- Persistence failure: a compact warning states that progress may not resume; gameplay continues.
- Missing active session on Play or Recap: redirect Home.
- Corrupt active/favorites envelopes: quarantine the affected key independently and return safe defaults.
- Native share failure: show a plain retryable error; cancellation remains silent.

## Testing

Pure tests cover special counts/placement/type limits, switch-starter behavior, text tiers, swipe thresholds, dwell boundaries, metrics, and immutable inputs. Repository tests cover round-trip, 24-hour expiry boundary, corruption quarantine, favorites, clear, and provider failure.

Store tests cover start, seen marking, persistence, next/skip/report outcomes, non-advancing favorites, completion, keeper selection, resume, and failures. Screen tests cover setup defaults and filters, pack-to-setup navigation, long/RTL cards, button controls, pause confirmation paths, recap metrics/actions, favorites filtering, and missing-state redirects.

Full validation remains Prettier, ESLint with zero warnings, TypeScript, all Jest suites, content checks, Expo Doctor, web export, and GitHub Actions.
