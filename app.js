/* Satellite Discovery Index
   Phase-1: AOI + time range -> archive coverage footprints (public/open STAC only)
   - No vendor inventory APIs
   - No scraping
   - No imagery hosting
*/

let viewer;
let aoiEntity = null;
let aoiBBox = null;         // {west,south,east,north} degrees
let aoiGeoJSON = null;      // GeoJSON Polygon/MultiPolygon (for STAC intersects)
let sources = [];
let activeSensor = "all";
let drawHandler = null;

// Coverage layers
let coverageDataSources = [];
let coverageFeaturesCount = 0;

const STAC_ENDPOINTS = [
  // Planetary Computer STAC (CORS OK)
  "https://planetarycomputer.microsoft.com/api/stac/v1"
  // 备用：AWS Earth Search（也可加）
  // "https://earth-search.aws.element84.com/v1"
];

const COLLECTIONS = [
  {
    key: "sentinel-2",
    name: "Sentinel-2",
    collections: ["sentinel-2-l2a"],
    color: "rgba(90,167,255,0.22)",
    outline: "rgba(90,167,255,0.95)",
  },
  {
    key: "sentinel-1",
    name: "Sentinel-1",
    collections: ["sentinel-1-grd"],
    color: "rgba(34,197,94,0.18)",
    outline: "rgba(34,197,94,0.90)",
  },
  {
    key: "landsat",
    name: "Landsat 8/9",
    collections: ["landsat-c2-l2"],
    color: "rgba(245,158,11,0.18)",
    outline: "rgba(245,158,11,0.90)",
  }
];

// Limits (avoid freezing the browser)
const MAX_ITEMS_PER_COLLECTION = 350;     // per collection per query
const MAX_TOTAL_FEATURES = 900;           // total drawn footprints

const els = {
  placeInput: () => document.getElementById("placeInput"),
  placeBtn: () => document.getElementById("placeBtn"),
  latInput: () => document.getElementById("latInput"),
  lonInput: () => document.getElementById("lonInput"),
  coordBtn: () => document.getElementById("coordBtn"),
  fileInput: () => document.getElementById("fileInput"),
  drawRectBtn: () => document.getElementById("drawRectBtn"),
  clearAoiBtn: () => document.getElementById("clearAoiBtn"),
  aoiSummary: () => document.getElementById("aoiSummary"),
  sourcesList: () => document.getElementById("sourcesList"),
  startMonth: () => document.getElementById("startMonth"),
  endMonth: () => document.getElementById("endMonth"),
  coverageBtn: () => document.getElementById("coverageBtn"),
  clearCoverageBtn: () => document.getElementById("clearCoverageBtn"),
  coverageStatus: () => document.getElementById("coverageStatus"),
  coverageSummary: () => document.getElementById("coverageSummary"),
};

function initCesium() {
  viewer = new Cesium.Viewer("cesiumContainer", {
    timeline: false,
    animation: false,
    geocoder: false,
    homeButton: true,
    baseLayerPicker: true,
    sceneModePicker: true,
    navigationHelpButton: false,
    fullscreenButton: true,
    infoBox: false,
    selectionIndicator: false,
    shouldAnimate: false,
  });

  viewer.scene.globe.depthTestAgainstTerrain = true;
  flyToLatLon(20, 0, 22000000);
}

function flyToLatLon(lat, lon, height = 2000000) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    duration: 1.2,
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

// ---------------- AOI ----------------

function bboxToGeoJSONPolygon(b) {
  // Handle dateline? (Phase-1 keep simple: assume no dateline crossing)
  return {
    type: "Polygon",
    coordinates: [[
      [b.west, b.south],
      [b.east, b.south],
      [b.east, b.north],
      [b.west, b.north],
      [b.west, b.south]
    ]]
  };
}

