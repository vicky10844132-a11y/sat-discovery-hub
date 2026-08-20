const state = {
  metrics:[['128','Tracked Satellites'],['6','Ground Stations'],['14','Active Missions'],['3','Live Downlinks'],['21','Upcoming Passes']],
  contacts:[
    {time:'10:31',title:'SAT-018 · Sweden',meta:'AOS · 11m 42s · X-band',state:'READY'},
    {time:'10:47',title:'SAT-042 · Singapore',meta:'AOS · 8m 16s · S/X-band',state:'READY'},
    {time:'11:08',title:'SAT-007 · Sweden',meta:'AOS · 9m 03s · X-band',state:'QUEUED'},
    {time:'11:26',title:'SAT-031 · Singapore',meta:'AOS · 7m 51s · S-band',state:'QUEUED'}
  ],
  missions:[
    {title:'Singapore Port Watch',meta:'Optical + SAR · Priority 1',state:'ACTIVE'},
    {title:'Malacca Maritime Watch',meta:'SAR + AIS fusion',state:'ACTIVE'},
    {title:'Arctic Downlink Test',meta:'Ground-network qualification',state:'PLANNING'}
  ],
  timeline:[
    ['10:31','SAT-018 AOS Sweden','CONTACT'],
    ['10:34','SAT-007 imaging Singapore','IMAGING'],
    ['10:42','SAT-018 downlink','DOWNLINK'],
    ['10:51','SAT-021 LOS Singapore','CONTACT'],
    ['11:03','SAT-007 processing','PROCESS'],
    ['11:18','Product ready','DELIVERY']
  ]
};

const assetDetails = {
  'SAT-018':{Type:'LEO EO',Orbit:'SSO · 518 km',Payload:'Optical 0.5 m',Status:'Nominal',Next:'Sweden · 10:31'},
  'SAT-042':{Type:'LEO EO',Orbit:'SSO · 535 km',Payload:'SAR X-band',Status:'Nominal',Next:'Singapore · 10:47'},
  'SAT-007':{Type:'LEO EO',Orbit:'SSO · 505 km',Payload:'Optical 0.7 m',Status:'Tasked',Next:'Singapore AOI · 10:34'},
  'GS-SIN-01':{Type:'Ground Station',Location:'Singapore',Bands:'S / X',Status:'Nominal',Queue:'4 contacts'},
  'GS-SE-01':{Type:'Ground Station',Location:'Sweden',Bands:'S / X / Ka',Status:'Nominal',Queue:'7 contacts'}
};

const titles={operations:'Global Operations',satellites:'Satellite Fleet',planning:'Mission Planning',ground:'Ground Network',intelligence:'Data & Intelligence',engineering:'Engineering Lab'};

document.querySelector('#metrics').innerHTML=state.metrics.map(([value,label])=>`<div class="metric"><div class="value">${value}</div><div class="label">${label}</div></div>`).join('');
document.querySelector('#contacts').innerHTML=state.contacts.map(x=>`<div class="contact-row"><div class="contact-time">${x.time}</div><div><strong>${x.title}</strong><small>${x.meta}</small></div><span class="badge">${x.state}</span></div>`).join('');
document.querySelector('#missions').innerHTML=state.missions.map((x,i)=>`<div class="mission-row ${i<2?'active':''}"><div><strong>${x.title}</strong><small>${x.meta}</small></div><span class="badge">${x.state}</span></div>`).join('');
document.querySelector('#timeline').innerHTML=state.timeline.map(([time,label,type])=>`<div class="timeline-item"><span class="time">${time}</span><span class="timeline-node"></span><div><div class="timeline-label">${label}</div><div class="timeline-track"></div></div><span class="badge">${type}</span></div>`).join('');

function tick(){document.querySelector('#clock').textContent=new Date().toLocaleString(undefined,{hour12:false});}
tick();setInterval(tick,1000);

document.querySelectorAll('.rail-item').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.rail-item').forEach(x=>x.classList.remove('active'));
  button.classList.add('active');
  const view=button.dataset.view;
  document.querySelector('#viewTitle').textContent=titles[view]||'Operations';
  document.body.dataset.view=view;
}));

document.querySelectorAll('#layerDock button').forEach(button=>button.addEventListener('click',()=>button.classList.toggle('active')));

const drawer=document.querySelector('#assetDrawer');
document.querySelectorAll('[data-asset]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.asset,details=assetDetails[id]||{};
  document.querySelector('#drawerTitle').textContent=id;
  document.querySelector('#drawerBody').innerHTML=`<dl>${Object.entries(details).map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><hr><div class="drawer-kicker">LIVE DIGITAL TWIN OBJECT</div>`;
  drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');
}));
document.querySelector('#closeDrawer').addEventListener('click',()=>{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');});

document.querySelector('#runCopilot').addEventListener('click',()=>{
  const objective=document.querySelector('#copilotInput').value.trim();
  if(!objective)return;
  const log=document.querySelector('#copilotLog');
  log.innerHTML='<span style="color:#ff6a9a">OBJECTIVE ACCEPTED</span><br>Resolving AOI and constraints…';
  const steps=[
    'AOI resolved · Singapore Port',
    '7 candidate spacecraft discovered',
    'Cloud filter · ≤20%',
    '3 feasible acquisition windows',
    'Ground network conflict check passed',
    '<strong style="color:#fff">Recommended · SAT-007 / 10:34 imaging / 10:47 downlink</strong>'
  ];
  let i=0;const timer=setInterval(()=>{if(i>=steps.length){clearInterval(timer);return;}log.innerHTML+=`<br>${steps[i++]}`;},240);
});

document.querySelector('#newMission').addEventListener('click',()=>{
  document.querySelector('#copilotInput').focus();
  document.querySelector('#copilotInput').select();
});
