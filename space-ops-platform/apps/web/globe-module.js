import Globe from 'https://esm.sh/globe.gl@2.46.1?deps=three@0.180.0';
import * as THREE from 'https://esm.sh/three@0.180.0';

const parentWindow = window.parent || window;
const shared = parentWindow.__SPACEOPS_SHARED_GLOBE_STATE__ ||= {
  epochMs: Date.now(),
  pov: { lat: 18, lng: 103, altitude: 2.08 },
  selectedId: 'GF-7 02',
  moduleKey: 'ops',
  live: true,
  frozenElapsed: 0
};

const NIGHT_TEXTURE_URL = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-night.jpg';
const DAY_TEXTURE_URL = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-day.jpg';
const BUMP_TEXTURE_URL = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-topology.png';

const profiles = {
  ops:    { orbits:true,  sats:true,  ground:true,  aoi:true,  ships:false, links:false },
  twin:   { orbits:true,  sats:true,  ground:true,  aoi:true,  ships:false, links:true  },
  plan:   { orbits:true,  sats:true,  ground:false, aoi:true,  ships:false, links:false },
  ground: { orbits:true,  sats:true,  ground:true,  aoi:false, ships:false, links:true  },
  earth:  { orbits:false, sats:false, ground:false, aoi:true,  ships:true,  links:false },
  eng:    { orbits:true,  sats:true,  ground:false, aoi:false, ships:false, links:false }
};

const sats = [
  { id:'GF-7 02', kind:'sat', inclination:98.2, node:16,  phase:0.35, visualPeriod:54, alt:0.145, color:'#ff6d9f' },
  { id:'SUPERVIEW NEO-1', kind:'sat', inclination:97.4, node:82,  phase:2.15, visualPeriod:62, alt:0.165, color:'#6fa8ff' },
  { id:'SY-01', kind:'sat', inclination:53.0, node:138, phase:4.05, visualPeriod:72, alt:0.185, color:'#58d5c5' },
  { id:'SAR-01', kind:'sat', inclination:97.8, node:224, phase:5.10, visualPeriod:58, alt:0.135, color:'#ff8bb2' }
];

const grounds = [
  { id:'GS-SE-01', kind:'ground', lat:67.86, lng:20.23, alt:0.008, color:'#e7c86b' },
  { id:'GS-SG-02', kind:'ground', lat:1.30, lng:103.82, alt:0.008, color:'#73d7a2' },
  { id:'GS-IN-04', kind:'ground', lat:20.59, lng:78.96, alt:0.008, color:'#6fa8ff' }
];

const ships = [
  { id:'AIS-3187', kind:'ship', lat:1.24, lng:103.68, alt:0.006, color:'#75d9df' },
  { id:'AIS-5521', kind:'ship', lat:1.31, lng:103.87, alt:0.006, color:'#75d9df' },
  { id:'AIS-9042', kind:'ship', lat:1.17, lng:104.04, alt:0.006, color:'#75d9df' }
];

const aoi = [{
  id:'AOI · SG PORT',
  kind:'aoi',
  geometry:{type:'Polygon',coordinates:[[[103.60,1.20],[104.05,1.20],[104.05,1.48],[103.60,1.48],[103.60,1.20]]]}
}];

const weatherZones = [
  {
    id:'WX · CLOUD BAND A', kind:'weather',
    geometry:{type:'Polygon',coordinates:[[[101.5,5.0],[104.0,7.8],[109.8,8.5],[113.2,6.1],[110.6,3.7],[105.2,3.2],[101.5,5.0]]]}
  },
  {
    id:'WX · CLOUD BAND B', kind:'weather',
    geometry:{type:'Polygon',coordinates:[[[97.8,-1.8],[100.4,0.6],[104.2,0.2],[106.0,-2.4],[103.0,-4.1],[99.2,-3.7],[97.8,-1.8]]]}
  }
];

function moduleKey() {
  const m = location.pathname.toLowerCase().match(/\/(ops|twin|plan|ground|earth|eng)\.html$/);
  if (m) return m[1];
  const title = document.title.toLowerCase();
  for (const key of Object.keys(profiles)) if (title.includes(key)) return key;
  return 'ops';
}

