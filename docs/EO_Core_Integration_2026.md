# EO Core Integration — 2026-10

## Goal

Create one governed geospatial foundation shared by DATA SEARCH, GF-7 Fusion/DOM, ALPHIX G Anchor DSM/DOM, Space Ops EARTH, and client delivery workflows without merging their business UIs.

## Keep as Core

- STAC metadata/catalog: PySTAC / STAC API
- Cloud-native raster: COG + HTTP Range
- Raster IO/processing: rioxarray + xarray
- Raster tiles/previews: rio-tiler / TiTiler
- Catalog-to-xarray loading: odc-stac + odc-geo
- Web map: MapLibre GL JS
- Portable vector tiles where useful: PMTiles

## Add selectively

- Orfeo ToolBox for GF-7 pansharpening/orthorectification evaluation; keep isolated from the web platform runtime.
- TorchGeo only for explicit AI/ML products such as segmentation/change detection; not a base dependency.
- Ames Stereo Pipeline only for stereo/DSM R&D where sensor models are supported and validated.

## Do not make core dependencies

- sentinelsat (archived / legacy)
- Planet client unless a licensed Planet connector is active
- Sentinel Hub client unless an authorized Sentinel Hub account is configured
- PDAL unless LiDAR/point-cloud workflows become active
- Terracotta when rio-tiler/TiTiler already covers the raster tile service requirement
- leafmap/geemap as production frontend dependencies; useful for notebooks/prototyping, while MapLibre remains the web UI layer

## Product Mapping

### DATA SEARCH

Provider connector -> normalized EOScene -> STAC -> search/filter -> preview tiles -> order/monitoring.

Normalized fields include scene ID, provider, satellite/sensor, acquisition time, geometry, resolution, cloud cover, off-nadir, product level, preview/assets, license, price/currency, and availability.

### GF-7 Fusion + DOM

Archive -> detect PAN/MS/XML/RPC -> registration -> pansharpening -> ortho/DOM -> QC -> COG -> STAC -> optional DATA SEARCH registration.

OTB is evaluated as an algorithm engine, not a UI dependency.

### ALPHIX G Anchor / DSM-DOM

DSM/DOM GeoTIFF -> COG -> STAC assets -> rio-tiler/TiTiler preview -> MapLibre overlay -> AOI/query/download.

### Space Ops EARTH

Consume the same STAC and preview services, but keep EARTH as a separate business module from DATA SEARCH.

### Client Delivery

Approved product -> COG/preview -> delivery manifest -> browser QC -> original-file delivery. Keep source, timestamp, license, checksum and product metadata.

## New external projects reviewed in October 2026

- TiTiler-PgSTAC / TiTiler-STACAPI: strong fit for STAC-native tile/search services.
- stac-fastapi: suitable when the catalog requires a standards-based STAC API.
- odc-stac / odc-geo: strong fit for loading STAC assets into xarray/Dask pipelines.
- PMTiles: useful for portable/serverless vector layers and static deployment.
- TorchGeo: actively developed; use only when a concrete GeoAI task is approved.
- OTB 10 line: useful for high-resolution optical/SAR processing, including pansharpening and orthorectification; test separately before production adoption.
- Ames Stereo Pipeline 3.7: useful for stereo/DSM R&D and now supports COG output; adopt only after GF-7 sensor-model compatibility is verified.

## Current branch scope

This branch adds a non-invasive `backend/eo_core` foundation only. Existing pages, GS LinkOps, DATA SEARCH behavior, and deployment paths are not changed yet.

Next implementation sequence:
1. Unit-test EOScene -> STAC conversion.
2. Add provider adapters for current authorized sources.
3. Add preview endpoint backed by rio-tiler/TiTiler.
4. Wire DATA SEARCH catalog results to the normalized model.
5. Connect GF-7 outputs to COG + STAC registration.
6. Reuse read-only catalog/preview services in ALPHIX and Space Ops EARTH.
