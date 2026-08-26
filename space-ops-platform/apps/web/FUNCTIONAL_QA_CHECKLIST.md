# Space Ops Platform — Per-Control Functional QA

> Visual baseline: `space-ops-v1` @ `31e52ac61d08f47fc4b6a63d1942e384e4629b8a` — frozen, do not redesign.
> Working branch: `space-ops-dev` only.
> Rule: one control → execute → verify visible result/state → fix if needed → re-check → mark `[x]` → next control.
> A source-code handler alone is NOT a pass.

## 01 OPS
- [x] OPS-F01 SYNC — click shows syncing state then returns to SYNC with visible completion feedback.
- [x] OPS-F02 NEW MISSION — opens mission drawer.
- [x] OPS-F03 New Mission CANCEL / close — closes drawer without side effects.
- [x] OPS-F04 CREATE & PLAN validation — empty required fields are blocked with visible feedback.
- [x] OPS-F05 CREATE & PLAN success — inserts mission into Mission Stack and updates Active Missions count.
- [x] OPS-F06 Mission Copilot RESOLVE MISSION — objective resolves to visible deterministic plan.
- [x] OPS-F07 Mission Copilot CLEAR — clears objective/output state correctly.
- [x] OPS-F08 Mission Stack row selection — updates mission context/output visibly.
- [ ] OPS-F09 ORBITS layer toggle — visibly hides/shows orbit geometry.
- [ ] OPS-F10 SATELLITES layer toggle — visibly hides/shows spacecraft.
- [ ] OPS-F11 GROUND layer toggle — visibly hides/shows managed ground assets.
- [ ] OPS-F12 AOI layer toggle — visibly hides/shows SG-PORT-04.
- [ ] OPS-F13 GRID layer toggle — visibly toggles grid/graticule.
- [ ] OPS-F14 NIGHT — visibly changes Earth rendering and toggles back.
- [ ] OPS-F15 Zoom + — camera moves closer within approved limit.
- [ ] OPS-F16 Zoom − — camera moves farther within approved limit.
- [ ] OPS-F17 RESET — restores approved global orbital viewpoint.
- [ ] OPS-F18 Spacecraft selection — camera focuses and Selected Object HUD updates.
- [ ] OPS-F19 Ground station selection — camera focuses and Selected Object HUD updates.
- [ ] OPS-F20 AOI selection — camera focuses Singapore AOI and HUD/state updates where applicable.
- [x] OPS-F21 Exception dismiss — alert disappears and does not block scene controls.
- [x] OPS-F22 HELP — opens and closes help drawer.
- [ ] OPS-F23 Dynamic Contacts — visible UTC rows are runtime-derived and readable.
- [ ] OPS-F24 Shared Mission Context — shell context change is visible in OPS.
- [ ] OPS-F25 OPS responsive / pointer-event sanity — overlays do not block intended controls.
- [ ] OPS-F26 OPS page gate — all OPS-F01…F25 pass before TWIN.
  - Verification note: F01–F08 and F21–F22 were executed through the current control paths with state/output assertions. Scene-dependent controls remain open until integrated 3D interaction verification; they are not passed from handler presence alone.

## 02 TWIN
- [ ] TWIN-F01 SIM RUNNING / PAUSED toggle.
- [ ] TWIN-F02 SYNC simulation epoch/state age reset.
- [ ] TWIN-F03 Resource search.
- [ ] TWIN-F04 Resource filter tabs ALL / SPACECRAFT / GROUND.
- [ ] TWIN-F05 Resource object selection updates Inspector and camera.
- [ ] TWIN-F06 COVERAGE toggle visibly changes scene.
- [ ] TWIN-F07 ANOMALY toggle visibly changes SAR-01 state/scene.
- [ ] TWIN-F08 LINKS toggle visibly changes links.
- [ ] TWIN-F09 Other scene layer controls remain functional.
- [ ] TWIN-F10 Capability DETAILS drawer open/close.
- [ ] TWIN-F11 Full object profile open/close.
- [ ] TWIN-F12 EXPORT SNAPSHOT BUNDLE produces a downloadable/export result.
- [ ] TWIN-F13 Zoom / RESET controls.
- [ ] TWIN-F14 Shared Mission Context visible.
- [ ] TWIN-F15 Responsive / pointer-event sanity.
- [ ] TWIN-F16 TWIN page gate.

## 03 PLAN
- [ ] PLAN-F01 IMPORT OBJECTIVE JSON valid input.
- [ ] PLAN-F02 IMPORT OBJECTIVE invalid input feedback.
- [ ] PLAN-F03 New Objective creation/update.
- [ ] PLAN-F04 VALIDATE required-field checks.
- [ ] PLAN-F05 VALIDATE success state.
- [ ] PLAN-F06 Optical/SAR constraint changes feasibility.
- [ ] PLAN-F07 Cloud constraint changes feasibility.
- [ ] PLAN-F08 Minimum elevation changes feasibility.
- [ ] PLAN-F09 Battery reserve changes feasibility.
- [ ] PLAN-F10 Partner Ground changes feasibility.
- [ ] PLAN-F11 Preemption changes feasibility.
- [ ] PLAN-F12 Ranking Preference changes plan order.
- [ ] PLAN-F13 GENERATE PLANS deterministic results.
- [ ] PLAN-F14 No-feasible-plan state.
- [ ] PLAN-F15 Plan A/B/C/D selection updates schedule/timeline.
- [ ] PLAN-F16 Opportunity / Weather / Resources / Contacts view switch.
- [ ] PLAN-F17 Exception Review reduces/open-conflict state correctly.
- [ ] PLAN-F18 SIMULATED COMMIT blocked before generate.
- [ ] PLAN-F19 SIMULATED COMMIT succeeds after valid generate.
- [ ] PLAN-F20 SYNC refreshes scenario window and forces revalidation.
- [ ] PLAN-F21 Opportunity-window graphics are attached to orbit paths, not floating bars.
- [ ] PLAN-F22 Zoom / RESET / scene layers.
- [ ] PLAN-F23 Shared Mission Context visible.
- [ ] PLAN-F24 Responsive / pointer-event sanity.
- [ ] PLAN-F25 PLAN page gate.

