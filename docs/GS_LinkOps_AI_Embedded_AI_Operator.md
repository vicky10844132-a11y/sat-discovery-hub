# GS LinkOps AI — Embedded AI Operator

## 1. Purpose

The final platform should be operated by one non-technical owner through an embedded AI Operator.

The owner should not need to understand GitHub, APIs, databases, code, Docker, orbit propagation or billing engines.

The owner should be able to say in Chinese:

```text
帮我检查今天该处理什么。
帮我把这个地面站加入平台。
帮我判断这颗卫星和哪个站最适合。
帮我生成一个测试接收任务。
帮我生成给厂家看的报告。
这个任务能不能收费？
```

The AI Operator should read platform data, call approved platform tools, return clear recommendations and ask for confirmation before changing important records.

---

## 2. Operating Model

```text
User Chinese instruction
        ↓
AI Operator intent understanding
        ↓
Approved platform tool selection
        ↓
Read-only result or confirmation request
        ↓
Tool execution
        ↓
Chinese business explanation
        ↓
Next-step recommendation
```

---

## 3. What the AI Operator Can Do

### Resource Management

- Check missing organization/contact/station/satellite fields.
- Convert business text into structured resource records.
- Flag unknown fields instead of inventing data.
- Remind the owner if TLE, frequency, polarization, data rate or authorization is missing.

### Orbit and Scheduling

- Calculate pass/contact windows.
- Recommend best station and pass.
- Explain risks: low elevation, missing TLE, station not authorized, band mismatch, data-rate issue.

### Mission Control

- Create downlink mission from selected pass.
- Check mission readiness.
- Advance workflow status only after confirmation.
- Explain what the next status means.

### Configuration and Reception

- Check missing configuration parameters.
- Explain whether carrier/demod/frame/data status means full success, partial success or test success.
- Classify likely failure reason.

### Transfer and Delivery

- Check whether data has been transferred to the operator/manufacturer.
- Check manifest, file size, checksum and confirmation.
- Remind about temporary-copy deletion.

### Billing and Settlement

- Determine billable / hold / partial / test / not billable.
- Explain the billing reason in Chinese.
- Prepare billing statement language.
- Separate client billing and supplier settlement.

### Reports

- Generate mission report.
- Generate transfer report.
- Generate billing statement.
- Generate failure analysis report.
- Convert technical status into customer-facing wording.

---

## 4. Safety Rules

The AI Operator must not:

```text
Hard-code unconfirmed satellites or ground stations.
Invent TLE, frequency, data rate, price or authorization.
Mark a station as authorized without owner confirmation.
Create a formal mission without owner confirmation.
Mark transfer completed without owner confirmation.
Mark billing as final without owner confirmation.
Expose sensitive frequency, transfer path, server or checksum data to unauthorized users.
Store payload data permanently by default.
```

Actions that require confirmation:

```text
Create resource
Modify resource
Calculate and store pass windows
Create mission
Advance mission status
Complete transfer
Create billing record
Close mission
Export sensitive report
```

Read-only actions do not require confirmation:

```text
Check missing fields
Recommend station
Show AI alerts
Show mission readiness
Draft report
Draft billing explanation
Classify failure
```

---

## 5. Files Added

```text
backend/ai_tools.py
backend/openai_operator_service.py
```

### ai_tools.py

Defines approved tools:

```text
get_platform_brief
check_missing_resource_fields
recommend_best_contact
calculate_pass_windows
create_downlink_mission
advance_mission_status
check_mission_readiness
complete_transfer
generate_mission_report
get_billing_recommendation
```

### openai_operator_service.py

Defines the non-technical AI operator layer:

```text
route_user_message()
operator_capabilities()
```

The first version uses deterministic routing so the platform can work before full LLM integration.

Later version can connect an LLM and use the same approved tool registry.

---

## 6. Final User Experience

The final page should look like a simple command box:

```text
AI 管家：你今天想处理什么？

用户：帮我检查今天该处理什么。

AI：目前平台缺少 2 个地面站授权状态、1 颗卫星 TLE、3 个任务等待厂家确认。其中最紧急的是 Mission GS-DL-2026-0001，因为 transfer 已完成但厂家未确认，暂不能计费。

建议下一步：先向厂家确认数据已收到。
```

The owner should not see API complexity.

---

## 7. Development Priority

Priority 1:

```text
Add AI Operator page to front end.
Connect prompt box to backend route.
Return Chinese guidance.
```

Priority 2:

```text
Allow AI Operator to execute read-only tools.
```

Priority 3:

```text
Add confirmation dialog for write actions.
```

Priority 4:

```text
Connect LLM with the same tool registry.
```

Priority 5:

```text
Make AI Operator the default user interface for the single owner.
```
