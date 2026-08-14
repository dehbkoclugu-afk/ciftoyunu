# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue — resolved statuses always carry their resolution date

---

## 2026-08-14

### Observation 1: Verify major-version test APIs before writing plan examples

**Status:** OPEN
**Date:** 2026-08-14
**Session context:** Bootstrapping a new Expo application with current testing dependencies
**Skill:** writing-plans
**Type:** open-source
**Phase/Area:** Test-first implementation steps

**Issue:** The implementation plan named valid test behavior but assumed synchronous rendering and a matcher path from an older major version. The current testing library made rendering and events asynchronous and moved its matcher bootstrap, so the first failure occurred in the test harness rather than at the intentionally missing implementation.

**Suggested improvement:** In plans that pin a newly released major test dependency, add one package-API smoke check before presenting concrete test code, including async signatures and the supported matcher entry point.

**Principle:** A failing test only validates test-first sequencing when the harness itself is known to match the pinned dependency version.

Checkpoint 6: no additional observations.

### Observation 2: Validate packaged skill resources before requiring setup scripts

**Status:** OPEN
**Date:** 2026-08-14
**Session context:** Applying a frontend quality skill to a new mobile onboarding surface
**Skill:** impeccable
**Type:** open-source
**Phase/Area:** Setup

**Issue:** The setup workflow requires a context script, but the installed skill package contains no scripts directory. Following the mandatory setup command therefore fails before the usable reference playbooks run.

**Suggested improvement:** Make the context script part of package validation, or document a deterministic reference-only fallback when the script is absent.

**Principle:** A mandatory setup step must either ship with the validated artifact or define a complete fallback that preserves the workflow.

Checkpoint PR2 completion: no additional observations.

Checkpoint PR3 core: no additional observations.

Checkpoint PR3 completion: no additional observations.

Checkpoint PR4 design: no additional observations.

Checkpoint PR4 data layer: no additional observations.

### Observation 3: Document an offline path for the Playwright CLI wrapper

**Status:** OPEN
**Date:** 2026-08-14
**Session context:** Visually verifying a locally exported mobile web surface in a restricted workspace
**Skill:** playwright
**Type:** open-source
**Phase/Area:** Prerequisite setup

**Issue:** The bundled wrapper is described as working without a global CLI, but it delegates to `npx --package` and therefore still requires registry access when the package is not cached. In a network-restricted environment, browser verification stops after the prerequisite check even when the application and Node runtime are available locally.

**Suggested improvement:** Add a prerequisite probe for a cached or installed CLI and document an explicit offline-safe fallback or a clear stop condition before asking the wrapper to fetch the package.

**Principle:** A bundled launcher is not an offline capability unless its executable dependency is bundled or its network requirement is declared and checked first.

Checkpoint PR4 completion: no additional observations.
