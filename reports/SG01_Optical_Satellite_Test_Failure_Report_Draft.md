# SG-01 Optical Satellite X-band Reception Test Failure Report — Draft

Report type: AI-generated technical/business failure analysis draft  
Prepared for: GS LinkOps AI platform record  
Status: Draft for owner review; not for external release until confirmed  
Station: SG-01 Singapore Equatorial Ground Station  
Mission type: Optical satellite X-band downlink reception test  
Reported result: Three test attempts were unsuccessful  

---

## 1. Executive Summary

Based on the available chat records, station screenshots, parameter screenshots and operator interface materials, the SG-01 test should be understood as an optical satellite X-band downlink reception compatibility test.

The test failed three times. The currently available evidence is not sufficient to assign a single confirmed root cause. However, the evidence shows several unresolved risk areas:

1. Orbit / TLE / designation code was not fully closed at the time of testing.
2. At least one candidate pass had very low maximum elevation.
3. The station-side configuration was a best-effort mapping of satellite/operator parameters into SG-01 HDR/baseband settings.
4. Multiple parameter versions existed for RF frequency, IF frequency, bit rate, mapping, CRC preset and descrambling.
5. Screenshots show several lock statuses as unlocked or searching, suggesting failure may have occurred before stable demodulation or frame synchronization.

Current conclusion:

```text
The failure is most likely not caused by a single issue. It is likely a combination of orbit/window uncertainty, configuration-version mismatch and station equipment parameter mapping uncertainty.
```

Recommended next step:

```text
Before any further SG-01 test, both satellite-side and station-side resources must be merged into one confirmed configuration checklist. The next test should only proceed after TLE, pass window, RF frequency, polarization, IF, bit rate, mapping, CRC/descrambling and expected lock-stage checklist are all confirmed.
```

---

## 2. Test Background

The available records indicate the following workflow:

```text
Satellite/operator side provided configuration parameters.
The owner forwarded these parameters to the SG-01 station side.
SG-01 attempted to input or map these parameters into its HDR/baseband system.
The station side asked whether the parameters were for X-band reception.
The station side requested satellite TLE or designation code because it could not locate the satellite by SVN naming in NORAD list.
The station side scheduled two test timings and confirmed antenna scheduling.
The test was attempted three times but did not succeed.
```

Important correction:

```text
The tested satellite was optical EO, not SAR/radar.
Therefore SAR-specific assumptions should not be applied to this test unless confirmed by the satellite operator.
```

---

## 3. Available Evidence

### 3.1 Station and mission context

```text
Station: SG-01 Singapore Equatorial Ground Station
Downlink band: X-band
Station X-band downlink capability: 8000–8400 MHz from SG-01 resource material
Mission nature: optical satellite X-band reception test
```

### 3.2 Station pass scheduling evidence

The station side scheduled two test timings:

```text
29 Jan, 05:05 UTC
29 Jan, 06:36 UTC
```

From the station screenshot:

```text
Pass 1:
AOS: 29/01/2026 05:05:19.722
LOS: 29/01/2026 05:11:45.945
Maximum elevation: 5.05°

Pass 2:
AOS: 29/01/2026 06:36:38.887
LOS: 29/01/2026 06:47:26.885
Maximum elevation: 35.33°
```

AI assessment:

```text
Pass 1 is high-risk because maximum elevation is only about 5°.
Pass 2 is the better test candidate because maximum elevation is about 35°.
```

### 3.3 TLE / designation evidence

Station side asked:

```text
Could you provide the satellite TLE? Or designation code? We can't find SVN1 in NORAD's list.
```

This means the station side did not have a fully closed satellite orbit/designation mapping at that moment.

Platform interpretation:

```text
TLE or confirmed designation code is a mandatory prerequisite for reliable pass calculation and antenna scheduling.
```

---

## 4. Parameter Versions Observed

The available material shows multiple configuration values. These must be treated as separate configuration versions rather than one confirmed final setting.

