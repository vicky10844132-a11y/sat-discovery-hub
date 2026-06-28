# GS LinkOps AI — End-to-End Link Architecture

## 1. Purpose

White papers and large-company systems are only references. The key question is how GS LinkOps AI actually works.

The answer is: build a full end-to-end link that converts scattered satellite-side and ground-station-side information into one confirmed downlink mission profile.

The platform must answer:

```text
What does the satellite need?
What can the station support?
Where do the two sides conflict?
Who must confirm the conflict?
What is the final station-specific configuration?
Was the pass executed successfully?
If not, at which layer did it fail?
What report and billing conclusion should be generated?
```

---

## 2. The Core Link

The unified platform link is:

```text
Satellite Resource
→ Orbit / TLE
→ Station Resource
→ Capability Match
→ Mission Profile
→ Station Adapter
→ Confirmed Configuration
→ Contact / Pass Execution
→ Lock-stage Monitoring
→ Data Output
→ Data Transfer
→ Report
→ Billing / Settlement
→ Lessons Learned
```

This is the main operating chain.

---

## 3. Two-Side Resource Merge

### Satellite side provides

```text
Satellite name
Satellite code / internal identifier
NORAD ID / TLE / OMM
Payload type: optical / SAR / other
RF downlink frequency
Polarization / channel
Modulation
Bit rate
Coding
Frame format
Sync word
Scrambling / descrambling rule
CRC / LDPC / RS setting
Candidate pass windows or mission request
Expected data product / output
```

### Ground station side provides

```text
Station location
Antenna diameter
Frequency range
Polarization support
Minimum elevation
G/T
Maximum data rate
Baseband / demodulator system
Station-specific parameter names
Scheduling availability
Execution screenshots / logs
Output file path
Transfer method
Station contact
Cost rule
```

### Platform merges into

```text
Unified Mission Profile
```

The mission profile is the key object. It is not just a task. It is the final answer to:

```text
For this satellite, at this station, during this pass, what exact configuration should be used?
```

---

## 4. Mission Profile Structure

A mission profile should include:

```text
Mission ID
Satellite ID
Station ID
Payload type
Pass AOS / LOS
Max elevation
TLE source and age
RF center frequency
Polarization
IF frequency
Modulation
Bit rate
Mapping
I/Q polarity
Matched filter
Sync word
Frame length
Descrambling
CRC poly
CRC preset
LDPC / RS
Output mode
Output file path
Transfer method
Recipient
Fallback parameters
Operator confirmation
Station confirmation
Owner confirmation
```

The mission profile has states:

```text
Draft
Needs Satellite Confirmation
Needs Station Mapping
Needs Owner Review
Confirmed
Executed
Failed
Succeeded
Closed
```

---

## 5. Station Adapter

Because every station is different, the platform needs a station adapter for each station.

The adapter does not operate the station. It only translates the station language into platform language.

Example:

| Common field | SG-01 wording | IT-01 wording | UG-01 wording |
|---|---|---|---|
| RF frequency | X DC frequency | X-band Rx range | Rx frequency range |
| Polarization | DC LHCP / DC RHCP | RHCP / LHCP feed ports | X-band circular ports |
| IF frequency | HDR input frequency | station-specific IF if available | station-specific IF if available |
| CRC preset | CORTEX/Viasat mapping | equipment-specific | equipment-specific |
| Frame sync | Processing Unit setting | baseband setting | baseband setting |

The adapter gives the owner one unified view even when station software is different.

---

## 6. Configuration Comparison Engine

The platform must compare:

```text
Operator Provided Config
Station Mapped Config
Alternative Config
Confirmed Config
```

For each parameter:

```text
same = OK
missing = needs input
conflict = needs confirmation
unsupported = cannot execute
unknown = risk
```

Example from SG-01:

| Parameter | Operator version | Station version | Result |
|---|---|---|---|
| RF frequency | 8212 MHz | 8220 MHz | Conflict |
| IF frequency | 1200 MHz | 1270 MHz | Conflict |
| Bit rate | 800 Mbps | 900 Mbps | Conflict |
| Mapping | Gray2 | Gray1 | Conflict |
| CRC preset | 14839 | 25500 | Equipment mapping conflict |
| Sync word | 1ACFFC1D | 1ACFFC1D | OK |
| Frame length | 1024 | 1024 | OK |
| LDPC | 7/8 | 7/8 | OK |

Platform rule:

```text
If critical conflicts remain, mission cannot move to Confirmed.
```

---

