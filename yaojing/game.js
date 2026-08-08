'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

let hero=JSON.parse(localStorage.getItem('yaojing_final_hero')||'null')||{
  name:'凌曜', style:'冷静 / 未来感',
  desc:'来自星轨观测站的少年守望者，以星能驱动双刃，在短距离内高速位移。',
  atk:38, spd:270, hp:115
};

function showScreen(id){
  ['lobby','creator','battle'].forEach(x=>$(x).classList.toggle('active',x===id));
}
function toast(msg){
  const el=$('toast');el.textContent=msg;el.classList.add('show');
  clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),1500);
}
function applyHeroUI(){
  $('lobbyName').textContent=hero.name;$('lobbyDesc').textContent=hero.desc;$('hudName').textContent=hero.name;
}
function openCreator(){
  $('nameInput').value=hero.name;$('styleInput').value=hero.style;$('descInput').value=hero.desc;
  $('atkInput').value=hero.atk;$('spdInput').value=hero.spd;$('hpInput').value=hero.hp;syncCreator();showScreen('creator');
}
function syncCreator(){
  $('previewName').textContent=$('nameInput').value||'未命名';$('previewSub').textContent=$('styleInput').value;
  $('atkVal').textContent=$('atkInput').value;$('spdVal').textContent=$('spdInput').value;$('hpVal').textContent=$('hpInput').value;
}
['nameInput','styleInput','descInput','atkInput','spdInput','hpInput'].forEach(id=>$(id).addEventListener('input',syncCreator));
function saveHero(){
  hero={name:$('nameInput').value.trim()||'凌曜',style:$('styleInput').value,desc:$('descInput').value.trim()||'星能双刃英雄',
        atk:+$('atkInput').value,spd:+$('spdInput').value,hp:+$('hpInput').value};
  localStorage.setItem('yaojing_final_hero',JSON.stringify(hero));applyHeroUI();toast('角色已保存');setTimeout(()=>showScreen('lobby'),300);
}
function backLobby(){applyHeroUI();showScreen('lobby')}

const gameCanvas=$('game'),ctx=gameCanvas.getContext('2d'),mini=$('mini'),mctx=mini.getContext('2d');
let game=null,last=performance.now(),keys={},mouse={x:700,y:300},touchX=0,touchY=0;

addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key===' ')e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
gameCanvas.addEventListener('mousemove',e=>{const r=gameCanvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*1280/r.width;mouse.y=(e.clientY-r.top)*720/r.height});
gameCanvas.addEventListener('mousedown',e=>{if(game) attackToward(mouse.x,mouse.y)});

