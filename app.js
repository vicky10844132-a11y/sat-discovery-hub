/* =========================================================
   Satellite Discovery Index — 2D Stable Map (Leaflet)
   - Open / No login
   - AOI: draw rectangle or upload GeoJSON
   - Coverage Index: rule-based + optional open STAC signal
   - Footprints: Planetary Computer STAC (S2/S1/Landsat)
   - Programming: public TLE + satellite.js (reference)
========================================================= */

const el = (id) => document.getElementById(id);

let map;
let aoiLayer = null;
let aoiBounds = null;
let footprintsGroup = null;

let coverageRules = null;
let programmingCfg = null;
let sources = [];

const STAC_PC = "https://planetarycomputer.microsoft.com/api/stac/v1";

const OPEN_COLLECTIONS = [
  { name: "Sentinel-2", collections: ["sentinel-2-l2a"], color: "#5aa7ff" },
  { name: "Sentinel-1", collections: ["sentinel-1-grd"], color: "#22c55e" },
  { name: "Landsat 8/9", collections: ["landsat-c2-l2"], color: "#f59e0b" }
];

const MAX_ITEMS_PER_COLLECTION = 250;
const MAX_TOTAL_FEATURES = 650;

/* ---------------- utils ---------------- */
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

function isoMonthRange(startYYYYMM, endYYYYMM) {
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(ey, em, 1, 0, 0, 0));
  return `${start.toISOString()}/${end.toISOString()}`;
}

function boundsToBBox(bounds) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return [sw.lng, sw.lat, ne.lng, ne.lat];
}

function updateAOISummary(bounds) {
  const node = el("aoiSummary");
  if (!bounds) {
    node.textContent = "None";
    return;
  }
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  node.innerHTML =
    `W <b>${sw.lng.toFixed(4)}</b>, S <b>${sw.lat.toFixed(4)}</b>, ` +
    `E <b>${ne.lng.toFixed(4)}</b>, N <b>${ne.lat.toFixed(4)}</b>`;
}

/* ---------------- map init (DARK + fallback) ---------------- */
function initMap() {
  map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    worldCopyJump: true,
    zoomControl: true
  });

  // ✅ Best-looking & stable: CARTO Dark Matter (no key)
  // If blocked/unreachable, we fallback to standard OSM.
  const cartoDark = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      subdomains: "abcd",
      maxZoom: 20,
      attribution: "© OpenStreetMap contributors © CARTO"
    }
  );

  const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      subdomains: "abc",
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors"
    }
  );

  // Add Carto first
  cartoDark.addTo(map);

  // If any tile errors happen early, swap to OSM once
  let swapped = false;
  cartoDark.on("tileerror", () => {
    if (swapped) return;
    swapped = true;
    try {
      map.removeLayer(cartoDark);
      osm.addTo(map);
      console.warn("CARTO tiles failed. Fallback to OSM.");
    } catch {}
  });

  footprintsGroup = L.layerGroup().addTo(map);
}

/* ---------------- AOI ---------------- */
function setAOILayer(layer) {
  if (aoiLayer) map.removeLayer(aoiLayer);
  aoiLayer = layer;
  aoiLayer.addTo(map);

  aoiBounds = aoiLayer.getBounds ? aoiLayer.getBounds() : null;
  if (aoiBounds) map.fitBounds(aoiBounds, { padding: [18, 18] });
  updateAOISummary(aoiBounds);
}

function clearAOI() {
  if (aoiLayer) map.removeLayer(aoiLayer);
  aoiLayer = null;
  aoiBounds = null;
  updateAOISummary(null);

  clearFootprints();
  clearCoverageIndex();
  clearProgramming();
}

