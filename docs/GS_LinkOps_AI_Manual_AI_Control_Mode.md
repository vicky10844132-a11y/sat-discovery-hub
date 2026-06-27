# GS LinkOps AI — Manual / AI Control Mode Policy

## 1. Core Principle

AI is an option, not a forced replacement for human operation.

Every important platform function should support three operating modes:

```text
Manual Mode
AI Assist Mode
AI Takeover Mode
```

The platform must allow the owner to choose whether a workflow is handled manually, assisted by AI, or temporarily taken over by AI under rules.

---

## 2. Three Operating Modes

### Mode 1 — Manual Mode

The owner handles the workflow manually.

AI only displays passive information, such as:

```text
Missing fields
Warnings
Status explanation
Recommended next step
```

AI does not execute actions.

Use this mode when:

```text
A new partner is involved
The task is sensitive
Commercial terms are not confirmed
Authorization is unclear
The owner wants full control
```

---

### Mode 2 — AI Assist Mode

AI recommends and drafts, but the owner confirms every action.

AI can:

```text
Recommend station/pass
Draft mission
Draft configuration checklist
Draft transfer instruction
Draft billing decision
Draft report
Explain risk
Classify failure
```

The owner must click confirmation before the platform changes anything important.

This should be the default mode.

---

### Mode 3 — AI Takeover Mode

AI can handle selected workflows automatically within owner-approved boundaries.

AI can:

```text
Check missing information
Run pass calculation
Rank station/pass candidates
Generate test mission drafts
Create internal reports
Prepare billing recommendations
Prepare follow-up tasks
```

AI still must not finalize sensitive actions without owner approval.

AI Takeover Mode should be allowed only for clearly defined low-risk workflows.

---

## 3. Function-by-Function Control Matrix

| Function | Manual Mode | AI Assist Mode | AI Takeover Mode |
|---|---|---|---|
| Add organization/contact | Owner inputs | AI drafts, owner confirms | Allowed only for imported approved list |
| Add satellite | Owner inputs | AI structures, owner confirms | Not allowed without approved resource package |
| Add ground station | Owner inputs | AI structures, owner confirms | Not allowed without approved resource package |
| Missing-field check | Owner checks | AI checks | AI can auto-check |
| TLE / pass calculation | Owner clicks | AI recommends, owner confirms | AI can run if data is complete |
| Station recommendation | Owner compares | AI recommends | AI can auto-rank |
| Create mission | Owner creates | AI drafts, owner confirms | Only for test missions if allowed |
| Advance mission status | Owner advances | AI recommends, owner confirms | Only for non-sensitive internal status |
| Confirm configuration | Owner confirms | AI checks and reminds | Not final without owner |
| Record RF result | Owner records | AI structures station logs | Not final without owner |
| Complete transfer | Owner confirms | AI checks and asks confirmation | Not final without owner |
| Billing decision | Owner decides | AI recommends | Not final without owner |
| Supplier settlement | Owner decides | AI drafts | Not final without owner |
| Generate report | Owner writes | AI drafts | AI can auto-generate draft |
| Send/export report | Owner sends | AI prepares | Owner final approval required |
| Close mission | Owner closes | AI recommends | Owner final approval required |

---

## 4. Recommended Default Settings

For this platform owner, recommended default is:

```text
Default system mode: AI Assist Mode
Resource onboarding: AI Assist Mode
Orbit calculation: AI Assist Mode, can switch to AI Takeover after resources are approved
Mission creation: AI Assist Mode
Mission status advancement: AI Assist Mode
Transfer completion: Manual or AI Assist Mode
Billing: Manual or AI Assist Mode
Report generation: AI Assist Mode / AI Takeover for drafts
Final sending/export: Manual Mode
```

---

## 5. AI Takeover Boundaries

AI Takeover can be enabled for:

```text
Daily status check
Missing-field scan
TLE completeness check
Pass ranking
Station/pass recommendation
Draft mission report
Draft transfer report
Draft billing explanation
Internal task summary
```

AI Takeover should not be enabled for:

```text
Adding unapproved satellite/station resources
Changing authorization status
Confirming frequency configuration
Confirming transfer completed
Marking customer/manufacturer confirmation
Final billing approval
Supplier settlement approval
Closing a commercial mission
Sending external documents
```

---

## 6. UI Requirement

Every major page should show a control switch:

```text
Operation Mode: Manual / AI Assist / AI Takeover
```

And every write action should display one of these labels:

```text
Manual Action
AI Suggested — Needs Confirmation
AI Controlled — Within Approved Rule
Owner Approval Required
```

---

## 7. AI Operator Behavior

When the owner asks AI to do something, AI should respond in this structure:

```text
我可以处理这个事项。
当前模式：AI Assist Mode
我建议执行：xxx
风险点：xxx
需要你确认：是 / 否
```

For AI Takeover:

```text
当前模式：AI Takeover Mode
该操作属于低风险自动处理范围
我将执行：xxx
执行结果：xxx
下一步建议：xxx
```

For Manual Mode:

```text
当前模式：Manual Mode
我只提供建议，不会执行操作。
建议你下一步：xxx
```

---

## 8. Implementation Requirement

Add a system setting:

```text
operation_mode = manual | ai_assist | ai_takeover
```

Each action should have metadata:

```text
action_name
action_category
risk_level
requires_confirmation
allowed_in_manual
allowed_in_ai_assist
allowed_in_ai_takeover
owner_final_approval_required
```

---

## 9. Functional Completion Impact

Functional completeness requires that the owner can choose:

```text
I do it myself
AI helps me prepare it
AI handles this low-risk part for me
```

The platform should never force one mode.

The final goal is:

```text
Full platform functions
+ optional AI assistance
+ optional AI takeover for approved low-risk workflows
+ owner final control for sensitive business decisions
```
