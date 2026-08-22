# Space Ops Platform — Open-Source Capability Map

Status: Architecture decision baseline
Branch: space-ops-dev
Purpose: Prevent unnecessary custom development and define the preferred integration path for each major capability.

## Non-negotiable rule

For every capability, evaluate in this order:

1. Mature open-source project already solves it.
2. Mature commercial/open-core product exposes a clean API/service boundary.
3. Existing standards/library can be composed into our product.
4. Only then build custom code.

Custom code is reserved for:
- Space Ops canonical domain model
- Cross-module orchestration and workflow
- Product-specific UX
- Permissions / tenancy / audit policy
- Business rules and mission logic unique to this platform
- Integration adapters between mature engines

A visual imitation of an existing mature capability is not considered implementation.

## Capability decisions

| Capability | Preferred OSS / existing technology | License / constraint | Decision | What we build ourselves |
|---|---|---|---|---|
| Global 3D globe / WGS84 scene | CesiumJS | Apache-2.0 | ADOPT as primary spatial engine | Space Ops layer model, styling, interaction, module presets |
| Lightweight 3D prototype | Globe.GL / three-globe | MIT | REFERENCE / prototype only | No new custom globe engine |
| TLE / OMM propagation | satellite.js | MIT | ADOPT for browser-side SGP4/SDP4 | Ephemeris service wrapper, data validation |
| Precision orbit dynamics | Orekit | Apache-2.0 | ADOPT for FLIGHT backend | Service APIs, scenario management, workflow |
| Mission analysis / independent validation | NASA GMAT | NASA/open distribution; review exact redistribution terms before bundling | USE AS ANALYSIS / VALIDATION TOOL, not default web runtime | Adapters / export-import where useful |
| Command & Telemetry framework | Yamcs | AGPL-3.0 | EVALUATE AS SEPARATE SERVICE / API; do not copy into proprietary core without legal review | Space Ops CONTROL UX, adapters, authorization model |
| Command / telemetry alternative | OpenC3 COSMOS | COSMOS Builder's License; managed/hosted-service restrictions | EVALUATE carefully; not a default dependency | Same as above if selected |
| Time-series telemetry storage | Existing TSDB (TimescaleDB / QuestDB / InfluxDB-class technology) | Project-specific | ADOPT after benchmark | Telemetry schema and retention policy |
| Telemetry dashboards | Grafana-class OSS | License/version review required | INTEGRATE where operator dashboard use is appropriate | Mission-specific dashboards and embedded context |
| Geospatial operations | GDAL / PROJ / Turf.js | Permissive/open-source families; verify exact component versions | ADOPT | Domain services and API contracts |
| STAC catalogue / EO metadata | STAC ecosystem | Open specification | ADOPT STANDARD | Product-specific search and mission linkage |
| EO raster tiling / cloud optimized delivery | COG / WMTS / TMS / TiTiler-class services | Standards / OSS mix | ADOPT STANDARD / OSS | Product orchestration, access control |
| AIS / weather feeds | External standards/providers | Data license dependent | CONNECT, do not simulate as LIVE | Provider adapters, normalization |
| Workflow orchestration | Mature workflow engine to be selected after requirements (Temporal-class candidate) | License/version review | EVALUATE | Space Ops mission workflow definitions |
| Event / alert rules | Reuse telemetry/event engine where possible | Depends on CONTROL backend | INTEGRATE | Cross-domain event correlation |
| Identity / SSO | OIDC/SAML + mature IdP | Standards / deployment choice | ADOPT STANDARD | RBAC/ABAC policies specific to Space Ops |
| Audit logging | Existing append-only / security logging stack | Deployment choice | ADOPT infrastructure | Domain audit semantics |

## Module architecture after open-source review

### 01 OPS
Role: Common Operating Picture, mission status, operational events, exceptions.

Reuse:
- CesiumJS for spatial context
- Existing event/telemetry sources
- Existing time-series/query infrastructure

Custom:
- Cross-domain operational summary
- Mission status aggregation
- Operator action queue
- Event correlation and acknowledgement workflow

Do NOT custom-build:
- Globe renderer
- Generic telemetry charts
- Generic map projection engine