function enableDrawRectangle() {
  let startLatLng = null;
  let tempRect = null;

  function onMouseDown(e) {
    startLatLng = e.latlng;
    map.dragging.disable();
  }
  function onMouseMove(e) {
    if (!startLatLng) return;
    const bounds = L.latLngBounds(startLatLng, e.latlng);
    if (tempRect) map.removeLayer(tempRect);
    tempRect = L.rectangle(bounds, {
      color: "#a855f7",
      weight: 2,
      fillOpacity: 0.12
    }).addTo(map);
  }
  function onMouseUp() {
    if (!startLatLng) return;

    map.dragging.enable();
    map.off("mousedown", onMouseDown);
    map.off("mousemove", onMouseMove);
    map.off("mouseup", onMouseUp);

    if (tempRect) {
      setAOILayer(tempRect);
      tempRect = null;
    }
    startLatLng = null;
  }

  map.on("mousedown", onMouseDown);
  map.on("mousemove", onMouseMove);
  map.on("mouseup", onMouseUp);

  alert("Draw an AOI rectangle by click-dragging on the map.");
}

async function handleFileUpload(file) {
  if (!file) return;
  const name = file.name.toLowerCase();
  if (!name.endsWith(".geojson") && !name.endsWith(".json")) {
    alert("Only GeoJSON (.geojson/.json) is supported.");
    return;
  }

  try {
    const text = await file.text();
    const geojson = JSON.parse(text);
    const layer = L.geoJSON(geojson, {
      style: { color: "#ffffff", weight: 2, fillOpacity: 0.10 }
    });
    setAOILayer(layer);
  } catch (e) {
    console.error(e);
    alert("Failed to parse GeoJSON.");
  }
}

/* ---------------- geocode ---------------- */
async function geocodePlace(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "Accept":"application/json" } });
  if (!r.ok) throw new Error("geocode failed");
  const data = await r.json();
  if (!data?.length) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

/* ---------------- sources UI ---------------- */
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

/* ---------------- Coverage Index ---------------- */
function clearCoverageIndex() {
  el("indexStatus").textContent = "";
  el("coverageIndex").innerHTML = "";
}

function aoiToRuleBbox() {
  if (!aoiBounds) return null;
  const sw = aoiBounds.getSouthWest();
  const ne = aoiBounds.getNorthEast();
  return { west: sw.lng, south: sw.lat, east: ne.lng, north: ne.lat };
}

function bboxIntersects(b1, b2) {
  return !(b2.west > b1.east || b2.east < b1.west || b2.south > b1.north || b2.north < b1.south);
}

function bboxCenter(b) {
  return { lon: (b.west + b.east) / 2, lat: (b.south + b.north) / 2 };
}

function ruleEvaluateAOI(rule, aoi) {
  const cov = rule.coverage || {};
  const center = bboxCenter(aoi);

  if (Array.isArray(cov.latRange) && cov.latRange.length === 2) {
    const [minLat, maxLat] = cov.latRange;
    if (center.lat < minLat || center.lat > maxLat) {
      return { level: "no", reason: `Outside stated latitude range (${minLat}..${maxLat}).` };
    }
  }

  if (Array.isArray(cov.bboxes) && cov.bboxes.length) {
    let hit = false;
    for (const b of cov.bboxes) {
      if (bboxIntersects(aoi, b)) { hit = true; break; }
    }
    if (!hit) return { level: "no", reason: "No overlap with stated coverage regions." };
  }

  const confidence = cov.confidence || "medium";
  const base = (confidence === "high") ? "ok" : (confidence === "low" ? "warn" : "warn");
  const reason = cov.notes || "Public coverage indicator (reference).";
  return { level: base, reason };
}