| Parameter | Version A | Version B | Risk |
|---|---|---|---|
| RF center frequency | 8212 MHz | 8220 MHz | Must confirm final RF frequency |
| IF frequency | 1200 MHz | 1270 MHz | Must confirm station IF mapping |
| Bit rate | 800 Mbps | 900 Mbps | Must confirm final data rate |
| Mapping | Gray2 | Gray1 | Can affect demodulation success |
| CRC preset | 14839 | 25500 | Equipment-dependent mapping issue |
| Descrambling | ON | OFF | Can affect frame recovery |
| Ambiguity resolution | ON | OFF | Can affect frame sync / polarity resolution |
| Polarization | Channel 1 left circular / Channel 2 right circular from interface material | LHCP/RHCP station setting visible | Must confirm channel-to-station mapping |

Important note:

```text
Different satellites can have different parameters. The existence of different values is not automatically an error. The error risk appears when the final parameter version for a specific satellite/pass is not confirmed and frozen before testing.
```

---

## 5. Failure Diagnosis by Layer

The current evidence should be classified by possible failure layer.

### 5.1 Orbit / pass-window layer

Risk indicators:

```text
Station side requested TLE or designation code.
SVN naming could not be found directly in NORAD list.
One pass had only 5.05° max elevation.
```

Possible impact:

```text
Antenna may not point to the correct object at the correct time, or link margin may be too low during a low-elevation pass.
```

Diagnosis status:

```text
Not closed. Requires TLE/designation confirmation and pass report for each of the three attempts.
```

### 5.2 RF layer

Risk indicators:

```text
8212 MHz and 8220 MHz both appear in the materials.
LHCP/RHCP or left/right circular channel mapping was not clearly frozen in the test record.
```

Possible impact:

```text
Wrong RF frequency or wrong polarization can prevent signal lock or significantly reduce signal strength.
```

Diagnosis status:

```text
Not closed. Requires final RF frequency and polarization used in each attempt.
```

### 5.3 IF / demodulation layer

Risk indicators:

```text
IF values differ between screenshots: 1200 MHz and 1270 MHz.
Bit rate values differ: 800 Mbps and 900 Mbps.
Mapping differs: Gray1 and Gray2.
Screenshots show unlocked states in demodulator/decoder areas.
```

Possible impact:

```text
Incorrect IF, bit rate, mapping, I/Q polarity or demodulator parameters can prevent PLL/carrier lock, bit sync or demod lock.
```

Diagnosis status:

```text
Likely risk area, but cannot be confirmed without per-attempt lock-stage logs.
```

### 5.4 Frame synchronization / decode layer

Risk indicators:

```text
Sync word appears as 1ACFFC1D.
Frame length appears as 1024 bytes.
LDPC 7/8 appears in multiple screenshots.
CRC preset differs between 14839 and 25500.
Descrambling differs between ON and OFF.
Frame synchronizer status appears as Search in at least one screenshot.
Good frames / bad frames appear as 0 in the station screenshot.
```

Possible impact:

```text
Even if RF or demodulation succeeds, incorrect frame synchronization, descrambling, CRC or LDPC mapping can prevent valid frames or data file generation.
```

Diagnosis status:

```text
High-priority check area if RF/carrier lock was achieved in any attempt.
```

---

## 6. Probable Root-Cause Range

Based on current evidence, the most likely root-cause range is:

```text
Primary probable cause group:
Configuration-version mismatch between satellite/operator parameters and SG-01 station HDR/baseband mapping.

Secondary probable cause group:
Incomplete orbit/designation/TLE closure before scheduling.

Additional contributing factor:
Low elevation for at least one candidate pass, causing weak link margin and high reception risk.
```

The report cannot honestly state one confirmed root cause because the available data does not include complete per-attempt logs.

---

## 7. What Should Have Been Confirmed Before Testing

For each satellite and each pass, the following should be frozen before the station attempts reception:

| Category | Required confirmation |
|---|---|
| Satellite identity | satellite name, internal code, NORAD ID or operator designation |
| Orbit | latest TLE/OMM, epoch, source, validity |
| Pass | AOS, LOS, max elevation, UTC time, station name |
| RF | RF center frequency, polarization, channel number |
| IF | IF frequency and downconversion mapping |
| Demodulation | modulation, bit rate, mapping, I/Q polarity, phase rotation |
| Coding | LDPC, RS, CRC, descrambling, randomizer |
| Frame sync | sync word, frame length, mask, ambiguity setting |
| Output | output mode, merged/separate, file generation path |
| Transfer | delivery path, SFTP/FTP/server, recipient |
| Responsibility | station confirmation person, satellite/operator confirmation person, owner approval |

---

## 8. Required Information to Complete Final Failure Analysis

To identify why the three attempts failed, request the following from SG-01 / station side:

```text
1. For each of the three attempts, provide AOS / LOS / max elevation.
2. Was RF signal detected in each attempt?
3. Was PLL / carrier lock achieved?
4. Was bit sync or demod lock achieved?
5. Was frame sync achieved?
6. Were good frames greater than 0?
7. What RF frequency was actually used: 8212 MHz, 8220 MHz or another value?
8. What polarization was actually used: LHCP, RHCP, left circular, right circular?
9. What IF was actually used: 1200 MHz, 1270 MHz or another value?
10. What bit rate was actually used: 800 Mbps, 900 Mbps or another value?
11. What mapping was actually used: Gray1 or Gray2?
12. What CRC preset was actually used: 14839 or 25500?
13. Was descrambling ON or OFF?
14. Did the station produce any output file?
15. Which layer does the station believe failed: RF, demod, frame sync or file output?
```

Request from satellite/operator side:

```text
1. Confirm the optical satellite identity used in the test.
2. Confirm satellite code and NORAD/designation mapping.
3. Provide the TLE/OMM used for the test date.
4. Confirm X-band frequency and polarization.
5. Confirm final demodulation and coding settings for SG-01.
6. Confirm whether 14839 or 25500 should be used for this equipment chain.
```

---

## 9. Recommended Next Test Procedure

Before another SG-01 test, use this controlled sequence:

```text
Step 1: Confirm satellite identity and TLE.
Step 2: Platform calculates or imports pass windows.
Step 3: Select pass with max elevation preferably above 20°.
Step 4: Freeze RF frequency and polarization.
Step 5: Freeze IF, bit rate, modulation, mapping and I/Q polarity.
Step 6: Freeze frame sync, descrambling, CRC and LDPC.
Step 7: Station confirms configuration screenshot before pass.
Step 8: During pass, record RF/PLL/demod/frame/good-frame status.
Step 9: After pass, station provides execution log and screenshot.
Step 10: Platform generates success/failure report by layer.
```

---

## 10. Platform Function Requirement

This failure report confirms that GS LinkOps AI must include:

```text
1. Resource Merge View
   Combine satellite-side and ground-station-side information.

2. Configuration Version Compare
   Compare operator-provided config, station-mapped config, alternative config and confirmed config.

3. Test Attempt Log
   Record every test attempt, pass, lock stage, frame status and station note.

4. Failure Diagnosis
   Classify failure by orbit, RF, demod, frame sync, file output or transfer.

5. Confirmation Checklist
   Force unresolved parameters to be confirmed before final mission execution.

6. Report Generator
   Generate a structured failure report for owner review.
```

---

## 11. Draft Conclusion

The SG-01 optical satellite test failed three times, but the available evidence does not support a single confirmed root cause. The most likely issue is incomplete closure between satellite-side parameters and SG-01 station-side HDR/baseband configuration, compounded by TLE/designation uncertainty and at least one low-elevation pass.

For future tests, the platform should not allow a mission to move from Configuration Draft to Configured until satellite identity, TLE, pass window, RF frequency, polarization, IF frequency, bit rate, mapping, CRC/descrambling and frame-sync parameters are all confirmed by the relevant party.

This is exactly the operational gap GS LinkOps AI is designed to solve.