## 7. Contact / Pass Execution Link

Once a mission profile is confirmed:

```text
Pass scheduled
→ Antenna scheduled
→ Station configuration loaded
→ RF path active
→ Pass starts at AOS
→ Signal detection recorded
→ Carrier / PLL lock recorded
→ Demod lock recorded
→ Frame sync recorded
→ Good frames / bad frames recorded
→ File output recorded
→ Transfer recorded
```

This creates a layer-by-layer execution record.

---

## 8. Failure Diagnosis Link

If the mission fails, the platform should not say only “failed”.

It should classify:

```text
Orbit / TLE / pass-window failure
Antenna scheduling failure
RF frequency / polarization failure
Carrier / PLL lock failure
Demodulation / bit-sync failure
Frame synchronization failure
Decode / descrambling / CRC / LDPC failure
File output failure
Transfer failure
Confirmation failure
```

The AI report should show:

```text
What was expected
What was configured
What happened during pass
Which layer failed
What data is missing
What to ask station/operator next
What should be changed before the next test
```

---

## 9. End-to-End Data Objects

To implement the link, the platform needs these objects:

```text
SatelliteResource
GroundStationResource
StationAdapter
OperatorProvidedConfig
StationMappedConfig
ConfigurationComparison
MissionProfile
PassWindow
TestAttempt
ReceptionStatus
TransferJob
FailureDiagnosis
Report
BillingRecord
AuditLog
```

Each object should be connected by IDs:

```text
SatelliteResource.id
GroundStationResource.id
StationAdapter.station_id
MissionProfile.satellite_id
MissionProfile.station_id
MissionProfile.pass_window_id
TestAttempt.mission_profile_id
FailureDiagnosis.test_attempt_id
Report.mission_profile_id
BillingRecord.mission_profile_id
```

---

## 10. Practical workflow for the owner

The owner does not need to understand the station system.

The owner workflow is:

```text
1. Upload / paste satellite-side material.
2. Upload / paste station-side material.
3. Platform extracts fields.
4. Platform shows missing and conflicting items.
5. AI recommends questions to ask satellite side / station side.
6. Owner receives answers and adds them.
7. Platform creates a confirmed mission profile.
8. Owner manually approves the mission.
9. Station executes pass.
10. Platform records lock-stage results.
11. AI generates success/failure report.
12. Owner approves report and communication.
```

---

## 11. Acceptance gate before mission execution

A mission should not be marked confirmed until these are complete:

```text
Satellite identity confirmed
TLE / OMM valid
Pass window confirmed
Station availability confirmed
RF frequency confirmed
Polarization confirmed
IF frequency confirmed
Bit rate confirmed
Modulation confirmed
Mapping confirmed
Frame sync confirmed
Coding/decoding confirmed
Output path confirmed
Operator confirmation recorded
Station confirmation recorded
Owner approval recorded
```

If any of these are missing:

```text
Status = Needs Confirmation
AI generates question list
Mission cannot be treated as ready
```

---

## 12. Link diagram

```text
[SATELLITE OPERATOR]
  Satellite ID / TLE / RF / payload config / mission window
        ↓
[Satellite Resource + Operator Config]
        ↓
        ├───────────────┐
        ↓               ↓
[Orbit Engine]     [Station Resource + Station Adapter]
        ↓               ↓
[Pass Windows]     [Capability Matrix]
        └───────┬───────┘
                ↓
        [Mission Profile Builder]
                ↓
        [Configuration Comparison]
                ↓
        [Owner / Operator / Station Confirmation]
                ↓
        [Confirmed Mission Profile]
                ↓
        [Pass Execution / Test Attempt]
                ↓
        [Lock-stage Log]
                ↓
        [Failure Diagnosis or Success Confirmation]
                ↓
        [Report + Billing Recommendation]
                ↓
        [Owner Approval / External Communication]
```

---

## 13. What to build next

To make this real, build the modules in this order:

```text
1. Mission Profile Builder
2. Station Adapter Library
3. Configuration Comparison Engine
4. Test Attempt Log
5. Failure Diagnosis Engine
6. Report Generator upgrade
7. Owner Console pages for the above
```

This is the practical implementation path.

---

## 14. Product conclusion

The white paper is only reference. The real product is this link:

```text
Resource merge
→ station-specific normalization
→ confirmed mission profile
→ pass execution
→ layer-by-layer diagnosis
→ report and billing
```

This is how GS LinkOps AI makes heterogeneous ground stations manageable for one non-technical owner.
