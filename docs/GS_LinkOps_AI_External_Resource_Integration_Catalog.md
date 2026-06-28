# GS LinkOps AI — External Resource Integration Catalog

## 1. Purpose

This catalog defines which external resources can be connected to GS LinkOps AI, especially for orbit / contact-window calculation.

The platform goal is not only to store resources manually, but to connect reliable external data sources where appropriate.

---

## 2. External Resource Categories

The platform can connect these external resource categories:

```text
1. Orbit / TLE / OMM sources
2. Satellite catalog sources
3. Ground station resource sources
4. Frequency / configuration sources
5. Weather / space weather sources
6. Transfer / storage sources
7. Email / confirmation sources
8. Report / document generation sources
9. Billing / accounting sources
10. User-owned resource package imports
```

---

## 3. Orbit / TLE / OMM Sources

### A. CelesTrak GP Data

Use case:

```text
Public orbit element lookup by NORAD Catalog Number, satellite group, satellite name, or international designator.
```

Recommended role:

```text
Primary public fallback source for TLE / GP / OMM.
```

Supported formats:

```text
TLE / 3LE
2LE
OMM XML
OMM KVN
OMM JSON
CSV
```

Recommended platform connection:

```text
Input: NORAD ID / satellite name / group
Output: TLE or OMM record
Use: orbit propagation and pass-window calculation
```

Important rule:

```text
Use OMM JSON/CSV where possible for future compatibility.
Do not query too frequently.
Cache results locally.
```

---

### B. Space-Track

Use case:

```text
Authenticated access to official space object catalog and orbit element data.
```

Recommended role:

```text
Primary authenticated source when an account is available.
```

Platform connection:

```text
Input: Space-Track account credentials
Output: TLE / GP / catalog metadata
Use: official orbit data refresh
```

Important rule:

```text
Requires account and compliance with Space-Track terms.
Credentials must be stored securely.
Owner approval required before enabling.
```

---

### C. User / Satellite Operator Provided TLE

Use case:

```text
Satellite operator or manufacturer provides mission-specific TLE / OMM.
```

Recommended role:

```text
Highest-priority source for authorized commercial missions.
```

Platform connection:

```text
Manual paste
File import
Email extraction
API import
```

Important rule:

```text
Do not overwrite operator-provided TLE with public TLE without owner confirmation.
```

---

### D. OMM as Future Format

Recommended direction:

```text
Support TLE now.
Add OMM JSON/CSV/XML support as the future-compatible format.
```

Reason:

```text
TLE has legacy field limitations.
OMM supports broader catalog numbering and modern metadata.
```

---

## 4. Orbit Calculation Libraries

### A. Skyfield + python-sgp4

Recommended first implementation:

```text
Python backend: Skyfield + sgp4
```

Use case:

```text
Calculate satellite position, pass windows, maximum elevation and visibility over a ground station.
```

Why suitable:

```text
Python-friendly
Easy to integrate with FastAPI
Good for first production version
Works directly with TLE
```

Platform files:

```text
backend/orbit_engine.py
backend/gs_linkops_api.py
```

---

### B. Orekit

Recommended future advanced implementation:

```text
Java / JVM orbit dynamics library for advanced flight dynamics workflows.
```

Use case:

```text
Advanced propagation, event detection, measurement modeling, mission analysis.
```

Recommendation:

```text
Do not use as first version unless a technical team is available.
Keep as future enhancement.
```

---

## 5. Satellite Catalog Sources

Possible sources:

```text
CelesTrak SATCAT
Space-Track catalog
Operator-provided satellite list
User-owned unified resource package
```

Platform use:

```text
Satellite name
NORAD ID
International designator
Operational status
Owner/operator
Launch information
```

Recommended rule:

```text
Catalog metadata can assist resource creation, but authorization status must still be confirmed by the owner.
```

---

## 6. Ground Station Resource Sources

Possible sources:

```text
User-owned station resource package
Partner-provided station list
Station operator API
Manual partner onboarding form
CSV / Excel import
```

Fields needed:

```text
Station name
Country / city
Latitude / longitude / altitude
Antenna diameter
Supported band
Frequency range
Polarization
Minimum elevation
Maximum data rate
Demodulator / modem
Transfer method
Contact person
Commercial cost
Authorization status
```

Important rule:

