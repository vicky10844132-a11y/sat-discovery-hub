# GS LinkOps AI — Comprehensive Function Map

## 1. Why the platform must be comprehensive from the beginning

The owner is correct: if the platform is designed too narrowly at the beginning, adding core functions later will be difficult.

The platform does not need to implement every advanced function on day one, but the architecture must reserve the right modules, data objects, statuses and interfaces from the beginning.

Core principle:

```text
Build light now, but design complete from the beginning.
```

This means:

```text
Some modules can start as manual records.
Some modules can start as AI-assisted drafts.
Some modules can later connect to ST-GI AMS or other station systems.
But the module boundaries and data fields must exist early.
```

---

## 2. Final Product Positioning

GS LinkOps AI is:

```text
An owner-side satellite downlink dispatch center.
```

It handles:

```text
Demand intake
Resource aggregation
Ground station matching
Mission readiness checking
Task dispatch
Reception status tracking
Delivery confirmation
Report generation
Billing recommendation
Lessons learned
External system integration
```

It does not handle:

```text
Satellite command
Direct antenna control
Raw X-band data storage
Heavy payload data archive
Image processing
```

---

## 3. Complete Functional Modules

### 1. Demand Center

Purpose:

```text
Receive and manage satellite-side/customer-side demands.
```

Functions:

```text
Create demand
Classify demand type
Record requester
Record satellite/operator
Record required service
Record desired time window
Record data delivery recipient
Record priority and commercial rule
Track demand lifecycle
```

Statuses:

```text
New
Validated
Missing Information
Matched
Assigned
In Execution
Delivered
Reported
Billable
Closed
Cancelled
```

---

### 2. Satellite Resource Center

Purpose:

```text
Maintain satellite-side resources and receiving parameters.
```

Functions:

```text
Satellite profile
Operator profile
Satellite identifiers
NORAD / internal code / interface code
TLE / OMM metadata
Payload type
RF parameters
Polarization
Modulation
Bit rate
Frame / coding parameters
Authorization record
Historical mission record
```

---

### 3. Ground Station Resource Center

Purpose:

```text
Maintain partner ground-station capabilities.
```

Functions:

```text
Station profile
Location
Antenna
Frequency range
Polarization
G/T
Minimum elevation
Max data rate
Demodulator/baseband capability
Booking method
Data transfer method
Contact person
Cost rule
Availability rule
Historical performance
```

---

### 4. Station Adapter Library

Purpose:

```text
Translate each station's own terminology and equipment settings into platform-standard fields.
```

Functions:

```text
Station-specific field mapping
RF path mapping
Polarization mapping
Baseband setting mapping
CRC / LDPC / frame-sync mapping
Screenshot interpretation notes
Known station limitations
Known successful configurations
Known failure patterns
```

---

### 5. Orbit / Pass Window Center

Purpose:

```text
Manage TLE/OMM and pass windows.
```

Functions:

```text
TLE intake
TLE validation
TLE epoch check
Pass calculation
Pass import from station/operator
AOS / LOS / max elevation
Time zone normalization
Station visibility comparison
Low-elevation risk flag
Candidate pass ranking
```

---

### 6. Capability Match Engine

Purpose:

```text
Match demand and satellite requirements with station capability.
```

Functions:

```text
Frequency range check
Polarization check
Data rate check
Modulation check
Coding/frame support check
Station availability check
Cost/risk comparison
Best station recommendation
Backup station recommendation
Unsupported station warning
```

---

### 7. Mission Profile Builder

Purpose:

```text
Create the executable mission profile for one satellite + one station + one pass.
```

Functions:

```text
Build mission profile
Merge satellite-side input
Merge station-side capability
Record final configuration
Record fallback configuration
Record owner approval
Record operator confirmation
Record station confirmation
Version mission profile
```

Statuses:

```text
Draft
Needs Satellite Confirmation
Needs Station Mapping
Needs Owner Review
Confirmed
Executed
Closed
```

---

### 8. Configuration Comparison Engine

Purpose:

```text
Identify missing, conflicting, unsupported and confirmed parameters.
```

Functions:

```text
Compare operator-provided config
Compare station-mapped config
Compare confirmed config
Show parameter conflicts
Show missing fields
Show unsupported fields
Generate question list
Block confirmation if critical conflicts remain
```

---

### 9. Readiness Gate

Purpose:

```text
Prevent avoidable failed missions.
```

Functions:

```text
Green / Yellow / Red readiness scoring
Critical missing item detection
Risk warning
Owner approval requirement
Execution block when Not Ready
First-pass success checklist
```

---

### 10. Dispatch / Booking Center

Purpose:

```text
Dispatch confirmed missions to ST-GI AMS or partner ground stations.
```

