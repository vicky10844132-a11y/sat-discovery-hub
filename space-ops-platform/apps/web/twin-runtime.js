(() => {
  'use strict';
  if (document.documentElement.dataset.spaceopsTwinRuntime === '1') return;
  document.documentElement.dataset.spaceopsTwinRuntime = '1';

  const $ = id => document.getElementById(id);
  const style = document.createElement('style');
  style.id = 'spaceops-twin-runtime-style';
  style.textContent = `
    .main{position:relative;padding:14px 18px 24px!important}
    .top{position:relative;z-index:42;min-height:54px;align-items:center!important}
    .title{font-size:25px!important}
    .metrics{position:absolute;z-index:39;left:32px;right:32px;top:82px;display:flex!important;gap:20px!important;margin:0!important;border:0!important;background:transparent!important;pointer-events:none}
    .metric{min-height:0!important;padding:0 0 0 10px!important;border:0!important;border-left:1px solid rgba(108,128,150,.14)!important;background:transparent!important;opacity:.66}
    .metric:first-child{border-left:0!important;padding-left:0!important;opacity:1}
    .metric b{font-size:15px!important;color:#dce3ea}.metric:first-child b{font-size:23px!important;color:#fff}
    .metric span{font-size:6px!important;letter-spacing:.10em!important;margin-top:4px!important}.metric em{font-size:5.8px!important;margin-top:2px!important}
    .workspace{position:relative!important;display:block!important;margin-top:4px;min-height:calc(100vh - 84px)}
    .workspace>.panel:nth-child(2){position:relative!important;border:0!important;background:transparent!important}
    .scene{height:calc(100vh - 88px)!important;min-height:650px!important;border:1px solid rgba(92,108,128,.15)!important;box-shadow:inset 0 0 90px rgba(0,0,0,.20)}
    .workspace>.panel:first-child{position:absolute;z-index:38;left:18px;top:112px;width:252px;max-height:430px;border:1px solid rgba(94,112,133,.18)!important;background:linear-gradient(180deg,rgba(8,13,19,.70),rgba(6,10,15,.48))!important;backdrop-filter:blur(13px);box-shadow:none!important}
    .workspace>.panel:first-child .head{height:32px!important;padding:0 9px!important;border-bottom-color:rgba(90,106,126,.12)!important}.workspace>.panel:first-child .tabs{border-bottom-color:rgba(90,106,126,.10)!important}.workspace>.panel:first-child .tab{height:31px!important;padding:0 10px!important;background:transparent!important;border-right-color:rgba(90,106,126,.10)!important;font-size:6.5px!important}.workspace>.panel:first-child .search{padding:7px 8px!important;border-bottom-color:rgba(90,106,126,.10)!important}.workspace>.panel:first-child .search input{height:28px!important;background:rgba(3,8,13,.55)!important;border-color:rgba(94,112,133,.18)!important;font-size:7px!important}.workspace>.panel:first-child .tree{max-height:310px!important}.workspace>.panel:first-child .groupTitle{padding:7px 10px!important;font-size:6px!important}.workspace>.panel:first-child .asset{grid-template-columns:7px 1fr auto!important;gap:7px!important;padding:7px 10px!important;border-color:transparent!important}.workspace>.panel:first-child .asset b{font-size:7.5px!important}.workspace>.panel:first-child .asset small{font-size:6px!important;margin-top:2px!important}.workspace>.panel:first-child .dot{width:6px!important;height:6px!important;box-shadow:none!important}.workspace>.panel:first-child .asset.active{background:linear-gradient(90deg,rgba(223,63,118,.10),transparent)!important;border-left:2px solid rgba(223,63,118,.62)!important}
    .inspector{position:absolute!important;z-index:38;right:18px;top:112px;width:302px;min-height:0!important;max-height:510px;overflow:auto;border:1px solid rgba(94,112,133,.18)!important;background:linear-gradient(180deg,rgba(8,13,19,.75),rgba(6,10,15,.52))!important;backdrop-filter:blur(14px);box-shadow:none!important;scrollbar-width:thin;scrollbar-color:rgba(111,168,255,.18) transparent}
    .inspector .head{height:32px!important;padding:0 10px!important;border-bottom-color:rgba(90,106,126,.12)!important}.inspector .hero{padding:12px!important;border-bottom-color:rgba(90,106,126,.11)!important}.inspector .hero h2{font-size:16px!important}.inspector .status{font-size:6px!important;padding:4px 6px!important;background:rgba(16,33,26,.55)!important}.inspector .kv{border-bottom-color:rgba(90,106,126,.10)!important}.inspector .kv div{padding:8px 10px!important;border-right-color:rgba(90,106,126,.10)!important}.inspector .kv span{font-size:6px!important}.inspector .kv b{font-size:8px!important;margin-top:3px!important}.inspector .section{padding:9px 10px!important;border-bottom-color:rgba(90,106,126,.10)!important}.inspector .sectionTitle{font-size:7px!important;margin-bottom:7px!important}
    .sceneTools{top:164px!important;left:286px!important}.sceneTools .chip{height:27px!important;padding:0 8px!important;font-size:6.5px!important;background:rgba(5,10,15,.64)!important;border-color:rgba(91,109,130,.18)!important}.sceneTools .chip.on{background:rgba(87,29,52,.42)!important;border-color:rgba(223,63,118,.42)!important}
    .zoomtools{top:164px!important;right:334px!important}.zoomtools button{width:31px!important;height:31px!important;background:rgba(5,10,15,.64)!important;border-color:rgba(91,109,130,.18)!important}
    .legend{left:286px!important;bottom:14px!important;border:0!important;background:rgba(5,10,15,.46)!important;backdrop-filter:blur(8px)!important;padding:7px 9px!important;font-size:6px!important}.reset{left:286px!important;bottom:14px!important;transform:translateY(-39px)!important;height:29px!important;background:rgba(5,10,15,.55)!important;border-color:rgba(91,109,130,.18)!important;font-size:6px!important}
    .footer{position:relative;z-index:8;margin-top:14px!important;border-top-color:rgba(90,106,126,.12)!important}
    @media(max-width:1150px){.metrics{left:22px;right:22px;top:88px;flex-wrap:wrap;gap:10px 14px!important}.metric{flex:1 1 120px}.scene{height:760px!important;min-height:680px!important}.workspace>.panel:first-child{left:14px;top:150px;width:230px}.inspector{right:14px;top:150px;width:280px}.sceneTools{left:260px!important;top:150px!important}.zoomtools{right:310px!important;top:150px!important}.legend,.reset{left:260px!important}}
    @media(max-width:820px){.metrics{position:relative;left:auto;right:auto;top:auto;display:grid!important;grid-template-columns:repeat(2,1fr)!important;margin:10px 0!important}.workspace{min-height:auto}.scene{height:650px!important;min-height:600px!important}.workspace>.panel:first-child,.inspector{position:relative!important;left:auto!important;right:auto!important;top:auto!important;width:auto!important;max-height:none!important;margin-top:10px}.sceneTools{left:12px!important;top:12px!important}.zoomtools{right:12px!important;top:12px!important}.legend{left:12px!important}.reset{left:12px!important}.workspace>.panel:first-child .tree{max-height:280px!important}}
  `;
  document.head.appendChild(style);

  const scene = document.querySelector('.scene');
  if (scene) scene.dataset.twinSceneFirst = '1';

  const modeIds = ['coverageMode','anomalyMode','linkMode'];
  modeIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.setAttribute('aria-pressed',el.classList.contains('on') ? 'true' : 'false');
    if (el.dataset.twinModeBound !== '1') {
      el.dataset.twinModeBound = '1';
      el.addEventListener('click',() => setTimeout(() => el.setAttribute('aria-pressed',el.classList.contains('on') ? 'true' : 'false'),0));
    }
  });

  const live = $('liveState');
  if (live) live.title = 'Simulation clock state; prototype only';
  const snapshot = $('snapshotBtn');
  if (snapshot) snapshot.setAttribute('aria-label','Export simulated twin snapshot bundle');
  document.documentElement.dataset.twinVisualReady = '1';
})();