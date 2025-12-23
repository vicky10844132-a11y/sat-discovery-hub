const $ = (id) => document.getElementById(id);

function toast(msg, ms=2200){
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>t.classList.add("hidden"), ms);
}

function utcDateKey(iso){
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Unknown";
  return new Date(t).toISOString().slice(0,10);
}
function fmtByMode(iso, mode){
  if (!iso) return "Unknown";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  if (mode === "date") return new Date(t).toISOString().slice(0,10);
  return new Date(t).toISOString().slice(0,16).replace("T"," ") + " UTC";
}
function opacityByTime(iso){
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 0.12;
  const days = Math.abs(Date.now() - t)/86400000;
  if (days < 30) return 0.55;
  if (days < 180) return 0.35;
  if (days < 365) return 0.25;
  if (days < 365*3) return 0.18;
  return 0.12;
}

function parseDate(id){
  const v = $(id).value;
  if (!v) return null;
  const d = new Date(v + "T00:00:00.000Z");
  return Number.isFinite(d.getTime()) ? d : null;
}
function toUtcDate(d){ return d.toISOString().slice(0,10); }

/* ---------------- Map ---------------- */
const map = L.map("map", {
  minZoom: 2,
  maxZoom: 16,
  worldCopyJump: false,
}).setView([20,0], 2);

map.options.wheelPxPerZoomLevel = 120;

/* Preferred tiles: CARTO dark_nolabels + labels */
const cartoNoLabels = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  { subdomains:"abcd", maxZoom:19, attribution:"© OpenStreetMap © CARTO" }
);

const cartoLabels = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
  { subdomains:"abcd", maxZoom:19, opacity: 0.92 }
);

/* Fallback: OSM standard (if CARTO blocked/unreachable) */
const osmFallback = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { subdomains:"abc", maxZoom:19, attribution:"© OpenStreetMap" }
);

cartoNoLabels.addTo(map);
cartoLabels.addTo(map);

/* Safer filter: keep neon but don’t kill the map */
function applyTileFilter(mode){
  try{
    const tile = map.getPane("tilePane");
    // 这里不动 overlayPane，避免影响 footprints 的颜色
    if (mode === "carto") {
      if (tile) tile.style.filter = "brightness(0.92) contrast(1.22) saturate(1.18)";
    } else {
      if (tile) tile.style.filter = "brightness(0.98) contrast(1.10) saturate(1.06)";
    }
  } catch {}
}
applyTileFilter("carto");

/* Auto fallback on tile errors (6s rolling window) */
let fallbackActivated = false;
let errCount = 0;
let errWindowStart = 0;

function activateFallback(){
  if (fallbackActivated) return;
  fallbackActivated = true;

  toast("Base map blocked/unreachable. Switched to fallback tiles.", 3600);

  try { map.removeLayer(cartoNoLabels); } catch {}
  try { map.removeLayer(cartoLabels); } catch {}

  osmFallback.addTo(map);
  applyTileFilter("osm");
}

function onTileError(){
  if (fallbackActivated) return;

  const now = Date.now();
  if (!errWindowStart || (now - errWindowStart) > 6000) {
    errWindowStart = now;
    errCount = 0;
  }
  errCount++;

  if (errCount >= 8) activateFallback();
}

cartoNoLabels.on("tileerror", onTileError);
cartoLabels.on("tileerror", onTileError);

/* Optional: if tiles never load (e.g., blocked with no errors), fallback after 7s */
setTimeout(() => {
  if (fallbackActivated) return;
  // Leaflet adds .leaflet-tile-loaded on loaded tiles
  const anyLoaded = document.querySelector("#map .leaflet-tile-loaded");
  if (!anyLoaded) activateFallback();
}, 7000);

/* Layers */
const drawn = new L.FeatureGroup().addTo(map);
const resultsLayer = L.layerGroup().addTo(map);

let aoiGeom = null;
let aoiBounds = null;
let mergedGroups = [];
let sliderThresholdTime = Infinity;

/* Draw controls */
map.addControl(new L.Control.Draw({
  draw:{
    polyline:false, marker:false, circle:false, circlemarker:false,
    rectangle:{ shapeOptions:{ color:"#77e3ff", weight:2, fillOpacity:0.06 }},
    polygon:{ allowIntersection:false, shapeOptions:{ color:"#77e3ff", weight:2, fillOpacity:0.06 }}
  },
  edit:{ featureGroup: drawn, remove:true }
}));

map.on(L.Draw.Event.CREATED, (e)=>{
  drawn.clearLayers();
  drawn.addLayer(e.layer);
  setAOIFromLayer(e.layer);
});
map.on("draw:edited", ()=>{
  let first=null;
  drawn.eachLayer(l=>{ if(!first) first=l; });
  if(first) setAOIFromLayer(first);
});
map.on("draw:deleted", ()=>{
  clearAOI();
});

