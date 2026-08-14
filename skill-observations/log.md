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
