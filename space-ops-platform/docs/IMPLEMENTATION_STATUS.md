# Space Ops Platform — Implementation Status

This file is an execution ledger, not a product-definition document. `PRODUCT_BASELINE.md` remains the non-regression source of truth.

## Completion gate

Do not declare the platform complete until all of the following are true:

- [x] Exactly six first-level modules: OPS / TWIN / PLAN / GS / EARTH / ENG.
- [x] Mission orchestration service exposes the canonical Objective / AOI → candidate space resources → Opportunity → Weather / Resource → Contact → Schedule → Process → Deliver chain.
- [x] Archive-first and explicit new-tasking paths are represented in the mission engine.
- [x] Ground scheduling has explicit ownership classes and conflict/preemption logic.
- [x] Service modes use LIVE / SIMULATED / CONNECTOR_REQUIRED.
- [x] Fast TLE/SGP4 tier is implemented behind an API.
- [x] Business numerical-dynamics capability is preserved in the contract and not silently removed.
- [x] Precision GNSS/SP3/RINEX/POD capability is preserved in the contract and not silently removed.
- [x] Canonical production Mission Copilot calls `/v1/copilot/mission` when the API is available and uses a clearly labelled SIMULATED fallback on static GitHub Pages.
- [x] Production Copilot UI renders OBJECTIVE / AOI / OPPORTUNITY / WEATHER_RESOURCE / CONTACT / SCHEDULE / PROCESS / DELIVER and exposes archive-first vs tasking strategy.
- [x] Production GS workspace consumes `/v1/ground-network/pool` and exposes own / partner / GSaaS resource class plus scheduler resolution.
- [x] Production ENG workspace consumes `/v1/engineering/capabilities` and renders fast / business / precision plus GNC/ADCS capability modes.
- [x] Production EARTH workspace can pass selected EO results into Mission Planning and force an archive-first strategy.
- [x] Mission execution state persists beyond a single response in the production browser client using `spaceops.currentMission`; server-side durable mission state is still a future strengthening item.
- [ ] Critical API, orchestration, UI-contract and production-console tests pass in CI after the latest main-branch changes.
- [x] The fixed public entry `space-ops-live.html` routes to the canonical `production.html`; Vercel `/space-ops` already targets the same canonical console.

**Scope boundary:** the user's separate Data Search + AOI product is not part of Space Ops Platform and must not be integrated, reused, duplicated, or treated as a completion dependency unless explicitly requested later.

## Current implementation notes

### Mission Intelligence / Copilot

Implemented in `services/mission/orchestrator.py` and production UI:

- canonical workflow stages;
- archive compliance filtering;
- archive-first path;
- explicit tasking path;
- optical weather threshold handling;
- spacecraft battery/storage thresholds;
- ground resource ownership/capability ranking;
- conflict-aware contact selection;
- lower-priority contact preemption;
- processing/QC/delivery estimates with simulated mode honesty;
- production Mission Copilot binding to `/v1/copilot/mission`;
- explicit OBJECTIVE / AOI / OPPORTUNITY / WEATHER_RESOURCE / CONTACT / SCHEDULE / PROCESS / DELIVER visualization;
- browser-persisted current mission state.

### Ground Network OS

Implemented:

- own / partner / GSaaS / virtual resource classes;
- band/status/utilization attributes;
- `/v1/ground-network/pool`;
- production resource-pool rendering;
- overlap-based reservation conflict detection;
- priority-aware blocking and preemption behavior;
- pass prediction and contact reservation flow in the GS workspace.

Still required: durable reservation persistence and real provider booking adapters.

### Engineering & Dynamics

Implemented:

- TLE/SGP4 propagation API;
- link-budget API;
- `/v1/engineering/capabilities` contract;
- production capability rendering for fast / business / precision tiers;
- explicit hooks for numerical force models, GNC/ADCS, GNSS/SP3/RINEX/POD.

Still required: real business/precision engines or connected providers; these remain `CONNECTOR_REQUIRED` and must not be presented as live.

### Earth Intelligence

Implemented:

- EO archive search adapter/API foundation;
- Weather adapter/API foundation;
- Maritime/AIS adapter/API foundation;
- explicit simulated modes;
- EO result handoff into Mission Planning / archive-first strategy;
- processing/QC/delivery stage representation in mission orchestration.

Still required: live provider adapters and downstream product/QC connectors where needed by Space Ops itself.

### Fixed public entry

The permanent user-facing URL remains:

`/sat-discovery-hub/space-ops-live.html`

That file redirects only to `space-ops-platform/apps/web/production.html`. The public URL must not change as implementation continues.

## Rule for future implementation runs

Every new change should close one or more unchecked completion-gate items. Do not add new first-level modules, parallel demos or replacement pages. Do not pull unrelated products such as Data Search + AOI into Space Ops. When capability is not yet live, strengthen the contract, adapter, workflow or tests without falsely changing the data mode.
