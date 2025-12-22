Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMDIyZDUxMi1jMmYwLTRmMmUtYTExYi1iZTk3ZTQ0NTFlN2UiLCJpZCI6MzcxODg0LCJpYXQiOjE3NjY0MTI5NTl9.yEdV4LIiYFNNvdZP2sPh4d_lhOUuO9J_NDMBBTy5vl4"
let viewer;
let aoiEntity = null;
let aoiBBox = null; // {west,south,east,north} degrees
let sources = [];

// coverage layers
let coverageDataSources = [];
let coverageFeaturesCount = 0;

const STAC = "https://planetarycomputer.microsoft.com/api/stac/v1";

const COLLECTIONS = [
  {
    name: "Sentinel-2",
    collections: ["sentinel-2-l2a"],
    fill: "rgba(90,167,255,0.18)",
    outline: "rgba(90,167,255,0.95)"
  },
  {
    name: "Sentinel-1",
    collections: ["sentinel-1-grd"],
    fill: "rgba(34,197,94,0.14)",
    outline: "rgba(34,197,94,0.90)"
  },
  {
    name: "Landsat 8/9",
    collections: ["landsat-c2-l2"],
    fill: "rgba(245,158,11,0.14)",
    outline: "rgba(245,158,11,0.90)"
  }
];

// limits to avoid browser freeze
const MAX_ITEMS_PER_COLLECTION = 300;
const MAX_TOTAL_FEATURES = 800;

const el = (id) => document.getElementById(id);

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
  clearCoverage();
  renderAOISummary();
}

function clearCoverage() {
  for (const ds of coverageDataSources) viewer.dataSources.remove(ds, true);
  coverageDataSources = [];
  coverageFeaturesCount = 0;
  el("coverageStatus").textContent = "";
  el("coverageSummary").innerHTML = "";
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
    alert("AOI set. Now choose time range and click “Show archive coverage”.");
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

// ---------- Sources ----------
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

// ---------- STAC coverage ----------
function monthRangeToDatetime(startYYYYMM, endYYYYMM) {
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(ey, em, 1, 0, 0, 0)); // next month start
  return `${start.toISOString()}/${end.toISOString()}`;
}

async function stacSearch(body) {
  const r = await fetch(`${STAC}/search`, {
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

async function showCoverage() {
  if (!aoiBBox) {
    alert("You must set an AOI (draw rectangle or upload AOI). Flying to a point is not AOI.");
    return;
  }
  const start = el("startMonth").value;
  const end = el("endMonth").value;
  if (!start || !end) { alert("Please set start and end month."); return; }
  if (start > end) { alert("Start month must be <= end month."); return; }

  clearCoverage();
  el("coverageStatus").textContent = "Querying open catalogs…";
  el("coverageSummary").innerHTML = "";

  const datetime = monthRangeToDatetime(start, end);
  const bbox = [aoiBBox.west, aoiBBox.south, aoiBBox.east, aoiBBox.north];

  let total = 0;
  const summary = [];

  for (const cfg of COLLECTIONS) {
    if (total >= MAX_TOTAL_FEATURES) break;

    const limit = Math.min(MAX_ITEMS_PER_COLLECTION, MAX_TOTAL_FEATURES - total);
    const body = { collections: cfg.collections, datetime, bbox, limit };

    let fc;
    try {
      fc = await stacSearch(body);
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

    summary.push({ name: cfg.name, items: features.length, note: "Footprints only" });
  }

  el("coverageStatus").textContent =
    `Done. Footprints drawn: ${coverageFeaturesCount}. Time: ${start} → ${end}.`;

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
        ${escapeHTML(r.note)}. No guarantee of deliverability or commercial availability.
      </div>
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

  el("coverageBtn").addEventListener("click", () => showCoverage());
  el("clearCoverageBtn").addEventListener("click", () => clearCoverage());

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
  sources = await loadJSON("./data/sources.json");
  renderSources();
  renderAOISummary();
}

main().catch((e) => {
  console.error(e);
  alert("App init failed. Open console for details.");
});
