# Home, Mode, and Player Setup Design

**Status:** Approved by the master implementation contract and the instruction to continue the PR sequence.

## Goal

Ship the first post-onboarding flow as a complete local slice: one primary Home action, explicit Couple/Friends selection, 2–8 player setup, and optional remembered names without creating fake pack-library behavior before PR 5.

## Approaches considered

1. **Dedicated routes with a small setup store — selected.** `home`, `mode`, and `players` remain independently testable and match the approved navigation map. A focused Zustand store owns only the current setup draft.
2. **One multi-step screen.** This reduces route files but makes keyboard, back navigation, and later pack-library integration harder to isolate.
3. **Put setup state in the global settings store.** This writes transient gameplay choices into durable preferences and makes migrations unnecessarily broad.

The selected approach reuses Expo Router, Zustand, the storage adapter, and current primitives. No new dependency is required.

## Navigation and screen behavior

### Home

- Keep one dominant action: **Play together**.
- Show a compact editorial question preview from the validated English runtime bundle so the screen reflects real content rather than a hard-coded demo array.
- Show a settings icon only when its destination exists; PR 4 does not add dead actions for Daily, Favorites, Premium, or pack browsing.
- When a player setup draft has been completed, show a compact “ready” summary with the selected mode and player display names. This is honest state, not a simulated session.

### Mode

- Present two large accessible cards: Couple and Friends.
- Couple communicates exactly two players and the relationship-oriented catalog.
- Friends communicates two to eight players and the social catalog.
- The last selected mode is highlighted but never auto-advances.
- Continue moves to Player setup.

### Players

- Couple always renders two editable rows.
- Friends starts with two rows and can add up to eight or remove down to two.
- Blank names resolve to localized-style deterministic fallbacks (`Player 1`, `Player 2`) at completion time; raw inputs remain blank while editing.
- Duplicate normalized names produce a non-blocking notice.
- Each player may choose one optional emoji avatar from a small built-in set; no photo or permission flow is introduced.
- “Remember these names” controls whether names and avatars survive app restarts.
- The keyboard-aware screen keeps the completion CTA reachable.

## State and persistence

`useGameSetupStore` owns:

- `mode: 'couple' | 'friends'`
- editable `players: PlayerDraft[]`
- `setupCompleted: boolean`
- actions for selecting mode, editing/adding/removing players, hydrating, and completing setup

`PlayerDraft` contains a stable local ID, raw name, and optional emoji. Pure helpers produce final `Player[]`, fallback display names, and duplicate warnings.

`createPlayerSetupRepository(storage)` stores a versioned envelope under its own key. It always remembers the last mode. It writes player names and emoji only when `rememberPlayers` is true; otherwise it writes an empty roster. Boot hydration loads settings first, then loads the setup draft using the remembered-names preference.

## Data flow

1. Home opens Mode.
2. Mode updates the setup store and opens Players.
3. Players edits the in-memory draft.
4. Completion normalizes blank names, marks setup ready, and persists mode plus the roster only when allowed.
5. Home reads the ready draft and renders a summary. PR 5 will consume the same draft when it adds the pack route.

## Errors and edge cases

- Corrupt setup persistence is quarantined and replaced with safe defaults, matching settings behavior.
- Persistence failure never blocks navigation; the store exposes a failure flag for a small inline notice.
- Mode changes reshape the roster safely: Couple keeps the first two; Friends preserves up to eight and ensures at least two.
- Whitespace-only names become fallbacks.
- Duplicate comparison trims whitespace and compares case-insensitively.
- The repository never persists raw names when remembering is disabled.

## Testing

- Pure helper tests cover fallback names, duplicate detection, mode limits, and roster reshaping.
- Repository tests cover versioned round-trip, corrupt-data recovery, and privacy behavior when remembering is disabled.
- Store tests cover mode changes, add/remove limits, completion, and persistence failure.
- Route/screen tests cover Home’s single primary CTA, mode selection, the Couple/Friends player constraints, and the non-blocking duplicate notice.
- Full Prettier, ESLint, TypeScript, Jest, content validation, Expo Doctor, and web export remain required.

## Scope exclusions

- Pack browsing, pack artwork, premium locks, and pack detail belong to PR 5.
- Session duration/intensity and question sequencing belong to PR 6.
- Gameplay, recap, favorites, and Daily are not represented by dead controls in PR 4.
