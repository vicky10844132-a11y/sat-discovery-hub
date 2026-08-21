(() => {
  'use strict';

  const frame = document.getElementById('frame');
  if (!frame) return;

  const EARTH_TEXTURE = 'data:image/jpeg;base64,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';

  function isTwin() {
    try { return /\/modules\/twin\.html$/i.test(frame.contentWindow.location.pathname); }
    catch (_) { return /\/modules\/twin\.html/i.test(frame.getAttribute('src') || ''); }
  }

  function addStyle(d) {
    if (d.getElementById('spaceops-globe-only-style')) return;
    const style = d.createElement('style');
    style.id = 'spaceops-globe-only-style';
    style.textContent = `
      .earth[data-spaceops-globe="1"]{
        overflow:hidden!important;
        isolation:isolate;
        cursor:grab;
        user-select:none;
        touch-action:none;
        background:#03070b!important;
        box-shadow:
          0 0 0 1px rgba(111,168,255,.28),
          0 0 22px rgba(83,145,210,.22),
          0 0 48px rgba(58,116,176,.12)!important;
      }
      .earth[data-spaceops-globe="1"]:active{cursor:grabbing}
      .earth[data-spaceops-globe="1"]::after{display:none!important}
      .spaceopsGlobeSurface,.spaceopsGlobeShade,.spaceopsGlobeAtmos{
        position:absolute;inset:0;border-radius:50%;pointer-events:none
      }
      .spaceopsGlobeSurface{
        z-index:1;
        background-image:url("${EARTH_TEXTURE}");
        background-repeat:no-repeat;
        background-size:108% 108%;
        background-position:50% 50%;
        filter:saturate(1.04) contrast(1.06) brightness(.96);
        will-change:background-position,background-size;
      }
      .spaceopsGlobeShade{
        z-index:2;
        background:
          radial-gradient(circle at 31% 24%,rgba(160,201,255,.09),transparent 21%),
          linear-gradient(112deg,transparent 0 54%,rgba(0,0,0,.08) 70%,rgba(0,0,0,.42) 100%);
        box-shadow:inset -18px -12px 34px rgba(0,0,0,.34);
      }
      .spaceopsGlobeAtmos{
        z-index:3;
        inset:1px;
        border:1px solid rgba(142,184,255,.34);
        box-shadow:
          inset 8px 5px 16px rgba(142,184,255,.08),
          inset -9px -6px 18px rgba(0,0,0,.28),
          0 0 12px rgba(111,168,255,.16);
      }
    `;
    d.head.appendChild(style);
  }

  function enhanceTwin(d) {
    if (!d || !d.head || !d.body || !isTwin()) return;
    const earth = d.querySelector('.earth');
    if (!earth || earth.dataset.spaceopsGlobe === '1') return;

    addStyle(d);
    earth.dataset.spaceopsGlobe = '1';

    const surface = d.createElement('div');
    surface.className = 'spaceopsGlobeSurface';
    const shade = d.createElement('div');
    shade.className = 'spaceopsGlobeShade';
    const atmosphere = d.createElement('div');
    atmosphere.className = 'spaceopsGlobeAtmos';
    earth.append(surface, shade, atmosphere);

    let x = 50, y = 50, zoom = 108;
    let dragging = false, sx = 0, sy = 0, ox = 50, oy = 50;
    const paint = () => {
      surface.style.backgroundPosition = `${x}% ${y}%`;
      surface.style.backgroundSize = `${zoom}% ${zoom}%`;
    };
    paint();

    earth.addEventListener('pointerdown', e => {
      dragging = true; sx = e.clientX; sy = e.clientY; ox = x; oy = y;
      earth.setPointerCapture?.(e.pointerId);
    });
    earth.addEventListener('pointermove', e => {
      if (!dragging) return;
      x = Math.max(42, Math.min(58, ox - (e.clientX - sx) * .035));
      y = Math.max(42, Math.min(58, oy - (e.clientY - sy) * .035));
      paint();
    });
    const stop = e => {
      dragging = false;
      try { earth.releasePointerCapture?.(e.pointerId); } catch (_) {}
    };
    earth.addEventListener('pointerup', stop);
    earth.addEventListener('pointercancel', stop);
    earth.addEventListener('wheel', e => {
      e.preventDefault();
      zoom = Math.max(102, Math.min(122, zoom + (e.deltaY > 0 ? -2 : 2)));
      paint();
    }, {passive:false});
    earth.addEventListener('dblclick', () => { x = 50; y = 50; zoom = 108; paint(); });
  }

  const run = () => { try { enhanceTwin(frame.contentDocument); } catch (_) {} };
  frame.addEventListener('load', () => { run(); requestAnimationFrame(run); setTimeout(run, 120); });
  run();
})();
