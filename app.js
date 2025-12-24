/* === app.js (FINAL · MAP ALWAYS VISIBLE) === */
const $ = (id) => document.getElementById(id);

function setStatus(msg){
  const el = $("aoiStatus");
  if (el) el.textContent = msg;
}

function toast(msg, ms=2600){
  const t = $("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>t.classList.add("hidden"), ms);
}

setStatus("JS OK · loading map…");

/* ---------------- Map ---------------- */
const map = L.map("map", {
  minZoom: 2,
  maxZoom: 16,
  worldCopyJump: false,
}).setView([20,0], 2);

map.options.wheelPxPerZoomLevel = 120;

/* ✅ 最稳妥底图：OSM */
const osm = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { subdomains:"abc", maxZoom:19 }
).addTo(map);

/* 深蓝滤镜（只作用 tilePane，不会遮） */
try{
  map.getPane("tilePane").style.filter =
    "brightness(1.05) contrast(1.18) saturate(1.35) hue-rotate(195deg)";
}catch{}

/* 诊断 */
let ok = 0, err = 0;
osm.on("tileload", ()=>{
  ok++;
  if(ok === 1){
    setStatus("✅ Map tiles loaded");
    toast("Map OK", 1200);
  }
});
osm.on("tileerror", ()=>{
  err++;
  setStatus("❌ Tile blocked (network / CSP)");
});

/* Layers */
const drawn = new L.FeatureGroup().addTo(map);
const resultsLayer = L.layerGroup().addTo(map);

/* Draw tools */
map.addControl(new L.Control.Draw({
  draw:{
    polyline:false, marker:false, circle:false, circlemarker:false,
    rectangle:{ shapeOptions:{ color:"#6fe7ff", weight:2, fillOpacity:0.06 }},
    polygon:{ allowIntersection:false, shapeOptions:{ color:"#6fe7ff", weight:2, fillOpacity:0.06 }}
  },
  edit:{ featureGroup: drawn, remove:true }
}));
