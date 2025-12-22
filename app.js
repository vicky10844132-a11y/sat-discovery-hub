/* ========= Satellite Discovery Index (Open / No Login) =========
   - Archive Coverage Index: rules + open STAC checks (reference only)
   - Open STAC Footprints: Planetary Computer STAC (open)
   - Programming Index: public TLE + satellite.js SGP4 (reference only)
*/

let viewer;
let aoiEntity = null;
let aoiBBox = null; // {west,south,east,north} degrees
let sources = [];

let coverageRules = null;
let programmingSatellites = null;

// open STAC coverage layers (footprints)
let coverageDataSources = [];
let coverageFeaturesCount = 0;

const STAC_PC = "https://planetarycomputer.microsoft.com/api/stac/v1";

const OPEN_COLLECTIONS = [
  { name: "Sentinel-2", collections: ["sentinel-2-l2a"], fill: "rgba(90,167,255,0.18)", outline: "rgba(90,167,255,0.95)" },
  { name: "Sentinel-1", collections: ["sentinel-1-grd"], fill: "rgba(34,197,94,0.14)", outline: "rgba(34,197,94,0.90)" },
  { name: "Landsat 8/9", collections: ["landsat-c2-l2"], fill: "rgba(245,158,11,0.14)", outline: "rgba(245,158,11,0.90)" }
];

// limits to avoid browser freeze
const MAX_ITEMS_PER_COLLECTION = 250;
const MAX_TOTAL_FEATURES = 650;

const el = (id) => document.getElementById(id);

function hideLoading() {
  const node = el("loading");
  if (node) node.classList.add("hidden");
}

function initCesium() {
  // ✅ No Cesium Ion: stable globe without logins
  const osm = new Cesium.OpenStreetMapImageryProvider({ url: "https://a.tile.openstreetmap.org/" });

  viewer = new Cesium.Viewer("cesiumContainer", {
    imageryProvider: osm,
    baseLayerPicker: false,
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    timeline: false,
    animation: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: true,
    navigationHelpButton: false,
    fullscreenButton: true,
    infoBox: false,
    selectionIndicator: false,
    shouldAnimate: true
  });

  const scene = viewer.scene;
  scene.globe.depthTestAgainstTerrain = false;
  scene.globe.baseColor = Cesium.Color.fromCssColorString("#050812");

  scene.skyAtmosphere.show = true;
  scene.skyAtmosphere.hueShift = -0.20;
  scene.skyAtmosphere.saturationShift = 0.10;
  scene.skyAtmosphere.brightnessShift = -0.08;

  scene.globe.enableLighting = true;

  scene.fog.enabled = true;
  scene.fog.density = 0.00008;
  scene.fog.minimumBrightness = 0.06;

  // Post FX (best-effort; safe guards)
  try {
    if (scene.postProcessStages?.fxaa) scene.postProcessStages.fxaa.enabled = true;
    const bloom = scene.postProcessStages?.bloom;
    if (bloom) {
      bloom.enabled = true;
      bloom.uniforms.glowOnly = false;
      bloom.uniforms.contrast = 128;
      bloom.uniforms.brightness = -0.18;
      bloom.uniforms.delta = 1.0;
      bloom.uniforms.sigma = 2.2;
      bloom.uniforms.stepSize = 1.0;
    }
  } catch {}

  flyToLatLon(20, 0, 22000000);
  setTimeout(hideLoading, 450);
}

function flyToLatLon(lat, lon, height = 2000000) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    duration: 1.1,
  });
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

async function loadJSON(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`Failed to load ${path}`);
  return await r.json();
}

function renderAOISummary() {
  const s = el("aoiSummary");
  if (!aoiBBox) { s.textContent = "None"; return; }
  const { west, south, east, north } = aoiBBox;
  s.innerHTML = `BBox: W <b>${west.toFixed(4)}</b>, S <b>${south.toFixed(4)}</b>, E <b>${east.toFixed(4)}</b>, N <b>${north.toFixed(4)}</b>`;
}

