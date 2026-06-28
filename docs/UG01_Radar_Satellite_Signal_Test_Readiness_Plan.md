# UG-01 Uganda Station — Radar Satellite Signal Test Readiness Plan

## 1. Background

The owner has confirmed that UG-01 wants to test signal reception for the two high-resolution radar satellites previously discussed.

Current situation:

```text
Station: UG-01 Uganda Mpoma / Kampala Ground Station
Satellite candidates: two radar satellites, likely SVN2-05 and SVN2-06, pending final identity confirmation
Earlier satellite-side references:
- SVN2-05: 68378
- SVN2-06: 68377
Interface document references:
- SVN2-05: 22C9
- SVN2-06: 23C9
Mission type: signal test / X-band radar satellite downlink reception compatibility test
```

Important note:

```text
68378 / 68377 must be confirmed as NORAD IDs or internal operator identifiers.
22C9 / 23C9 appear to be interface identifiers, not necessarily NORAD IDs.
```

---

## 2. Why this test is important

The owner has been waiting for external system construction support, but progress has been slow. Therefore, GS LinkOps AI must support the owner directly.

The goal is to make the platform operational from the current available information:

```text
Start from resource documents, screenshots and chat records.
Convert them into structured mission records.
Use readiness gates to avoid blind tests.
Generate reports after every test.
Build station adapters and mission profiles gradually.
```

This is a from-zero operational build.

---

## 3. Current UG-01 station capability summary

From the existing station resource draft:

```text
Station ID: UG-01
Station name: Uganda Mpoma / Kampala Ground Station
Coordinates: 0.428641 N, 32.7664 E
Antenna: XT 750 X / 7.5 m X-band LEO antenna
Primary capability: X-band receiving data station
Possible TT&C MCC configuration exists in source materials, but GS LinkOps AI treats this only as metadata and does not implement uplink/control.
```

Receiving station electrical characteristics extracted earlier:

```text
X-band circular, 2 ports
Rx range: 7.750–8.5 GHz
G/T: 32 dB/K at 5° elevation, 23°C, 8 GHz clear sky
G/T: 32 dB/K at 10° elevation, 23°C, 8.2 GHz clear sky
Beamwidth: 0.34° at 8 GHz
Feed ports: 2 Rx
Output flange: WR112
Rx/Rx isolation: 20 dB
Cross-pol isolation: >30 dB
Radiation pattern: ITU-R S.580-6 & S.465-6
```

Initial compatibility observation:

```text
If the radar satellites use around 8212 MHz / 8220 MHz X-band downlink, this is within the UG-01 stated Rx range of 7.750–8.5 GHz.
```

However, frequency-range compatibility alone is not enough. The station still needs confirmed polarization, data rate, modulation, coding, demodulator support and pass windows.

---

## 4. Minimum information needed from satellite side

Before UG-01 can test, the platform needs the following from the satellite/operator side:

```text
1. Confirm exact satellite names.
2. Confirm whether 68378 / 68377 are NORAD IDs.
3. Provide latest TLE / OMM for both satellites.
4. Confirm RF center frequency.
5. Confirm polarization / channel.
6. Confirm modulation.
7. Confirm bit rate.
8. Confirm mapping.
9. Confirm IF requirement, if station-side IF is expected.
10. Confirm sync word.
11. Confirm frame length.
12. Confirm scrambling / descrambling.
13. Confirm CRC / LDPC / RS.
14. Confirm candidate test windows in UTC, or allow platform/station to calculate candidate pass windows from TLE.
15. Confirm expected output: signal-only test, frame-lock test, or data-file generation test.
```

---

## 5. Minimum information needed from UG-01 station side

Before the test, UG-01 should confirm:

```text
1. Can UG-01 receive X-band at the target RF frequency?
2. Which RF path / port will be used?
3. Which polarization options are available and how they map to station settings?
4. What demodulator/baseband system is used?
5. Maximum supported data rate for this configuration.
6. Supported modulation: 8PSK / QPSK / OQPSK or other.
7. Supported coding: LDPC 7/8 and related options.
8. Supported frame sync settings.
9. Whether custom descrambling / CRC preset can be configured.
10. Whether station can provide pre-pass configuration screenshots.
11. Whether station can provide post-pass lock-stage screenshots.
12. Output file path or signal-only test confirmation.
13. Test contact person.
```

---

## 6. UG-01 first-pass success readiness gate

The test should not proceed until the platform status is at least Yellow and preferably Green.

### Red — Not Ready

