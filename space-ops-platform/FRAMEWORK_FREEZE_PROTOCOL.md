# Space Ops Platform — Framework Freeze Protocol

Status: ACTIVE POLICY
Framework V2 status: DRAFT / NOT YET LOCKED
Target branch: space-ops-dev

## 1. Core rule

Framework first. Features second.

No feature implementation is allowed to redefine the framework while development is in progress. The framework must be completed, reviewed, and explicitly frozen before deeper functional implementation begins.

The implementation sequence is:

FRAMEWORK BUILD -> FRAMEWORK REVIEW -> FRAMEWORK FREEZE -> LAYER 1 -> LAYER 1 ACCEPTANCE -> FREEZE -> LAYER 2 -> LAYER 2 ACCEPTANCE -> FREEZE -> ...

No later layer may be started while the current layer still has unresolved P0/P1 issues.

## 2. Framework V2 scope

The framework is not considered complete until all items below are defined and internally consistent.

### 2.1 First-level product modules

Exactly six first-level modules:

1. OPS — common operating picture, mission status, event/exception management
2. CONTROL — command, telemetry, procedures, alarms, command history
3. PLAN — objective/tasking, constraints, opportunities, scheduling, optimization
4. GROUND — station/network resources, passes, contacts, reservation, dataflow
5. DATA — payload data, EO/search/tasking, processing, QC, product, delivery
6. FLIGHT — orbit determination, propagation, ephemeris, maneuver, conjunction/navigation analysis

Digital Twin is not a first-level module. It is a shared system data model.
3D Earth is not a first-level module. It is a shared spatial visualization engine.

### 2.2 Shared platform foundation

The framework must define one shared source of truth for:

- spacecraft / payload / ground station / AOI / mission / contact / product identities
- mission and contact lifecycle states
- global time and replay model
- event / alert model
- permissions, roles, command authority, and audit trail
- API and connector boundaries
- historical data and provenance
- spatial visualization boundary
- flight-dynamics computation boundary
- telemetry / command backend boundary
- ground-network integration boundary
- payload/data-processing integration boundary

### 2.3 Canonical identity rule

Every real or simulated object has exactly one canonical ID and one canonical record.

The same spacecraft may appear in OPS, CONTROL, PLAN, GROUND, DATA and FLIGHT, but it must never become a different object or silently change name between modules.

### 2.4 KPI rule

A KPI may enter the framework only when all four are defined:

1. business meaning
2. scope / population
3. time window
4. source or calculation method

Decorative or unexplained metrics are prohibited.

### 2.5 Visual semantics rule

Every line, ring, cone, color, marker, animation and label must have an explicit semantic definition.

If an operator cannot determine what it means without guessing, it fails framework acceptance.

### 2.6 Open-source-first rule

Before custom implementation, evaluate in this order:

1. mature open-source project
2. established technical standard
3. mature commercial/API service
4. custom implementation only for genuine product differentiation or integration logic

The chosen dependency must record license, maintenance status, integration mode, security considerations and replacement strategy.

## 3. Framework acceptance gates

Framework V2 may be marked LOCKED only when all gates pass:

- six module responsibilities have no unresolved overlap
- all cross-module data flows are documented
- canonical entities and IDs are defined
- lifecycle/state models are defined
- shared services have clear ownership
- external/open-source component boundaries are defined
- no visual component exists without semantic meaning
- no KPI exists without definition and source
- no module depends on a fake duplicate data store
- no hidden second source of truth exists
- no critical function is represented only by decorative UI
- security, authorization and audit boundaries are present in the architecture
- acceptance tests for the framework itself exist

## 4. Freeze behavior

When framework acceptance passes:

- change status in this document to LOCKED
- record the exact framework commit SHA
- record the acceptance date
- framework structure becomes immutable during normal feature work

After lock, the following are prohibited without an explicit architecture change request:

- adding/removing a first-level module
- changing module ownership of a domain
- introducing a second canonical object model
- creating a second independent time/event/identity system
- replacing a shared engine ad hoc inside one module
- changing data contracts merely to simplify one page

A framework change after lock requires:

1. written reason
2. affected modules
3. migration impact
4. compatibility impact
5. regression plan
6. explicit approval before implementation

## 5. Layered implementation after framework lock

### Layer 1 — Shared Core
Canonical entities, IDs, state machines, event model, time/replay, provenance, permissions/audit.

### Layer 2 — Shared Engines and Adapters
Cesium/spatial engine, SGP4/Orekit flight engine boundary, telemetry/control adapter boundary, ground-network adapters, storage/event infrastructure.

### Layer 3 — Domain Services
CONTROL, PLAN, GROUND, DATA, FLIGHT domain services with stable APIs and no UI dependency.

### Layer 4 — OPS Orchestration
Cross-domain mission status, event aggregation, exceptions, operational overview and workflow orchestration.

### Layer 5 — User Interface and Interaction
Screens, controls, tables, timelines, inspectors and 3D layers are connected to real domain contracts. No fake action may be presented as implemented.

### Layer 6 — Live Connectors
Real telemetry, command, ephemeris, ground-station, weather/AIS/EO and processing connectors. Until connected, the UI must explicitly identify SIMULATED / DEMO / CONNECTOR_REQUIRED states.

### Layer 7 — Verification and Hardening
Functional acceptance, browser/render validation, performance, security, permission testing, failure/recovery behavior, data integrity and regression testing.

Each layer is accepted and frozen before the next layer begins.

## 6. Definition of done

A layer is not done because code exists.

It is done only when:

- intended behavior is implemented
- source of data is known
- failure behavior is defined
- acceptance criteria pass
- no P0/P1 defect remains
- the previous frozen layers remain unchanged except through approved change control

If a requirement cannot be implemented or verified, it must be stated explicitly. It must never be represented as complete through animation, placeholder data, or decorative UI.
