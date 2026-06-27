# GS LinkOps AI Platform

## Intelligent Ground Segment Resource & Downlink Operations Platform

**Chinese name:** GS LinkOps AI 智能化地面段资源与下行接收运营平台  
**Repository context:** `vicky10844132-a11y/sat-discovery-hub`

---

## 1. Platform Positioning

GS LinkOps AI is an intelligent downlink operations platform that connects satellite operators, partner ground stations, and manufacturer-side data handover workflows.

The platform is designed as a full-system framework with modular activation. The complete architecture should be built from the beginning, while only the currently needed functions are enabled in the first release.

### What the platform does

- Ground station resource onboarding
- Satellite resource onboarding
- Technical parameter management
- TLE / NORAD management
- Automated pass/contact window calculation
- Capability matching between satellites and ground stations
- AI-assisted station and pass recommendation
- Downlink mission generation and control
- Station-side configuration confirmation
- Signal/reception status tracking
- Data transfer handover to manufacturer/operator
- File manifest and checksum tracking
- Automatic report generation
- Automatic billing and settlement records
- AI operations copilot for risk alerts, failure analysis, billing suggestions, and task summaries

### What the platform does not do

- No uplink commanding
- No satellite control
- No satellite attitude or payload command execution
- No direct antenna control in v0.1
- No image processing
- No long-term satellite payload data storage
- No unauthorized reception

The system focuses on **authorized downlink scheduling, reception workflow, data handover, reporting, and billing**.

---

## 2. Core Business Flow

```text
Satellite operator / manufacturer submits task requirement
        ↓
System reads satellite profile, NORAD/TLE, task constraints
        ↓
System calculates pass windows for Uganda, Singapore, Italy and future stations
        ↓
Capability matrix checks frequency, polarization, data rate, authorization and availability
        ↓
AI recommends best ground station and pass/contact window
        ↓
System generates Downlink Mission
        ↓
Station receives task confirmation request
        ↓
Station confirms availability and configuration
        ↓
Pass execution starts
        ↓
Station reports signal/reception states
        ↓
Data package/signals/files are transferred to manufacturer/operator
        ↓
Transfer Center records file manifest, size, checksum and delivery confirmation
        ↓
Manufacturer/operator confirms receipt
        ↓
Report Center generates mission report
        ↓
Billing Center calculates charge and supplier settlement
        ↓
Mission is closed
```

---

## 3. Full System Architecture

```text
GS LinkOps AI Platform
│
├── 01 Resource Center
│   ├── Organizations
│   ├── Contacts
│   ├── Satellite Resources
│   ├── Ground Station Resources
│   └── Capability Matrix
│
├── 02 Scheduling Center
│   ├── TLE / Orbit Management
│   ├── Pass Window Engine
│   ├── Contact Planner
│   ├── Conflict Check
│   └── AI Recommendation Engine
│
├── 03 Mission Control Center
│   ├── Downlink Missions
│   ├── Station Confirmation
│   ├── Configuration Profiles
│   ├── Execution Logs
│   └── Reception Status Monitor
│
├── 04 Transfer Center
│   ├── Transfer Jobs
│   ├── File Manifest
│   ├── Checksum Records
│   ├── Delivery Confirmation
│   └── Temporary Retention / Auto Delete
│
├── 05 Billing Center
│   ├── Pricing Rules
│   ├── Mission Billing
│   ├── Supplier Settlement
│   ├── Invoice Records
│   └── Margin Analysis
│
├── 06 Report Center
│   ├── Mission Reports
│   ├── Signal Acquisition Reports
│   ├── Data Transfer Reports
│   ├── Billing Statements
│   └── Station Performance Reports
│
├── 07 Partner Portal
│   ├── Satellite Operator Portal
│   ├── Ground Station Partner Portal
│   └── API Access
│
└── 08 AI Copilot
    ├── Smart Matching
    ├── Risk Alerts
    ├── Parameter Check
    ├── Failure Analysis
    ├── Auto Reports
    └── Billing Suggestions
```

---

## 4. Initial v0.1 Scope

### Ground stations to onboard first

- Uganda Ground Station
- Singapore Ground Station
- Italy Ground Station

### Satellites to onboard first

- Gaojing / SuperView SVN2-05 — NORAD ID: 68378
- Gaojing / SuperView SVN2-06 — NORAD ID: 68377

### v0.1 mandatory capabilities

1. Organization and contact management
2. Ground station resource library
3. Satellite resource library
4. TLE / NORAD management
5. Automated pass/contact window calculation
6. Capability matching matrix
7. AI station/pass recommendation
8. One-click Downlink Mission creation
9. Station confirmation workflow
10. Station-side configuration profile management
11. Execution status logging
12. Signal/reception state tracking
13. Transfer job management
14. File manifest, file size and checksum tracking
15. Manufacturer/operator delivery confirmation
16. Automatic mission report generation
17. Billing rule configuration
18. Automatic mission billing status
19. Supplier settlement record
20. Audit log and role-based access control

### v0.1 deferred capabilities

- Direct antenna control
- Automatic modem/demodulator configuration push
- Real-time RF visualization
- Long-term payload data storage
- Satellite commanding
- Online customer payment
- Full external API marketplace

---

## 5. Mission Status Workflow

