const canvas = document.getElementById('globeCanvas');
const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
if (!gl) throw new Error('WebGL is required for the 3D showcase.');

const showcase = document.getElementById('showcase');
const sceneTitle = document.getElementById('sceneTitle');
const sceneText = document.getElementById('sceneText');
const sceneKicker = document.getElementById('sceneKicker');
const autoTourBtn = document.getElementById('autoTourBtn');
const uiBtn = document.getElementById('uiBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const sceneButtons = [...document.querySelectorAll('[data-scene-target]')];

const DPR = Math.min(window.devicePixelRatio || 1, 2);
function resize() {
  const w = Math.floor(canvas.clientWidth * DPR);
  const h = Math.floor(canvas.clientHeight * DPR);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
}
window.addEventListener('resize', resize);
resize();

const VERT = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;
varying vec3 vNormal;
varying vec3 vWorld;
void main(){
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorld = world.xyz;
  vNormal = mat3(uModel) * aNormal;
  gl_Position = uProj * uView * world;
}`;

const FRAG = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 uCamera;
uniform float uTime;
uniform float uCoverage;
float hash(vec2 p){return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main(){
  vec3 n=normalize(vNormal);
  vec3 viewDir=normalize(uCamera-vWorld);
  float fres=pow(1.0-max(dot(n,viewDir),0.0),3.0);
  float lon=atan(n.z,n.x);
  float lat=asin(n.y);
  vec2 uv=vec2(lon/6.2831853+0.5, lat/3.1415926+0.5);
  float landNoise = noise(uv*6.0)+0.55*noise(uv*13.0)+0.25*noise(uv*31.0);
  float latMask = smoothstep(0.06,0.18,uv.y)*smoothstep(0.06,0.18,1.0-uv.y);
  float continent = smoothstep(0.92,1.14,landNoise*latMask + 0.15*sin(uv.x*14.0)+0.1*cos(uv.y*18.0));
  vec3 ocean=vec3(0.015,0.075,0.15);
  vec3 landLow=vec3(0.04,0.30,0.20);
  vec3 landHigh=vec3(0.52,0.74,0.22);
  float elev=smoothstep(0.95,1.35,landNoise);
  vec3 land=mix(landLow,landHigh,elev);
  vec3 col=mix(ocean,land,continent);
  float gridLon=1.0-smoothstep(0.975,1.0,abs(sin(lon*12.0)));
  float gridLat=1.0-smoothstep(0.975,1.0,abs(sin(lat*12.0)));
  float grid=max(gridLon,gridLat)*0.10;
  float scan=0.5+0.5*sin(lon*13.0 + uTime*1.5 + lat*5.0);
  float cover=continent * smoothstep(0.3,0.75,scan) * uCoverage;
  col += vec3(0.02,0.22,0.42)*grid;
  col += vec3(0.05,0.55,0.75)*cover*0.27;
  col += vec3(0.18,0.38,0.85)*fres*0.6;
  float light=max(dot(n,normalize(vec3(-0.7,0.35,0.65))),0.0);
  col*=0.33+0.92*light;
  gl_FragColor=vec4(col,1.0);
}`;

const SOLID_FRAG = `
precision mediump float;
uniform vec4 uColor;
void main(){gl_FragColor=uColor;}
`;

function shader(type, src){
  const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(vs,fs){
  const p=gl.createProgram(); gl.attachShader(p,shader(gl.VERTEX_SHADER,vs)); gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;
}
const globeProgram=program(VERT,FRAG);
const solidProgram=program(VERT,SOLID_FRAG);

function sphere(latBands=48, lonBands=64, radius=1){
  const pos=[],norm=[],idx=[];
  for(let lat=0;lat<=latBands;lat++){
    const th=lat*Math.PI/latBands, st=Math.sin(th), ct=Math.cos(th);
    for(let lon=0;lon<=lonBands;lon++){
      const ph=lon*2*Math.PI/lonBands, sp=Math.sin(ph), cp=Math.cos(ph);
      const x=cp*st,y=ct,z=sp*st; pos.push(radius*x,radius*y,radius*z); norm.push(x,y,z);
    }
  }
  for(let lat=0;lat<latBands;lat++) for(let lon=0;lon<lonBands;lon++){
    const a=lat*(lonBands+1)+lon,b=a+lonBands+1; idx.push(a,b,a+1,b,b+1,a+1);
  }
  return {pos:new Float32Array(pos),norm:new Float32Array(norm),idx:new Uint16Array(idx)};
}
function cube(){
  const p=[-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1];
  const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]];
  const pos=[],norm=[],idx=[]; let base=0;
  const ns=[[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[1,0,0],[-1,0,0]];
  faces.forEach((f,fi)=>{f.forEach(i=>pos.push(p[i*3],p[i*3+1],p[i*3+2],...[])); for(let i=0;i<4;i++) norm.push(...ns[fi]); idx.push(base,base+1,base+2,base,base+2,base+3); base+=4;});
  return {pos:new Float32Array(pos),norm:new Float32Array(norm),idx:new Uint16Array(idx)};
}
function mesh(data){
  const vao={};
  vao.pb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vao.pb); gl.bufferData(gl.ARRAY_BUFFER,data.pos,gl.STATIC_DRAW);
  vao.nb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vao.nb); gl.bufferData(gl.ARRAY_BUFFER,data.norm,gl.STATIC_DRAW);
  vao.ib=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,vao.ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,data.idx,gl.STATIC_DRAW);
  vao.count=data.idx.length; return vao;
}
const globeMesh=mesh(sphere());
const cubeMesh=mesh(cube());

