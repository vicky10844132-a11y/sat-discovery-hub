# GS LinkOps AI — Functional Completion Checklist

## 1. Principle

The purpose is functional completeness first.

The platform must be complete enough for the owner to operate the full business workflow end to end. Visual polish, advanced optimization and external integrations can be improved later.

The platform is considered functionally complete only when the following workflow can be completed without a developer:

```text
Add resources
→ Check missing information
→ Calculate pass windows
→ Recommend station/pass
→ Create downlink mission
→ Confirm configuration
→ Record reception result
→ Deliver data to operator/manufacturer
→ Confirm delivery
→ Decide billing
→ Generate report
→ Close mission
→ Ask AI Operator what to do next
```

---

## 2. Functional Completion Standard

### A. Resource Center

Required functions:

- Add organization
- Add contact
- Add ground station
- Add satellite
- Edit resource
- Delete resource
- Import resources
- Export resources
- Flag missing fields
- Mark authorization status

Completion status:

```text
Current: partially complete
Need: edit function, structured import template, missing-field UI
```

---

### B. Orbit / Contact Engine

Required functions:

- Store NORAD ID
- Store TLE Line 1 / Line 2
- Check TLE missing
- Calculate pass/contact windows
- Show start/end UTC
- Show duration
- Show max elevation
- Rank pass windows
- Show calculation mode

Completion status:

```text
Current: partially complete
Need: backend Skyfield API connected to front end, pass window display validation
```

---

### C. Scheduling Center

Required functions:

- Capability matching
- Frequency band check
- Polarization check
- Data-rate check
- Station authorization check
- Satellite authorization check
- Conflict check
- Best station recommendation
- Create mission from selected pass

Completion status:

```text
Current: partially complete
Need: front-end conflict display, clearer recommendation output
```

---

### D. Mission Control

Required functions:

- Create mission
- Show mission ID
- Show satellite/station/window
- Advance status
- Auto-create configuration profile
- Auto-create reception log
- Auto-create transfer job
- Close mission
- Show next action

Completion status:

```text
Current: mostly complete in prototype
Need: status explanation and safer confirmation before write actions
```

---

### E. Configuration Center

Required functions:

- Record frequency
- Record IF frequency
- Record polarization
- Record modulation
- Record coding
- Record data rate
- Record frame format
- Record sync word
- Mark station confirmed
- Mark manufacturer confirmed
- AI checks missing configuration

Completion status:

```text
Current: partially complete
Need: clearer confirmation buttons and missing parameter warning
```

---

### F. RF / Reception Monitor

Required functions:

- Signal detected
- Carrier lock
- Demod lock
- Frame sync
- Data captured
- SNR / C/N0
- Received size
- Issue description
- Failure classification
- Station conclusion

Completion status:

```text
Current: partially complete
Need: reception result form, failure classification display
```

---

### G. Transfer Center

Required functions:

- Create transfer job
- Select delivery model
- Record source path
- Record destination path
- Record transfer method
- Record manifest
- Record total size
- Record checksum
- Mark transfer completed
- Mark operator/manufacturer confirmed
- Auto-delete/retention policy field
- AI checks missing transfer fields

Completion status:

```text
Current: partially complete
Need: delivery model selector, operator confirmation button, retention reminder
```

---

### H. Billing Center

Required functions:

- Billing mode selection
- Billing trigger
- Station cost
- Client price
- GS service fee
- Gross margin
- Billable / hold / partial / not billable status
- Supplier settlement status
- Invoice status
- AI billing recommendation

Completion status:

```text
Current: partially complete
Need: manual billing mode selection and supplier settlement status
```

---

### I. Report Center

Required functions:

- Mission report
- Transfer report
- Billing statement
- Failure analysis report
- Copy report text
- Export report
- Customer/manufacturer-facing wording

Completion status:

```text
Current: partially complete
Need: full report view, copy/export buttons for every report type
```

---

### J. AI Operator

Required functions:

- Chinese natural-language command box
- Check platform status
- Check missing fields
- Recommend next action
- Recommend best station/pass
- Create mission after confirmation
- Advance mission after confirmation
- Complete transfer after confirmation
- Generate report
- Judge billing
- Explain in Chinese

Completion status:

```text
Current: backend scaffold complete
Need: visible front-end AI Operator page connected to platform actions
```

---

### K. Governance / Audit

Required functions:

- Audit log
- Sensitive action confirmation
- No hard-coded unconfirmed resources
- No permanent payload data storage by default
- Confirmation before mission/billing/transfer changes

Completion status:

```text
Current: partially complete
Need: front-end confirmation gates and clearer audit page
```

---

## 3. Priority to Reach Functional Completion

### Priority 1 — Make the front end truly usable for the owner

- Add a visible AI Operator page.
- Add plain Chinese instructions inside each page.
- Add confirmation before write actions.
- Add missing-field warnings.
- Add edit buttons.

### Priority 2 — Make the end-to-end flow reliable

- Resource input → orbit calculation → mission → config → RF → transfer → billing → report.
- Every step should create the next object automatically.
- AI should tell the owner what is missing.

### Priority 3 — Connect front end and backend

- Front-end prototype currently uses browser localStorage.
- Backend API exists.
- Functional completion requires a simple front-end API mode or deployment mode.

### Priority 4 — Add owner-oriented documentation

- Non-technical use guide.
- Daily operation checklist.
- Resource intake template.
- Mission operation guide.

---

## 4. Definition of Done

GS LinkOps AI is functionally complete when the owner can do the following without a developer:

```text
1. Open one web page.
2. Ask AI Operator what to do.
3. Add or import satellite/station/operator data.
4. See what information is missing.
5. Calculate pass windows.
6. Create a mission.
7. Advance and record mission execution.
8. Record data transfer and operator confirmation.
9. Get a billing recommendation.
10. Generate a report.
11. Export or copy the report.
12. Close the mission.
```

Everything after that is improvement, optimization or commercialization.