async function stacSearchPC(body) {
  const r = await fetch(`${STAC_PC}/search`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "Accept":"application/geo+json,application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`STAC search failed: ${r.status}`);
  return await r.json();
}

async function runCoverageIndex() {
  if (!aoiBounds) return alert("Please set an AOI first (draw rectangle or upload GeoJSON).");

  clearCoverageIndex();
  el("indexStatus").textContent = "Running coverage index (public rules + optional open STAC signals)…";

  const aoi = aoiToRuleBbox();
  const rows = [];

  for (const p of (coverageRules?.providers || [])) {
    const ev = ruleEvaluateAOI(p, aoi);
    rows.push({
      name: p.name,
      family: p.family || "",
      sensor: (p.sensors || []).join(", "),
      level: ev.level,
      desc: ev.reason,
      note: p.publicNote || ""
    });
  }

  const start = el("startMonth").value;
  const end = el("endMonth").value;
  if (start && end && start <= end) {
    const datetime = isoMonthRange(start, end);
    const bbox = boundsToBBox(aoiBounds);

    for (const cfg of OPEN_COLLECTIONS) {
      let ok = false;
      try {
        const fc = await stacSearchPC({ collections: cfg.collections, datetime, bbox, limit: 1 });
        ok = (fc.features || []).length > 0;
      } catch { ok = false; }

      rows.push({
        name: `${cfg.name} (Open STAC signal)`,
        family: "Open",
        sensor: "open archive",
        level: ok ? "ok" : "no",
        desc: ok ? `Public open signal found in ${start} → ${end}.` : `No open signal found in ${start} → ${end}.`,
        note: "Reference only."
      });
    }
  } else {
    rows.push({
      name: "Open STAC signal (optional)",
      family: "Tip",
      sensor: "—",
      level: "warn",
      desc: "To check public Sentinel/Landsat signals, set a time range and run again.",
      note: ""
    });
  }

  renderCoverageIndex(rows);
  el("indexStatus").textContent = `Done. ${rows.length} indicators (reference).`;
}

function renderCoverageIndex(rows) {
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

    const meta = [
      r.family ? `<span class="tag">${escapeHTML(r.family)}</span>` : "",
      r.sensor ? `<span class="tag">${escapeHTML(r.sensor)}</span>` : "",
      pill
    ].filter(Boolean).join("");

    div.innerHTML = `
      <div class="indexTop">
        <div class="indexName">${escapeHTML(r.name)}</div>
        <div class="indexMeta">${meta}</div>
      </div>
      <div class="indexDesc">${escapeHTML(r.desc || "")}${r.note ? " " + escapeHTML(r.note) : ""}</div>
    `;

    root.appendChild(div);
  }
}

/* ---------------- Footprints ---------------- */
function clearFootprints() {
  footprintsGroup.clearLayers();
  el("footprintsStatus").textContent = "";
  el("footprintsSummary").innerHTML = "";
}

function renderFootprintsSummary(items) {
  const root = el("footprintsSummary");
  root.innerHTML = "";
  for (const it of items) {
    const div = document.createElement("div");
    div.className = "source";
    div.innerHTML = `
      <div class="sourceTop">
        <div class="sourceName">${escapeHTML(it.name)}</div>
        <span class="tag">Items: ${it.count}</span>
      </div>
      <div class="sourceDesc">${escapeHTML(it.note)}</div>
    `;
    root.appendChild(div);
  }
}

function footprintStyle(color) {
  return { color, weight: 1, opacity: 0.95, fillColor: color, fillOpacity: 0.08 };
}

