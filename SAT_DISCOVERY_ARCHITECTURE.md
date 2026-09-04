# SAT-DISCOVERY Architecture Principles

## Core Positioning

SAT-DISCOVERY is a stateless online geospatial production platform.

The platform coordinates:
- User-controlled data
- AOI definition
- EO/STAC catalog discovery
- Production tools
- Job orchestration
- QC review
- Output delivery

The platform is NOT:
- A long-term data warehouse
- An imagery marketplace
- An AI-first concept product

## Architecture Layers

### Layer 1 - Production Foundation

Input Center
AOI Tools
Catalog Search
Production Toolkit
Job Builder
Progress Monitor
Preview & QC
Output Center
Source & Disclaimer

### Layer 2 - Cloud-Native Data Plane

The platform should prefer processing assets where they are instead of downloading full scenes by default.

Primary interfaces:
- STAC for EO catalog discovery and metadata
- COG + HTTP Range for raster window reads
- GeoParquet / GeoJSON for vector exchange and analysis
- PMTiles / MBTiles / MVT for portable and streamed map layers
- 3D Tiles / GLB / GLTF where 3D content is required

A full download/export remains available when required by delivery, offline use or downstream QGIS/GDAL/Cesium workflows.

### Layer 3 - Rule-Based Validation

CRS validation
Geometry validation
AOI validation
Coverage validation
Offset checks
Output completeness checks
Delivery checks
Source/provenance checks
License/authorization checks for external assets

### Layer 4 - Production Intelligence

Workflow recommendation
Error explanation
QC summary
Report generation
Production memory
Contextual data suggestions

## Controlled GIS Tool Interface

AI and automation must use explicit geospatial tools rather than directly changing operational data.

Supported tool families should include:
- AOI create/import/buffer/intersection
- metadata and CRS inspection
- vector overlay and statistics
- raster window/read/statistics
- STAC search and asset selection
- preview generation
- export/package generation

The tool layer may expose MCP-compatible contracts so approved AI agents can call the same deterministic GIS operations.

## External Connector Development

For public or authorized provider systems, engineering may use:
- Crawl4AI / Firecrawl-like structured extraction
- Playwright / Crawlee browser automation
- Scrapy for large structured crawls
- protocol-analysis methods for authorized integrations

These are connector-development aids, not a substitute for provider authorization. Stable production connectors should prefer documented APIs, approved credentials and explicit licensing.

## Optional Context Layers

Global contextual products such as public land-use, population, weather or infrastructure datasets may be added as analytical overlays. They must retain source, timestamp, license and confidence metadata and must not be represented as engineering-grade truth unless the source supports that claim.

## AI Principles

Use intelligence only where it creates measurable value.

AI may:
- Recommend workflows
- Explain failures
- Summarize QC findings
- Generate reports
- Reuse historical production knowledge
- Call approved GIS tools

AI should NOT be presented as:
- Fully automatic production
- Guaranteed classification
- Guaranteed QC authority
- Autonomous geospatial production
- A way to bypass access controls or commercial data licensing

## Product Principle

Rule-based workflows first.
Cloud-native access second.
Production intelligence third.
Professional judgement remains final.
