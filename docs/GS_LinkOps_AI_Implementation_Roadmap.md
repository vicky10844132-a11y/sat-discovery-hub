# GS LinkOps AI Implementation Roadmap

## Phase v0.1 — Internal Automated Downlink Operations Prototype

### Goal
Build a functional internal platform that can onboard Uganda, Singapore and Italy stations, onboard SVN2-05 / SVN2-06, calculate pass windows, generate downlink missions, track reception/transfer status, generate reports and calculate billing status.

### Duration
Estimated 4 weeks for a lean internal prototype.

---

## Week 1 — Foundation and Resource Center

### Deliverables
- Project structure
- PostgreSQL schema
- Authentication/roles placeholder
- Organizations module
- Contacts module
- Satellites module
- Ground Stations module
- Seed data for initial resources

### Acceptance Criteria
- Admin can create and edit organizations.
- Admin can create and edit ground stations.
- Admin can create and edit satellites.
- SVN2-05 and SVN2-06 are present.
- Uganda, Singapore and Italy stations are present.

---

## Week 2 — Scheduling Center

### Deliverables
- TLE/NORAD management
- Pass/contact window calculation engine
- Capability matching matrix
- Contact Planner UI
- AI recommendation v0.1 using rules-based score

### Acceptance Criteria
- User can select SVN2-05 or SVN2-06.
- User can select Uganda, Singapore and Italy.
- System calculates visible pass/contact windows.
- System ranks available stations/windows.
- User can create a mission from selected pass.

---

## Week 3 — Mission Control and Transfer Center

### Deliverables
- Downlink Mission workflow
- Station confirmation workflow
- Configuration profile module
- Execution logs
- Reception status tracking
- Transfer Job module
- File manifest and checksum record

### Acceptance Criteria
- Mission can move through key statuses.
- User can record station configuration.
- User can record signal acquired / carrier lock / demod lock / frame sync / data captured.
- User can create transfer job and record transfer completion.
- User can mark manufacturer/operator confirmation.

---

## Week 4 — Billing, Reports and AI Copilot v0.1

### Deliverables
- Pricing rules
- Mission billing record
- Supplier settlement record
- Mission report generator
- Transfer report generator
- AI alert panel
- AI mission summary
- Audit/status history

### Acceptance Criteria
- Completed mission can become Billable based on configured trigger.
- System calculates client price, station cost, GS service fee and gross margin.
- Mission report can be generated.
- AI Copilot shows missing parameter alerts and billing readiness.
- Status history is stored.

---

## Phase v1.0 — Internal Operations Version

### Added Features
- Automated SFTP/S3 watcher
- Email and workflow notifications through n8n
- Monthly operations dashboard
- Station performance score
- Failure analytics
- More advanced billing statements
- Role-based UI access
- Document-level access control

---

## Phase v2.0 — Partner Collaboration Version

### Added Features
- Ground station partner portal
- Satellite operator portal
- API-based station confirmation
- API-based transfer status
- API-based mission request intake
- Automated quotation
- Automated report delivery
- Multi-station conflict resolution
- Smart scheduling optimization using success rate, cost and risk

---

## Phase v3.0 — Platform / Marketplace Version

### Added Features
- External partner onboarding workflow
- Multi-supplier commercial routing
- Station availability API
- Dynamic pricing
- SLA analytics
- Network-level capacity planning
- Mission-level revenue and margin optimization
- Full AI operations copilot

---

## First Real Pilot Mission

Suggested pilot mission:

```text
Mission ID: GS-UGA-SVN205-DL-2026-0001
Satellite: SVN2-05
NORAD ID: 68378
Station: Uganda Ground Station
Mission Type: Authorized Downlink Test
Transfer: Station to manufacturer/operator
Billing Trigger: Transfer Completed + Manufacturer Confirmed
```

Second pilot mission:

```text
Mission ID: GS-UGA-SVN206-DL-2026-0002
Satellite: SVN2-06
NORAD ID: 68377
Station: Uganda Ground Station
Mission Type: Authorized Downlink Test
Transfer: Station to manufacturer/operator
Billing Trigger: Transfer Completed + Manufacturer Confirmed
```