```text
Ground station resources should not be pulled from public assumptions.
Only approved partner resources should be used for real missions.
```

---

## 7. Weather / Space Weather Sources

Future possible integration:

```text
Local weather at station
Rain fade risk
Cloud is irrelevant for RF but useful for site operations
Space weather / solar activity
Geomagnetic conditions
```

Recommended use:

```text
AI risk note, not hard blocking by default.
```

---

## 8. Transfer / Storage Sources

Possible integration:

```text
SFTP server
FTP server
S3 bucket
S3-compatible object storage
VPN transfer server
Dedicated operator server
Temporary encrypted transfer node
Physical/offline handover record
```

Platform use:

```text
Transfer job creation
Manifest
File count
Total size
Checksum
Recipient confirmation
Retention/deletion status
```

Important rule:

```text
The platform should track payload data delivery but should not permanently store payload data by default.
```

---

## 9. Email / Confirmation Sources

Possible integration:

```text
Gmail
Manual email copy/paste
Partner confirmation link
Operator/manufacturer portal confirmation
```

Platform use:

```text
Draft email
Track confirmation
Attach report
Record sent status
Record recipient approval
```

Recommended rule:

```text
AI drafts emails. Owner sends or explicitly confirms sending.
```

---

## 10. Report / Document Sources

Possible integration:

```text
HTML report view
PDF export
DOCX export
Google Docs export
Gmail draft creation
```

Platform use:

```text
Mission report
Transfer report
Billing statement
Failure analysis
Monthly operation summary
```

Recommended rule:

```text
AI can generate report drafts. Owner approves and signs.
```

---

## 11. Billing / Accounting Sources

Possible integration:

```text
Manual invoice record
Excel / CSV export
Xero / QuickBooks / accounting system later
Gmail invoice draft
Supplier settlement tracker
```

Platform use:

```text
Client price
Station cost
Service fee
Gross margin
Invoice status
Supplier settlement status
```

Recommended rule:

```text
AI can calculate and recommend. Owner confirms amount and signing.
```

---

## 12. Integration Priority

### Priority 1 — Functional completion

```text
Manual resource import
AI resource structuring
TLE manual paste
Skyfield/SGP4 calculation
Mission workflow
Report generation
Billing recommendation
Email draft
```

### Priority 2 — Orbit automation

```text
CelesTrak NORAD lookup
OMM JSON support
TLE freshness check
Cache TLE
Warn stale TLE
```

### Priority 3 — Partner data integration

```text
Station resource CSV import
Satellite operator resource package import
Manufacturer confirmation link
Transfer confirmation link
```

### Priority 4 — Commercial automation

```text
Gmail draft integration
PDF report export
Billing export
Supplier settlement tracker
```

### Priority 5 — Advanced orbit engine

```text
Orekit support
Multi-pass optimization
Conflict-aware scheduling
Weather / space-weather risk scoring
```

---

## 13. Recommended Orbit Engine Architecture

```text
Owner Console
    ↓
Satellite Resource Record
    ↓
TLE/OMM Source Selector
    ├── Operator-provided TLE / OMM
    ├── CelesTrak public GP data
    ├── Space-Track authenticated source
    └── Manual paste / file import
    ↓
TLE/OMM Validation
    ↓
TLE Freshness Check
    ↓
Skyfield / SGP4 Pass Calculation
    ↓
Pass Ranking + Station Capability Check
    ↓
Owner chooses pass / creates mission
```

---

## 14. Orbit Calculation Functional Requirements

The platform should support:

```text
NORAD ID input
TLE Line 1 / Line 2 input
OMM JSON/CSV import
Ground station latitude / longitude / altitude
Minimum elevation threshold
Time range
Pass window list
Start UTC
End UTC
Duration
Maximum elevation
Azimuth at AOS / LOS
TLE epoch
TLE age warning
Calculation source label
Manual override
AI recommendation
Owner confirmation before mission creation
```

---

## 15. Important Accuracy Note

TLE/SGP4 is suitable for operational planning and pass-window prediction, but accuracy depends on TLE freshness, object type, orbit, maneuvers and source quality.

Recommended platform warnings:

```text
TLE older than 3 days: warning
TLE older than 7 days: high risk
Maneuvering satellite: operator-provided TLE preferred
No TLE: cannot calculate official pass window
Public TLE only: use for planning, not final guaranteed contact
```
