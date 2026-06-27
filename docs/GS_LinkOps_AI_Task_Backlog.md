# GS LinkOps AI Task Backlog

This backlog converts the GS LinkOps AI platform requirement into executable development tasks.

---

## Epic 1 — Project Foundation

### Task 1.1 — Initialize project structure
- Create application structure for frontend, backend, database, automation and docs.
- Add environment configuration templates.
- Add README with platform purpose and local setup.

### Task 1.2 — Set up database
- Use PostgreSQL.
- Add migration framework.
- Create initial schema files.

### Task 1.3 — Set up authentication and roles
- Admin
- Operations Manager
- Technical User
- Commercial User
- Station Partner
- Satellite Operator
- Read-only User

---

## Epic 2 — Resource Center

### Task 2.1 — Organization management
Create CRUD for organizations:
- Satellite operator
- Ground station partner
- Manufacturer
- Agent
- Customer
- Supplier
- Internal entity

### Task 2.2 — Contact management
Create CRUD for contacts with role, timezone, emergency contact and organization link.

### Task 2.3 — Satellite resource library
Create satellite profile module with:
- Satellite name/code
- NORAD ID
- TLE
- Operator
- Sensor type
- Frequency band
- Downlink frequency
- Polarization
- Modulation
- Coding
- Data rate
- Authorization status

### Task 2.4 — Ground station resource library
Create ground station module with:
- Station ID
- Country/city
- Latitude/longitude/altitude
- Antenna diameter
- Supported bands
- Frequency range
- Polarization
- Minimum elevation
- Demodulator
- Maximum data rate
- Delivery method
- Commercial status
- Authorization status

### Task 2.5 — Seed initial resources
Add initial records:
- Uganda Ground Station
- Singapore Ground Station
- Italy Ground Station
- SVN2-05 / NORAD 68378
- SVN2-06 / NORAD 68377

---

## Epic 3 — Scheduling Center

### Task 3.1 — TLE/NORAD management
- Store TLE records.
- Track update time and source.
- Allow manual TLE entry in v0.1.

### Task 3.2 — Pass window calculation engine
Use Python Skyfield/SGP4 to calculate:
- Start UTC
- End UTC
- Duration
- Max elevation
- Start/end azimuth
- Ground station visibility

### Task 3.3 — Capability matching matrix
Implement rule-based matching:
- Frequency band match
- Frequency range match
- Polarization match
- Data rate match
- Minimum elevation match
- Authorization status match
- Commercial availability match

### Task 3.4 — AI recommendation v0.1
Start with a rules-based recommendation score:
- Visibility score
- Capability score
- Authorization score
- Cost score
- Historical success placeholder
- Risk score

### Task 3.5 — Contact Planner UI
Create UI to select:
- Satellite
- Ground stations
- Time range
- Minimum elevation
Then output recommended windows and create mission action.

---

## Epic 4 — Mission Control Center

### Task 4.1 — Downlink mission model
Create mission object with:
- Mission ID
- Satellite
- Ground station
- Mission type
- Scheduled pass
- Status
- Authorization status
- Station confirmation status
- Manufacturer confirmation status

### Task 4.2 — Mission status workflow
Implement statuses:
- New Request
- Auto Matched
- Task Generated
- Station Confirmation Pending
- Station Confirmed
- Configuration Pending
- Configured
- Scheduled
- In Pass
- Signal Acquired
- Carrier Locked
- Demod Locked
- Frame Synced
- Data Captured
- Transfer Waiting
- Transfer Started
- Transfer Completed
- Manufacturer Confirmed
- Report Generated
- Billable
- Billed
- Supplier Settled
- Closed
- Failed
- Rescheduled
- Cancelled

### Task 4.3 — Station confirmation workflow
- Generate station confirmation request.
- Support internal confirmation in v0.1.
- Later support station portal/API.

