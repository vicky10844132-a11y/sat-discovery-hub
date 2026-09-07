# GLORY STELLAR — 3D Product Showcase

Standalone browser-based product visualization for recording high-impact marketing videos.

## Current capabilities

- Real-time rotating 3D globe rendered in WebGL
- Three independently orbiting satellites with different inclinations/speeds
- Animated global coverage scan effect
- 2024 → 2025 → 2026 → Beyond timeline
- DOM 0.8 m / DSM 0.8 m / co-temporal product layer cards
- Three presentation scenes:
  - GLOBAL
  - REGION
  - DETAIL
- AUTO TOUR mode for unattended screen recording
- Hide-UI recording mode
- Fullscreen mode
- No external map API
- No CDN / Three.js dependency
- No third-party runtime dependency for the animation core

## Run

The repository already uses Vite. From the repository root:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/product_showcase_3d/
```

The exact port may differ if 5173 is already occupied.

## Recording workflow

1. Open the showcase page.
2. Click `AUTO TOUR` or manually choose `GLOBAL`, `REGION`, `DETAIL`.
3. Click `HIDE UI` if a clean visual-only recording is wanted.
4. Click `FULLSCREEN`.
5. Record with the operating system screen recorder, OBS, QuickTime, or another recorder.

Keyboard shortcuts:

- `1` — Global
- `2` — Region
- `3` — Detail
- `Space` — Auto Tour on/off
- `U` — Hide/show UI
- `F` — Fullscreen

## Product facts currently represented

- Global stereo data foundation: 2024–2026
- Coverage: 100%
- DOM: 0.8 m
- DSM: 0.8 m
- Co-temporal paired data
- Dataset continues to expand beyond 2026

## Architecture rule

This showcase is intentionally independent of external runtime services. External data and imagery may later be added through local assets or adapters, but the core presentation must continue to run if an external provider, API, CDN, or hosted mapping service is unavailable.

## Next integration points

### 1. Real coverage vectors

Add locally controlled GeoJSON/vector assets under:

```text
product_showcase_3d/assets/coverage/
```

Target layers:

- global country coverage
- AOI polygons
- regional coverage masks
- acquisition-year metadata

### 2. Real DOM / DSM imagery

Add approved public demonstration assets under:

```text
product_showcase_3d/assets/products/
```

The public showcase should only use approved public samples. Internal inventory, supplier source, exact tile index, restricted AOIs, and confidential coverage metadata must remain outside the public showcase.

### 3. Recording scenes

Planned scene chain:

```text
GLOBAL ROTATION
→ SATELLITE ORBITS
→ 2024–2026 COVERAGE BUILD-UP
→ REGION SELECT
→ AOI DESCENT
→ DOM / DSM LAYER SEPARATION
→ 3D LOCAL TERRAIN
→ PRODUCT CLOSE
```

## Status

Current implementation status: **implemented, not yet fully visually validated across browsers/devices**.

Do not mark VERIFIED until the page has been launched in the target environment and the globe rotation, satellite orbital motion, scene switching, fullscreen mode, and recording workflow have all been checked end-to-end.
