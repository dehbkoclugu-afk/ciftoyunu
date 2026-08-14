# PR 1 Bootstrap and Design System Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Create a production-oriented Expo SDK 57 foundation with strict TypeScript, stack navigation, theme tokens, accessible primitives, a development gallery, and enforceable quality gates.

**Architecture:** Expo Router owns the stack and routes; `src/design` is the single source of visual tokens, while small primitives in `src/components/primitives` consume those tokens through a theme hook. Tests exercise theme resolution and primitive behavior without coupling screens to implementation details.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, TypeScript strict, Jest with jest-expo, React Native Testing Library, ESLint, Prettier, GitHub Actions.

## Global Constraints

- Use `APP_NAME` configuration with `Project Duo` as the fallback; do not hard-code a final brand.
- Use stack navigation only; no bottom tabs.
- Every interactive primitive has a 44 pt minimum target, visible disabled/loading states, and accessibility metadata.
- Light and dark palettes use only the approved master-plan tokens.
- Add no state, purchase, analytics, localization, or content dependencies in PR 1.

---

### Task 1: Scaffold the Expo application

**Files:**

- Create: `package.json`, `package-lock.json`, `app.json`, `tsconfig.json`, `expo-env.d.ts`
- Create: `app/_layout.tsx`, `app/index.tsx`
- Create: `.nvmrc`, `.env.example`, `.gitignore`

**Interfaces:**

- Consumes: `EXPO_PUBLIC_APP_NAME?: string`
- Produces: `appConfig.name: string`, root Expo Router stack

- [ ] **Step 1: Generate an Expo SDK 57 TypeScript app using the official current template.**
- [ ] **Step 2: Remove demo/tab routes and preserve only a stack root plus one index route.**
- [ ] **Step 3: Enable `strict`, `noUncheckedIndexedAccess`, and the Expo Router typed-routes experiment.**
- [ ] **Step 4: Run `npx expo install --check` and `npx tsc --noEmit`; both must pass.**
- [ ] **Step 5: Commit `chore: bootstrap Expo SDK 57 app`.**

### Task 2: Define design tokens and theme resolution

**Files:**

- Create: `src/design/colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `motion.ts`, `themes.ts`, `index.ts`
- Create: `src/design/themes.test.ts`

**Interfaces:**

- Consumes: `ColorSchemeName`
- Produces: `resolveTheme(scheme: ColorSchemeName): AppTheme`, semantic tokens for canvas/surface/text/action/status

- [ ] **Step 1: Write tests asserting light, dark, and null/system theme resolution and exact approved colors.**
- [ ] **Step 2: Run `npm test -- --runInBand src/design/themes.test.ts`; verify missing-module failure.**
- [ ] **Step 3: Implement frozen token objects and a minimal `resolveTheme` function.**
- [ ] **Step 4: Run the targeted test and `npm run typecheck`; both must pass.**
- [ ] **Step 5: Commit `feat: add Project Duo design tokens`.**

### Task 3: Add theme provider and accessible primitives

**Files:**

- Create: `src/design/ThemeProvider.tsx`
- Create: `src/components/primitives/AppText.tsx`, `AppButton.tsx`, `AppScreen.tsx`, `IconButton.tsx`, `Chip.tsx`, `index.ts`
- Create: `src/components/primitives/AppButton.test.tsx`, `Chip.test.tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**

- Consumes: native color scheme and primitive props
- Produces: `useAppTheme(): AppTheme`; button variants `primary | secondary | ghost | destructive`; selected/unselected chip state

- [ ] **Step 1: Write component tests for label rendering, disabled press suppression, loading accessibility state, and chip selection.**
- [ ] **Step 2: Run targeted tests; verify missing-component failures.**
- [ ] **Step 3: Implement only the five required primitives with StyleSheet and existing React Native APIs.**
- [ ] **Step 4: Run component tests, typecheck, and lint.**
- [ ] **Step 5: Commit `feat: add themed accessible primitives`.**

### Task 4: Build the development gallery surface

**Files:**

- Create: `app/dev-gallery.tsx`
- Modify: `app/index.tsx`
- Create: `src/components/BrandMark.tsx`

**Interfaces:**

- Consumes: theme tokens and primitives
- Produces: a responsive showcase of typography, colors, buttons, chips, and status states

- [ ] **Step 1: Add a route smoke test that imports both route modules without throwing.**
- [ ] **Step 2: Run the test and verify failure before the gallery exists.**
- [ ] **Step 3: Implement a warm editorial landing surface and a non-production-linked gallery route.**
- [ ] **Step 4: Verify 360 px and 430 px web viewports with Playwright screenshots in light and dark mode.**
- [ ] **Step 5: Commit `feat: add design system gallery`.**

### Task 5: Enforce quality gates and CI

**Files:**

- Create: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `jest.config.js`, `jest.setup.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`

**Interfaces:**

- Consumes: repository source and lockfile
- Produces: `format:check`, `lint`, `typecheck`, `test`, `expo:doctor`, and `export:web` commands

- [ ] **Step 1: Add scripts and a CI workflow pinned to Node 24 with `npm ci`.**
- [ ] **Step 2: Run every quality command locally and record any failure.**
- [ ] **Step 3: Fix only failures within PR 1 scope; do not suppress rules globally to make CI green.**
- [ ] **Step 4: Run `npm run validate` followed by `npx expo export --platform web`.**
- [ ] **Step 5: Commit `ci: enforce PR 1 quality gates`.**

## Self-review

- Every PR 1 requirement maps to a task: Expo/Router/TS, tokens, primitives, gallery, tests, and CI.
- No placeholder screens, future feature scaffolding, provider abstractions, or unresolved package choices are included.
- All named interfaces are consistent and every task has a runnable verification command.
- Master-plan PR 2 and later concerns are intentionally excluded from this independently testable slice.
