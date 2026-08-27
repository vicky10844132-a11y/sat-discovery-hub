import os, time, json, glob
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.chrome.options import Options

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#eng'
DL='/tmp/spaceops-eng-downloads'
os.makedirs(DL,exist_ok=True)

def driver():
    o=Options(); o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--disable-gpu'); o.add_argument('--window-size=1600,1200')
    o.add_experimental_option('prefs',{'download.default_directory':DL,'download.prompt_for_download':False})
    return webdriver.Chrome(options=o)

def wait_frame(d):
    WebDriverWait(d,12).until(lambda x:x.find_element(By.ID,'frame'))
    WebDriverWait(d,15).until(lambda x:'eng.html' in (x.find_element(By.ID,'frame').get_attribute('src') or ''))
    d.switch_to.frame(d.find_element(By.ID,'frame'))
    WebDriverWait(d,15).until(lambda x:x.find_element(By.ID,'syncBtn').is_displayed())
    d.execute_script("""
      window.__engQaLastToast='';window.__engQaRunningSeen=false;window.__engQaSyncDisabledSeen=false;
      const tb=document.getElementById('toastbox'); if(tb)new MutationObserver(()=>{const xs=tb.querySelectorAll('.toast');if(xs.length)window.__engQaLastToast=xs[xs.length-1].textContent||''}).observe(tb,{childList:true,subtree:true});
      const jb=document.getElementById('jobsBody'); if(jb)new MutationObserver(()=>{if([...(jb.querySelectorAll('.state'))].some(x=>x.textContent==='RUNNING'))window.__engQaRunningSeen=true}).observe(jb,{childList:true,subtree:true,characterData:true});
      const sb=document.getElementById('syncBtn'); if(sb)new MutationObserver(()=>{if(sb.disabled)window.__engQaSyncDisabledSeen=true}).observe(sb,{attributes:true,attributeFilter:['disabled']});
    """)

def click(d,e,pause=.12):
    d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",e); time.sleep(.05); e.click(); time.sleep(pause)

def last_toast(d): return d.execute_script("return window.__engQaLastToast||''") or ''
def set_select(d,id,val): Select(d.find_element(By.ID,id)).select_by_visible_text(val); time.sleep(.08)
def chip_by_text(d,text): return next(x for x in d.find_elements(By.CSS_SELECTOR,'.sceneTools .chip') if text in x.text.upper())
def toggle_roundtrip(d,el):
    before='on' in el.get_attribute('class'); click(d,el); assert ('on' in el.get_attribute('class')) != before; click(d,el); assert ('on' in el.get_attribute('class')) == before

