# GS LinkOps AI 使用说明书 / User Manual

版本：v0.1 平台框架版  
适用对象：平台管理员、业务运营人员、技术协调人员、地面站合作方、卫星方/厂家协调人员

---

## 1. 平台定位

GS LinkOps AI 是一个智能化地面段资源与下行接收运营平台，用于管理：

```text
资源接入
→ 轨道/过境计算
→ 接收任务调度
→ 站端配置确认
→ RF/接收状态记录
→ 数据回传给卫星方/厂家
→ 报告生成
→ 计费与供应商结算
→ AI 风险提醒
```

平台不是完整测控系统，不做卫星上行控制，不控制卫星姿态，不直接控制载荷，不长期存储卫星载荷数据。

平台的核心作用是：

```text
授权下行任务运营中枢
+ 多地面站资源编排
+ 数据交付链路管理
+ 自动报告和自动计费
+ AI Copilot 智能运营助手
```

---

## 2. 当前文件结构

### 前端原型

```text
gs-linkops-ai-full-platform.html
```

这是完整平台前端原型，可直接在浏览器打开或通过本地服务器运行。

### 后端 API

```text
backend/gs_linkops_api.py
```

FastAPI 后端入口。

### 数据库结构

```text
backend/database_schema.sql
```

PostgreSQL 表结构。

### 轨道计算服务

```text
backend/orbit_engine.py
```

Skyfield / SGP4 轨道计算服务骨架。

### 智能规则引擎

```text
backend/rules_engine.py
```

能力匹配、任务准备度、传输准备度、计费判断、失败分类。

### 业务服务层

```text
backend/transfer_service.py
backend/billing_service.py
backend/report_service.py
backend/ai_copilot_service.py
```

分别负责传输、计费、报告和 AI Copilot。

### 部署文件

```text
docker-compose.gs-linkops.yml
.env.gs-linkops.example
```

用于本地后端和 PostgreSQL 部署。

---

## 3. 前端原型运行方式

### 方法 A：直接打开

在 GitHub 或本地文件夹中打开：

```text
gs-linkops-ai-full-platform.html
```

### 方法 B：本地服务器运行

在项目根目录执行：

```bash
python3 -m http.server 8080
```

然后浏览器打开：

```text
http://localhost:8080/gs-linkops-ai-full-platform.html
```

---

## 4. 后端 API 运行方式

进入后端目录：

```bash
cd backend
```

