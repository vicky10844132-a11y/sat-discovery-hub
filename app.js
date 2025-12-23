const $ = id => document.getElementById(id);

/* ---------- Time helpers ---------- */
function utcDateKey(iso){
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0,10) : "Unknown";
}
function fmtByMode(iso,mode){
  if(!iso)return"Unknown";
  const t=Date.parse(iso);
  if(!Number.isFinite(t))return iso;
  if(mode==="date")return utcDateKey(iso);
  return new Date(t).toISOString().slice(0,16).replace("T"," ")+" UTC";
}
function opacityByTime(iso){
  const t=Date.parse(iso);if(!Number.isFinite(t))return.15;
  const d=(Date.now()-t)/(864e5);
  if(d<30)return.55;if(d<180)return.35;if(d<365)return.25;
  if(d<1095)return.18;return.12;
}

/* ---------- Map ---------- */
const map=L.map("map",{minZoom:2,maxZoom:15,worldCopyJump:false})
  .setView([20,0],2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const drawn=new L.FeatureGroup().addTo(map);
const resultsLayer=L.layerGroup().addTo(map);
let aoiBounds=null,mergedResults=[];

/* ---------- Draw ---------- */
map.addControl(new L.Control.Draw({draw:{polyline:false,circle:false,marker:false,circlemarker:false},edit:{featureGroup:drawn}}));
map.on(L.Draw.Event.CREATED,e=>{
  drawn.clearLayers();drawn.addLayer(e.layer);
  aoiBounds=e.layer.getBounds();
  lockMap();
});
function lockMap(){
  map.fitBounds(aoiBounds.pad(.3));
  map.setMaxBounds(aoiBounds.pad(.3));
  $("aoiStatus").textContent="AOI set";
}

/* ---------- Sources ---------- */
const STAC="https://earth-search.aws.element84.com/v1";
const SOURCES=[
  {id:"s2",name:"Sentinel-2",col:"sentinel-2-l2a",color:"#2dd4bf"},
  {id:"s1",name:"Sentinel-1",col:"sentinel-1-grd",color:"#fb7185"},
  {id:"ls",name:"Landsat",col:"landsat-c2-l2",color:"#60a5fa"}
];
$("sources").innerHTML=SOURCES.map(s=>`<label><input id="src_${s.id}" type="checkbox" checked> ${s.name}</label>`).join("");

/* ---------- Query ---------- */
$("btnQuery").onclick=async()=>{
  if(!aoiBounds)return alert("Set AOI first");
  resultsLayer.clearLayers();mergedResults=[];
  const start=$("startDate").value,end=$("endDate").value;
  const datetime=start&&end?`${start}T00:00:00Z/${end}T23:59:59Z`:"..";
  let raw=[];
  for(const s of SOURCES){
    if(!$(`src_${s.id}`).checked)continue;
    const r=await fetch(`${STAC}/search`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({collections:[s.col],intersects:drawn.toGeoJSON().features[0].geometry,datetime,limit:200})});
    const j=await r.json();
    L.geoJSON(j.features,{
      style:f=>({color:s.color,fillColor:s.color,weight:2,fillOpacity:opacityByTime(f.properties.datetime)}),
      onEachFeature:(f,l)=>l.bindPopup(`<b>${s.name}</b><br>${fmtByMode(f.properties.datetime,"datetime")}`)
    }).addTo(resultsLayer);
    j.features.forEach(f=>raw.push({sat:s.name,dt:f.properties.datetime,f,color:s.color}));
  }
  mergedResults=merge(raw);renderList();
};

/* ---------- Merge ---------- */
function merge(items){
  const m=new Map();
  items.forEach(i=>{
    const k=i.sat+"_"+utcDateKey(i.dt);
    if(!m.has(k))m.set(k,{sat:i.sat,date:utcDateKey(i.dt),times:[],features:[],color:i.color});
    m.get(k).times.push(i.dt);m.get(k).features.push(i.f);
  });
  return[...m.values()].sort((a,b)=>b.date.localeCompare(a.date));
}

/* ---------- Render ---------- */
function renderList(){
  const box=$("results");box.innerHTML="";
  mergedResults.forEach(g=>{
    const d=document.createElement("div");
    d.className="result";
    d.innerHTML=`<b>${g.sat}</b> · ${g.date}${g.times.length>1?` (${g.times.length})`:""}`;
    d.onclick=()=>{resultsLayer.clearLayers();
      L.geoJSON({type:"FeatureCollection",features:g.features},
        {style:{color:"#fff",fillOpacity:.15}}).addTo(resultsLayer);}
    box.appendChild(d);
  });
  $("countPill").textContent=mergedResults.length;
}
$("timeMode").onchange=renderList;

/* ---------- Timeline ---------- */
$("timeSlider").oninput=e=>{
  const p=+e.target.value;
  const t=Date.now()-(3650*p/100)*864e5;
  $("timeLabel").textContent=p==100?"Now":new Date(t).toISOString().slice(0,10);
  resultsLayer.eachLayer(l=>l.eachLayer?.(x=>{
    const dt=Date.parse(x.feature.properties.datetime);
    x.setStyle({fillOpacity:dt>=t?opacityByTime(x.feature.properties.datetime):0});
  }));
};

/* ---------- Clear ---------- */
$("btnClearResults").onclick=()=>{resultsLayer.clearLayers();$("results").innerHTML="";$("countPill").textContent=0;}
$("btnClearAOI").onclick=()=>{drawn.clearLayers();map.setMaxBounds(null);$("aoiStatus").textContent="AOI not set";}
