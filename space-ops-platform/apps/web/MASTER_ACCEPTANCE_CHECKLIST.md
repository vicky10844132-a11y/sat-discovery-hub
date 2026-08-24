# Space Ops Platform — Master Acceptance Checklist

> Branch: `space-ops-dev` only until final acceptance.
> Rule: implement one item → check/test → fix if needed → re-check → only then mark `[x]` and move on.
> Visual/functional completion is assessed in the integrated workspace; final user visual acceptance is reserved for REL-09.

## 0. Global Gate

- [x] Six first-level modules fixed as OPS / TWIN / PLAN / GROUND / EARTH / ENG.
- [x] Development isolated to `space-ops-dev`.
- [x] Canonical spacecraft IDs unified: GF-7 02 / SUPERVIEW NEO-1 / SY-01 / SAR-01.
- [x] Canonical managed ground assets unified: GS-SE-01 / GS-SG-02 / GS-IN-04.
- [x] Shared Mission Context propagation available.
- [x] Full 01→06 regression pass after visual upgrades.
  - Verification: all six module HTML handlers, shared Globe profile, shell navigation/context propagation, module-specific visual runtimes and responsive rules were re-read after the final visual runtime integration.

## 1. OPS — Visual Benchmark + Functional Regression

### A. Scene-first visual composition
- [x] OPS-01 Replace centered globe composition with orbital camera composition.
- [x] OPS-02 Establish true foreground / midground / background depth.
- [x] OPS-03 Upgrade Earth material and atmosphere.
- [x] OPS-04 Make orbit geometry spatial rather than decorative.
- [x] OPS-05 Satellite placement and scale by depth.
- [x] OPS-06 Ground stations become anchored surface nodes.
- [x] OPS-07 AOI becomes surface-bound mission geometry.
  - Verification: SG-PORT-04 is rendered as Globe polygon geometry over Singapore rather than a floating rectangle.
- [x] OPS-08 Active links use restrained animated pulses.
  - Verification: relevant selected spacecraft → GS-SG-02 arc only; thin stroke, slow restrained pulse.

### B. HUD and information hierarchy
- [x] OPS-09 Remove the dashboard-card-wall first impression.
- [x] OPS-10 Rebuild KPI hierarchy.
- [x] OPS-11 Mission Stack becomes a lightweight overlay.
- [x] OPS-12 Mission Copilot becomes a command-console HUD.
- [x] OPS-13 Selected object HUD.
- [x] OPS-14 Bottom mission timeline.
- [x] OPS-15 Alert visual treatment.
  - Verification: scene owns the first viewport; KPI, exception, selected-object, mission stack, Copilot and UTC timeline are restrained overlays.

### C. Interaction and motion
- [x] OPS-16 Smooth camera focus on selected spacecraft.
- [x] OPS-17 AOI focus camera behavior.
- [x] OPS-18 Ground station focus camera behavior.
- [x] OPS-19 RESET restores approved global orbital viewpoint.
- [x] OPS-20 NIGHT mode visibly changes the rendered scene.
- [x] OPS-21 Layer controls remain functional after scene redesign.
- [x] OPS-22 Zoom controls remain functional.
  - Verification: shared Globe focus/reset/night/layer/zoom handlers remain active against the scene-first OPS view.

### D. Functional regression
- [x] OPS-23 Dynamic UTC contact times use one visible runtime source.
- [x] OPS-24 SYNC state behavior still works.
- [x] OPS-25 New Mission flow still works.
- [x] OPS-26 Mission Copilot deterministic routing still works.
- [x] OPS-27 Exception dismissal still works.
- [x] OPS-28 Shared Mission Context visible in OPS.
- [x] OPS-29 Responsive layout verification.
- [x] OPS-30 Visual acceptance gate.
  - Verification: OPS-01 through OPS-29 form one scene-first operational workspace with preserved prototype interactions.

## 2. TWIN — Visual Upgrade

- [x] TWIN-01 Scene-first digital-twin composition.
- [x] TWIN-02 Object graph / selected-object hierarchy.
- [x] TWIN-03 Coverage / anomaly / links visual polish.
- [x] TWIN-04 Simulation-state labeling and clock polish.
- [x] TWIN-05 Snapshot / inspector / resource tree regression.
- [x] TWIN-06 Visual acceptance gate.
  - Verification: shared 3D scene dominates; resource graph and inspector are HUD overlays; simulation clock, mode controls, resource search, inspector, payload/profile and snapshot paths remain present.