function setAOIBBox(west, south, east, north) {
  aoiBBox = { west, south, east, north };

  const rect = Cesium.Rectangle.fromDegrees(west, south, east, north);
  if (aoiEntity) viewer.entities.remove(aoiEntity);
  aoiEntity = viewer.entities.add({
    rectangle: {
      coordinates: rect,
      material: Cesium.Color.fromCssColorString("rgba(255,255,255,0.06)"),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString("rgba(255,255,255,0.85)"),
    }
  });

  viewer.camera.flyTo({ destination: rect, duration: 1.1 });
  renderAOISummary();
}

function clearAOI() {
  aoiBBox = null;
  if (aoiEntity) viewer.entities.remove(aoiEntity);
  aoiEntity = null;

  viewer.dataSources.removeAll();
  clearFootprints();
  clearIndexUI();
  clearProgrammingUI();

  renderAOISummary();
}

function clearFootprints() {
  for (const ds of coverageDataSources) viewer.dataSources.remove(ds, true);
  coverageDataSources = [];
  coverageFeaturesCount = 0;
  el("coverageStatus").textContent = "";
  el("coverageSummary").innerHTML = "";
}

function clearIndexUI() {
  el("indexStatus").textContent = "";
  el("coverageIndex").innerHTML = "";
}

function clearProgrammingUI() {
  el("progStatus").textContent = "";
  el("progResult").innerHTML = "";
}

