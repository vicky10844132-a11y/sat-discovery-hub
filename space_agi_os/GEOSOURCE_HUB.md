# SPACE AGI OS — GeoSource Hub

Status: Implemented, not yet verified

## Objective
Provide one canonical integration layer for open/public/commercial geospatial and real-time spatial data sources. New sources are registered once, normalized once, licensed once, and then reused by EO Search, Orbit, Ground Station, Intelligence, Mission Ops, map layers, analytics, and agent workflows.

## Core pipeline
Source Registry -> Connector Adapter -> Normalizer -> Cache -> License/Cost Guard -> Health Monitor -> Canonical API -> Consumers

## Why this exists
The geospatial ecosystem contains thousands of public APIs, open-source repositories, STAC catalogs, live feeds, tile services, orbital feeds, disaster feeds and sensor networks. Directly wiring sources into UI pages causes fragmentation, duplicated code, broken fallbacks and inconsistent licensing. GeoSource Hub makes sources pluggable and replaceable.

## Source categories
- Aircraft / ADS-B
- Maritime / AIS
- Satellite / Orbit
- Earth Observation / STAC / imagery catalogs
- Terrain / DEM / 3D Tiles
- Weather / Ocean / Climate
- Disaster / Fire / Earthquake / Emergency
- Infrastructure / Roads / Ports / Airports / Power / Subsea Cable
- Traffic / Mobility
- Public Camera / Urban Sensor
- Geocoding / Boundaries / Administrative data
- Ground Station / RF / Spectrum
- Intelligence / OSINT geospatial feeds

## Required source metadata
- source_id
- display_name
- category
- provider
- endpoint/base_url
- protocol: REST / GraphQL / STAC / WMS / WMTS / WFS / XYZ / TMS / WebSocket / file feed
- auth_type
- api_key_required
- account_required
- pricing_model
- estimated_cost
- rate_limit
- commercial_use_allowed
- redistribution_allowed
- attribution_required
- license_url
- geographic_coverage
- temporal_coverage
- update_frequency
- spatial_resolution
- latency_class
- data_quality_level
- source_priority
- fallback_source_ids
- health_status
- last_health_check
- adapter_version
- notes

## Connector contract
Every connector must expose a normalized capability description and one or more canonical operations, for example:
- search(area, time, filters)
- latest(area, filters)
- history(entity_or_area, time_range)
- get(entity_id)
- stream(area, filters)
- tiles(area, zoom_or_resolution)

Connectors must not leak provider-specific schemas directly into product UIs.

## Canonical object families
- AircraftTrack
- VesselTrack
- SatelliteState
- OrbitElement
- EOAsset
- EOCollection
- TerrainAsset
- DisasterEvent
- WeatherField
- InfrastructureFeature
- CameraFeed
- TrafficObservation
- GroundStation
- IntelligenceEvent

## Health and fallback
Each source receives health states:
HEALTHY / DEGRADED / RATE_LIMITED / AUTH_FAILED / DOWN / RETIRED

Consumers request a capability, not a specific provider, unless explicitly required. The hub may select the primary or fallback source based on health, latency, license and cost.

Example:
Aircraft capability -> OpenSky -> adsb.lol -> cached last-known

## Licensing guard
No source may be promoted to production merely because its code repository is open source. The connector record must separately evaluate:
1. code license,
2. data license,
3. provider terms,
4. commercial-use rights,
5. redistribution rights,
6. attribution,
7. API billing / quota.

## Cost guard
Sources are classified:
FREE_OPEN / FREE_WITH_REGISTRATION / METERED / SUBSCRIPTION / COMMERCIAL_ONLY

AGI planning should prefer appropriate free/open sources for experimentation but may select paid authoritative sources when required by business quality or contractual obligations.

## Technology absorption workflow
DISCOVER -> VERIFY -> LICENSE REVIEW -> CAPABILITY MAP -> ADAPTER DESIGN -> SANDBOX -> VALIDATE -> PROMOTE

Candidate technology may be classified:
- DIRECT_CONNECT
- ADAPTER_REFERENCE
- UI_REFERENCE
- ALGORITHM_REFERENCE
- HOLD
- REJECT

## God's Eye View reference
Use the open-source project only as a technology/reference candidate. High-value concepts to evaluate include:
- multi-layer real-time globe orchestration,
- aircraft / maritime / satellite data adapters,
- 3D globe interaction patterns,
- voice-agent to spatial-tool invocation,
- provider/source separation.

Do not copy third-party data usage assumptions into GLORY STELLAR. Each upstream feed must pass independent license and commercial-use review.

## Relationship to Intelligence Hub
GeoSource Hub provides spatial facts and feeds.
Intelligence Hub fuses news, events, OSINT, alerts, documents and spatial observations into intelligence events, confidence, impact and recommended actions.

## Initial capability backlog
1. Satellite/orbit: CelesTrak, Space-Track GP/GP_History, public operator ephemeris where allowed
2. EO: Copernicus Data Space, Landsat, NASA Earthdata, STAC catalogs, Microsoft Planetary Computer, other public catalogs
3. Terrain: SRTM, NASADEM, Copernicus DEM, FABDEM where license permits
4. Disaster: NASA FIRMS, USGS Earthquakes, GDACS, Copernicus EMS references
5. Aircraft: OpenSky, adsb.lol and eligible alternatives
6. Maritime: AISStream and eligible public AIS sources
7. Weather/Ocean: NOAA/GFS, ECMWF Open Data, Copernicus Marine where appropriate
8. Infrastructure: OSM and eligible public infrastructure datasets

## Definition of Done
A source is VERIFIED only when:
- endpoint/auth works,
- normalized schema works,
- license/commercial flags are reviewed,
- attribution is recorded,
- health check passes,
- fallback behavior is tested when applicable,
- at least one real consumer uses the canonical interface end-to-end.