async function loadFootprints() {
  if (!aoiBounds) return alert("Please set an AOI first (draw rectangle or upload GeoJSON).");

  const start = el("startMonth").value;
  const end = el("endMonth").value;
  if (!start || !end) return alert("Please set a time range first (start month / end month).");
  if (start > end) return alert("Start month must be <= end month.");

  clearFootprints();
  el("footprintsStatus").textContent = "Loading open STAC footprints…";

  const bbox = boundsToBBox(aoiBounds);
  const datetime = isoMonthRange(start, end);

  let total = 0;
  const summary = [];

  for (const cfg of OPEN_COLLECTIONS) {
    if (total >= MAX_TOTAL_FEATURES) break;
    const limit = Math.min(MAX_ITEMS_PER_COLLECTION, MAX_TOTAL_FEATURES - total);

    let fc;
    try {
      fc = await stacSearchPC({ collections: cfg.collections, datetime, bbox, limit });
    } catch (e) {
      console.warn(e);
      summary.push({ name: cfg.name, count: 0, note: "Query failed (network/CORS). Reference only." });
      continue;
    }

    const features = (fc.features || []).slice(0, limit);
    total += features.length;

    if (features.length) {
      const layer = L.geoJSON({ type:"FeatureCollection", features }, {
        style: footprintStyle(cfg.color),
        onEachFeature: (feature, lyr) => {
          const id = feature.id || feature.properties?.id || "";
          const dt = feature.properties?.datetime || "";
          lyr.bindPopup(
            `<b>${escapeHTML(cfg.name)}</b><br/>` +
            (id ? `ID: ${escapeHTML(id)}<br/>` : "") +
            (dt ? `Time: ${escapeHTML(dt)}` : "Time: —")
          );
        }
      });
      footprintsGroup.addLayer(layer);
    }

    summary.push({ name: cfg.name, count: features.length, note: `Footprints only (open STAC). ${start} → ${end}.` });
  }

  el("footprintsStatus").textContent = `Done. Loaded ${total} footprint(s) (visual reference).`;
  renderFootprintsSummary(summary);
}

/* ---------------- Programming (unchanged from your working version) ---------------- */
function clearProgramming() {
  el("progStatus").textContent = "";
  el("progResult").innerHTML = "";
}

function renderProgramming(rows) {
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
      ...(r.meta || []).slice(0, 3).map(m => `<span class="tag">${escapeHTML(m)}</span>`)
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

function approxHitAOI(lat, lon, aoiBbox, swathKm = 250) {
  const dLat = swathKm / 111.0;
  const dLon = swathKm / (111.0 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
  const west = aoiBbox[0] - dLon;
  const south = aoiBbox[1] - dLat;
  const east = aoiBbox[2] + dLon;
  const north = aoiBbox[3] + dLat;
  return (lat >= south && lat <= north && lon >= west && lon <= east);
}

async function fetchTextWithCache(url, cacheKey, ttlHours = 12) {
  const now = Date.now();
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached && cached.t && (now - cached.t) < ttlHours * 3600 * 1000 && cached.text) return cached.text;
  } catch {}

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  const text = await r.text();

  try { localStorage.setItem(cacheKey, JSON.stringify({ t: now, text })); } catch {}
  return text;
}

