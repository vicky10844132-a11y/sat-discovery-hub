# SG-01 光学卫星 X-band 测试失败诊断模型

来源：用户补充说明与新加坡站历史测试截图。  
用户说明：新加坡站测试的是光学卫星；不是雷达星。测试三次均未成功，具体原因不明。  
用途：用于 GS LinkOps AI 平台增加“失败诊断 / Failure Diagnosis”功能。  

---

## 1. 先纠正前面的理解

此前资料里出现“雷达星融配置”等表述，但用户已确认：

```text
新加坡站测试的是光学卫星。
```

因此平台记录应修正为：

```text
Mission Type: Optical satellite X-band downlink reception test
Sensor / Payload: Optical EO payload, not SAR
Station: SG-01 Singapore Equatorial Ground Station
Result: Three test attempts, all failed / no successful lock or no valid data received
```

---

## 2. 测试失败不代表你做错了

这类测试失败很常见，尤其是在以下条件同时存在时：

```text
1. 卫星方参数与站方设备参数不是同一套设备语言
2. 缺少准确 TLE / designation code
3. 过境窗口仰角低或窗口短
4. 极化、频率、IF、码率、映射、解扰、CRC 初值等存在多个版本
5. 站方只能 best-effort 映射到自己的 HDR / CORTEX / Viasat 配置
6. 现场没有完全锁定信号或没有完成帧同步
```

用户不需要判断技术细节。平台应把失败拆成可检查项。

---

## 3. 三次失败的可能原因分类

平台不应直接说“原因就是某一项”，而应按证据分类。

### A. 轨道 / 时间窗口问题

可能原因：

```text
TLE 不准确或缺失
NORAD ID / designation code 未确认
卫星名称在 NORAD 中查不到
实际 pass 与站方软件计算不一致
卫星方给的窗口与站方天线窗口不一致
过境仰角过低
```

截图证据：

```text
站方曾要求提供 TLE 或 designation code。
站方表示 cannot find svn1 in NORAD's list。
一个候选 pass 最大仰角只有 5.05°，风险很高。
```

平台诊断结论：

```text
如果没有有效 TLE / designation code，则不能排除轨道窗口问题。
```

---

### B. RF 频率 / 极化问题

可能原因：

```text
RF center frequency 不一致：8212 MHz / 8220 MHz
极化未最终确认：LHCP / RHCP / 左旋 / 右旋
通道 1 / 通道 2 对应极化未确认
站方 DC LHCP / DC RHCP 都显示 RF ON，但未说明实际选择哪一路
```

平台诊断结论：

```text
如果 RF 频率或极化不一致，可能导致无法锁定或信号很弱。
```

---

### C. IF / 解调参数问题

可能原因：

```text
IF frequency 不一致：1200 MHz / 1270 MHz
Bit rate 不一致：800 Mbps / 900 Mbps
Demodulation 虽然均为 8PSK，但 phase rotation / mapping 不一致
Mapping 不一致：Gray1 / Gray2
I/Q polarity / phase rotation 可能不匹配
Matched filter 参数不同
```

平台诊断结论：

```text
如果站方软件状态显示 PLL / B/S / decoder unlocked，应重点检查 IF、码率、映射、相位、I/Q 极性。
```

---

### D. 帧同步 / 解扰 / 编码问题

可能原因：

```text
Sync Word: 1ACFFC1D 一致，但 ambiguity resolution ON / OFF 不一致
Descrambling ON / OFF 不一致
CRC preset 不一致：14839 / 25500
LDPC 7/8 一致，但设备实现可能不同
Frame length 1024 bytes 一致，但处理链路可能不一致
```

平台诊断结论：

```text
如果 RF 已锁定但无有效帧，应重点检查 sync word、descrambling、CRC preset、LDPC、frame length。
```

---

### E. 设备映射问题

可能原因：

```text
卫星方给的是某一类基带/融为配置
新加坡站用 HDR / CORTEX / Viasat / station software 做映射
相同字段在不同设备里名字不同
同一个字段在不同设备里取值解释不同
```

聊天证据：

```text
站方说 best I could match the details you send us to our HDR setting。
这说明站方不是直接套用参数，而是在做设备映射。
```

平台诊断结论：

```text
如果是 best-effort mapping，配置必须由卫星方与站方共同确认，不能只由用户判断。
```

---

### F. 信号强度 / 链路裕度问题

