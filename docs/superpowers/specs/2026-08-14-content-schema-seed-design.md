# Content Schema and Seed Design

**Status:** Approved by the master implementation contract and the user's instruction to continue.

## Goal

Create one validated content boundary that turns controlled editorial source data into a deterministic, approved-only embedded English runtime bundle.

## Selected approach

Use a controlled JSON source document for PR 3, validate it with Zod plus cross-record rules, then generate the runtime bundle and manifest deterministically. This keeps the 50-item seed reviewable without introducing a CSV parser before editors need one.

Rejected alternatives:

- Runtime JSON only: fewer files, but no separation between editorial states and shippable data.
- CSV/TSV pipeline now: appropriate at scale, but unnecessary parsing and escaping complexity for the first 50 items.
- Hand-maintained runtime plus source: creates two truths and cannot guarantee deterministic output.

## Source and runtime boundaries

content-source/seed/en.json contains packs, canonical intents, English localizations, content version, approval timestamp, and minimum app version. It may carry editorial statuses.

src/content/bundles/en.json is generated. Each runtime question joins its approved canonical intent with its approved English localization. Draft, review, rejected, retired, or missing-localization records never enter runtime.

src/content/manifests/embedded.json stores schema/content versions, minimum app version, bundle hash, approved timestamp, and question count. The loader validates both manifest and bundle. A locale without an embedded bundle returns no content; it never silently mixes English questions into another locale.

## Schema

Zod schemas cover:

- QuestionIntent
- LocalizedQuestion
- QuestionPack
- EditorialSource
- RuntimeQuestion and ContentBundle
- ContentManifest

Controlled vocabularies include the contract's topic tags plus explicit relationship stages, safety tags, interaction types, maturity, pack categories, statuses, modes, and starter behavior. Unknown vocabulary fails validation.

## Cross-record validation

Validation fails when:

- IDs are duplicated or do not match stable formats.
- An intent references a missing pack.
- An approved intent lacks an approved localization.
- A localization references a missing intent.
- A pack has fewer approved localized questions than its current minimum.
- Region allow and block lists overlap.
- Mature content is assigned to a pack below age 18.
- Explicit content lacks consent/adult safety tags and a safety reviewer.
- Runtime contains anything other than approved records.
- Text contains forbidden placeholders, TODO/TBD/Lorem fragments, unmatched brackets, or an empty question.
- Normalized duplicates or token Jaccard above 0.82 are found.

## Seed composition

The English seed contains 50 original, approved questions:

- 10 Warm Start
- 10 Laugh Together
- 10 Deep Night
- 10 Appreciation
- 10 Easy Icebreakers

This covers couple, both, and friends modes; intensities 1–4; open, choice, rank, predict, memory, scenario, rapid, and both interactions. The seed pack minimum is 10 so the internal bundle is usable. PR 11 raises pack minimums to the launch contract before release.

All seed records use stable IDs, original source classification, named internal editorial/native/safety review metadata, and deterministic timestamps. The seed contains no mature questions; mature policy is exercised with validator tests.

## Tooling and CI

One Node 24 TypeScript tool provides:

- content:validate
- content:duplicates
- content:report
- content:build
- content:check

Build sorts every collection by stable ID, serializes with fixed indentation and a trailing newline, hashes the exact bundle bytes with SHA-256, and writes both generated files. Check builds in memory and compares exact bytes without mutating files.

CI runs validation, duplicate detection, reporting, and generated-file checks before Expo Doctor.

## Testing

- schema rejects unknown vocabulary and malformed IDs
- cross-validation rejects missing references and mature-policy violations
- duplicate detector catches normalized/Jaccard duplicates
- builder emits exactly 50 approved English questions
- output is byte-stable across repeated builds
- loader validates the embedded bundle and refuses unavailable locales
