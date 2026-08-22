(() => {
  'use strict';

  const frame = document.getElementById('frame');
  if (!frame) return;

  const defaults = {
    epochMs: Date.now(),
    pov: { lat: 18, lng: 103, altitude: 2.08 },
    selectedId: 'GF-7 02',
    moduleKey: 'ops',
    live: true,
    frozenElapsed: 0
  };

  window.__SPACEOPS_SHARED_GLOBE_STATE__ = {
    ...defaults,
    ...(window.__SPACEOPS_SHARED_GLOBE_STATE__ || {})
  };

  const moduleRuntimeUrl = new URL('globe-module.js?rev=20260822o', location.href).href;

  function detectModule(d) {
    try {
      const m = d.location.pathname.toLowerCase().match(/\/(ops|twin|plan|ground|earth|eng)\.html$/);
      if (m) return m[1];
    } catch (_) {}
    const title = String(d?.title || '').toLowerCase();
    for (const key of ['ops','twin','plan','ground','earth','eng']) {
      if (title.includes(`· ${key}`) || title.endsWith(key)) return key;
    }
    return '';
  }

  function addHiddenKeyword(d, button, text) {
    if (!button || button.querySelector('[data-spaceops-globe-keyword]')) return;
    const span = d.createElement('span');
    span.dataset.spaceopsGlobeKeyword = '1';
    span.hidden = true;
    span.textContent = ` ${text} `;
    button.appendChild(span);
  }

  function utcHm(date) {
    return `${String(date.getUTCHours()).padStart(2,'0')}:${String(date.getUTCMinutes()).padStart(2,'0')}`;
  }

  function normalizeOpsAcceptance(d) {
    if (!d || d.documentElement.dataset.spaceopsOpsAccepted === '1') return;
    d.documentElement.dataset.spaceopsOpsAccepted = '1';

    const metrics = [...d.querySelectorAll('.metrics .metric')];
    if (metrics[2]) metrics[2].innerHTML = '<b>0</b><span>Active Downlinks</span><em>no contact currently active · simulated</em>';
    if (metrics[3]) metrics[3].innerHTML = '<b>4</b><span>Contacts · Next 90m</span><em>3 managed · 1 partner · simulated</em>';

    const healthLabels = [...d.querySelectorAll('.healthRow span')];
    if (healthLabels[0]) healthLabels[0].textContent = 'Spacecraft nominal';
    if (healthLabels[2]) healthLabels[2].textContent = 'Processing slots free · simulated';

    const map = d.getElementById('map');
    if (map && !map.querySelector('[data-id="GS-IN-04"]')) {
      const station = d.createElement('i');
      station.className = 'gs g3';
      station.dataset.id = 'GS-IN-04';
      station.style.left = '63%';
      station.style.top = '66%';
      station.style.borderColor = 'var(--blue)';
      map.appendChild(station);
    }

    const aoi = d.getElementById('aoiLayer');
    if (aoi && !aoi.querySelector('[data-spaceops-aoi-label]')) {
      aoi.dataset.id = 'SG-PORT-04';
      aoi.title = 'SG-PORT-04 · Singapore Port AOI';
      const label = d.createElement('span');
      label.dataset.spaceopsAoiLabel = '1';
      label.textContent = 'SG-PORT-04';
      Object.assign(label.style, {position:'absolute',left:'0',top:'-15px',fontSize:'7px',color:'var(--pink2)',whiteSpace:'nowrap'});
      aoi.appendChild(label);
    }

    const legend = d.querySelector('.mapwrap .legend');
    if (legend) legend.innerHTML = '<span>◆ SPACECRAFT</span><span>○ GROUND</span><span>□ AOI</span><span>— ORBIT</span>';

    const contacts = d.getElementById('contacts');
    if (contacts) {
      const now = Date.now();
      const rows = [
        [12,'GF-7 02','GS-SG-02','62°','X'],
        [31,'SAR-01','GS-SE-01','48°','X'],
        [54,'SY-01','GS-IN-04','71°','S'],
        [78,'SUPERVIEW NEO-1','GS-SE-01','53°','X']
      ];
      contacts.innerHTML = rows.map(([mins,sat,gs,el,band]) => `<tr><td>${utcHm(new Date(now + mins*60000))}</td><td>${sat}</td><td>${gs}</td><td>${el}</td><td>${band}</td></tr>`).join('');
    }

    const feed = d.getElementById('feed');
    if (feed) {
      const now = Date.now();
      const events = [
        [1,'Singapore Port Watch ranked first on GF-7 02',''],
        [3,'GS-SG-02 contact reserved',''],
        [6,'SAR-01 storage margin entered watch threshold','warn'],
        [10,'EO-8821 processing job passed QC','']
      ];
      feed.innerHTML = events.map(([mins,text,kind]) => `<div class="event ${kind}"><time>${utcHm(new Date(now - mins*60000))}</time><i></i><span>${text}</span></div>`).join('');
    }

    const planBtn = d.getElementById('runMission');
    const objective = d.getElementById('objective');
    const output = d.getElementById('copilotOut');
    if (planBtn && objective && output) {
      planBtn.onclick = () => {
        const text = objective.value.trim();
        if (!text) {
          d.getElementById('toastbox')?.appendChild(Object.assign(d.createElement('div'),{className:'toast',textContent:'Add a mission objective first'}));
          return;
        }
        const q = text.toLowerCase();
        let plan;
        if (q.includes('sar') || q.includes('red sea') || q.includes('ice')) {
          plan = {sat:'SAR-01',sensor:'SAR · X-band',cloud:'N/A',gs:'GS-SE-01',offset:31,delivery:'~52 min after acquisition'};
        } else if (q.includes('maritime') || q.includes('dubai') || q.includes('ais')) {
          plan = {sat:'SY-01',sensor:'Maritime imaging',cloud:'context only',gs:'GS-IN-04',offset:54,delivery:'~45 min after acquisition'};
        } else if (q.includes('neo') || q.includes('stereo')) {
          plan = {sat:'SUPERVIEW NEO-1',sensor:'Optical',cloud:'12% simulated',gs:'GS-SE-01',offset:78,delivery:'~40 min after acquisition'};
        } else {
          plan = {sat:'GF-7 02',sensor:'Optical · 0.65 m',cloud:'12% simulated',gs:'GS-SG-02',offset:12,delivery:'~38 min after acquisition'};
        }
        const contact = utcHm(new Date(Date.now() + plan.offset*60000));
        output.textContent = `SIMULATED PLAN\n${plan.sat} · ${plan.sensor}\nCloud context · ${plan.cloud}\nFeasible contact · ${plan.gs} · ${contact} UTC\nDelivery estimate · ${plan.delivery}\nStatus · EXECUTABLE PROTOTYPE`;
      };
    }

    d.querySelectorAll('.sat,.gs').forEach(el => {
      el.addEventListener('click', () => {
        const head = d.querySelector('.workspace .panel .head small');
        if (head) head.textContent = `SELECTED · ${el.dataset.id} · SIMULATED STATE`;
      });
    });
  }

  function normalizeModuleControls(d, key) {
    if (!d) return;

    if (key === 'ground') {
      const chips = [...d.querySelectorAll('.sceneTools .chip')];
      const byText = label => chips.find(b => b.textContent.trim().toUpperCase() === label);
      const access = byText('ACCESS');
      const stations = byText('STATIONS');
      const footprint = byText('FOOTPRINT');
      const weather = byText('WEATHER');
      if (access) {
        access.dataset.layer = 'access';
        addHiddenKeyword(d, access, 'ORBIT SAT');
      }
      if (stations) stations.dataset.layer = 'stations';
      if (footprint) footprint.dataset.layer = 'footprint';
      if (weather) weather.dataset.layer = 'weather';
    }

    if (key === 'earth') {
      const eo = d.querySelector('.sceneTools [data-layer="eo"]');
      addHiddenKeyword(d, eo, 'AOI');
    }
  }

  function normalizeTwinLiveControl(d) {
    const live = d?.getElementById('liveState');
    if (!live || live.dataset.spaceopsGlobeNormalized === '1') return;
    live.dataset.spaceopsGlobeNormalized = '1';

    live.onclick = null;
    live.addEventListener('click', () => {
      setTimeout(() => {
        const on = live.classList.contains('on');
        const footer = d.getElementById('footerLive');
        if (footer) {
          footer.textContent = on ? '● LIVE' : '● PAUSED';
          footer.style.color = on ? 'var(--green)' : 'var(--amber)';
        }
        d.documentElement.dataset.liveState = on ? 'on' : 'paused';
      }, 0);
    });
  }

  function inject() {
    let d;
    try { d = frame.contentDocument; } catch (_) { return; }
    if (!d?.head || !d?.body) return;

    const key = detectModule(d);
    normalizeModuleControls(d, key);
    if (key === 'ops') normalizeOpsAcceptance(d);
    if (key === 'twin') normalizeTwinLiveControl(d);

    if (d.getElementById('spaceops-shared-globe-module')) return;
    const script = d.createElement('script');
    script.id = 'spaceops-shared-globe-module';
    script.type = 'module';
    script.src = moduleRuntimeUrl;
    d.head.appendChild(script);
  }

  frame.addEventListener('load', () => {
    inject();
    setTimeout(inject, 80);
    setTimeout(inject, 180);
  });

  inject();
})();