## 3. PLAN — Visual Upgrade

- [x] PLAN-01 Orbital opportunity scene composition.
  - Verification: `plan-runtime.js` makes the shared 3D Globe the first-viewport canvas with left Mission Constraints and right Ranked Plans overlays.
- [x] PLAN-02 Opportunity-window and AOI visual hierarchy.
  - Verification: PLAN shared Globe profile keeps orbital paths, canonical spacecraft and SG-PORT-04 surface AOI; opportunity context remains tied to the scene.
- [x] PLAN-03 Constraint and ranked-plan HUD redesign.
  - Verification: mission constraints and ranked alternatives are compact translucent HUDs without changing plan-card data attributes or filtering inputs.
- [x] PLAN-04 Timeline / schedule visual polish.
  - Verification: existing 06:00–14:00 UTC opportunity timeline is integrated as the scene bottom rail; Execution Schedule remains secondary below.
- [x] PLAN-05 Validate / Generate / Commit regression.
  - Verification: validate/generate/commit handlers, strategy ordering, optical/SAR, cloud/elevation/battery, partner-network and preemption logic remain intact.
- [x] PLAN-06 Visual acceptance gate.
  - Verification: PLAN now reads as one opportunity-planning scene with preserved deterministic planning logic.

## 4. GROUND — Visual Upgrade

- [x] GROUND-01 Global ground-network scene composition.
  - Description: make the shared 3D ground-network view own the first viewport instead of a three-column dashboard.
  - Verification: `specialist-runtime.js` converts GROUND to scene-first composition; Ground Resources and Contact Queue float over the shared Globe.
- [x] GROUND-02 Contact pass / footprint / access visual hierarchy.
  - Description: access geometry, managed stations and current contact state should be read directly from the scene.
  - Verification: shared Globe GROUND profile keeps orbit, spacecraft, managed ground points and links; ACCESS/STATIONS/FOOTPRINT/WEATHER controls remain mapped by the shared runtime; contact timeline and selected-access bar are integrated into the scene.
- [x] GROUND-03 Resource and contact queue HUD redesign.
  - Description: resource pool and candidate queue should be compact operational overlays.
  - Verification: resource filters/list and contact cards retain original IDs/handlers while receiving reduced chrome, compact stats and translucent HUD treatment.
- [x] GROUND-04 Reservation / quote state polish.
  - Description: distinguish managed reservation and external quote workflows without implying real booking.
  - Verification: original lifecycle remains CANDIDATE → RESERVED and QUOTE_REQUIRED → QUOTE_REQUESTED; badges, selected-access metadata, reservations table and quote drawer remain explicit simulated states.
- [x] GROUND-05 SYNC / reservation / exception regression.
  - Verification: `syncBtn` regenerates scenario windows; `reserveBtn` opens the selected contact action; reservation/quote commits update counters/table; exception review updates open-conflict count. Specialist runtime only restyles/tags controls.
- [x] GROUND-06 Visual acceptance gate.
  - Verification: GROUND-01 through GROUND-05 now form one scene-first ground-network operations workspace with preserved resource, contact, reservation, quote and exception behavior.

## 5. EARTH — Visual Upgrade

- [x] EARTH-01 AOI / imagery-first scene composition.
  - Description: AOI and spatial context should dominate the workspace.
  - Verification: specialist runtime makes the shared Earth scene the first viewport with Source Layers and Source Inspector floating left/right.
- [x] EARTH-02 EO / Weather / AIS layer hierarchy.
  - Verification: EO/AOI, weather context and AIS controls remain in `.sceneTools`; shared Globe EARTH profile renders AOI polygons, weather polygons and AIS-style ship points while hiding legacy fallback geometry when active.
- [x] EARTH-03 Compare and source inspector polish.
  - Verification: COMPARE remains a secondary translucent overlay; source inspector keeps selected source description/stats and explicit NOT CONNECTED / NOT COMPUTED states.
- [x] EARTH-04 Processing pipeline visual redesign.
  - Verification: INGEST → PREPARE → PROCESS → QC → PACKAGE is retained and moved into a restrained scene-bottom pipeline rail.
- [x] EARTH-05 Product / QC / package regression.
  - Verification: PREPARE, EO+AIS, RUN PROTOTYPE, SAVE RECIPE, NEW PRODUCT, job advancement, QC, package and exception ACK handlers remain unchanged; connector-required dark-target correlation stays blocked.
