# SPACE AGI OS — Sovereign Dependency Policy

Status: Implemented, not yet verified

## Prime Directive
External resources may be used, but no critical capability may depend on a single external provider, API, repository, cloud service, vendor account, or data source.

The system must remain operable, recoverable, and maintainable when upstream services are unavailable, discontinued, restricted, repriced, rate-limited, blocked, or modified.

## Design Principles
1. **No single external point of failure**
   - Every critical capability must have at least one fallback path.
   - Important production capabilities should target two independent sources where technically and legally feasible.

2. **Own the integration layer**
   - Business logic must call internal canonical interfaces rather than vendor-specific APIs directly.
   - Vendor changes are isolated inside adapters/connectors.

3. **Own recoverable copies where licensing permits**
   - Mirror permitted open-source code.
   - Retain version-pinned source, dependency locks, schemas, configuration templates, and build instructions.
   - Cache or mirror open/public datasets when redistribution and storage terms allow.

4. **Separate source availability from system availability**
   - External source outage must degrade freshness or coverage before it breaks the entire application.
   - The platform should support cached, historical, alternate-source, or offline modes.

5. **License-aware sovereignty**
   - Self-hosting and mirroring are only allowed when licenses/terms permit.
   - A source that cannot legally be retained must never be treated as sovereign infrastructure.

6. **Cloud is infrastructure, not ownership**
   - Deployments must be portable.
   - Databases, object stores, containers, configuration, and backups should be exportable and restorable outside a single cloud vendor.

7. **Git hosting is not the only copy**
   - Critical private code must have independent backups/mirrors.
   - Repositories should retain pinned release tags and recoverable build artifacts.

8. **Secrets remain portable and replaceable**
   - No architecture should depend on one personal credential or one provider-specific secret format.
   - Credential rotation and provider substitution must be documented.

## Dependency Classification
Each external dependency receives one class:

- **S1 — Sovereign**: self-hostable / locally retained / independently restorable.
- **S2 — Redundant**: external, but at least one validated alternative exists.
- **S3 — Degraded-safe**: external-only, but system remains usable with reduced capability when unavailable.
- **S4 — Fragile**: external-only with no reliable fallback. S4 must not be used for critical production paths.

## Mandatory Metadata
For every external dependency:
- Dependency ID
- Capability
- Provider / upstream
- License / terms
- Commercial-use status
- Current access method
- Authentication requirements
- Data retention rights
- Self-hostable: yes/no
- Mirror allowed: yes/no
- Primary source
- Secondary source
- Offline fallback
- Cached fallback
- Last validated date
- Replacement procedure
- Dependency class (S1-S4)

## Release Gate
A new critical feature cannot be marked VERIFIED unless:
1. its external dependencies are registered,
2. single points of failure are identified,
3. at least one recovery/degradation path is tested,
4. any legal/licensing constraints on local retention are recorded,
5. backup/restore instructions exist for self-owned state.

## Target Architecture
External Sources / APIs / Open Source / Vendors
→ Adapters & Connectors
→ License / Policy Guard
→ Raw Mirror / Cache (where allowed)
→ Canonical Internal APIs
→ Private Data Stores
→ SPACE AGI OS

The system should consume the outside world without allowing the outside world to own the system.
