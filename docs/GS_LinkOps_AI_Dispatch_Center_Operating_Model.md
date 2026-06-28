# GS LinkOps AI — Dispatch Center Operating Model

## 1. Core Definition

GS LinkOps AI is an owner-side dispatch center.

The platform does not operate satellites, does not command satellites, does not directly control antennas, and does not store heavy payload data.

Its core role is:

```text
Receive satellite-side demand
Understand and classify the demand
Match demand with available ground-station resources
Dispatch the task to the selected station / ST-GI AMS
Track whether reception was successful
Track where the data went after reception
Generate report and billing recommendation
```

In simple terms:

```text
The platform is a scheduling and dispatch center.
```

---

## 2. End-to-End Business Chain

The target chain is:

```text
Satellite Operator Demand
        ↓
GS LinkOps AI Dispatch Center
        ↓
Demand validation + resource matching + readiness gate
        ↓
Ground Station / ST-GI AMS
        ↓
Antenna scheduling + reception + station-side operation
        ↓
Data received by ground station
        ↓
Data transferred to ST / temporary storage
        ↓
ST transfers data to satellite operator / designated recipient
        ↓
GS LinkOps AI records delivery status + report + billing
```

This is the owner's operational chain.

---

## 3. What the Satellite Side Sends

Satellite side may send:

```text
Mission request
Satellite name / satellite ID
TLE / OMM / orbit information
Preferred pass window
RF frequency
Polarization
Modulation
Bit rate
Frame / coding information
Required station or region
Data delivery recipient
Commercial / priority requirement
```

GS LinkOps AI converts this into a demand record.

---

## 4. What the Platform Does

The platform performs:

```text
Demand registration
Satellite resource check
Ground-station resource matching
Pass-window check
Configuration readiness check
Station assignment
Task dispatch
Status tracking
Reception result recording
Data delivery reference recording
Report generation
Billing recommendation
Lessons learned
```

It should show the owner:

```text
Who requested what?
Which station is assigned?
Is the task ready?
Has the station accepted?
Was the data received?
Where was the data transferred?
Has the satellite side received it?
Can this task be billed?
```

---

## 5. What ST / Ground Station Does

ST / ground-station side performs the heavy operational work:

```text
Station availability confirmation
Pass booking
Antenna scheduling
Baseband equipment configuration
Reception monitoring
X-band data download
Temporary storage
SFTP / agreed delivery transfer
Delivery confirmation
```

GS LinkOps AI records and audits these steps but does not need to perform the heavy data operation itself.

---

## 6. What the Platform Must Know About Each Ground Station

Even though the platform does not operate the station directly, it must understand the station well enough to dispatch correctly.

For each station, the platform must know:

```text
Location
Antenna size
Frequency band
Frequency range
Polarization support
Minimum elevation
G/T or link capability indicator
Maximum data rate
Baseband / demodulator capability
Supported modulation / coding
Station availability rule
Booking method
Data transfer method
Contact person
Cost rule
Past success / failure history
```

This is why the platform needs station resource profiles and station adapters.

---

## 7. Dispatch Workflow

```text
1. Demand received from satellite side.
2. Platform creates Demand Record.
3. Platform checks satellite identity and TLE.
4. Platform calculates or imports possible pass windows.
5. Platform checks candidate ground stations.
6. Platform ranks stations by capability, availability, risk and cost.
7. Owner confirms station assignment.
8. Platform creates Mission Profile.
9. Platform sends or prepares booking request to ST / station.
10. Station confirms booking and configuration.
11. Platform marks mission as Ready or Ready with Risk.
12. Station executes pass.
13. Platform records reception status.
14. ST / station transfers data to satellite side or designated recipient.
15. Platform records delivery confirmation.
16. Platform generates report and billing recommendation.
17. Mission closes.
```

---

## 8. Required Statuses

Demand status:

```text
New
Validated
Matched
Assigned
Awaiting Station Confirmation
Booked
Ready
Executed
Delivered
Reported
Billable
Closed
Cancelled
```

Mission readiness status:

```text
Not Ready
Needs Satellite Confirmation
Needs Station Confirmation
Ready with Risk
Ready
```

Reception status:

```text
Not Started
Antenna Scheduled
RF Detected
Carrier Locked
Demod Locked
Frame Sync Locked
Good Frames Received
File Generated
Failed
```

Delivery status:

```text
Not Applicable
Pending
Temporary Storage Ready
SFTP Available
Transferred to Recipient
Recipient Confirmed
Delivery Failed
```

Billing status:

```text
Not Billable
Pending Delivery Confirmation
Billable
Invoice Drafted
Invoiced
Settled
```

---

## 9. Data Storage Boundary

GS LinkOps AI should not store heavy payload data.

It should store:

```text
Demand record
Mission profile
Ground-station assignment
Pass metadata
Reception status
Delivery reference
Report
Billing record
Audit log
```

It should not store:

```text
Raw X-band payload data
Large data files
Long-term archive
Production data unless explicitly required
```

ST or designated infrastructure handles data storage and distribution.

---

## 10. Report Requirements

Every dispatched mission should generate a report.

Report sections:

```text
Demand summary
Assigned station
Satellite and TLE confirmation
Pass window
Station capability match
Readiness gate result
Execution status
Reception status
Data transfer and delivery status
Failure or success conclusion
Lessons learned
Billing recommendation
Owner decision
```

This makes the dispatch center rigorous.

---

## 11. Product Conclusion

GS LinkOps AI should be positioned as:

```text
Owner-side scheduling, dispatch and mission accountability platform.
```

The platform's value is not data storage. The value is operational control:

```text
Collect demand
Match resources
Dispatch tasks
Track reception
Track delivery
Generate reports
Trigger billing
Learn from results
```

This is the practical and cost-efficient path.
