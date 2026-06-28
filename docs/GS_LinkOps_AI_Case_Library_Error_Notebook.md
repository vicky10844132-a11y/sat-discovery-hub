# GS LinkOps AI — Case Library / Error Notebook

## 1. Core idea

The platform needs a “错题本”.

Every failed test, configuration conflict, unclear station response, missing TLE, failed lock, bad pass, failed transfer or confusing report should become one structured case.

The purpose is not to blame anyone. The purpose is to make the next mission better.

```text
Failure → structured case → root-cause hypothesis → confirmation checklist → rule update → next mission avoids the same mistake
```

This is how the platform learns.

---

## 2. Why this matters

Without a case library, the owner only sees repeated problems:

```text
Satellite operator schedules again.
Ground station tests again.
The task fails again.
Nobody can clearly say where the failure happened.
```

With a case library, every failure becomes reusable knowledge:

```text
Which station?
Which satellite?
Which pass?
Which configuration version?
Which parameter conflicted?
Which layer failed?
What evidence exists?
Who should confirm?
What should be changed next time?
```

---

## 3. Case categories

The case library should classify cases by failure layer:

```text
Orbit / TLE / designation issue
Pass-window / elevation risk
Station availability / antenna scheduling issue
RF frequency issue
Polarization issue
IF / downconversion issue
Demodulation / bit rate / mapping issue
I/Q polarity / phase rotation issue
Frame synchronization issue
Descrambling / CRC / LDPC / RS issue
File output issue
Transfer / delivery issue
Reporting issue
Billing / settlement issue
Commercial communication issue
```

---

## 4. Case object structure

Each case should include:

```text
Case ID
Case title
Date
Satellite
Station
Mission / pass
Payload type
Source materials
Configuration version used
Observed result
Failure layer
Evidence
Missing information
Likely cause
Confirmed cause, if known
Questions to station
Questions to satellite operator
Questions to owner
Next action
Rule to add to platform
Report generated
Case status
```

Case status:

```text
Draft
Under Review
Waiting for Station
Waiting for Operator
Root Cause Confirmed
Rule Added
Closed
Reopened
```

---

## 5. Example case: SG-01 optical satellite test failure

```text
Case ID: CASE-SG01-OPTICAL-TEST-001
Case title: SG-01 optical satellite X-band reception failed after three attempts
Station: SG-01 Singapore Equatorial Ground Station
Satellite: optical EO satellite / exact mapping to be confirmed
Result: three unsuccessful test attempts
Failure status: root cause not confirmed
```

Known issues:

```text
TLE / designation was not fully closed.
At least one pass had very low maximum elevation.
RF frequency had multiple observed values.
IF frequency had multiple observed values.
Bit rate had multiple observed values.
Mapping had multiple observed values.
CRC preset had multiple observed values.
Station-side configuration was best-effort mapped from operator-provided parameters.
Lock-stage result was not fully captured in a structured way.
```

Platform rule learned:

```text
Do not mark a mission as Confirmed unless satellite identity, TLE, pass window, RF frequency, polarization, IF, bit rate, mapping, descrambling, CRC/LDPC and station confirmation are all closed.
```

---

## 6. How a case becomes a rule

Every case should end with a rule.

Example:

```text
Problem: TLE was unclear.
Rule: if TLE or designation is missing, mission status must remain Needs Orbit Confirmation.
```

```text
Problem: pass elevation was too low.
Rule: if max elevation < 10°, AI marks the pass as High Risk; if another pass > 20° exists, recommend the higher pass.
```

```text
Problem: RF frequency has two versions.
Rule: if critical RF/IF/bit-rate conflicts exist, mission cannot be Confirmed.
```

```text
Problem: station says “failed” but no stage is recorded.
Rule: station feedback must be collected by lock stage: RF detected, PLL lock, demod lock, frame sync, good frames, output file.
```

---

## 7. Case library workflow

```text
1. Test or mission fails.
2. Owner uploads screenshots / chat / station response.
3. AI creates a draft case.
4. Platform extracts evidence.
5. AI classifies likely failure layer.
6. Platform generates questions for station and operator.
7. Owner collects answers.
8. Case is updated.
9. Platform creates or updates rules.
10. Next mission uses the new rule automatically.
```

---

## 8. Owner Console module

The Owner Console should include a new page:

```text
Case Library / 错题本
```

Page functions:

```text
Add Case
Upload screenshots / notes
Link case to satellite / station / mission
Select failure layer
Show AI diagnosis
Generate questions
Generate failure report
Create platform rule
Mark case closed
Search similar cases
```

---

## 9. Similar case search

The case library should support similarity search.

Examples:

```text
Find all cases involving SG-01.
Find all cases where PLL was unlocked.
Find all cases where RF frequency conflicted.
Find all cases where TLE was missing.
Find all cases where max elevation was below 10°.
Find all cases where good frames were 0.
Find all optical X-band failures.
```

This is how historical mistakes become practical guidance.

---

## 10. Report outputs

From each case, the platform should generate:

```text
Internal failure report
Station question list
Satellite operator question list
Owner decision memo
Next-test readiness checklist
Case closure summary
```

---

## 11. Learning loop

The learning loop is:

```text
Mission → Attempt → Failure → Case → Rule → Better Mission Profile → Better Test → Updated Case Library
```

This is the practical learning mechanism of GS LinkOps AI.

---

## 12. Product conclusion

GS LinkOps AI should not only execute missions. It should learn from every failed mission.

The case library is the platform's memory.

For the owner, this means:

```text
The same confusion should not happen twice.
The same missing field should not be missed twice.
The same station-specific configuration issue should become a reusable adapter rule.
The same failed test should become a better checklist next time.
```

This is how the owner and the platform grow faster together.
