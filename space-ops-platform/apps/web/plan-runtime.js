(() => {
  'use strict';
  const d = document;
  if (!d || d.documentElement.dataset.spaceopsPlanRuntime === '1') return;
  d.documentElement.dataset.spaceopsPlanRuntime = '1';

  const style = d.createElement('style');
  style.id = 'spaceops-plan-runtime-style';
  style.textContent = `
    .main{position:relative;padding:14px 18px 26px!important}
    .top{position:relative;z-index:40;min-height:54px}
    .metrics{position:absolute;z-index:39;left:34px;right:34px;top:82px;margin:0!important;display:flex!important;gap:18px;border:0!important;background:transparent!important;pointer-events:none}
    .metric{min-height:0!important;padding:0 0 0 10px!important;border:0!important;border-left:1px solid rgba(126,183,255,.14)!important;background:transparent!important;opacity:.64}
    .metric:first-child{border-left:0!important;padding-left:0!important}.metric b{font-size:13px!important}.metric span{font-size:6.5px!important;letter-spacing:.09em!important}.metric em{display:none!important}
    .metric:nth-child(2),.metric:nth-child(3){opacity:.95}.metric:nth-child(2) b,.metric:nth-child(3) b{font-size:19px!important;color:#e8edf3!important}
    .workspace{position:relative;display:block!important;min-height:calc(100vh - 84px);margin-top:4px}
    .workspace>.panel:nth-child(2){position:relative;border:0!important;background:transparent!important}
    .workspace>.panel:nth-child(2)>.head{position:absolute;z-index:33;left:18px;bottom:154px;height:auto!important;padding:0!important;border:0!important;background:transparent!important;pointer-events:none}
    .workspace>.panel:nth-child(2)>.head strong{font-size:8px!important;letter-spacing:.12em;color:#d7dde4}.workspace>.panel:nth-child(2)>.head small{display:block;margin-top:3px;font-size:6.5px!important;color:#617080}
    .scene{height:calc(100vh - 88px)!important;min-height:650px!important;border:1px solid rgba(91,107,126,.16)!important;background:#06090e!important;box-shadow:inset 0 0 90px rgba(0,0,0,.24)!important}
    .sceneTools{top:92px!important;left:18px!important;z-index:38!important}.legend{left:18px!important;bottom:118px!important;border:0!important;background:rgba(7,11,16,.42)!important;backdrop-filter:blur(8px)}
    .viewNote{right:18px!important;bottom:118px!important;width:230px!important;border-left:1px solid rgba(111,168,255,.34)!important;border-top:0!important;border-right:0!important;border-bottom:0!important;background:linear-gradient(90deg,rgba(6,11,17,.68),rgba(6,11,17,.24))!important;backdrop-filter:blur(10px)!important}
    .timeline{position:absolute;z-index:32;left:18px;right:18px;bottom:16px;padding:8px 10px!important;border:1px solid rgba(86,101,119,.16)!important;background:rgba(6,10,15,.58)!important;backdrop-filter:blur(12px)!important}
    .timelineTop{margin-bottom:5px!important}.timegrid{height:74px!important;background:repeating-linear-gradient(90deg,rgba(93,108,126,.18) 0 1px,transparent 1px 12.5%)!important}.lane{height:18px!important}.l2{top:18px!important}.l3{top:36px!important}.l4{top:54px!important}.block{height:11px!important;top:3px!important;font-size:6px!important;padding:1px 4px!important}
    .workspace>.panel:first-child{position:absolute;z-index:37;left:18px;top:146px;width:276px;border:1px solid rgba(95,111,129,.18)!important;border-left:2px solid rgba(111,168,255,.46)!important;background:linear-gradient(180deg,rgba(8,13,19,.76),rgba(6,10,15,.48))!important;backdrop-filter:blur(14px)!important;box-shadow:0 18px 44px rgba(0,0,0,.18)!important}
    .workspace>.panel:first-child .head{height:32px!important;padding:0 9px!important;border-bottom-color:rgba(85,101,119,.14)!important}.workspace>.panel:first-child .head strong{font-size:8px!important;letter-spacing:.11em}.workspace>.panel:first-child .head small{font-size:6px!important}
    .workspace>.panel:first-child .form{padding:9px!important;gap:7px!important}.workspace>.panel:first-child .label{font-size:6.5px!important;gap:3px!important}.workspace>.panel:first-child input,.workspace>.panel:first-child select,.workspace>.panel:first-child textarea{padding:6px 7px!important;background:rgba(5,9,14,.58)!important;border-color:rgba(84,101,120,.20)!important;font-size:7px!important}.workspace>.panel:first-child .label textarea{height:48px!important}.workspace>.panel:first-child .switchline{padding:6px 0!important;font-size:7px!important}.workspace>.panel:first-child .constraint{padding:7px!important;background:rgba(5,9,14,.5)!important;border-color:rgba(84,101,120,.16)!important}.workspace>.panel:first-child .actionbar .btn{height:27px!important;font-size:6.5px!important}.workspace>.panel:first-child .validation{font-size:6.5px!important;background:rgba(4,8,12,.5)!important}
    .plansPanel{position:absolute!important;z-index:37;right:18px;top:146px;width:314px;border:1px solid rgba(95,111,129,.18)!important;background:linear-gradient(180deg,rgba(8,13,19,.76),rgba(6,10,15,.48))!important;backdrop-filter:blur(14px)!important;box-shadow:0 18px 44px rgba(0,0,0,.18)!important}
    .plansPanel .head{height:32px!important;padding:0 9px!important;border-bottom-color:rgba(85,101,119,.14)!important}.plansPanel .head strong{font-size:8px!important;letter-spacing:.11em}.plansPanel .head small{font-size:6px!important}.plans{max-height:344px!important}.planCard{padding:8px 9px!important;border-bottom-color:rgba(76,91,108,.12)!important;background:transparent!important}.planCard:hover,.planCard.active{background:linear-gradient(90deg,rgba(223,63,118,.08),transparent 82%)!important}.rank{font-size:13px!important}.score{font-size:6px!important}.planCard h3{font-size:8px!important}.planCard p{font-size:6.5px!important}.tag{font-size:6px!important;padding:2px 4px!important}.planStats div{padding:4px!important;background:rgba(5,9,14,.46)!important;border-color:rgba(80,96,114,.14)!important}.planStats span{font-size:5.7px!important}.planStats b{font-size:7px!important}
    .bottom{position:relative;z-index:10;margin-top:18px!important;grid-template-columns:1.35fr .65fr!important;gap:10px!important}.bottom .panel{border-color:rgba(82,95,111,.2)!important;background:linear-gradient(180deg,rgba(16,21,28,.82),rgba(10,14,19,.82))!important}.bottom .head{height:38px!important;border-bottom-color:rgba(82,95,111,.18)!important}
    .windowSeg{display:none!important}
    #spaceopsPlanOpportunityWindows{position:absolute;inset:0;width:100%;height:100%;z-index:6;pointer-events:none;overflow:visible}
    #spaceopsPlanOpportunityWindows .oppPath{fill:none;stroke-linecap:round;stroke-width:4;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 4px rgba(115,215,162,.24))}
    #spaceopsPlanOpportunityWindows .oppPath.conditional{filter:drop-shadow(0 0 4px rgba(231,200,107,.20))}
    @media(max-width:1260px){.metrics{left:22px;right:22px;flex-wrap:wrap}.scene{height:760px!important}.workspace>.panel:first-child{left:16px;top:160px}.plansPanel{right:16px;top:160px;width:300px}.bottom{grid-template-columns:1fr!important}}
    @media(max-width:820px){.main{padding:10px!important}.metrics{position:relative;left:auto;right:auto;top:auto;display:grid!important;grid-template-columns:repeat(2,1fr)!important;margin:10px 0!important}.workspace{min-height:auto}.scene{height:680px!important;min-height:600px!important}.workspace>.panel:first-child,.plansPanel{position:relative!important;left:auto!important;right:auto!important;top:auto!important;width:auto!important;margin-top:10px}.timeline{left:10px!important;right:10px!important;bottom:10px!important}.legend{bottom:104px!important}.viewNote{display:none!important}}
  `;
  d.head.appendChild(style);

  const scene = d.querySelector('.scene');
  if (scene) {
    scene.setAttribute('aria-label','Orbital opportunity scene');
    const note = d.querySelector('.viewNote');
    if (note) note.innerHTML = '<b style="color:#cfd7df">OPPORTUNITY GEOMETRY</b><br>Singapore Port AOI · orbital access windows · ranked feasible spacecraft · simulated planning state';

    if (!d.getElementById('spaceopsPlanOpportunityWindows')) {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = d.createElementNS(ns,'svg');
      svg.id = 'spaceopsPlanOpportunityWindows';
      svg.setAttribute('viewBox','0 0 1000 650');
      svg.setAttribute('preserveAspectRatio','none');
      svg.setAttribute('data-orbit-attached','1');
      svg.setAttribute('aria-label','Orbit-attached opportunity windows');
      const windows = [
        {d:'M 610 200 C 655 177 710 171 758 184',stroke:'#73d7a2',state:'executable'},
        {d:'M 287 399 C 324 423 371 431 414 420',stroke:'#e7c86b',state:'conditional'},
        {d:'M 564 438 C 585 470 616 496 649 509',stroke:'#73d7a2',state:'executable'}
      ];
      windows.forEach((w,i) => {
        const path = d.createElementNS(ns,'path');
        path.setAttribute('d',w.d);
        path.setAttribute('stroke',w.stroke);
        path.setAttribute('class',`oppPath ${w.state === 'conditional' ? 'conditional' : ''}`.trim());
        path.setAttribute('data-opportunity-window',String(i+1));
        path.setAttribute('data-state',w.state);
        svg.appendChild(path);
      });
      scene.appendChild(svg);
      const windowLayer = [...d.querySelectorAll('[data-layer]')].find(b => String(b.dataset.layer).toLowerCase() === 'window');
      if (windowLayer) {
        const syncWindowVisibility = () => svg.classList.toggle('hidden', !windowLayer.classList.contains('on'));
        windowLayer.addEventListener('click', () => setTimeout(syncWindowVisibility, 0));
        syncWindowVisibility();
      }
    }
  }

  const plansPanel = d.querySelector('.plansPanel');
  if (plansPanel) {
    const h = plansPanel.querySelector('.head strong');
    if (h) h.textContent = 'RANKED PLANS';
  }
  const formPanel = d.querySelector('.workspace > .panel:first-child');
  if (formPanel) {
    const h = formPanel.querySelector('.head strong');
    if (h) h.textContent = 'MISSION CONSTRAINTS';
  }

  d.querySelectorAll('.sceneTools .chip').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('on') ? 'true' : 'false');
    btn.addEventListener('click', () => setTimeout(() => btn.setAttribute('aria-pressed', btn.classList.contains('on') ? 'true' : 'false'), 0));
  });

  const validate = d.getElementById('validateBtn') || [...d.querySelectorAll('button')].find(b => /VALIDATE/i.test(b.textContent));
  const generate = d.getElementById('generateBtn') || [...d.querySelectorAll('button')].find(b => /GENERATE/i.test(b.textContent));
  const commit = d.getElementById('commitBtn') || [...d.querySelectorAll('button')].find(b => /COMMIT/i.test(b.textContent));
  [validate, generate, commit].filter(Boolean).forEach(btn => btn.dataset.spaceopsPlanRegression = 'preserved');

  const planCards = [...d.querySelectorAll('.planCard')];
  planCards.forEach((card, i) => {
    card.setAttribute('role','button');
    card.setAttribute('aria-label',`Ranked plan ${i + 1}`);
  });

  const timeline = d.querySelector('.timeline');
  if (timeline) timeline.setAttribute('aria-label','Mission opportunity schedule timeline');
})();