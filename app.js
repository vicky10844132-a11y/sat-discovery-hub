const $ = s => document.querySelector(s);

/* ---------- Toast ---------- */
function toast(msg){
  const t=$("#toast");
  t.textContent=msg;
  t.style.display="block";
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.style.display="none",2200);
}

/* ---------- Map ---------- */
const map=L.map("map",{minZoom:2,maxZoom:19}).setView([20,0],2);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {attribution:"© OSM © CARTO"}
).addTo(map);

L.tileLayer(
  "https://tiledbasemaps.arcgis.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  {opacity:.9}
).addTo(map);

let marker=null, archiveLayer=null;

/* ---------- AOI ---------- */
async function locate(){
  const q=$("#placeInput").value.trim();
  if(!q)return toast("Enter a place name");

  const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
  const j=await r.json();
  if(!j[0])return toast("No result");

  const lat=+j[0].lat, lon=+j[0].lon;
  map.setView([lat,lon],7);

  if(marker)marker.remove();
  marker=L.marker([lat,lon]).addTo(map);

  $("#aoiInfo").textContent=`AOI: ${j[0].display_name}`;
}
$("#locateBtn").onclick=locate;

/* ---------- Archive Presets ---------- */
let archivePresets=null, selectedStac="";

async function loadArchivePresets(){
  const r=await fetch("./open_archives.json");
  archivePresets=await r.json();

  const gSel=$("#archiveGroup");
  const sSel=$("#archiveSource");

  archivePresets.groups.forEach(g=>{
    const o=document.createElement("option");
    o.value=g.id;o.textContent=g.label;
    gSel.appendChild(o);
  });

  function refresh(){
    sSel.innerHTML="";
    const g=archivePresets.groups.find(x=>x.id===gSel.value);
    g.sources.forEach(s=>{
      const o=document.createElement("option");
      o.textContent=s.name;
      o.value=s.stacRoot;
      sSel.appendChild(o);
    });
    selectedStac=sSel.value;
  }

  gSel.onchange=refresh;
  sSel.onchange=()=>selectedStac=sSel.value;
  refresh();
}
loadArchivePresets();

/* ---------- Archive ---------- */
async function checkArchive(){
  if(!marker)return toast("Set AOI first");
  if(!selectedStac)return toast("No archive source");

  if(archiveLayer){archiveLayer.remove();archiveLayer=null}

  const {lat,lng}=marker.getLatLng();
  const bbox=[lng-1,lat-1,lng+1,lat+1];

  const r=await fetch(`${selectedStac}/search?bbox=${bbox.join(",")}&limit=20`);
  const j=await r.json();

  if(!j.features?.length)return toast("No archive features");

  archiveLayer=L.geoJSON(j,{
    style:{color:"#3ad6ff",weight:2,fillOpacity:.05}
  }).addTo(map);
  map.fitBounds(archiveLayer.getBounds());

  const res=$("#archiveResults");
  res.innerHTML="";
  j.features.forEach(f=>{
    const d=document.createElement("div");
    d.className="result";
    d.textContent=`${f.properties?.platform||"Unknown"} · ${f.properties?.datetime?.slice(0,10)||"Unknown date"}`;
    res.appendChild(d);
  });
}
$("#archiveBtn").onclick=checkArchive;
$("#archiveClearBtn").onclick=()=>{
  if(archiveLayer)archiveLayer.remove();
  $("#archiveResults").innerHTML="";
};

/* ---------- Programming ---------- */
async function loadTLE(){
  try{
    const r=await fetch("https://celestrak.org/NORAD/elements/active.txt");
    return await r.text();
  }catch{
    return fetch("./tle_cache.txt").then(r=>r.text());
  }
}

function parseTLE(txt){
  const l=txt.split("\n").map(x=>x.trim()).filter(Boolean);
  const m=new Map();
  for(let i=0;i<l.length-2;i+=3){
    if(l[i+1]?.startsWith("1 ")&&l[i+2]?.startsWith("2 "))
      m.set(l[i],{l1:l[i+1],l2:l[i+2]});
  }
  return m;
}

function hav(lat1,lon1,lat2,lon2){
  const R=6371,d=Math.PI/180;
  const a=Math.sin((lat2-lat1)*d/2)**2+
    Math.cos(lat1*d)*Math.cos(lat2*d)*Math.sin((lon2-lon1)*d/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

async function computePasses(){
  if(!marker)return toast("Set AOI first");

  const days=+$("#daysAhead").value||7;
  const tleTxt=await loadTLE();
  const tleMap=parseTLE(tleTxt);

  const res=$("#programResults");
  res.innerHTML="";

  const {lat,lon}=marker.getLatLng();
  const now=Date.now();

  tleMap.forEach((v,name)=>{
    const satrec=satellite.twoline2satrec(v.l1,v.l2);
    for(let t=now;t<now+days*864e5;t+=300000){
      const pv=satellite.propagate(satrec,new Date(t));
      if(!pv.position)continue;
      const g=satellite.eciToGeodetic(pv.position,satellite.gstime(new Date(t)));
      const d=hav(lat,lon,
        satellite.degreesLat(g.latitude),
        satellite.degreesLong(g.longitude));
      if(d<400){
        const div=document.createElement("div");
        div.className="result";
        div.textContent=`${name} · ${new Date(t).toISOString().slice(0,16)} UTC`;
        res.appendChild(div);
        break;
      }
    }
  });

  toast("Pass reference computed");
}
$("#programBtn").onclick=computePasses;
$("#programClearBtn").onclick=()=>$("#programResults").innerHTML="";
