# GS LinkOps AI — Onboarding Data Support Model

## 1. Core Understanding

The most complex part of GS LinkOps AI is not the web page itself.

The most complex part is:

```text
satellite-side onboarding
ground-station-side onboarding
standardization of both sides
capability matching
risk matching
commercial matching
```

To do this well, the platform needs a large amount of structured information.

The platform’s intelligence depends on the quality of the underlying resource profiles, configuration records, historical cases and partner response data.

---

## 2. Why Large Information Support Is Required

Matching cannot rely on simple station names or satellite names.

A valid match requires detailed data such as:

```text
satellite orbit
TLE validity
RF frequency
polarization
modulation
bit rate
coding
frame structure
station frequency range
antenna capability
baseband capability
station availability
booking lead time
political / regional restrictions
commercial terms
data delivery path
past success/failure records
```

Without this information, the platform can only forward messages.

With this information, the platform can perform real dispatch intelligence.

---

## 3. Satellite-Side Onboarding Data

Each satellite operator or satellite resource should be onboarded with the following information.

### 3.1 Operator Profile

```text
Operator name
Country / region
Legal entity
Commercial contact
Technical contact
Operations contact
Emergency contact
Preferred communication method
Contract / NDA status
Authorized service scope
Restrictions or special notes
```

### 3.2 Satellite Profile

```text
Satellite name
Satellite alias
NORAD ID
COSPAR ID
Internal satellite code
Interface document code
Orbit type
Altitude
Inclination
Payload type
Mission type
Operational status
```

### 3.3 Orbit / Ephemeris Data

```text
TLE source
TLE update frequency
TLE epoch
OMM availability
Ephemeris file availability
Pass prediction preference
Validity period
Fallback orbit source
```

### 3.4 Downlink Configuration

```text
Frequency band
RF center frequency
Bandwidth
Polarization
Modulation
Symbol rate
Bit rate
Coding
Frame length
Sync word
Scrambling / descrambling
CRC
Encryption status
Test mode / operational mode
```

### 3.5 Mission Requirement Data

```text
Required service type
Signal detection only / demod lock / frame sync / data file generation
Preferred region
Preferred station
Preferred time window
Minimum elevation requirement
Delivery recipient
Delivery method
Report requirement
Commercial priority
```

---

## 4. Ground-Station-Side Onboarding Data

Each ground station should be onboarded with detailed capability data.

### 4.1 Station Entity Profile

```text
Station operator
Station name
Station code
Country / region
Legal entity
Commercial contact
Technical contact
Operations contact
Emergency contact
Contract / NDA status
Service scope
Restrictions or special notes
```

### 4.2 Site and Antenna Profile

```text
Station location
Latitude
Longitude
Altitude
Antenna size
Antenna type
Frequency bands
Frequency range
G/T
EIRP if applicable
Minimum elevation
Tracking mode
Polarization support
Number of RF ports
```

### 4.3 Baseband / Demodulator Capability

```text
Receiver model
Demodulator model
Maximum data rate
Supported modulation
Supported coding
Frame sync support
LDPC / RS / Viterbi support
Descrambling support
IF range
Recording capability
Real-time monitoring capability
Log / screenshot availability
```

### 4.4 Scheduling and Operations Data

```text
Availability rule
Booking lead time
Response SLA
Pass confirmation method
Cancellation rule
Operation hours
Automation level
Manual operation requirement
Station contact during pass
Escalation path
```

### 4.5 Storage and Delivery Data

```text
Temporary storage availability
Retention period
SFTP support
Cloud delivery support
ST-managed delivery support
Customer-designated delivery support
Manifest support
Checksum support
Transfer confirmation method
```

### 4.6 Commercial Data

```text
Pricing model
Price per minute
Price per pass
Minimum charge
Test pass price
Cancellation charge
Data transfer charge
Storage charge
Settlement currency
Invoice requirement
Payment terms
```

---

## 5. Standardization Layer

Satellite-side and station-side information must be converted into platform-standard objects.

Standard objects:

```text
Operator Profile
Satellite Profile
Orbit Profile
Downlink Configuration
Station Profile
Antenna Profile
Baseband Capability
Availability Window
Pass Window
Mission Requirement
Station Response
Delivery Reference
Commercial Rule
Risk Tag
```

This standardization is what makes cross-party matching possible.

---

## 6. Matching Dimensions

The platform should match demand and resources across multiple dimensions.

### 6.1 Technical Match

```text
frequency
polarization
data rate
modulation
coding
frame support
antenna visibility
minimum elevation
baseband support
```

### 6.2 Time Match

```text
TLE validity
pass window
station availability
booking lead time
response deadline
mission urgency
```

### 6.3 Commercial Match

```text
price
minimum charge
currency
payment terms
margin
settlement rule
```

### 6.4 Risk Match

```text
customer country / region
satellite operator country / region
station country / region
data sensitivity
mission purpose
partner restriction
political risk
compliance note
```

### 6.5 Delivery Match

```text
ST temporary storage
partner storage
SFTP
cloud storage
customer-designated delivery
nearest cloud
fastest transfer path
recipient confirmation
```

---

## 7. Evidence Library

To support matching, the platform should maintain an evidence library.

Evidence sources:

```text
operator interface documents
satellite downlink parameter sheets
station capability sheets
station test reports
previous mission reports
emails from operators or stations
screenshots from station systems
AMS / partner system response records
pricing sheets
contracts / NDAs
compliance notes
```

Each evidence record should connect to the relevant satellite, station, mission or demand.

---

## 8. Case Library

Every test and mission should become a case.

Case data:

```text
Demand ID
Satellite ID
Station ID
Mission Profile ID
Configuration used
Pass window
Execution result
Reception status
Delivery status
Failure reason
Lessons learned
Updated rule
```

This allows the platform to become smarter over time.

---

## 9. Data Quality Levels

Not all information will be complete at the beginning.

Each profile should have a data quality level:

```text
Level 0 — Unknown
Level 1 — Basic contact only
Level 2 — Capability known
Level 3 — Configuration known
Level 4 — Tested successfully
Level 5 — Operationally validated
```

The platform should use this level when recommending resources.

---

## 10. Readiness Impact

Missing data should directly affect readiness.

Examples:

```text
Missing TLE → Not Ready
Missing frequency → Not Ready
Missing polarization → Not Ready
Missing station baseband capability → Needs Station Confirmation
Unknown delivery path → Ready with Risk or Not Ready
Unknown commercial terms → Not Billable / Needs Commercial Confirmation
```

This prevents blind dispatch.

---

## 11. Product Rule

```text
No high-quality matching without high-quality resource information.
```

The platform must collect, normalize, verify and update information continuously.

---

## 12. Product Conclusion

GS LinkOps AI should be built not only as a workflow tool, but also as a structured knowledge base for satellite-side and ground-station-side resources.

The core difficulty is onboarding and matching.

The core asset is structured operational knowledge.

The platform becomes stronger as more satellite profiles, station profiles, test cases, delivery records and reports are accumulated.