function makeSatelliteLabel(text, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'rgba(5,9,14,.88)';
  ctx.fillRect(12,20,488,88);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(12,20,488,88);
  ctx.fillStyle = accent;
  ctx.fillRect(12,20,10,88);
  ctx.fillStyle = '#f4f7fb';
  ctx.font = '700 34px Inter,system-ui,-apple-system,Segoe UI,sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(text,42,64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false});
  const sprite = new THREE.Sprite(material);
  sprite.name = 'satelliteNameLabel';
  sprite.center.set(0,0.5);
  sprite.position.set(3.8,3.6,0);
  sprite.scale.set(18,4.5,1);
  sprite.renderOrder = 5;
  return sprite;
}

const key = moduleKey();
shared.moduleKey = key;
if (key === 'ops') document.getElementById('nightBtn')?.classList.add('on');
const scene = key === 'ops' ? document.querySelector('.mapwrap') : document.querySelector('.scene');
if (!scene) throw new Error(`Space Ops shared globe: scene not found for ${key}`);

const style = document.createElement('style');
style.id = 'spaceops-shared-globe-style';
style.textContent = `
  .spaceopsGlobeActive{isolation:isolate!important}
  .spaceopsSharedGlobeHost{position:absolute!important;inset:0!important;z-index:2!important;overflow:hidden!important;background:radial-gradient(circle at 50% 52%,rgba(17,31,46,.18),transparent 39%)!important}
  .spaceopsSharedGlobeHost canvas{display:block!important;outline:none!important;filter:saturate(.82) contrast(1.06)!important}
  .spaceopsGlobeActive .earth,.spaceopsGlobeActive .gridline,
  .spaceopsGlobeActive .orbit,.spaceopsGlobeActive .sat,
  .spaceopsGlobeActive .gs,.spaceopsGlobeActive .station,
  .spaceopsGlobeActive .aoi,.spaceopsGlobeActive .cone,
  .spaceopsGlobeActive .windowArc,.spaceopsGlobeActive .land,
  .spaceopsGlobeActive .coast,.spaceopsGlobeActive .ship,
  .spaceopsGlobeActive .cloud,.spaceopsGlobeActive .vector,
  .spaceopsGlobeActive .bodyFrame,.spaceopsGlobeActive .cov,
  .spaceopsGlobeActive .orbitLayer,.spaceopsGlobeActive .assetLayer,
  .spaceopsGlobeActive .groundLayer,.spaceopsGlobeActive .aoiLayer{display:none!important}
  .spaceopsGlobeActive>.map{background:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)!important;background-size:28px 28px!important}
  .spaceopsGlobeActive .sceneTools,.spaceopsGlobeActive .maptools,
  .spaceopsGlobeActive .zoomtools,.spaceopsGlobeActive .legend,
  .spaceopsGlobeActive .reset,.spaceopsGlobeActive .hud,
  .spaceopsGlobeActive .contactBar{z-index:20!important}
  .spaceopsGlobeReadout{position:absolute;right:14px;bottom:14px;z-index:21;width:190px;padding:9px 10px;background:rgba(8,12,17,.86);border:1px solid #303844;color:#858f9b;font:7.5px ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none;backdrop-filter:blur(5px)}
  .spaceopsGlobeReadout b{color:#dce2e8;font-weight:700}.spaceopsGlobeReadout .live{color:#73d7a2}.spaceopsGlobeReadout .paused{color:#e7c86b}
`;
document.head.appendChild(style);
scene.classList.add('spaceopsGlobeActive');

const host = document.createElement('div');
host.className = 'spaceopsSharedGlobeHost';
host.setAttribute('aria-label', 'Interactive 3D Earth and orbital resource scene');
scene.appendChild(host);

