from __future__ import annotations
import json, time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#twin'
DL=Path('/tmp/spaceops-downloads')

def wait_js(d,s,t=30): return WebDriverWait(d,t).until(lambda x:x.execute_script(s))
def on(e): return 'on' in (e.get_attribute('class') or '').split()
def click(d,e,pause=.25):
    d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",e); time.sleep(.08); e.click(); time.sleep(pause)
def names(d): return [e.get_attribute('data-name') for e in d.find_elements(By.CSS_SELECTOR,'.asset') if e.is_displayed()]
def profile(d): return d.execute_script('return window.__spaceopsGlobeApi.refreshLayers(true)')

def main():
    DL.mkdir(parents=True,exist_ok=True)
    for p in DL.glob('*'): p.unlink()
    o=Options(); o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--window-size=1600,1000'); o.add_argument('--ignore-certificate-errors')
    o.add_experimental_option('prefs',{'download.default_directory':str(DL),'download.prompt_for_download':False,'download.directory_upgrade':True})
    d=webdriver.Chrome(options=o); d.set_page_load_timeout(45); passed=[]
    def ok(fid): passed.append(fid); print('PASS',fid,flush=True)
    try:
        d.get(BASE); WebDriverWait(d,25).until(EC.frame_to_be_available_and_switch_to_it((By.ID,'frame')))
        wait_js(d,"return document.readyState==='complete'"); wait_js(d,"return !!window.__spaceopsGlobeApi && !!document.querySelector('.spaceopsSharedGlobeHost canvas')",40); wait_js(d,"return document.documentElement.dataset.twinVisualReady==='1'")

        # F01 live/pause: visible state + shared simulation state.
        e=d.find_element(By.ID,'liveState'); init=on(e); foot=d.find_element(By.ID,'footerLive').text
        click(d,e); assert on(e)!=init; assert d.find_element(By.ID,'footerLive').text!=foot
        if 'PAUSED' in d.find_element(By.ID,'footerLive').text: assert d.execute_script('return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.live') is False
        click(d,e); assert on(e)==init; ok('TWIN-F01')

        # F02 sync: the visible age must drop back near zero and the shared epoch must refresh.
        time.sleep(2.2)
        age_before=float(d.find_element(By.ID,'stateAge').text.rstrip('s'))
        epoch_before=d.execute_script('return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.epochMs')
        b=d.find_element(By.ID,'syncBtn'); d.execute_script("arguments[0].scrollIntoView({block:'center'});",b); b.click()
        age_after=float(d.find_element(By.ID,'stateAge').text.rstrip('s'))
        epoch_after=d.execute_script('return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.epochMs')
        assert age_after < age_before and age_after <= 2.0, (age_before,age_after)
        assert epoch_after>=epoch_before
        ok('TWIN-F02')

        # F03 search.
        q=d.find_element(By.ID,'assetSearch'); q.clear(); q.send_keys('SAR-01'); time.sleep(.2); assert names(d)==['SAR-01']; q.clear(); ok('TWIN-F03')

        # F04 tabs.
        d.find_element(By.ID,'tabSpacecraft').click(); time.sleep(.15); assert len(names(d))==4
        d.find_element(By.ID,'tabGround').click(); time.sleep(.15); assert len(names(d))==3 and all(x.startswith('GS-') for x in names(d))
        d.find_element(By.ID,'tabAll').click(); time.sleep(.15); assert len(names(d))==8; ok('TWIN-F04')

        # F05 selecting SAR-01 updates inspector and must invoke shared globe focus signal.
        sar=d.find_element(By.CSS_SELECTOR,'.asset[data-name="SAR-01"]'); mark=d.execute_script("return document.documentElement.dataset.twinFocusedObject||''")
        click(d,sar); assert d.find_element(By.ID,'objectName').text=='SAR-01'; assert d.find_element(By.ID,'objectStatus').text=='WATCH'
        focus=d.execute_script("return document.documentElement.dataset.twinFocusedObject||''"); assert focus=='SAR-01' and focus!=mark, focus; ok('TWIN-F05')

        # F06-F08 must create a visible scene-state response, not just a handler.
        for fid,eid,state in [('TWIN-F06','coverageMode','coverage'),('TWIN-F07','anomalyMode','anomaly'),('TWIN-F08','linkMode','links')]:
            e=d.find_element(By.ID,eid); before=on(e); click(d,e); assert on(e)!=before; assert e.get_attribute('aria-pressed')==('true' if not before else 'false')
            scene=d.find_element(By.ID,'spaceopsTwinModeState'); assert scene.is_displayed() and state.upper() in scene.text.upper()
            click(d,e); assert on(e)==before; ok(fid)

        # F09 shared globe layer profile must actually change then restore.
        for label,key in [('ORBITS','orbits'),('ASSETS','sats'),('GROUND','ground'),('AOI','aoi')]:
            e=next(x for x in d.find_elements(By.CSS_SELECTOR,'[data-layer]') if x.text.strip().upper()==label); before=bool(profile(d).get(key)); click(d,e); assert bool(profile(d).get(key))!=before; click(d,e); assert bool(profile(d).get(key))==before
        ok('TWIN-F09')

        # F10 capability drawer.
        click(d,d.find_element(By.ID,'payloadToggle')); dr=d.find_element(By.ID,'payloadDrawer'); assert 'open' in dr.get_attribute('class').split(); assert 'SAR-01' in d.find_element(By.ID,'payloadDrawerTitle').text; dr.find_element(By.CSS_SELECTOR,'[data-close]').click(); ok('TWIN-F10')

        # F11 full profile drawer.
        click(d,d.find_element(By.ID,'profileLink')); dr=d.find_element(By.ID,'profileDrawer'); assert 'open' in dr.get_attribute('class').split(); assert d.find_element(By.ID,'profileName').text=='SAR-01'; assert d.find_element(By.ID,'profileGrid').text.strip(); dr.find_element(By.CSS_SELECTOR,'[data-close]').click(); ok('TWIN-F11')

        # F12 snapshot download.
        click(d,d.find_element(By.ID,'snapshotBtn')); snap=DL/'space-ops-twin-snapshot.json'; end=time.time()+8
        while time.time()<end and not snap.exists(): time.sleep(.15)
        assert snap.exists(); data=json.loads(snap.read_text()); assert data['selected']=='SAR-01' and 'orbits' in data['layers']; ok('TWIN-F12')

        # F13 actual globe POV zoom/reset.
        alt=lambda: float(d.execute_script('return window.__spaceopsGlobeApi.pointOfView().altitude'))
        a0=alt(); click(d,d.find_element(By.ID,'zoomIn')); a1=alt(); assert a1<a0; click(d,d.find_element(By.ID,'zoomOut')); a2=alt(); assert a2>a1; click(d,d.find_element(By.ID,'resetView')); time.sleep(.35); assert abs(alt()-2.08)<.15; ok('TWIN-F13')

        # F14 shared Mission Context.
        d.switch_to.default_content(); d.find_element(By.ID,'missionBtn').click(); mid=d.find_element(By.ID,'missionId'); mid.clear(); mid.send_keys('QA-TWIN-001'); aoi=d.find_element(By.ID,'missionAoi'); aoi.clear(); aoi.send_keys('Singapore Twin QA'); d.find_element(By.ID,'missionPriority').send_keys('P1'); d.find_element(By.ID,'saveContext').click(); time.sleep(.35); d.switch_to.frame(d.find_element(By.ID,'frame')); ctx=d.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]').text; assert all(x in ctx for x in ['QA-TWIN-001','Singapore Twin QA','P1']); ok('TWIN-F14')

        # F15 critical hit targets visible and clickable.
        for eid in ['liveState','syncBtn','snapshotBtn','assetSearch','coverageMode','anomalyMode','linkMode','zoomIn','zoomOut','resetView','payloadToggle','profileLink']:
            e=d.find_element(By.ID,eid); r=d.execute_script('return arguments[0].getBoundingClientRect()',e); assert r['width']>0 and r['height']>0; assert d.execute_script('return getComputedStyle(arguments[0]).pointerEvents',e)!='none'
        ok('TWIN-F15'); print(f'TWIN functional browser QA passed {len(passed)}/15',flush=True)
    finally: d.quit()

if __name__=='__main__': main()