function setAOIBBoxFromDegrees(west, south, east, north) {
  aoiBBox = { west, south, east, north };
  aoiGeoJSON = bboxToGeoJSONPolygon(aoiBBox);

  const centerLat = (south + north) / 2;
  const centerLon = (west + east) / 2;

  const rect = Cesium.Rectangle.fromDegrees(west, south, east, north);
  if (aoiEntity) viewer.entities.remove(aoiEntity);
  aoiEntity = viewer.entities.add({
    name: "AOI",
    rectangle: {
      coordinates: rect,
      material: Cesium.Color.fromCssColorString("rgba(255,255,255,0.06)"),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString("rgba(255,255,255,0.85)"),
      outlineWidth: 2,
    },
  });

  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
    duration: 1.2,
  });

  renderAOISummary({ type: "bbox", west, south, east, north, centerLat, centerLon });
}

function renderAOISummary(aoi) {
  const el = els.aoiSummary();
  if (!aoi) { el.textContent = "None"; return; }

  if (aoi.type === "point") {
    el.innerHTML = `Point: <b>${aoi.lat.toFixed(6)}, ${aoi.lon.toFixed(6)}</b>`;
    return;
  }

  el.innerHTML =
    `BBox: W <b>${aoi.west.toFixed(4)}</b>, S <b>${aoi.south.toFixed(4)}</b>, ` +
    `E <b>${aoi.east.toFixed(4)}</b>, N <b>${aoi.north.toFixed(4)}</b><br/>` +
    `Center: <b>${aoi.centerLat.toFixed(4)}, ${aoi.centerLon.toFixed(4)}</b>`;
}

function clearAOI() {
  aoiBBox = null;
  aoiGeoJSON = null;
  if (aoiEntity) viewer.entities.remove(aoiEntity);
  aoiEntity = null;
  viewer.dataSources.removeAll();

  clearCoverage();
  renderAOISummary(null);
}

function clearCoverage() {
  // Remove coverage layers
  for (const ds of coverageDataSources) viewer.dataSources.remove(ds, true);
  coverageDataSources = [];
  coverageFeaturesCount = 0;
  els.coverageStatus().textContent = "";
  els.coverageSummary().innerHTML = "";
}

// ---------------- AOI drawing (rectangle) ----------------

