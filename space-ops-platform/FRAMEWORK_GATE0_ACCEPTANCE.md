# Space Ops Platform — Gate 0 Framework Acceptance

Status: ACTIVE / MANDATORY
Applies to: Framework V2 before LOCK
Branch: space-ops-dev

## 1. Purpose

Gate 0 exists to prevent a flawed architecture from being frozen and propagated into every later layer.

The framework may not be marked LOCKED merely because the six modules have been named or the shell can render. It must survive a formal, evidence-based architecture review.

There is no "close enough" framework acceptance. Any mandatory failure blocks the freeze.

## 2. Required review sequence

Gate 0 is executed in three complete passes. A pass is not a spot check.

### Pass A — Completeness review

Question: Is every required architectural concern explicitly defined?

Check all of the following:

- six first-level module responsibilities
- module inputs, outputs and ownership boundaries
- canonical entity model and ID policy
- mission, contact, product, command and event lifecycle models
- shared time / replay model
- shared event / alert model
- command authority / permission / audit model
- data provenance and history model
- API / contract boundaries
- spatial engine boundary
- flight-dynamics engine boundary
- telemetry / command backend boundary
- ground-network adapter boundary
- payload / processing boundary
- observability / logging boundary
- failure and degraded-mode behavior
- dependency / open-source ownership and license decisions
- security trust boundaries
- migration path from the current prototype
- framework-level acceptance tests

If any required concern is absent, Pass A fails.

### Pass B — Consistency and traceability review

Question: Do the defined parts agree with one another and trace to an operator workflow?

Required checks:

- no domain is owned by two first-level modules without an explicit shared-service rule
- no important domain is owned by nobody
- every canonical entity has exactly one source of truth
- the same spacecraft/station/mission/AOI/contact/product cannot silently change identity between modules
- every cross-module workflow has a documented producer -> contract -> consumer chain
- every lifecycle transition has one authoritative owner
- every KPI has business meaning, scope, time window and source/calculation
- every visual semantic (line/ring/cone/color/marker/animation/label) maps to a defined domain concept
- every "LIVE" state maps to an actual live connector; otherwise it is DEMO/SIMULATED/CONNECTOR_REQUIRED
- every external engine has an adapter boundary and replacement strategy
- no UI page is allowed to become a hidden second data model
- no domain service depends on a UI implementation detail

If any critical contradiction remains, Pass B fails.

### Pass C — Adversarial / failure review

Question: Does the architecture still hold when things go wrong or scale up?

Mandatory scenarios:

1. telemetry connector unavailable
2. command backend unavailable
3. stale or conflicting ephemeris
4. ground-station reservation conflict
5. planning service returns no executable plan
6. data-processing job fails or is delayed
7. two users attempt conflicting privileged actions
8. replay mode runs while live data continues arriving
9. an external open-source engine must be replaced
10. a spacecraft is renamed without changing its canonical identity
11. one module is temporarily unavailable
12. audit/history storage is delayed
13. a connector reports invalid timestamps or out-of-order events
14. the system scales from a demo fleet to a large catalog
15. a schema version changes while other modules are still on the previous contract

For each scenario, the framework must define ownership, state behavior, operator-visible status, recovery path and audit behavior.

If a failure scenario requires bypassing the framework or creating an ad-hoc second path, Pass C fails.

## 3. Mandatory evidence pack

Gate 0 cannot pass from verbal reasoning alone. The repository must contain evidence artifacts for all items below:

1. `FRAMEWORK_V2.md` — final six-module architecture and responsibilities
2. `DOMAIN_BOUNDARIES.md` — ownership matrix and anti-overlap rules
3. `CANONICAL_MODEL.md` — canonical entities, IDs and relationships
4. `STATE_MACHINES.md` — mission/contact/product/command/event lifecycle states
5. `SYSTEM_DATA_FLOWS.md` — cross-module workflows and producer/consumer flows
6. `API_CONTRACTS.md` — stable service and adapter contracts at architecture level
7. `SECURITY_AUTHORITY_AUDIT.md` — trust boundaries, roles, command authority and audit
8. `TIME_EVENT_PROVENANCE.md` — time, replay, events, provenance and historical semantics
9. `OPEN_SOURCE_CAPABILITY_MAP.md` — reuse decisions, licenses and integration mode
10. `FAILURE_DEGRADED_MODES.md` — failure ownership and degraded-state behavior
11. `MIGRATION_V1_TO_V2.md` — migration from current prototype without hidden parallel models
12. `FRAMEWORK_ACCEPTANCE_TESTS.md` — executable/static checks for frozen invariants
13. `FRAMEWORK_GATE0_RESULT.md` — the signed-off result of Pass A/B/C

A document may be split into more detailed ADRs, but no required evidence may be omitted.

## 4. Hard-fail conditions

Any one of these blocks framework LOCK regardless of overall score:

- unresolved first-level module overlap
- missing CONTROL command/telemetry authority model
- more than one canonical identity source
- more than one independent global time/event model
- undefined command authorization or audit ownership
- unexplained KPI presented as architecture
- unexplained visual semantic included in the framework
- fake LIVE state
- critical external dependency with unknown license/integration constraints
- no defined degraded behavior for a critical external connector
- domain services coupled directly to presentation markup
- no framework-level regression tests
- unresolved P0 or P1 architecture defect

## 5. Result classification

Only three statuses are permitted:

- `PASS — LOCK APPROVED`
- `FAIL — LOCK BLOCKED`
- `NOT READY — REVIEW CANNOT COMPLETE`

There is no conditional framework lock.

A numeric score may be recorded for diagnostics, but it can never override a hard-fail condition.

## 6. Required result format

`FRAMEWORK_GATE0_RESULT.md` must include:

- reviewed commit SHA
- review date
- Pass A result and evidence
- Pass B result and evidence
- Pass C result and evidence
- hard-fail checklist
- unresolved defects by severity
- exact files reviewed
- exact missing evidence
- final decision
- if PASS: framework lock SHA
- if FAIL/NOT READY: explicit reasons and next required actions

## 7. Freeze rule

Only after `FRAMEWORK_GATE0_RESULT.md` says `PASS — LOCK APPROVED` may `FRAMEWORK_FREEZE_PROTOCOL.md` be changed from:

`Framework V2 status: DRAFT / NOT YET LOCKED`

to:

`Framework V2 status: LOCKED`

The exact approved commit SHA must then be recorded and becomes the immutable architecture baseline for Layer 1.

## 8. Post-lock protection

After Gate 0 passes, automated/static framework tests must prevent ordinary feature work from changing frozen invariants, including:

- count and identity of first-level modules
- canonical entity contract ownership
- global time/event ownership
- shared engine boundaries
- domain ownership matrix
- required audit/authority boundaries

Any intentional change must use the architecture-change process defined in `FRAMEWORK_FREEZE_PROTOCOL.md`.
