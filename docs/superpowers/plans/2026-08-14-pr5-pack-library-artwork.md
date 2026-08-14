# Pack Library and Artwork Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship an offline, locale-safe pack library that filters, explains, and selects eligible packs with complete original artwork coverage.

**Architecture:** The content pipeline owns localized pack presentation data, a pure catalog builder joins it to runtime pack metadata, and a code-level artwork registry resolves validated IDs to bundled covers. A small addition to the existing setup store owns the current selection, while the library screen and native detail modal remain presentation-only consumers.

**Tech Stack:** Expo Router, React Native, TypeScript 6, Zustand 5, Zod 4, Jest, Testing Library React Native, local SVG-to-PNG rendering

## Global Constraints

- PR 5 stops before session construction, gameplay, purchases, paywall navigation, and seen-history percentages.
- Missing locale content never falls back to English.
- Premium packs may be inspected but cannot be falsely unlocked or purchased.
- Every active pack must have reviewed localized copy, two valid sample questions, and registered bundled artwork.
- No new runtime dependency is introduced.

---

### Task 1: Add localized pack presentation to the content pipeline

**Files:**

- Modify: `src/content/schema/schemas.ts`
- Modify: `src/content/schema/schemas.test.ts`
- Modify: `src/content/validation.ts`
- Modify: `src/content/validation.test.ts`
- Modify: `src/content/build.ts`
- Modify: `src/content/build.test.ts`
- Modify: `content-source/seed/en.json`
- Regenerate: `src/content/bundles/en.json`
- Regenerate: `src/content/manifests/embedded.json`

**Interfaces:**

- Consumes: `EditorialSource.localizedPacks: LocalizedPack[]`
- Produces: `ContentBundle.packCopy: LocalizedPack[]`

- [x] **Step 1: Write schema/build tests** using one `LocalizedPack` fixture with `packId`, `locale`, `title`, `promise`, `description`, `audience`, `contentWarnings`, and exactly two `sampleQuestionIds`; assert strict parsing and deterministic runtime output.
- [x] **Step 2: Write validation tests** asserting `missing_pack_copy`, `duplicate_pack_copy`, `invalid_pack_sample`, and `missing_pack_sample` errors for active packs.
- [x] **Step 3: Run `jest --runInBand src/content/schema/schemas.test.ts src/content/validation.test.ts src/content/build.test.ts`** and confirm missing schema fields or validation behavior fails.
- [x] **Step 4: Implement `localizedPackSchema`, add `localizedPacks` to `editorialSourceSchema`, add `packCopy` to `contentBundleSchema`, and include only current-locale active-pack copy in `buildRuntimeArtifacts`.
- [x] **Step 5: Add original English presentation records for all five active seed packs**, using two approved questions from each matching pack as samples.
- [x] **Step 6: Run `node --import tsx scripts/content-tool.ts build`**, then rerun the focused tests and expect them to pass.

### Task 2: Build the pure eligible pack catalog

**Files:**

- Create: `src/features/packs/packCatalog.ts`
- Create: `src/features/packs/packCatalog.test.ts`

**Interfaces:**

- Consumes: `ContentBundle`, `{ mode, ageConfirmed18, comfortLevel, filter }`
- Produces: ordered `PackCatalogItem[]` with copy, counts, duration, intensity, premium state, and eligibility

- [x] **Step 1: Write catalog tests** proving Couple/Friends mode filtering, `both` inclusion, premium visibility, mature age/comfort exclusion, All/Free/Fun/Deep/Relationship/Spicy/Friends filters, stable sort order, runtime question counts, and the minimum 10-minute duration label.
- [x] **Step 2: Run `jest --runInBand src/features/packs/packCatalog.test.ts`** and confirm the missing module failure.
- [x] **Step 3: Implement `PackFilter`, `PackCatalogInput`, `PackCatalogItem`, `buildPackCatalog`, and `getAvailablePackFilters`** as pure functions with no React or store dependency.
- [x] **Step 4: Run the focused test** and expect all catalog cases to pass.

### Task 3: Create original local covers and the focal artwork registry

**Files:**

- Create: `assets/pack-art/source/warm-start.svg`
- Create: `assets/pack-art/source/laugh-together.svg`
- Create: `assets/pack-art/source/deep-night.svg`
- Create: `assets/pack-art/source/appreciation.svg`
- Create: `assets/pack-art/source/friends-easy.svg`
- Generate: `assets/pack-art/*.png`
- Create: `src/features/packs/artworkRegistry.ts`
- Create: `src/features/packs/artworkRegistry.test.ts`
- Create: `src/features/packs/PackArtwork.tsx`

