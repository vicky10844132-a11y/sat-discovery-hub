# SG-01 新加坡站测试过程复盘草稿

来源：用户提供的 WeChat 截图、站端软件截图、配置界面截图。  
状态：人工复盘草稿，用于 GS LinkOps AI 平台功能建设；不是最终技术报告。  
测试对象：SG-01 新加坡赤道地面站。  
测试卫星：截图中出现 `svnl-0304`、`SUPERView NEO-1 03`、`SVN1-03/04` 字样；需要用户/卫星方确认最终对应关系。  

---

## 1. 我对这个测试过程的理解

这不是一个普通聊天记录，而是一次真实的站端接收参数适配过程。

大致流程是：

```text
卫星方/四维给出基带参数配置
→ SG-01 站方尝试把参数录入 HDR / CORTEX / 解调器系统
→ 站方检查是否适用于 X-band reception
→ 站方发现需要 TLE 或 designation code 才能安排过境与测试
→ 你向卫星方确认 TLE / 编号 / 测试时间
→ 站方安排两个测试 pass
→ 站方根据参数尝试锁定信号和解调
```

这个过程说明平台必须支持：

```text
1. 参数配置草稿
2. 站端配置匹配检查
3. TLE / designation code 缺失提醒
4. 测试 pass 候选窗口
5. 站方确认已安排天线
6. 接收状态记录
7. 配置差异记录
8. 测试报告生成
```

---

## 2. 聊天中出现的关键事实

### 2.1 你给站方的信息

你告诉站方：

```text
这个是四维使用的融为基带的参数配置。
If you can do the test, you still need to let me know.
```

含义：

```text
卫星方给的是某套基带参数，但 SG-01 需要判断能否映射到自己的 HDR / CORTEX 配置。
```

---

### 2.2 站方初始反馈

站方回复：

```text
we will try to input the parameters and get back to you today if we could have a testing done this Thursday 29th Jan.
```

含义：

```text
SG-01 可以先尝试录入参数。
测试时间初步考虑 1 月 29 日星期四。
```

---

### 2.3 站方确认参数用途

站方问：

```text
Can I check the parameters you provide is for X-band reception?
```

你回复的意思是：

```text
X-band reception is applicable.
```

平台应记录：

```text
任务类型：X-band reception test
```

---

### 2.4 站方提出 TLE / designation code 缺失

站方说：

```text
could you provide the satellite TLE? Or designation code? We can't find svn1 in NORAD's list.
```

这是关键问题。

平台必须把这个列为阻断项：

```text
No TLE / no confirmed designation code = cannot reliably calculate pass window.
```

说明：

```text
SVN1 / SVN2 这类名称不一定能直接在 NORAD 列表里查到。
平台不能只存业务名称，必须存：
- NORAD ID
- TLE Line 1 / Line 2
- 或卫星方指定 designation code
```

---

### 2.5 站方配置匹配反馈

站方说：

```text
Above is the best I could match the details you send us to our HDR setting. You might want to confirm with siwei team on the settings.
Also we will await your help to get us the TLE so that we can check whether the satellite flies...
```

含义：

```text
站方并不是直接确认配置完全一致，而是尽力映射到 HDR 设置。
最终参数仍需四维/卫星方确认。
```

平台应记录：

```text
Configuration Mapping Status: Best-effort matched by station
Owner / satellite operator confirmation required
```

---

### 2.6 多项式 / 初相位配置差异

你告诉站方：

```text
There are two configuration methods for polynomial initial phase.
For cortex, it is 40801/14839, and for viasat, it is 40801/25500.
If you can't lock it, you can switch it.
```

平台应记录为：

```text
CRC / polynomial preset has two alternatives:
- CORTEX: 40801 / 14839
- Viasat: 40801 / 25500
Fallback rule: if lock fails, switch preset according to equipment mapping.
```

这个信息非常重要，应该进入 Configuration Check 的“可切换参数”。