```text
New Request
→ Auto Matched
→ Task Generated
→ Station Confirmation Pending
→ Station Confirmed
→ Configuration Pending
→ Configured
→ Scheduled
→ In Pass
→ Signal Acquired
→ Carrier Locked
→ Demod Locked
→ Frame Synced
→ Data Captured
→ Transfer Waiting
→ Transfer Started
→ Transfer Completed
→ Manufacturer Confirmed
→ Report Generated
→ Billable
→ Billed
→ Supplier Settled
→ Closed
```

Failure states:

```text
Failed - Visibility Issue
Failed - Station Tracking Issue
Failed - RF Parameter Issue
Failed - Carrier Lock Issue
Failed - Demodulation Issue
Failed - Frame Sync Issue
Failed - Transfer Issue
Failed - Manufacturer Confirmation Issue
Rescheduled
Cancelled
```

---

## 6. Data Transfer Center Requirements

The platform does not need to permanently store satellite payload data. However, it must manage the transfer chain and proof of delivery.

### Supported transfer methods

- SFTP
- FTP
- S3-compatible object storage
- VPN endpoint
- Dedicated manufacturer server
- Temporary encrypted transfer node

### Transfer job fields

- Transfer ID
- Mission ID
- Source ground station
- Destination manufacturer/operator
- Transfer method
- Source path
- Destination path
- File count
- Total file size
- File manifest
- Checksum type
- Checksum value
- Transfer start time
- Transfer end time
- Retry count
- Transfer status
- Manufacturer confirmation time
- Temporary retention period
- Auto-delete status

### Transfer states

```text
Waiting for File
File Detected
Checksum Pending
Checksum Verified
Transfer Started
Transfer In Progress
Transfer Completed
Manufacturer Confirmed
Auto Deleted
Failed
Retrying
```

---

## 7. Billing Center Requirements

Billing must be rules-based and linked to mission status.

### Billing modes

- Per pass
- Per minute
- Per successful downlink
- Per test mission
- Cost plus service fee
- Monthly package

### Billing triggers

Configurable triggers:

- Mission scheduled
- Signal acquired
- Data captured
- Transfer completed
- Manufacturer confirmed

Recommended default trigger:

```text
Transfer Completed + Manufacturer Confirmed = Billable
```

### Billing fields

- Mission ID
- Billing mode
- Billable duration
- Station cost
- Client price
- GS service fee
- Gross margin
- Billing status
- Invoice status
- Supplier settlement status

---

## 8. AI Copilot Requirements

GS LinkOps AI should include an embedded Operations Copilot.

### Copilot should answer

- Which station is best for SVN2-05 this week?
- Is Uganda Station ready for the Gaojing test?
- Which missions are missing manufacturer parameters?
- Which missions are ready for billing?
- Which ground station has the highest success rate this month?
- Which transfer looks abnormal?
- What is the most likely failure reason for this mission?
- Generate the mission report.
- Generate the billing explanation.
- Recommend the next available pass.

### AI alert examples

- SVN2-05 Uganda mission is missing station configuration confirmation.
- Italy Station has a better pass window tomorrow.
- Latest transfer size is lower than expected based on duration and data rate.
- Mission GS-UGA-SVN205-DL-0001 is ready for billing.
- Station cost exceeds configured threshold for this mission type.

---

## 9. Recommended Technical Stack

### Cost-efficient full-system architecture

- Frontend: Next.js or Appsmith
- Backend: FastAPI
- Database: PostgreSQL
- Orbit/pass engine: Python + Skyfield / SGP4
- Workflow automation: n8n
- Transfer monitor: SFTP/S3 watcher
- Temporary storage: MinIO or S3-compatible bucket
- Auth: Keycloak or Supabase Auth
- Report generation: DOCX/PDF template generator
- AI layer: LLM + rules engine + database query layer
- Billing: configurable rules engine

### v0.1 faster implementation option

- PostgreSQL
- Appsmith
- FastAPI
- Skyfield / SGP4
- n8n
- MinIO

---

## 10. Suggested Initial Issue Breakdown

1. Set up GS LinkOps AI project structure
2. Design PostgreSQL database schema
3. Build Resource Center: organizations, contacts, satellites, ground stations
4. Build TLE/NORAD management
5. Implement pass/contact window calculation engine
6. Build capability matching matrix
7. Build AI recommendation placeholder/rules engine
8. Build Downlink Mission workflow
9. Build Station Configuration module
10. Build Execution Log and Reception Status module
11. Build Transfer Center with manifest/checksum tracking
12. Build Billing Center rules and mission billing
13. Build Report Center mission report template
14. Add RBAC and audit logs
15. Create initial data for Uganda, Singapore, Italy, SVN2-05, SVN2-06

---

## 11. Initial Mission ID Examples

```text
GS-UGA-SVN205-DL-2026-0001
GS-UGA-SVN206-DL-2026-0002
GS-SGP-SVN205-DL-2026-0003
GS-ITA-SVN206-DL-2026-0004
```

---

## 12. Product Statement

GS LinkOps AI is an intelligent downlink operations platform that connects satellite operators with partner ground stations, automates pass-window scheduling, station configuration workflow, reception status tracking, data transfer handover, reporting and billing, with an embedded AI copilot for mission recommendations, risk alerts and failure analysis.
