# GS LinkOps AI — Heterogeneous Ground Network Normalization Architecture

## 1. Core Problem

Every ground station is different.

Different stations may have:

```text
Different antennas
Different RF chains
Different baseband equipment
Different demodulators
Different software interfaces
Different configuration terminology
Different file exchange methods
Different tracking / scheduling workflows
Different reporting habits
Different failure descriptions
```

This is why direct station-to-satellite-operator coordination becomes difficult:

```text
Satellite operator keeps scheduling missions.
Ground station keeps reporting failure.
The owner does not know whether the problem is orbit, RF, demodulation, frame sync, configuration mapping, station scheduling or data output.
```

GS LinkOps AI should solve this by becoming a normalization layer between satellite operators and heterogeneous partner ground stations.

---

## 2. Product Principle

The platform should not require all ground stations to use the same system.

Instead, the platform should define a unified operational language:

```text
Satellite-side resource
+ Station-side capability
+ Station-specific configuration adapter
+ Unified mission workflow
+ Unified test attempt log
+ Unified failure diagnosis
+ Unified report output
```

Each station can remain different, but GS LinkOps AI translates each station into a common model.

---

## 3. Why large commercial systems are easier to operate

Large commercial ground-network platforms are easier because they have already solved the hidden work:

```text
They maintain station capability databases.
They know which station supports which band, rate and polarization.
They normalize antenna and baseband configuration fields.
They manage pass windows and station availability.
They maintain configuration templates by satellite and station.
They record execution logs and failure stages.
They distinguish RF failure, demod failure, frame sync failure and data delivery failure.
They generate standard reports.
They use internal rules before accepting a task.
```

The goal of GS LinkOps AI is to build this same normalization and decision layer for the owner.

---

## 4. The Normalization Layer

The platform should separate three things:

```text
1. What the satellite operator provides
2. What the ground station can actually do
3. What the final confirmed station-specific configuration should be
```

### Satellite-side input

```text
Satellite name
Satellite code / internal identifier
NORAD ID / TLE / OMM
Payload type: optical / SAR / other
RF downlink frequency
Polarization
Modulation
Bit rate
Coding
Frame format
Sync word
Scrambling / descrambling
CRC / LDPC / RS
Candidate pass windows
Expected data output
```

### Ground-station-side input

```text
Station location
Antenna diameter
RF band support
Frequency range
Polarization support
Minimum elevation
G/T
Maximum data rate
Baseband system
Demodulator type
Station software
Supported filters
Supported coding/decoding
Data output path
Transfer method
Station contact
Availability calendar
```

### Confirmed configuration output

```text
Station
Satellite
Pass window
RF frequency
Polarization
IF frequency
Demodulation
Bit rate
Mapping
I/Q polarity
Matched filter
Frame sync word
Frame length
Descrambling
CRC poly / preset
LDPC / RS
Output mode
Data path
Transfer destination
Fallback parameters
Who confirmed what
```

---

## 5. Station Adapter Concept

Each ground station needs a station adapter profile.

The station adapter does not control the antenna. It only explains how the station's terminology maps to the platform's common fields.

Example:

```text
Common field: RF center frequency
SG-01 field: X DC LHCP/RHCP Frequency
Catania field: X-band Rx frequency range
Uganda field: Rx frequency range
```

```text
Common field: polarization
SG-01 field: DC LHCP / DC RHCP path
Satellite interface field: channel 1 left circular / channel 2 right circular
Catania field: RHCP & LHCP feed ports
Uganda field: X-band circular ports
```

```text
Common field: baseband mapping
CORTEX-style field: CRC 40801 / preset 14839
Viasat-style field: CRC 40801 / preset 25500
Station HDR field: processing unit CRC preset
```

The platform should allow multiple station adapters:

```text
SG-01 Adapter
SE-01 Adapter
IT-01 Adapter
UG-01 Adapter
Future partner station adapter
```

