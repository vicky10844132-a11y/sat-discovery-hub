(() => {
  'use strict';

  const frame = document.getElementById('frame');
  if (!frame) return;

  const WORLD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500">
    <g fill="#7d8994" stroke="#aeb8c1" stroke-opacity=".28" stroke-width="2">
      <path d="M55 106l34-35 58-19 55 8 35 29 42 10 18 26-19 32-31 15-14 32-27 8-18 37-34 5-22-28-22-5-12-35-30-22-14-31z"/>
      <path d="M226 255l36-19 35 14 26 39-6 47-22 30-5 43-26 42-20-11-10-43-17-35 10-42-16-32z"/>
      <path d="M434 99l31-18 38 3 19 16 31-5 24 14-15 23-31 5-22 19-43-6-23-20z"/>
      <path d="M482 156l38-13 45 18 28 36-9 43-24 24-5 56-27 43-25-8-13-38-22-19-2-54-16-31 18-32z"/>
      <path d="M541 105l50-27 78-8 61 21 49-2 47 24 52 4 48 28-11 32-40 9-31 30-52-6-24 30-44 8-34-24-32 18-40-22-12-31-35-21 3-29z"/>
      <path d="M762 299l37-20 54 6 36 34-9 36-42 22-46-10-28-25z"/>
      <path d="M365 61l18-28 32-3 20 20-12 35-30 13-24-13z"/>
      <path d="M897 218l18-12 17 9-5 19-20 5zM918 252l10-7 10 6-4 13-12 2zM853 387l19-11 14 12-10 18-19-2z"/>
    </g>
    <g fill="#c6d0d8" opacity=".28">
      <circle cx="606" cy="146" r="3"/><circle cx="640" cy="133" r="2.5"/><circle cx="683" cy="144" r="2"/><circle cx="728" cy="160" r="2.5"/><circle cx="763" cy="132" r="2"/><circle cx="802" cy="171" r="2.5"/>
      <circle cx="522" cy="218" r="2"/><circle cx="545" cy="252" r="2.5"/><circle cx="574" cy="287" r="2"/><circle cx="250" cy="143" r="2.5"/><circle cx="205" cy="118" r="2"/><circle cx="286" cy="303" r="2"/>
    </g>
  </svg>`;
  const WORLD_TEXTURE = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(WORLD_SVG)}")`;

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
        background:
          radial-gradient(circle at 34% 27%,rgba(133,156,174,.34),transparent 18%),
          radial-gradient(circle at 43% 42%,#33424f 0 24%,#1b2833 52%,#0c1218 76%,#05080c 100%)!important;
        box-shadow:
          inset -34px -22px 54px rgba(0,0,0,.78),
          inset 13px 9px 25px rgba(217,231,240,.08),
          0 0 0 1px rgba(150,177,195,.22),
          0 0 28px rgba(89,132,160,.16)!important;
      }
      .earth[data-spaceops-globe="1"]:active{cursor:grabbing}
      .earth[data-spaceops-globe="1"]::after{display:none!important}
      .spaceopsGlobeSurface,.spaceopsGlobeLight,.spaceopsGlobeAtmos{
        position:absolute;inset:0;border-radius:50%;pointer-events:none
      }
      .spaceopsGlobeSurface{
        z-index:1;
        background-repeat:repeat-x;
        background-size:205% 100%;
        background-position:50% 50%;
        opacity:.88;
        filter:saturate(.72) contrast(1.08) brightness(.88);
        will-change:background-position;
        -webkit-mask-image:radial-gradient(circle at center,#000 0 72%,rgba(0,0,0,.96) 82%,transparent 100%);
        mask-image:radial-gradient(circle at center,#000 0 72%,rgba(0,0,0,.96) 82%,transparent 100%);
      }
      .spaceopsGlobeLight{
        z-index:2;
        background:
          radial-gradient(circle at 28% 21%,rgba(255,255,255,.22),transparent 18%),
          linear-gradient(105deg,rgba(255,255,255,.02) 0 40%,rgba(0,0,0,.05) 53%,rgba(0,0,0,.46) 76%,rgba(0,0,0,.82) 100%);
        box-shadow:inset -18px -10px 30px rgba(0,0,0,.42);
      }
      .spaceopsGlobeAtmos{
        z-index:3;
        inset:1px;
        border:1px solid rgba(159,202,226,.18);
        box-shadow:inset 8px 3px 16px rgba(196,225,240,.07),inset -10px -5px 18px rgba(0,0,0,.35);
      }
    `;
    d.head.appendChild(style);
  }

  function enhanceDocument(d) {
    if (!d || !d.head || !d.body) return;
    const globes = [...d.querySelectorAll('.earth')];
    if (!globes.length) return;
    addStyle(d);

    globes.forEach((earth) => {
      if (earth.dataset.spaceopsGlobe === '1') return;
      earth.dataset.spaceopsGlobe = '1';

      const surface = d.createElement('div');
      surface.className = 'spaceopsGlobeSurface';
      surface.style.backgroundImage = WORLD_TEXTURE;
      const light = d.createElement('div');
      light.className = 'spaceopsGlobeLight';
      const atmosphere = d.createElement('div');
      atmosphere.className = 'spaceopsGlobeAtmos';
      earth.append(surface, light, atmosphere);

      let lon = 50;
      let lat = 50;
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLon = 50;
      let startLat = 50;

      const paint = () => {
        surface.style.backgroundPosition = `${lon}% ${lat}%`;
      };
      paint();

      earth.addEventListener('pointerdown', (event) => {
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        startLon = lon;
        startLat = lat;
        earth.setPointerCapture?.(event.pointerId);
      });

      earth.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        lon = (startLon - (event.clientX - startX) * 0.22) % 100;
        if (lon < 0) lon += 100;
        lat = Math.max(42, Math.min(58, startLat + (event.clientY - startY) * 0.06));
        paint();
      });

      const stopDrag = (event) => {
        dragging = false;
        try { earth.releasePointerCapture?.(event.pointerId); } catch (_) {}
      };
      earth.addEventListener('pointerup', stopDrag);
      earth.addEventListener('pointercancel', stopDrag);
      earth.addEventListener('dblclick', () => {
        lon = 50;
        lat = 50;
        paint();
      });
    });
  }

  const run = () => {
    try { enhanceDocument(frame.contentDocument); } catch (_) {}
  };

  frame.addEventListener('load', () => {
    run();
    requestAnimationFrame(run);
    setTimeout(run, 120);
  });
  run();
})();
