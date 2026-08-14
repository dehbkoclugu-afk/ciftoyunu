# Navigation, Hydration, and Onboarding Design

**Status:** Approved by the master implementation contract and the user's instruction to continue.

## Goal

Route first-time users through a fast, three-screen setup and returning users directly to home, without showing the wrong route while local settings hydrate.

## Selected approach

Use Expo Router for the stack, Zustand for in-memory state, and a small versioned storage adapter backed by AsyncStorage. The root route waits for hydration, then redirects from persisted onboarding state. Native splash remains visible during that decision.

Rejected alternatives:

- Screen-local onboarding state: fewer initial files, but completion and settings can diverge across screens.
- Direct AsyncStorage calls from components: fastest prototype, but migration and corruption handling spread into UI.
- A general persistence framework: unnecessary for one settings document and harder to quarantine safely.

## Boot and navigation

app/_layout.tsx prevents the native splash from hiding automatically, starts hydration once, and hides the splash only when the app store reports ready. app/index.tsx renders no intermediate UI; after hydration it redirects to /onboarding/language or /home.

The stack remains headerless and uses application-owned back controls. Onboarding is exactly:

1. Language
2. Welcome
3. Age and comfort

The existing playable card preview becomes /home until PR 4 replaces it with the full home surface.

## Settings model

Persist one SettingsData document at duo:v1:settings with locale, appearance, haptics/sound, comfort and age state, topic exclusions, notifications, player-memory preference, and onboarding completion.

Storage uses { version: 1, data }. The migration function accepts unknown input, applies safe defaults, and normalizes invalid fields. Unparseable values are copied to a timestamped quarantine key before the settings key is cleared. Failure to read or write storage never blocks launch.

## Locale behavior

The locale catalog initially exposes English, Arabic, Japanese, Korean, and Traditional Chinese, matching the contract's first localization waves. Device locale chooses the suggested default; a persisted user choice wins. Unsupported device locales fall back to English.

PR 2 supplies the locale mechanism and native language names. Complete translated UI and content remain in PR 12 and PR 13; missing UI strings use the documented English fallback rather than mixing question content.

## Onboarding interaction

Language offers search, a selected state, and native language names. Welcome shows the product's actual card interaction plus the two concrete benefits: no account and play on one phone. A short modal explains the three-step play loop.

Comfort defaults to Light. Open enables deeper questions. Spicy is disabled until the user explicitly confirms they are 18 or older. The user may finish without confirming age; mature content stays off. Copy states that passing is always allowed and settings can be changed later.

## Visual direction

Preserve the established warm canvas, dark plum, coral/violet cards, and tactile overlap. The signature is a three-card progress rail whose active card advances across onboarding. Layout stays spacious and single-purpose, with one primary action per screen, 44px minimum touch targets, visible selected/disabled states, and safe-area support.

## Failure handling

- Missing/corrupt settings: quarantine, restore defaults, continue to onboarding.
- Storage write failure: keep the in-memory choice and allow forward progress.
- Unsupported locale: English.
- Splash API failure or web no-op: hydration still resolves and routing continues.

## Test coverage

- locale normalization and device fallback
- v0/unknown settings migration to v1 defaults
- corrupt storage quarantine
- settings save and rehydrate
- first-run versus returning-user route decision
- spicy selection requires explicit age confirmation