---

## 6. Unified Mission Workflow

No matter how different the stations are, all missions should pass through one common workflow:

```text
Resource Intake
→ TLE / Orbit Confirmation
→ Pass Window Confirmation
→ Station Capability Match
→ Station-Specific Configuration Draft
→ Operator + Station Confirmation
→ Test Attempt / Mission Execution
→ Lock-stage Record
→ Data Output / Transfer
→ Failure Diagnosis or Success Report
→ Billing Recommendation
→ Owner Approval
```

This creates consistency for the owner.

---

## 7. Unified Failure Diagnosis

The platform should classify failures into standard layers:

```text
Orbit / TLE / pass-window failure
Antenna scheduling failure
RF frequency / polarization failure
Carrier / PLL lock failure
Demodulation / bit sync failure
Frame synchronization failure
Decode / descrambling / CRC / LDPC failure
Data file output failure
Transfer / delivery failure
Confirmation / reporting failure
```

This avoids vague statements like:

```text
The station failed.
The test did not work.
The parameters may be wrong.
```

Instead the platform should say:

```text
Failure likely occurred before demodulation lock.
RF detected but no frame sync.
Frame sync achieved but no valid output file.
Pass too low to be a reliable test.
Configuration conflict unresolved before execution.
```

---

## 8. Required Product Modules

To make the owner's work simpler, the platform must include:

```text
1. Resource Merge Center
2. Station Adapter Library
3. Satellite Configuration Library
4. Configuration Comparison Engine
5. TLE Inbox
6. Mission Window Manager
7. Station Capability Matrix
8. Test Attempt Log
9. Failure Diagnosis Engine
10. Report Generator
11. Billing Recommendation Engine
12. Owner Confirmation Workflow
```

---

## 9. What this means for the owner

The owner should not need to understand every station system.

The owner should only need to provide:

```text
Satellite-side documents / screenshots / TLE / schedules
Ground-station-side documents / screenshots / station feedback
Commercial rules
Final yes/no decisions
```

The platform should then answer:

```text
Can this station support this satellite?
Which parameters are missing?
Which parameters conflict?
Which party must confirm?
Which pass is lower risk?
Which station configuration should be used?
If it failed, at which layer did it fail?
What should be changed before the next test?
What report should be sent?
```

---

## 10. Practical Example: SG-01

SG-01 test showed the exact reason this platform is needed.

Inputs were scattered across:

```text
Satellite operator parameters
WeChat messages
Station screenshots
TLE/designation code request
Pass-window screenshots
HDR / baseband screenshots
RF path screenshots
Station feedback messages
```

Without a platform, the owner only sees:

```text
Test failed three times.
```

With GS LinkOps AI, the platform should produce:

```text
1. The satellite was optical EO, not SAR.
2. TLE/designation was not fully closed.
3. One pass was too low elevation.
4. RF frequency had two observed values.
5. IF frequency had two observed values.
6. Bit rate had two observed values.
7. CRC preset had two equipment mappings.
8. Lock-stage screenshots indicate unresolved signal/demod/frame-sync status.
9. Final configuration was not frozen before execution.
10. Next test should not proceed until the confirmation checklist is complete.
```

---

## 11. Design Decision

GS LinkOps AI should not be built as a simple task tracker.

It should be built as:

```text
Heterogeneous ground network normalization platform
+ AI-assisted resource merging
+ station-specific configuration adapters
+ failure diagnosis and reporting
```

This is what makes the platform valuable.

---

## 12. Functional Completion Requirement

Functional completion now requires the following additional capability:

```text
For any satellite + any station:
    platform can merge the two sides' resources,
    identify missing and conflicting parameters,
    map station-specific settings into common fields,
    generate a confirmed configuration checklist,
    record test attempts,
    diagnose failures by layer,
    generate a report for the owner.
```

Only after this is built can the owner manage multiple stations without needing to understand each station's technical system.
