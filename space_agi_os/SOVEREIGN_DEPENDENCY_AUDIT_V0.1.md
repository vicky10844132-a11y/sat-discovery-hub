# SPACE AGI OS — Sovereign Dependency Audit v0.1

Status: 已实现但未验证（audit started; not complete）

## Objective
Identify every external dependency that could stop a core capability, classify survivability, and define a replacement, mirror, fallback, or offline strategy.

## Classification
- **S1 — Sovereign**: can run from owned/mirrored code and owned/local data without a live external service.
- **S2 — Redundant**: external dependency exists, but verified alternative/fallback is available.
- **S3 — Degraded**: external loss reduces freshness/capability but core workflow remains usable.
- **S4 — Fragile**: single external dependency can stop a core workflow. S4 is not allowed as the final state for a production-critical capability.

## First verified findings

### 1. Orbit propagation libraries
Observed dependencies in `backend/requirements-gs-linkops.txt`:
- FastAPI
- Uvicorn
- Pydantic
- Skyfield
- SGP4
- python-multipart

Assessment:
- These are software-package dependencies rather than live-data dependencies.
- They are suitable for mirroring/pinning in an internal package/cache/container build.
- Current state: **S2 pending mirror + lockfile + clean-build verification**.
- Target state: **S1**.

Required actions:
- Replace open-ended `>=` constraints with reproducible pinned versions after regression testing.
- Maintain internal wheel/package cache or immutable container image.
- Export build manifest + hashes.
- Verify clean-machine offline build from recovery pack.

### 2. Orbit element acquisition — CelesTrak
`backend/orbit_data_sources.py` currently implements direct HTTP acquisition from CelesTrak for GP/TLE queries by NORAD id, name, and group.

Assessment:
- Business/orbit functions must not call CelesTrak directly as the sole production source.
- Direct source-specific URLs are currently embedded in the adapter.
- No verified secondary provider, owned mirror, historical element vault, freshness policy, or automatic failover is present in this module.
- Current survivability: **S4 for fresh external orbit-element acquisition**.

Target design:
`Orbit Source Registry -> Primary/Secondary/Local Vault -> Normalizer -> Validation -> Freshness/Provenance -> Orbit Engine`

Required actions:
1. Create canonical orbit-element schema independent of TLE provider.
2. Add multiple approved source adapters.
3. Create local orbit-element vault storing raw payload, normalized record, source, retrieval time, checksum, epoch, and validation state.
4. Add freshness thresholds and stale-data warning policy.
5. Add failover routing.
6. Add island-mode read from the local vault.
7. Verify propagation using cached elements with internet disabled.

### 3. AI Operator / LLM dependency
`backend/openai_operator_service.py` currently contains a deterministic local router and explicitly states that the scaffold works without an external LLM; an external LLM may be added when an API key is configured.

Assessment:
- This is a good sovereignty property: basic command routing is not currently dependent on a live LLM.
- Current local deterministic routing: **S1/S3 depending on requested task**.
- Any future external LLM path must remain optional and replaceable.

Target design:
- Local deterministic policy/router always available.
- LLM provider behind a provider-neutral interface.
- Optional local model runtime for island mode.
- Tool registry, policy gates, audit log and execution remain owned by SPACE AGI OS, not by the LLM provider.

## Mandatory audit domains
The remaining audit must cover:
- EO search/data providers
- supplier APIs
- maps/basemaps/tiles
- DEM/terrain/3D
- weather/ocean/hazards
- aviation/maritime feeds
- database/runtime/cloud
- GitHub/source-control dependency
- authentication/identity
- email
- file/object storage
- website/CMS
- billing/accounting
- external AI/model providers
- package registries and container registries
- DNS/domain/certificates
- monitoring/logging

## Final rule
A production-critical capability cannot be marked **已验证可用** until:
1. its external dependencies are enumerated;
2. no single S4 dependency remains;
3. fallback or offline behavior is tested;
4. recovery steps are documented and reproducible;
5. the test result is linked to evidence.
