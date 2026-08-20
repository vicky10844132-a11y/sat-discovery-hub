# Space Ops Platform — Product Baseline

## Product principle

The platform must become simpler to operate while becoming more capable. Optimization never means deleting validated capability. Complexity belongs inside orchestration, data models, engines, and Help/Documentation—not in repeated menus or explanatory microcopy on operational screens.

## Six canonical first-level modules

1. **Global Operations (OPS)** — unified situation, active missions, mission state, alerts, mission command/Copilot.
2. **Space Resource & Digital Twin (TWIN)** — satellites, constellations, payloads, ground stations, antennas, AOIs, unified state model.
3. **Mission Planning & Scheduling (PLAN)** — objective/AOI resolution, acquisition opportunities, constraints, ranking, autonomous scheduling, executable plans.
4. **Ground & Mission Operations (GS)** — access/pass/contact prediction, contact booking, conflict-aware ground-network scheduling, own/partner/GSaaS resource pool.
5. **Earth Intelligence (EARTH)** — EO archive search, tasking, weather, AIS/maritime, processing, QC, delivery, downstream products/GeoAI adapters.
6. **Engineering & Dynamics (ENG)** — orbit dynamics, TLE/SGP4, numerical propagation hooks, coordinate transforms, GNC/ADCS/EKF, GNSS/SP3/RINEX/POD, occultation and link engineering.

No additional first-level module may be added unless explicitly approved. New capability must be assigned to the single most appropriate existing module.

## Core autonomous loop

**Objective / AOI → candidate space resources → acquisition opportunity → payload/geometry/resource constraints → weather/intelligence constraints → ground-contact feasibility → conflict resolution → mission plan → execution state → downlink → processing/QC → delivery.**

Mission Copilot is not a decorative chat box. It is the command interface to this loop.

## Capability depth

### Flight Dynamics Engine
- Fast: TLE/SGP4.
- Business: numerical propagation architecture with J2/J3/J4, drag, SRP, Sun/Moon perturbations and configurable force models.
- Precision: GNSS, SP3, RINEX and POD workflow.

### Mission Intelligence Engine
Must coordinate satellite, payload, AOI, weather, spacecraft resource, contact, processing and delivery constraints and return ranked **executable** plans rather than independent tool outputs.

### Ground Network OS
Unifies own stations, partners, GSaaS and virtual ground assets with availability, antenna/band capability, priority, utilization, conflict checking and contact reservation.

### Earth Intelligence
EO, AIS, Weather and processing are one Space-to-Earth intelligence chain. They retain specialist workspaces but participate automatically in mission orchestration.

## UI rules

- One canonical first-level navigation only.
- No duplicate functional entry points.
- Operational screens show controls, status, results and exceptions—not paragraphs of explanation.
- Documentation, field definitions, algorithm notes, provider/data modes and limitations live in **Help / Documentation**.
- Operations may show summaries of downstream modules, but not duplicate their full tools.
- Expert workspaces preserve advanced capability; routine users should be able to run a mission from one command.

## Data-mode honesty

Every connector/service is explicitly one of:
- `LIVE`
- `SIMULATED`
- `CONNECTOR_REQUIRED`

The UI must never label simulated values as live provider data.

## Non-regression rules

A new version may add, strengthen, reorganize presentation, or improve usability. It must not silently:
- remove an approved capability;
- change an approved first-level structure;
- duplicate a function in another module;
- rename a locked concept;
- replace an engine/workflow with a weaker demo;
- change a previously approved decision merely for visual simplicity.

If a structural change is recommended, it must be proposed separately with rationale and impact before implementation.

## Implementation architecture

Target architecture remains compatible with:
- React + TypeScript + Cesium for the production web client;
- FastAPI service/API layer;
- PostgreSQL + PostGIS canonical operational data;
- Redis/WebSocket real-time state/event distribution;
- containerized services;
- service domains for orbit, mission, ground network, weather, maritime, EO, Copilot and digital twin.

The current static console is an operational front-end shell and must converge toward this architecture rather than becoming an independent second product.