def main():
    for f in glob.glob(DL+'/*'):
        try: os.remove(f)
        except: pass
    d=driver(); passed=[]
    def ok(x): passed.append(x); print('PASS',x,flush=True)
    try:
        d.get(BASE); wait_frame(d)

        set_select(d,'assetSelect','SUPERVIEW NEO-1')
        WebDriverWait(d,2).until(lambda x:x.find_element(By.ID,'assetMetric').text=='SUPERVIEW NEO-1')
        assert Select(d.find_element(By.ID,'assetSelect')).first_selected_option.text=='SUPERVIEW NEO-1'; ok('ENG-F01')

        for kind in ('orbit','nav','gnc'):
            tab=d.find_element(By.CSS_SELECTOR,f'.tab[data-tab="{kind}"]'); click(d,tab); assert 'on' in tab.get_attribute('class')
            engines=d.find_elements(By.CSS_SELECTOR,'.engine')
            for e in engines:
                visible=e.is_displayed(); should=e.get_attribute('data-kind')==kind
                assert visible==should
        click(d,d.find_element(By.CSS_SELECTOR,'.tab[data-tab="orbit"]')); ok('ENG-F02')

        toggle_roundtrip(d,chip_by_text(d,'ORBITS')); ok('ENG-F03')
        toggle_roundtrip(d,chip_by_text(d,'VECTORS')); ok('ENG-F04')
        toggle_roundtrip(d,chip_by_text(d,'BODY')); ok('ENG-F05')
        toggle_roundtrip(d,chip_by_text(d,'COVARIANCE')); ok('ENG-F06')

        d.execute_script('window.__engQaRunningSeen=false'); click(d,d.find_element(By.CSS_SELECTOR,'[data-action="propagate"]'))
        WebDriverWait(d,3).until(lambda x: bool(x.execute_script('return window.__engQaRunningSeen===true')))
        WebDriverWait(d,3).until(lambda x:'COMPLETE' in x.find_element(By.ID,'jobsBody').text); ok('ENG-F07')

        d.execute_script('window.__engQaRunningSeen=false'); click(d,d.find_element(By.CSS_SELECTOR,'[data-action="compare"]'))
        WebDriverWait(d,3).until(lambda x:bool(x.execute_script('return window.__engQaRunningSeen===true')))
        assert 'Compare' in d.find_element(By.ID,'jobsBody').text or 'Comparison' in d.find_element(By.ID,'jobsBody').text; ok('ENG-F08')

        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="maneuver"]')); assert 'Maneuver Evaluation' in d.find_element(By.ID,'jobsBody').text; ok('ENG-F09')
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="slew"]')); assert 'ADCS Slew' in d.find_element(By.ID,'jobsBody').text; ok('ENG-F10')
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="ekf"]')); assert d.find_element(By.ID,'roll').text=='0.00°' and 'Estimator Reset' in d.find_element(By.ID,'jobsBody').text; ok('ENG-F11')

        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="pod"]')); assert 'Precision POD' in d.find_element(By.ID,'jobsBody').text and 'BLOCKED' in d.find_element(By.ID,'jobsBody').text and 'connector required' in last_toast(d).lower(); ok('ENG-F12')

        click(d,d.find_element(By.ID,'caseBtn')); dur=d.find_element(By.ID,'duration'); dur.clear(); dur.send_keys('0'); click(d,d.find_element(By.ID,'runCase'))
        assert 'open' in d.find_element(By.ID,'caseDrawer').get_attribute('class') and 'between 1 and 168' in last_toast(d); click(d,d.find_element(By.CSS_SELECTOR,'#caseDrawer [data-close]')); ok('ENG-F13')

        click(d,d.find_element(By.ID,'caseBtn')); set_select(d,'analysisType','Orbit Propagation'); set_select(d,'asset','SY-01')
        frame_sel=Select(d.find_element(By.ID,'frame')); assert frame_sel.options
        chosen_frame=frame_sel.options[-1].text.strip(); frame_sel.select_by_visible_text(chosen_frame)
        dur=d.find_element(By.ID,'duration'); dur.clear(); dur.send_keys('36'); click(d,d.find_element(By.ID,'runCase'))
        assert d.find_element(By.ID,'assetMetric').text=='SY-01' and d.find_element(By.ID,'validityMetric').text=='36 h' and d.find_element(By.ID,'frameValue').text==chosen_frame; ok('ENG-F14')

        for f in glob.glob(DL+'/*'): os.remove(f)
        click(d,d.find_element(By.CSS_SELECTOR,'[data-action="export"]'))
        WebDriverWait(d,4).until(lambda _ : len(glob.glob(DL+'/*.json'))>0); fp=glob.glob(DL+'/*.json')[0]
        with open(fp,encoding='utf-8') as h: payload=json.load(h)
        assert payload['mode']=='SIMULATED' and payload['operational'] is False and payload['asset']=='SY-01'; ok('ENG-F15')

        d.execute_script('window.__engQaSyncDisabledSeen=false'); sync=d.find_element(By.ID,'syncBtn'); click(d,sync,.05)
        assert bool(d.execute_script('return window.__engQaSyncDisabledSeen===true')) and d.find_element(By.ID,'ageMetric').text.startswith('00')
        WebDriverWait(d,2).until(lambda x:x.find_element(By.ID,'syncBtn').is_enabled()); assert 'age reset' in last_toast(d).lower(); ok('ENG-F16')

        set_select(d,'assetSelect','SUPERVIEW NEO-1')
        before=d.execute_script('return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__?.selectedId||""'); pov_before=d.execute_script('return JSON.stringify(window.parent.__SPACEOPS_SHARED_GLOBE_STATE__?.pov||{})')
        click(d,d.find_element(By.ID,'focusAsset'))
        WebDriverWait(d,3).until(lambda x:x.execute_script('return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__?.selectedId||""')=='SUPERVIEW NEO-1')
        after=d.execute_script('return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__?.selectedId||""'); pov_after=d.execute_script('return JSON.stringify(window.parent.__SPACEOPS_SHARED_GLOBE_STATE__?.pov||{})')
        assert after=='SUPERVIEW NEO-1' and after!=before and pov_after!=pov_before and 'Focused SUPERVIEW NEO-1' in last_toast(d); ok('ENG-F17')

        ev=d.find_element(By.CSS_SELECTOR,'.event[data-event]'); expected=ev.get_attribute('data-event'); click(d,ev); assert expected in last_toast(d); ok('ENG-F18')

        d.switch_to.default_content(); click(d,d.find_element(By.ID,'missionBtn')); m=d.find_element(By.ID,'missionId'); m.clear(); m.send_keys('QA-ENG-001'); a=d.find_element(By.ID,'missionAoi'); a.clear(); a.send_keys('SG-PORT-04'); click(d,d.find_element(By.ID,'saveContext')); time.sleep(.35); d.switch_to.frame(d.find_element(By.ID,'frame'))
        ctx=d.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]').text; assert 'QA-ENG-001' in ctx and 'SG-PORT-04' in ctx; ok('ENG-F19')

        controls=[d.find_element(By.ID,'syncBtn'),d.find_element(By.ID,'caseBtn'),d.find_element(By.ID,'focusAsset'),d.find_element(By.CSS_SELECTOR,'[data-action="propagate"]'),d.find_element(By.CSS_SELECTOR,'.tab[data-tab="orbit"]')]
        for el in controls:
            assert el.is_displayed(); d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",el); time.sleep(.04)
            hit=d.execute_script("const r=arguments[0].getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);return x>=0&&y>=0&&x<innerWidth&&y<innerHeight&&(h===arguments[0]||arguments[0].contains(h)||h?.contains(arguments[0]));",el); assert hit
        ok('ENG-F20')

        print('ENG QA PASS',len(passed),'controls:',','.join(passed),flush=True); assert passed==[f'ENG-F{i:02d}' for i in range(1,21)]
    finally:
        d.quit()

if __name__=='__main__': main()
