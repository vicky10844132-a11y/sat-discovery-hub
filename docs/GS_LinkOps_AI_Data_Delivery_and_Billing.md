# GS LinkOps AI — Data Delivery and Billing Workflow

This document defines what happens after a ground station receives a downlink signal/data package, how it is handed over to the satellite operator/manufacturer, and how billing is triggered.

---

## 1. Key Principle

GS LinkOps AI is not designed to permanently store satellite payload data.

The platform manages the **handover chain**:

```text
Ground Station
  -> Temporary transfer path or direct transfer path
  -> Satellite Operator / Manufacturer destination
  -> Delivery confirmation
  -> Billing trigger
```

The platform should store:

- Mission ID
- Source ground station
- Destination operator/manufacturer
- Transfer method
- File manifest
- Total size
- Checksum
- Transfer status
- Confirmation status
- Billing status
- Audit record

The platform should not store long-term payload data unless explicitly configured as a temporary encrypted cache with an auto-delete rule.

---

## 2. Delivery Models

### Model A — Direct Station-to-Operator Delivery

Use this when the ground station can send data directly to the satellite operator/manufacturer.

```text
Ground Station SFTP/FTP/S3/VPN
        -> Operator / Manufacturer Server
        -> GS LinkOps AI records transfer log only
```

Platform role:

- Create transfer job
- Record destination path
- Record file manifest and checksum
- Record start/end time
- Record operator confirmation
- Trigger billing when delivery is confirmed

This is the preferred model when the data is sensitive or large.

---

### Model B — Temporary GS Transfer Node

Use this when direct delivery is not available or when GS needs to supervise the handover.

```text
Ground Station
        -> Temporary encrypted GS transfer node
        -> Operator / Manufacturer Server
        -> Auto-delete after retention period
```

Platform role:

- Monitor incoming files
- Verify manifest and checksum
- Forward data to the operator/manufacturer
- Record delivery proof
- Auto-delete temporary copy after 24/48/72 hours or a configured retention period
- Trigger billing after confirmation

This model gives GS stronger delivery control but requires more infrastructure.

---

### Model C — Operator-Pull Delivery

Use this when the operator/manufacturer prefers to pull data from a secure temporary location.

```text
Ground Station
        -> Temporary encrypted bucket/link
        -> Operator downloads data
        -> Platform records download confirmation
```

Platform role:

- Generate expiring secure delivery link or bucket access
- Record link creation time
- Record access/download time if available
- Record checksum verification
- Close transfer job after operator confirmation

---

## 3. Transfer Methods Supported

GS LinkOps AI should support these methods as configurable options:

- SFTP
- FTP
- S3-compatible object storage
- VPN endpoint
- Dedicated operator/manufacturer server
- Temporary encrypted transfer node
- Expiring secure download link
- Physical/offline delivery record if needed

---

## 4. Transfer Job Fields

Each transfer job should include:

- Transfer ID
- Mission ID
- Source ground station
- Destination operator/manufacturer
- Transfer method
- Source path
- Destination path
- File count
- File manifest
- Total size
- Checksum type
- Checksum value
- Transfer start time
- Transfer end time
- Retry count
- Transfer status
- Operator/manufacturer confirmation status
- Confirmation person
- Confirmation time
- Retention period
- Auto-delete status
- Notes

---

## 5. Transfer Status Workflow

```text
Waiting for File
-> File Detected
-> Manifest Received
-> Checksum Pending
-> Checksum Verified
-> Transfer Started
-> Transfer In Progress
-> Transfer Completed
-> Operator / Manufacturer Confirmed
-> Temporary Copy Deleted
-> Transfer Closed
```

Failure states:

```text
File Missing
Checksum Failed
Transfer Failed
Destination Unreachable
Operator Confirmation Pending
Retried
Cancelled
```

---

## 6. Billing Logic

Billing should be rules-based. Each mission can have a billing mode and a billing trigger.

### Billing Modes

1. **Per Pass**
   - One fixed fee for each scheduled or executed contact window.

2. **Per Minute**
   - Billable duration multiplied by minute rate.

3. **Per Successful Downlink**
   - Charged only after data capture and transfer confirmation.

4. **Per Test Mission**
   - Fixed test fee, useful for signal acquisition or compatibility tests.

5. **Cost Plus Service Fee**
   - Ground station cost plus GS service/coordination fee.

6. **Monthly Package**
   - Fixed monthly access or capacity package.

7. **Failure / Partial Success Rule**
   - Optional rule for signal-only success, failed demodulation, failed transfer, rescheduled pass, or cancelled task.

---

## 7. Recommended Default Billing Trigger

For operational downlink missions:

```text
Transfer Completed + Operator / Manufacturer Confirmed = Billable
```

For signal-only tests:

```text
Signal Acquired + Station Log Submitted = Test Billable
```

For compatibility tests:

```text
Carrier Lock / Demod Lock / Frame Sync evidence submitted = Test Billable or Partial Billable
```

For failed missions:

```text
Failed before signal acquisition = Not Billable or Reschedule
Failed after station execution due to operator-side issue = Billable according to contract
```

---

## 8. Billing Record Fields

Each billing record should include:

- Billing ID
- Mission ID
- Customer / operator
- Ground station provider
- Billing mode
- Billing trigger
- Scheduled duration
- Actual duration
- Billable duration
- Station cost
- Client price
- GS service fee
- Gross margin
- Currency
- Invoice status
- Client payment status
- Supplier settlement status
- Billing decision reason
- Notes

---

## 9. Billing Decision Matrix

| Mission Result | Transfer Result | Operator Confirmation | Billing Decision |
|---|---|---|---|
| Signal not acquired | No data | No | Not billable / reschedule |
| Signal acquired only | No full data | Station log only | Test billable if agreed |
| Carrier/demod/frame sync confirmed | Partial data | Pending | Hold or partial billable |
| Data captured | Transfer failed | No | Hold until retry |
| Data captured | Transfer completed | Pending | Hold |
| Data captured | Transfer completed | Confirmed | Billable |
| Operator cancelled after station confirmed | Not executed | N/A | Cancellation rule applies |

---

## 10. Platform Pages Required

### Transfer Center

Must show:

- Mission ID
- Source station
- Destination operator/manufacturer
- Transfer method
- File manifest
- Total size
- Checksum
- Transfer status
- Confirmation status
- Auto-delete status

### Billing Center

Must show:

- Mission ID
- Billing mode
- Billing trigger
- Station cost
- Client price
- GS margin
- Billing status
- Invoice status
- Supplier settlement status

### Report Center

Must generate:

- Mission execution report
- Signal acquisition report
- Transfer handover report
- Billing statement
- Failure analysis report

### AI Copilot

Must check:

- Is transfer completed?
- Is checksum missing?
- Is operator confirmation missing?
- Is the mission ready for billing?
- Is this a full billable mission or partial/test billable mission?
- Is the transfer size abnormal compared with pass duration and data rate?

---

## 11. Final Operating Logic

The complete workflow should be:

```text
Mission scheduled
-> Station executes pass
-> Signal/reception status logged
-> Data package generated
-> Transfer job opened
-> File manifest and checksum recorded
-> Data delivered to operator/manufacturer
-> Operator/manufacturer confirms receipt
-> Report generated
-> Billing rule evaluated
-> Invoice/settlement record created
-> Mission closed
```
