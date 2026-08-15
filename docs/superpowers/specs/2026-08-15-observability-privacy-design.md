# Observability and Privacy Design

**Status:** Approved by the master implementation contract and the user's standing instruction to continue without intermediate approval gates.

## Scope

PR 9 adds typed product analytics, deterministic experiment assignments, a provider-neutral crash boundary, and user-facing privacy controls. It instruments the existing activation, gameplay, and monetization funnels without collecting answers, player names, or question copy. It does not add session replay, touch autocapture, remote experiment configuration, dashboards, source-map credentials, or marketing attribution.

## Chosen approach

Use application-owned adapters with PostHog and Sentry as replaceable production edges. Runtime services receive privacy state and common context after persisted settings hydrate; feature code emits typed domain events and never imports either provider.

Alternatives rejected:

1. Provider hooks throughout screens would be faster initially but couple product behavior to SDK lifecycle and make privacy gating difficult to prove.
2. Autocapture and session replay would increase coverage but can collect interaction detail beyond the minimum product need and are intentionally excluded.
3. A home-grown HTTP client would reduce dependencies but recreate offline queues, batching, and mobile lifecycle behavior already supplied by the official SDKs.

## Privacy contract

- `analyticsEnabled` and `crashReportingEnabled` both default to `false`, including migration from older settings.
- Analytics never initializes a network adapter unless the PostHog key and HTTPS host are configured and the user has opted in.
- Crash reporting never initializes Sentry unless a DSN is configured and the user has opted in.
- Disabling a control stops new capture immediately and shuts down the provider where supported.
- No event contains player names, answers, question text, free-form report text, email, advertising ID, or contact data.
- Question behavior uses stable IDs and controlled metadata only.
- Session replay, touch autocapture, automatic screen capture, tracing, screenshots, and default PII are disabled.
- An anonymous UUID is generated on-device and stored in AsyncStorage. It is used for stable experiment bucketing and, only with analytics consent, as the provider distinct ID.

## Typed analytics

`src/services/analytics/events.ts` is the version-controlled event catalog. It contains every event named in the master plan and maps instrumented events to exact property types. The public `track` function accepts only a catalog name and the matching properties.

The runtime adds common context: anonymous ID, app/build version, platform/OS, device class, locale, theme, entitlement, and current experiment assignments. `country_storefront` remains `unknown` until a trustworthy store API exists; it is never inferred from locale.

`AnalyticsAdapter` exposes `identify`, `capture`, `flush`, and `shutdown`. The PostHog implementation uses manual capture only. Tests use an in-memory adapter; unavailable development and preview builds use a no-op adapter and never fabricate delivery.

The first instrumentation slice covers:

- app open and onboarding completion
- mode, players, pack detail, and pack selection
- session start, question view/action, pause/resume, completion, and recap
- paywall view/dismissal, package selection, purchase, restore, and entitlement changes
- privacy preference changes

## Experiments

The typed registry contains the six keys from the master plan. A small deterministic hash maps `anonymousId + experimentKey` to weighted variants. Assignments do not require network access and remain stable because the anonymous ID persists.

All registry entries ship disabled in PR 9, so the control variant is returned when remote experiment configuration is absent. Tests can inject an enabled definition to verify stable weighted bucketing. Analytics includes the complete assignment map on every event.

## Crash boundary

`CrashAdapter` exposes `initialize`, `captureException`, and `shutdown`. The Sentry edge uses `sendDefaultPii: false`, zero tracing/replay sample rates, and a `beforeSend` scrubber that removes unsafe extras and user data.

A provider-neutral React error boundary wraps the application shell. It captures render failures only when crash consent is active and shows a recoverable Project Duo error surface with retry and return-home actions. The boundary itself remains useful in unconfigured builds; provider failure can never prevent app boot.

## Privacy screen

`/settings` is an Operate-mode extension of the existing card-table world.

**THESIS:** Privacy choices should read like two plain promises, not a legal dashboard.

**OWN-WORLD:** Warm canvas, plum section card, coral registration mark, cream toggle rows, existing type and radius tokens.

**STORY:** The user sees what each control sends, what is never sent, changes either choice immediately, and returns to the table.

**FIRST VIEWPORT:** Back action, “Your table stays private” heading, short invariant statement, then the two controls without scrolling on a small phone.

**FORM:** A quiet settings receipt: two semantic switch rows and one compact “Never collected” ledger. No icons, charts, consent dark patterns, or provider names.

Home receives one low-emphasis `Privacy` action in the existing brand row. Toggle rows use `accessibilityRole="switch"`, announce checked state, meet 48-point targets, and use both position and copy—not color alone—to express state.

## Configuration and release safety

Pin `posthog-react-native` and `@sentry/react-native` to verified stable versions. Add the Expo-supported peer packages required by PostHog and the Sentry Expo config plugin. Public runtime values are exposed through Expo `extra`:

- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `SENTRY_DSN`

Production config fails when any value is missing or the PostHog host is not HTTPS. Provider upload tokens remain CI/EAS secrets and are not exposed to the app.

## Error handling and tests

- Provider initialization, capture, flush, or shutdown failures are swallowed at the boundary and never break gameplay.
- Invalid or forbidden event properties are rejected before the adapter in development/tests.
- Settings migration, toggle persistence, consent transitions, anonymous ID stability, experiment determinism, adapter mappings, crash fallback, and key funnel integrations receive tests.
- Full verification remains Prettier, zero-warning ESLint, TypeScript, all Jest suites, content checks, release-env assertions, Expo Doctor attempt, and offline web export.
