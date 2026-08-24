# Space Ops Platform — Master Acceptance Checklist

> Branch: `space-ops-dev` only until final acceptance.
> Rule: implement one item → test it → fix it if needed → re-test → only then mark `[x]` and move to the next item.
> No item is considered complete based on code presence alone; it must be visibly verified in the running UI.

## 0. Global Gate

- [x] Six first-level modules fixed as OPS / TWIN / PLAN / GROUND / EARTH / ENG.
  - Description: No new first-level module may be added; Data Search + AOI stays separate.
  - Acceptance: Left navigation shows exactly six modules in the agreed order.

- [x] Development isolated to `space-ops-dev`.
  - Description: Keep high-frequency development away from `main`.
  - Acceptance: Current feature/visual work is committed only to `space-ops-dev`.

- [x] Canonical spacecraft IDs unified.
  - Description: Use `GF-7 02`, `SUPERVIEW NEO-1`, `SY-01`, `SAR-01` across all modules.
  - Acceptance: No legacy `SAT-*` / `OPT-*` aliases appear in the visible six-module workflow.

- [x] Canonical managed ground assets unified.
  - Description: Use `GS-SG-02`, `GS-SE-01`, `GS-IN-04`; external providers remain explicitly external.
  - Acceptance: Ground asset IDs are consistent across OPS / TWIN / PLAN / GROUND / ENG.

- [x] Shared Mission Context propagation available.
  - Description: Mission / AOI / Priority from the shell are visible to every module.
  - Acceptance: Switching modules keeps the same shared context and each module visibly shows it.

- [ ] Full 01→06 regression pass after visual upgrades.
  - Description: Re-test navigation, shared context, key controls, layout, and runtime behavior after all visual work.
  - Acceptance: No blocking regression in any module.

## 1. OPS — Visual Benchmark + Functional Regression

### A. Scene-first visual composition

- [x] OPS-01 Replace centered globe composition with orbital camera composition.
  - Description: Earth must enter the frame as a large partial limb/arc rather than a centered full circle.
  - Acceptance: First view does not read as “a round globe inside a dashboard”; Earth occupies only a partial arc with clear perspective.

- [x] OPS-02 Establish true foreground / midground / background depth.
  - Description: Satellites, orbital paths, Earth limb and distant space must have visibly different depth and scale.
  - Acceptance: At least one orbital element reads in the foreground and others recede naturally into depth.

- [x] OPS-03 Upgrade Earth material and atmosphere.
  - Description: Use restrained surface texture, night/day treatment and atmospheric rim instead of a flat sphere look.
  - Acceptance: Earth reads as a spatial body with limb lighting, not a CSS-like circular object.

- [x] OPS-04 Make orbit geometry spatial rather than decorative.
  - Description: Orbits must wrap in 3D and disappear appropriately behind Earth.
  - Acceptance: Orbital paths have perspective and occlusion; no flat ellipse effect dominates the scene.

- [x] OPS-05 Satellite placement and scale by depth.
  - Description: Spacecraft markers/models should change apparent prominence with distance.
  - Acceptance: Selected/near spacecraft is clearly legible without all spacecraft appearing same-size and same-plane.

- [x] OPS-06 Ground stations become anchored surface nodes.
  - Description: Ground assets visually attach to Earth rather than float as generic dots.
  - Acceptance: `GS-SG-02`, `GS-SE-01`, `GS-IN-04` appear spatially attached to the surface.

- [ ] OPS-07 AOI becomes surface-bound mission geometry.
  - Description: `SG-PORT-04` should read as a footprint/area on the Earth surface, not a floating rectangle.
  - Acceptance: AOI follows Earth geometry/perspective and stays clearly tied to Singapore.

- [ ] OPS-08 Active links use restrained animated pulses.
  - Description: Show satellite-to-ground or mission link only when relevant; use low-frequency motion.
  - Acceptance: Link is visible, spatially connected and professional; no neon/game-like animation.

### B. HUD and information hierarchy

- [ ] OPS-09 Remove the “dashboard card wall” first impression.
  - Description: Scene owns the canvas; UI becomes overlay/HUD rather than boxed panels surrounding a map.
  - Acceptance: First glance is dominated by the orbital scene, not six equally weighted cards.

- [ ] OPS-10 Rebuild KPI hierarchy.
  - Description: Show only high-value global KPIs in the first view; secondary metrics become subdued.
  - Acceptance: One or two key states dominate; remaining metrics are readable but visually secondary.