### 02 CONTROL
Role: Telemetry, telecommand, procedures, limits, alarms, command history.

Reuse candidates:
- Yamcs as separate mission-control service if legal/architecture review passes
- OpenC3 only if its current Builder's License fits the intended commercial deployment

Custom:
- Space Ops CONTROL experience
- Authorization and command approval workflow
- Unified object identity mapping
- Integration adapters

Do NOT fake:
- LIVE telemetry
- Command execution
- Command verification
- Procedure execution

Without a real connector these must be labelled SIMULATED / CONNECTOR_REQUIRED.

### 03 PLAN
Role: Objectives, access opportunities, tasking, scheduling, constraints, optimization.

Reuse:
- Orekit / satellite.js for access and orbit geometry
- Mature optimization libraries where appropriate
- CesiumJS only as spatial support

Custom:
- Mission objective model
- Resource constraints
- Ranking policy
- Scheduling workflow
- Commercial/business rules

The 3D globe is supporting context, not the main planning interface.

### 04 GROUND
Role: Ground network, antenna availability, contact scheduling, execution and results.

Reuse:
- Orekit/satellite.js access calculations
- Standard contact scheduling concepts
- Existing RF/link-budget libraries if verified

Custom:
- Multi-provider resource normalization
- Reservation workflow
- Contact lifecycle
- Provider SLA / pricing / ownership business rules

Do NOT draw decorative coverage cones as substitutes for real access geometry.

### 05 DATA
Role: Payload data, EO catalogue, processing, QC, products, delivery.

Reuse:
- STAC
- GDAL / PROJ
- COG / WMTS / TMS
- Mature EO processing services/libraries

Custom:
- Product recipes
- Mission-to-product lineage
- Delivery policies
- Customer / license / entitlement workflow

### 06 FLIGHT
Role: Orbit determination, propagation, covariance, maneuvers, conjunction and flight dynamics.

Reuse:
- Orekit as preferred core library
- GMAT as analysis/validation tool where useful
- satellite.js for fast browser visualization only

Custom:
- Scenario management
- Review/approval workflow
- Integration with CONTROL / PLAN / GROUND
- Operator-facing presentation

Do NOT custom-write orbital dynamics algorithms unless a specific validated gap is identified.

## Shared platform foundations

These are not first-level modules:

- Canonical Asset / Digital Twin model
- Persistent spatial engine
- Shared timeline / time system
- Event bus
- Identity and authorization
- Audit trail
- Data provenance
- Connector framework
- Simulation / live-state discriminator

## Mandatory product truth rules

1. A button that only changes appearance is not a completed function.
2. A number is not a KPI unless its scope, time window, source and formula are defined.
3. LIVE may only be shown when a real live source exists.
4. SIMULATED, DEMO and CONNECTOR_REQUIRED must be explicit states.
5. One physical/logical object must have one canonical identity across OPS, CONTROL, PLAN, GROUND, DATA and FLIGHT.
6. Any visual line, ring, cone, vector or color must have documented operational meaning and a visible legend or contextual explanation.
7. Open-source components must be version-pinned and license-reviewed before production use.
8. No new custom implementation is approved until an open-source / standard / service search has been recorded.

## Immediate technical direction

1. Stop extending the current custom Globe.GL implementation as the long-term spatial core.
2. Prototype CesiumJS in isolation first; do not disturb the locked six-module UI during evaluation.
3. Benchmark CesiumJS + satellite.js with the expected satellite/object count and interaction load.
4. Design a canonical object model before reconnecting all six modules.
5. Evaluate Orekit service architecture for PLAN / GROUND / FLIGHT calculations.
6. Evaluate Yamcs separately for CONTROL integration, including AGPL implications.
7. Keep OpenC3 as an alternative only after Builder's License review.
8. Build a module-by-module audit matrix before UI restructuring.

## Acceptance gate before implementation

For every planned feature, the architecture record must answer:

- What operational problem does it solve?
- Which mature platform or standard already solves part of it?
- Which OSS component is selected and why?
- What is its license?
- What data source is required?
- What is LIVE vs SIMULATED?
- What part must Space Ops uniquely implement?
- How will the function be objectively tested?

If these questions cannot be answered, the feature is not approved for implementation.