const readout = document.createElement('div');
readout.className = 'spaceopsGlobeReadout';
readout.innerHTML = '<div>TWIN CLOCK <b id="spaceopsGlobeClock">--:--:--</b></div><div>STATE <b class="live" id="spaceopsGlobeState">LIVE</b></div><div>SELECTED <b id="spaceopsGlobeSelected">GF-7 02</b></div>';
if (key === 'twin') scene.appendChild(readout);

const world = new Globe(host, {
  rendererConfig:{antialias:true,alpha:true,powerPreference:'high-performance'},
  animateIn:false
})
  .backgroundColor('rgba(0,0,0,0)')
  .globeImageUrl(NIGHT_TEXTURE_URL)
  .bumpImageUrl(BUMP_TEXTURE_URL)
  .showAtmosphere(true)
  .atmosphereColor('#3f78b4')
  .atmosphereAltitude(0.13)
  .showGraticules(false)
  .pointLat('lat').pointLng('lng').pointAltitude('alt').pointColor('color')
  .pointRadius(d => d.id === shared.selectedId ? 0.30 : d.kind === 'ship' ? 0.15 : 0.21)
  .pointLabel(d => `<div style="font:700 11px system-ui;color:#eef3f8;background:#080b10e8;border:1px solid #39424e;padding:5px 7px">${d.id}</div>`)
  .pointsTransitionDuration(0)
  .pathPoints('points').pathPointLat('lat').pathPointLng('lng').pathPointAlt('alt').pathColor('color')
  .pathStroke(d => d.kind === 'window' ? 1.15 : 0.30)
  .pathDashLength(d => d.kind === 'window' ? 1 : 0.56)
  .pathDashGap(d => d.kind === 'window' ? 0 : 0.14)
  .pathDashAnimateTime(5200).pathTransitionDuration(0)
  .polygonGeoJsonGeometry('geometry')
  .polygonAltitude(d => d.kind === 'weather' ? 0.009 : 0.014)
  .polygonCapColor(d => d.kind === 'weather' ? 'rgba(190,205,220,.10)' : 'rgba(223,63,118,.16)')
  .polygonSideColor(d => d.kind === 'weather' ? 'rgba(160,180,200,.02)' : 'rgba(223,63,118,.04)')
  .polygonStrokeColor(d => d.kind === 'weather' ? 'rgba(190,205,220,.42)' : '#ff6d9f')
  .polygonsTransitionDuration(0)
  .arcStartLat('startLat').arcStartLng('startLng').arcStartAltitude('startAlt')
  .arcEndLat('endLat').arcEndLng('endLng').arcEndAltitude('endAlt')
  .arcColor(() => ['rgba(255,109,159,.10)','rgba(255,109,159,.92)'])
  .arcStroke(0.30).arcDashLength(0.38).arcDashGap(0.12).arcDashAnimateTime(1700).arcsTransitionDuration(0)
  .ringLat(d=>d.sat?d.sat.lat:d.lat).ringLng(d=>d.sat?d.sat.lng:d.lng).ringColor('color').ringMaxRadius('radius').ringPropagationSpeed('speed').ringRepeatPeriod('repeat')
  .customLayerLabel(d => `<div style="font:700 11px system-ui;color:#eef3f8;background:#080b10e8;border:1px solid #39424e;padding:5px 7px">${d.id}</div>`)
  .customThreeObject(d => {
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.45,0),new THREE.MeshBasicMaterial({color:d.color}));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(2.9,12,12),new THREE.MeshBasicMaterial({color:d.color,transparent:true,opacity:0.13,depthWrite:false}));
    const label = makeSatelliteLabel(d.id,d.color);
    group.add(glow,core,label);

    if (key === 'eng') {
      const velocity = new THREE.ArrowHelper(new THREE.Vector3(1,0.08,0).normalize(),new THREE.Vector3(0,0,0),10,0x75d9df,2.8,1.7);
      velocity.name = 'engVelocity';
      const normal = new THREE.ArrowHelper(new THREE.Vector3(0,1,0.12).normalize(),new THREE.Vector3(0,0,0),8,0xe7c86b,2.5,1.5);
      normal.name = 'engNormal';
      const radial = new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(0,0,0),7,0xff6d9f,2.2,1.4);
      radial.name = 'engRadial';
      group.add(velocity,normal,radial);

      const bodyAxes = new THREE.AxesHelper(6.5);
      bodyAxes.name = 'engBodyAxes';
      group.add(bodyAxes);

      const cov = new THREE.Mesh(
        new THREE.SphereGeometry(3.2,18,12),
        new THREE.MeshBasicMaterial({color:0x75d9df,wireframe:true,transparent:true,opacity:0.42,depthWrite:false})
      );
      cov.name = 'engCovariance';
      cov.scale.set(1.8,0.9,0.65);
      group.add(cov);
    }
    return group;
  })
  .customThreeObjectUpdate((obj,d) => {
    const p = world.getCoords(d.lat,d.lng,d.alt);
    obj.position.set(p.x,p.y,p.z);
    if (key === 'eng') obj.lookAt(0,0,0);
    obj.scale.setScalar(d.id === shared.selectedId ? 1.30 : 1.0);

    const label = obj.getObjectByName('satelliteNameLabel');
    if (label) {
      label.visible = true;
      label.material.opacity = d.id === shared.selectedId ? 1 : 0.88;
    }

    if (key === 'eng') {
      const profile = currentProfile();
      const vectorsOn = !!profile.vectors;
      ['engVelocity','engNormal','engRadial'].forEach(name => {
        const child = obj.getObjectByName(name);
        if (child) child.visible = vectorsOn;
      });
      const axes = obj.getObjectByName('engBodyAxes');
      if (axes) axes.visible = !!profile.body;
      const cov = obj.getObjectByName('engCovariance');
      if (cov) cov.visible = !!profile.covariance;
    }
  });