创建虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
```

安装依赖：

```bash
pip install -r requirements-gs-linkops.txt
```

启动 API：

```bash
uvicorn gs_linkops_api:app --reload --host 0.0.0.0 --port 8000
```

打开 API 文档：

```text
http://localhost:8000/docs
```

---

## 5. Docker 运行方式

在项目根目录执行：

```bash
docker compose -f docker-compose.gs-linkops.yml up
```

启动后：

```text
API: http://localhost:8000/docs
PostgreSQL: localhost:5432
```

默认数据库：

```text
DB: gs_linkops
User: gs_linkops
Password: gs_linkops
```

---

## 6. 基础使用流程

### Step 1 — 录入机构

进入：

```text
Resource Center → Add Organization
```

机构类型包括：

```text
Satellite Operator
Ground Station Partner
Manufacturer
Customer
Supplier
Internal Entity
```

用途：后续所有卫星、地面站、客户、厂家和供应商都应绑定到机构。

---

### Step 2 — 录入联系人

进入：

```text
Resource Center → Add Contact
```

填写：

```text
Name
Organization
Role
Email
Phone
```

用途：任务确认、站端确认、厂家确认、计费沟通。

---

### Step 3 — 录入地面站

进入：

```text
Resource Center → Add Ground Station
```

必须字段建议：

```text
Station ID
Name
Organization
Country / City
Latitude
Longitude
Antenna / Diameter
Supported Band
Frequency Range
Polarization
Minimum Elevation
Max Data Rate Mbps
Demodulator / Modem
Transfer Method
Status
Cost per Pass
```

注意：

```text
没有坐标，轨道/过境计算无法正常使用。
没有频段、极化、码率，能力匹配无法准确判断。
未标记 Authorized，AI 会提示授权风险。
```

---

### Step 4 — 录入卫星

进入：

```text
Resource Center → Add Satellite
```

必须字段建议：

```text
Satellite ID
Name
Organization
NORAD ID
TLE Line 1
TLE Line 2
Band
Downlink Frequency
Polarization
Modulation
Coding
Data Rate Mbps
Frame Format
Status
```

注意：

```text
没有 TLE，正式过境计算无法启用。
没有频段、极化、码率，能力匹配不完整。
```

---

## 7. 轨道 / 过境计算使用方法

进入：

```text
Orbit Engine
```

点击：

```text
Calculate Pass Windows
```

平台会根据已录入的：

```text
Satellite TLE / NORAD
Ground Station Coordinates
Minimum Elevation
Capability Parameters
```

输出：

```text
Satellite
Station
Start UTC
End UTC / Duration
Max Elevation
Score
Match Status
Orbit Mode
```

当前前端原型使用简化估算逻辑，正式后端应使用：

```text
Python Skyfield / SGP4
```

正式后端服务文件：

```text
backend/orbit_engine.py
```

---

## 8. 调度中心使用方法

进入：

```text
Scheduling Center
```

平台会展示：

```text
卫星
地面站
推荐窗口
Readiness
原因
Create Mission 按钮
```

调度中心会判断：

```text
站点是否授权
卫星是否授权
频段是否匹配
极化是否匹配
码率是否满足
TLE 是否存在
站点坐标是否完整
```

点击：

```text
Create Mission
```

即可创建 Downlink Mission。

---

## 9. Mission Control 使用方法

进入：

```text
Mission Control
```

任务状态流：

```text
New Request
→ Auto Matched
→ Task Generated
→ Station Confirmation Pending
→ Station Confirmed
→ Configuration Pending
→ Configured
→ Scheduled
→ In Pass
→ Signal Acquired
→ Carrier Locked
→ Demod Locked
→ Frame Synced
→ Data Captured
→ Transfer Waiting
→ Transfer Started
→ Transfer Completed
→ Operator / Manufacturer Confirmed
→ Report Generated
→ Billable
→ Billed
→ Supplier Settled
→ Closed
```

点击：

```text
Advance
```

可以推进任务状态。

当任务推进到：

```text
Configuration Pending
```

系统会生成 Configuration Profile。

当任务推进到：

```text
Signal Acquired / Carrier Locked / Demod Locked / Frame Synced / Data Captured
```

系统会生成 RF / Reception Log。

当任务推进到：

```text
Transfer Waiting
```

系统会生成 Transfer Job。

---

## 10. Configuration Center 使用方法

进入：

```text
Configuration Center
```

填写或确认：

```text
Frequency
IF Frequency
Polarization
Modulation
Coding
Data Rate
Sync Word
Frame Format
RS / LDPC / CRC / CCSDS
Manufacturer Confirmation
Station Confirmation
```

用途：保证站方和卫星方/厂家对接收参数一致。

AI 会检查：

```text
频率是否缺失
极化是否缺失
码率是否超出站点能力
配置是否未确认
```

---

## 11. RF & Reception Monitor 使用方法

进入：

```text
RF & Reception Monitor
```

记录：

```text
Signal Detected
Carrier Lock
Demod Lock
Frame Sync
Data Captured
SNR
C/N0
Received Size
Issue Description
Station Conclusion
```

用途：判断任务是完整成功、部分成功、测试成功，还是失败。

AI 可用于失败分类：

```text
Visibility Issue
Station Tracking Issue
RF Parameter Issue
Carrier Lock Issue
Demodulation Issue
Frame Sync Issue
Transfer Issue
Manufacturer Confirmation Issue
```

---

## 12. 数据接收后如何交付给卫星方 / 厂家

进入：

```text
Transfer Center
```

支持三种交付模式：

### 模式 A：地面站直接传给卫星方 / 厂家

```text
Ground Station
→ Operator / Manufacturer SFTP / FTP / S3 / VPN / Dedicated Server
→ 平台记录 transfer log
```

适合数据敏感或体量大的情况。

### 模式 B：经过 GS 临时中转节点

```text
Ground Station
→ Temporary Encrypted GS Transfer Node
→ Operator / Manufacturer
→ Auto Delete
```

适合 GS 需要掌控交付过程的情况。

### 模式 C：卫星方 / 厂家自行下载

```text
Ground Station
→ Temporary Secure Link / Bucket
→ Operator / Manufacturer Pull
→ Platform Records Confirmation
```

Transfer Center 应记录：

```text
Transfer Method
Source Path
Destination Path
File Manifest
File Count
Total Size
Checksum Type
Checksum Value
Transfer Start / End Time
Retry Count
Confirmation Person
Confirmation Time
Retention Period
Auto-delete Status
```

---

## 13. Billing Center 使用方法

进入：

```text
Billing Center
```

支持计费方式：

```text
Per Pass
Per Minute
Per Successful Downlink
Per Test Mission
Cost Plus Service Fee
Monthly Package
Partial / Failure Rule
Cancellation Rule
```

推荐默认计费触发：

```text
Transfer Completed + Operator / Manufacturer Confirmed = Billable
```

测试任务可使用：

```text
Signal Acquired + Station Log Submitted = Test Billable
```

部分成功可使用：

```text
Carrier Lock / Demod Lock / Frame Sync = Partial Billable
```

失败或取消任务：

```text
Apply Contract Rule
```

---

## 14. Report Center 使用方法

进入：

```text
Report Center
```

自动生成：

```text
Mission Report
Signal Acquisition Report
Transfer Handover Report
Billing Statement
Failure Analysis Report
Station Performance Report
Monthly Operations Report
```

报告内容包括：

```text
Mission Overview
Satellite Information
Ground Station Information
Pass Window
Configuration
Reception Result
Transfer Status
Billing Status
Conclusion
```

---

## 15. AI Copilot 使用方法

进入：

```text
AI Copilot
```

AI Copilot 当前支持：

```text
资源完整性检查
TLE 缺失提醒
频段/极化缺失提醒
地面站授权提醒
任务缺项提醒
配置缺失提醒
传输未完成提醒
计费建议
失败分类
最佳站点/任务组合推荐
自动运营摘要
```

示例问题：

```text
Which station is best for this satellite?
Which missions are ready for billing?
Which mission is missing configuration?
Why did this mission fail?
Generate the mission report.
What should I do next?
```

---

## 16. Partner Portals 使用说明

平台预留：

```text
Ground Station Partner Portal
Satellite Operator Portal
Manufacturer Portal
Customer Portal
Station Confirmation Link
Operator Confirmation Link
API Access
```

当前为模块占位，后续可用于：

```text
站方确认任务
厂家确认接收参数
厂家确认数据收到
客户查看报告
合作方查看任务状态
API 对接外部系统
```

---

## 17. Governance & Audit 使用说明

平台预留角色：

```text
Admin
Operations Manager
Technical User
Commercial User
Station Partner
Satellite Operator
Read-only User
```

审计记录用于追踪：

```text
谁创建资源
谁修改任务
谁确认配置
谁完成传输
谁触发计费
谁关闭任务
```

敏感参数，例如频率、配置截图、厂家服务器地址、checksum、传输路径，应做权限控制。

---

## 18. System Settings 使用说明

系统设置包括：

```text
Mission ID Rules
Billing Trigger
Retention Policy
Default Transfer Method
Currency
Role Templates
Notification Rules
API Settings
Orbit Calculation Mode
AI Copilot Mode
```

推荐初始设置：

```text
Orbit Engine: Skyfield / SGP4
Default Transfer Method: SFTP
Default Retention: 72 hours
Default Billing Trigger: Transfer Completed + Operator Confirmed
Currency: USD
AI Mode: Rules First + LLM Later
Audit Logs: Enabled
RBAC: Enabled
```

---

## 19. 数据导入 / 导出

前端原型支持：

```text
Export JSON
Import JSON
Reset
```

用途：

```text
备份当前资源
迁移测试数据
导入统一资源包
清空测试数据
```

注意：正式生产版本应改为 PostgreSQL 存储，不依赖浏览器 localStorage。

---

## 20. 推荐正式工作流程

```text
1. 录入机构和联系人
2. 录入地面站能力
3. 录入卫星和 TLE
4. Orbit Engine 计算 pass windows
5. Scheduling Center 选择最佳窗口
6. 创建 Downlink Mission
7. 站方确认任务
8. 厂家确认配置
9. 执行 pass
10. RF Monitor 记录接收结果
11. Transfer Center 交付数据
12. 厂家确认收到
13. Report Center 生成报告
14. Billing Center 判断计费
15. 生成 invoice / supplier settlement
16. 关闭任务
```

---

## 21. 重要注意事项

```text
不要在未确认前硬编码卫星或地面站资源。
不要长期保存卫星载荷数据。
不要绕过厂家/卫星方授权。
不要把传输路径、服务器密码、频率参数公开给无权限人员。
不要把测试任务和正式商业任务混在一个计费规则里。
```

---

## 22. 平台成熟路线

### v0.1

```text
完整前端原型
本地数据保存
资源录入
简化轨道计算
任务流转
传输/计费/报告原型
AI 规则提醒
```

### v0.5

```text
FastAPI 后端
PostgreSQL 数据库
Skyfield / SGP4 真实轨道计算
规则引擎
Docker 部署
```

### v1.0

```text
正式资源库
正式任务管理
SFTP/S3 watcher
checksum 自动计算
自动报告
自动计费
权限和审计
```

### v2.0

```text
合作方门户
厂家确认链接
API 对接
多站点调度优化
AI Copilot 接入 LLM
```

### v3.0

```text
智能地面站网络平台
动态价格
站点评分
故障预测
多任务自动优化
商业化 marketplace
```
