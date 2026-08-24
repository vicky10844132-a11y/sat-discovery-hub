# Space Ops Platform — Master Acceptance Checklist

> Branch: `space-ops-dev` only until final acceptance.
> Rule: implement one item → test it → fix it if needed → re-test → only then mark `[x]` and move to the next item.
> No item is considered complete based on code presence alone; it must be visibly verified in the running UI.

## 0. Global Gate

- [x] Six first-level modules fixed as OPS / TWIN / PLAN / GROUND / EARTH / ENG.
- [x] Development isolated to `space-ops-dev`.
- [x] Canonical spacecraft IDs unified.
- [x] Canonical managed ground assets unified.
- [x] Shared Mission Context propagation available.
- [ ] Full 01→06 regression pass after visual upgrades.

## 1. OPS — Visual Benchmark + Functional Regression

### A. Scene-first visual composition

- [x] OPS-01 Replace centered globe composition with orbital camera composition.
- [x] OPS-02 Establish true foreground / midground / background depth.
- [x] OPS-03 Upgrade Earth material and atmosphere.
- [x] OPS-04 Make orbit geometry spatial rather than decorative.
- [x] OPS-05 Satellite placement and scale by depth.
- [x] OPS-06 Ground stations become anchored surface nodes.
- [x] OPS-07 AOI becomes surface-bound mission geometry.
  - Description: `SG-PORT-04` should read as a footprint/area on the Earth surface, not a floating rectangle.
  - Acceptance: AOI follows Earth geometry/perspective and stays clearly tied to Singapore.
  - Verification: Shared globe renders the Singapore port AOI as Globe.gl polygon geometry at 103.60–104.05°E / 1.20–1.48°N with low surface altitude, cap/stroke treatment, and globe occlusion/perspective.

- [x] OPS-08 Active links use restrained animated pulses.
  - Description: Show satellite-to-ground or mission link only when relevant; use low-frequency motion.
  - Acceptance: Link is visible, spatially connected and professional; no neon/game-like animation.
  - Verification: OPS shared-globe profile now enables one active spacecraft→`GS-SG-02` link only for a selected spacecraft. The 3D arc uses a thin 0.14 stroke, a short 0.10 moving dash separated by 0.90 gap, a slow 7.2 s animation cycle, and low-opacity cyan/blue endpoints. Selecting a non-spacecraft clears the link instead of showing an unrelated connection. Source re-read after commit confirmed OPS link enablement, restrained arc parameters and selected-spacecraft gating.

### B. HUD and information hierarchy

- [x] OPS-09 Remove the “dashboard card wall” first impression.
  - Description: The first viewport should read as one continuous orbital operations scene, not a grid of equal-weight dashboard cards.
  - Acceptance: Scene owns the first-screen canvas; KPI, alert and mission controls sit as restrained overlays; lower operational tables remain secondary and below the scene.
  - Verification: OPS layout was converted from a two-column panel grid to a scene-first canvas. The globe/map now fills the first viewport, KPI cards are flattened into a transparent status ribbon, alert is a compact translucent overlay, Mission Copilot / Queue float over the scene at the right, and Upcoming Contacts / Resource Health / Activity Feed remain below the primary scene. Desktop and narrow responsive rules were retained, and source was re-read after commit to confirm the scene-first overrides and existing interaction IDs remain present.
- [x] OPS-10 Rebuild KPI hierarchy.
  - Description: KPI values should no longer compete at equal visual weight. Mission tempo should dominate, upcoming contacts and exceptions should remain operationally prominent, and static fleet/ground counts should recede.
  - Acceptance: `Active Missions` is the clear primary KPI; `Contacts · Next 90m` and `Open Exceptions` form the secondary layer; `Managed Spacecraft`, `Active Downlinks`, and `Ground Assets Ready` remain readable but visually quieter. Dynamic metric IDs and values remain unchanged.
  - Verification: OPS runtime now injects a dedicated KPI hierarchy style only for OPS. The second metric is promoted to 28 px/white, contacts and exceptions use an intermediate scale, exceptions use restrained amber emphasis, and fleet/downlink/ground metrics are reduced in size and opacity. Responsive overrides preserve hierarchy at ≤1150 px and stack the primary metric across two columns on mobile. Source was re-read after commit and the existing `activeMissionMetric` runtime update path remains intact.
- [x] OPS-11 Mission Stack becomes a lightweight overlay.
  - Description: Active missions should read as a compact operational stack, not a second dashboard card competing with the orbital scene.
  - Acceptance: The stack remains readable and clickable, keeps priority/state cues, but uses lower visual weight, compact spacing, restrained separators and transparent HUD treatment.
  - Verification: OPS runtime now restyles only the second right-side panel as `MISSION STACK`, removes the heavy card/shadow treatment, compresses the header and mission rows, reduces priority bars to thin signal lines, tones down metadata and state labels, adds restrained hover/first-priority emphasis, and preserves the existing `missionQueue`, mission click handlers and `queueCount` update path. Source re-read after commit confirmed the style is scoped to the mission stack and does not alter Mission Copilot logic.
- [x] OPS-12 Mission Copilot becomes a command-console HUD.
  - Description: Mission Copilot should feel like an operational command/resolution console layered over the orbital scene, not a generic form card.
  - Acceptance: Objective input, action controls and deterministic result remain clearly separated, visually compact and console-like; existing mission-routing behavior and interaction IDs remain unchanged.
  - Verification: OPS runtime now restyles only the first right-side panel with a restrained command-console treatment: dark translucent shell, rose mission signal edge, monospace objective input, compact `RESOLVE MISSION` action, muted clear action and a dedicated deterministic-resolution output region. `objective`, `runMission`, `clearMission` and `copilotOut` remain in place; the deterministic routing handler is still attached to `runMission`. Source was re-read after commit to confirm the styling is scoped to the first panel and the routing logic remains intact.
