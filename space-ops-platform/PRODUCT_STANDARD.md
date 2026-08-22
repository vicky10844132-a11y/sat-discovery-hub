# Space Ops Platform — Product Standard

Status: Development baseline
Branch: space-ops-dev

## 1. Product ambition

Build a best-in-class, unified space operations platform that combines mission operations, command and telemetry, planning, ground contacts, payload/data operations, and flight dynamics in one coherent product.

This repository may deliver an enterprise-grade prototype and integration-ready product architecture. It must not be described as flight-certified, safety-certified, or production mission-ready until real spacecraft/ground interfaces, security controls, operational procedures, verification, validation, and mission-specific acceptance testing exist.

If a capability is not implemented, it must be marked clearly as DEMO, SIMULATED, CONNECTOR_REQUIRED, or NOT_IMPLEMENTED. Visual appearance must never be used to imply operational capability that does not exist.

## 2. Benchmark baseline

The product architecture is benchmarked against capabilities found in leading mission-operations and engineering systems, including:

- Quindar: integrated Plan, Flight, Control, Event, and Portal model; objective-based planning; fleet-scale command and control; event/anomaly management.
- OpenC3 COSMOS: command/telemetry server, command sender, limits monitoring, procedures/scripts, logging, packet/telemetry viewing, history and replay concepts.
- Yamcs: mission database, telemetry archive, alarms, command verification, command history, queues, role-aware UI.
- NASA Open MCT: streaming and historical telemetry visualization, imagery, timelines, procedures, configurable mission views.
- AWS Ground Station: satellite onboarding, ephemeris, mission profiles, contact search/reservation, contact lifecycle, tracking, dataflow, telemetry delivery.
- Ansys STK/ODTK: mission-context modeling, access/coverage analysis, orbit determination, covariance, communications and engineering analysis.
- CesiumJS: high-precision WGS84 globe, dynamic entities, time-dynamic visualization, real-time telemetry visualization, 3D/2D geospatial layers.

These systems are references for capability and information architecture. The Space Ops Platform must not clone their UI or proprietary implementation.

## 3. Target top-level product architecture

Exactly six first-level operational modules:

1. OPS — Common Operating Picture / Mission Status / Events
2. CONTROL — Command / Telemetry / Procedures / Alerts
3. PLAN — Objectives / Tasking / Scheduling / Optimization
4. GROUND — Network / Pass / Contact / Reservation / Dataflow
5. DATA — Payload / EO / Processing / Product / Delivery
6. FLIGHT — Orbit / OD / Propagation / Maneuver / Conjunction

The following are system-wide services, not first-level modules:

- Canonical Asset Registry / Digital Twin data model
- Shared mission clock and timeline
- Shared event and anomaly service
- Shared authorization, roles and audit trail
- Shared 3D geospatial scene
- Integration/API hub
- Search, history, replay and export

## 4. Canonical object model

A spacecraft, ground station, payload, AOI, mission, contact, event or product must have one canonical identity across the entire platform.

Example: a spacecraft named GF-7 02 must not become SAT-042, OPT-07, or another unrelated identifier on a different page unless that value is explicitly a secondary identifier and shown as such.

All modules must read from the same canonical state. Module-specific screens may show different properties of the same object, but may not invent independent copies.

## 5. Shared 3D scene standard

The 3D Earth is a system visualization service, not a decorative widget and not a separate business module.

Requirements:

- One shared geospatial model and one shared mission time.
- WGS84/ECEF-aware architecture for real integrations.
- Consistent object IDs, positions, labels and state across modules.
- Satellite names visible and unambiguous when operationally useful.
- Orbit, access, AOI, coverage, weather and engineering overlays must have explicit meaning and a legend or inspection path.
- Decorative lines, rings, cones or colors with no defined operational meaning are prohibited.
- Business layers are off by default unless they are necessary to the active task.
- Switching modules must not create contradictory positions, labels or identities.

CesiumJS is the preferred long-term geospatial engine unless a documented architecture review shows another engine is superior for the required use case.

## 6. Metric standard

No metric may exist only because the layout has an empty KPI slot.

Every displayed KPI must define:

- Name
- Business meaning
- Unit
- Scope (fleet, mission, station, AOI, spacecraft, etc.)
- Time window
- Data source
- Calculation/formula where applicable
- Freshness timestamp
- Operational status (LIVE / SIMULATED / CONNECTOR_REQUIRED)

Metrics whose meaning or formula cannot be explained must be removed or renamed.

Examples of unacceptable metrics without definitions:

- Twin Integrity 96.8%
- Network Readiness 96.8%
- Health Score 92%

Examples of acceptable metrics:

- Scheduled Contacts — next 24 h
- Unacknowledged Critical Alerts — current
- Contact Success Rate — trailing 30 days
- Ephemeris Age — current solution
- AOI Clear-Sky Probability — next 6 h, named weather source

## 7. Interaction standard

Every visible interactive control must have a real and inspectable effect.

Prohibited behavior:

- Generic toast as the only result of a button that implies an operational action.
- Toggle changes color but does not change data/view/state.
- Save/Commit/Reserve/Command buttons that do not create a persistent state change.
- Different controls writing contradictory state.

