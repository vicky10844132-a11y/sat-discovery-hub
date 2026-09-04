# Architecture v0.2

## Objective

Build one unified operational platform rather than a bundle of independent orbit, AIS, weather, visualization and data-search tools.

The platform uses a shared digital twin, a common mission lifecycle and a renderer-independent geospatial data plane so every service can exchange the same object identifiers, time model, provenance and state transitions.

## Reference capability families

The product direction synthesizes capability patterns found in mature mission-analysis, mission-planning, mission-control, ground-network, EO-tasking and cloud-native GIS systems. The implementation remains independent and modular.

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
- CatalogAsset
- ProcessingJob

Every object has a stable ID, UTC timestamps, source/provenance metadata and an explicit live/simulated/reconstructed status.

### 2. Space Dynamics

V1 interfaces:

- OMM / GP JSON, XML, KVN and CSV ingestion
- Legacy TLE / Alpha-5 compatibility ingestion
- normalized internal orbit object model
- SGP4 propagation
- ECI/ECEF/geodetic transformations
- sub-satellite point
- access / visibility computation
- ground-station pass prediction
- sensor footprint / AOI intersection

Traditional TLE is not the system-of-record. It is a compatibility serialization. Modern six-digit and larger catalog identifiers must remain first-class values internally.

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
- network/transport health signals

Network diagnostics tooling may be used operationally, but diagnostics are separate from mission truth and scheduling logic.

### 5. Earth Intelligence & Cloud-Native GIS

Adapters for:

- EO archive search
- EO tasking
- STAC catalogs
- COG window/range reads
- GeoParquet / GeoJSON analytical layers
- PMTiles / MBTiles / MVT delivery
- 3D Tiles / GLB / GLTF content
- AIS / maritime tracks
- weather
- derived products
- optional contextual layers such as global land-use products

The goal is cross-domain reasoning, e.g. vessel -> predicted position -> SAR opportunity -> ground contact -> processed alert.

The data plane prioritizes **query and process in place**. Full scene download is required only when the workflow or delivery contract actually needs it.

### 6. Operations & Control

Operational UI:

- global digital twin
- satellite and ground status
- active missions
- contacts
- timeline
- alerts
- mission copilot

#### Renderer abstraction

The operational data model must not depend on one globe engine.

```text
Operational Objects
      |
Globe Adapter Interface
      +-- Cesium adapter (primary)
      +-- Navara/Rust-WASM style adapter (technology reserve)
      +-- future renderer adapters
```

### 7. Controlled GIS / AI Tool Layer

Mission Copilot operates through explicit, auditable tools rather than directly mutating data.

Tool families:

- AOI create/import/validate
- CRS and geometry operations
- raster window/read/statistics
- vector overlay/intersection/buffer
- STAC search
- orbit/pass query
- ground-resource query
- mission draft/validate
- report/export

The interface may expose MCP-compatible tool contracts, but deterministic GIS/orbit/mission services remain authoritative.

### 8. Connector Development Layer

For provider or public-web integration, the engineering toolkit may include:

- Crawl4AI / Firecrawl-like structured extraction
- Playwright / Crawlee browser automation
- Scrapy for large structured crawls
- protocol-analysis workflows for authorized systems

These tools are restricted to public or authorized access. Production connectors must use stable provider APIs, approved credentials or documented legal access paths whenever available.

## API boundaries

```text
Web Console
    |
API Gateway
    +-- Orbit Service
    +-- Mission Service
    +-- Ground Network Service
    +-- EO / STAC Service
    +-- Geospatial Processing Service
    +-- Maritime Service
    +-- Weather Service
    +-- Copilot Tool Orchestrator
```

## V1 acceptance target

A user can define an AOI and mission constraints and receive a ranked plan containing:

- candidate satellite
- acquisition window
- geometry / weather feasibility
- recommended ground contact
- downlink window
- estimated product-ready time

The same AOI can be handed to the EO/STAC layer to discover and preview cloud-native imagery assets without requiring full-scene download.

The full chain must be visible in the Operations Center timeline.
