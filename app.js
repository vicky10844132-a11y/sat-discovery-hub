/* -----------------------------
   Utilities
------------------------------ */
const $ = id => document.getElementById(id);

function utcDateKey(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Unknown";
  return new Date(t).toISOString().slice(0,10);
}

function fmtByMode(iso, mode) {
  if (!iso) return "Unknown";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  if (mode === "date") return utcDateKey(iso);
  return new Date(t).toISOString().slice(0,16).replace("T"," ") + " UTC";
}

function getSatelliteName(feature, fallback) {
  const p = feature.properties || {};
  return p.platform || p.constellation || fallback || "Unknown satellite";
}

/* -----------------------------
   Map
------------------------------ */
const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const drawnItems = new L.FeatureGroup().addTo(map);
const resultsLayer = L.layerGroup().addTo(map);

let aoiGeom = null;
let mergedResults = [];

/* -----------------------------
   Draw AOI
------------------------------ */
map.addControl(new L.Control.Draw({
  draw: { polyline:false, circle:false, marker:false, circlemarker:false },
  edit: { featureGroup: drawnItems }
}));

map.on(L.Draw.Event.CREATED, e => {
  drawnItems.clearLayers();
  drawnItems.addLayer(e.layer);
  aoiGeom = e.layer.toGeoJSON().geometry;
  $("aoiStatus").textContent = "AOI set";
});

/* -----------------------------
   Sources (Open STAC)
------------------------------ */
const STAC = "https://earth-search.aws.element84.com/v1";

const SOURCES = [
  { id:"s2", title:"Sentinel-2", collection:"sentinel-2-l2a", color:"#2dd4bf" },
  { id:"s1", title:"Sentinel-1", collection:"sentinel-1-grd", color:"#fb7185" },
  { id:"ls", title:"Landsat",    collection:"landsat-c2-l2", color:"#60a5fa" }
];

$("sources").innerHTML = SOURCES.map(s =>
  `<label><input type="checkbox" id="src_${s.id}" checked> ${s.title}</label>`
).join("");

/* -----------------------------
   Query
------------------------------ */
$("btnQuery").onclick = async () => {
  if (!aoiGeom) return alert("Set AOI first");

  const start = $("startDate").value;
  const end = $("endDate").value;
  const datetime = (start && end) ? `${start}T00:00:00Z/${end}T23:59:59Z` : "..";

  resultsLayer.clearLayers();
  mergedResults = [];

  const raw = [];

  for (const s of SOURCES) {
    if (!$(`src_${s.id}`).checked) continue;

    const res = await fetch(`${STAC}/search`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        collections:[s.collection],
        intersects:aoiGeom,
        datetime,
        limit:200
      })
    });
    const json = await res.json();
    (json.features || []).forEach(f => {
      raw.push({
        satellite: getSatelliteName(f, s.title),
        datetime: f.properties.datetime,
        feature: f,
        color: s.color
      });
    });

    L.geoJSON(json.features, {
      style:{ color:s.color, weight:2, fillOpacity:0.08 },
      onEachFeature:(f,l)=>{
        l.bindPopup(
          `<b>${getSatelliteName(f,s.title)}</b><br/>${fmtByMode(f.properties.datetime,"datetime")}`
        );
      }
    }).addTo(resultsLayer);
  }

  mergedResults = mergeBySatelliteAndDate(raw);
  renderList();
};

function mergeBySatelliteAndDate(items) {
  const map = new Map();
  items.forEach(it => {
    const key = `${it.satellite}_${utcDateKey(it.datetime)}`;
    if (!map.has(key)) {
      map.set(key, {
        satellite: it.satellite,
        date: utcDateKey(it.datetime),
        times: [],
        features: [],
        color: it.color
      });
    }
    const g = map.get(key);
    g.times.push(it.datetime);
    g.features.push(it.feature);
  });
  return Array.from(map.values())
    .sort((a,b)=> b.date.localeCompare(a.date));
}

/* -----------------------------
   Render list
------------------------------ */
function renderList() {
  const mode = $("timeMode").value;
  const box = $("results");
  box.innerHTML = "";

  mergedResults.forEach(g => {
    const row = document.createElement("div");
    row.className = "result";
    row.innerHTML =
      `<b>${g.satellite}</b> · ${g.date}${g.times.length>1?` (${g.times.length})`:""}`;
    row.onclick = ()=>{
      resultsLayer.clearLayers();
      L.geoJSON(
        { type:"FeatureCollection", features:g.features },
        { style:{ color:"#fff", weight:3, fillOpacity:0.15 } }
      ).addTo(resultsLayer);
    };
    box.appendChild(row);
  });

  $("countPill").textContent = mergedResults.length;
}

$("timeMode").onchange = renderList;

/* -----------------------------
   Clear
------------------------------ */
$("btnClearResults").onclick = ()=>{
  resultsLayer.clearLayers();
  $("results").innerHTML = "";
  $("countPill").textContent = 0;
};
$("btnClearAOI").onclick = ()=>{
  drawnItems.clearLayers();
  aoiGeom = null;
  $("aoiStatus").textContent = "AOI not set";
};
