# GS LinkOps AI — Commercial Ground System Benchmark Research

## 1. Why we benchmark large systems

The owner’s observation is correct:

```text
Large ground-network operators are not easier because their stations are simple.
They are easier because their internal systems have already normalized station differences, mission profiles, scheduling, pass execution, monitoring, delivery and reporting.
```

GS LinkOps AI should learn from these systems, but should remain scoped to owner-operated downlink operations rather than full spacecraft control.

---

## 2. Benchmark targets

The most useful reference systems / ecosystems are:

```text
AWS Ground Station
Azure Orbital Ground Station
KSAT / KSATlite
SSC CONNECT
Leaf Space Leaf Line
Viasat Real-Time Earth
RBC Signals
SatNOGS Network
ESA SCOS-2000 / EGS-CC style mission-control architecture
GMV hifly-style commercial mission control architecture
```

Not all of these publish full white papers. AWS and SatNOGS publish useful public documentation. ESA/SCOS/EGS-CC publish architectural references. Commercial GSaaS operators usually publish product/service pages rather than full technical white papers.

---

## 3. AWS Ground Station — most useful public benchmark

Public documentation shows several important architectural ideas:

```text
Satellite onboarding
Antenna capabilities abstraction
Valid ephemeris requirement
Mission profile
Tracking config
Dataflows
Contact scheduling
Contact execution
Contact status lifecycle
Cloud monitoring
Digital twin
```

Useful lesson for GS LinkOps AI:

```text
Do not treat each contact as a manual one-off event.
Create reusable mission profiles and config components.
Separate satellite onboarding, station capability, ephemeris, mission profile, contact scheduling and contact execution.
```

Mapping to our platform:

| AWS-like concept | GS LinkOps AI equivalent |
|---|---|
| Satellite onboarding | Satellite Resource + Authorization + TLE/OMM |
| Antenna capabilities | Station Capability Matrix |
| Mission profile | Confirmed Configuration Template |
| Tracking config | Pass / Antenna tracking requirement |
| Dataflows | Transfer & Delivery Plan |
| Contact | Mission / Pass Execution |
| Contact status | Mission status lifecycle |
| CloudWatch monitoring | Reception Log / Status Monitor |
| Digital twin | Test mode / simulated pass / pre-check |

---

## 4. SatNOGS — useful open reference for distributed station network

SatNOGS is not a commercial high-rate EO downlink platform, but it is valuable because its public documentation shows how a distributed ground-station network organizes:

```text
Ground station registration
Station location and antenna information
Pass scheduling
Observation review
Station testing status
Station performance comparison
Community-driven satellite database
Client software on each station
```

Useful lesson:

```text
Every station must have enough structured metadata so that the network can decide which satellites/passes the station can receive.
Stations can remain different, but the network needs a common information model.
```

Mapping to our platform:

| SatNOGS concept | GS LinkOps AI equivalent |
|---|---|
| Add Ground Station | Resource Center station onboarding |
| Station metadata | Station capability profile |
| Testing flag | Draft / Testing / Authorized station status |
| Observation | Test Attempt / Mission Execution |
| Review observation | Reception Log / Failure Diagnosis |
| Satellite database | Satellite Configuration Library |
| Client | Station-side adapter / feedback channel |

---

## 5. KSAT / SSC / Leaf / Viasat / RBC Signals — service-model benchmark

These commercial operators generally present service capability rather than detailed technical architecture.

Useful patterns to copy:

```text
Global ground-station network
Coverage by geography and orbit type
Multi-band support
Scheduling and conflict management
Station operation center / network operation center
Data delivery after pass
Service-level reporting
Partner stations as part of a unified service
```

The key idea is:

```text
The customer does not manage each antenna directly.
The provider hides station differences behind a service workflow.
```

For GS LinkOps AI, this means the owner should not see raw station complexity. The platform should show:

