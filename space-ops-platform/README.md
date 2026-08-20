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
- TLE/SGP4 orbit propagation endpoint
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
│   ├── eo/                       # EO adapters
│   ├── maritime/                 # AIS / maritime adapters
│   └── weather/                  # weather adapters
├── packages/
│   └── digital-twin/             # shared operational object model
├── docs/
│   ├── PRODUCT_BASELINE.md
│   └── ARCHITECTURE.md
└── tests/
    ├── test_api.py
    ├── test_ui_contract.py
    └── test_production_console.py
```

## Target production stack

The current console converges toward React + TypeScript + Cesium on the client, FastAPI services, PostgreSQL/PostGIS for canonical operational data, Redis/WebSocket for real-time state distribution, and containerized domain services. Advanced dynamics retains architecture hooks for numerical propagation, GNC/ADCS, GNSS/SP3/RINEX and POD rather than replacing those capabilities with a weaker demo.
