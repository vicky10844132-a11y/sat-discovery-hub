let viewer;
let aoiEntity = null;
let aoiBBox = null;

let coverageDataSources = [];
let coverageFeaturesCount = 0;

const STAC = "https://planetarycomputer.microsoft.com/api/stac/v1";

const COLLECTIONS = [
  { name: "Sentinel-2", collections: ["sentinel-2-l2a"], fill: "rgba(90,167,255,0.18)", outline: "rgba(90,167,255,0.95)" },
  { name: "Sentinel-1", collections: ["sentinel-1-grd"], fill: "rgba(34,197,94,0.14)", outline: "rgba(34,197,94,0.90)" },
  { name: "Landsat 8/9", collections: ["landsat-c2-l2"], fill: "rgba(245,158,11,0.14)", outline: "rgba(245,158,11,0.90)" }
];

const MAX_ITEMS_PER_COLLECTION = 300;
const MAX_TOTAL_FEATURES = 800;

const el = (id) => document.getElementById(id);

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

function flyToLatLon(lat, lon, height = 2000000) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    duration: 1.0,
  });
}

function initCesium() {
  // ✅ If this alerts, the "black screen" is NOT your code. It's WebGL.
  if (!Cesium.FeatureDetection.supportsWebGL()) {
    alert("WebGL is not supported or disabled in this browser/device. Cesium cannot render the globe.");
    return;
  }

  // Try OSM tiles; if blocked, globe still shows via baseColor.
  const osm = new Cesium.OpenStreetMapImageryProvider({
    url: "https://a.tile.openstreetmap.org/",
    credit: ""
  });

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
    shouldAnimate: false
  });

  const scene = viewer.scene;

  // ✅ Make globe VERY visible even with no imagery
  scene.globe.baseColor = Cesium.Color.fromCssColorString("#1e90ff"); // bright blue
  scene.backgroundColor = Cesium.Color.fromCssColorString("#0b1220");
  scene.globe.show = true;

  // Atmosphere for strong visibility cue
  scene.skyAtmosphere.show = true;
  scene.globe.enableLighting = false;

  // Disable all post-processing in safe mode
  try {
    if (scene.postProcessStages?.fxaa) scene.postProcessStages.fxaa.enabled = false;
    if (scene.postProcessStages?.bloom) scene.postProcessStages.bloom.enabled = false;
  } catch {}

  // If WebGL context lost, tell user
  viewer.canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    alert("WebGL context lost (GPU/driver/browser issue). Refresh page, or try another browser/device.");
  }, false);

  // Put a visible test marker so you know rendering works
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    point: { pixelSize: 10, color: Cesium.Color.YELLOW }
  });

  flyToLatLon(20, 0, 22000000);
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
      material: Cesium.Color.fromCssColorString("rgba(255,255,255,0.08)"),
      outline: true,
      outlineColor: Cesium.Color.WHITE
    }
  });

  viewer.camera.flyTo({ destination: rect, duration: 0.8 });
  renderAOISummary();
}

function clearCoverage() {
  for (const ds of coverageDataSources) viewer.dataSources.remove(ds, true);
  coverageDataSources = [];
  coverageFeaturesCount = 0;
  el("coverageStatus").textContent = "";
  el("coverageSummary").innerHTML = "";
}

function clearAOI() {
  aoiBBox = null;
  if (aoiEntity) viewer.entities.remove(aoiEntity);
  aoiEntity = null;

  viewer.dataSources.removeAll();
  clearCoverage();
  renderAOISummary();
}

