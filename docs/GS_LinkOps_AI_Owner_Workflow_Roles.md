# GS LinkOps AI — Owner Workflow Roles

## 1. Updated Operating Principle

The best operating model is:

```text
Front-end task arrangement: mainly manual
AI: inspection, drafting, reporting, billing recommendation, resource structuring
Owner: final confirmation, signature, external email/send-out
```

AI should not replace the owner in sensitive front-end task decisions. AI should reduce repetitive work, check mistakes, prepare documents, and make recommendations.

---

## 2. Recommended Division of Work

### A. Resource Onboarding

Best mode:

```text
AI prepares / owner confirms
```

Workflow:

```text
Owner provides raw information
→ AI extracts fields
→ AI flags missing/uncertain fields
→ AI creates draft resource record
→ Owner checks and confirms
→ Platform saves approved resource
```

AI can handle:

```text
Extract company name, contact, station name, satellite name
Structure coordinates, frequency, band, polarization, data rate
Identify missing TLE or missing authorization
Prepare import-ready resource record
```

Owner must confirm:

```text
Authorization status
Commercial relationship
Sensitive parameters
Whether the resource should be used for real missions
```

---

### B. Front-end Mission / Task Arrangement

Best mode:

```text
Owner arranges / AI checks
```

Workflow:

```text
Owner selects task requirement, satellite, station, approximate time and business purpose
→ AI checks missing fields, conflict, risk and recommended pass
→ Owner decides whether to create or proceed
```

AI can handle:

```text
Check TLE completeness
Check station/satellite compatibility
Check missing configuration
Recommend better station/pass
Warn about risk
Prepare task draft
```

Owner must decide:

```text
Whether to accept the task
Which station to use
Whether this is test or commercial mission
Whether to notify partner/customer
Whether to proceed with formal operation
```

---

### C. Configuration and Reception

Best mode:

```text
Manual confirmation / AI inspection
```

AI can handle:

```text
Check if frequency, polarization, modulation, coding, data rate and frame format are complete
Compare station capability against satellite parameters
Classify RF/reception result
Explain failure possibility
```

Owner or authorized partner must confirm:

```text
Final station configuration
Manufacturer confirmation
Station execution result
Whether reception evidence is acceptable
```

---

### D. Transfer and Delivery

Best mode:

```text
AI prepares / owner confirms
```

AI can handle:

```text
Prepare transfer checklist
Check manifest, file size, checksum and destination path
Draft delivery confirmation note
Remind temporary retention/deletion
```

Owner must confirm:

```text
Data was delivered
Recipient confirmed receipt
Sensitive path can be shared
Transfer status can be marked complete
```

---

### E. Reports

Best mode:

```text
AI generates / owner reviews and approves
```

AI can handle:

```text
Mission report
Transfer handover report
Billing statement
Failure analysis report
Customer-facing summary
Manufacturer-facing summary
Internal operation summary
```

Owner must confirm:

```text
Report wording is appropriate
No sensitive information is exposed
Report can be signed or sent
```

---

### F. Billing and Settlement

Best mode:

```text
AI calculates and recommends / owner confirms and signs
```

AI can handle:

```text
Determine billable, hold, partial billable, test billable, not billable
Calculate client price, station cost, service fee and gross margin
Draft invoice explanation
Draft supplier settlement summary
```

Owner must confirm:

```text
Final billing decision
Invoice amount
Supplier settlement amount
Whether to issue invoice
Whether to send payment/invoice email
```

---

### G. Emails and External Communication

Best mode:

```text
AI drafts / owner sends
```

AI can handle:

```text
Draft email to customer
Draft email to ground station
Draft email to manufacturer/operator
Attach or reference report language
Prepare short explanation of billing or delivery
```

Owner must confirm:

```text
Recipient
Final wording
Attachments
Whether to send now
```

---

## 3. Default Control Settings

Recommended platform default:

```text
Resource onboarding: AI Assist + Owner Confirmation
Mission/task arrangement: Manual + AI Inspection
Orbit/pass recommendation: AI Assist
Configuration: Manual Confirmation + AI Inspection
Reception result: Manual Record + AI Classification
Transfer: AI Checklist + Owner Confirmation
Reports: AI Generate + Owner Approve
Billing: AI Recommend + Owner Confirm
Email: AI Draft + Owner Send
Final signature: Owner Only
```

---

## 4. Practical UI Labels

Every platform action should show one of the following labels:

```text
Manual Decision
AI Draft — Owner Confirmation Required
AI Check Only
AI Recommended
AI Generated — Owner Approval Required
Owner Signature Required
Owner Send Required
```

---

## 5. Functional Design Impact

The front end should not be designed as a fully autonomous control panel.

It should be designed as:

```text
Owner operation center
+ AI inspection layer
+ AI document/report/billing generator
+ owner confirmation and signature workflow
```

This matches the actual business risk structure: AI improves efficiency, but the owner keeps control of mission arrangement, authorization, commercial decision, signature and external communication.
