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

  const moduleRuntimeUrl = new URL('globe-module.js?rev=20260822m', location.href).href;

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

  function installCompatibilityStyle(d, key) {
    if (!d?.head || d.getElementById('spaceops-globe-compat-style')) return;
    d.documentElement.dataset.spaceopsGlobeModule = key;
    const style = d.createElement('style');
    style.id = 'spaceops-globe-compat-style';
    style.textContent = `
      html[data-spaceops-globe-module="plan"] .scene.spaceopsGlobeActive .windowArc{
        display:block!important;z-index:6!important;pointer-events:none!important
      }
      html[data-spaceops-globe-module="ground"] .scene.spaceopsGlobeActive .cone{
        display:none!important;z-index:6!important;pointer-events:none!important
      }
      html[data-spaceops-globe-module="ground"] .scene.spaceopsGlobeActive:has(.sceneTools [data-layer="footprint"].on) .cone{
        display:block!important
      }
      html[data-spaceops-globe-module="earth"] .scene.spaceopsGlobeActive .cloud{
        display:none!important;z-index:6!important;pointer-events:none!important
      }
      html[data-spaceops-globe-module="earth"] .scene.spaceopsGlobeActive:has(.sceneTools [data-layer="wx"].on) .cloud{
        display:block!important
      }
      html[data-spaceops-globe-module="eng"] .scene.spaceopsGlobeActive .vector,
      html[data-spaceops-globe-module="eng"] .scene.spaceopsGlobeActive .bodyFrame,
      html[data-spaceops-globe-module="eng"] .scene.spaceopsGlobeActive .cov{
        display:none!important;z-index:6!important;pointer-events:none!important
      }
      html[data-spaceops-globe-module="eng"] .scene.spaceopsGlobeActive:has(.sceneTools [data-layer="vectors"].on) .vector,
      html[data-spaceops-globe-module="eng"] .scene.spaceopsGlobeActive:has(.sceneTools [data-layer="body"].on) .bodyFrame,
      html[data-spaceops-globe-module="eng"] .scene.spaceopsGlobeActive:has(.sceneTools [data-layer="cov"].on) .cov{
        display:block!important
      }
    `;
    d.head.appendChild(style);
  }

  function normalizeModuleControls(d, key) {
    installCompatibilityStyle(d, key);

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

    // The workspace prototype previously owns this onclick handler. The Globe module
    // is now the single source of truth for LIVE/PAUSED state, so remove the old
    // toggle to prevent one click from toggling twice.
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