/* ---------- Draw AOI rectangle ---------- */
function enableDrawRectangle() {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  let startCart = null;
  let tempEntity = null;

  function pickCart(pos) {
    const ray = viewer.camera.getPickRay(pos);
    return viewer.scene.globe.pick(ray, viewer.scene);
  }
  function toLonLat(cart) {
    const c = Cesium.Cartographic.fromCartesian(cart);
    return { lon: Cesium.Math.toDegrees(c.longitude), lat: Cesium.Math.toDegrees(c.latitude) };
  }

  handler.setInputAction((e) => { startCart = pickCart(e.position); }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

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
        material: Cesium.Color.fromCssColorString("rgba(255,0,255,0.10)"),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#ff66ff")
      }
    });
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(() => {
    if (!startCart) return;
    if (tempEntity?.rectangle?.coordinates) {
      const rect = tempEntity.rectangle.coordinates.getValue(Cesium.JulianDate.now());
      viewer.entities.remove(tempEntity);
      tempEntity = null;

      setAOIBBox(
        Cesium.Math.toDegrees(rect.west),
        Cesium.Math.toDegrees(rect.south),
        Cesium.Math.toDegrees(rect.east),
        Cesium.Math.toDegrees(rect.north)
      );
    }
    handler.destroy();
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

/* ---------- Place search ---------- */
async function geocodePlace(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error("Geocoding failed");
  const data = await r.json();
  if (!data?.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

/* ---------- Upload AOI files (same as before) ---------- */
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
        west = Math.min(west, Cesium.Math.toDegrees(c.longitude));
        east = Math.max(east, Cesium.Math.toDegrees(c.longitude));
        south = Math.min(south, Cesium.Math.toDegrees(c.latitude));
        north = Math.max(north, Cesium.Math.toDegrees(c.latitude));
        has = true;
      }
    }
  }
  return has ? { west, south, east, north } : null;
}

/* ---------- Open STAC footprints ---------- */
function monthRangeToDatetime(startYYYYMM, endYYYYMM) {
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(ey, em, 1, 0, 0, 0));
  return `${start.toISOString()}/${end.toISOString()}`;
}

async function stacSearch(body) {
  const r = await fetch(`${STAC}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/geo+json,application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`STAC search failed: ${r.status}`);
  return await r.json();
}

async function showCoverage() {
  if (!aoiBBox) return alert("Set AOI first.");
  const start = el("startMonth").value;
  const end = el("endMonth").value;
  if (!start || !end) return alert("Set start & end month.");
  if (start > end) return alert("Start month must be <= end month.");

  clearCoverage();
  el("coverageStatus").textContent = "Querying open STAC…";
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
    try { fc = await stacSearch(body); }
    catch (e) {
      console.warn(e);
      summary.push({ name: cfg.name, items: 0, note: "Query failed" });
      continue;
    }

    const features = (fc.features || []).slice(0, limit);
    total += features.length;
    coverageFeaturesCount += features.length;

    if (features.length) {
      const ds = await Cesium.GeoJsonDataSource.load({ type: "FeatureCollection", features }, { clampToGround: true });
      ds.entities.values.forEach((ent) => {
        if (ent.polygon) {
          ent.polygon.material = Cesium.Color.fromCssColorString(cfg.fill);
          ent.polygon.outline = true;
          ent.polygon.outlineColor = Cesium.Color.fromCssColorString(cfg.outline);
        }
      });
      viewer.dataSources.add(ds);
      coverageDataSources.push(ds);
    }

    summary.push({ name: cfg.name, items: features.length, note: "Open footprints (reference)" });
  }

  el("coverageStatus").textContent = `Done. Footprints drawn: ${coverageFeaturesCount}`;
  renderCoverageSummary(summary);

  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(aoiBBox.west, aoiBBox.south, aoiBBox.east, aoiBBox.north),
    duration: 0.6
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
      <div class="sourceDesc">${escapeHTML(r.note || "")}</div>
    `;
    root.appendChild(div);
  }
}

/* ---------- UI wiring ---------- */
function wireUI() {
  el("coordBtn").addEventListener("click", () => {
    const lat = parseFloat(el("latInput").value);
    const lon = parseFloat(el("lonInput").value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return alert("Enter valid lat/lon.");
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
  el("clearAoiBtn").addE
