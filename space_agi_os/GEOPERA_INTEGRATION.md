# Geopera Integration — GeoSource Hub

Status: **Implemented, not yet runtime-verified**

## Source basis

Official Geopera Operations Reference and API Reference.

- API origin: `https://api.geopera.com`
- Canonical invocation: `POST /v1/op/{operation_id}`
- Authentication: `Authorization: Bearer <GEOPERA_TOKEN>`
- Operation model: 205 operations across 28 domains
- Every operation has a side-effect tier and required scope
- Spend-tier operations support `Idempotency-Key`

## Why Geopera is important to SPACE AGI OS

Geopera is not just an imagery search API. It exposes a broad geospatial operating surface that covers:

- federated catalog search across multiple imagery sources
- commercial and public EO search
- STAC search
- archive ordering
- tasking ordering
- tasking feasibility and predicted acquisition opportunities
- order coverage tracking
- delivered items and assets
- COG tile rendering and terrain tiles
- visualization profiles
- processing and clipping
- spectral indices / band math
- analytics, reports and provenance
- alerts, notifications and event subscriptions
- project/organization-scoped data management

This makes it a high-value external EO/processing aggregator for GeoSource Hub.

## AGI placement

```text
User / AGI Goal
  -> GeoSource Hub canonical capability
      -> Geopera Adapter
          -> Geopera operation id
```

Core business logic must not depend on Geopera-specific schemas or operation names.

## Initial canonical mappings

| GeoSource capability | Geopera operation |
|---|---|
| federated EO search | `catalog.federated_search` |
| commercial catalog search | `catalog.search` |
| source registry discovery | `catalog.sources.list` |
| vendor discovery | `catalog.vendors.list` |
| STAC search | `stac.search` |
| archive estimate | `orders.archive.estimate` |
| tasking estimate | `orders.tasking.estimate` |
| tasking feasibility | `orders.tasking.feasibility_check` |
| acquisition opportunities | `orders.tasking.opportunities_list` |
| sensor catalog | `orders.tasking.sensors` |
| order status | `orders.get` |
| delivered assets | `orders.list_assets` |
| item STAC | `items.get_stac` |
| item files | `items.list_assets` |
| visualizations | `visualization.list_for` |
| analytics | `analytics.execute` |
| reporting | `reports.generate` |

## Spend safety

The adapter is read-only by default.

The following classes of operations are blocked unless the caller explicitly passes an authorization gate:

- archive order placement
- tasking order placement
- order cancellation
- feasibility/quotation acceptance
- paid processing execution
- paid clipping/processing dispatch

Spend operations receive an idempotency key to reduce accidental duplicate execution.

## Credential policy

Use environment variable:

```text
GEOPERA_TOKEN=gpra_...
```

Never commit the real token to GitHub.

## Sovereignty / fallback rule

Geopera is classified as an **external replaceable adapter**, not a core single point of failure.

AGI should compare Geopera results with other EO providers/adapters where practical, including SkyFi, direct STAC/public catalogs, and supplier-specific integrations. Critical project history and delivered metadata should be persisted in GLORY STELLAR-controlled storage where licensing permits.

## Verification required before VERIFIED status

1. Obtain/configure a valid Geopera API token.
2. Run `catalog.sources.list`.
3. Run a real `catalog.federated_search` for a known AOI.
4. Validate normalized AOI/time/resolution metadata.
5. Run archive/tasking estimate without committing spend.
6. Verify error handling and auth failure behavior.
7. Compare one search result against another GeoSource adapter.
8. Verify one downstream consumer uses the normalized response end-to-end.

Until those checks pass, status remains **已实现但未验证**.
