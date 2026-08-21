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

  const moduleRuntimeUrl = new URL('globe-module.js?rev=20260822k', location.href).href;

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