const controls = world.controls();
controls.autoRotate = !!shared.live;
controls.autoRotateSpeed = 0.28;
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.72;
controls.minDistance = 120;
controls.maxDistance = 460;
world.pointOfView(shared.pov || {lat:18,lng:103,altitude:2.08},0);

try {
  const renderer = world.renderer();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  const material = world.globeMaterial();
  material.color?.set?.('#ffffff');
  material.emissive?.set?.('#020408');
  material.emissiveIntensity = 0.06;
  material.shininess = 2;
  material.needsUpdate = true;
} catch (_) {}

function orbitPoint(def, angle) {
  const inc = def.inclination * Math.PI / 180;
  const lat = Math.asin(Math.sin(inc) * Math.sin(angle)) * 180 / Math.PI;
  const lonInPlane = Math.atan2(Math.cos(inc) * Math.sin(angle),Math.cos(angle)) * 180 / Math.PI;
  let lng = def.node + lonInPlane;
  lng = ((lng + 180) % 360 + 360) % 360 - 180;
  return {lat,lng,alt:def.alt};
}

const orbitPaths = sats.map(def => ({
  id:def.id,kind:'orbit',color:def.color,
  points:Array.from({length:181},(_,i)=>orbitPoint(def,(i/180)*Math.PI*2))
}));

function orbitSegment(def, center, span, count=36) {
  return Array.from({length:count},(_,i)=>{
    const t = count === 1 ? 0 : i/(count-1);
    return orbitPoint(def,center-span/2+t*span);
  });
}

const planWindows = [
  { id:'Executable window',kind:'window',color:'#73d7a2',points:orbitSegment(sats[0],1.10,0.62) },
  { id:'Conditional window',kind:'window',color:'#e7c86b',points:orbitSegment(sats[1],3.85,0.50) }
];

function isOn(id, fallback=false) {
  const el = document.getElementById(id);
  return el ? el.classList.contains('on') : fallback;
}