```text
Recommended station
Pass risk
Configuration readiness
Execution status
Delivery status
Billing status
Report
```

---

## 6. ESA SCOS / EGS-CC / mission-control style benchmark

Mission-control systems are broader than GS LinkOps AI and often include spacecraft command and telemetry control. GS LinkOps AI must not copy uplink command capability.

Useful concepts to copy:

```text
Spacecraft database / mission database
Telemetry frame processing model
Configuration management
Procedure validation
Event and alarm handling
Archive and report generation
Role separation
Auditability
```

Useful concepts to avoid:

```text
Command execution
Payload commanding
Onboard software management
Closed-loop spacecraft control
```

Mapping to GS LinkOps AI:

| Mission-control concept | Safe GS LinkOps AI equivalent |
|---|---|
| Spacecraft database | Satellite receiving-parameter library |
| Procedure validation | Configuration checklist |
| Telemetry frame status | Reception / frame-sync status |
| Alarm | AI alert |
| Archive | Mission record / report archive |
| Command chain | Out of scope |

---

## 7. What we should build from the benchmark

After comparing these systems, GS LinkOps AI should become:

```text
Owner-operated downlink mission orchestration platform
+ heterogeneous ground station normalization layer
+ satellite/station resource merge engine
+ mission profile/configuration template library
+ test attempt and failure diagnosis engine
+ report and billing generator
```

It should not be merely:

```text
Task tracker
Manual note table
Simple pass calculator
```

---

## 8. Required benchmark-derived modules

### A. Satellite Onboarding

```text
Satellite name
Operator
Identifier systems
NORAD / TLE / OMM
Payload type
RF parameters
Authorization
Configuration source documents
```

### B. Station Onboarding

```text
Location
Antenna
Band
Frequency range
Polarization
G/T
Maximum data rate
Equipment family
Interface method
Transfer method
Station status
Cost rule
```

### C. Mission Profile Library

```text
Reusable satellite + station configuration templates
Versioned parameter sets
Confirmed / draft / deprecated status
Fallback parameter set
```

### D. Contact / Pass Manager

```text
Candidate pass
AOS / LOS
Maximum elevation
Station availability
Capability match
Risk score
Owner confirmation
```

### E. Dataflow / Delivery Plan

```text
Output file path
Transfer method
Recipient
Manifest
Checksum
Retention
Delivery confirmation
```

### F. Contact Execution Monitor

```text
Antenna scheduled
RF detected
PLL lock
Demod lock
Frame sync
Good frames
Output file generated
Transfer completed
```

### G. Failure Diagnosis

```text
Orbit / scheduling
RF / polarization
IF / demod
Frame sync
Decode
Output file
Transfer
Confirmation
```

### H. Report Generator

```text
Mission preparation report
Configuration comparison report
Test failure report
Reception report
Transfer report
Billing statement
```

---

## 9. White paper / documentation search plan

The platform research folder should keep a rolling evidence list.

Search targets:

```text
AWS Ground Station documentation
Azure Orbital Ground Station documentation
SatNOGS Network documentation
ESA SCOS-2000 / EGS-CC documentation
GMV hifly product/brochure materials
KSAT / KSATlite service materials
SSC CONNECT service materials
Leaf Space Leaf Line materials
Viasat Real-Time Earth materials
RBC Signals materials
Academic papers on downlink scheduling and ground-station selection
```

What to extract:

```text
Resource model
Mission profile model
Contact scheduling model
Station capability model
Dataflow / delivery model
Monitoring and status lifecycle
Failure classification
Report structure
Commercial/billing trigger model
```

---

## 10. Product conclusion

The owner does not need to understand each station.

The platform should act like the large operators’ internal system:

```text
Normalize station differences.
Convert satellite-side and station-side data into one confirmed mission profile.
Block execution when required parameters conflict.
Record every attempt.
Diagnose failure by layer.
Generate reports and billing recommendations.
```

This is the correct direction for GS LinkOps AI.