### Task 4.4 — Configuration profile management
Create module for:
- Frequency
- IF frequency
- Symbol/data rate
- Polarization
- Modulation
- Coding
- Frame length
- Sync word
- RS/LDPC/CRC/CCSDS
- Version
- Manufacturer confirmation
- Station confirmation
- Attachments/screenshots

### Task 4.5 — Execution logs and reception status
Track:
- Actual start/end time
- Antenna tracking
- Signal detected
- Carrier lock
- Demod lock
- Frame sync
- Peak SNR/CN0
- Data captured
- Issue description
- Station conclusion
- Manufacturer confirmation

---

## Epic 5 — Transfer Center

### Task 5.1 — Transfer job model
Create Transfer Job linked to Mission.

### Task 5.2 — File manifest tracking
Track:
- File count
- File names
- Total size
- Checksum type/value
- Source path
- Destination path

### Task 5.3 — Transfer status workflow
Implement statuses:
- Waiting for File
- File Detected
- Checksum Pending
- Checksum Verified
- Transfer Started
- Transfer In Progress
- Transfer Completed
- Manufacturer Confirmed
- Auto Deleted
- Failed
- Retrying

### Task 5.4 — Temporary retention and deletion record
- Store retention policy.
- Track auto-delete status.
- Do not implement permanent payload data storage.

### Task 5.5 — SFTP/S3 watcher placeholder
- v0.1 can be manual status update.
- v1.0 adds automated watcher.

---

## Epic 6 — Billing Center

### Task 6.1 — Pricing rules
Support modes:
- Per pass
- Per minute
- Per successful downlink
- Per test mission
- Cost plus service fee
- Monthly package

### Task 6.2 — Billing triggers
Configurable triggers:
- Mission scheduled
- Signal acquired
- Data captured
- Transfer completed
- Manufacturer confirmed

Default trigger:
- Transfer Completed + Manufacturer Confirmed = Billable

### Task 6.3 — Mission billing record
Track:
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

## Epic 7 — Report Center

### Task 7.1 — Mission report template
Generate a mission report including:
- Mission overview
- Satellite information
- Ground station information
- Pass/contact window
- Configuration profile
- Execution log
- Reception result
- Transfer status
- Manufacturer confirmation
- Billing status
- Conclusion

### Task 7.2 — Signal acquisition report
Generate report for signal-only test.

### Task 7.3 — Data transfer report
Generate report for handover chain.

### Task 7.4 — Billing statement
Generate billing summary by mission.

---

## Epic 8 — AI Copilot

### Task 8.1 — AI command panel
Add command panel to ask:
- Which station is best for SVN2-05 this week?
- Is Uganda Station ready for the Gaojing test?
- Which missions are ready for billing?
- Which transfer looks abnormal?
- Generate mission report.

### Task 8.2 — AI alerts
Implement alerts:
- Missing parameters
- Missing station confirmation
- Better pass window available
- Transfer size abnormal
- Mission ready for billing
- Mission overdue

### Task 8.3 — Failure analysis helper
Classify failure into:
- Visibility Issue
- Station Tracking Issue
- RF Parameter Issue
- Carrier Lock Issue
- Demodulation Issue
- Frame Sync Issue
- Transfer Issue
- Manufacturer Confirmation Issue

### Task 8.4 — Billing suggestion helper
Suggest billable / hold / not billable based on mission state and configured trigger.

---

## Epic 9 — Governance and Audit

### Task 9.1 — Audit logs
Track create/update/delete actions on key objects.

### Task 9.2 — Document and attachment access control
Restrict sensitive technical configuration and transfer details by role.

### Task 9.3 — Status history
Store mission status history with timestamp and user.

---

## Suggested v0.1 Development Order

1. Project foundation
2. Database schema
3. Resource Center
4. Satellite and ground station seed data
5. Pass window engine
6. Capability matrix
7. Contact Planner UI
8. Mission workflow
9. Configuration profiles
10. Execution logs
11. Transfer jobs
12. Billing rules
13. Report generation
14. AI Copilot v0.1 alerts and recommendation summary
