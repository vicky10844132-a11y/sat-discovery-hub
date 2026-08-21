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

  const moduleRuntimeUrl = new URL('globe-module.js?rev=20260822n', location.href).href;

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

  function normalizeOpsPrototype(d) {
    if (!d?.body || d.getElementById('spaceops-ops-canonical-normalizer')) return;

    const legacySats = [...d.querySelectorAll('.mapwrap .sat')];
    ['GF-7 02','SAR-01','SY-01','SUPERVIEW NEO-1'].forEach((id, i) => {
      if (legacySats[i]) legacySats[i].dataset.id = id;
    });
    const legacyGround = [...d.querySelectorAll('.mapwrap .gs')];
    ['GS-SG-02','GS-SE-01'].forEach((id, i) => {
      if (legacyGround[i]) legacyGround[i].dataset.id = id;
    });

    const metrics = [...d.querySelectorAll('.metrics .metric')];
    const metricValues = [
      ['4','Managed Spacecraft'],
      ['4','Active Missions'],
      ['2','Live Downlinks'],
      ['4','Contacts · Next 90m'],
      ['3 / 3','Ground Assets Ready'],
      ['02','Open Exceptions']
    ];
    metrics.forEach((el, i) => {
      if (!metricValues[i]) return;
      const [value, label] = metricValues[i];
      if (i === 1) el.innerHTML = `<b id="activeMissionMetric">${value}</b><span>${label}</span>`;
      else el.innerHTML = `<b>${value}</b><span>${label}</span>`;
    });

    const alert = d.getElementById('alertbar');
    if (alert) {
      const body = alert.querySelector('div');
      if (body) body.innerHTML = '<strong>2 OPERATIONAL EXCEPTIONS</strong> · GS-SE-01 utilization above 70% · SAR-01 storage margin below nominal planning threshold';
    }

    const patch = d.createElement('script');
    patch.id = 'spaceops-ops-canonical-normalizer';
    patch.textContent = `(() => {
      try {
        missions.splice(0, missions.length,
          {p:'p1',name:'Red Sea Maritime Watch',meta:'SAR-01 · SAR · 00:47 to contact',state:'SCHEDULED'},
          {p:'p2',name:'Singapore Port Watch',meta:'GF-7 02 · OPTICAL · cloud 12%',state:'PLANNED'},
          {p:'p3',name:'Nordic Ice Route',meta:'SUPERVIEW NEO-1 · OPTICAL · processing',state:'PROCESSING'},
          {p:'p3',name:'Dubai Maritime Change',meta:'SY-01 · MARITIME · delivery 81%',state:'DELIVERING'}
        );
        renderQueue();
        if (queueCount) queueCount.textContent = missions.length + ' ACTIVE';
      } catch (_) {}
      try {
        contacts.splice(0, contacts.length,
          ['02:44','GF-7 02','GS-SG-02','62°','X'],
          ['02:57','SAR-01','GS-SE-01','48°','X'],
          ['03:11','SY-01','GS-IN-04','71°','S'],
          ['03:29','SUPERVIEW NEO-1','GS-SE-01','53°','X']
        );
        contactsEl.innerHTML = contacts.map(r => '<tr>' + r.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('');
      } catch (_) {}
      try {
        events.splice(0, events.length,
          ['02:29','Mission Singapore Port Watch ranked 1st on GF-7 02'],
          ['02:27','GS-SG-02 contact window reserved'],
          ['02:24','SAR-01 storage margin entered watch threshold','warn'],
          ['02:20','Processing job EO-8821 passed QC']
        );
        feed.innerHTML = events.map(e => '<div class="event ' + (e[2] || '') + '"><time>' + e[0] + '</time><i></i><span>' + e[1] + '</span></div>').join('');
      } catch (_) {}
      try {
        runMission.onclick = () => {
          const text = objective.value.trim();
          if (!text) { toast('Add a mission objective first'); return; }
          copilotOut.textContent = 'RESOLVING · objective / AOI / candidate resources / weather / ground contact…';
          setTimeout(() => {
            copilotOut.textContent = 'SIMULATED PLAN\\nGF-7 02 · Optical 0.5 m\\nCloud forecast · 12%\\nContact · GS-SG-02 · 02:44\\nAcquisition · 03:06\\nProcessing/QC · 00:38\\nEstimated delivery · 04:02\\nStatus · EXECUTABLE';
          }, 720);
          toast('Mission plan generated');
        };
      } catch (_) {}
    })();`;
    d.body.appendChild(patch);
  }

  function normalizeTwinPrototype(d) {
    if (!d?.body || d.getElementById('spaceops-twin-canonical-normalizer')) return;

    const metrics = [...d.querySelectorAll('.metrics .metric')];
    const metricValues = [
      ['4','Managed Spacecraft','3 nominal · 1 watch'],
      ['3','Ground Assets','3 available'],
      ['1','Active AOI','SG PORT'],
      ['8','Canonical Objects','4 SAT · 3 GS · 1 AOI'],
      ['1','Watch Condition','SAR-01'],
      ['< 1 s','State Age','SIMULATED LIVE']
    ];
    metrics.forEach((el, i) => {
      if (!metricValues[i]) return;
      const [value, label, note] = metricValues[i];
      el.innerHTML = `<b>${value}</b><span>${label}</span><em>${note}</em>`;
    });

    const groupTitles = [...d.querySelectorAll('.groupTitle')];
    if (groupTitles[0]) groupTitles[0].textContent = 'Managed Spacecraft · 4';
    if (groupTitles[1]) groupTitles[1].textContent = 'Ground Assets · 3';

    const footerSpans = [...d.querySelectorAll('.footerLeft > span')];
    if (footerSpans[0]) footerSpans[0].innerHTML = 'STATE &nbsp; <b class="live">● LIVE</b>';
    if (footerSpans[1]) footerSpans[1].innerHTML = 'STATE AGE &nbsp; <b class="live">&lt; 1 s</b>';
    if (footerSpans[2]) footerSpans[2].textContent = 'SOURCE   PROTOTYPE / SIMULATED STATE';

    const sectionTitle = d.querySelector('.inspector .sectionTitle span:last-child');
    if (sectionTitle && sectionTitle.textContent.trim() === 'DEMO') sectionTitle.textContent = 'SIMULATED';

    const help = d.getElementById('helpDrawer');
    if (help) {
      const first = help.querySelector('p');
      if (first) first.textContent = 'The Twin workspace is the canonical object-state view used to inspect the same spacecraft, ground assets and AOIs referenced across the Space Ops prototype.';
    }

    const patch = d.createElement('script');
    patch.id = 'spaceops-twin-canonical-normalizer';
    patch.textContent = `(() => {
      try {
        Object.assign(records['GF-7 02'], {sub:'EO / Stereo Mapping · LEO · CANONICAL GF-7 02'});
        Object.assign(records['SUPERVIEW NEO-1'], {sub:'EO / Agile Optical · LEO · CANONICAL SUPERVIEW NEO-1'});
        Object.assign(records['SY-01'], {sub:'Maritime Imaging · LEO · CANONICAL SY-01'});
        Object.assign(records['SAR-01'], {sub:'SAR / Imaging · LEO · CANONICAL SAR-01'});
      } catch (_) {}

      const payloadMap = {
        'GF-7 02': [['STEREO CAM · 0.65 m','READY'],['STEREO PAIR','READY'],['MAPPING MODE','STANDBY']],
        'SUPERVIEW NEO-1': [['OPTICAL PAYLOAD','READY'],['AGILE TASKING','READY'],['HIGH-RES MODE','STANDBY']],
        'SY-01': [['MARITIME IMAGER','READY'],['AIS RECEIVER','READY'],['COASTAL MODE','STANDBY']],
        'SAR-01': [['SAR · X-BAND','READY'],['STRIPMAP','READY'],['SPOTLIGHT','STANDBY']],
        'GS-SE-01': [['13.5 m ANTENNA','AVAILABLE'],['7.3 m ANTENNA','AVAILABLE'],['S/X CHAIN','READY']],
        'GS-SG-02': [['X-BAND CHAIN','AVAILABLE'],['KA-BAND CHAIN','AVAILABLE'],['PARTNER LINK','READY']],
        'GS-IN-04': [['X-BAND CHAIN','AVAILABLE'],['PARTNER LINK','READY'],['SCHEDULER','READY']]
      };

      const renderPayloads = name => {
        try {
          const root = document.querySelector('.payloads');
          const rows = payloadMap[name];
          if (!root || !rows) return;
          root.innerHTML = rows.map(r => '<div class="payload"><span>' + r[0] + '</span><em>' + r[1] + '</em></div>').join('');
        } catch (_) {}
      };

      const baseSelect = window.selectObject;
      window.selectObject = name => {
        try { baseSelect(name); } catch (_) {}
        renderPayloads(name);
      };
      document.querySelectorAll('.asset').forEach(a => a.onclick = () => window.selectObject(a.dataset.name));
      document.querySelectorAll('.sat').forEach(s => s.onclick = () => window.selectObject(s.dataset.select));
      renderPayloads('GF-7 02');

      try {
        const sync = document.getElementById('syncBtn');
        if (sync) sync.onclick = () => toast('Canonical object state synchronized · 8 objects · state age < 1 s');
        const payloadToggle = document.getElementById('payloadToggle');
        if (payloadToggle) payloadToggle.onclick = () => toast('Current object resources shown in inspector');
        const profile = document.getElementById('profileLink');
        if (profile) profile.onclick = () => toast('Prototype object profile uses the same canonical object ID across modules');
      } catch (_) {}
    })();`;
    d.body.appendChild(patch);
  }

  function normalizeModuleControls(d, key) {
    d.documentElement.dataset.spaceopsGlobeModule = key;

    if (key === 'ops') normalizeOpsPrototype(d);
    if (key === 'twin') normalizeTwinPrototype(d);

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
        const footer = d.querySelector('.footerLeft .live');
        if (footer) footer.textContent = on ? '● LIVE' : '● PAUSED';
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
    normalizeTwinLiveControl(d);
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