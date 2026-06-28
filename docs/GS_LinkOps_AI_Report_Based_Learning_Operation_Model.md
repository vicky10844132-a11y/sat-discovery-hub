# GS LinkOps AI — Report-Based Learning Operation Model

## 1. Core principle

The platform should operate through reports.

Every mission, test, failure, delivery and settlement should produce a structured report. The report is not only a document for communication. It is also the platform's learning record.

The “错题本” should be embedded inside the report system.

```text
Mission → Report → Lessons Learned → Platform Rule → Better Next Mission
```

This makes the platform rigorous and operational.

---

## 2. What must be learned clearly

The platform and the owner need to learn the full downlink chain:

```text
Satellite identity
Orbit / TLE / OMM
Pass window
Station capability
Station availability
RF chain
Polarization
IF / downconversion
Demodulation
Frame synchronization
Decode / descrambling / CRC / LDPC
File output
Data transfer
Report
Billing / settlement
Case learning
```

The important thing is not to memorize technical terms. The important thing is to know which layer can fail and what evidence proves that layer passed or failed.

---

## 3. Important and failure-prone layers

### A. Satellite identity and orbit

Common issues:

```text
Satellite name differs from NORAD name.
Internal code is mistaken for NORAD ID.
TLE is missing or stale.
TLE epoch is not checked.
Operator provides a window but station uses different orbit data.
```

Report must record:

```text
Satellite name
Internal code
NORAD ID or designation
TLE line 1 / line 2 or OMM source
TLE epoch
TLE source
```

### B. Pass window

Common issues:

```text
AOS / LOS time zone confusion.
Low maximum elevation.
Station elevation mask or blocked zone.
Station schedule conflict.
```

Report must record:

```text
AOS
LOS
Max elevation
Time zone
Station schedule confirmation
Risk score
```

### C. RF and polarization

Common issues:

```text
Frequency version mismatch.
Left/right circular vs LHCP/RHCP mapping unclear.
Satellite channel number not mapped to station RF path.
Wrong RF path selected.
```

Report must record:

```text
RF center frequency
Polarization
Channel
Station RF path
Evidence screenshot
Confirmed by whom
```

### D. IF and demodulation

Common issues:

```text
IF frequency mismatch.
Bit rate mismatch.
Modulation mismatch.
Gray mapping mismatch.
I/Q polarity mismatch.
Phase rotation mismatch.
Matched filter mismatch.
```

Report must record:

```text
IF frequency
Modulation
Bit rate
Mapping
I/Q polarity
Phase rotation
Matched filter
Demodulator screenshot
```

### E. Frame and decoding

Common issues:

```text
Sync word wrong or mask wrong.
Frame length mismatch.
Descrambling ON/OFF mismatch.
CRC initial value mismatch.
LDPC/RS setting mismatch.
```

Report must record:

```text
Sync word
Frame length
Descrambling
CRC poly / preset
LDPC / RS
Good frames / bad frames
Frame-sync status
```

### F. Output and transfer

Common issues:

```text
Signal received but file not generated.
File generated but not transferred.
Transfer path not ready.
Receiver cannot access file.
Checksum or manifest missing.
```

Report must record:

```text
Output file path
File generated yes/no
File size
Transfer method
Recipient
Checksum / manifest
Delivery confirmation
```

---

## 4. Required report types

The platform should generate these standard reports:

```text
1. Mission Readiness Report
2. Configuration Comparison Report
3. Pass Risk Report
4. Test Attempt Report
5. Failure Diagnosis Report
6. Reception Success Report
7. Data Transfer Report
8. Billing Recommendation Report
9. Lessons Learned / Error Notebook Section
```

The owner should not need to write these manually. The platform should draft them from structured records.

---

## 5. One report per mission

Every mission should have one complete mission report.

Report sections:

```text
Mission summary
Satellite-side input
Station-side input
Capability match
Pass window
Confirmed configuration
Execution timeline
Lock-stage results
Data output / transfer
Failure or success conclusion
Questions / missing information
Lessons learned
Next mission rule update
Billing recommendation
Owner decision
```

This report becomes the final record of the task.

---

## 6. Error notebook inside the report

Every report should include a section:

```text
Lessons Learned / 错题本
```

This section should contain:

```text
What went wrong?
Which layer failed?
What evidence supports the conclusion?
Which parameter was missing or conflicting?
Which party must confirm next time?
What platform rule should be added?
What checklist item should be mandatory next time?
```

Example rule:

```text
If TLE is missing or satellite ID is uncertain, mission cannot be Confirmed.
```

Example rule:

```text
If RF frequency, IF, bit rate or polarization conflicts remain, mission cannot be Confirmed.
```

Example rule:

```text
Station feedback must include RF detected, PLL lock, demod lock, frame sync, good frames and file output status.
```

---

## 7. How reports make the platform operational

The platform can operate if each mission follows this loop:

```text
Resource intake
→ AI extraction
→ Owner review
→ Missing/conflict checklist
→ Confirmation from satellite side / station side
→ Mission profile confirmed
→ Execution record
→ Report generated
→ Lessons learned extracted
→ Platform rules updated
```

This creates a disciplined workflow.

---

## 8. Owner role

The owner does not need to understand all technical parameters.

The owner only needs to decide:

```text
Is the mission ready?
Which party must answer missing questions?
Can this configuration be confirmed?
Can the report be sent?
Can the billing be issued?
```

The AI and platform handle:

```text
Field extraction
Parameter comparison
Risk classification
Question generation
Report drafting
Rule learning
```

---

## 9. Platform dependency on AI

The platform should be usable by a non-technical owner because AI performs the interpretation layer.

AI responsibilities:

```text
Read screenshots and documents.
Convert them into structured fields.
Compare satellite-side and station-side parameters.
Explain conflicts in business language.
Generate questions for each party.
Draft reports.
Extract lessons learned.
Update platform rules.
```

Human responsibilities:

```text
Approve records.
Send questions.
Confirm answers.
Approve mission execution.
Approve report and billing.
```

---

## 10. Implementation priority

To make the platform truly run, build in this order:

```text
1. Mission Report Template
2. Configuration Comparison table
3. Test Attempt Log
4. Failure Diagnosis table
5. Lessons Learned section
6. Rule extraction from report
7. Owner Console report generator
8. Case Library search
```

---

## 11. Product conclusion

The platform becomes valuable when every task leaves a structured report and every report teaches the platform something.

The end goal is:

```text
No mission without a report.
No failure without a lesson.
No lesson without a rule.
No repeated mistake without warning.
```

This is how GS LinkOps AI becomes operational and grows with the owner.
