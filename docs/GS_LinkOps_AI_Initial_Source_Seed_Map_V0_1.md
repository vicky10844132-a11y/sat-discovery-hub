# GS LinkOps AI — Initial Source Seed Map V0.1

## 1. Purpose

This document records the first source map for building the GS LinkOps AI resource database.

The goal is to start the database-building process with public, semi-public and partner-confirmed sources.

The first phase is not to complete the entire global database immediately.

The first phase is to create a repeatable source collection and ingestion pipeline.

---

## 2. Database-Building Sequence

```text
Search sources
→ extract useful fields
→ normalize terms
→ assign confidence level
→ record source evidence
→ mark unknown fields
→ create satellite / station / system profile
→ update matching rules
```

---

## 3. Satellite Source Seeds

### 3.1 CelesTrak

Useful for:

```text
SATCAT
NORAD Catalog Number
International Designator / COSPAR-like identifier
TLE / GP data
OMM XML / OMM KVN / JSON / CSV formats
special satellite groups
active satellites
SAR satellites
communications satellites
GNSS satellites
Starlink / OneWeb / Iridium / Planet / Spire groups
```

Initial confidence:

```text
High for public orbit/catalogue metadata.
Not sufficient for private downlink configuration.
```

### 3.2 Space-Track

Useful for:

```text
official space object catalogue
TLE / GP data
object identity
orbital metadata
```

Initial confidence:

```text
High for catalogue and orbit-related information.
Requires account access for full operational use.
```

### 3.3 UCS Satellite Database

Useful for:

```text
satellite operator
country / region
purpose
orbit class
launch information
basic satellite service profile
```

Initial confidence:

```text
Useful for operator and mission context.
Needs cross-checking against current operational status.
```

---

## 4. Ground Station / GSaaS Source Seeds

### 4.1 Leaf Space / Leaf Line

Useful for:

```text
GSaaS operating model
network size and locations
S / X / Ka support
smart and on-demand booking
payload data delivery
API onboarding model
pricing logic: per-minute / all-inclusive
technical feasibility check
end-to-end compatibility check
```

Initial confidence:

```text
High for public service model.
Insufficient for individual station RF/baseband configuration.
```

### 4.2 AWS Ground Station

Useful for:

```text
cloud-connected ground station service model
satellite onboarding concept
mission profile concept
contact scheduling
AWS cloud integration
```

Initial confidence:

```text
High for cloud GSaaS architecture reference.
Insufficient for third-party station compatibility database.
```

### 4.3 KSAT

Useful for:

```text
global ground network reference
polar / high-latitude station model
commercial ground network services
```

Initial confidence:

```text
High for public service positioning.
Requires deeper research for station-level details.
```

### 4.4 SSC CONNECT

Useful for:

```text
ground station network reference
commercial station network services
```

Initial confidence:

```text
To be expanded.
```

### 4.5 RBC Signals

Useful for:

```text
aggregated global ground station network model
multi-partner station network
scheduling and service marketplace reference
```

Initial confidence:

```text
To be expanded.
```

### 4.6 SatNOGS

Useful for:

```text
open ground station network
public observation model
community station metadata
open-source ground station operations reference
```

Initial confidence:

```text
Useful for open-network structure and public metadata.
Not equivalent to commercial X-band payload downlink capability.
```

---

## 5. Research / Paper Source Seeds

### 5.1 SkyGS / Federated GSaaS and Cloud Scheduling

Useful for:

```text
federated GSaaS model
multi-provider scheduling
cloud and ground-station joint optimization
latency / cost optimization
bipartite graph matching idea
```

Initial confidence:

```text
High as research reference.
Needs separation from commercial implementation reality.
```

### 5.2 Satellite Database Ontology Research

Useful for:

```text
satellite database ontology
term mapping
structured semantic model
federated satellite database concepts
```

Initial confidence:

```text
Useful for database schema and ontology design.
```

---

## 6. Initial Data Fields to Extract

### 6.1 Satellite Fields

```text
Satellite name
NORAD Catalog Number
International Designator
Operator
Country / region
Orbit type
TLE / OMM source
Operational status
Mission type
Payload type
Public downlink information if available
Private downlink information status
Confidence level
Source evidence
```

### 6.2 Ground Station Fields

```text
Station / network name
Operator
Country / region
Location if known
Frequency bands
Antenna count
Antenna size if known
Service type
Booking method
API / portal / manual access
Data delivery method
Pricing model
Publicly claimed capability
Known technical detail
Unknown fields
Confidence level
Source evidence
```

### 6.3 System / Adapter Fields

```text
System name
Interface type
API / REST / MQ / SFTP / portal / email / manual
Availability exchange
Booking request / response
Pass status update
Baseband configuration exchange
Reception log exchange
Delivery confirmation
Security requirement
Fallback workflow
Confidence level
Source evidence
```

---

## 7. Confidence Level Rule

```text
Public claim
Third-party mention
Official public document
Partner email confirmation
Capability sheet
Interface document
Test report
Operational success record
Repeated operational validation
```

---

## 8. Next Collection Steps

```text
1. Build source list for satellite catalogues.
2. Build source list for GSaaS and commercial ground station networks.
3. Build source list for open ground station networks.
4. Build source list for research papers on GSaaS scheduling.
5. Extract first batch of satellite fields.
6. Extract first batch of station/network fields.
7. Create station fingerprint template.
8. Create satellite profile template.
9. Create source evidence library.
10. Feed everything into the platform database progressively.
```

---

## 9. Product Rule

```text
Start with source evidence.
Convert source evidence into structured records.
Convert structured records into matching intelligence.
Convert matching intelligence into dispatch value.
```
