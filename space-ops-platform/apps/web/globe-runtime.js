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
  const opsRuntimeUrl = new URL('ops-runtime.js?rev=20260824a', location.href).href;
  const twinRuntimeUrl = new URL('twin-runtime.js?rev=20260824a', location.href).href;
  const planRuntimeUrl = new URL('plan-runtime.js?rev=20260824a', location.href).href;

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

  function normalizeSharedContext(d, key) {
    if (!d || !key) return;
    let chip = d.querySelector('[data-spaceops-shared-context]');
    if (!chip) {
      chip = d.createElement('span');
      chip.dataset.spaceopsSharedContext = '1';
      chip.title = 'Shared mission context from the Space Ops workspace shell';
      Object.assign(chip.style, {
        display:'inline-flex',alignItems:'center',minHeight:'28px',maxWidth:'360px',padding:'0 9px',
        border:'1px solid #343b45',background:'#0d1116',color:'#8f98a4',fontSize:'8px',
        letterSpacing:'.02em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'
      });
      const host = d.querySelector('.topActions') || d.querySelector('.top .actions') || d.querySelector('.top');
      if (host) host.appendChild(chip);
    }
    const render = detail => {
      if (!chip) return;
      const mission = String(detail?.mission || '').trim() || 'NONE';
      const aoi = String(detail?.aoi || '').trim() || '—';
      const priority = String(detail?.priority || 'P2').trim() || 'P2';
      chip.textContent = `MISSION · ${mission} · AOI ${aoi} · ${priority}`;
      chip.dataset.module = key;
      d.documentElement.dataset.sharedMission = mission;
      d.documentElement.dataset.sharedAoi = aoi;
      d.documentElement.dataset.sharedPriority = priority;
    };
    if (chip && chip.dataset.spaceopsContextBound !== '1') {
      chip.dataset.spaceopsContextBound = '1';
      d.defaultView?.addEventListener('message', event => {
        if (event.data?.type === 'spaceops:context' && event.data.detail) render(event.data.detail);
      });
    }
    try {
      let detail = {};
      const raw = localStorage.getItem('spaceops.sharedContext');
      if (raw) detail = JSON.parse(raw) || {};
      render(detail);
    } catch (_) { render({}); }
  }

  function normalizeOpsSelectedHud(d) {
    const scene = d.querySelector('.mapwrap');
    if (!scene) return;
    let hud = d.getElementById('spaceopsOpsSelectedHud');
    if (!hud) {
      const style = d.createElement('style');
      style.id = 'spaceops-ops-selected-hud-style';
      style.textContent = `
        #spaceopsOpsSelectedHud{position:absolute;z-index:34;left:18px;bottom:48px;width:230px;padding:10px 11px 9px;border-left:2px solid rgba(111,168,255,.58);border-top:1px solid rgba(94,112,133,.16);border-bottom:1px solid rgba(94,112,133,.12);background:linear-gradient(90deg,rgba(5,10,16,.76),rgba(5,10,16,.34));backdrop-filter:blur(10px);pointer-events:none}
        #spaceopsOpsSelectedHud .selEyebrow{font:5.5px ui-monospace,monospace;letter-spacing:.15em;color:#61707f}
        #spaceopsOpsSelectedHud .selName{margin-top:5px;font-size:13px;font-weight:750;letter-spacing:.015em;color:#edf2f7}
        #spaceopsOpsSelectedHud .selMeta{display:flex;gap:8px;align-items:center;margin-top:4px;font:6.5px ui-monospace,monospace;color:#82909e}
        #spaceopsOpsSelectedHud .selDot{width:5px;height:5px;border-radius:50%;background:#73d7a2;box-shadow:0 0 8px rgba(115,215,162,.26)}
        #spaceopsOpsSelectedHud .selGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px 12px;margin-top:9px;padding-top:8px;border-top:1px solid rgba(86,103,122,.12)}
        #spaceopsOpsSelectedHud .selCell span{display:block;font:5.2px ui-monospace,monospace;letter-spacing:.10em;color:#596674}
        #spaceopsOpsSelectedHud .selCell b{display:block;margin-top:2px;font:7px ui-monospace,monospace;font-weight:650;color:#aeb9c5}
        @media(max-width:720px){#spaceopsOpsSelectedHud{left:12px;bottom:52px;width:205px;padding:8px 9px}.side{z-index:40}}
      `;
      d.head.appendChild(style);
      hud = d.createElement('div');
      hud.id = 'spaceopsOpsSelectedHud';
      hud.setAttribute('aria-live','polite');
      scene.appendChild(hud);
    }

    const lookup = {
      'GF-7 02': {type:'SPACECRAFT',state:'NOMINAL',role:'OPTICAL / 0.65 M',link:'GS-SG-02',accent:'#ff6d9f'},
      'SUPERVIEW NEO-1': {type:'SPACECRAFT',state:'NOMINAL',role:'OPTICAL',link:'GS-SE-01',accent:'#6fa8ff'},
      'SY-01': {type:'SPACECRAFT',state:'NOMINAL',role:'MARITIME',link:'GS-IN-04',accent:'#58d5c5'},
      'SAR-01': {type:'SPACECRAFT',state:'WATCH',role:'SAR / X-BAND',link:'GS-SE-01',accent:'#ff8bb2'},
      'GS-SG-02': {type:'GROUND ASSET',state:'READY',role:'SINGAPORE',link:'X-BAND',accent:'#73d7a2'},
      'GS-SE-01': {type:'GROUND ASSET',state:'HIGH UTIL',role:'SWEDEN',link:'X-BAND',accent:'#e7c86b'},
      'GS-IN-04': {type:'GROUND ASSET',state:'READY',role:'INDIA',link:'S-BAND',accent:'#6fa8ff'}
    };
    const render = id => {
      const item = lookup[id] || {type:'MISSION OBJECT',state:'SELECTED',role:'SIMULATED',link:'—',accent:'#6fa8ff'};
      hud.style.borderLeftColor = item.accent;
      hud.innerHTML = `<div class="selEyebrow">SELECTED OBJECT / OPS</div><div class="selName">${id}</div><div class="selMeta"><i class="selDot"></i><span>${item.type} · ${item.state}</span></div><div class="selGrid"><div class="selCell"><span>ROLE</span><b>${item.role}</b></div><div class="selCell"><span>LINK / BAND</span><b>${item.link}</b></div></div>`;
      const head = d.querySelector('.workspace .panel .head small');
      if (head) head.textContent = `SELECTED · ${id} · SIMULATED STATE`;
    };
    const w = d.defaultView;
    const previous = typeof w.selectObject === 'function' ? w.selectObject : null;
    w.selectObject = id => {
      if (previous && previous !== w.selectObject) {
        try { previous(id); } catch (_) {}
      }
      render(id);
    };
    render(window.__SPACEOPS_SHARED_GLOBE_STATE__?.selectedId || 'GF-7 02');
  }

  function normalizeOpsAcceptance(d) {
    if (!d || d.documentElement.dataset.spaceopsOpsAccepted === '1') return;
    d.documentElement.dataset.spaceopsOpsAccepted = '1';

    const metrics = [...d.querySelectorAll('.metrics .metric')];
    if (metrics[2]) metrics[2].innerHTML = '<b>0</b><span>Active Downlinks</span><em>no contact currently active · simulated</em>';
    if (metrics[3]) metrics[3].innerHTML = '<b>4</b><span>Contacts · Next 90m</span><em>3 managed · 1 partner · simulated</em>';

    if (!d.getElementById('spaceops-ops-kpi-hierarchy')) {
      const style = d.createElement('style');
      style.id = 'spaceops-ops-kpi-hierarchy';
      style.textContent = `
        .metrics{align-items:flex-end!important;gap:18px!important}
        .metrics .metric{opacity:.62;transition:opacity .18s ease,transform .18s ease!important}
        .metrics .metric b{font-size:13px!important;font-weight:650!important;color:#c8d0da!important}
        .metrics .metric span{font-size:6.5px!important;letter-spacing:.10em!important;color:#6f7a87!important}
        .metrics .metric:nth-child(2){opacity:1!important;transform:translateY(-2px)}
        .metrics .metric:nth-child(2) b{font-size:28px!important;line-height:.9!important;color:#fff!important;text-shadow:0 0 18px rgba(111,168,255,.14)}
        .metrics .metric:nth-child(2) span{font-size:7px!important;color:#9aa5b2!important}
        .metrics .metric:nth-child(4){opacity:.9!important}
        .metrics .metric:nth-child(4) b{font-size:19px!important;color:#dce5ef!important}
        .metrics .metric:nth-child(6){opacity:.95!important;border-left-color:rgba(231,200,107,.26)!important}
        .metrics .metric:nth-child(6) b{font-size:19px!important;color:var(--amber)!important}
        .metrics .metric:nth-child(1),.metrics .metric:nth-child(3),.metrics .metric:nth-child(5){transform:translateY(2px)}
        @media(max-width:1150px){.metrics .metric:nth-child(2) b{font-size:22px!important}.metrics .metric:nth-child(4) b,.metrics .metric:nth-child(6) b{font-size:17px!important}}
        @media(max-width:720px){.metrics .metric{opacity:.78}.metrics .metric:nth-child(2){grid-column:span 2;transform:none}.metrics .metric:nth-child(2) b{font-size:24px!important}}
      `;
      d.head.appendChild(style);
    }

    const sidePanels = [...d.querySelectorAll('.side > .panel')];
    const missionStack = sidePanels[1];
    if (missionStack && !d.getElementById('spaceops-ops-mission-stack')) {
      const style = d.createElement('style');
      style.id = 'spaceops-ops-mission-stack';
      style.textContent = `
        .side>.panel:nth-child(2){border-color:rgba(103,121,142,.16)!important;background:linear-gradient(180deg,rgba(8,13,19,.58),rgba(7,11,16,.36))!important;box-shadow:none!important;backdrop-filter:blur(10px)!important}
        .side>.panel:nth-child(2) .head{height:31px!important;padding:0 9px!important;border-bottom:1px solid rgba(87,104,123,.12)!important;background:transparent!important}
        .side>.panel:nth-child(2) .head strong{font-size:8px!important;font-weight:700!important;letter-spacing:.13em!important;color:#b7c1cc!important}
        .side>.panel:nth-child(2) .head small{font-size:6.5px!important;letter-spacing:.08em!important;color:#65717e!important}
        .side>.panel:nth-child(2) .queue{max-height:196px!important;padding:2px 0 4px!important;overflow:auto!important;scrollbar-width:thin;scrollbar-color:rgba(111,168,255,.18) transparent}
        .side>.panel:nth-child(2) .mission{position:relative;grid-template-columns:3px minmax(0,1fr) auto!important;gap:8px!important;min-height:42px!important;padding:7px 8px!important;border-bottom:1px solid rgba(78,94,112,.10)!important;background:transparent!important;transition:background .16s ease,transform .16s ease,opacity .16s ease!important}
        .side>.panel:nth-child(2) .mission:hover{background:linear-gradient(90deg,rgba(111,168,255,.07),transparent 76%)!important;transform:translateX(-2px)}
        .side>.panel:nth-child(2) .mission:first-child{background:linear-gradient(90deg,rgba(223,63,118,.075),transparent 82%)!important}
        .side>.panel:nth-child(2) .prio{width:2px!important;height:24px!important;border-radius:2px!important;align-self:center!important;box-shadow:none!important}
        .side>.panel:nth-child(2) .mission b{font-size:8px!important;font-weight:650!important;letter-spacing:.01em!important;color:#d5dbe2!important}
        .side>.panel:nth-child(2) .mission small{margin-top:2px!important;font-size:6.5px!important;line-height:1.35!important;color:#66727f!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
        .side>.panel:nth-child(2) .stateTag{align-self:center!important;font-size:6px!important;letter-spacing:.09em!important;color:#79bfa0!important;opacity:.82!important}
        .side>.panel:nth-child(2) .mission:first-child .stateTag{color:#e9c977!important;opacity:1!important}
        @media(max-width:720px){.side>.panel:nth-child(2) .queue{max-height:172px!important}.side>.panel:nth-child(2) .mission{min-height:40px!important}}
      `;
      d.head.appendChild(style);
      const headStrong = missionStack.querySelector('.head strong');
      if (headStrong) headStrong.textContent = 'MISSION STACK';
      const count = missionStack.querySelector('#queueCount');
      if (count) count.title = 'Active missions ordered by operational priority';
    }

    const copilotPanel = sidePanels[0];
    if (copilotPanel && !d.getElementById('spaceops-ops-copilot-console')) {
      const style = d.createElement('style');
      style.id = 'spaceops-ops-copilot-console';
      style.textContent = `
        .side>.panel:first-child{position:relative;overflow:hidden;border:1px solid rgba(110,131,154,.18)!important;border-left:2px solid rgba(223,63,118,.58)!important;background:linear-gradient(180deg,rgba(7,12,18,.78),rgba(5,9,14,.58))!important;box-shadow:0 18px 48px rgba(0,0,0,.18)!important;backdrop-filter:blur(14px)!important}
        .side>.panel:first-child:before{content:'OPS / MISSION RESOLUTION';position:absolute;right:9px;top:9px;z-index:2;font:5.5px ui-monospace,monospace;letter-spacing:.12em;color:rgba(111,168,255,.38);pointer-events:none}
        .side>.panel:first-child .head{height:34px!important;padding:0 9px!important;border-bottom:1px solid rgba(82,99,118,.13)!important;background:transparent!important}
        .side>.panel:first-child .head strong{font-size:8px!important;font-weight:750!important;letter-spacing:.14em!important;color:#e1e7ee!important}
        .side>.panel:first-child .head small{display:none!important}
        .side>.panel:first-child .copilot{position:relative;padding:9px!important}
        .side>.panel:first-child .copilot:before{content:'OBJECTIVE / CONSTRAINT INPUT';display:block;margin:0 0 5px;font:5.8px ui-monospace,monospace;letter-spacing:.12em;color:#667482}
        .side>.panel:first-child textarea{height:64px!important;resize:none!important;padding:8px 9px!important;border:1px solid rgba(93,113,135,.20)!important;border-left:1px solid rgba(111,168,255,.36)!important;background:rgba(3,8,13,.54)!important;color:#dbe2e9!important;font:7.5px/1.5 ui-monospace,monospace!important;box-shadow:inset 0 0 20px rgba(0,0,0,.16)!important;outline:none!important}
        .side>.panel:first-child textarea:focus{border-color:rgba(111,168,255,.42)!important;box-shadow:inset 0 0 20px rgba(0,0,0,.16),0 0 0 1px rgba(111,168,255,.06)!important}
        .side>.panel:first-child .row{margin-top:7px!important;gap:6px!important}
        .side>.panel:first-child .btn{height:27px!important;padding:0 9px!important;font-size:6.5px!important;letter-spacing:.07em!important;border-color:rgba(223,63,118,.52)!important;background:rgba(223,63,118,.72)!important}
        .side>.panel:first-child .btn.ghost{border-color:rgba(89,108,129,.22)!important;background:rgba(9,14,20,.44)!important;color:#7d8996!important}
        .side>.panel:first-child .out{position:relative;min-height:72px!important;margin-top:8px!important;padding:18px 9px 8px!important;border:1px solid rgba(78,95,114,.13)!important;border-left:1px solid rgba(88,213,197,.32)!important;background:rgba(2,7,11,.48)!important;color:#98a7b5!important;font:6.8px/1.55 ui-monospace,monospace!important;letter-spacing:.015em!important}
        .side>.panel:first-child .out:before{content:'RESOLUTION / DETERMINISTIC PROTOTYPE';position:absolute;left:9px;top:6px;font-size:5.3px;letter-spacing:.11em;color:rgba(88,213,197,.52)}
        @media(max-width:720px){.side>.panel:first-child textarea{height:58px!important}.side>.panel:first-child .out{min-height:64px!important}}
      `;
      d.head.appendChild(style);
      const headStrong = copilotPanel.querySelector('.head strong');
      if (headStrong) headStrong.textContent = 'MISSION COPILOT';
      const objective = d.getElementById('objective');
      if (objective) objective.setAttribute('aria-label','Mission objective command input');
      const run = d.getElementById('runMission');
      if (run) run.textContent = 'RESOLVE MISSION';
    }

    normalizeOpsSelectedHud(d);

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

  function normalizeTwinAcceptance(d) {
    if (!d || d.documentElement.dataset.spaceopsTwinAccepted === '1') return;
    d.documentElement.dataset.spaceopsTwinAccepted = '1';

    const metrics = [...d.querySelectorAll('.metrics .metric')];
    if (metrics[5]) {
      const label = metrics[5].querySelector('span');
      const source = metrics[5].querySelector('em');
      if (label) label.textContent = 'Scenario State Age';
      if (source) source.textContent = 'SIMULATION CLOCK';
    }

    const live = d.getElementById('liveState');
    if (live) live.textContent = 'SIM RUNNING';

    const footer = d.getElementById('footerLive');
    if (footer) footer.textContent = '● SIM RUNNING';

    const inspectorHead = d.querySelector('.inspector .head small');
    if (inspectorHead) inspectorHead.title = 'Prototype object state; no live telemetry connector is attached';

    const snapshot = d.getElementById('snapshotBtn');
    if (snapshot) {
      snapshot.textContent = '▣ EXPORT SNAPSHOT BUNDLE';
      snapshot.title = 'Exports the simulated object/layer state and the rendered globe snapshot';
    }

    const sync = d.getElementById('syncBtn');
    if (sync && sync.dataset.spaceopsTwinSyncNormalized !== '1') {
      sync.dataset.spaceopsTwinSyncNormalized = '1';
      sync.addEventListener('click', () => {
        const shared = window.__SPACEOPS_SHARED_GLOBE_STATE__;
        if (!shared) return;
        shared.epochMs = Date.now();
        shared.frozenElapsed = 0;
      });
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
        live.textContent = on ? 'SIM RUNNING' : 'SIM PAUSED';
        const footer = d.getElementById('footerLive');
        if (footer) {
          footer.textContent = on ? '● SIM RUNNING' : '● SIM PAUSED';
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
    normalizeSharedContext(d, key);
    if (key === 'ops') {
      normalizeOpsAcceptance(d);
      if (!d.getElementById('spaceops-ops-runtime')) {
        const opsScript = d.createElement('script');
        opsScript.id = 'spaceops-ops-runtime';
        opsScript.src = opsRuntimeUrl;
        d.head.appendChild(opsScript);
      }
    }
    if (key === 'twin') {
      normalizeTwinAcceptance(d);
      normalizeTwinLiveControl(d);
      if (!d.getElementById('spaceops-twin-runtime')) {
        const twinScript = d.createElement('script');
        twinScript.id = 'spaceops-twin-runtime';
        twinScript.src = twinRuntimeUrl;
        d.head.appendChild(twinScript);
      }
    }
    if (key === 'plan' && !d.getElementById('spaceops-plan-runtime')) {
      const planScript = d.createElement('script');
      planScript.id = 'spaceops-plan-runtime';
      planScript.src = planRuntimeUrl;
      d.head.appendChild(planScript);
    }

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