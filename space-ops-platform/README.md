# Space Intelligence & Autonomous Mission Operations Platform

This project is a new, isolated platform inside the existing `sat-discovery-hub` repository. It does not replace the current Data Search / AOI system.

## Product direction

The platform combines the strongest patterns from modern mission analysis, mission planning, mission control, ground-station operations, Earth-observation tasking, maritime intelligence, weather intelligence and AI-assisted operations.

Core closed loop:

`AOI / Target -> Opportunity Search -> Mission Planning -> Ground Contact -> Downlink -> Processing -> Product / Alert`

## V1 scope

- Global Operations dashboard
- Satellite catalog and orbit state model
- AOI mission requests
- Ground station inventory and pass scheduling model
- Mission timeline
- EO, AIS and weather integration interfaces
- AI Mission Copilot interface contract
- FastAPI backend skeleton
- Web operations console prototype

## Architecture

```text
space-ops-platform/
├── apps/
│   ├── web/                 # Operations console
│   └── api/                 # FastAPI gateway
├── services/
│   ├── orbit/               # Orbit propagation and visibility
│   ├── mission/             # Planning and scheduling
│   ├── ground-network/      # Ground station resources and contacts
│   ├── eo/                  # EO catalog and tasking adapters
│   ├── maritime/            # AIS / maritime adapters
│   └── weather/             # Weather adapters
├── packages/
│   └── digital-twin/        # Shared object model
└── docs/
    └── ARCHITECTURE.md
```

## Development principle

This is not a collection of disconnected tools. Every module is built around a shared digital-space-twin model and a unified mission lifecycle.