Functions:

```text
Prepare booking request
Send or manually export booking request
Track booking response
Record accepted/rejected/pending
Track station schedule
Record station confirmation
Support future RESTful/MQ integration
```

---

### 11. Execution Monitor

Purpose:

```text
Track pass execution and reception status.
```

Functions:

```text
Antenna scheduled
Pass started
RF detected
Carrier / PLL locked
Demod locked
Frame sync locked
Good frames / bad frames
File generated
Execution notes
Screenshots/logs record
```

---

### 12. Data Delivery Tracker

Purpose:

```text
Track the data path without storing heavy payload data.
```

Functions:

```text
Temporary storage reference
SFTP availability
Transfer recipient
File manifest reference
Checksum reference
Transfer status
Recipient confirmation
Delivery failure note
```

Boundary:

```text
The platform stores delivery metadata, not heavy payload data.
```

---

### 13. Report Center

Purpose:

```text
Generate one report per mission.
```

Report types:

```text
Mission Readiness Report
Configuration Comparison Report
Pass Risk Report
Test Attempt Report
Failure Diagnosis Report
Reception Success Report
Data Transfer Report
Billing Recommendation Report
Mission Closure Report
```

Each mission must generate a final report.

---

### 14. Failure Diagnosis / Lessons Learned

Purpose:

```text
Convert failures into reusable rules.
```

Functions:

```text
Failure layer classification
Evidence summary
Missing information list
Root-cause hypothesis
Question generation
Next-test recommendation
Lessons learned section
Rule update
Similar case search
```

---

### 15. Billing / Settlement Center

Purpose:

```text
Recommend billable status based on execution and delivery confirmation.
```

Functions:

```text
Cost rule
Price rule
Station cost
Owner margin
Delivery confirmation check
Billable decision
Invoice draft metadata
Settlement status
```

Billing statuses:

```text
Not Billable
Pending Delivery Confirmation
Billable
Invoice Drafted
Invoiced
Settled
Cancelled
```

---

### 16. Partner / ST-GI Integration Center

Purpose:

```text
Prepare future integration with ST-GI AMS and other partner stations.
```

Functions:

```text
AMS profile
VPN status
RESTful/MQ interface record
Availability window exchange
Booking request exchange
TLE exchange
Pass status exchange
SFTP retrieval record
Integration audit log
Manual / AI Assist / Connected mode
```

---

### 17. Communication Center

Purpose:

```text
Generate and track external communications.
```

Functions:

```text
Question list to satellite operator
Question list to ground station
Booking request email
Status follow-up email
Delivery confirmation email
Report email
Billing email
Email draft approval
```

---

### 18. AI Inspector / Copilot

Purpose:

```text
Help the non-technical owner operate the platform.
```

Functions:

```text
Read screenshots/documents
Extract parameters
Explain conflicts
Recommend station
Generate questions
Draft reports
Draft emails
Classify failures
Update lessons learned
Warn repeated mistakes
```

---

### 19. Audit / Governance Center

Purpose:

```text
Make the dispatch process traceable and professional.
```

Functions:

```text
Who created demand
Who approved mission
Who confirmed configuration
Who confirmed delivery
What changed
When changed
Source evidence
Report archive
Decision log
```

---

### 20. System Settings

Purpose:

```text
Manage platform configuration and future extensions.
```

Functions:

```text
User roles
Company profile
Partner profiles
Currency
Cost rules
Report template settings
AI mode settings
Integration settings
Backup/export settings
```

---

## 4. MVP vs Future Implementation

The platform should include all module names and data concepts from the beginning.

But implementation can be staged.

### MVP — manual but complete structure

```text
Demand Center
Resource Centers
Mission Profile Builder
Readiness Gate
Dispatch status
Execution status
Report Center
Billing status
AI Inspector
```

### Phase 2 — stronger intelligence

```text
Configuration Comparison
Failure Diagnosis
Lessons Learned
Station Adapter Library
Case search
```

### Phase 3 — integration

```text
ST-GI AMS interface
RESTful/MQ exchange
SFTP retrieval tracking
VPN/integration audit
```

### Phase 4 — operational scale

```text
Multi-station dispatch
Commercial dashboard
Automated reports
Partner portals
Advanced analytics
```

---

## 5. Product Rule

```text
Do not remove modules just because they are not fully automated on day one.
Keep the module in the system as manual / draft / placeholder.
Automation can come later.
```

This prevents future restructuring.

---

## 6. Product Conclusion

GS LinkOps AI should be designed as a complete satellite downlink dispatch platform from the beginning.

The correct strategy is:

```text
Complete architecture now.
Lightweight implementation now.
Automation and integration later.
```

This makes the system future-proof while still allowing the owner to start operating immediately.
