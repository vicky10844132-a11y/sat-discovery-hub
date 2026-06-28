# GS LinkOps AI — Asset-Light Operating Model

## 1. Core Positioning

The owner’s platform should be asset-light.

GS LinkOps AI does not need to own or operate heavy data storage, payload data archive, or large-scale data distribution infrastructure at the beginning.

The platform should focus on:

```text
Resource aggregation
Demand collection
Demand validation
Demand distribution
Mission orchestration
Readiness checking
Report generation
Billing recommendation
Failure diagnosis
```

ST / ST-GI can handle:

```text
Station operation
Pass booking through AMS
Pass monitoring
Baseband equipment configuration
X-band data download
Temporary storage
Payload data retrieval through SFTP
Data storage and distribution where agreed
```

This reduces cost and allows GS LinkOps AI to start faster.

---

## 2. Business Logic

The owner-side value is not to store the data.

The owner-side value is to know:

```text
Which satellite resource is available?
Which ground station can support it?
Which customer/operator demand exists?
Which station should receive the task?
Which configuration is ready?
Which party must confirm missing information?
Whether the task succeeded or failed?
Whether billing can be triggered?
```

This makes GS LinkOps AI a control and coordination platform rather than a heavy data center.

---

## 3. Simplified Chain

The target chain is:

```text
Customer / Satellite Operator Demand
        ↓
GS LinkOps AI
        ↓
Demand registration + resource matching + readiness gate
        ↓
ST-GI AMS / Partner Ground Station System
        ↓
Pass booking + reception + temporary storage
        ↓
SFTP / agreed delivery method
        ↓
Customer / satellite operator / designated recipient
        ↓
GS LinkOps AI records delivery + report + billing status
```

The data does not need to live inside GS LinkOps AI.

GS LinkOps AI only needs to store:

```text
Metadata
Mission records
Configuration records
Pass status
Delivery confirmation
Reports
Billing records
Audit logs
```

---

## 4. What the Platform Stores

GS LinkOps AI should store lightweight operational metadata:

```text
Satellite resource profile
Ground station resource profile
Customer / operator demand record
Mission profile
Configuration checklist
TLE / orbit source metadata
Pass window metadata
Booking status
Execution status
Lock-stage status
Data file manifest or delivery reference
SFTP path reference, if allowed
Report
Invoice / billing recommendation
Lessons learned
```

It should not store, unless explicitly required:

```text
Raw payload data
Large X-band downlink files
Long-term archive
Customer production data
Sensitive operational credentials
```

---

## 5. Demand Distribution Function

The platform should treat demand as an object.

Demand record fields:

```text
Demand ID
Customer / operator
Satellite
Payload type
Required station or preferred region
Required date / time window
Required service type: signal test / downlink / delivery / report
Required data output
Commercial rule
Priority
Status
Assigned station
Assigned mission profile
Report link
Billing status
```

Demand lifecycle:

```text
New Demand
→ Validated Demand
→ Matched to Station
→ Mission Profile Created
→ Awaiting Confirmation
→ Booked
→ Executed
→ Delivered
→ Reported
→ Billable / Closed
```

---

## 6. Cost Saving Logic

This model saves cost because the owner does not need to build immediately:

```text
Data center
Large object storage
High-throughput data distribution network
24/7 network operations center
Station control system
Baseband control system
Secure customer download portal
```

Instead, the owner builds:

```text
Coordination layer
Intelligence layer
Resource matching layer
Report and billing layer
```

This is much cheaper and faster.

---

## 7. Relationship with ST-GI

ST-GI AMS remains the operational infrastructure for Singapore station-related work.

Future integration can follow Kar Wee’s confirmed architecture:

```text
RESTful / MQ for availability, booking, TLE, pass status
SFTP for X-band downloaded data retrieval
VPN as the minimum secure connection requirement
```

GS LinkOps AI should be ready to connect to ST-GI but should also work manually before full integration.

---

## 8. Owner Console Implication

Owner Console should show the owner:

```text
Demand Dashboard
Resource Match
Station Assignment
Readiness Gate
Mission Profile
Booking Status
Delivery Reference
Report
Billing Recommendation
```

It should not require the owner to manage raw data storage.

---

## 9. Product Rule

The platform should follow this rule:

```text
Store operational truth, not heavy payload data.
```

Operational truth includes:

```text
Who requested what?
Which station handled it?
Which pass was used?
Which configuration was confirmed?
Was the data received?
Where was it delivered?
Who confirmed delivery?
Is it billable?
What was learned?
```

---

## 10. Product Conclusion

GS LinkOps AI should be built as an asset-light resource aggregation and demand-distribution platform.

Its value is:

```text
centralized resource view
centralized demand intake
mission orchestration
station matching
configuration readiness
execution reporting
billing recommendation
failure learning
```

ST and other partner stations can provide the heavy infrastructure for reception, storage and distribution.

This is the practical path to launch quickly and control costs.
