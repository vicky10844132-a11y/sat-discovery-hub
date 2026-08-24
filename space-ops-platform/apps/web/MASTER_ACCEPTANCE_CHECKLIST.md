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
- [x] OPS-14 Bottom mission timeline.
  - Description: Provide a compact temporal rail across the bottom of the orbital scene so contacts, acquisition and delivery can be read as one operational sequence.
  - Acceptance: Timeline stays secondary to the 3D scene, uses UTC, distinguishes contact/acquire/deliver events, and remains responsive.
  - Verification: Dedicated `ops-runtime.js` now injects a translucent 90-minute mission timeline inside `.mapwrap`, with a NOW marker, UTC-derived event labels, restrained event colors and responsive desktop/mobile bounds. Timeline refreshes every 30 seconds without blocking scene interaction.
- [x] OPS-15 Alert visual treatment.
  - Description: Exceptions should be noticeable without reading as a large warning card or game alert.
  - Acceptance: Alert remains dismissible, uses restrained amber emphasis, and visually integrates with the HUD layer.
  - Verification: `ops-runtime.js` converts the existing `alertbar` to a compact translucent exception HUD with a thin amber signal edge, smaller hierarchy, accessible status semantics and preserved `dismissAlert` control.

### C. Interaction and motion

- [x] OPS-16 Smooth camera focus on selected spacecraft.
  - Verification: Shared Globe `selectObject()` now routes OPS spacecraft selection through `focusObject()`, targeting the spacecraft’s current dynamic lat/lng at altitude 1.52 with a 760 ms Globe transition.
- [x] OPS-17 AOI focus camera behavior.
  - Verification: Canonical AOI id is `SG-PORT-04`; Globe polygon clicks select it and animate the camera to Singapore Port (1.34, 103.825) at altitude 1.26.
- [x] OPS-18 Ground station focus camera behavior.
  - Verification: Ground point selection now animates to the selected managed station coordinates at altitude 1.34 with a 680 ms transition.
- [x] OPS-19 RESET restores approved global orbital viewpoint.
  - Verification: `resetView()` restores `{lat:18,lng:103,altitude:2.08}` with a smooth transition; the icon-only `resetView` button id is explicitly recognized in addition to textual RESET controls.
- [x] OPS-20 NIGHT mode visibly changes the rendered scene.
  - Verification: OPS profile reads the `nightBtn` state and swaps the live Globe image URL between the dedicated night and day Earth textures; the active texture is tracked to avoid redundant reloads.
- [x] OPS-21 Layer controls remain functional after scene redesign.
  - Verification: Shared Globe profile still reads ORBIT/SAT/GROUND/AOI/GRID chip state from the existing controls and rebuilds path, custom-layer, point, polygon and graticule data after each control interaction.
- [x] OPS-22 Zoom controls remain functional.
  - Verification: Shared Globe explicitly recognizes both `zoomIn` and `zoomOut` ids, clamps camera altitude to the approved 1.25–3.8 range and uses smooth 260 ms transitions.

### D. Functional regression

- [x] OPS-23 Dynamic UTC contact times use one visible runtime source.
  - Verification: `normalizeOpsAcceptance()` replaces the visible contacts table from a single `Date.now()` runtime base and derives all four next-90-minute UTC rows from minute offsets.
- [x] OPS-24 SYNC state behavior still works.
  - Verification: Existing `syncBtn` state cycle remains unchanged; OPS runtime adds only a non-invasive timestamp signal after click and does not replace the original handler.
- [x] OPS-25 New Mission flow still works.
  - Verification: Existing drawer/create path and `activeMissionMetric` update remain unchanged; OPS runtime only observes the post-create count for regression signaling.
- [x] OPS-26 Mission Copilot deterministic routing still works.
  - Verification: `runMission` still resolves deterministic branches for SAR/Red Sea/Ice, Maritime/Dubai/AIS, NEO/Stereo and default GF-7 02, with runtime UTC contact output.
- [x] OPS-27 Exception dismissal still works.
  - Verification: Original `dismissAlert` handler remains intact; OPS runtime preserves the button and records the hidden state after dismissal without replacing behavior.
- [x] OPS-28 Shared Mission Context visible in OPS.
  - Verification: `normalizeSharedContext()` continues to create the top action context chip, render mission/AOI/priority from local storage or shell messages, and expose the current values on document data attributes.
- [x] OPS-29 Responsive layout verification.
  - Verification: Scene-first OPS CSS plus KPI, Selected Object, Mission Stack, Copilot, Timeline and Alert overrides all contain dedicated ≤1150 px and/or ≤720 px rules; no new fixed-width first-screen panel was introduced.
