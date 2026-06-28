# GS LinkOps AI — Operator Interface Reading Note

This note summarizes the owner-provided screenshots from a satellite operator ground system interface document. It is not a full implementation specification. The original document must be reviewed before any external system connection.

## 1. What this material means

The material is useful because it defines how the satellite operator side exchanges mission-related files and messages with ground-side systems.

For GS LinkOps AI, this means the platform should not only store station and satellite resources. It should also manage interface documents, received task windows, reception plans, orbit data files, confirmations, status reports and delivery records.

## 2. Platform boundary

GS LinkOps AI should implement only the downlink operation workflow:

- satellite and station resource records
- TLE / orbit data intake
- available receiving-window intake
- mission-window review
- reception plan draft
- reception plan confirmation record
- reception execution report
- station status report
- transfer and delivery record
- billing and report workflow

The platform should not implement spacecraft command execution, payload commanding or any uplink control function.

## 3. Satellite identifiers extracted from screenshots

| Satellite | Interface identifier |
|---|---|
| SV2-01 | 17C9 |
| SV2-02 | 18C9 |
| SV2-03 | 19C9 |
| SV2-04 | 1AC9 |
| SVN2-03 | 16C9 |
| SVN2-04 | 1BC9 |
| SVN3-01 | 1CC9 |
| SVN3-02 | 1DC9 |
| SVN1-03 | 1EC9 |
| SVN1-04 | 1FC9 |
| SVN1-05 | 20C9 |
| SVN1-06 | 21C9 |
| SVN2-05 | 22C9 |
| SVN2-06 | 23C9 |

Important: earlier chat information says SVN2-05 is 68378 and SVN2-06 is 68377. The screenshots show SVN2-05 as 22C9 and SVN2-06 as 23C9. These appear to be different identifier systems. The owner should ask the satellite side to confirm whether 68378 / 68377 are NORAD IDs, internal IDs, or another line-code system.

## 4. Polarization / channel meaning

The screenshots indicate two data transmission channels:

| Channel | Polarization |
|---|---|
| Channel 1 | left-hand circular polarization |
| Channel 2 | right-hand circular polarization |

For the SG-01 test mission, this is important because the platform must record which channel is used and then match it with the station configuration.

## 5. Ground subsystem codes extracted

| Subsystem | Code |
|---|---|
| Ground data receiving subsystem | GSCS |
| Task planning service subsystem | TSSS |
| Operation management / ground data processing subsystem | OMS |
| Business data processing subsystem | BDPS |
| Control center | SWSC |

The platform needs a setting for sender code and recipient code before it can generate external interface files.

## 6. Interface objects relevant to GS LinkOps AI

The screenshots include many file or message categories. For this platform, the useful categories are:

- reception plan
- reception plan acknowledgement
- reception execution result
- reception plan cancellation
- reception plan cancellation acknowledgement
- data transfer completion notice
- data retransmission request
- data retransmission acknowledgement
- station status report
- current orbit data file
- current orbit data file acknowledgement
- TLE orbit data file
- TLE orbit data acknowledgement
- available receiving-window query
- available receiving-window result
- receiving-window occupation request
- receiving-window occupation result
- receiving-window cancellation request
- receiving-window cancellation result
- tracking plan
- tracking plan acknowledgement
- tracking plan result
- tracking plan cancellation
- tracking plan cancellation result
- available receiving-arc plan

These should become platform objects, not just notes.

## 7. Transport modes shown in the material

The screenshots mention several transmission styles:

- real-time stream style packet transfer
- file transfer for XML-style files
- JSON message middleware
- REST-style JSON request and response

For the first usable version, GS LinkOps AI should not directly connect to external networks. It should generate structured drafts, files, reports and checklists. The owner confirms before anything is sent.

## 8. TLE interface meaning

The screenshots show that orbit data can include a list of TLE records with:

- originator
- recipient
- satellite code
- TLE line 1
- TLE line 2
- response code
- response message

This should become a platform feature called TLE Inbox.

TLE Inbox should:

- accept TLE paste or file import
- validate line 1 and line 2
- bind TLE to satellite code
- record source and received time
- warn if TLE is missing or stale
- send valid TLE to the orbit engine for pass-window calculation

## 9. Mission-window workflow meaning

The screenshots indicate a workflow around available windows, window occupation, window cancellation, task state query and task state notice.

For GS LinkOps AI, the safest workflow is:

1. Satellite side provides candidate windows.
2. Platform imports or records the windows.
3. AI checks station compatibility and conflicts.
4. Owner manually decides whether to accept.
5. Platform generates a reception plan draft.
6. Owner confirms before sending or using externally.

## 10. Reception plan workflow meaning

The screenshots indicate a workflow around reception plan, reception plan acknowledgement, execution result and cancellation.

Recommended mapping in the platform:

| Platform status | Interface meaning |
|---|---|
| Mission Draft | reception plan draft |
| Owner Confirmed | approved reception plan |
| Station Accepted | plan acknowledgement |
| Pass Completed | reception execution result |
| Mission Cancelled | plan cancellation and cancellation acknowledgement |

## 11. New platform modules required

Based on these screenshots, GS LinkOps AI should add one new main module:

External Interface Center

Submodules:

- TLE Inbox
- Mission Window Manager
- Reception Plan Manager
- Interface File Generator
- Interface Message Register
- Interface Audit Log

## 12. Owner questions to ask satellite side

1. What is the relationship between 68378 / 68377 and 22C9 / 23C9?
2. Are 68378 and 68377 NORAD IDs?
3. For SVN2-05 and SVN2-06, please provide latest TLE or OMM.
4. Which polarization channel should be used for the SG-01 test?
5. Which center code should GS or the commercial operator use in file names and messages?
6. Should GS LinkOps AI only generate draft files, or should it eventually connect to the operator interface?
7. Can the original Word or PDF interface document be provided for exact field extraction?

## 13. Implementation priority

Priority 1:

- Add External Interface Center to Owner Console.
- Add TLE Inbox.
- Add mission-window record table.
- Add reception-plan draft table.

Priority 2:

- Generate interface file names.
- Generate reception plan draft.
- Generate reception result draft.
- Generate cancellation draft.

Priority 3:

- Add external connection adapters only after owner approval and private configuration setup.