function lockMapToAOI(bounds){
  const padded = bounds.pad(0.35);
  map.fitBounds(padded, { padding:[24,24] });
  map.setMaxBounds(padded);

  map.off("drag", _panInside);
  function _panInside(){ map.panInsideBounds(padded, { animate:false }); }
  map.on("drag", _panInside);
}

function setAOIFromLayer(layer){
  const gj = layer.toGeoJSON();
  if (!gj?.geometry) return;
  aoiGeom = gj.geometry;
  aoiBounds = layer.getBounds();
  $("aoiStatus").textContent = "AOI set";
  lockMapToAOI(aoiBounds);
}

function clearAOI(){
  drawn.clearLayers();
  aoiGeom = null;
  aoiBounds = null;
  map.setMaxBounds(null);
  $("aoiStatus").textContent = "AOI not set";
}

/* Buttons */
$("btnDraw").addEventListener("click", ()=>toast("Use draw tools on map (rectangle / polygon).", 2200));
$("btnClearAOI").addEventListener("click", ()=>{
  clearAOI();
  clearResults();
  toast("AOI cleared.", 1600);
});

/* Point + Radius */
let picking = false;
$("btnPointRadius").addEventListener("click", ()=>{
  picking = true;
  toast("Click on map to pick center.", 2400);
});
map.on("click", (e)=>{
  if(!picking) return;
  picking = false;
  const km = Math.max(1, Math.min(1000, Number($("radiusKm").value || 50)));
  const center = turf.point([e.latlng.lng, e.latlng.lat]);
  const circle = turf.circle(center, km, { units:"kilometers", steps: 72 });

  const layer = L.geoJSON(circle, { style:{ color:"#77e3ff", weight:2, fillOpacity:0.06 }});
  drawn.clearLayers();
  drawn.addLayer(layer);

  aoiGeom = circle.geometry;
  aoiBounds = L.geoJSON(circle).getBounds();
  $("aoiStatus").textContent = "AOI set";
  lockMapToAOI(aoiBounds);
});

/* Geocode (Nominatim) */
$("btnGeocode").addEventListener("click", async ()=>{
  const q = $("placeInput").value.trim();
  if(!q) return toast("Enter a place name.", 2000);
  try{
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers:{ "accept":"application/json" }});
    const j = await r.json();
    if(!j?.length) return toast("Place not found.", 2200);

    const lat = Number(j[0].lat), lon = Number(j[0].lon);
    map.setView([lat, lon], 9);

    // convenience AOI: 10km circle
    const center = turf.point([lon, lat]);
    const circle = turf.circle(center, 10, { units:"kilometers", steps:72 });
    const layer = L.geoJSON(circle, { style:{ color:"#77e3ff", weight:2, fillOpacity:0.06 }});
    drawn.clearLayers(); drawn.addLayer(layer);

    aoiGeom = circle.geometry;
    aoiBounds = L.geoJSON(circle).getBounds();
    $("aoiStatus").textContent = "AOI set";
    lockMapToAOI(aoiBounds);

    toast("Located & AOI created.", 1800);
  } catch(e){
    console.error(e);
    toast("Geocoding failed.", 2400);
  }
});

/* ---------------- Sources ---------------- */
const STAC_ROOT = "https://earth-search.aws.element84.com/v1";
const SOURCES = [
  { id:"s2", name:"Sentinel-2", collection:"sentinel-2-l2a", color:"#77e3ff" },
  { id:"s1", name:"Sentinel-1", collection:"sentinel-1-grd", color:"#8a7bff" },
  { id:"ls", name:"Landsat",    collection:"landsat-c2-l2",  color:"#34d399" }
];

function renderSources(){
  const box = $("sources");
  box.innerHTML = "";
  for(const s of SOURCES){
    const row = document.createElement("div");
    row.className = "source";
    row.innerHTML = `
      <input type="checkbox" id="src_${s.id}" checked />
      <div class="name">${s.name}</div>
      <div class="tag">STAC</div>
    `;
    box.appendChild(row);
  }
}
renderSources();

function selectedSources(){
  return SOURCES.filter(s => $(`src_${s.id}`).checked);
}

/* ---------------- Results ---------------- */
function clearResults(){
  resultsLayer.clearLayers();
  mergedGroups = [];
  $("results").innerHTML = "";
  $("countPill").textContent = "0";
}
$("btnClearResults").addEventListener("click", ()=>{ clearResults(); toast("Results cleared.", 1600); });

function mergeBySatelliteAndDate(items){
  const m = new Map();
  for(const it of items){
    const d = utcDateKey(it.datetime);
    const key = `${it.satellite}__${d}`;
    if(!m.has(key)){
      m.set(key, { satellite: it.satellite, date:d, times:[], features:[], color: it.color });
    }
    const g = m.get(key);
    if(it.datetime) g.times.push(it.datetime);
    g.features.push(it.feature);
  }
  for(const g of m.values()) g.times.sort();
  return Array.from(m.values()).sort((a,b)=> b.date.localeCompare(a.date));
}

