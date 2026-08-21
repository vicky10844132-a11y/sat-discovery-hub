(() => {
  'use strict';

  const frame = document.getElementById('frame');
  if (!frame) return;

  const THREE_URL = 'https://esm.sh/three@0.180.0';
  const NIGHT_TEXTURE_URL = 'https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002916/earthatnight-2048.png';
  let activeScene = null;
  let loadToken = 0;

  function stopActive() {
    if (!activeScene) return;
    try { cancelAnimationFrame(activeScene.raf); } catch (_) {}
    try { activeScene.resizeObserver?.disconnect(); } catch (_) {}
    try { activeScene.renderer?.dispose(); } catch (_) {}
    try { activeScene.canvas?.remove(); } catch (_) {}
    activeScene = null;
  }

  function isTwinDocument(d) {
    return !!(d && d.querySelector('.scene') && d.getElementById('liveState') && d.querySelector('.inspector'));
  }

  function labelSprite(THREE, text, color = '#eef3f7') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '700 36px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(4,7,11,.72)';
    ctx.fillRect(12, 15, Math.min(480, ctx.measureText(text).width + 38), 66);
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.strokeRect(12.5, 15.5, Math.min(480, ctx.measureText(text).width + 38), 65);
    ctx.fillStyle = color;
    ctx.fillText(text, 30, 50);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.02, 0.19, 1);
    sprite.center.set(0, 0.5);
    return sprite;
  }

  function latLonToVec3(THREE, lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function buildOrbit(THREE, radius, inclinationDeg, nodeDeg, color) {
    const points = [];
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.62 });
    const line = new THREE.LineLoop(geometry, material);
    line.rotation.x = THREE.MathUtils.degToRad(inclinationDeg);
    line.rotation.z = THREE.MathUtils.degToRad(nodeDeg);
    return line;
  }

  function makeAtmosphere(THREE, radius) {
    const geometry = new THREE.SphereGeometry(radius * 1.035, 64, 64);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position,1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main(){
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 2.35);
          vec3 c = vec3(0.20, 0.50, 0.88);
          gl_FragColor = vec4(c, fresnel * 0.48);
        }
      `
    });
    return new THREE.Mesh(geometry, material);
  }

  async function enhanceTwin(d, token) {
    if (!isTwinDocument(d)) return;
    const sceneEl = d.querySelector('.scene');
    if (!sceneEl || sceneEl.dataset.spaceopsWebgl === '1') return;

    let THREE;
    try {
      THREE = await import(THREE_URL);
    } catch (error) {
      console.warn('Space Ops 3D globe unavailable, keeping fallback globe.', error);
      return;
    }
    if (token !== loadToken || !isTwinDocument(d)) return;

    stopActive();
    sceneEl.dataset.spaceopsWebgl = '1';

    const oldParts = [...sceneEl.querySelectorAll('.earth,.orbitLayer,.assetLayer,.groundLayer,.aoiLayer')];
    oldParts.forEach(el => {
      el.dataset.spaceopsGlobeFallbackDisplay = el.style.display || '';
      el.style.display = 'none';
    });

    const canvas = d.createElement('canvas');
    canvas.className = 'spaceopsWebglGlobe';
    canvas.setAttribute('aria-label', 'Interactive 3D Earth and satellite scene');
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: '2',
      display: 'block', cursor: 'grab', touchAction: 'none', outline: 'none'
    });
    const grid = sceneEl.querySelector('.grid');
    if (grid) grid.after(canvas); else sceneEl.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0.10, 0.12, 5.45);

    const viewGroup = new THREE.Group();
    viewGroup.rotation.x = -0.10;
    viewGroup.rotation.y = -0.20;
    scene.add(viewGroup);

    const earthSpinGroup = new THREE.Group();
    const orbitGroup = new THREE.Group();
    const satelliteGroup = new THREE.Group();
    viewGroup.add(earthSpinGroup, orbitGroup, satelliteGroup);

    const R = 1.43;
    const earthGeometry = new THREE.SphereGeometry(R, 96, 96);
    const earthMaterial = new THREE.MeshStandardMaterial({ color: 0x0b1625, roughness: 0.93, metalness: 0.0 });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthSpinGroup.add(earthMesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    textureLoader.load(
      NIGHT_TEXTURE_URL,
      tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        earthMaterial.map = tex;
        earthMaterial.emissive = new THREE.Color(0xd7c8a8);
        earthMaterial.emissiveMap = tex;
        earthMaterial.emissiveIntensity = 0.42;
        earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        earthMaterial.color.set(0x12233a);
        earthMaterial.emissive.set(0x08111d);
        earthMaterial.emissiveIntensity = 0.35;
      }
    );

    const atmosphere = makeAtmosphere(THREE, R);
    earthSpinGroup.add(atmosphere);

    scene.add(new THREE.AmbientLight(0x5878a8, 0.44));
    const key = new THREE.DirectionalLight(0x9ec9ff, 1.35);
    key.position.set(-4, 3.2, 4.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x3f78c7, 0.55);
    rim.position.set(4, -1.5, -4);
    scene.add(rim);

    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 520; i++) {
      const r = 8 + Math.random() * 12;
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      starPos.push(r * Math.sin(v) * Math.cos(u), r * Math.cos(v), r * Math.sin(v) * Math.sin(u));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x7ea8cc, size: 0.025, transparent: true, opacity: 0.42, depthWrite: false }));
    scene.add(stars);

    const orbitDefs = [
      { radius: 2.13, inclination: 16, node: -18, color: 0xdf3f76 },
      { radius: 2.40, inclination: 66, node: 21, color: 0x6fa8ff },
      { radius: 2.64, inclination: 91, node: -8, color: 0x58d5c5 }
    ];
    orbitDefs.forEach(o => orbitGroup.add(buildOrbit(THREE, o.radius, o.inclination, o.node, o.color)));

    const satDefs = [
      { id: 'GF-7 02', orbit: 0, phase: 0.47, speed: 0.095, color: 0xff5f93 },
      { id: 'SUPERVIEW NEO-1', orbit: 1, phase: 2.25, speed: 0.071, color: 0x6fa8ff },
      { id: 'SY-01', orbit: 2, phase: 4.30, speed: 0.053, color: 0x58d5c5 },
      { id: 'SAR-01', orbit: 0, phase: 3.52, speed: 0.087, color: 0xff5f93 }
    ];

    const satEntries = satDefs.map(def => {
      const group = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.055, 0),
        new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 1.45, roughness: 0.5 })
      );
      core.userData.spaceopsSatelliteId = def.id;
      group.add(core);
      const label = labelSprite(THREE, def.id);
      label.position.set(0.075, 0.055, 0);
      group.add(label);
      satelliteGroup.add(group);
      return { ...def, group, core, label, angle: def.phase };
    });

    const groundGroup = new THREE.Group();
    earthSpinGroup.add(groundGroup);
    const groundDefs = [
      { id: 'GS-SE-01', lat: 67.86, lon: 20.23, color: 0xe7c86b },
      { id: 'GS-SG-02', lat: 1.30, lon: 103.82, color: 0xe7c86b },
      { id: 'GS-IN-04', lat: 20.59, lon: 78.96, color: 0xe7c86b }
    ];
    const groundMeshes = [];
    groundDefs.forEach(def => {
      const pos = latLonToVec3(THREE, def.lat, def.lon, R * 1.012);
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 16, 16),
        new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 1.6 })
      );
      marker.position.copy(pos);
      marker.userData.spaceopsGroundId = def.id;
      groundGroup.add(marker);
      const label = labelSprite(THREE, def.id, '#ead77f');
      label.position.copy(pos.clone().multiplyScalar(1.055));
      label.scale.set(0.78, 0.145, 1);
      groundGroup.add(label);
      groundMeshes.push(marker);
    });

    const aoiGroup = new THREE.Group();
    earthSpinGroup.add(aoiGroup);
    const aoiPoints = [[1.20,103.60],[1.20,104.05],[1.48,104.05],[1.48,103.60],[1.20,103.60]]
      .map(([lat, lon]) => latLonToVec3(THREE, lat, lon, R * 1.018));
    aoiGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(aoiPoints),
      new THREE.LineBasicMaterial({ color: 0xff4f8a, transparent: true, opacity: 0.95 })
    ));

    const linkGroup = new THREE.Group();
    scene.add(linkGroup);

    function orbitPosition(def, angle) {
      const o = orbitDefs[def.orbit];
      const v = new THREE.Vector3(Math.cos(angle) * o.radius, 0, Math.sin(angle) * o.radius);
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(o.inclination));
      v.applyAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(o.node));
      return v;
    }

    let selectedId = 'GF-7 02';
    function refreshLink() {
      linkGroup.clear();
      const sat = satEntries.find(s => s.id === selectedId) || satEntries[0];
      if (!sat || !groundMeshes[0]) return;
      const start = new THREE.Vector3();
      const target = new THREE.Vector3();
      sat.core.getWorldPosition(start);
      groundMeshes[0].getWorldPosition(target);
      linkGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([start, target]),
        new THREE.LineBasicMaterial({ color: 0xff4f8a, transparent: true, opacity: 0.62 })
      ));
    }

    function selectObject(id) {
      selectedId = id;
      satEntries.forEach(s => s.core.scale.setScalar(s.id === id ? 1.65 : 1));
      groundMeshes.forEach(g => g.scale.setScalar(g.userData.spaceopsGroundId === id ? 1.65 : 1));
      try { if (typeof frame.contentWindow.selectObject === 'function') frame.contentWindow.selectObject(id); } catch (_) {}
      refreshLink();
    }
    selectObject(selectedId);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let moved = false;
    let downX = 0, downY = 0, lastX = 0, lastY = 0;
    let targetRotX = viewGroup.rotation.x;
    let targetRotY = viewGroup.rotation.y;
    let velX = 0, velY = 0;
    let targetZoom = camera.position.z;

    canvas.addEventListener('pointerdown', e => {
      dragging = true; moved = false;
      downX = lastX = e.clientX; downY = lastY = e.clientY;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture?.(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4) moved = true;
      velY = dx * 0.0048; velX = dy * 0.0048;
      targetRotY += velY; targetRotX += velX;
      targetRotX = Math.max(-0.85, Math.min(0.85, targetRotX));
      lastX = e.clientX; lastY = e.clientY;
    });
    const release = e => {
      if (!dragging) return;
      dragging = false; canvas.style.cursor = 'grab';
      try { canvas.releasePointerCapture?.(e.pointerId); } catch (_) {}
      if (!moved) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const picks = raycaster.intersectObjects([...satEntries.map(s => s.core), ...groundMeshes], false);
        const obj = picks[0]?.object;
        if (obj?.userData.spaceopsSatelliteId) selectObject(obj.userData.spaceopsSatelliteId);
        if (obj?.userData.spaceopsGroundId) selectObject(obj.userData.spaceopsGroundId);
      }
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      targetZoom = Math.max(4.05, Math.min(6.35, targetZoom + e.deltaY * 0.0022));
    }, { passive: false });
    canvas.addEventListener('dblclick', () => {
      targetRotX = -0.10; targetRotY = -0.20; targetZoom = 5.45;
    });

    d.getElementById('zoomIn')?.addEventListener('click', () => { targetZoom = Math.max(4.05, targetZoom - 0.32); });
    d.getElementById('zoomOut')?.addEventListener('click', () => { targetZoom = Math.min(6.35, targetZoom + 0.32); });
    [d.getElementById('resetView'), d.getElementById('resetEarth')].filter(Boolean).forEach(b => b.addEventListener('click', () => {
      targetRotX = -0.10; targetRotY = -0.20; targetZoom = 5.45;
    }));

    const layerButtons = [...d.querySelectorAll('[data-layer]')];
    function applyLayers() {
      const button = name => layerButtons.find(b => b.dataset.layer === name);
      orbitGroup.visible = button('orbits')?.classList.contains('on') !== false;
      satelliteGroup.visible = button('assets')?.classList.contains('on') !== false;
      groundGroup.visible = button('ground')?.classList.contains('on') !== false;
      aoiGroup.visible = button('aoi')?.classList.contains('on') !== false;
    }
    layerButtons.forEach(b => b.addEventListener('click', () => requestAnimationFrame(applyLayers)));
    applyLayers();

    const linkButton = d.getElementById('linkMode');
    linkGroup.visible = !!linkButton?.classList.contains('on');
    linkButton?.addEventListener('click', () => requestAnimationFrame(() => {
      linkGroup.visible = linkButton.classList.contains('on');
      if (linkGroup.visible) refreshLink();
    }));

    const anomalyButton = d.getElementById('anomalyMode');
    anomalyButton?.addEventListener('click', () => requestAnimationFrame(() => {
      const sar = satEntries.find(s => s.id === 'SAR-01');
      if (sar) sar.core.material.color.set(anomalyButton.classList.contains('on') ? 0xffb24a : 0xff5f93);
    }));

    let lastTime = performance.now();
    function resize() {
      const w = Math.max(1, sceneEl.clientWidth), h = Math.max(1, sceneEl.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(sceneEl);
    resize();

    function animate(now) {
      if (token !== loadToken || !canvas.isConnected || !activeScene) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const live = d.getElementById('liveState')?.classList.contains('on') !== false;
      if (live) {
        earthSpinGroup.rotation.y += dt * 0.035;
        satEntries.forEach(s => {
          s.angle += dt * s.speed;
          s.group.position.copy(orbitPosition(s, s.angle));
          s.label.quaternion.copy(camera.quaternion);
        });
      } else {
        satEntries.forEach(s => s.label.quaternion.copy(camera.quaternion));
      }
      groundGroup.children.filter(x => x.isSprite).forEach(s => s.quaternion.copy(camera.quaternion));

      if (!dragging) {
        targetRotY += velY; targetRotX += velX;
        targetRotX = Math.max(-0.85, Math.min(0.85, targetRotX));
        velX *= 0.92; velY *= 0.92;
      }
      viewGroup.rotation.x += (targetRotX - viewGroup.rotation.x) * 0.10;
      viewGroup.rotation.y += (targetRotY - viewGroup.rotation.y) * 0.10;
      camera.position.z += (targetZoom - camera.position.z) * 0.10;
      camera.lookAt(0, 0, 0);

      if (linkGroup.visible) refreshLink();
      renderer.render(scene, camera);
      activeScene.raf = requestAnimationFrame(animate);
    }

    activeScene = { renderer, canvas, resizeObserver, raf: 0 };
    activeScene.raf = requestAnimationFrame(animate);
  }

  function run() {
    const token = ++loadToken;
    stopActive();
    try {
      const d = frame.contentDocument;
      if (!isTwinDocument(d)) return;
      enhanceTwin(d, token);
    } catch (_) {}
  }

  frame.addEventListener('load', () => {
    run();
    setTimeout(() => {
      try {
        const d = frame.contentDocument;
        if (isTwinDocument(d) && d.querySelector('.scene')?.dataset.spaceopsWebgl !== '1') enhanceTwin(d, loadToken);
      } catch (_) {}
    }, 180);
  });

  run();
})();
