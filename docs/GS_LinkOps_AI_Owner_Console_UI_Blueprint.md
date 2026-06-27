# GS LinkOps AI — Owner Console UI Blueprint

## 1. Product Direction

The platform should be built around the owner, not around developers.

The main interface should be:

```text
Owner Console
```

The owner arranges business tasks manually. AI assists with inspection, resource structuring, reports, billing, emails and risk reminders.

---

## 2. Main Navigation

The owner should see these main pages:

```text
1. Today / Command Center
2. Resources
3. Pass & Scheduling
4. Missions
5. Configuration Check
6. Reception Log
7. Transfer & Delivery
8. Reports
9. Billing & Settlement
10. Email Drafts
11. AI Inspector
12. Settings
```

The wording should avoid technical complexity.

---

## 3. Today / Command Center

Purpose:

```text
Tell the owner what needs attention today.
```

Must show:

```text
Open missions
Missions waiting for configuration confirmation
Missions waiting for reception result
Missions waiting for transfer confirmation
Missions waiting for billing decision
Reports waiting for owner approval
Emails waiting to be sent
Resources with missing information
```

AI role:

```text
AI checks and ranks priorities.
AI does not automatically change tasks.
```

Owner actions:

```text
Open mission
Review report
Approve billing
Send email
Ignore / postpone
```

---

## 4. Resources Page

Purpose:

```text
Keep satellite, ground station, operator, manufacturer, customer and supplier information organized.
```

Resource types:

```text
Organization
Contact
Satellite
Ground Station
Manufacturer / Operator
Customer
Supplier
```

AI role:

```text
AI extracts structured fields from raw text, email, table or document.
AI creates a draft resource card.
AI flags missing fields.
Owner confirms before saving.
```

Required buttons:

```text
Add Manually
Paste Information for AI Structuring
Import Resource File
Review Draft
Confirm Save
Edit
Archive
Export Resources
```

Required labels:

```text
Draft
Missing Information
Ready for Use
Authorized
Not Authorized
Suspended
```

---

## 5. Pass & Scheduling Page

Purpose:

```text
Calculate and compare possible contact windows.
```

Owner does:

```text
Select satellite
Select candidate stations
Select date/time range
Click calculate
Choose preferred pass
```

AI does:

```text
Check missing TLE
Check station coordinates
Check band / polarization / data-rate compatibility
Recommend the best station/pass
Warn about risk
```

Required buttons:

```text
Calculate Pass Windows
AI Check Compatibility
AI Recommend Best Pass
Create Mission Draft
```

Important rule:

```text
Creating mission should require owner confirmation.
```

---

## 6. Missions Page

Purpose:

```text
Manage front-end task arrangement manually.
```

Owner controls:

```text
Create mission
Select satellite
Select station
Select pass window
Set test/commercial type
Set customer/operator/manufacturer
Set data delivery party
Set billing rule
Advance task status
Close task
```

AI role:

```text
Check risk
Check missing data
Suggest next step
Draft task summary
Classify status
```

Required sections:

```text
Mission Overview
Current Status
Next Action
AI Inspection
Related Configuration
Related Reception
Related Transfer
Related Report
Related Billing
```

---

## 7. Configuration Check Page

Purpose:

```text
Make sure station and satellite/manufacturer parameters are complete before execution.
```

Owner / partner confirms:

```text
Frequency
IF
Polarization
Modulation
Coding
Data rate
Frame format
Sync word
Station confirmation
Manufacturer confirmation
```

AI checks:

```text
Missing parameter
Mismatch with station capability
Missing manufacturer confirmation
Missing station confirmation
```

---

## 8. Reception Log Page

Purpose:

```text
Record pass execution and signal/data result.
```

Owner or station input:

```text
Signal detected
Carrier lock
Demod lock
Frame sync
Data captured
SNR
C/N0
Received size
Issue description
Station conclusion
```

AI output:

```text
Full success
Partial success
Test success
Failure category
Recommended next step
```

---

## 9. Transfer & Delivery Page

Purpose:

```text
Track delivery of received data to operator/manufacturer/customer.
```

Owner confirms:

```text
Delivery method
Destination
Manifest
Checksum
Transfer completed
Recipient confirmed
Temporary copy deletion status
```

AI prepares:

```text
Delivery checklist
Missing field reminder
Confirmation wording
Transfer handover report draft
```

Important rule:

```text
AI can draft and check. Owner confirms final delivery status.
```

---

## 10. Reports Page

Purpose:

```text
Generate business-facing reports automatically.
```

AI should generate:

```text
Mission Report
Transfer Handover Report
Reception Summary
Failure Analysis Report
Billing Statement
Monthly Operation Summary
```

Owner actions:

```text
Review
Edit
Approve
Download
Copy text
Mark as signed
Prepare email
```

Important rule:

```text
AI can generate reports. Owner approves/signs before external use.
```

---

## 11. Billing & Settlement Page

Purpose:

```text
Calculate and explain billing status.
```

AI calculates/recommends:

```text
Billable
Hold
Partial Billable
Test Billable
Not Billable
Apply Contract Rule
Client price
Station cost
GS service fee
Gross margin
Supplier settlement suggestion
```

Owner confirms:

```text
Final amount
Invoice approval
Supplier settlement approval
Signature
```

Required buttons:

```text
AI Billing Recommendation
Approve Billing
Generate Billing Statement
Prepare Invoice Email
Mark Supplier Settled
```

---

## 12. Email Drafts Page

Purpose:

```text
Prepare emails but keep owner final send authority.
```

AI drafts:

```text
Email to customer
Email to ground station
Email to manufacturer/operator
Delivery confirmation request
Billing explanation
Report delivery email
```

Owner actions:

```text
Review
Edit
Confirm recipient
Attach report
Send manually / send through Gmail after explicit confirmation
```

Important rule:

```text
AI drafts. Owner sends.
```

---

## 13. AI Inspector Page

Purpose:

```text
A single place to ask questions in Chinese.
```

Example commands:

```text
帮我检查今天该处理什么。
帮我看哪些资源缺信息。
帮我检查这个任务能不能继续。
帮我生成这个任务的报告。
这个任务能不能收费？
帮我起草给厂家的邮件。
```

AI output should always include:

```text
Current finding
Risk
Suggested action
Need owner confirmation or not
```

---

## 14. Settings Page

Required settings:

```text
Operation Mode: Manual / AI Assist / AI Takeover
Default mode for resources
Default mode for missions
Default mode for reports
Default mode for billing
Default email behavior
Default billing trigger
Default currency
Default transfer retention
```

Recommended default:

```text
Resources: AI Draft + Owner Confirm
Missions: Manual + AI Check
Reports: AI Generate + Owner Approve
Billing: AI Recommend + Owner Confirm
Emails: AI Draft + Owner Send
```

---

## 15. Functional Completion Target

The front end is complete when the owner can:

```text
Open Owner Console
Ask AI Inspector what is missing
Let AI structure resource drafts
Confirm resources
Manually arrange mission
Let AI check mission risk
Record reception result
Let AI prepare delivery checklist
Confirm transfer
Let AI generate report
Let AI recommend billing
Approve/sign/send externally
Close mission
```