function currentProfile() {
  const profile = {...profiles[key]};
  const chips = [...document.querySelectorAll('.sceneTools .chip,.maptools .chip,[data-layer]')];
  const read = (terms,current) => {
    const chip = chips.find(c => terms.some(term => c.textContent.trim().toUpperCase().includes(term)));
    return chip ? chip.classList.contains('on') : current;
  };
  profile.orbits = read(['ORBIT'],profile.orbits);
  profile.sats = read(['ASSET','SAT'],profile.sats);
  profile.ground = read(['GROUND','STATION','NETWORK'],profile.ground);
  profile.aoi = read(['AOI'],profile.aoi);
  profile.ships = read(['AIS','SHIP'],profile.ships);
  profile.links = key === 'twin' ? isOn('linkMode',false) : read(['LINK'],profile.links);
  profile.coverage = key === 'twin' && isOn('coverageMode',false);
  profile.anomaly = key === 'twin' && isOn('anomalyMode',false);
  profile.grid = key === 'ops' ? read(['GRID'],false) : false;
  profile.night = key === 'ops' ? isOn('nightBtn',true) : true;
  profile.windows = key === 'plan' ? read(['WINDOW'],true) : false;
  profile.weather = (key === 'earth' || key === 'ground') ? read(['WEATHER'],key === 'earth') : false;
  profile.footprint = key === 'ground' ? read(['FOOTPRINT'],false) : false;
  profile.vectors = key === 'eng' ? read(['VECTOR'],true) : false;
  profile.body = key === 'eng' ? read(['BODY FRAME'],false) : false;
  profile.covariance = key === 'eng' ? read(['COVARIANCE'],false) : false;
  return profile;
}

function selectObject(id) {
  if (!id) return;
  shared.selectedId = id;
  const selected = document.getElementById('spaceopsGlobeSelected');
  if (selected) selected.textContent = id;
  try { if (typeof window.selectObject === 'function') window.selectObject(id); } catch (_) {}
  refreshLayers(true);
}
world.onPointClick(d => selectObject(d?.id));
world.onCustomLayerClick(d => selectObject(d?.id));
world.onZoom(pov => {
  shared.pov = {
    lat:Number.isFinite(pov.lat) ? pov.lat : shared.pov.lat,
    lng:Number.isFinite(pov.lng) ? pov.lng : shared.pov.lng,
    altitude:Number.isFinite(pov.altitude) ? pov.altitude : shared.pov.altitude
  };
});

let lastProfileSig = '';
let lastArcAt = 0;
let activeTexture = NIGHT_TEXTURE_URL;
function refreshLayers(force=false) {
  const p = currentProfile();
  const sig = JSON.stringify(p)+'|'+shared.selectedId;
  if (!force && sig === lastProfileSig) return p;
  lastProfileSig = sig;

  const points = [];
  if (p.ground) points.push(...grounds);
  if (p.ships) points.push(...ships);
  world.pointsData(points);

  const paths = [];
  if (p.orbits) paths.push(...orbitPaths);
  if (p.windows) paths.push(...planWindows);
  world.pathsData(paths);

  const polygons = [];
  if (p.aoi) polygons.push(...aoi);
  if (p.weather) polygons.push(...weatherZones);
  world.polygonsData(polygons);

  world.customLayerData(p.sats ? sats : []);
  world.showGraticules(!!p.grid);

  const nextTexture = p.night ? NIGHT_TEXTURE_URL : DAY_TEXTURE_URL;
  if (nextTexture !== activeTexture) {
    activeTexture = nextTexture;
    world.globeImageUrl(nextTexture);
  }
  if (!p.links) world.arcsData([]);

  const rings = [];
  if (p.coverage) {
    grounds.forEach(g => rings.push({lat:g.lat,lng:g.lng,color:'rgba(115,215,162,.72)',radius:12,speed:1.0,repeat:1250}));
    sats.forEach(s => rings.push({sat:s,color:'rgba(111,168,255,.55)',radius:7,speed:0.75,repeat:1600}));
  }
  if (p.anomaly) {
    const sar = sats.find(s=>s.id==='SAR-01');
    if (sar) rings.push({sat:sar,color:'rgba(255,114,131,.95)',radius:5,speed:1.4,repeat:760});
  }
  if (p.footprint) {
    grounds.forEach(g => rings.push({lat:g.lat,lng:g.lng,color:'rgba(115,215,162,.58)',radius:9,speed:0.55,repeat:1900}));
  }
  world.ringsData(rings);
  return p;
}

