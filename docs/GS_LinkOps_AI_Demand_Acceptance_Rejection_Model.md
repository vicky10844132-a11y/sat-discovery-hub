# GS LinkOps AI — Demand Acceptance and Rejection Model

## 1. Core Concept

GS LinkOps AI is not only a resource distribution platform. It is also a demand screening and decision-support platform.

The platform should support:

```text
accepting a demand
rejecting a demand
requesting more information
placing a demand on hold
routing a demand to partner review
```

This is important because not every satellite-side demand should be accepted.

---

## 2. Why Demand Rejection Is Necessary

A professional dispatch platform must be able to say no.

A demand may be rejected because of:

```text
no suitable ground-station resource
insufficient satellite-side information
missing TLE / orbit data
unsupported frequency or polarization
unsupported data rate or modulation
no available pass window
station capacity conflict
commercial terms not acceptable
customer or mission risk
regional / political / compliance concern
partner refusal
owner decision
```

Rejection is not failure. It is part of professional resource governance.

---

## 3. Demand Decision Status

Each demand should have a decision status:

```text
New
Under Review
Need More Information
Parallel Dispatch Sent
Station Responses Received
Recommended for Acceptance
Accepted
Rejected
On Hold
Cancelled by Customer
Closed
```

---

## 4. Rejection Categories

Rejection should be structured.

Suggested rejection categories:

```text
Technical Not Supported
No Available Station
No Available Pass Window
Missing Critical Information
Station Refused
Commercial Not Acceptable
Compliance / Risk Concern
Customer Withdrew
Owner Strategic Decision
Other
```

Each rejection should include:

```text
rejection reason
supporting evidence
who approved rejection
whether resubmission is allowed
what information is needed for resubmission
```

---

## 5. Parallel Station Review Before Decision

The platform should not reject too early unless the risk is obvious.

Normal process:

```text
Demand arrives
→ platform validates basic information
→ candidate stations identified
→ parallel dispatch sent
→ stations respond
→ platform compares responses
→ accept / reject / hold recommendation generated
→ owner confirms final decision
```

This makes rejection evidence-based.

---

## 6. Station-Side Right to Refuse

Ground stations should also have the right to refuse a demand.

Station response may be:

```text
Available
Unavailable
Conditionally Available
Need More Information
Rejected by Station
```

Station refusal reason may include:

```text
no pass window
capacity conflict
unsupported configuration
commercial refusal
customer restriction
mission restriction
compliance concern
internal approval required
```

---

## 7. Owner Final Decision

GS LinkOps AI should generate recommendations, but the owner makes the final commercial decision.

Owner decision options:

```text
Accept and Dispatch
Accept with Risk
Request More Information
Hold
Reject
Escalate to Partner Review
```

Every decision should be recorded in the audit log.

---

## 8. Rejection Output

If a demand is rejected, the platform should produce a short rejection note.

Rejection note should include:

```text
Demand ID
Decision result
Main reason
Supporting explanation
Whether resubmission is possible
What information or condition is needed for future review
```

This keeps communication professional and traceable.

---

## 9. Product Value

Demand acceptance and rejection control makes the platform more professional because it prevents:

```text
blindly accepting impossible missions
wasting station resources
creating failed tests without preparation
unclear commercial responsibility
uncontrolled risk exposure
```

The platform should not only distribute demand. It should govern demand.

---

## 10. Product Conclusion

GS LinkOps AI should be able to coordinate resources and also refuse unsuitable demands.

The correct logic is:

```text
Receive demand
→ evaluate demand
→ ask stations in parallel
→ compare responses
→ decide accept / reject / hold
→ record decision
→ generate report or rejection note
```

This makes the dispatch center controlled, professional and commercially safe.
