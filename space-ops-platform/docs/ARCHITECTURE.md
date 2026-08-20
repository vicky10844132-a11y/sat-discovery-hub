# Architecture v0.1

## Objective

Build one unified operational platform rather than a bundle of independent orbit, AIS, weather and visualization tools.

The platform uses a shared digital twin and a common mission lifecycle so every service can exchange the same object identifiers, time model and state transitions.

## Reference capability families

The product direction synthesizes capability patterns found in mature mission-analysis, mission-planning, mission-control, ground-network and EO-tasking systems. The implementation remains independent and modular.

## Core layers

### 1. Digital Space Twin
Canonical entities:

- Satellite
- Constellation
- Payload
- OrbitState
- GroundStation
- Antenna
- ContactWindow
- AOI
- Mission
- AcquisitionOpportunity
- DownlinkPlan
- DataProduct
- Vessel
- WeatherCell

Every object has a stable ID and UTC timestamps.

### 2. Space Dynamics

V1 interfaces:

- TLE ingestion
- SGP4 propagation
- ECI/ECEF/geodetic transformations
- sub-satellite point
- access / visibility computation
- ground-station pass prediction
- sensor footprint / AOI intersection

Later precision tiers:

- numerical propagation
- force models
- GNSS / SP3 / RINEX
- precise orbit determination

### 3. Mission Intelligence

Input: user objective + constraints.

Pipeline:

1. Resolve target / AOI.
2. Enumerate satellite opportunities.
3. Apply payload and geometry constraints.
4. Apply optical weather constraints where relevant.
5. Apply spacecraft resource constraints.
6. Select ground contacts.
7. Resolve conflicts.
8. Estimate processing and delivery time.
9. Rank feasible plans.

### 4. Ground Network

Ground assets are modeled as a resource pool, not hard-coded stations.

Capabilities:

- antenna inventory
- RF-band capability
- contact windows
- booking status
- mission priority
- conflict detection
- downlink chain
- partner / GSaaS adapters

### 5. Earth Intelligence

Adapters for:

- EO archive search
- EO tasking
- AIS / maritime tracks
- weather
- derived products

The goal is cross-domain reasoning, e.g. vessel -> predicted position -> SAR opportunity -> ground contact -> processed alert.

### 6. Operations & Control

Operational UI:

- global digital twin
- satellite and ground status
- active missions
- contacts
- timeline
- alerts
- mission copilot

## API boundaries

```text
Web Console
    |
API Gateway
    +-- Orbit Service
    +-- Mission Service
    +-- Ground Network Service
    +-- EO Service
    +-- Maritime Service
    +-- Weather Service
    +-- Copilot Orchestrator
```

## V1 acceptance target

A user can define an AOI and mission constraints and receive a ranked plan containing:

- candidate satellite
- acquisition window
- geometry / weather feasibility
- recommended ground contact
- downlink window
- estimated product-ready time

The full chain must be visible in the Operations Center timeline.