---

### 2.7 站方安排测试 pass

站方说：

```text
I have scheduled superview neo-1 03 for 29th Jan (0505H UTC) & (0636H UTC).
If siwei is available we can try on this two pass.
```

后续站方又说：

```text
Yes I have scheduled our antenna for these two timing.
```

平台应记录：

```text
Test date: 29 Jan
Candidate pass 1: 05:05 UTC
Candidate pass 2: 06:36 UTC
Station: SG-01
Antenna: scheduled by station
Satellite shown by station: SUPERView NEO-1 03
```

截图中 pass 详情还显示：

```text
Pass 1:
AOS: 29/01/2026 05:05:19.722
LOS: 29/01/2026 05:11:45.945
Max elevation: 5.05°

Pass 2:
AOS: 29/01/2026 06:36:38.887
LOS: 29/01/2026 06:47:26.885
Max elevation: 35.33°
```

AI 判断：

```text
Pass 1 max elevation only 5.05°: very low elevation / high risk / likely not ideal.
Pass 2 max elevation 35.33°: much better candidate for test.
```

---

## 3. 站端配置截图中可提取的参数

### 3.1 Demodulator / HDR 配置

截图显示：

```text
Input selection: Nominal / IF1
Input frequency: 1270000000 Hz
Acquisition range: 1000000 Hz
VCM: 8PSK / OQPSK option visible
Demodulation: 8PSK
Phase rotation: Inverted
8PSK mapping: Gray1
Bit rate: 900000000 bps
PCM Code: NRZ-L
I/Q Polarity: Normal
Output Clock: Normal
Output Mode: Merged
Matched Filter: Root Raised
Filter Value: 0.35
Randomizer: Disable
PLL BW Auto: enabled
BER Mode: OFF
Physical layer mode: Normal
Viterbi Decoding: Dual decoding
Viterbi Decoder: G1 / G2
Viterbi Puncturing: OFF
```

站端状态截图显示：

```text
PLL: Unlocked
B/S: Unlocked
TCM: Unlocked
Viterbi Decoder: Unlocked
IF Level: approximately -70.3 dBm
Eb/N0: approximately -8.8 dB
```

平台解释：

```text
这是一次配置/锁定测试，不代表成功接收。
如果状态为 Unlocked，应记录为 failure / not locked / configuration requires adjustment。
```

---

### 3.2 Processing Unit / CADU 配置

截图显示：

```text
Input Selection: DMU1
CADU: Merged
Transport Layer: ON
Idle Discarded: OFF
Frame Synchronizer: ON
Ambiguity Resolution: OFF
MSB Sync Word: 1ACFFC1D
LSB Sync Word: 00000000
SW Mask: FFFFFFFF / 00000000
Sync Word Size: 32 bits
Frame / Block Length: 1024 bytes
NRZM DPU: OFF
LSB First: OFF
Frame Header RS: OFF
Frame Checking: OFF
Descrambling: OFF in this station screenshot
CRC Poly: 00040801
CRC Preset: 00025500
Decoding: LDPC 7/8 ON
SYN / CTL / LTS / SLIP: 3 / 3 / 3 / 3
Disable Time Datation: checked
Frame Synchronizer status: Search
Good frames: 0
Bad frames: 0
```

注意差异：

```text
Earlier operator/CORTEX style configuration used CRC preset 14839.
Station/Viasat style screenshot shows CRC preset 25500.
Descrambling is also different across screenshots.
```

平台必须支持配置版本对比，而不是只保存一套参数。

---

### 3.3 X DC / RF path 配置

截图显示：

```text
DC LHCP:
Attenuation: 20.00 dB
RF: ON
Frequency: 8220000 kHz

DC RHCP:
Attenuation: 20.00 dB
RF: ON
Frequency: 8220000 kHz

DC Tracking:
Attenuation: 20.00 dB
RF: ON
Frequency: 8220000 kHz

Temperature: 40.0°C
Frequency reference: Internal
```