function enableDrawRectangle() {
  if (drawHandler) { drawHandler.destroy(); drawHandler = null; }

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  drawHandler = handler;

  let startCart = null;
  let tempEntity = null;

  function cartesianToLonLat(cart) {
    const c = Cesium.Cartographic.fromCartesian(cart);
    return { lon: Cesium.Math.toDegrees(c.longitude), lat: Cesium.Math.toDegrees(c.latitude) };
  }

  handler.setInputAction((click) => {
    startCart = viewer.scene.pickPosition(click.position);
    if (!startCart) {
      const ray = viewer.camera.getPickRay(click.position);
      startCart = viewer.scene.globe.pick(ray, viewer.scene);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  handler.setInputAction((movement) => {
    if (!startCart) return;

    const endCart = viewer.scene.pickPosition(movement.endPosition) || (() => {
      const ray = viewer.camera.getPickRay(movement.endPosition);
      return viewer.scene.globe.pick(ray, viewer.scene);
    })();
    if (!endCart) return;

    const a = cartesianToLonLat(startCart);
    const b = cartesianToLonLat(endCart);

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
        outlineColor: Cesium.Color.fromCssColorString("rgba(168,85,247,0.95)"),
      },
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(() => {
    if (!startCart) return;

    if (tempEntity?.rectangle?.coordinates) {
      const rect = tempEntity.rectangle.coordinates.getValue(Cesium.JulianDate.now());
      const west = Cesium.Math.toDegrees(rect.west);
      const south = Cesium.Math.toDegrees(rect.south);
      const east = Cesium.Math.toDegrees(rect.east);
      const north = Cesium.Math.toDegrees(rect.north);

      viewer.entities.remove(tempEntity);
      tempEntity = null;

      setAOIBBoxFromDegrees(west, south, east, north);
    }

    startCart = null;
    if (drawHandler) { drawHandler.destroy(); drawHandler = null; }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  alert("Draw rectangle: click-drag on the globe, then release to finish.");
}

// ---------------- File upload ----------------

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
      computeBBoxAndGeoJSONFromDataSource(ds);
      URL.revokeObjectURL(url);
      return;
    }

    if (name.endsWith(".geojson") || name.endsWith(".json")) {
      const text = await file.text();
      const gj = JSON.parse(text);
      const ds = await Cesium.GeoJsonDataSource.load(gj, { clampToGround: true });
      viewer.dataSources.add(ds);
      await viewer.flyTo(ds);
      // Store geometry for STAC intersects (best effort)
      aoiGeoJSON = extractFirstPolygonGeometry(gj) || null;
      computeBBoxAndMaybeSet(gj, ds);
      return;
    }

    if (name.endsWith(".zip")) {
      const buf = await file.arrayBuffer();
      const gj = await shp(buf);
      const ds = await Cesium.GeoJsonDataSource.load(gj, { clampToGround: true });
      viewer.dataSources.add(ds);
      await viewer.flyTo(ds);
      aoiGeoJSON = extractFirstPolygonGeometry(gj) || null;
      computeBBoxAndMaybeSet(gj, ds);
      return;
    }

    alert("Unsupported file type. Use GeoJSON (.geojson/.json), KML (.kml), or SHP zip (.zip).");
  } catch (e) {
    console.error(e);
    alert("Failed to load AOI file. Verify format and try again.");
  }
}

function extractFirstPolygonGeometry(gj) {
  // Accept FeatureCollection or Feature; return Polygon/MultiPolygon geometry
  try {
    if (!gj) return null;
    if (gj.type === "FeatureCollection" && gj.features?.length) {
      for (const f of gj.features) {
        const g = f?.geometry;
        if (g && (g.type === "Polygon" || g.type === "MultiPolygon")) return g;
      }
    }
    if (gj.type === "Feature") {
      const g = gj.geometry;
      if (g && (g.type === "Polygon" || g.type === "MultiPolygon")) return g;
    }
    if (gj.type === "Polygon" || gj.type === "MultiPolygon") return gj;
  } catch {}
  return null;
}

function computeBBoxAndMaybeSet(gj, ds) {
  // Prefer bbox from GeoJSON if present
  if (Array.isArray(gj.bbox) && gj.bbox.length >= 4) {
    const [west, south, east, north] = gj.bbox;
    setAOIBBoxFromDegrees(west, south, east, north);
    return;
  }
  computeBBoxAndGeoJSONFromDataSource(ds);
}

function computeBBoxAndGeoJSONFromDataSource(ds) {
  const entities = ds.entities.values;
  let west = 180, east = -180, south = 90, north = -90;
  let has = false;

  const now = Cesium.JulianDate.now();
  for (const ent of entities) {
    if (ent.polygon && ent.polygon.hierarchy) {
      const h = ent.polygon.hierarchy.getValue(now);
      const positions = h?.positions || [];
      for (const p of positions) {
        const c = Cesium.Cartographic.fromCartesian(p);
        const lon = Cesium.Math.toDegrees(c.longitude);
        const lat = Cesium.Math.toDegrees(c.latitude);
        west = Math.min(west, lon); east = Math.max(east, lon);
        south = Math.min(south, lat); north = Math.max(north, lat);
        has = true;
      }
    }
    const pos = ent.position && ent.position.getValue(now);
    if (pos) {
      const c = Cesium.Cartographic.fromCartesian(pos);
      const lon = Cesium.Math.toDegrees(c.longitude);
      const lat = Cesium.Math.toDegrees(c.latitude);
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
      has = true;
    }
  }

  if (has) {
    setAOIBBoxFromDegrees(west, south, east, north);
  }
}

// ---------------- Place search (optional) ----------------

async function geocodePlace(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, {
    headers: { "Accept": "application/json" }
  });
  if (!r.ok) throw new Error("Geocoding failed");
  const data = await r.json();
  if (!data || !data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// ---------------- Sources list (simple) ----------------

function renderSources() {
  const root = els.sourcesList();
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

// ---------------- Archive Coverage (STAC) ----------------

function monthToDatetimeRange(startYYYYMM, endYYYYMM) {
  // start: YYYY-MM
  // end:   YYYY-MM
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);

  const start = new Date(Date.UTC(sy, sm - 1, 1, 0, 0, 0));
  // end month inclusive -> next month start
  const end = new Date(Date.UTC(ey, em, 1, 0, 0, 0));

  const isoStart = start.toISOString().replace(".000", "");
  const isoEnd = end.toISOString().replace(".000", "");
  return `${isoStart}/${isoEnd}`;
}

async function stacSearch(endpoint, body) {
  const url = `${endpoint}/search`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/geo+json,application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`STAC search failed: ${r.status}`);
  return await r.json();
}

async function queryArchiveCoverage() {
  if (!aoiBBox || !aoiGeoJSON) {
    alert("Please set an AOI first (draw rectangle or upload AOI).");
    return;
  }

  const start = els.startMonth().value;
  const end = els.endMonth().value;
  if (!start || !end) {
    alert("Please set a start and end month.");
    return;
  }
  if (start > end) {
    alert("Start month must be <= end month.");
    return;
  }

  clearCoverage();
  els.coverageStatus().textContent = "Querying open catalogs…";
  els.coverageSummary().innerHTML = "";

  const datetime = monthToDatetimeRange(start, end);
  const intersects = { type: "Feature", geometry: aoiGeoJSON, properties: {} };

  const endpoint = STAC_ENDPOINTS[0]; // use first by default

  const results = [];
  let totalDrawn = 0;

  for (const cfg of COLLECTIONS) {
    if (totalDrawn >= MAX_TOTAL_FEATURES) break;

    const body = {
      collections: cfg.collections,
      datetime,
      intersects,
      limit: Math.min(MAX_ITEMS_PER_COLLECTION, MAX_TOTAL_FEATURES - totalDrawn),
    };

    let fc;
    try {
      fc = await stacSearch(endpoint, body);
    } catch (e) {
      console.error(e);
      results.push({ name: cfg.name, items: 0, note: "Query failed" });
      continue;
    }

    const features = (fc.features || []).slice(0, body.limit);
    totalDrawn += features.length;
    coverageFeaturesCount += features.length;

    // Draw footprints on globe
    const ds = await Cesium.GeoJsonDataSource.load(
      { type: "FeatureCollection", features },
      { clampToGround: true }
    );

    // style
    ds.entities.values.forEach((ent) => {
      if (ent.polygon) {
        ent.polygon.material = Cesium.Color.fromCssColorString(cfg.color);
        ent.polygon.outline = true;
        ent.polygon.outlineColor = Cesium.Color.fromCssColorString(cfg.outline);
        ent.polygon.outlineWidth = 1;
      }
      if (ent.polyline) {
        ent.polyline.material = Cesium.Color.fromCssColorString(cfg.outline);
        ent.polyline.width = 1;
      }
    });

    viewer.dataSources.add(ds);
    coverageDataSources.push(ds);

    // Coverage estimate (rough): compare bbox overlap hits
    const cover = estimateCoverageByBbox(features, aoiBBox);
    results.push({
      name: cfg.name,
      items: features.length,
      coveragePct: cover.pct,
      coverageNote: cover.note
    });
  }

  // Update UI
  els.coverageStatus().textContent =
    `Done. Footprints drawn: ${coverageFeaturesCount}. Time range: ${start} → ${end}.`;

  renderCoverageSummary(results);

  // Optionally zoom to AOI if not already
  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(aoiBBox.west, aoiBBox.south, aoiBBox.east, aoiBBox.north),
    duration: 0.8,
  });
}

function estimateCoverageByBbox(features, bbox) {
  // Rough estimate: if many footprints intersect bbox, assume higher coverage.
  // For Phase-1, we avoid heavy geometry math.
  // pct = min(100, hits / 30 * 100) heuristic.
  let hits = 0;
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    const gb = geomBbox(g);
    if (!gb) continue;
    if (bboxesIntersect(gb, bbox)) hits++;
  }
  const pct = Math.min(100, Math.round((hits / 30) * 100));
  let note = "Approx.";
  if (features.length === 0) note = "No items returned";
  return { pct, note };
}