// ---------- Draw Rectangle ----------
function enableDrawRectangle() {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  let startCart = null;
  let tempEntity = null;

  function pickCart(pos) {
    const p = viewer.scene.pickPosition(pos);
    if (p) return p;
    const ray = viewer.camera.getPickRay(pos);
    return viewer.scene.globe.pick(ray, viewer.scene);
  }
  function toLonLat(cart) {
    const c = Cesium.Cartographic.fromCartesian(cart);
    return { lon: Cesium.Math.toDegrees(c.longitude), lat: Cesium.Math.toDegrees(c.latitude) };
  }

  handler.setInputAction((e) => {
    startCart = pickCart(e.position);
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  handler.setInputAction((e) => {
    if (!startCart) return;
    const endCart = pickCart(e.endPosition);
    if (!endCart) return;

    const a = toLonLat(startCart);
    const b = toLonLat(endCart);
    const west = Math.min(a.lon, b.lon);
    const east = Math.max(a.lon, b.lon);
    const south = Math.min(a.lat, b.lat);
    const north = Math.max(a.lat, b.lat);
    const rect = Cesium.Rectangle.fromDegrees(west, south, east, north);

    if (tempEntity) viewer.entities.remove(tempEntity);
    tempEntity = viewer.entities.add({
      rectangle: {
        coordinates: rect,
        material: Cesium.Color.fromCssColorString("rgba(168,85,247,0.10)"),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("rgba(168,85,247,0.95)")
      }
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(() => {
    if (!startCart) return;

    if (tempEntity?.rectangle?.coordinates) {
      const rect = tempEntity.rectangle.coordinates.getValue(Cesium.JulianDate.now());
      viewer.entities.remove(tempEntity);
      tempEntity = null;

      const west = Cesium.Math.toDegrees(rect.west);
      const south = Cesium.Math.toDegrees(rect.south);
      const east = Cesium.Math.toDegrees(rect.east);
      const north = Cesium.Math.toDegrees(rect.north);

      setAOIBBox(west, south, east, north);
    }

    handler.destroy();
    alert("AOI set.");
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  alert("Draw rectangle: click-drag on the globe, then release to finish.");
}

// ---------- File upload (KML/GeoJSON/SHP zip) ----------
async function handleFileUpload(file) {
  if (!file) return;
  const name = file.name.toLowerCase();

  try {
    if (name.endsWith(".kml")) {
      const text = await file.text();
      const blob = new Blob([text], { type: "application/vnd.google-earth.kml+xml" });
      const url = URL.createObjectURL(blob);
      const ds = await Cesium.KmlDataSource.load(url, { camera: viewer.camera, canvas: viewer.canvas });
      viewer.dataSources.add(ds);
      await viewer.flyTo(ds);
      const bbox = computeBBoxFromDataSource(ds);
      if (bbox) setAOIBBox(bbox.west, bbox.south, bbox.east, bbox.north);
      URL.revokeObjectURL(url);
      return;
    }

    if (name.endsWith(".geojson") || name.endsWith(".json")) {
      const gj = JSON.parse(await file.text());
      const ds = await Cesium.GeoJsonDataSource.load(gj, { clampToGround: true });
      viewer.dataSources.add(ds);
      await viewer.flyTo(ds);
      const bbox = computeBBoxFromDataSource(ds);
      if (bbox) setAOIBBox(bbox.west, bbox.south, bbox.east, bbox.north);
      return;
    }

    if (name.endsWith(".zip")) {
      const buf = await file.arrayBuffer();
      const gj = await shp(buf);
      const ds = await Cesium.GeoJsonDataSource.load(gj, { clampToGround: true });
      viewer.dataSources.add(ds);
      await viewer.flyTo(ds);
      const bbox = computeBBoxFromDataSource(ds);
      if (bbox) setAOIBBox(bbox.west, bbox.south, bbox.east, bbox.north);
      return;
    }

    alert("Unsupported file type. Use GeoJSON (.geojson/.json), KML (.kml), or SHP zip (.zip).");
  } catch (e) {
    console.error(e);
    alert("Failed to load AOI file. Verify format and try again.");
  }
}

function computeBBoxFromDataSource(ds) {
  const now = Cesium.JulianDate.now();
  let west = 180, east = -180, south = 90, north = -90;
  let has = false;

  for (const ent of ds.entities.values) {
    if (ent.polygon?.hierarchy) {
      const h = ent.polygon.hierarchy.getValue(now);
      for (const p of (h?.positions || [])) {
        const c = Cesium.Cartographic.fromCartesian(p);
        const lon = Cesium.Math.toDegrees(c.longitude);
        const lat = Cesium.Math.toDegrees(c.latitude);
        west = Math.min(west, lon); east = Math.max(east, lon);
        south = Math.min(south, lat); north = Math.max(north, lat);
        has = true;
      }
    }
    const pos = ent.position?.getValue(now);
    if (pos) {
      const c = Cesium.Cartographic.fromCartesian(pos);
      const lon = Cesium.Math.toDegrees(c.longitude);
      const lat = Cesium.Math.toDegrees(c.latitude);
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
      has = true;
    }
  }
  return has ? { west, south, east, north } : null;
}

// ---------- Place search ----------
async function geocodePlace(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error("Geocoding failed");
  const data = await r.json();
  if (!data?.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// ---------- Sources UI ----------
function renderSources() {
  const root = el("sourcesList");
  root.innerHTML = "";
  for (const s of sources) {
    const div = document.createElement("div");
    div.className = "source";
    div.innerHTML = `
      <div class="sourceTop">
        <div class="sourceName">${escapeHTML(s.name)}</div>
        <a class="btn" href="${s.url}" target="_blank" rel="noopener">Open</a>
      </div>
      <div class="sourceDesc">${escapeHTML(s.desc || "")}</div>
    `;
    root.appendChild(div);
  }
}

// ---------- Time helpers ----------
function monthRangeToDatetime(startYYYYMM, endYYYYMM) {
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(ey, em, 1, 0, 0, 0)); // next month start
  return `${start.toISOString()}/${end.toISOString()}`;
}

// ---------- Open STAC footprints ----------
async function stacSearchPC(body) {
  const r = await fetch(`${STAC_PC}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/geo+json,application/json"
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`STAC search failed: ${r.status}`);
  return await r.json();
}

async function drawOpenFootprints() {
  if (!aoiBBox) {
    alert("You must set an AOI (draw rectangle or upload AOI).");
    return;
  }
  const start = el("startMonth").value;
  const end = el("endMonth").value;
  if (!start || !end) { alert("Please set start and end month."); return; }
  if (start > end) { alert("Start month must be <= end month."); return; }

  clearFootprints();
  el("coverageStatus").textContent = "Querying open STAC catalogs…";
  el("coverageSummary").innerHTML = "";

  const datetime = monthRangeToDatetime(start, end);
  const bbox = [aoiBBox.west, aoiBBox.south, aoiBBox.east, aoiBBox.north];

  let total = 0;
  const summary = [];

  for (const cfg of OPEN_COLLECTIONS) {
    if (total >= MAX_TOTAL_FEATURES) break;

    const limit = Math.min(MAX_ITEMS_PER_COLLECTION, MAX_TOTAL_FEATURES - total);
    const body = { collections: cfg.collections, datetime, bbox, limit };

    let fc;
    try {
      fc = await stacSearchPC(body);
    } catch (e) {
      console.error(e);
      summary.push({ name: cfg.name, items: 0, note: "Query failed" });
      continue;
    }

    const features = (fc.features || []).slice(0, limit);
    total += features.length;
    coverageFeaturesCount += features.length;

    if (features.length > 0) {
      const ds = await Cesium.GeoJsonDataSource.load(
        { type: "FeatureCollection", features },
        { clampToGround: true }
      );
      ds.entities.values.forEach((ent) => {
        if (ent.polygon) {
          ent.polygon.material = Cesium.Color.fromCssColorString(cfg.fill);
          ent.polygon.outline = true;
          ent.polygon.outlineColor = Cesium.Color.fromCssColorString(cfg.outline);
        }
        if (ent.polyline) {
          ent.polyline.material = Cesium.Color.fromCssColorString(cfg.outline);
          ent.polyline.width = 1;
        }
      });

      viewer.dataSources.add(ds);
      coverageDataSources.push(ds);
    }

    summary.push({ name: cfg.name, items: features.length, note: "Footprints only (open STAC)" });
  }

  el("coverageStatus").textContent =
    `Done. Open footprints drawn: ${coverageFeaturesCount}. Time: ${start} → ${end}.`;

  renderCoverageSummary(summary);

  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(aoiBBox.west, aoiBBox.south, aoiBBox.east, aoiBBox.north),
    duration: 0.8
  });
}

function renderCoverageSummary(rows) {
  const root = el("coverageSummary");
  root.innerHTML = "";
  for (const r of rows) {
    const div = document.createElement("div");
    div.className = "source";
    div.innerHTML = `
      <div class="sourceTop">
        <div class="sourceName">${escapeHTML(r.name)}</div>
        <span class="tag">Items: ${r.items}</span>
      </div>
      <div class="sourceDesc">
        ${escapeHTML(r.note)}. Reference only.
      </div>
    `;
    root.appendChild(div);
  }
}

// ---------- Coverage Index (Rules + optional open-STAC signal) ----------
function bboxIntersects(b1, b2) {
  // b: {west,south,east,north}
  return !(b2.west > b1.east || b2.east < b1.west || b2.south > b1.north || b2.north < b1.south);
}

function bboxCenter(b) {
  return { lon: (b.west + b.east) / 2, lat: (b.south + b.north) / 2 };
}

function clampLatLon(lat, lon) {
  const clat = Math.max(-89.999, Math.min(89.999, lat));
  let clon = lon;
  while (clon < -180) clon += 360;
  while (clon > 180) clon -= 360;
  return { lat: clat, lon: clon };
}

function ruleEvaluateAOI(rule, aoi) {
  // rule.coverage.bboxes: optional list of bbox regions. If absent => treat as global.
  // rule.coverage.latRange: optional
  // Returns indicator: ok/warn/no plus short reason.
  const cov = rule.coverage || {};
  const center = bboxCenter(aoi);

  // lat range check
  if (Array.isArray(cov.latRange) && cov.latRange.length === 2) {
    const [minLat, maxLat] = cov.latRange;
    if (center.lat < minLat || center.lat > maxLat) {
      return { level: "no", reason: `Outside stated latitude range (${minLat}..${maxLat}).` };
    }
  }

  // region bbox check
  if (Array.isArray(cov.bboxes) && cov.bboxes.length) {
    let hit = false;
    for (const b of cov.bboxes) {
      if (bboxIntersects(aoi, b)) { hit = true; break; }
    }
    if (!hit) return { level: "no", reason: "No overlap with stated coverage regions." };
  }

  // base confidence
  const confidence = cov.confidence || "medium";
  const base = (confidence === "high") ? "ok" : (confidence === "low" ? "warn" : "warn");

  const reason = cov.notes || "Public coverage indicator (reference).";
  return { level: base, reason };
}

async function runCoverageIndex() {
  if (!aoiBBox) return alert("Set AOI first.");

  clearIndexUI();
  el("indexStatus").textContent = "Running archive coverage index (public rules + open signals)…";

  const list = [];

  // 1) rule-based providers (your curated portals translated into safe indicators)
  for (const r of (coverageRules?.providers || [])) {
    const evalRes = ruleEvaluateAOI(r, aoiBBox);
    list.push({
      name: r.name,
      family: r.family || "",
      sensor: (r.sensors || []).join(", "),
      level: evalRes.level,
      desc: evalRes.reason,
      note: r.publicNote || ""
    });
  }

  // 2) optional: add open STAC “signal” based on quick count (not footprints draw)
  //    This helps users see open baseline without another click.
  try {
    const start = el("startMonth").value;
    const end = el("endMonth").value;

    if (start && end && start <= end) {
      const datetime = monthRangeToDatetime(start, end);
      const bbox = [aoiBBox.west, aoiBBox.south, aoiBBox.east, aoiBBox.north];

      for (const cfg of OPEN_COLLECTIONS) {
        const body = { collections: cfg.collections, datetime, bbox, limit: 1 };
        let ok = false;
        try {
          const fc = await stacSearchPC(body);
          ok = (fc.features || []).length > 0;
        } catch {}
        list.push({
          name: `${cfg.name} (Open STAC signal)`,
          family: "Open",
          sensor: "open archive",
          level: ok ? "ok" : "no",
          desc: ok ? `Public open archive signal found in ${start} → ${end}.` : `No open signal found in ${start} → ${end}.`,
          note: "Reference only. Not a guarantee."
        });
      }
    }
  } catch {}

  renderIndexList(list);
  el("indexStatus").textContent = `Done. ${list.length} indicators.`;
}

function renderIndexList(rows) {
  const root = el("coverageIndex");
  root.innerHTML = "";
  for (const r of rows) {
    const div = document.createElement("div");
    div.className = "indexItem";

    const pill = r.level === "ok"
      ? `<span class="pill ok">✅ likely</span>`
      : (r.level === "warn"
        ? `<span class="pill warn">⚠️ partial</span>`
        : `<span class="pill no">❌ none</span>`);

    const metaBits = [
      r.family ? `<span class="tag">${escapeHTML(r.family)}</span>` : "",
      r.sensor ? `<span class="tag">${escapeHTML(r.sensor)}</span>` : "",
      pill
    ].filter(Boolean).join("");

    div.innerHTML = `
      <div class="indexTop">
        <div class="indexName">${escapeHTML(r.name)}</div>
        <div class="indexMeta">${metaBits}</div>
      </div>
      <div class="indexDesc">${escapeHTML(r.desc || "")}${r.note ? " " + escapeHTML(r.note) : ""}</div>
    `;
    root.appendChild(div);
  }
}

// ---------- Programming Index (Future passes, reference) ----------
function deg2rad(d){ return d * Math.PI / 180; }
function rad2deg(r){ return r * 180 / Math.PI; }

// very simplified AOI hit test: sub-satellite point within expanded bbox (km -> degrees)
function approxHitAOI(lat, lon, aoi, swathKm = 250) {
  // convert km to degrees approx (latitude)
  const dLat = swathKm / 111.0;
  const dLon = swathKm / (111.0 * Math.max(0.2, Math.cos(deg2rad(lat))));

  const west = aoi.west - dLon;
  const east = aoi.east + dLon;
  const south = aoi.south - dLat;
  const north = aoi.north + dLat;

  // handle dateline simply by normalizing lon to [-180,180] and assuming AOI not spanning dateline
  return (lat >= south && lat <= north && lon >= west && lon <= east);
}

async function fetchTLEBestEffort(tleUrl, cacheKey, ttlHours = 12) {
  const now = Date.now();
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached && cached.t && (now - cached.t) < ttlHours * 3600 * 1000 && cached.text) {
      return cached.text;
    }
  } catch {}

  // Best effort network fetch
  const r = await fetch(tleUrl, { cache: "no-store" });
  if (!r.ok) throw new Error(`TLE fetch failed: ${r.status}`);
  const text = await r.text();

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ t: now, text }));
  } catch {}

  return text;
}

function parseTLE3Line(text) {
  // return array of {name,l1,l2}
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i];
    const l1 = lines[i+1];
    const l2 = lines[i+2];
    if (l1.startsWith("1 ") && l2.startsWith("2 ")) out.push({ name, l1, l2 });
  }
  return out;
}

async function estimateProgramming() {
  if (!aoiBBox) return alert("Set AOI first.");

  clearProgrammingUI();
  const days = parseInt(el("progDays").value, 10) || 14;
  el("progStatus").textContent = `Fetching public TLE (best-effort) and estimating passes for next ${days} days…`;

  const sats = (programmingSatellites?.satellites || []);
  if (!sats.length) {
    el("progStatus").textContent = "No satellites configured.";
    return;
  }

  // group by TLE source
  const bySrc = new Map();
  for (const s of sats) {
    const key = s.tleSource || "default";
    if (!bySrc.has(key)) bySrc.set(key, []);
    bySrc.get(key).push(s);
  }

  const results = [];

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + days * 24 * 3600 * 1000);
  const stepSec = 60; // 1-minute sampling (reference)

  for (const [srcKey, group] of bySrc.entries()) {
    const src = programmingSatellites.tleSources[srcKey];
    if (!src?.url) continue;

    let tleText = "";
    try {
      tleText = await fetchTLEBestEffort(src.url, `tle_cache_${srcKey}`, src.ttlHours || 12);
    } catch (e) {
      // If fetch fails, we cannot estimate for this source; continue safely
      console.warn(e);
      results.push({
        name: `${src.name || srcKey}`,
        level: "warn",
        desc: "TLE fetch failed in this environment. Try later or allow network access.",
        meta: ["TLE unavailable"]
      });
      continue;
    }

    const tleArr = parseTLE3Line(tleText);
    const tleMap = new Map(tleArr.map(t => [t.name.toLowerCase(), t]));

    for (const sat of group) {
      const keyName = (sat.tleName || sat.name || "").toLowerCase();
      const match =
        tleMap.get(keyName) ||
        tleArr.find(t => t.name.toLowerCase().includes(keyName));

      if (!match) {
        results.push({
          name: sat.name,
          level: "warn",
          desc: "TLE not found in source feed (name mismatch).",
          meta: ["no TLE match"]
        });
        continue;
      }

      // propagate
      let satrec;
      try {
        satrec = satellite.twoline2satrec(match.l1, match.l2);
      } catch {
        results.push({
          name: sat.name,
          level: "warn",
          desc: "TLE parse failed.",
          meta: ["TLE parse error"]
        });
        continue;
      }

      const swathKm = sat.swathKm || 250;
      let hitCount = 0;
      let windows = [];
      let inWindow = false;
      let windowStart = null;

      for (let t = startTime.getTime(); t <= endTime.getTime(); t += stepSec * 1000) {
        const date = new Date(t);

        const pv = satellite.propagate(satrec, date);
        if (!pv.position) continue;

        const gmst = satellite.gstime(date);
        const geo = satellite.eciToGeodetic(pv.position, gmst);

        const lat = rad2deg(geo.latitude);
        const lon = rad2deg(geo.longitude);

        const hit = approxHitAOI(lat, lon, aoiBBox, swathKm);

        if (hit) {
          hitCount++;
          if (!inWindow) {
            inWindow = true;
            windowStart = new Date(t);
          }
        } else {
          if (inWindow) {
            inWindow = false;
            const windowEnd = new Date(t);
            windows.push({ start: windowStart, end: windowEnd });
            windowStart = null;
          }
        }

        if (windows.length >= 6) break; // keep it short
      }

      // finalize open window
      if (inWindow && windowStart) {
        windows.push({ start: windowStart, end: endTime });
      }

      const minutes = hitCount * (stepSec / 60);
      const level = windows.length ? "ok" : "no";

      results.push({
        name: sat.name,
        level,
        desc: windows.length
          ? `Estimated ${windows.length} pass window(s) within ${days} days (swath≈${swathKm}km). Total hit time≈${Math.round(minutes)} min.`
          : `No pass window detected with this simplified model (swath≈${swathKm}km).`,
        meta: windows.slice(0,5).map(w => `${w.start.toISOString().slice(0,16).replace("T"," ")} → ${w.end.toISOString().slice(0,16).replace("T"," ")}`)
      });
    }
  }

  renderProgrammingList(results);
  el("progStatus").textContent = `Done. Planning reference only.`;
}

function renderProgrammingList(rows) {
  const root = el("progResult");
  root.innerHTML = "";
  for (const r of rows) {
    const div = document.createElement("div");
    div.className = "indexItem";

    const pill = r.level === "ok"
      ? `<span class="pill ok">✅ windows</span>`
      : (r.level === "warn"
        ? `<span class="pill warn">⚠️ limited</span>`
        : `<span class="pill no">❌ none</span>`);

    const metaBits = [
      pill,
      ...(r.meta || []).slice(0,3).map(m => `<span class="tag">${escapeHTML(m)}</span>`)
    ].join("");

    div.innerHTML = `
      <div class="indexTop">
        <div class="indexName">${escapeHTML(r.name)}</div>
        <div class="indexMeta">${metaBits}</div>
      </div>
      <div class="indexDesc">${escapeHTML(r.desc || "")}</div>
    `;
    root.appendChild(div);
  }
}

// ---------- Wiring ----------
function wireUI() {
  el("coordBtn").addEventListener("click", () => {
    const lat = parseFloat(el("latInput").value);
    const lon = parseFloat(el("lonInput").value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { alert("Enter valid lat/lon."); return; }
    flyToLatLon(lat, lon, 3000000);
  });

  el("placeBtn").addEventListener("click", async () => {
    const q = (el("placeInput").value || "").trim();
    if (!q) return;
    try {
      const res = await geocodePlace(q);
      if (!res) return alert("No result.");
      flyToLatLon(res.lat, res.lon, 2500000);
    } catch {
      alert("Place search failed.");
    }
  });

  el("fileInput").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    await handleFileUpload(file);
    e.target.value = "";
  });

  el("drawRectBtn").addEventListener("click", () => enableDrawRectangle());
  el("clearAoiBtn").addEventListener("click", () => clearAOI());

  // coverage index
  el("coverageIndexBtn").addEventListener("click", () => runCoverageIndex());
  el("clearIndexBtn").addEventListener("click", () => clearIndexUI());

  // open footprints
  el("footprintsBtn").addEventListener("click", () => drawOpenFootprints());
  el("clearFootprintsBtn").addEventListener("click", () => clearFootprints());

  // programming
  el("progBtn").addEventListener("click", () => estimateProgramming());
  el("progClearBtn").addEventListener("click", () => clearProgrammingUI());

  // default time range last 12 months
  const now = new Date();
  const end = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,"0")}`;
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-11, 1));
  const start = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth()+1).padStart(2,"0")}`;
  el("startMonth").value = start;
  el("endMonth").value = end;
}

async function main() {
  initCesium();
  wireUI();

  // existing sources list (transparency only)
  sources = await loadJSON("./data/sources.json");
  renderSources();

  // new rule/config files
  coverageRules = await loadJSON("./data/coverage_rules.json");
  programmingSatellites = await loadJSON("./data/programming_satellites.json");

  renderAOISummary();
  hideLoading();
}

main().catch((e) => {
  console.error(e);
  alert("App init failed. Open console for details.");
  hideLoading();
});
