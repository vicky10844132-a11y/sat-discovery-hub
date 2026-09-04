# Open-Source Capability Integration Blueprint

## Purpose

This document records which external open-source capability patterns are useful to the current SAT-DISCOVERY / Space Ops / GS LinkOps AI system family and where they belong. It is an integration plan, not a dependency mandate.

## Adopt now

### 1. STAC + COG cloud-native EO flow

Target systems:
- SAT-DISCOVERY / Data Search
- Space Ops EARTH module

Use for:
- catalog search
- AOI-based asset selection
- preview generation
- range/window reads
- derived analytics without downloading entire scenes

Priority: P0

### 2. Modern orbit interchange

Target systems:
- Space Ops TWIN / PLAN / ENG
- GS LinkOps AI Orbit/Pass services

Rules:
- normalize OMM / GP JSON/XML/KVN/CSV into one internal orbit object
- retain TLE/Alpha-5 only for compatibility
- support six-digit and larger catalog identifiers internally
- store source, epoch, retrieval time and provenance

Priority: P0

### 3. Controlled GIS tool layer / MCP-compatible contracts

Target systems:
- SAT-DISCOVERY Production Intelligence
- Space Ops Mission Copilot

First tools:
- AOI import/create/validate
- buffer/intersection/overlay
- metadata/CRS inspection
- STAC search
- raster window/statistics
- pass query
- ground-resource query
- export/report

Priority: P1

### 4. Renderer abstraction

Target system:
- Space Ops OPS/TWIN visualization

Rules:
- Cesium-compatible rendering remains primary
- operational objects and mission logic are renderer-independent
- maintain an adapter boundary so Rust/WASM globe engines such as Navara can be evaluated later without rewriting business logic

Priority: P1

## Adopt selectively

### 5. Structured web acquisition

Reference capability patterns:
- Crawl4AI / Firecrawl
- Playwright / Crawlee
- Scrapy
- authorized protocol-analysis workflows

Target:
- Data Connector engineering toolchain

Use only for public or authorized provider systems. Prefer stable APIs and provider credentials for production.

Priority: P1/P2 depending on connector demand

### 6. Download / offline packaging engine

Reference capability pattern:
- GeoD-style downloader

Target:
- SAT-DISCOVERY Output Center

Useful functions:
- tile/raster/vector packaging
- resumable downloads
- AOI-driven export
- GeoTIFF / PNG / JPEG / PBF / MBTiles / 3D Tiles packaging where source licensing permits

Priority: P2

### 7. Contextual global layers

Reference capability:
- ORNL MapSpace-style land-use datasets and other public context layers

Target:
- SAT-DISCOVERY analytical overlays
- Space Ops EARTH context

Requirement:
- source/license/timestamp/confidence must remain visible
- model-derived layers must not be presented as engineering ground truth

Priority: P2

## Do not merge into the core product

The following are useful as engineering or analyst-side utilities but should not become first-level product dependencies:
- Sniffnet-style local network diagnostics
- Obsidian Map View
- Omarchy or developer desktop distributions
- Maigret-style username OSINT

They may be used by operators or analysts outside the operational trust boundary.

## System mapping

| Capability | SAT-DISCOVERY | Space Ops | GS LinkOps AI |
|---|---|---|---|
| STAC catalog | Primary | EARTH | Optional downstream |
| COG/range processing | Primary | EARTH | No core need |
| OMM/GP orbit model | Optional | Primary | Primary |
| GIS MCP/tool layer | Primary | Primary | Selected tools |
| Cesium/Navara adapter | Preview/3D | Primary | Operational map only |
| Crawl/browser tooling | Connector dev | Connector dev | Partner adapter dev |
| Offline packaging | Primary | Product delivery | Reports/config exports |
| Context layers | Primary | EARTH | Minimal |

## Non-regression rule

Integration of these capabilities must not remove or simplify away validated existing functions. New capabilities are added behind stable service/tool boundaries and only promoted to production after tests confirm they do not break the current AOI, Data Search, mission-planning, ground-station, delivery and navigation workflows.