function geomBbox(geom) {
  // Returns bbox {west,south,east,north} for Polygon/MultiPolygon (best effort)
  try {
    let coords = [];
    if (geom.type === "Polygon") coords = geom.coordinates.flat(1);
    else if (geom.type === "MultiPolygon") coords = geom.coordinates.flat(2);
    else return null;
    let west = 180, east = -180, south = 90, north = -90;
    for (const [lon, lat] of coords) {
      west = Math.min(west, lon);
      east = Math.max(east, lon);
      south = Math.min(south, lat);
      north = Math.max(north, lat);
    }
    return { west, south, east, north };
  } catch {
    return null;
  }
}

function bboxesIntersect(a, b) {
  return !(a.east < b.west || a.west > b.east || a.north < b.south || a.south > b.north);
}

function renderCoverageSummary(rows) {
  const root = els.coverageSummary();
  root.innerHTML = "";

  for (const r of rows) {
    const div = document.createElement("div");
    div.className = "source";
    const pct = (typeof r.coveragePct === "number") ? `${r.coveragePct}%` : "—";
    div.innerHTML = `
      <div class="sourceTop">
        <div class="sourceName">${escapeHTML(r.name)}</div>
        <div class="tagRow" style="margin:0">
          <span class="tag">Items: ${r.items}</span>
          <span class="tag">Coverage: ${pct}</span>
          <span class="tag">${escapeHTML(r.coverageNote || "")}</span>
        </div>
      </div>
      <div class="sourceDesc">
        Footprints only (public/open catalog). No guarantee of deliverability or commercial availability.
      </div>
    `;
    root.appendChild(div);
  }
}