function renderList(){
  const mode = $("timeMode").value;
  const box = $("results");
  box.innerHTML = "";

  for(const g of mergedGroups){
    const count = g.times.length;

    const item = document.createElement("div");
    item.className = "result";
    item.innerHTML = `
      <span class="dot" style="background:${g.color}"></span>
      <div class="resultMain">
        <div class="resultSat">${g.satellite}</div>
        <div class="resultTime">${mode==="date" ? `${g.date}` : fmtByMode(g.times[0], "datetime")}</div>
      </div>
      <div class="resultCount">${count>1 ? `(${count})` : ""}</div>
    `;

    item.onclick = ()=>{
      resultsLayer.clearLayers();

      const layer = L.geoJSON(
        { type:"FeatureCollection", features: g.features },
        {
          style:(f)=>({
            color: g.color,
            weight: 2,
            opacity: 0.95,
            fillColor: g.color,
            fillOpacity: Math.max(0.08, opacityByTime(f.properties?.datetime))
          }),
          onEachFeature:(f,l)=>{
            const dt = f.properties?.datetime || "";
            l.bindPopup(`<b>${g.satellite}</b><br/>${fmtByMode(dt,"datetime")}`, { closeButton:false });
          }
        }
      ).addTo(resultsLayer);

      try { map.fitBounds(layer.getBounds(), { padding:[24,24] }); } catch {}
      if(aoiBounds) lockMapToAOI(aoiBounds);
      applyTimelineFilterToLayer(resultsLayer);
    };

    box.appendChild(item);
  }

  $("countPill").textContent = String(mergedGroups.length);
}
$("timeMode").addEventListener("change", renderList);

/* Timeline slider */
function updateTimeThreshold(percent){
  const maxAgeDays = 365 * 10;
  const days = maxAgeDays * (percent / 100);
  sliderThresholdTime = Date.now() - days * 86400000;

  const d = new Date(sliderThresholdTime);
  $("timeLabel").textContent = (percent===100) ? "Now" : d.toISOString().slice(0,10);
}

function applyTimelineFilterToLayer(layerGroup){
  layerGroup.eachLayer(layer=>{
    layer.eachLayer?.(fl=>{
      const iso = fl.feature?.properties?.datetime;
      const t = Date.parse(iso);
      if(!Number.isFinite(t)) return;
      fl.setStyle({ fillOpacity: (t >= sliderThresholdTime) ? opacityByTime(iso) : 0 });
    });
  });
}

$("timeSlider").addEventListener("input", (e)=>{
  updateTimeThreshold(Number(e.target.value));
  applyTimelineFilterToLayer(resultsLayer);
});

/* ---------------- STAC query ---------------- */
async function stacSearch(collection, intersects, datetime, limit=200){
  const body = { collections:[collection], intersects, limit };
  if(datetime) body.datetime = datetime;

  const r = await fetch(`${STAC_ROOT}/search`, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(body)
  });
  if(!r.ok) throw new Error(`STAC error ${r.status}`);
  return await r.json();
}

$("btnQuery").addEventListener("click", async ()=>{
  if(!aoiGeom) return toast("Set AOI first.", 2400);

  const start = parseDate("startDate");
  const end = parseDate("endDate");
  if((start && !end) || (!start && end)) return toast("Set both start & end.", 2400);
  if(start && end && end < start) return toast("End date < start date.", 2400);

  const datetime = (start && end)
    ? `${toUtcDate(start)}T00:00:00Z/${toUtcDate(end)}T23:59:59Z`
    : undefined;

  const sources = selectedSources();
  if(!sources.length) return toast("Select at least one archive.", 2200);

  clearResults();
  toast("Querying open archives…", 1800);

  try{
    const allItems = [];

    for(const src of sources){
      const fc = await stacSearch(src.collection, aoiGeom, datetime, 200);
      const feats = fc.features || [];

      L.geoJSON(feats, {
        style:(f)=>({
          color: src.color,
          weight: 2,
          opacity: 0.95,
          fillColor: src.color,
          fillOpacity: opacityByTime(f.properties?.datetime)
        }),
        onEachFeature:(f,l)=>{
          const dt = f.properties?.datetime || "";
          l.bindPopup(`<b>${src.name}</b><br/>${fmtByMode(dt,"datetime")}`, { closeButton:false });
        }
      }).addTo(resultsLayer);

      for(const f of feats){
        allItems.push({
          satellite: src.name,
          datetime: f.properties?.datetime || "",
          color: src.color,
          feature: f
        });
      }

      if(aoiBounds) lockMapToAOI(aoiBounds);
    }

    mergedGroups = mergeBySatelliteAndDate(allItems);
    renderList();

    updateTimeThreshold(Number($("timeSlider").value || 100));
    applyTimelineFilterToLayer(resultsLayer);

    toast(`Done · ${allItems.length} footprints`, 2400);
  } catch(e){
    console.error(e);
    toast(`Query failed: ${e.message || e}`, 3200);
  }
});

/* init timeline label */
updateTimeThreshold(Number($("timeSlider").value || 100));
