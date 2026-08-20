const metricData = [
  ['128','Tracked Satellites'],
  ['6','Ground Stations'],
  ['14','Active Missions'],
  ['3','Live Downlinks'],
  ['21','Upcoming Passes']
];

document.querySelector('#metrics').innerHTML = metricData.map(([value,label]) => `
  <div class="metric"><div class="value">${value}</div><div class="label">${label}</div></div>
`).join('');

const contacts = [
  ['SAT-018 · Sweden','AOS 10:31 · 11m 42s'],
  ['SAT-042 · Singapore','AOS 10:47 · 8m 16s'],
  ['SAT-007 · Sweden','AOS 11:08 · 9m 03s'],
  ['SAT-031 · Singapore','AOS 11:26 · 7m 51s']
];
document.querySelector('#contacts').innerHTML = contacts.map(([title,meta]) => `
  <div class="row"><div><strong>${title}</strong><small>${meta}</small></div><span class="badge">READY</span></div>
`).join('');

const missions = [
  ['SG Port Imaging','Optical · Priority 1','PLANNING'],
  ['Malacca Maritime Watch','SAR + AIS','ACTIVE'],
  ['Arctic Downlink Test','Ground network','ACTIVE']
];
document.querySelector('#missions').innerHTML = missions.map(([title,meta,state]) => `
  <div class="row"><div><strong>${title}</strong><small>${meta}</small></div><span class="badge">${state}</span></div>
`).join('');

const timeline = [
  ['10:31','SAT-018 AOS Sweden','CONTACT'],
  ['10:34','SAT-007 imaging Singapore','IMAGING'],
  ['10:42','SAT-018 downlink','DOWNLINK'],
  ['10:51','SAT-021 LOS Singapore','CONTACT'],
  ['11:03','SAT-007 processing','PROCESS'],
  ['11:18','Product ready','DELIVERY']
];
document.querySelector('#timeline').innerHTML = timeline.map(([time,label,type]) => `
  <div class="timeline-item"><span class="time">${time}</span><div><div>${label}</div><div class="line"></div></div><span class="badge">${type}</span></div>
`).join('');

function tick(){
  const now = new Date();
  document.querySelector('#clock').textContent = now.toLocaleString(undefined,{hour12:false});
}
tick(); setInterval(tick,1000);

document.querySelector('#runCopilot').addEventListener('click', () => {
  const objective = document.querySelector('#copilotInput').value.trim();
  const log = document.querySelector('#copilotLog');
  if(!objective) return;
  log.innerHTML = [
    `<strong>Objective accepted</strong><br>${objective}`,
    '1. AOI resolved: Singapore Port',
    '2. Candidate satellites: 7',
    '3. Weather filter applied: cloud < 20%',
    '4. Feasible acquisition windows: 3',
    '5. Best ground contact: Singapore GS',
    '<strong>Recommended plan:</strong> SAT-007 · acquisition 10:34 · downlink 10:47'
  ].join('<br><br>');
});