平台解释：

```text
RF center frequency shown here is 8220 MHz.
Earlier owner note mentioned 8212 MHz.
Therefore frequency has two observed values: 8212 MHz and 8220 MHz.
Final test frequency must be confirmed by satellite operator / station.
```

---

## 4. 这次测试中出现的关键冲突

平台必须记录这些冲突：

| 项目 | 版本 A | 版本 B | 平台处理 |
|---|---|---|---|
| RF center frequency | 8212 MHz | 8220 MHz | 必须确认最终值 |
| IF frequency | 1200 MHz | 1270 MHz | 必须确认最终值 |
| Bit rate | 800 Mbps | 900 Mbps | 必须确认最终值 |
| Mapping | Gray2 | Gray1 | 必须确认最终值 |
| CRC preset | 14839 | 25500 | 支持两种设备映射 |
| Descrambling | ON | OFF | 需要按设备/链路确认 |
| Ambiguity resolution | ON | OFF | 需要确认 |

AI 规则：

```text
如果配置存在冲突，平台不得标记为 Configured。
只能标记为 Configuration Draft / Needs Operator Confirmation。
```

---

## 5. 平台应该如何处理这种测试

### 5.1 资源阶段

```text
Station: SG-01
Satellite: SUPERView NEO-1 03 / SVN1-03/04 candidate mapping needs confirmation
TLE: missing / requested from operator
```

### 5.2 任务窗口阶段

```text
Pass 1: 29 Jan 05:05 UTC, max elevation 5.05°, low priority
Pass 2: 29 Jan 06:36 UTC, max elevation 35.33°, recommended
```

### 5.3 配置阶段

```text
Configuration status: Draft / best-effort station mapping
Owner confirmation required
Satellite operator confirmation required
Station confirmation required
```

### 5.4 接收阶段

```text
RF lock status should be recorded separately:
- Signal detected
- PLL locked / unlocked
- Bit sync locked / unlocked
- Frame sync search / lock
- Good frames / bad frames
```

### 5.5 报告阶段

AI 可以生成：

```text
SG-01 test preparation report
Configuration mismatch report
Pass candidate report
Reception status report
```

人工必须确认后才能发给卫星方或地面站。

---

## 6. Owner Console 应新增字段

为了支持这种真实测试，Owner Console 需要增加：

```text
Configuration Version
Configuration Source
Equipment Mapping: CORTEX / Viasat / Station HDR / Operator Sheet
RF Center Frequency
IF Frequency
Bit Rate
Mapping
CRC Poly
CRC Preset
Descrambling
LDPC
Lock Status
Frame Sync Status
Good Frames
Bad Frames
Pass Elevation Risk
Station Confirmation
Operator Confirmation
Owner Confirmation
```

---

## 7. 你不需要懂的地方

你不需要判断：

```text
CRC preset 14839 和 25500 谁对
Gray1 和 Gray2 谁对
1200 MHz 和 1270 MHz 谁对
800 Mbps 和 900 Mbps 谁对
```

平台和 AI 的工作是把它们列成“配置差异”，然后让站方和卫星方确认。

你只需要确认：

```text
这是不是同一个测试任务
最后采用哪一版参数
站方是否确认能做
卫星方是否确认时间
接收结果是否成功
报告是否可以发出
```

---

## 8. 这次测试复盘对平台建设的结论

GS LinkOps AI 必须增加一个功能：

```text
Configuration Comparison / 配置差异检查
```

因为真实接收任务里，不同设备体系会出现：

```text
同一个参数在 CORTEX、Viasat、站端 HDR 中名称不同
同一个链路有多套参数候选
某些参数需要现场切换后才能锁定
```

所以平台不能只保存“最终配置”，还必须保存：

```text
Operator Provided Config
Station Mapped Config
Alternative Config
Confirmed Config
Test Result
```

这就是后续功能完善的重点之一。