function parseTLE3Line(text) {
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

async function estimatePasses() {
  if (!aoiBounds) return alert("Please set an AOI first.");

  clearProgramming();
  const days = parseInt(el("progDays").value, 10) || 14;
  el("progStatus").textContent = `Fetching public TLE and estimating pass windows for the next ${days} day(s) (reference)…`;

  const bbox = boundsToBBox(aoiBounds);
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + days * 24 * 3600 * 1000);
  const stepSec = 60;

  const sats = programmingCfg?.satellites || [];
  const sourcesCfg = programmingCfg?.tleSources || {};
  if (!sats.length) { el("progStatus").textContent = "No satellites configured."; return; }

  const bySrc = new Map();
  for (const s of sats) {
    const key = s.tleSource || "default";
    if (!bySrc.has(key)) bySrc.set(key, []);
    bySrc.get(key).push(s);
  }

  const results = [];

  for (const [srcKey, group] of bySrc.entries()) {
    const src = sourcesCfg[srcKey];
    if (!src?.url) {
      results.push({ name: srcKey, level: "warn", desc: "TLE source not configured.", meta: [] });
      continue;
    }

    let tleText = "";
    try {
      tleText = await fetchTextWithCache(src.url, `tle_cache_${srcKey}`, src.ttlHours || 12);
    } catch (e) {
      console.warn(e);
      results.push({
        name: `${src.name || srcKey}`,
        level: "warn",
        desc: "Failed to fetch TLE (network restrictions possible). Try again later or use a different network. Planning reference only.",
        meta: ["TLE fetch failed"]
      });
      continue;
    }

    const tleArr = parseTLE3Line(tleText);
    const tleMap = new Map(tleArr.map(t => [t.name.toLowerCase(), t]));

    for (const sat of group) {
      const keyName = (sat.tleName || sat.name || "").toLowerCase();
      const match = tleMap.get(keyName) || tleArr.find(t => t.name.toLowerCase().includes(keyName));

      if (!match) {
        results.push({ name: sat.name, level: "warn", desc: "TLE not found in the feed (name mismatch).", meta: ["no TLE match"] });
        continue;
      }

      let satrec;
      try { satrec = satellite.twoline2satrec(match.l1, match.l2); }
      catch { results.push({ name: sat.name, level: "warn", desc: "Failed to parse TLE.", meta: ["TLE parse error"] }); continue; }

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
        const lat = geo.latitude * 180 / Math.PI;
        const lon = geo.longitude * 180 / Math.PI;

        const hit = approxHitAOI(lat, lon, bbox, swathKm);

        if (hit) {
          hitCount++;
          if (!inWindow) { inWindow = true; windowStart = new Date(t); }
        } else if (inWindow) {
          inWindow = false;
          windows.push({ start: windowStart, end: new Date(t) });
          windowStart = null;
        }

        if (windows.length >= 6) break;
      }

      if (inWindow && windowStart) windows.push({ start: windowStart, end: endTime });

      const minutes = hitCount * (stepSec / 60);
      const level = windows.length ? "ok" : "no";

      results.push({
        name: sat.name,
        level,
        desc: windows.length
          ? `Estimated ${windows.length} window(s) (swath≈${swathKm}km, step=1min). Hit time≈${Math.round(minutes)} min.`
          : `No window detected (simplified model / network / TLE may affect results).`,
        meta: windows.slice(0,5).map(w =>
          `${w.start.toISOString().slice(0,16).replace("T"," ")} → ${w.end.toISOString().slice(0,16).replace("T"," ")}`
        )
      });
    }
  }

  renderProgramming(results);
  el("progStatus").textContent = "Done. Planning reference only (no imaging guarantee).";
}

/* ---------------- wiring ---------------- */
function wireUI() {
  el("drawRectBtn").addEventListener("click", enableDrawRectangle);
  el("clearAoiBtn").addEventListener("click", clearAOI);

  el("fileInput").addEventListener("change", (e) => {
    handleFileUpload(e.target.files?.[0]);
    e.target.value = "";
  });

  el("placeBtn").addEventListener("click", async () => {
    const q = (el("placeInput").value || "").trim();
    if (!q) return;
    try {
      const res = await geocodePlace(q);
      if (!res) return alert("No result found.");
      map.setView(res, 8);
    } catch {
      alert("Place search failed (network restrictions possible).");
    }
  });

  el("coverageIndexBtn").addEventListener("click", runCoverageIndex);
  el("clearIndexBtn").addEventListener("click", clearCoverageIndex);

  el("footprintsBtn").addEventListener("click", loadFootprints);
  el("clearFootprintsBtn").addEventListener("click", clearFootprints);

  el("progBtn").addEventListener("click", estimatePasses);
  el("progClearBtn").addEventListener("click", clearProgramming);

  // default time range: last 12 months
  const now = new Date();
  const end = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,"0")}`;
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-11, 1));
  const start = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth()+1).padStart(2,"0")}`;
  el("startMonth").value = start;
  el("endMonth").value = end;

  updateAOISummary(null);
}

async function main() {
  initMap();
  wireUI();

  [sources, coverageRules, programmingCfg] = await Promise.all([
    loadJSON("./data/sources.json"),
    loadJSON("./data/coverage_rules.json"),
    loadJSON("./data/programming_satellites.json")
  ]);

  renderSources();
}

main().catch((e) => {
  console.error(e);
  alert("Initialization failed. Check console errors (usually data/*.json paths or network restrictions).");
});
