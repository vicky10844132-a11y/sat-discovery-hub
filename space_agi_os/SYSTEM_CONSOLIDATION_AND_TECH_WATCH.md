# SPACE AGI OS — System Consolidation & Technology Watch

## Objective
Turn historically separate satellite, EO-data, ground-station, mission, billing, communications and AI modules into one governed capability platform. The target is not a collection of pages or scripts, but a coherent operating system with shared contracts, observability, evaluation and upgrade paths.

## 1. Consolidation principles
1. Preserve working capabilities; do not rewrite solely for uniformity.
2. Inventory every module, endpoint, UI, workflow, data store, credential dependency and external API.
3. Classify each item: KEEP / MERGE / REFACTOR / REPLACE / RETIRE / MISSING.
4. Resolve duplicates behind one canonical capability interface.
5. Eliminate hidden cross-module coupling; use explicit service contracts and events.
6. Separate domain logic from UI and provider-specific adapters.
7. Make every capability testable and observable.
8. Production changes require regression checks and approval gates.

## 2. Canonical capability domains
- EO Search & Catalog
- AOI & Geometry
- Satellite / Constellation Registry
- Orbit / Ephemeris / Pass Prediction
- Ground Station & Contact Scheduling
- Tasking / Acquisition Planning
- Data Ordering / Supplier Interfaces
- Production / Processing / QC
- Delivery / Access Control
- Project / CRM / Communications
- Commercial / Pricing / Contract / Billing
- Intelligence / Research
- Agent Orchestration / Memory / Evaluation
- Identity / Authorization / Audit
- Observability / Reliability / Cost Control

## 3. Capability audit matrix
Each module must be recorded with:
- capability_id
- current implementation(s)
- owner / source
- input/output schema
- dependencies
- data persistence
- auth model
- external provider/API
- test coverage
- operational status
- known defects
- conflicts/duplicates
- security sensitivity
- canonical replacement
- migration status

## 4. Conflict resolution
Priority order:
1. Correctness and safety
2. Current business workflow
3. Contract/API compatibility
4. Reliability and maintainability
5. Performance and cost
6. UI consistency

No duplicate implementation becomes canonical without tests against the same fixtures.

## 5. Missing-function detection
The AGI evaluator continuously compares:
- stated business workflows
- actual code capabilities
- API coverage
- UI actions
- integration availability
- test results

Missing edges in a workflow are emitted as capability gaps rather than silently skipped.

## 6. Modernization targets (2026)
- Model-native agent harness with controlled sandbox execution
- Multi-agent orchestration only where role separation adds measurable value
- MCP-compatible tool adapters with strict identity/authorization boundaries
- Stateless/retry-safe service interfaces
- Structured tool schemas and typed contracts
- Long-running task state and resumability
- Retrieval + episodic memory separated from authoritative operational data
- Model routing / fallback rather than single-model lock-in
- Automated evals, regression suites, traces and cost telemetry
- Human approval gates for commercial, external communication, credentials and irreversible actions

## 7. Technology Watch
Create a Technology Watch Agent that watches authoritative sources for:
- foundation-model/API releases and deprecations
- Agents SDK / Responses / tool-use changes
- MCP specification and SDK changes
- geospatial/EO standards (STAC, OGC, COG, GeoParquet, Zarr where relevant)
- orbit/SSA data interfaces and policy changes
- satellite-data provider APIs
- security advisories and dependency CVEs
- key OSS releases used by the platform

For every detected change it must produce:
- source and release date
- affected components
- severity: INFO / REVIEW / MIGRATE / URGENT
- compatibility risk
- expected benefit
- migration effort
- test plan
- rollback plan
- recommended action

## 8. Update policy
Technology Watch NEVER edits production directly.

Pipeline:
Detect -> Verify source -> Impact analysis -> Upgrade proposal -> Isolated branch -> Automated tests -> Regression/evals -> Security check -> Human approval -> Merge -> Deploy -> Post-deploy health check -> Rollback if needed.

Patch-level low-risk dependency updates may eventually qualify for policy-based auto-merge, but only after mature CI and rollback exist.

## 9. Freshness registry
Maintain a machine-readable registry for each external dependency:
- current_version
- latest_known_version
- last_checked_at
- upstream_release_date
- deprecation_date
- migration_deadline
- affected_capabilities
- upgrade_status

## 10. Definition of complete
A capability is COMPLETE only when:
- functional path exists
- backend logic exists
- external dependency is real or explicitly mocked
- permissions are enforced
- failures are handled
- tests exist
- observability exists
- documentation exists
- no unresolved conflict with a parallel implementation
- it passes end-to-end workflow validation

## 11. Immediate sequence
Phase A — Full repository inventory and dependency graph
Phase B — Capability matrix and conflict map
Phase C — Canonical interfaces + adapter layer
Phase D — Regression/evaluation harness
Phase E — Workflow completion (Belize first)
Phase F — Technology Watch + freshness registry
Phase G — Controlled upgrade pipeline

This document is the governing rule for SPACE AGI OS consolidation and technical evolution.