For every control, acceptance must document:

- Input
- Validation
- State change
- Visible result
- Persistence
- Error behavior
- Audit behavior where relevant

## 8. CONTROL safety standard

Commanding is safety-sensitive and must be designed conservatively.

Required product concepts:

- Command definition and parameters
- Preconditions / transmission constraints
- Role/authority check
- Confirmation for high-risk commands
- Queue / release state
- Sent / received / accepted / completed / failed verification states
- Command history with operator, timestamp and arguments
- Telemetry limits and alarm lifecycle
- Procedure execution with step state and logs
- Replay/history separated from live commanding

No demo control may imply that a real spacecraft command was transmitted.

## 9. GROUND standard

GROUND must support the operational lifecycle rather than just display antennas on a globe.

Core concepts:

- Spacecraft onboarding/compatibility
- Ephemeris validity
- Ground resource capabilities
- Visibility/access windows
- Mission/contact profile
- Reservation/scheduling
- Conflicts and alternatives
- Pre-pass / pass / post-pass lifecycle
- Tracking mode
- Uplink/downlink dataflow
- Live contact metrics
- Contact result and failure reason
- Historical performance

## 10. PLAN standard

PLAN must convert mission intent into an executable, explainable plan.

Core concepts:

- Objective
- AOI/target
- priority
- time constraints
- payload/sensor constraints
- spacecraft eligibility
- access/opportunity windows
- ground/network availability
- weather/environment constraints where relevant
- resource constraints
- cost/priority optimization
- conflict detection
- ranked alternatives
- plan validation
- commit/version/history
- automatic re-planning triggers

## 11. DATA standard

DATA represents payload and mission-data operations, not a generic 'Earth' page.

Core concepts:

- Payload acquisition/task linkage
- Raw/processed data inventory
- EO/SAR/AIS/weather or other mission sources as data types
- Processing pipeline
- QC
- product generation
- metadata/provenance
- delivery
- job state
- retries/failures
- latency and SLA

## 12. FLIGHT standard

FLIGHT is focused on flight dynamics and navigation, not miscellaneous engineering gauges.

Core concepts:

- Orbit state and reference frame
- Ephemeris
- propagation model
- orbit determination
- measurement ingest
- solution age
- covariance/uncertainty
- maneuvers
- delta-v
- conjunctions where applicable
- access calculations used by PLAN/GROUND
- export/version of engineering products

RF link margin belongs primarily to contact/communications analysis and must not be used as a generic FLIGHT KPI without context.

## 13. OPS standard

OPS is the operator's common operating picture.

It must answer quickly:

- What is operating now?
- What is happening next?
- What is late, failed, degraded or at risk?
- What requires human action?
- What changed since the last shift/check?

OPS must aggregate state from CONTROL, PLAN, GROUND, DATA and FLIGHT rather than invent separate data.

## 14. Data-state honesty

Every data surface must make its status explicit:

- LIVE — connected to a real source and freshness known
- SIMULATED — generated test data
- REPLAY — historical data being replayed
- CONNECTOR_REQUIRED — UI/capability exists but source is not connected
- STALE — source exists but freshness threshold exceeded
- UNKNOWN — state cannot be established

The word LIVE may not be used for simulated timers or locally animated objects.

## 15. Product-quality acceptance gates

A module is not accepted until all of the following pass:

### P0 — correctness / safety
- No false claim of live capability.
- No contradictory object identities or states.
- No destructive or command-like action without explicit state and audit semantics.
- No broken navigation or data loss caused by routine use.

### P1 — functional completeness
- Every intended control works.
- Every metric is defined.
- Every visual layer has operational meaning.
- Empty/demo states are explicit.
- Filters, selects, tabs and timelines affect real module state.

### P2 — usability / visual quality
- Information hierarchy matches operator task priority.
- No unexplained decorative graphics.
- Labels are readable without hover where identification is necessary.
- Color semantics are consistent across modules.
- Density is appropriate; optional layers are not all enabled by default.

### P3 — engineering readiness
- State model documented.
- Interfaces typed/versioned.
- Error states defined.
- Persistence defined.
- Test coverage exists for critical workflows.
- External dependencies are pinned and reviewed.

## 16. Required audit method before further redesign

Every module must be audited item-by-item using a matrix with these columns:

- Module
- UI region
- Element / metric / control
- Current behavior
- Intended operational purpose
- Benchmark evidence
- Keep / Modify / Move / Remove / Add
- Required data source
- Acceptance criteria
- Implementation status
- Verification status

No screen is considered reviewed by only looking at source code. Final visual acceptance requires actual rendered-browser inspection on the target browser/device or user-provided screenshots when the environment cannot render it.

## 17. Development rule

During architecture audit, production-like code changes are paused except for critical rollback/fix work.

When implementation resumes:

- Work only on the development branch.
- Make small reviewable changes.
- Verify diffs after each change.
- Do not claim browser/visual verification unless it actually occurred.
- Do not claim a capability is complete when only the UI exists.
- If a requirement cannot be implemented with the available environment, dependencies or real integrations, state that limitation explicitly.
