# Pack Library and Artwork System Design

**Status:** Approved by the master implementation contract and the user's instruction to continue the next PR slice.

## Goal

Ship a locale-safe pack library where players can filter, inspect, and select an eligible free pack while premium packs remain honestly locked until the purchase PR.

## Scope

PR 5 includes the pack library, localized pack presentation data, cover artwork registry, focal crop behavior, pack filters, pack detail, free/premium presentation, and live pack selection state.

PR 5 does not include session setup, question selection, gameplay, paywall navigation, purchases, completion history, or real seen percentages. Those belong to PRs 6–8. No placeholder navigation or fake purchase success is added.

## Considered Approaches

### 1. Hand-written screen catalog

Fastest initially, but duplicates pack IDs, eligibility rules, premium state, and copy outside the validated content bundle. It would drift as soon as content changes.

### 2. Bundle-derived catalog with a small artwork registry — selected

The validated locale bundle remains the source of truth. Localized pack copy travels through the editorial source and generated bundle. A small registry resolves validated `artworkId` values to bundled cover assets and focal points. This adds only the missing presentation layer and produces a clean input for PR 6.

### 3. Separate remote catalog service

Useful after seasonal remote updates exist, but it introduces network, cache, migration, and failure-state work that is outside MVP PR 5. Embedded content must already work offline.

## Content Model

Add a localized pack presentation record:

```ts
type LocalizedPack = {
  packId: string;
  locale: SupportedLocale;
  title: string;
  promise: string;
  description: string;
  audience: string;
  contentWarnings: string[];
  sampleQuestionIds: [string, string];
};
```

`EditorialSource.localizedPacks` holds reviewed copy. The build step includes only records matching the source locale and active packs in `ContentBundle.packCopy`. Validation requires exactly one localized record per active pack, two approved sample questions belonging to that pack, and a registered-looking artwork ID. Existing question text remains unchanged.

The English seed receives original presentation copy for all five existing packs. Other locales remain unavailable rather than borrowing English copy.

## Catalog and Eligibility

`buildPackCatalog(bundle, input)` joins `packs` with `packCopy` and derives:

- question count from the actual runtime questions;
- approximate duration from the question count, with a minimum 10-minute label;
- mode eligibility: `both` or the selected Couple/Friends mode;
- age and comfort eligibility: mature/18+ packs require confirmed age and Spicy comfort;
- filter categories: All, Free, Fun, Deep, Relationship, Spicy, Friends;
- stable order from `sortOrder`.

Pack availability is represented separately from premium ownership. PR 5 knows only whether a pack is free or premium; it does not invent an entitlement. Premium packs remain visible when otherwise eligible so users can inspect the content proposition.

No completion percentage appears because PR 6 has not yet introduced seen history. Omitting unearned data is more honest than rendering `0%` as if tracking existed.

## Artwork System

Each active `artworkId` resolves through `artworkRegistry.ts` to:

- a bundled image source;
- normalized focal point coordinates;
- an accessible decorative label used only when the artwork conveys information;
- a dominant color for loading and fallback surfaces.

Five original abstract editorial covers are bundled locally. They use the established plum, cream, coral, gold, mint, and category colors without copied imagery or text. `PackArtwork` uses `cover` sizing and the registry focal point, hides purely decorative layers from screen readers, and renders a deterministic color fallback if an unknown ID reaches the UI. A registry coverage test prevents active content from shipping without art.

## State and Data Flow

`gameSetupStore` gains `selectedPackId` and `selectPack(packId)`. Changing mode clears a selection that has not yet been revalidated. Selection is session setup state, not durable settings, so PR 5 does not add storage or migration.

Flow:

1. Player setup completes and routes to `/packs`.
2. The library loads only the current locale bundle.
3. If the bundle is missing, an honest locale-specific empty state appears.
4. Eligible packs for the selected mode are shown and can be filtered.
5. Tapping any card opens a pack detail modal before any lock decision.
6. A free pack can be selected; the modal closes and the card shows a selected state.
7. A premium pack explains that premium access is required and exposes no purchase action until PR 8.

The screen remains useful as a complete browsing and selection surface even though PR 6 has not yet added session construction.

## Interface Design

The library is an editorial shelf, not a dashboard:

- a compact back action and clear mode-aware heading;
- horizontally scrollable 44-point filter chips;
- a responsive one-column phone grid and two-column wide layout;
- image-led cards with title, one-line promise, duration, intensity dots, and Free/Premium badge;
- selected state communicated by border, text, and accessibility state rather than color alone;
- native modal detail with a large cover, purpose, audience, intensity, warnings, and two real sample questions;
- one primary action only for eligible free packs.

Long copy wraps, Dynamic Type remains enabled, cards do not require hover, and every press target remains at least 44 points.

## Error and Empty States

- Missing locale bundle: no English fallback; explain that packs are not ready in the selected language.
- No packs for a filter: preserve the filter row and offer a plain empty result message.
- Unknown artwork ID: deterministic colored fallback; test and validation still fail in development/CI.
- Missing localized pack record: content validation error and build failure.
- Premium pack: honest locked detail, no fake purchase or dead paywall button.

## Testing

- Schema and build tests for localized pack copy and generated runtime fields.
- Validation tests for missing/duplicate copy, invalid samples, and artwork coverage inputs.
- Pure catalog tests for mode, filter, age/comfort, sort order, duration, and premium state.
- Registry tests proving every active embedded pack has artwork and a valid focal point.
- Screen tests for locale-safe empty state, filters, detail-first behavior, free selection, premium lock, and Player setup routing.
- Existing full quality, content, and Expo web export checks remain mandatory.

## Future Boundaries

PR 6 consumes `selectedPackId` to build a deterministic session and introduces seen history. PR 7 adds gameplay and recap. PR 8 replaces the premium locked explanation with a real entitlement-aware paywall flow backed by RevenueCat.