可能原因：

```text
低仰角 pass 链路裕度不足
IF level 约 -70.3 dBm，Eb/N0 约 -8.8 dB 的截图显示状态很差
PLL / B/S / TCM / Viterbi Decoder 均 Unlocked
站点 elevation mask / blocked zones 影响接收
```

平台诊断结论：

```text
如果仰角低、Eb/N0 为负且全部 unlocked，则失败可能与链路裕度或参数不匹配同时有关。
```

---

## 4. 平台不能只记“失败”，要记录失败阶段

三次测试失败应按阶段记录：

```text
Stage 1: pass/window confirmed?
Stage 2: antenna scheduled?
Stage 3: RF signal detected?
Stage 4: carrier / PLL locked?
Stage 5: bit sync locked?
Stage 6: demod locked?
Stage 7: frame sync locked?
Stage 8: good frames received?
Stage 9: data file generated?
Stage 10: data transferred?
```

不同阶段失败，原因完全不同。

---

## 5. Owner Console 应增加的失败诊断字段

```text
Failure Attempt No.
Satellite
Station
Pass AOS / LOS
Max elevation
TLE source
TLE age
RF center frequency
Polarization
IF frequency
Bit rate
Modulation
Mapping
I/Q polarity
Descrambling
CRC poly
CRC preset
LDPC
PLL status
B/S status
Demod status
Frame sync status
Good frames
Bad frames
IF level
Eb/N0
Station note
Operator note
AI failure category
Owner conclusion
```

---

## 6. AI 诊断规则建议

### Rule 1 — No TLE / uncertain designation

```text
If TLE is missing or designation code is not confirmed:
    classify as Orbit / scheduling uncertainty.
```

### Rule 2 — Very low pass elevation

```text
If max elevation < 10°:
    classify as High-risk pass.
```

### Rule 3 — RF unlocked

```text
If PLL / carrier is unlocked:
    check RF frequency, polarization, IF frequency, frequency reference and acquisition range.
```

### Rule 4 — Demod unlocked

```text
If carrier is locked but demod is unlocked:
    check modulation, bit rate, mapping, I/Q polarity and matched filter.
```

### Rule 5 — Frame sync search / no good frames

```text
If demod is locked but frame sync fails:
    check sync word, frame length, descrambling, CRC preset, LDPC and randomizer.
```

### Rule 6 — Multi-version configuration

```text
If multiple config versions exist:
    block final configured status until operator and station confirm one version.
```

---

## 7. 给卫星方 / 站方的最小复盘问题

为了知道三次为什么没成功，下一步只需要问这几个问题，不要问一堆技术大表：

```text
1. 三次测试分别在哪个 pass？AOS / LOS / max elevation 是多少？
2. 每次是否检测到 RF signal？
3. PLL / carrier 是否 lock？
4. Bit sync / demod 是否 lock？
5. Frame sync 是否 lock？Good frames 是否大于 0？
6. 实际使用的 RF frequency 是 8212 MHz 还是 8220 MHz？
7. 实际使用的 polarization 是 LHCP 还是 RHCP？
8. 实际使用的 IF 是 1200 MHz 还是 1270 MHz？
9. 实际使用的 bit rate 是 800 Mbps 还是 900 Mbps？
10. 最后使用的是 CRC preset 14839 还是 25500？
11. 站方认为失败最可能发生在哪一层：RF / demod / frame sync / data output？
```

---

## 8. 你现在应如何理解这件事

这件事不能简单理解为：

```text
新加坡站不行
或参数不行
或卫星方不行
```

正确理解是：

```text
这是一次跨设备体系的 X-band 光学卫星接收适配测试。
三次失败说明参数、轨道窗口、极化、链路或设备映射至少有一项没有闭合。
现在需要做的是把失败发生在哪一层找出来。
```

---

## 9. 对 GS LinkOps AI 的产品意义

这正好说明 GS LinkOps AI 的价值：

```text
没有平台时，失败原因散落在聊天、截图、参数表、站方反馈里。
有平台后，每次失败都被结构化记录，AI 自动分类，下一次测试可以直接避开重复错误。
```

因此后续平台必须增加：

```text
Failure Diagnosis
Test Attempt Log
Configuration Version Compare
Pass Risk Evaluation
Station Feedback Record
Operator Confirmation Checklist
```

这些会成为 Owner Console 的核心功能。