function perspective(fovy,aspect,near,far){
  const f=1/Math.tan(fovy/2),nf=1/(near-far); return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
}
function lookAt(eye,target,up){
  const z=norm(sub(eye,target)),x=norm(cross(up,z)),y=cross(z,x); return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
function ident(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;}
function translate(x,y,z){const m=ident();m[12]=x;m[13]=y;m[14]=z;return m;}
function scale(x,y,z){const m=ident();m[0]=x;m[5]=y;m[10]=z;return m;}
function rotY(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);}
function rotZ(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);}
function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];} function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];} function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];} function norm(v){const l=Math.hypot(...v)||1;return v.map(n=>n/l);}

function bindMesh(p,m){
  const ap=gl.getAttribLocation(p,'aPosition'),an=gl.getAttribLocation(p,'aNormal');
  gl.bindBuffer(gl.ARRAY_BUFFER,m.pb); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,m.nb); gl.enableVertexAttribArray(an); gl.vertexAttribPointer(an,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);
}

const stars=[]; for(let i=0;i<180;i++) stars.push({x:Math.random(),y:Math.random(),s:Math.random()*1.8+0.3,a:Math.random()*0.7+0.2});
const starCanvas=document.createElement('canvas'); const starCtx=starCanvas.getContext('2d');
function drawStars(){starCanvas.width=canvas.width;starCanvas.height=canvas.height;starCtx.clearRect(0,0,starCanvas.width,starCanvas.height);for(const s of stars){starCtx.fillStyle=`rgba(180,215,255,${s.a})`;starCtx.beginPath();starCtx.arc(s.x*starCanvas.width,s.y*starCanvas.height,s.s*DPR,0,Math.PI*2);starCtx.fill();}}
window.addEventListener('resize',drawStars); drawStars();

const satellites=[
  {r:2.35,speed:.26,phase:.2,tilt:.32,size:.085,color:[.48,.75,1,1]},
  {r:2.7,speed:-.19,phase:2.25,tilt:-.44,size:.07,color:[.8,.35,1,1]},
  {r:3.05,speed:.15,phase:4.2,tilt:.58,size:.06,color:[.42,.88,1,1]}
];
let scene='global',autoTour=false,autoStart=0;
const sceneData={
  global:['GLOBAL','Complete stereo coverage','2024–2026 foundation, continuously expanding.'],
  region:['REGION','From global coverage to AOI','Coverage becomes a selectable regional product layer.'],
  detail:['DETAIL','DOM + DSM in local 3D','0.8 m paired, co-temporal data for project-level use.']
};
function setScene(next){scene=next;showcase.dataset.scene=next;sceneButtons.forEach(b=>b.classList.toggle('active',b.dataset.sceneTarget===next));const d=sceneData[next];sceneKicker.textContent=d[0];sceneTitle.textContent=d[1];sceneText.textContent=d[2];}
sceneButtons.forEach(b=>b.addEventListener('click',()=>{autoTour=false;autoTourBtn.classList.remove('active');setScene(b.dataset.sceneTarget);}));
autoTourBtn.addEventListener('click',()=>{autoTour=!autoTour;autoTourBtn.classList.toggle('active',autoTour);autoStart=performance.now();});
uiBtn.addEventListener('click',()=>{document.body.classList.toggle('hide-ui');uiBtn.textContent=document.body.classList.contains('hide-ui')?'SHOW UI':'HIDE UI';});
fullscreenBtn.addEventListener('click',async()=>{if(!document.fullscreenElement)await showcase.requestFullscreen();else await document.exitFullscreen();});
document.addEventListener('keydown',e=>{if(e.key==='1')setScene('global');if(e.key==='2')setScene('region');if(e.key==='3')setScene('detail');if(e.key.toLowerCase()==='u')uiBtn.click();if(e.key.toLowerCase()==='f')fullscreenBtn.click();if(e.key===' ')autoTourBtn.click();});

