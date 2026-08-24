(() => {
  'use strict';
  if (document.documentElement.dataset.spaceopsOpsRuntime === '1') return;
  document.documentElement.dataset.spaceopsOpsRuntime = '1';

  const $ = id => document.getElementById(id);
  const scene = document.querySelector('.mapwrap');
  if (!scene) return;

  const shared = window.parent?.__SPACEOPS_SHARED_GLOBE_STATE__ || {};

  function ensureStyle() {
    if ($('spaceops-ops-runtime-style')) return;
    const style = document.createElement('style');
    style.id = 'spaceops-ops-runtime-style';
    style.textContent = `
      #spaceopsMissionTimeline{position:absolute;z-index:36;left:274px;right:356px;bottom:14px;height:54px;padding:7px 10px 6px;border-top:1px solid rgba(91,110,131,.16);background:linear-gradient(180deg,rgba(4,9,14,.08),rgba(4,9,14,.56));backdrop-filter:blur(8px);pointer-events:none}
      #spaceopsMissionTimeline .tlTop{display:flex;justify-content:space-between;align-items:center;font:5.5px ui-monospace,monospace;letter-spacing:.12em;color:#607080}
      #spaceopsMissionTimeline .tlTop b{font-weight:650;color:#8e9baa}
      #spaceopsMissionTimeline .tlTrack{position:relative;height:24px;margin-top:7px;border-top:1px solid rgba(104,124,147,.16)}
      #spaceopsMissionTimeline .tlTrack:after{content:'';position:absolute;left:0;right:0;top:11px;border-top:1px solid rgba(104,124,147,.10)}
      #spaceopsMissionTimeline .tlNow{position:absolute;top:-3px;bottom:0;width:1px;background:rgba(255,109,159,.70);box-shadow:0 0 8px rgba(255,109,159,.18)}
      #spaceopsMissionTimeline .tlNow:before{content:'NOW';position:absolute;top:-11px;left:-8px;font:5px ui-monospace,monospace;color:#ff8db4}
      #spaceopsMissionTimeline .tlEvent{position:absolute;top:5px;transform:translateX(-50%);white-space:nowrap}
      #spaceopsMissionTimeline .tlEvent i{display:block;width:5px;height:5px;margin:auto;border-radius:50%;background:#6fa8ff;box-shadow:0 0 7px rgba(111,168,255,.22)}
      #spaceopsMissionTimeline .tlEvent span{display:block;margin-top:4px;font:5px ui-monospace,monospace;color:#718090;letter-spacing:.03em}
      #spaceopsMissionTimeline .tlEvent.contact i{background:#73d7a2}
      #spaceopsMissionTimeline .tlEvent.acquire i{background:#ff6d9f}
      #spaceopsMissionTimeline .tlEvent.deliver i{background:#58d5c5}
      .alertbar.spaceopsAlertHud{border:0!important;border-left:2px solid rgba(231,200,107,.62)!important;background:linear-gradient(90deg,rgba(31,26,13,.62),rgba(12,15,19,.30))!important;backdrop-filter:blur(10px)!important;box-shadow:none!important;padding:7px 10px!important;color:#a79b79!important}
      .alertbar.spaceopsAlertHud strong{font-size:7px!important;letter-spacing:.10em!important;color:#e3c870!important}
      .alertbar.spaceopsAlertHud button{width:24px;height:24px;border:1px solid rgba(231,200,107,.14)!important;color:#84775a!important}
      .alertbar.spaceopsAlertHud:before{content:'EXCEPTION';margin-right:8px;font:5.2px ui-monospace,monospace;letter-spacing:.13em;color:#7b6c4d}
      @media(max-width:1150px){#spaceopsMissionTimeline{left:244px;right:18px;bottom:14px}}
      @media(max-width:720px){#spaceopsMissionTimeline{left:12px;right:12px;bottom:12px;height:48px;padding:6px 8px}.alertbar.spaceopsAlertHud:before{display:none}}
    `;
    document.head.appendChild(style);
  }

  function buildTimeline() {
    if ($('spaceopsMissionTimeline')) return;
    const wrap = document.createElement('div');
    wrap.id = 'spaceopsMissionTimeline';
    wrap.setAttribute('aria-label','Mission timeline next 90 minutes');
    wrap.innerHTML = '<div class="tlTop"><b>MISSION TIMELINE / NEXT 90 MIN</b><span>SIMULATED · UTC</span></div><div class="tlTrack" id="spaceopsTlTrack"></div>';
    scene.appendChild(wrap);
    renderTimeline();
  }

  function renderTimeline() {
    const track = $('spaceopsTlTrack');
    if (!track) return;
    const now = new Date();
    const fmt = mins => {
      const d = new Date(now.getTime() + mins * 60000);
      return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}Z`;
    };
    const events = [
      {m:12,label:`CONTACT ${fmt(12)}`,kind:'contact'},
      {m:34,label:`ACQUIRE ${fmt(34)}`,kind:'acquire'},
      {m:54,label:`CONTACT ${fmt(54)}`,kind:'contact'},
      {m:78,label:`DELIVER ${fmt(78)}`,kind:'deliver'}
    ];
    track.innerHTML = '<i class="tlNow" style="left:1.5%"></i>' + events.map(e => `<div class="tlEvent ${e.kind}" style="left:${Math.min(96,Math.max(4,e.m/90*100))}%"><i></i><span>${e.label}</span></div>`).join('');
  }

  function normalizeAlert() {
    const alert = $('alertbar');
    if (!alert) return;
    alert.classList.add('spaceopsAlertHud');
    alert.setAttribute('role','status');
    alert.setAttribute('aria-live','polite');
    const dismiss = $('dismissAlert');
    if (dismiss) dismiss.setAttribute('aria-label','Dismiss current exception summary');
  }

  function bindOpsRegressionSignals() {
    const sync = $('syncBtn');
    if (sync && sync.dataset.opsSignalBound !== '1') {
      sync.dataset.opsSignalBound = '1';
      sync.addEventListener('click', () => {
        document.documentElement.dataset.opsLastSync = String(Date.now());
      });
    }
    const create = $('createMission');
    if (create && create.dataset.opsSignalBound !== '1') {
      create.dataset.opsSignalBound = '1';
      create.addEventListener('click', () => {
        setTimeout(() => {
          const metric = $('activeMissionMetric');
          if (metric) document.documentElement.dataset.opsMissionCount = metric.textContent.trim();
        }, 0);
      });
    }
    const dismiss = $('dismissAlert');
    if (dismiss && dismiss.dataset.opsSignalBound !== '1') {
      dismiss.dataset.opsSignalBound = '1';
      dismiss.addEventListener('click', () => {
        setTimeout(() => { document.documentElement.dataset.opsAlertDismissed = $('alertbar')?.classList.contains('hidden') ? '1' : '0'; }, 0);
      });
    }
    document.documentElement.dataset.opsSharedMission = document.documentElement.dataset.sharedMission || 'NONE';
  }

  ensureStyle();
  buildTimeline();
  normalizeAlert();
  bindOpsRegressionSignals();
  setInterval(renderTimeline, 30000);
})();