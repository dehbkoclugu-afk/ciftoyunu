# Content Schema and Validation Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship a deterministic validated English content seed behind an approved-only runtime loader.

**Architecture:** A Zod schema validates controlled editorial JSON, cross-record rules enforce references and safety, and a Node 24 build tool loaded with tsx generates the embedded runtime bundle and manifest. The app imports only generated, schema-validated runtime content.

**Tech Stack:** TypeScript 6, Node 24 native type stripping, Zod 4, Jest, Expo SDK 57, GitHub Actions.

## Global Constraints

- Runtime content contains approved records only.
- IDs are stable and unique.
- Missing locale content never falls back to mixed-language questions.
- Generated files are deterministic and CI-verified.
- PR 3 contains exactly 50 original English seed questions.

---

### Task 1: Add content schemas and controlled vocabularies

**Files:**

- Create: src/content/schema/vocabulary.ts
- Create: src/content/schema/schemas.ts
- Create: src/content/schema/schemas.test.ts
- Modify: package.json and package-lock.json

**Interfaces:**

- Consumes: unknown content records
- Produces: typed QuestionIntent, LocalizedQuestion, QuestionPack, bundle, and manifest

- [x] Write failing schema tests for IDs, vocabulary, and mature policy.
- [x] Verify the missing-module failure.
- [x] Add Zod and implement the minimum strict schemas.
- [x] Run the schema tests.

### Task 2: Add cross-record validation and duplicate detection

**Files:**

- Create: src/content/validation.ts
- Create: src/content/validation.test.ts

**Interfaces:**

- Consumes: EditorialSource
- Produces: ContentIssue[] with error/warning, code, and record ID

- [x] Write failing reference, approval, placeholder, and duplicate tests.
- [x] Verify expected failures.
- [x] Implement invariant checks and normalized/Jaccard duplicate detection.
- [x] Run validation tests.

### Task 3: Create deterministic builder and embedded loader

**Files:**

- Create: src/content/build.ts
- Create: src/content/loader.ts
- Create: src/content/loader.test.ts
- Create: scripts/content-tool.ts
- Create: src/content/bundles/en.json
- Create: src/content/manifests/embedded.json

**Interfaces:**

- Consumes: validated EditorialSource
- Produces: deterministic ContentBundle, ContentManifest, SHA-256, and locale loader

- [x] Write failing builder and loader tests.
- [x] Verify expected failures.
- [x] Implement deterministic join, sort, serialization, hashing, and loader validation.
- [x] Run builder and loader tests.

### Task 4: Author and validate the 50-question English seed

**Files:**

- Create: content-source/seed/en.json

**Interfaces:**

- Consumes: five approved pack briefs
- Produces: 50 canonical intents and 50 approved English localizations

- [x] Author ten original questions for each selected pack.
- [x] Assign controlled metadata, interaction mix, reviewer IDs, and stable IDs.
- [x] Run schema, reference, safety, placeholder, and duplicate validation.
- [x] Generate the embedded bundle and manifest.
- [x] Confirm exact count, mode coverage, intensity coverage, and approved-only output.

### Task 5: Add content commands and CI gates

**Files:**

- Modify: package.json
- Modify: .github/workflows/ci.yml

**Interfaces:**

- Consumes: content source and generated files
- Produces: validate, duplicates, report, build, and check commands plus CI enforcement

- [x] Add the content scripts.
- [x] Insert validate/duplicates/report/check before Expo Doctor.
- [x] Run every command locally.
- [x] Verify generated-file drift through exact deterministic comparison.

### Task 6: Validate and publish stacked PR 3

**Files:**

- Modify: skill-observations/log.md

**Interfaces:**

- Consumes: completed PR 3 tree
- Produces: green local checks and a draft PR targeting agent/pr2-onboarding

- [ ] Run Prettier, ESLint, TypeScript, Jest, Expo config, and web export.
- [x] Run content validation and generated-file checks.
- [ ] Flush task observations.
- [ ] Commit, publish, and open the draft PR.