function cameraForScene(t){
  const s=scene==='global'?0:scene==='region'?1:2;
  const radius=[4.2,3.35,2.55][s];
  const y=[.25,.18,.1][s];
  return [Math.sin(t*.08)*.28,y,radius];
}

function drawObject(p,m,model,view,proj,color){
  gl.useProgram(p); bindMesh(p,m);
  gl.uniformMatrix4fv(gl.getUniformLocation(p,'uModel'),false,model);
  gl.uniformMatrix4fv(gl.getUniformLocation(p,'uView'),false,view);
  gl.uniformMatrix4fv(gl.getUniformLocation(p,'uProj'),false,proj);
  if(color) gl.uniform4fv(gl.getUniformLocation(p,'uColor'),color);
  gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);
}

function render(ms){
  resize(); const t=ms*.001;
  if(autoTour){const elapsed=(ms-autoStart)/1000%15;setScene(elapsed<5?'global':elapsed<10?'region':'detail');}
  gl.clearColor(.008,.015,.035,1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);
  const aspect=canvas.width/canvas.height, proj=perspective(Math.PI/3.2,aspect,.1,100), eye=cameraForScene(t), view=lookAt(eye,[0,0,0],[0,1,0]);

  gl.useProgram(globeProgram); bindMesh(globeProgram,globeMesh);
  const earthScale=scene==='global'?1:scene==='region'?1.13:1.24;
  const model=mul(rotY(t*.14),scale(earthScale,earthScale,earthScale));
  gl.uniformMatrix4fv(gl.getUniformLocation(globeProgram,'uModel'),false,model);
  gl.uniformMatrix4fv(gl.getUniformLocation(globeProgram,'uView'),false,view);
  gl.uniformMatrix4fv(gl.getUniformLocation(globeProgram,'uProj'),false,proj);
  gl.uniform3fv(gl.getUniformLocation(globeProgram,'uCamera'),eye);
  gl.uniform1f(gl.getUniformLocation(globeProgram,'uTime'),t);
  gl.uniform1f(gl.getUniformLocation(globeProgram,'uCoverage'),scene==='detail'?.55:1);
  gl.drawElements(gl.TRIANGLES,globeMesh.count,gl.UNSIGNED_SHORT,0);

  for(const s of satellites){
    const a=t*s.speed+s.phase; const x=Math.cos(a)*s.r,z=Math.sin(a)*s.r,y=Math.sin(a*1.7)*s.tilt;
    let sat=mul(translate(x,y,z),rotY(-a+Math.PI/2)); sat=mul(sat,scale(s.size*2.1,s.size*.6,s.size*.6)); drawObject(solidProgram,cubeMesh,sat,view,proj,s.color);
    let panel1=mul(translate(x+Math.cos(a+.2)*s.size*2.6,y,z+Math.sin(a+.2)*s.size*2.6),rotY(-a+Math.PI/2));panel1=mul(panel1,scale(s.size*2.2,s.size*.12,s.size*1.2));drawObject(solidProgram,cubeMesh,panel1,view,proj,[.05,.18,.38,1]);
    let panel2=mul(translate(x-Math.cos(a+.2)*s.size*2.6,y,z-Math.sin(a+.2)*s.size*2.6),rotY(-a+Math.PI/2));panel2=mul(panel2,scale(s.size*2.2,s.size*.12,s.size*1.2));drawObject(solidProgram,cubeMesh,panel2,view,proj,[.05,.18,.38,1]);
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