- [ ] OPS-11 Mission Stack becomes a lightweight overlay.
  - Description: Mission queue remains functional but visually floats over the scene.
  - Acceptance: Queue is usable without blocking the main orbital view.

- [ ] OPS-12 Mission Copilot becomes a command-console HUD.
  - Description: Preserve existing prototype planning logic while upgrading the visual treatment.
  - Acceptance: Input, Generate, Clear and output remain fully functional after the redesign.

- [ ] OPS-13 Selected object HUD.
  - Description: Clicking spacecraft/ground/AOI reveals focused operational details without opening a heavy dashboard panel.
  - Acceptance: Click selection visibly changes selected state and shows the object ID / status context.

- [ ] OPS-14 Bottom mission timeline.
  - Description: Convert time-oriented operational information into a compact bottom timeline strip.
  - Acceptance: Upcoming mission/contact events are visible in chronological order without covering the scene.

- [ ] OPS-15 Alert visual treatment.
  - Description: Alerts use restrained amber/rose signaling and do not overpower nominal operations.
  - Acceptance: Alert is immediately noticeable but not the largest visual element on the page.

### C. Interaction and motion

- [ ] OPS-16 Smooth camera focus on selected spacecraft.
  - Description: Object click moves camera toward a useful operational angle rather than only changing text.
  - Acceptance: Focus transition is smooth and reversible with RESET.

- [ ] OPS-17 AOI focus camera behavior.
  - Description: Selecting AOI transitions toward the target surface region.
  - Acceptance: AOI becomes the visual focus without losing orientation.

- [ ] OPS-18 Ground station focus camera behavior.
  - Description: Selecting a ground station shows its geometry relative to the current operational scene.
  - Acceptance: Camera transition is stable and does not clip through Earth.

- [ ] OPS-19 RESET restores approved global orbital viewpoint.
  - Description: Provide one canonical default visual composition.
  - Acceptance: RESET always returns to the same approved OPS hero framing.

- [ ] OPS-20 NIGHT mode visibly changes the rendered scene.
  - Description: Night mode should affect Earth/scene rendering, not only button state.
  - Acceptance: Toggle produces a clear but restrained visual change while preserving readability.

- [ ] OPS-21 Layer controls remain functional after scene redesign.
  - Description: ORBITS / SATELLITES / GROUND / AOI / GRID must continue to control corresponding layers.
  - Acceptance: Each toggle visibly changes only its intended layer.

- [ ] OPS-22 Zoom controls remain functional.
  - Description: Preserve zoom-in, zoom-out and safe altitude limits.
  - Acceptance: No broken camera state or impossible view after repeated use.

### D. Functional regression

- [ ] OPS-23 Dynamic UTC contact times use one visible runtime source.
  - Description: Avoid visible fixed historic contact times.
  - Acceptance: Upcoming Contacts and Copilot contact time are generated relative to current runtime state.

- [ ] OPS-24 SYNC state behavior still works.
  - Description: Preserve prototype synchronization feedback after visual changes.
  - Acceptance: Button visibly enters syncing state and completes without error.

- [ ] OPS-25 New Mission flow still works.
  - Description: Mission creation updates queue and active mission count.
  - Acceptance: Valid mission is added; missing required fields are blocked.

- [ ] OPS-26 Mission Copilot deterministic routing still works.
  - Description: SAR / maritime / optical objectives should choose appropriate canonical assets.
  - Acceptance: Different objective types produce different deterministic prototype plans.

- [ ] OPS-27 Exception dismissal still works.
  - Description: Preserve operator control of the exception banner.
  - Acceptance: Dismiss removes/hides the banner without breaking layout.

- [ ] OPS-28 Shared Mission Context visible in OPS.
  - Description: Shell Mission / AOI / Priority must be visible inside the OPS presentation layer.
  - Acceptance: Changing shell context updates OPS without reload.

- [ ] OPS-29 Responsive layout verification.
  - Description: Scene-first layout must degrade safely at narrower widths.
  - Acceptance: No horizontal overflow, inaccessible controls or clipped critical HUD at tested widths.

- [ ] OPS-30 Visual acceptance gate.
  - Description: OPS becomes the approved visual language for the remaining five modules.
  - Acceptance: User explicitly confirms the OPS visual direction before TWIN visual work begins.

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