function mkUnit(x,y,team,type='minion'){
  return {x,y,team,type,r:type==='hero'?18:10,hp:type==='hero'?100:54,max:type==='hero'?100:54,atkTimer:0,speed:type==='hero'?72:48};
}
function startBattle(){
  $('result').classList.remove('show');showScreen('battle');
  game={
    running:true,time:0,waveTime:0,blue:0,red:0,msg:'',msgT:0,
    h:{x:180,y:610,r:18,hp:hero.hp,max:hero.hp,atk:hero.atk,spd:hero.spd,lv:1,xp:0,q:0,e:0,r:0,buff:0,shot:0,respawn:0},
    allyHero:mkUnit(240,560,'b','hero'),enemyHero:mkUnit(1030,160,'r','hero'),
    allies:[],enemies:[],shots:[],effects:[],
    towers:[
      {x:330,y:535,team:'b',hp:330,max:330,r:18},{x:485,y:440,team:'b',hp:330,max:330,r:18},{x:620,y:350,team:'b',hp:330,max:330,r:18},
      {x:690,y:315,team:'r',hp:330,max:330,r:18},{x:835,y:225,team:'r',hp:330,max:330,r:18},{x:980,y:140,team:'r',hp:330,max:330,r:18}
    ],
    bases:[{x:105,y:655,team:'b',hp:950,max:950,r:38},{x:1170,y:70,team:'r',hp:950,max:950,r:38}]
  };
  spawnWave();toast('对战开始');
}
function leaveBattle(){game=null;showScreen('lobby')}
function spawnWave(){
  for(let i=0;i<5;i++){
    game.allies.push(mkUnit(180+i*20,610-i*10,'b'));
    game.enemies.push(mkUnit(1100-i*20,105+i*10,'r'));
  }
}
function nearest(from,list){
  let t=null,b=1e9;for(const x of list){if(x.hp>0){const d=distance(from,x);if(d<b){b=d;t=x}}}return [t,b];
}
function structureTargets(team){
  return game.towers.filter(x=>x.team!==team&&x.hp>0).concat(game.bases.filter(x=>x.team!==team&&x.hp>0));
}
function moveToward(u,t,s,dt){
  const dx=t.x-u.x,dy=t.y-u.y,l=Math.hypot(dx,dy)||1;u.x+=dx/l*s*dt;u.y+=dy/l*s*dt;
}
function unitAI(u,dt){
  if(u.hp<=0)return;
  let foes=u.team==='b'?game.enemies:game.allies;
  if(u.team==='b'&&game.enemyHero.hp>0)foes=foes.concat([game.enemyHero]);
  if(u.team==='r'&&game.allyHero.hp>0)foes=foes.concat([game.allyHero]);
  if(u.team==='r'&&game.h.respawn<=0&&game.h.hp>0)foes=foes.concat([game.h]);
  let [target,d]=nearest(u,foes);
  if(!target||d>155)[target,d]=nearest(u,structureTargets(u.team));
  if(!target)return;
  const reach=(u.r||10)+(target.r||12)+8;
  if(d>reach)moveToward(u,target,u.speed,dt);
  else{u.atkTimer-=dt;if(u.atkTimer<=0){target.hp-=u.type==='hero'?12:7;u.atkTimer=u.type==='hero'?.62:.82}}
}
function heroAI(u,dt){
  if(u.hp<=0){u.respawn=(u.respawn||3)-dt;if(u.respawn<=0){u.hp=100;u.x=u.team==='b'?220:1050;u.y=u.team==='b'?570:150}return}
  unitAI(u,dt);
}
function aimNearestEnemy(){
  if(!game)return null;const h=game.h;
  let candidates=game.enemies.filter(e=>e.hp>0);
  if(game.enemyHero.hp>0)candidates.push(game.enemyHero);
  candidates=candidates.concat(game.towers.filter(t=>t.team==='r'&&t.hp>0));
  const [t]=nearest(h,candidates);return t;
}
function attackToward(x,y){
  if(!game||!game.running)return;const h=game.h;if(h.respawn>0||h.shot>0)return;
  const dx=x-h.x,dy=y-h.y,l=Math.hypot(dx,dy)||1;
  game.shots.push({x:h.x,y:h.y,vx:dx/l*650,vy:dy/l*650,life:1.35,dmg:h.atk*(h.buff>0?1.35:1),team:'b'});
  h.shot=.28;
}
function attackNearest(){const t=aimNearestEnemy();if(t)attackToward(t.x,t.y);else attackToward(game.h.x+120,game.h.y)}
function skillQ(){
  if(!game||!game.running)return;const h=game.h;if(h.q>0||h.respawn>0)return;
  const t=aimNearestEnemy();let tx=t?t.x:mouse.x,ty=t?t.y:mouse.y,dx=tx-h.x,dy=ty-h.y,l=Math.hypot(dx,dy)||1;
  h.x=clamp(h.x+dx/l*130,20,1260);h.y=clamp(h.y+dy/l*130,20,700);h.q=4;
  game.effects.push({x:h.x,y:h.y,r:12,max:65,life:.25,col:'#79d5ff'});
}
function skillE(){
  if(!game||!game.running)return;const h=game.h;if(h.e>0||h.respawn>0)return;
  for(const e of game.enemies)if(distance(h,e)<150)e.hp-=58;
  if(game.enemyHero.hp>0&&distance(h,game.enemyHero)<150)game.enemyHero.hp-=48;
  for(const t of game.towers)if(t.team==='r'&&t.hp>0&&distance(h,t)<150)t.hp-=25;
  h.e=7;game.effects.push({x:h.x,y:h.y,r:20,max:165,life:.4,col:'#78cfff'});
}
function skillR(){
  if(!game||!game.running)return;const h=game.h;if(h.r>0||h.respawn>0)return;
  h.buff=6;h.r=27;game.msg='曜界开启';game.msgT=1.3;game.effects.push({x:h.x,y:h.y,r:20,max:120,life:.65,col:'#d38cff'});
}
function killPlayer(){
  const h=game.h;h.hp=0;h.respawn=3;game.msg='你已被击败 · 3秒后重生';game.msgT=2.6;game.red++;
}
function update(dt){
  if(!game||!game.running)return;
  const g=game,h=g.h;g.time+=dt;g.waveTime+=dt;if(g.waveTime>9){g.waveTime=0;spawnWave()}
  h.q=Math.max(0,h.q-dt);h.e=Math.max(0,h.e-dt);h.r=Math.max(0,h.r-dt);h.buff=Math.max(0,h.buff-dt);h.shot-=dt;
  if(h.respawn>0){h.respawn-=dt;if(h.respawn<=0){h.hp=h.max;h.x=180;h.y=610;g.msg='重新加入战斗';g.msgT=1}}
  else{
    let dx=((keys.d||keys.arrowright)?1:0)-((keys.a||keys.arrowleft)?1:0)+touchX;
    let dy=((keys.s||keys.arrowdown)?1:0)-((keys.w||keys.arrowup)?1:0)+touchY;
    const len=Math.hypot(dx,dy)||1,spd=h.spd*(h.buff>0?1.18:1);
    if(Math.abs(dx)+Math.abs(dy)>0.02){h.x=clamp(h.x+dx/len*spd*dt,20,1260);h.y=clamp(h.y+dy/len*spd*dt,20,700)}
    if(keys[' ']&&h.shot<=0)attackNearest();if(keys.q)skillQ();if(keys.e)skillE();if(keys.r)skillR();
  }
  g.allies.forEach(u=>unitAI(u,dt));g.enemies.forEach(u=>unitAI(u,dt));heroAI(g.allyHero,dt);heroAI(g.enemyHero,dt);
  g.shots.forEach(s=>{
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life<=0)return;
    const targets=g.enemies.concat(g.enemyHero.hp>0?[g.enemyHero]:[]).concat(g.towers.filter(t=>t.team==='r'&&t.hp>0)).concat(g.bases.filter(b=>b.team==='r'&&b.hp>0));
    for(const t of targets){if(t.hp>0&&distance(s,t)<(t.r||10)+7){t.hp-=s.dmg;s.life=0;break}}
  });
  g.shots=g.shots.filter(s=>s.life>0);
  g.effects.forEach(e=>{e.life-=dt;e.r+=(e.max-e.r)*Math.min(1,dt*9)});g.effects=g.effects.filter(e=>e.life>0);

  g.enemies=g.enemies.filter(e=>{if(e.hp<=0){g.blue++;h.xp+=17;if(h.xp>=60){h.xp-=60;h.lv++;h.max+=12;h.hp=h.max;h.atk+=4;g.msg='升级 Lv.'+h.lv;g.msgT=1}return false}return true});
  g.allies=g.allies.filter(a=>{if(a.hp<=0){g.red++;return false}return true});
  if(g.enemyHero.hp<=0){g.blue+=2;g.enemyHero.hp=0;g.enemyHero.respawn=4}
  if(g.allyHero.hp<=0){g.red+=2;g.allyHero.hp=0;g.allyHero.respawn=4}
  if(h.hp<=0&&h.respawn<=0)killPlayer();

  for(const t of g.towers)if(t.hp<0)t.hp=0;
  for(const b of g.bases)if(b.hp<0)b.hp=0;
  const redBase=g.bases.find(b=>b.team==='r'),blueBase=g.bases.find(b=>b.team==='b');
  if(redBase.hp<=0)finish(true);else if(blueBase.hp<=0)finish(false);

  $('blueScore').textContent=g.blue;$('redScore').textContent=g.red;$('level').textContent=h.lv;
  $('hpFill').style.width=(100*clamp(h.hp,0,h.max)/h.max)+'%';$('xpFill').style.width=(100*h.xp/60)+'%';
  $('timer').textContent=String(Math.floor(g.time/60)).padStart(2,'0')+':'+String(Math.floor(g.time%60)).padStart(2,'0');
  if(g.msgT>0){g.msgT-=dt;$('battleMsg').textContent=g.msg}else $('battleMsg').textContent='';
}
function finish(win){
  if(!game||!game.running)return;game.running=false;$('resultTitle').textContent=win?'胜利':'失败';
  $('resultText').textContent=win?'敌方核心已被摧毁。':'我方核心已被摧毁。';
  $('result').classList.add('show');
}
function draw(){
  ctx.clearRect(0,0,1280,720);
  ctx.fillStyle='#173328';ctx.fillRect(0,0,1280,720);
  for(let i=0;i<38;i++){const x=(i*173)%1280,y=(i*97)%720;ctx.fillStyle=i%2?'#1e4430':'#153a29';ctx.beginPath();ctx.arc(x,y,30+(i%5)*8,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle='#2e7083';ctx.lineWidth=62;ctx.beginPath();ctx.moveTo(370,0);ctx.lineTo(910,720);ctx.stroke();
  ctx.strokeStyle='#91a487';ctx.lineWidth=67;ctx.beginPath();ctx.moveTo(80,665);ctx.lineTo(1190,55);ctx.stroke();
  ctx.strokeStyle='#c1b39244';ctx.lineWidth=43;ctx.beginPath();ctx.moveTo(80,665);ctx.lineTo(1190,55);ctx.stroke();
  if(!game)return;
  const g=game;
  for(const t of g.towers){if(t.hp<=0)continue;ctx.fillStyle=t.team==='b'?'#61b2ff':'#ff6d6d';ctx.fillRect(t.x-13,t.y-22,26,44);ctx.fillStyle='#0008';ctx.fillRect(t.x-22,t.y-34,44,5);ctx.fillStyle='#e2ca7f';ctx.fillRect(t.x-22,t.y-34,44*t.hp/t.max,5)}
  for(const b of g.bases){ctx.fillStyle=b.team==='b'?'#67b8ff':'#ff7070';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f3d88c';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#0008';ctx.fillRect(b.x-40,b.y-52,80,6);ctx.fillStyle='#ecd27f';ctx.fillRect(b.x-40,b.y-52,80*b.hp/b.max,6)}
  const drawUnit=(u,col)=>{if(u.hp<=0)return;ctx.fillStyle=col;ctx.beginPath();ctx.arc(u.x,u.y,u.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0008';ctx.fillRect(u.x-14,u.y-18,28,4);ctx.fillStyle=col;ctx.fillRect(u.x-14,u.y-18,28*clamp(u.hp/u.max,0,1),4)};
  g.allies.forEach(u=>drawUnit(u,'#78c1ff'));g.enemies.forEach(u=>drawUnit(u,'#ff8585'));drawUnit(g.allyHero,'#70d4ff');drawUnit(g.enemyHero,'#ff6262');
  if(g.h.respawn<=0){ctx.fillStyle=g.h.buff>0?'#e3a4ff':'#efd58b';ctx.beginPath();ctx.arc(g.h.x,g.h.y,g.h.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#83d4ff';ctx.lineWidth=4;ctx.stroke()}
  for(const s of g.shots){ctx.fillStyle='#d8f5ff';ctx.beginPath();ctx.arc(s.x,s.y,5,0,Math.PI*2);ctx.fill()}
  for(const e of g.effects){ctx.strokeStyle=e.col;ctx.globalAlpha=clamp(e.life*2,0,1);ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
}
function drawMini(){
  mctx.clearRect(0,0,170,170);mctx.fillStyle='#153027';mctx.fillRect(0,0,170,170);mctx.strokeStyle='#477885';mctx.lineWidth=10;mctx.beginPath();mctx.moveTo(48,0);mctx.lineTo(121,170);mctx.stroke();mctx.strokeStyle='#98a78e';mctx.lineWidth=8;mctx.beginPath();mctx.moveTo(10,158);mctx.lineTo(160,12);mctx.stroke();
  if(!game)return;const sx=170/1280,sy=170/720;
  mctx.fillStyle='#62b4ff';for(const a of game.allies)mctx.fillRect(a.x*sx-2,a.y*sy-2,4,4);
  mctx.fillStyle='#ff6969';for(const e of game.enemies)mctx.fillRect(e.x*sx-2,e.y*sy-2,4,4);
  if(game.h.respawn<=0){mctx.fillStyle='#f0d486';mctx.beginPath();mctx.arc(game.h.x*sx,game.h.y*sy,4,0,Math.PI*2);mctx.fill()}
}
function loop(t){
  const dt=Math.min(.033,(t-last)/1000||0);last=t;if($('battle').classList.contains('active'))update(dt);draw();drawMini();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const joy=$('joystick'),stick=$('stick');let joyId=null;
function setJoy(t){
  const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=t.clientX-cx,dy=t.clientY-cy;const max=42,l=Math.hypot(dx,dy)||1;if(l>max){dx=dx/l*max;dy=dy/l*max}
  touchX=dx/max;touchY=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;
}
function resetJoy(){touchX=touchY=0;joyId=null;stick.style.transform='translate(0,0)'}
joy.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];joyId=t.identifier;setJoy(t)},{passive:false});
joy.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===joyId)setJoy(t)},{passive:false});
joy.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===joyId)resetJoy()},{passive:false});
joy.addEventListener('touchcancel',resetJoy,{passive:false});
function bindTouch(id,fn){const el=$(id);el.addEventListener('touchstart',e=>{e.preventDefault();fn()},{passive:false});el.addEventListener('click',e=>{e.preventDefault();fn()})}
bindTouch('mAtk',attackNearest);bindTouch('mQ',skillQ);bindTouch('mE',skillE);bindTouch('mR',skillR);

applyHeroUI();openCreator();backLobby();