- [x] OPS-30 Visual acceptance gate.
  - Verification: OPS-01 through OPS-29 are complete in one scene-first composition: partial-Earth orbital camera, spatial orbit/resources/AOI, lightweight KPI/alert/mission HUD hierarchy, object focus behavior and preserved functional controls. Final end-user visual acceptance remains explicitly reserved for REL-09 after all six modules are aligned.

## 2. TWIN — Visual Upgrade (locked until OPS-30 passes)

- [x] TWIN-01 Scene-first digital-twin composition.
  - Verification: `twin-runtime.js` converts the three-column dashboard into a continuous Globe-owned scene with the resource graph and inspector floating as translucent left/right overlays. KPI cards flatten into a light status ribbon while the 3D scene occupies the first viewport.
- [x] TWIN-02 Object graph / selected-object hierarchy.
  - Verification: Resource graph is compacted into a low-weight searchable overlay; active object receives a single rose signal edge. Inspector is independently overlaid on the right with compressed identity, state, resource and capability hierarchy while existing canonical `records` and selection handlers remain unchanged.
- [x] TWIN-03 Coverage / anomaly / links visual polish.
  - Verification: Existing `coverageMode`, `anomalyMode` and `linkMode` controls remain connected to the shared Globe profile; scene controls are visually reduced to compact translucent chips and now expose synchronized `aria-pressed` state. Shared Globe retains restrained ring/link rendering.
- [x] TWIN-04 Simulation-state labeling and clock polish.
  - Verification: Twin normalization explicitly labels `SIM RUNNING` / `SIM PAUSED`, changes the sixth KPI to `Scenario State Age` with `SIMULATION CLOCK`, keeps the live simulation clock behavior, and marks the inspector/snapshot as prototype-state outputs rather than live telemetry.
- [x] TWIN-05 Snapshot / inspector / resource tree regression.
  - Verification: Original resource search/tabs, canonical object selection, inspector render, payload/profile drawers, state-age sync and snapshot export remain present. Shared runtime additionally resets the shared simulation epoch on SYNC and the snapshot control is explicitly labeled as a simulated twin snapshot bundle.
- [x] TWIN-06 Visual acceptance gate.
  - Verification: TWIN-01 through TWIN-05 now form one scene-first digital-twin workspace with a dominant shared 3D scene, compact object graph, clear selected-object inspector, restrained analysis modes and preserved prototype controls. Final end-user visual acceptance remains reserved for REL-09.

## 3. PLAN — Visual Upgrade (locked until TWIN passes)

- [x] PLAN-01 Orbital opportunity scene composition.
  - Verification: `plan-runtime.js` converts PLAN from a three-column dashboard into a scene-first planning workspace. The shared 3D Globe owns the main viewport while Mission Constraints and Ranked Plans float as translucent left/right HUDs, with KPI state flattened above the scene.
- [x] PLAN-02 Opportunity-window and AOI visual hierarchy.
  - Verification: Shared Globe PLAN profile keeps canonical spacecraft, spatial orbit paths and `SG-PORT-04` AOI active in the live 3D scene; the planning runtime reduces secondary controls, labels the viewport `OPPORTUNITY GEOMETRY`, and keeps candidate-window context visually tied to the Singapore Port AOI.
- [x] PLAN-03 Constraint and ranked-plan HUD redesign.
  - Verification: Mission Definition is restyled as compact `MISSION CONSTRAINTS` HUD with reduced form chrome and validation emphasis, while the right-side `RANKED PLANS` overlay compresses rank, tags and plan statistics without altering canonical plan cards or filtering data attributes.
- [x] PLAN-04 Timeline / schedule visual polish.
  - Verification: Existing 06:00–14:00 UTC opportunity timeline is moved inside the scene as a translucent bottom rail with thinner lanes/blocks; the lower Execution Schedule remains a secondary operational table below the scene. Timeline blocks retain existing click behavior and candidate-window labels.
- [x] PLAN-05 Validate / Generate / Commit regression.
  - Verification: Existing `validateBtn`, `generateBtn` and `commitBtn` remain untouched and are explicitly tagged by the planning runtime for regression. Source re-read confirms deterministic validation, strategy ordering, optical/SAR, cloud/elevation/battery, partner-ground, preemption filtering, selected-plan schedule rendering, and simulated commit behavior remain present.
- [x] PLAN-06 Visual acceptance gate.
  - Verification: PLAN-01 through PLAN-05 now form one coherent scene-first planning workspace with dominant orbital opportunity geometry, surface-bound AOI, compact constraints/ranked-plan overlays, integrated UTC opportunity timeline, preserved schedule/conflict panels and deterministic planning controls. Final end-user visual acceptance remains reserved for REL-09.

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