```text
No TLE / OMM
Satellite identity unclear
NORAD/internal identifier unclear
RF frequency unclear
Polarization unclear
Station has not confirmed capability
No pass window
No demodulator/baseband support confirmation
No station contact or test time
```

### Yellow — Ready with Risk

```text
TLE available but station has not independently confirmed pass
RF frequency confirmed but polarization not fully mapped
Station confirms frequency but not all frame/CRC details
Signal-only test planned without data file output
Low-elevation pass selected
```

### Green — Ready

```text
Satellite identity confirmed
TLE / OMM confirmed
Pass window confirmed
Station availability confirmed
RF frequency confirmed
Polarization confirmed
Demodulator/baseband mapping confirmed
Test goal confirmed
Station pre-pass checklist confirmed
Owner approval recorded
```

---

## 7. Recommended UG-01 test strategy

Because this is a new station/satellite combination, the first test should not aim too broadly.

Recommended test stages:

### Stage 1 — Signal detection

Goal:

```text
Confirm UG-01 can see RF signal during the pass.
```

Required evidence:

```text
AOS / LOS
Max elevation
RF frequency
Polarization path
RF detected yes/no
Signal level / spectrum screenshot if available
```

### Stage 2 — Carrier / demod lock

Goal:

```text
Confirm carrier / PLL / demod lock.
```

Required evidence:

```text
PLL lock status
Demod lock status
Bit sync status
Configured modulation
Configured bit rate
Mapping / I/Q status
```

### Stage 3 — Frame sync

Goal:

```text
Confirm valid frame synchronization.
```

Required evidence:

```text
Sync word
Frame length
Descrambling
CRC / LDPC
Frame sync lock
Good frames / bad frames
```

### Stage 4 — Output and transfer

Goal:

```text
Confirm file output and transfer path.
```

Required evidence:

```text
Output file generated yes/no
File name
File size
Transfer destination
Delivery confirmation
```

---

## 8. Questions to send now

### To satellite/operator side

```text
For the upcoming UG-01 Uganda station signal test, please confirm the following:

1. Are 68378 and 68377 NORAD IDs for SVN2-05 and SVN2-06, or internal satellite/operator codes?
2. Please provide the latest TLE / OMM for both satellites.
3. Please confirm the final X-band downlink configuration for the test:
   - RF center frequency
   - Polarization / channel
   - Modulation
   - Bit rate
   - Mapping
   - Sync word
   - Frame length
   - Scrambling / descrambling
   - CRC / LDPC / RS settings
4. Is the first UG-01 test only for signal detection, or should we also attempt demod lock / frame sync / data file output?
5. Please provide 2–4 candidate UTC test windows, or confirm that UG-01 may calculate pass windows using the provided TLE.
```

### To UG-01 station side

```text
For the upcoming radar satellite signal test, please confirm the following:

1. Can UG-01 support X-band reception around the target RF frequency once confirmed by the satellite side?
2. Which RF path and polarization options will be used?
3. What baseband/demodulator system will be used for this test?
4. What is the supported maximum data rate for this configuration?
5. Can the station support the required modulation, coding and frame-sync configuration once provided?
6. Can you provide pre-pass configuration screenshots and post-pass lock-stage screenshots?
7. For the first test, should we define success as RF signal detected, demod lock, frame sync, or file output?
```

---

## 9. Platform record to create

GS LinkOps AI should create:

```text
MissionProfile: UG01-RADAR-SIGNAL-TEST-001
Station: UG-01
Satellites: SVN2-05 / SVN2-06 pending identity confirmation
Mission objective: signal detection first, then demod/frame test if readiness permits
Status: Needs Satellite Confirmation + Needs Station Mapping
Risk: Red until TLE, RF frequency, polarization and station demod support are confirmed
```

---

## 10. Report to generate after test

After each UG-01 attempt, the platform must generate:

```text
UG-01 Radar Signal Test Attempt Report
```

Required sections:

```text
Mission summary
Satellite and TLE confirmation
Station capability summary
Pass window and elevation
Confirmed configuration
Execution timeline
RF detected status
PLL / demod lock status
Frame sync status
Good frames / bad frames
Output / transfer result
Failure or success conclusion
Lessons learned / Error notebook
Next test recommendation
```

---

## 11. Immediate implementation conclusion

This UG-01 test should become the first mission where GS LinkOps AI applies the full chain:

```text
Resource merge
→ readiness gate
→ mission profile
→ station adapter
→ test attempt log
→ failure/success report
→ lessons learned
```

The work starts from zero, but the operating discipline must start from the first UG-01 test.
