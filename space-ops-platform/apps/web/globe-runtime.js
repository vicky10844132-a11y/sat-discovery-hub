(() => {
  'use strict';

  const frame = document.getElementById('frame');
  if (!frame) return;

  window.__SPACEOPS_SHARED_GLOBE_STATE__ ||= {
    epochMs: Date.now(),
    pov: { lat: 18, lng: 103, altitude: 2.08 },
    selectedId: 'GF-7 02',
    moduleKey: 'ops'
  };

  const moduleRuntimeUrl = new URL('globe-module.js?rev=20260822j', location.href).href;

  function inject() {
    let d;
    try { d = frame.contentDocument; } catch (_) { return; }
    if (!d?.head || !d?.body) return;
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
  });

  inject();
})();
