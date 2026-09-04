# Space Intelligence & Autonomous Mission Operations Platform

Space Ops is the operational platform inside `sat-discovery-hub`. It is separate from, but designed to integrate with, the existing Data Search / AOI system.

## Product rule

Optimization means **simpler operation with stronger capability**. Validated capability is not removed for visual simplicity. The platform has exactly six canonical first-level modules:

1. **OPS — Global Operations**
2. **TWIN — Space Resource & Digital Twin**
3. **PLAN — Mission Planning & Scheduling**
4. **GS — Ground & Mission Operations**
5. **EARTH — Earth Intelligence**
6. **ENG — Engineering & Dynamics**

The detailed non-regression contract is in `docs/PRODUCT_BASELINE.md`.

## Core autonomous loop

`Objective / AOI → resource candidate → acquisition opportunity → payload/resource constraints → weather/intelligence constraints → ground-contact feasibility → conflict resolution → executable mission plan → downlink → processing/QC → delivery`

Mission Copilot is the unified command interface to this loop, not a decorative chat box.

## Current runnable implementation

- Canonical production console: `apps/web/production.html`
- FastAPI gateway: `apps/api/main.py`
- Vercel API entrypoint: `../api/index.py`
- Stable deployed route configured as `/space-ops`
- API-backed satellite and ground-asset inventory
- Mission candidate planning
- Pass prediction and conflict-aware contact scheduling
- Weather, EO catalog and maritime/AIS adapter interfaces
- Orbit propagation endpoint with legacy TLE compatibility
- Link-budget endpoint
- Explicit service/provider modes so simulated data is not presented as live provider data
- Regression tests for API behavior, canonical UI structure and deployment routing

## Engineering architecture

```text
space-ops-platform/
├── apps/
│   ├── web/
│   │   ├── production.html       # canonical API-wired operations console
│   │   ├── console.html          # development/architecture console
│   │   └── ...
│   └── api/
│       ├── main.py               # FastAPI service gateway
│       └── requirements.txt
├── services/
│   ├── orbit/                    # orbit propagation and visibility
│   ├── mission/                  # planning and scheduling
│   ├── ground-network/           # ground resources and contacts
│   ├── eo/                       # EO/STAC adapters and cloud-native reads
│   ├── maritime/                 # AIS / maritime adapters
│   └── weather/                  # weather adapters
├── packages/
│   └── digital-twin/             # shared operational object model
├── docs/
│   ├── PRODUCT_BASELINE.md
│   ├── ARCHITECTURE.md
│   └── OPEN_SOURCE_CAPABILITY_INTEGRATION.md
└── tests/
    ├── test_api.py
    ├── test_ui_contract.py
    └── test_production_console.py
```

## Target production stack

The current console converges toward React + TypeScript on the client, FastAPI services, PostgreSQL/PostGIS for canonical operational data, Redis/WebSocket for real-time state distribution, and containerized domain services.

### 3D globe strategy

- **Primary production renderer:** Cesium-compatible globe pipeline.
- **Secondary adapter / technology watch:** Navara-style Rust/WASM globe engine architecture.
- Business objects, mission state and geospatial services must remain renderer-independent so the globe engine can be replaced without rewriting the operational core.

### Cloud-native geospatial strategy

Space Ops and Data Search share one geospatial data plane:

- STAC for catalog discovery and asset metadata.
- COG / HTTP Range reads for raster windowing without downloading full scenes.
- GeoParquet / GeoJSON for vector and analytical interchange.
- PMTiles / MBTiles / MVT for portable or streamed basemap/vector delivery.
- 3D Tiles / GLB / GLTF for 3D assets.
- Local export remains available when users need QGIS/GDAL/Cesium-ready files.

### Orbit data strategy

The internal orbit model is format-neutral. **OMM / GP JSON/XML/KVN/CSV are preferred interchange formats for modern catalog numbers.** Traditional TLE remains a compatibility format only, including Alpha-5 where a legacy consumer requires it.

The canonical orbit object stores normalized identifiers, epoch, mean elements, source, retrieval time and provenance independently of the source serialization. SGP4 consumes the normalized state rather than making TLE text the system-of-record.

### AI / GIS control strategy

Mission Copilot may call explicit GIS and operations tools through a controlled tool layer inspired by modern GIS MCP patterns. AI is never the source of operational truth: geometry checks, orbit calculations, mission constraints, resource availability and QC remain deterministic services.

### External acquisition / connector tooling

Crawl4AI, Playwright/Crawlee and protocol-analysis methods are treated as **connector-development tools only** for public or authorized systems. They are not part of the production trust boundary and must not be used to bypass access controls, licensing or provider authorization.

Advanced dynamics retains architecture hooks for numerical propagation, GNC/ADCS, GNSS/SP3/RINEX and POD rather than replacing those capabilities with a weaker demo.
