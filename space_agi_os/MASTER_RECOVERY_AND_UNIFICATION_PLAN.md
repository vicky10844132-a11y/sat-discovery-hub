# SPACE AGI OS — Master Recovery and Unification Plan

## Objective
Recover, audit, unify and harden all historically separate Glory Stellar systems without destroying validated behavior. The final system must converge toward one governed capability platform with stable interfaces, regression coverage and reversible releases.

## Systems in scope
- Corporate website / public content surface
- LinkedIn / external communications surface
- Satellite data discovery / AOI tools
- Space Ops / ground-station / orbit operations
- GS LinkOps / AI Copilot / operator modules
- Project management / order / delivery / invoice workflows
- Production / QC / release / credential-control workflows
- APIs, external providers, authentication and deployment
- SPACE AGI OS orchestration, memory, agents and evaluation

## Non-negotiable execution rules
1. Freeze a baseline before modification.
2. Never edit production directly when a branch/test path exists.
3. Preserve validated requirements and UX unless a replacement is explicitly justified.
4. Every capability receives exactly one canonical implementation.
5. Classify each legacy element as KEEP / MERGE / REFACTOR / REPLACE / RETIRE / MISSING.
6. No feature is COMPLETE merely because code exists.
7. COMPLETE requires implementation + integration + error handling + permission checks + test coverage + end-to-end verification.
8. Every change must be reversible.
9. New technology is researched and compared first; absorb only the parts that materially improve the system.
10. Production-impacting communications, commercial actions, credentials, destructive operations and irreversible external writes remain approval-gated.

## Global Definition of Done
A module can be marked VERIFIED only when all are true:
- Functional objective matches the approved baseline.
- No required previous behavior is lost.
- UI action maps to a real backend or an explicitly labeled mock.
- Data persists in the intended authoritative store.
- Permissions/authentication are enforced.
- Errors and empty states are handled.
- Unit/integration tests pass where applicable.
- Regression tests for dependent capabilities pass.
- One end-to-end scenario passes with real or controlled test data.
- Health checks and rollback path are documented.

## Phase 0 — Recovery Baseline
- Inventory repository tree, pages, APIs, workflows, data stores, environment variables, deployment targets and external dependencies.
- Identify historical patch/fix workflows and mark them as legacy repair artifacts.
- Capture current online behavior and known-good screenshots/URLs where available.
- Build canonical capability registry.

## Phase 1 — Capability Matrix
For every capability record:
- business objective
- current implementation(s)
- owner module
- data source
- API contract
- external dependencies
- known defects
- conflicts/duplicates
- classification: KEEP / MERGE / REFACTOR / REPLACE / RETIRE / MISSING
- target implementation
- regression tests
- verification status

## Phase 2 — Project Operations Recovery
Target canonical flow:
Inquiry -> Requirement -> Internal review -> Supplier confirmation -> Quote -> Contract -> Order -> Execution -> Delivery -> Invoice -> Payment -> Archive

Required domains:
- clients and contacts
- project master record
- requirement versioning
- AOI / geometry references
- supplier tasking
- order forms
- pricing / quotation history
- contract references
- delivery status
- invoice / payment status
- attachments and correspondence references
- audit trail
- owner / assignee / next action / due date

Legacy local-browser-only storage must not be treated as production authoritative storage.

## Phase 3 — EO / AOI / Satellite Discovery
Unify:
- AOI input and validation
- catalog/provider adapters
- satellite capability metadata
- search result normalization
- tasking feasibility
- preview/footprint handling
- order handoff to Project Operations

## Phase 4 — Space Ops / Ground Station
Unify:
- satellite registry
- orbit/TLE/GP source abstraction
- pass/contact computation
- station resources
- mission/task scheduling
- reception / transfer status
- billing readiness
- operational alerts

## Phase 5 — Production / QC / Delivery
Canonical production chain:
Data readiness -> Resource matching -> Production -> QC -> Validation -> Release review -> Controlled credential release -> Delivery confirmation

All release credentials and irreversible delivery actions must be governed.

## Phase 6 — AGI Orchestration
The orchestration layer must operate above canonical capabilities, not duplicate them.
Core loop:
Goal -> Plan -> Execute -> Observe -> Evaluate -> Correct/Retry -> Memory -> Next Action

Agent outputs are proposals/actions against canonical tools. Agents must not invent parallel business state.

## Phase 7 — Website and External Communications
Website and LinkedIn are presentation/distribution surfaces, not independent sources of truth.
They should consume approved company facts, capabilities, product/service descriptions and project-safe public information from a governed content source.

## Phase 8 — Technology Watch
Pipeline:
Discover -> Research -> Compare -> Relevance -> Benefit/Risk -> Selective absorption -> Experimental branch -> Test -> Decision -> Controlled rollout

Decision outcomes:
- ADOPT
- PARTIAL ADOPT
- WATCH
- REJECT

No technology is adopted merely because it is newer.

## Regression Gates
Every release candidate must validate at minimum:
1. Navigation and all critical buttons.
2. AOI/search core path.
3. Project creation and project status update.
4. Supplier/order handoff path.
5. Delivery/invoice status path.
6. Orbit/ground-station operational core if touched.
7. Authentication/authorization boundaries.
8. Data persistence and migration integrity.
9. External API failure handling.
10. Production smoke test after deploy.

## Initial real-world acceptance scenario
Belize project is the first end-to-end acceptance reference because it contains concrete AOI, imagery requirement, cloud threshold, spectral/bit-depth requirements, coordinate system, buffer and tasking-period constraints.

## Status vocabulary
- NOT FOUND
- INVENTORIED
- DEFECTIVE
- IMPLEMENTED_UNVERIFIED
- VERIFIED
- DEPRECATED
- RETIRED

## Success condition
The project is complete only when the user can give a business objective and the system can execute the correct governed workflow end to end without losing previously approved requirements, while every critical step remains traceable, testable and reversible.