// ---------------- UI wiring ----------------

function wireUI() {
  els.coordBtn().addEventListener("click", () => {
    const lat = parseFloat(els.latInput().value);
    const lon = parseFloat(els.lonInput().value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      alert("Please enter valid lat/lon.");
      return;
    }
    flyToLatLon(lat, lon, 3000000);
    // point isn't AOI yet; user can still draw/upload
    renderAOISummary({ type: "point", lat, lon });
  });

  els.placeBtn().addEventListener("click", async () => {
    const q = (els.placeInput().value || "").trim();
    if (!q) return;
    try {
      const res = await geocodePlace(q);
      if (!res) { alert("No result."); return; }
      flyToLatLon(res.lat, res.lon, 2500000);
      renderAOISummary({ type: "point", lat: res.lat, lon: res.lon });
    } catch {
      alert("Place search failed.");
    }
  });

  els.fileInput().addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    await handleFileUpload(file);
    e.target.value = "";
  });

  els.drawRectBtn().addEventListener("click", () => enableDrawRectangle());
  els.clearAoiBtn().addEventListener("click", () => clearAOI());

  els.coverageBtn().addEventListener("click", () => queryArchiveCoverage());
  els.clearCoverageBtn().addEventListener("click", () => clearCoverage());

  // default time range (last 12 months)
  const now = new Date();
  const end = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,"0")}`;
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-11, 1));
  const start = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth()+1).padStart(2,"0")}`;
  els.startMonth().value = start;
  els.endMonth().value = end;
}

async function main() {
  initCesium();
  wireUI();
  sources = await loadJSON("./data/sources.json");
  renderSources();
  renderAOISummary(null);
}

main().catch((e) => {
  console.error(e);
  alert("App init failed. Check console.");
});