**Interfaces:**

- Consumes: content `artworkId`, optional display size
- Produces: registered local image source, normalized focal point, dominant fallback color, and accessible cover rendering

- [x] **Step 1: Write registry tests** asserting all five active embedded `artworkId` values resolve, focal coordinates stay within `0..1`, and an unknown ID returns the deterministic fallback.
- [x] **Step 2: Run `jest --runInBand src/features/packs/artworkRegistry.test.ts`** and confirm the missing module failure.
- [x] **Step 3: Author five text-free 1200×800 SVG covers** using the existing plum/cream/coral/gold/mint/category palette and distinct abstract editorial compositions.
- [x] **Step 4: Render each SVG to PNG with `inkscape <source.svg> --export-filename=<cover.png> --export-width=1200 --export-height=800`** and keep the SVG sources for reproducibility.
- [x] **Step 5: Implement a typed registry with static `require` calls**, focal coordinates, and fallback; add `PackArtwork` with cover sizing and decorative accessibility behavior.
- [x] **Step 6: Run the focused registry test and TypeScript** and expect both to pass.

### Task 4: Add real pack selection state and routing

**Files:**

- Modify: `src/state/gameSetupStore.ts`
- Modify: `src/state/gameSetupStore.test.ts`
- Modify: `app/players.tsx`
- Modify: `src/routes.test.ts`

**Interfaces:**

- Consumes: selected pack ID and completed player setup
- Produces: `selectedPackId`, `selectPack(packId)`, mode-change invalidation, and `/packs` navigation

- [x] **Step 1: Extend store tests** to assert pack selection, selection replacement, and clearing selection when mode changes.
- [x] **Step 2: Extend the player screen and route tests** to require successful completion to replace the route with `/packs` and require the pack screen module to export.
- [x] **Step 3: Run `jest --runInBand src/state/gameSetupStore.test.ts src/features/player-setup/PlayerSetupScreen.test.tsx src/routes.test.ts`** and confirm the new expectations fail.
- [x] **Step 4: Add `selectedPackId` and `selectPack` to the existing setup store**, clear it on mode changes, route completed player setup to `/packs`, and register the screen in route coverage.
- [x] **Step 5: Rerun the focused tests** and expect them to pass.

### Task 5: Implement the responsive library and detail-first flow

**Files:**

- Create: `app/packs.tsx`
- Create: `src/features/packs/PackCard.tsx`
- Create: `src/features/packs/PackDetailModal.tsx`
- Create: `src/features/packs/PackLibraryScreen.test.tsx`

**Interfaces:**

- Consumes: current locale, mode, comfort settings, embedded bundle, catalog builder, artwork registry, selected pack state
- Produces: filters, accessible cards, native detail modal, free selection, premium locked explanation, and honest empty states

- [x] **Step 1: Write screen tests** asserting mode-aware visible packs, filter behavior, card press opening detail before selection, two real sample questions, free pack selection, premium locked copy without a purchase action, selected accessibility state, and missing-locale empty state.
- [x] **Step 2: Run `jest --runInBand src/features/packs/PackLibraryScreen.test.tsx`** and confirm missing screen/components fail.
- [x] **Step 3: Implement `PackCard`** with cover, title, one-line promise, duration, intensity dots, Free/Premium badge, and selected state conveyed through text plus accessibility.
- [x] **Step 4: Implement `PackDetailModal`** with native `Modal`, large cover, purpose, audience, warnings, intensity, and two sample questions; expose one selection action only for free packs.
- [x] **Step 5: Implement `app/packs.tsx`** with 44-point chips, one/two-column responsive layout, current-locale bundle loading, filter empty state, and locale-safe missing bundle state.
- [x] **Step 6: Run screen and route tests** and expect all interactions to pass.

### Task 6: Validate and publish stacked PR 5

**Files:**

- Modify: `docs/superpowers/plans/2026-08-14-pr5-pack-library-artwork.md`
- Modify: `skill-observations/log.md`

**Interfaces:**

- Consumes: completed PR 5 tree
- Produces: green local checks and a draft PR targeting `agent/pr4-home-players`

- [x] Run Prettier, ESLint with zero warnings, TypeScript, and all Jest suites.
- [x] Run content validation, duplicate scan, inventory report, and generated drift check.
- [x] Run Expo Doctor and web export; rely on GitHub Actions for Doctor only if local registry access is blocked.
- [x] Attempt Playwright browser verification only when the CLI prerequisite is locally available; otherwise preserve the documented offline stop condition.
- [ ] Flush task observations and close every plan checkbox.
- [ ] Commit intentionally, publish the branch, open the stacked draft PR, and wait for green CI.