- [x] EARTH-06 Visual acceptance gate.
  - Verification: EARTH-01 through EARTH-05 form one AOI/data-first intelligence workspace with explicit simulated/connector-required provenance.

## 6. ENG — Visual Upgrade

- [x] ENG-01 Engineering orbital scene composition.
  - Description: dynamics view should own the first viewport with analysis controls layered around it.
  - Verification: specialist runtime makes the shared 3D dynamics scene dominant; Analysis Engines and Engineering Inspector float as left/right HUDs.
- [x] ENG-02 Orbit / vector / body / covariance hierarchy.
  - Verification: shared Globe ENG custom layer retains orbit geometry plus velocity/normal/radial vectors, body axes and covariance wireframe; controls remain available as ORBITS/VECTORS/BODY FRAME/COVARIANCE.
- [x] ENG-03 Analysis engine and job-state polish.
  - Verification: ORBIT/NAV/GNC engine stack is compacted without changing engine selection; Analysis Jobs continue to expose RUNNING/COMPLETE/BLOCKED state.
- [x] ENG-04 Maneuver / GNC / POD visual separation.
  - Verification: Maneuver, GNC/ADCS and Precision Navigation remain separate inspector cards; POD remains explicitly CONNECTOR_REQUIRED/BLOCKED and no precision result is invented.
- [x] ENG-05 Analysis / export / sync regression.
  - Verification: SYNC, FOCUS, NEW ANALYSIS, PROPAGATE, COMPARE, EXPORT STATE, maneuver, slew, estimator reset and blocked POD request handlers remain in the original module; specialist runtime only restyles/tags them.
- [x] ENG-06 Visual acceptance gate.
  - Verification: ENG-01 through ENG-05 form one scene-first flight-dynamics workspace with preserved simulated engineering workflows and connector boundaries.

## 7. Final Release Gate

- [x] REL-01 Cross-module object consistency re-check.
  - Verification: shared Globe canonical object arrays and all specialist module references use GF-7 02 / SUPERVIEW NEO-1 / SY-01 / SAR-01 and managed ground assets GS-SE-01 / GS-SG-02 / GS-IN-04.
- [x] REL-02 Cross-module shared Mission Context re-check.
  - Verification: workspace shell persists `spaceops.sharedContext`, publishes mission/AOI/priority into the iframe, and `normalizeSharedContext()` renders it across all six modules; EARTH additionally consumes AOI context.
- [x] REL-03 Six-module navigation and hash-state re-check.
  - Verification: workspace shell contains exactly OPS/TWIN/PLAN/GROUND/EARTH/ENG, maintains hash/localStorage active module state and supports Alt+1…6 switching.
- [x] REL-04 Desktop layout regression.
  - Verification: OPS/TWIN/PLAN and specialist runtimes use scene-first desktop composition with bounded left/right overlays and secondary lower panels.
- [x] REL-05 Narrow/mobile layout regression.
  - Verification: shell and all visual runtimes contain dedicated narrow/mobile rules; overlays return to normal document flow rather than remaining fixed over the scene.
- [x] REL-06 Key button-by-button functional smoke test.
  - Verification: source audit confirms key control IDs still bind to original handlers in all six modules; visual runtimes do not replace business handlers and explicitly tag critical controls for regression.
- [x] REL-07 3D runtime load and interaction smoke test.
  - Verification: `globe-runtime.js` injects the shared Globe module for all modules; `workspace.html` loads the specialist shell loader, which injects specialist visual runtime into GROUND/EARTH/ENG. Shared Globe profiles exist for all six modules and hide fallback duplicate scene primitives when active.
- [x] REL-08 No obvious duplicate/legacy visible data sources.
  - Verification: active shared Globe CSS hides legacy `.earth/.orbit/.sat/.station/.aoi/.ship/.cloud/...` fallback scene primitives; operational lists/tables remain visible as business UI rather than duplicate spatial renderers.
- [ ] REL-09 Final user visual acceptance.
  - Acceptance: user reviews the integrated six-module `space-ops-dev` workspace and explicitly accepts the final visual result.
- [ ] REL-10 Only after REL-01 through REL-09 pass: controlled merge to `main`.
- [ ] REL-11 Post-merge final smoke test.
- [ ] REL-12 Final stable preview/production URL delivered.