function updateArc(p,now) {
  if (!p.links || !p.sats || !p.ground) return;
  if (now-lastArcAt<120) return;
  lastArcAt=now;
  const sat=sats.find(s=>s.id===shared.selectedId)||sats[0];
  const gs=grounds[1];
  world.arcsData([{startLat:gs.lat,startLng:gs.lng,startAlt:gs.alt,endLat:sat.lat,endLng:sat.lng,endAlt:sat.alt}]);
}

function setLive(on) {
  if (on === shared.live) return;
  if (!on) shared.frozenElapsed = (Date.now()-shared.epochMs)/1000;
  else shared.epochMs = Date.now() - (shared.frozenElapsed||0)*1000;
  shared.live = on;
  controls.autoRotate = on;
  const stateEl=document.getElementById('spaceopsGlobeState');
  if (stateEl) { stateEl.textContent=on?'LIVE':'PAUSED'; stateEl.className=on?'live':'paused'; }
}

if (key==='twin') {
  const liveBtn=document.getElementById('liveState');
  if (liveBtn) {
    liveBtn.classList.toggle('on',shared.live!==false);
    liveBtn.addEventListener('click',()=>{
      liveBtn.classList.toggle('on');
      setLive(liveBtn.classList.contains('on'));
    });
  }
  const snapshot=document.getElementById('snapshotBtn');
  snapshot?.addEventListener('click',()=>{
    try {
      const canvas=world.renderer().domElement;
      const a=document.createElement('a');
      a.download=`space-ops-twin-${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
      a.href=canvas.toDataURL('image/png');
      a.click();
    } catch (_) {}
  });
}

function resetView() {
  shared.pov={lat:18,lng:103,altitude:2.08};
  world.pointOfView(shared.pov,420);
}

document.addEventListener('click',e=>{
  const el=e.target.closest?.('.sceneTools .chip,.maptools .chip,.zoomtools button,.reset,[data-layer]');
  if(!el) return;
  setTimeout(()=>{
    const text=el.textContent.trim().toUpperCase();
    if(text==='+'||text.includes('ZOOM IN')) {
      const pov=world.pointOfView();
      world.pointOfView({...pov,altitude:Math.max(1.25,(pov.altitude||2.08)*0.84)},260);
    } else if(text==='−'||text==='-'||text.includes('ZOOM OUT')) {
      const pov=world.pointOfView();
      world.pointOfView({...pov,altitude:Math.min(3.8,(pov.altitude||2.08)*1.18)},260);
    } else if(text.includes('RESET')) resetView();
    refreshLayers(true);
  },0);
},true);

function resize() {
  world.width(Math.max(1,scene.clientWidth)).height(Math.max(1,scene.clientHeight));
}
const ro=new ResizeObserver(resize);ro.observe(scene);resize();
refreshLayers(true);

let raf=0;
function tick(now) {
  const elapsed=shared.live===false ? (shared.frozenElapsed||0) : (Date.now()-shared.epochMs)/1000;
  sats.forEach(def=>{
    const p=orbitPoint(def,def.phase+elapsed*(Math.PI*2/def.visualPeriod));
    def.lat=p.lat;def.lng=p.lng;def.alt=p.alt;
  });
  const p=refreshLayers();
  if(p.sats) world.customLayerData(world.customLayerData());
  if(p.coverage||p.anomaly||p.footprint) world.ringsData(world.ringsData());
  updateArc(p,now);
  if(key==='twin') {
    const c=document.getElementById('spaceopsGlobeClock'); if(c)c.textContent=new Date().toISOString().slice(11,19)+'Z';
    const s=document.getElementById('spaceopsGlobeSelected'); if(s)s.textContent=shared.selectedId;
  }
  raf=requestAnimationFrame(tick);
}
raf=requestAnimationFrame(tick);

window.addEventListener('pagehide',()=>{
  try{cancelAnimationFrame(raf)}catch(_){}
  try{ro.disconnect()}catch(_){}
  try{shared.pov=world.pointOfView()}catch(_){}
});