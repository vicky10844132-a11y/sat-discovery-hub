from __future__ import annotations
import json, os, time, glob
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#eng'
DL='/tmp/spaceops-eng-downloads'

def wait_js(d,s,t=35): return WebDriverWait(d,t).until(lambda x:x.execute_script(s))
def click(d,e,p=.15):
    d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",e); time.sleep(.05); e.click(); time.sleep(p)
def set_select(d,eid,value): Select(d.find_element(By.ID,eid)).select_by_visible_text(value); time.sleep(.15)
def last_toast(d):
    xs=d.find_elements(By.CSS_SELECTOR,'.toast')
    return xs[-1].text if xs else (d.execute_script("return window.__engQaLastToast||''") or '')
def top_job(d): return d.find_elements(By.CSS_SELECTOR,'#jobsBody tr')[0]
def state(row): return row.find_element(By.CSS_SELECTOR,'.state').text.strip()
def wait_complete(d,row): WebDriverWait(d,3).until(lambda _ : state(row)=='COMPLETE')

def main():
    os.makedirs(DL,exist_ok=True)
    o=Options(); o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--window-size=1600,1000'); o.add_argument('--ignore-certificate-errors')
    o.add_experimental_option('prefs',{'download.default_directory':DL,'download.prompt_for_download':False,'download.directory_upgrade':True})
    d=webdriver.Chrome(options=o); passed=[]
    def ok(fid): passed.append(fid); print('PASS',fid,flush=True)
    try:
        d.get(BASE); WebDriverWait(d,25).until(EC.frame_to_be_available_and_switch_to_it((By.ID,'frame')))
        wait_js(d,"return document.readyState==='complete'"); wait_js(d,"return document.documentElement.dataset.spaceopsSpecialistRuntime==='1'",30); wait_js(d,"return !!window.__spaceopsGlobeApi",30)
        d.execute_script("""
          window.__engQaLastToast='';
          const root=document.getElementById('toastbox');
          if(root&&!window.__engQaToastObserver){window.__engQaToastObserver=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1&&n.classList?.contains('toast'))window.__engQaLastToast=n.textContent||''}});window.__engQaToastObserver.observe(root,{childList:true})}
          window.__engQaSyncDisabledSeen=false;const sync=document.getElementById('syncBtn');
          if(sync&&!window.__engQaSyncObserver){window.__engQaSyncObserver=new MutationObserver(()=>{if(sync.disabled)window.__engQaSyncDisabledSeen=true});window.__engQaSyncObserver.observe(sync,{attributes:true,attributeFilter:['disabled']})}
        """)

        set_select(d,'assetSelect','SAR-01'); d.find_element(By.ID,'assetSelect').send_keys('')
        assert d.find_element(By.ID,'assetMetric').text=='SAR-01' and d.find_element(By.ID,'timelineAsset').text=='SAR-01' and d.find_element(By.CSS_SELECTOR,'.sat').get_attribute('data-id')=='SAR-01'; ok('ENG-F01')

        for tab,kind in [('orbit','orbit'),('nav','nav'),('gnc','gnc')]:
            click(d,d.find_element(By.CSS_SELECTOR,f'.tab[data-tab="{tab}"]'))
            vis=[e.get_attribute('data-kind') for e in d.find_elements(By.CSS_SELECTOR,'.engine') if e.is_displayed()]
            assert vis and set(vis)=={kind} and 'active' in d.find_element(By.CSS_SELECTOR,f'.engine[data-kind="{kind}"]').get_attribute('class').split()
        ok('ENG-F02')

        for fid,layer,key,initial in [('ENG-F03','orbit','orbits',True),('ENG-F04','vectors','vectors',False),('ENG-F05','body','body',False),('ENG-F06','cov','covariance',False)]:
            b=d.find_element(By.CSS_SELECTOR,f'.sceneTools [data-layer="{layer}"]')
            p=d.execute_script('return window.__spaceopsGlobeApi.refreshLayers(true)'); assert bool(p[key])==initial
            click(d,b); p=d.execute_script('return window.__spaceopsGlobeApi.refreshLayers(true)'); assert bool(p[key])!=initial
            click(d,b); p=d.execute_script('return window.__spaceopsGlobeApi.refreshLayers(true)'); assert bool(p[key])==initial; ok(fid)

        before=len(d.find_elements(By.CSS_SELECTOR,'#jobsBody tr')); click(d,d.find_element(By.CSS_SELECTOR,'[data-action="propagate"]'),.05); row=top_job(d)
        assert len(d.find_elements(By.CSS_SELECTOR,'#jobsBody tr'))==before+1 and row.find_elements(By.TAG_NAME,'td')[1].text=='Orbit Propagation' and state(row)=='RUNNING'; wait_complete(d,row); ok('ENG-F07')

        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="compare"]'),.05); row=top_job(d); assert row.find_elements(By.TAG_NAME,'td')[1].text=='Solution Comparison' and state(row)=='RUNNING'; wait_complete(d,row); ok('ENG-F08')
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="maneuver"]'),.05); row=top_job(d); assert row.find_elements(By.TAG_NAME,'td')[1].text=='Maneuver Evaluation'; wait_complete(d,row); ok('ENG-F09')
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="slew"]'),.05); row=top_job(d); assert row.find_elements(By.TAG_NAME,'td')[1].text=='ADCS Slew'; wait_complete(d,row); ok('ENG-F10')
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="ekf"]'),.05); row=top_job(d); assert row.find_elements(By.TAG_NAME,'td')[1].text=='Estimator Reset' and d.find_element(By.ID,'roll').text=='0.00°' and d.find_element(By.ID,'pitch').text=='0.00°' and d.find_element(By.ID,'yaw').text=='0.00°'; wait_complete(d,row); ok('ENG-F11')
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="pod"]')); row=top_job(d); assert row.find_elements(By.TAG_NAME,'td')[1].text=='Precision POD' and row.find_elements(By.TAG_NAME,'td')[3].text=='CONNECTOR_REQUIRED' and state(row)=='BLOCKED' and 'connector required' in last_toast(d).lower(); ok('ENG-F12')

        click(d,d.find_element(By.ID,'caseBtn')); dur=d.find_element(By.ID,'duration'); dur.clear(); dur.send_keys('0'); click(d,d.find_element(By.ID,'runCase')); assert 'open' in d.find_element(By.ID,'caseDrawer').get_attribute('class') and 'between 1 and 168' in last_toast(d); dur.clear(); dur.send_keys('169'); click(d,d.find_element(By.ID,'runCase')); assert 'open' in d.find_element(By.ID,'caseDrawer').get_attribute('class') and 'between 1 and 168' in last_toast(d); ok('ENG-F13')
        dur.clear(); dur.send_keys('36'); set_select(d,'analysisType','Orbit Propagation'); set_select(d,'asset','SY-01'); set_select(d,'frame','RTN'); click(d,d.find_element(By.ID,'runCase'),.05); row=top_job(d); assert d.find_element(By.ID,'validityMetric').text=='36 h' and d.find_element(By.ID,'frameValue').text=='RTN' and row.find_elements(By.TAG_NAME,'td')[2].text=='SY-01'; wait_complete(d,row); ok('ENG-F14')

        for f in glob.glob(DL+'/*'): os.remove(f)
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="export"]'))
        WebDriverWait(d,4).until(lambda _ : len(glob.glob(DL+'/*.json'))>0); fp=glob.glob(DL+'/*.json')[0]
        with open(fp,encoding='utf-8') as h: payload=json.load(h)
        assert payload['mode']=='SIMULATED' and payload['operational'] is False and payload['asset']=='SY-01'; ok('ENG-F15')

        d.execute_script('window.__engQaSyncDisabledSeen=false'); sync=d.find_element(By.ID,'syncBtn'); click(d,sync,.05)
        assert bool(d.execute_script('return window.__engQaSyncDisabledSeen===true')) and d.find_element(By.ID,'ageMetric').text.startswith('00')
        WebDriverWait(d,2).until(lambda x:x.find_element(By.ID,'syncBtn').is_enabled()); assert 'age reset' in last_toast(d).lower(); ok('ENG-F16')

        set_select(d,'assetSelect','SUPERVIEW NEO-1'); before=d.execute_script('return window.__SPACEOPS_SHARED_GLOBE_STATE__?.selectedId||""')
        click(d,d.find_element(By.ID,'focusAsset')); after=d.execute_script('return window.__SPACEOPS_SHARED_GLOBE_STATE__?.selectedId||""')
        assert after=='SUPERVIEW NEO-1' and after!=before and 'Focused SUPERVIEW NEO-1' in last_toast(d); ok('ENG-F17')

        ev=d.find_element(By.CSS_SELECTOR,'.event[data-event]'); expected=ev.get_attribute('data-event'); click(d,ev); assert expected in last_toast(d); ok('ENG-F18')

        d.switch_to.default_content(); click(d,d.find_element(By.ID,'missionBtn')); m=d.find_element(By.ID,'missionId'); m.clear(); m.send_keys('QA-ENG-001'); a=d.find_element(By.ID,'missionAoi'); a.clear(); a.send_keys('SG-PORT-04'); click(d,d.find_element(By.ID,'saveContext')); time.sleep(.35); d.switch_to.frame(d.find_element(By.ID,'frame'))
        ctx=d.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]').text; assert 'QA-ENG-001' in ctx and 'SG-PORT-04' in ctx; ok('ENG-F19')

        controls=[d.find_element(By.ID,'syncBtn'),d.find_element(By.ID,'caseBtn'),d.find_element(By.ID,'focusAsset'),d.find_element(By.CSS_SELECTOR,'[data-action="propagate"]'),d.find_element(By.CSS_SELECTOR,'.tab[data-tab="orbit"]')]
        for el in controls:
            assert el.is_displayed(); d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",el); time.sleep(.04)
            hit=d.execute_script("const r=arguments[0].getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);return x>=0&&y>=0&&x<innerWidth&&y<innerHeight&&(h===arguments[0]||arguments[0].contains(h)||h?.contains(arguments[0]));",el); assert hit
        ok('ENG-F20')
        print('ENG QA PASS',len(passed),'controls:',','.join(passed),flush=True); assert len(passed)==20
    finally: d.quit()

if __name__=='__main__': main()