## 04 GROUND
- [ ] GROUND-F01 Ground resource filters.
- [ ] GROUND-F02 Band filters.
- [ ] GROUND-F03 Sort controls.
- [ ] GROUND-F04 Resource selection updates relevant contacts/scene.
- [ ] GROUND-F05 Contact selection updates Selected Access.
- [ ] GROUND-F06 Contact timeline selection/visibility.
- [ ] GROUND-F07 ACCESS layer toggle.
- [ ] GROUND-F08 STATIONS layer toggle.
- [ ] GROUND-F09 FOOTPRINT layer toggle.
- [ ] GROUND-F10 WEATHER layer toggle.
- [ ] GROUND-F11 Managed RESERVE opens action flow.
- [ ] GROUND-F12 Reservation confirm changes CANDIDATE → RESERVED and table/counters.
- [ ] GROUND-F13 Re-reserve is prevented/handled correctly.
- [ ] GROUND-F14 External QUOTE opens quote flow.
- [ ] GROUND-F15 Quote submit changes QUOTE_REQUIRED → QUOTE_REQUESTED.
- [ ] GROUND-F16 Repeat quote prevented/handled correctly.
- [ ] GROUND-F17 Exception Review / Ack updates counters.
- [ ] GROUND-F18 SYNC SCENARIO regenerates future 8h windows.
- [ ] GROUND-F19 Countdown matches selected simulated contact.
- [ ] GROUND-F20 Zoom / RESET / scene interaction.
- [ ] GROUND-F21 Shared Mission Context visible.
- [ ] GROUND-F22 Responsive / pointer-event sanity.
- [ ] GROUND-F23 GROUND page gate.

## 05 EARTH
- [ ] EARTH-F01 Source type tabs.
- [ ] EARTH-F02 Source mode filters.
- [ ] EARTH-F03 Source selection updates Source Inspector.
- [ ] EARTH-F04 EO/AOI layer toggle.
- [ ] EARTH-F05 Weather layer toggle.
- [ ] EARTH-F06 AIS layer toggle.
- [ ] EARTH-F07 Canonical AOI switch updates scene geometry.
- [ ] EARTH-F08 Invalid/unsupported AOI is blocked or clearly handled.
- [ ] EARTH-F09 COMPARE opens/changes comparison view.
- [ ] EARTH-F10 PREPARE EO+AIS state.
- [ ] EARTH-F11 RUN PROTOTYPE PRODUCT creates job.
- [ ] EARTH-F12 Pipeline PROCESSING → QC REVIEW.
- [ ] EARTH-F13 QC REVIEW → PACKAGE READY.
- [ ] EARTH-F14 PACKAGE READY → PACKAGE COMPLETE.
- [ ] EARTH-F15 No external delivery is falsely implied.
- [ ] EARTH-F16 SAVE RECIPE persists/local feedback.
- [ ] EARTH-F17 NEW PRODUCT flow.
- [ ] EARTH-F18 Dark Target connector remains BLOCKED.
- [ ] EARTH-F19 Exception ACK updates state.
- [ ] EARTH-F20 SYNC SCENARIO state recompute.
- [ ] EARTH-F21 Shared Mission Context / AOI consumption.
- [ ] EARTH-F22 Responsive / pointer-event sanity.
- [ ] EARTH-F23 EARTH page gate.

## 06 ENG
- [ ] ENG-F01 Spacecraft selection.
- [ ] ENG-F02 ORBIT / NAV / GNC analysis tabs show only correct engine content.
- [ ] ENG-F03 ORBITS layer toggle.
- [ ] ENG-F04 VECTORS layer toggle.
- [ ] ENG-F05 BODY FRAME layer toggle.
- [ ] ENG-F06 COVARIANCE layer toggle.
- [ ] ENG-F07 PROPAGATE creates RUNNING → COMPLETE job.
- [ ] ENG-F08 Solution COMPARE creates/updates visible result.
- [ ] ENG-F09 Maneuver evaluate creates/updates job/state.
- [ ] ENG-F10 ADCS slew creates/updates job/state.
- [ ] ENG-F11 Estimator reset creates/updates job/state.
- [ ] ENG-F12 Precision POD remains CONNECTOR_REQUIRED / BLOCKED.
- [ ] ENG-F13 NEW ANALYSIS validation 1–168 h.
- [ ] ENG-F14 NEW ANALYSIS valid duration updates Propagation Horizon.
- [ ] ENG-F15 EXPORT STATE produces export/download result.
- [ ] ENG-F16 SYNC SCENARIO resets scenario/state age.
- [ ] ENG-F17 FOCUS / camera behavior.
- [ ] ENG-F18 Timeline / event selection if interactive.
- [ ] ENG-F19 Shared Mission Context visible.
- [ ] ENG-F20 Responsive / pointer-event sanity.
- [ ] ENG-F21 ENG page gate.

## Final Functional Gate
- [ ] FREL-01 All six page gates passed.
- [ ] FREL-02 Cross-module navigation retest after functional fixes.
- [ ] FREL-03 Cross-module shared context retest after functional fixes.
- [ ] FREL-04 No visual regression against `space-ops-v1` baseline except approved PLAN opportunity-window fix.
- [ ] FREL-05 User spot-check acceptance.
- [ ] FREL-06 Only then resume REL-09 → REL-12 release flow.
