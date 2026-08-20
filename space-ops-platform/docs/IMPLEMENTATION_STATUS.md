# Space Ops Platform — Implementation Status

This file is an execution ledger, not a product-definition document. `PRODUCT_BASELINE.md` remains the non-regression source of truth.

## Completion gate

Do not declare the platform complete until all of the following are true:

- [x] Exactly six first-level modules: OPS / TWIN / PLAN / GS / EARTH / ENG.
- [x] Mission orchestration service exposes the canonical Objective/AOI → Data Search → Opportunity → Weather → Resource → Contact → Schedule → Process → Deliver chain.
- [x] Archive-first and explicit new-tasking paths are represented in the mission engine.
- [x] Ground scheduling has explicit ownership classes and conflict/preemption logic.
- [x] Service modes use LIVE / SIMULATED / CONNECTOR_REQUIRED.
- [x] Fast TLE/SGP4 tier is implemented behind an API.
- [x] Business numerical-dynamics capability is preserved in the contract and not silently removed.
- [x] Precision GNSS/SP3/RINEX/POD capability is preserved in the contract and not silently removed.
- [ ] Canonical production Mission Copilot is verified to call `/v1/copilot/mission` rather than a weaker planner-only route.
- [ ] Production Copilot UI renders all canonical stages including AOI and DATA_SEARCH and shows archive-first vs tasking strategy.
- [ ] Production GS workspace consumes the unified ground-pool endpoint and exposes own / partner / GSaaS resource class plus scheduler resolution.
- [ ] Production ENG workspace consumes `/v1/engineering/capabilities` rather than only presenting static capability labels.
- [ ] Production EARTH workspace passes EO search results into Mission Copilot/Data Search workflow rather than remaining an isolated specialist tool.
- [ ] Data Search / AOI baseline system is connected through an adapter contract rather than duplicated.
- [ ] Mission execution state persists beyond a single response and can represent planned / scheduled / acquiring / downlink / processing / delivered states.
- [ ] Critical API, orchestration, UI-contract and production-console tests pass in CI after the latest main-branch changes.
- [ ] No duplicate first-level product or stale deployed entry point contradicts the canonical six-module console.

## Current implementation notes

### Mission Intelligence / Copilot

Implemented in `services/mission/orchestrator.py`:

- canonical workflow stages;
- archive compliance filtering;
- archive-first path;
- explicit tasking path;
- optical weather threshold handling;
- spacecraft battery/storage thresholds;
- ground resource ownership/capability ranking;
- conflict-aware contact selection;
- lower-priority contact preemption;
- processing/QC/delivery estimates with simulated mode honesty.

The API gateway exposes `/v1/copilot/mission`, but the production client still requires an explicit verification/update before this capability is considered fully wired end-to-end.

### Ground Network OS

Implemented API foundations:

- own / partner / GSaaS / virtual resource classes;
- band/status/utilization attributes;
- `/v1/ground-network/pool`;
- overlap-based reservation conflict detection;
- priority-aware blocking and preemption behavior.

Still required: production workspace binding to the full resource-pool model and persistent reservation state.

### Engineering & Dynamics

Implemented:

- TLE/SGP4 propagation API;
- link-budget API;
- capability contract for fast / business / precision tiers;
- explicit hooks for numerical force models, GNC/ADCS, GNSS/SP3/RINEX/POD.

Still required: real business/precision engines or connected providers; these remain `CONNECTOR_REQUIRED` and must not be presented as live.

### Earth Intelligence

Implemented adapter/API foundations for EO, weather and maritime/AIS, with explicit simulated modes.

Still required: live provider adapters, downstream product/QC connector, and direct Data Search/AOI adapter integration.

## Rule for future implementation runs

Every new change should close one or more unchecked completion-gate items. Do not add new first-level modules, parallel demos or replacement pages. When capability is not yet live, strengthen the contract, adapter, workflow or tests without falsely changing the data mode.
