import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.SPACE_OPS_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const results = [];
const pass = (id, note='') => results.push({id, ok:true, note});
const fail = (id, err) => results.push({id, ok:false, note:String(err?.message || err)});

async function run(id, fn){
  try { await fn(); pass(id); }
  catch (e) { fail(id,e); }
}

await page.goto(`${base}/workspace.html#ops`, {waitUntil:'domcontentloaded'});
const frameEl = await page.waitForSelector('#frame');
const frame = await frameEl.contentFrame();
assert(frame, 'OPS iframe missing');
await frame.waitForSelector('.spaceopsSharedGlobeHost canvas', {timeout:30000});
await frame.waitForFunction(() => !!window.__spaceopsGlobeApi, null, {timeout:30000});

const chip = async (text) => frame.locator('.maptools .chip').filter({hasText:text}).first();
const classOn = async locator => (await locator.getAttribute('class') || '').split(/\s+/).includes('on');

for (const [id,label] of [
  ['OPS-F09','ORBITS'],['OPS-F10','SATELLITES'],['OPS-F11','GROUND'],['OPS-F12','AOI'],['OPS-F13','GRID']
]) {
  await run(id, async()=>{
    const b = await chip(label); assert(await b.count(), `${label} control missing`);
    const before = await classOn(b);
    await b.click(); await frame.waitForTimeout(150);
    const after = await classOn(b); assert.notEqual(after,before,`${label} did not toggle`);
    await b.click(); await frame.waitForTimeout(150);
    assert.equal(await classOn(b),before,`${label} did not toggle back`);
  });
}

await run('OPS-F14', async()=>{
  const b=frame.locator('#nightBtn'); const before=await classOn(b);
  await b.click(); await frame.waitForTimeout(350); assert.notEqual(await classOn(b),before,'NIGHT did not toggle');
  await b.click(); await frame.waitForTimeout(350); assert.equal(await classOn(b),before,'NIGHT did not toggle back');
});

await run('OPS-F15', async()=>{
  const before=await frame.evaluate(()=>window.__spaceopsGlobeApi.pointOfView().altitude);
  await frame.locator('#zoomIn').click(); await frame.waitForTimeout(450);
  const after=await frame.evaluate(()=>window.__spaceopsGlobeApi.pointOfView().altitude);
  assert(after < before,`zoom in altitude ${before} -> ${after}`);
});
await run('OPS-F16', async()=>{
  const before=await frame.evaluate(()=>window.__spaceopsGlobeApi.pointOfView().altitude);
  await frame.locator('#zoomOut').click(); await frame.waitForTimeout(450);
  const after=await frame.evaluate(()=>window.__spaceopsGlobeApi.pointOfView().altitude);
  assert(after > before,`zoom out altitude ${before} -> ${after}`);
});
await run('OPS-F17', async()=>{
  await frame.locator('#zoomIn').click(); await frame.waitForTimeout(350);
  await frame.locator('#resetView').click(); await frame.waitForTimeout(800);
  const pov=await frame.evaluate(()=>window.__spaceopsGlobeApi.pointOfView());
  assert(Math.abs(pov.altitude-2.08)<0.08,`reset altitude=${pov.altitude}`);
  assert(Math.abs(pov.lat-18)<1.2,`reset lat=${pov.lat}`);
  assert(Math.abs(pov.lng-103)<1.2,`reset lng=${pov.lng}`);
});

for (const [id,obj,kind] of [
  ['OPS-F18','GF-7 02','SPACECRAFT'],
  ['OPS-F19','GS-SG-02','GROUND ASSET'],
  ['OPS-F20','SG-PORT-04','MISSION OBJECT']
]) {
  await run(id, async()=>{
    await frame.evaluate(id=>window.__spaceopsGlobeApi.selectObject(id),obj);
    await frame.waitForTimeout(850);
    const hud=frame.locator('#spaceopsOpsSelectedHud');
    await hud.waitFor({state:'visible'});
    const txt=await hud.textContent(); assert(txt?.includes(obj),`${obj} missing from Selected Object HUD`);
    if (kind!=='MISSION OBJECT') assert(txt?.includes(kind),`${kind} missing from HUD`);
    const pov=await frame.evaluate(()=>window.__spaceopsGlobeApi.pointOfView());
    assert(pov.altitude < 1.7,`${obj} did not focus camera`);
  });
}

await run('OPS-F23', async()=>{
  const timeline=frame.locator('#spaceopsMissionTimeline'); await timeline.waitFor({state:'visible'});
  const txt=await timeline.textContent();
  assert(/\b\d{2}:\d{2}Z\b/.test(txt||''),'runtime UTC contact/acquire times missing');
});

await run('OPS-F24', async()=>{
  await page.locator('#contextBtn').click();
  await page.locator('#missionId').fill('QA-MISSION-001');
  await page.locator('#missionAoi').fill('Singapore QA AOI');
  await page.locator('#missionPriority').selectOption('P1');
  await page.locator('#saveContext').click();
  await frame.waitForTimeout(250);
  const chip=frame.locator('[data-spaceops-shared-context]');
  const txt=await chip.textContent();
  assert(txt?.includes('QA-MISSION-001'),'mission context not visible in OPS');
  assert(txt?.includes('Singapore QA AOI'),'AOI context not visible in OPS');
  assert(txt?.includes('P1'),'priority context not visible in OPS');
});

await run('OPS-F25', async()=>{
  const ids=['syncBtn','newMissionBtn','runMission','clearMission','nightBtn','zoomIn','zoomOut','resetView','dismissAlert','helpBtn'];
  for (const id of ids) {
    const el=frame.locator(`#${id}`); if(!(await el.count())) continue;
    const box=await el.boundingBox(); assert(box && box.width>0 && box.height>0,`${id} has no clickable box`);
    const pe=await el.evaluate(e=>getComputedStyle(e).pointerEvents); assert.notEqual(pe,'none',`${id} pointer-events:none`);
  }
});

console.table(results);
const bad=results.filter(r=>!r.ok);
if (bad.length) {
  console.error('FAILED OPS CONTROLS:',bad);
  process.exitCode=1;
} else {
  console.log(`OPS functional smoke passed: ${results.length}/${results.length}`);
}
await browser.close();