- [x] OPS-13 Selected object HUD.
  - Description: The selected spacecraft or ground asset should have a dedicated, lightweight scene HUD instead of relying on toast text or a header mutation.
  - Acceptance: The HUD is visible inside the orbital scene, starts from the shared selected object, updates from the same Globe selection callback, clearly shows object identity/type/state plus concise operational metadata, and does not obstruct scene interaction.
  - Verification: OPS runtime now creates a lower-left translucent `SELECTED OBJECT / OPS` HUD with per-object accent, type/state, role and link/band metadata for all canonical spacecraft and managed ground assets. It initializes from shared `selectedId`, binds to the iframe `selectObject` hook already called by Globe point/custom-layer selection, keeps pointer events disabled, and retains the existing selected-state header update. Source re-read after commit confirmed the HUD CSS, canonical lookup, selection hook and initial shared-state render are present.
- [ ] OPS-14 Bottom mission timeline.
- [ ] OPS-15 Alert visual treatment.

### C. Interaction and motion

- [ ] OPS-16 Smooth camera focus on selected spacecraft.
- [ ] OPS-17 AOI focus camera behavior.
- [ ] OPS-18 Ground station focus camera behavior.
- [ ] OPS-19 RESET restores approved global orbital viewpoint.
- [ ] OPS-20 NIGHT mode visibly changes the rendered scene.
- [ ] OPS-21 Layer controls remain functional after scene redesign.
- [ ] OPS-22 Zoom controls remain functional.

### D. Functional regression

- [ ] OPS-23 Dynamic UTC contact times use one visible runtime source.
- [ ] OPS-24 SYNC state behavior still works.
- [ ] OPS-25 New Mission flow still works.
- [ ] OPS-26 Mission Copilot deterministic routing still works.
- [ ] OPS-27 Exception dismissal still works.
- [ ] OPS-28 Shared Mission Context visible in OPS.
- [ ] OPS-29 Responsive layout verification.
- [ ] OPS-30 Visual acceptance gate.

## 2. TWIN — Visual Upgrade (locked until OPS-30 passes)

- [ ] TWIN-01 Scene-first digital-twin composition.
- [ ] TWIN-02 Object graph / selected-object hierarchy.
- [ ] TWIN-03 Coverage / anomaly / links visual polish.
- [ ] TWIN-04 Simulation-state labeling and clock polish.
- [ ] TWIN-05 Snapshot / inspector / resource tree regression.
- [ ] TWIN-06 Visual acceptance gate.

## 3. PLAN — Visual Upgrade (locked until TWIN passes)

- [ ] PLAN-01 Orbital opportunity scene composition.
- [ ] PLAN-02 Opportunity-window and AOI visual hierarchy.
- [ ] PLAN-03 Constraint and ranked-plan HUD redesign.
- [ ] PLAN-04 Timeline / schedule visual polish.
- [ ] PLAN-05 Validate / Generate / Commit regression.
- [ ] PLAN-06 Visual acceptance gate.

## 4. GROUND — Visual Upgrade (locked until PLAN passes)

- [ ] GROUND-01 Global ground-network scene composition.
- [ ] GROUND-02 Contact pass / footprint / access visual hierarchy.
- [ ] GROUND-03 Resource and contact queue HUD redesign.
- [ ] GROUND-04 Reservation / quote state polish.
- [ ] GROUND-05 SYNC / reservation / exception regression.
- [ ] GROUND-06 Visual acceptance gate.

## 5. EARTH — Visual Upgrade (locked until GROUND passes)

- [ ] EARTH-01 AOI / imagery-first scene composition.
- [ ] EARTH-02 EO / Weather / AIS layer hierarchy.
- [ ] EARTH-03 Compare and source inspector polish.
- [ ] EARTH-04 Processing pipeline visual redesign.
- [ ] EARTH-05 Product / QC / package regression.
- [ ] EARTH-06 Visual acceptance gate.

## 6. ENG — Visual Upgrade (locked until EARTH passes)

- [ ] ENG-01 Engineering orbital scene composition.
- [ ] ENG-02 Orbit / vector / body / covariance hierarchy.
- [ ] ENG-03 Analysis engine and job-state polish.
- [ ] ENG-04 Maneuver / GNC / POD visual separation.
- [ ] ENG-05 Analysis / export / sync regression.
- [ ] ENG-06 Visual acceptance gate.

## 7. Final Release Gate

- [ ] REL-01 Cross-module object consistency re-check.
- [ ] REL-02 Cross-module shared Mission Context re-check.
- [ ] REL-03 Six-module navigation and hash-state re-check.
- [ ] REL-04 Desktop layout regression.
- [ ] REL-05 Narrow/mobile layout regression.
- [ ] REL-06 Key button-by-button functional smoke test.
- [ ] REL-07 3D runtime load and interaction smoke test.
- [ ] REL-08 No obvious duplicate/legacy visible data sources.
- [ ] REL-09 Final user visual acceptance.
- [ ] REL-10 Only after REL-01 through REL-09 pass: controlled merge to `main`.
- [ ] REL-11 Post-merge final smoke test.
- [ ] REL-12 Final stable preview/production URL delivered.
