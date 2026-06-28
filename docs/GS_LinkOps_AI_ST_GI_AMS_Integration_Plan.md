# GS LinkOps AI — ST-GI AMS Integration Plan

## 1. Background

The owner has confirmed that the future GS LinkOps AI platform must connect with ST Engineering Geo-Insights / ST-GI.

Kar Wee previously confirmed by email that future link testing between the Siwei system and the ST-GI Antenna Management System can be performed using the Singapore station.

ST-GI proposed that the Antenna Management System (AMS) be centrally deployed at ST Engineering Geo-Insights. External systems connecting to AMS may use:

```text
1. Web client
2. RESTful / MQ interface
3. SFTP for X-band downloaded data retrieval
```

Kar Wee also confirmed that database synchronization is not required and that, at minimum, a VPN tunnel should be established.

---

## 2. Integration Positioning

GS LinkOps AI should be the owner-side operations platform.

ST-GI AMS should remain the station-side operational system for Singapore station resources.

The platform boundary should be:

```text
GS LinkOps AI:
- owner-side mission orchestration
- satellite-side resource intake
- station resource normalization
- readiness gate
- mission profile builder
- report and billing generator
- AI assistant and failure diagnosis

ST-GI AMS:
- Singapore station AMS
- pass booking
- pass monitoring
- station-side/baseband equipment configuration
- live pass status
- X-band data download
- temporary storage
- SFTP data retrieval
```

---

## 3. Target Integration Chain

```text
Satellite Operator / Siwei
        ↓
Satellite ID / TLE / mission request / payload config
        ↓
GS LinkOps AI
        ↓
Readiness Gate + Mission Profile + Owner Approval
        ↓
RESTful / MQ
        ↓
ST-GI AMS
        ↓
Pass booking + pass monitoring + baseband configuration
        ↓
Singapore station X-band reception
        ↓
Temporary storage
        ↓
SFTP retrieval
        ↓
GS LinkOps AI / Owner / Data recipient
        ↓
Report + billing + lessons learned
```

---

## 4. Interface Objects to Support

According to Kar Wee's email, RESTful / MQ should support:

```text
Ground station availability window
Booking of contact passes
Exchange of orbit data / TLE
Pass status
```

SFTP should support:

```text
Retrieval of X-band downloaded data
```

GS LinkOps AI should therefore define the following integration objects:

```text
StationAvailabilityWindow
ContactPassBookingRequest
ContactPassBookingResponse
OrbitDataExchange / TLEExchange
PassStatusUpdate
BasebandConfigurationRecord
XBandDataRetrievalJob
SFTPDeliveryRecord
VPNConnectionRecord
IntegrationAuditLog
```

---

## 5. What GS LinkOps AI Should Send to ST-GI AMS

The platform should prepare or send:

```text
Mission ID
Satellite name
Satellite identifier / NORAD ID / operator code
TLE / OMM
Requested station
Requested pass window
Payload type
RF center frequency
Polarization
Modulation
Bit rate
Frame / coding parameters if required
Owner approval status
Contact booking request
```

Before any automated sending, the owner should approve the prepared request.

---

## 6. What GS LinkOps AI Should Receive from ST-GI AMS

The platform should receive or record:

```text
Station availability windows
Booking acceptance / rejection
Confirmed AOS / LOS
Confirmed pass ID
Station-side configuration confirmation
Live pass status
Antenna scheduled status
RF / lock / pass monitoring status if exposed
X-band download completion status
Temporary storage path
SFTP retrieval details
Failure or execution notes
```

---

## 7. Security and Deployment

Minimum requirement confirmed by Kar Wee:

```text
VPN tunnel should be established.
```

GS LinkOps AI should not store production credentials in a public repository.

Future deployment should use:

```text
Private environment variables
Private configuration file
VPN endpoint configuration
API keys / tokens
SFTP credentials
Access role control
Audit log
```

---

## 8. Integration Phases

### Phase 1 — Manual mirror mode

```text
GS LinkOps AI generates mission profile, booking request and report.
Owner manually sends request to ST-GI / AMS team.
ST-GI provides status by email or screenshot.
Owner uploads information back into platform.
```

Purpose:

```text
Get the business process running before live integration.
```

### Phase 2 — File / SFTP-assisted mode

```text
Platform prepares structured files.
Data retrieval via SFTP is tracked.
Reports and delivery records are generated automatically.
```

Purpose:

```text
Start using real data-transfer workflow without full REST/MQ automation.
```

### Phase 3 — RESTful / MQ integration

```text
Platform exchanges availability windows, contact booking, TLE and pass status with AMS.
Owner still approves mission execution.
```

Purpose:

```text
Move from manual operation to integrated mission workflow.
```

### Phase 4 — Operational integration

```text
Mission profile and booking are generated from platform.
AMS confirms pass.
Platform monitors status.
Downloaded X-band data is retrieved through SFTP.
Report and billing are generated.
```

Purpose:

```text
Run the end-to-end owner-side operations platform.
```

---

## 9. Owner Console Requirements

Owner Console should include an ST-GI Integration page with:

```text
ST-GI AMS status
VPN status
Availability window import
Contact booking request draft
TLE exchange record
Pass status record
SFTP retrieval record
Integration audit log
Manual / AI Assist / Connected mode switch
```

Modes:

```text
Manual Mode:
Platform prepares drafts and reports, owner sends externally.

AI Assist Mode:
AI extracts ST-GI replies, updates mission records and generates next questions.

Connected Mode:
RESTful/MQ/SFTP integration is active, but owner approval remains required for mission execution.
```

---

## 10. Important Product Rule

Even after ST-GI integration is available, GS LinkOps AI should remain the owner-side control and review layer.

The platform should not blindly submit tasks just because an interface exists.

Execution should still require:

```text
Mission profile readiness gate
Owner approval
ST-GI booking confirmation
Post-pass report
```

---

## 11. Product Conclusion

ST-GI AMS integration is not a separate function. It is a key external connector in the GS LinkOps AI operating chain.

The correct architecture is:

```text
GS LinkOps AI = owner-side mission orchestration and intelligence layer
ST-GI AMS = station-side antenna and pass operation layer
RESTful/MQ = operational message channel
SFTP = X-band data retrieval channel
VPN = secure connection foundation
```

This confirms that GS LinkOps AI should be designed from the beginning as a connectable platform, not an isolated local tool.
