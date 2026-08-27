from __future__ import annotations
import json, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#earth'

def wait_js(d,s,t=35): return WebDriverWait(d,t).until(lambda x:x.execute_script(s))
def click(d,e,p=.15):
    d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",e); time.sleep(.05); e.click(); time.sleep(p)
def set_select(d,eid,value):
    s=Select(d.find_element(By.ID,eid))
    try: s.select_by_value(value)
    except NoSuchElementException: s.select_by_visible_text(value)
    time.sleep(.15)
def visible_items(d): return [x.get_attribute('data-id') for x in d.find_elements(By.CSS_SELECTOR,'#catalog .item') if x.is_displayed()]
def last_toast(d):
    xs=d.find_elements(By.CSS_SELECTOR,'.toast')
    return xs[-1].text if xs else (d.execute_script("return window.__earthQaLastToast||''") or '')
def active_step(d):
    xs=d.find_elements(By.CSS_SELECTOR,'#steps .step'); return next((int(x.get_attribute('data-step')) for x in xs if 'active' in (x.get_attribute('class') or '').split()),-1)
def job_stage(d,row): return row.find_element(By.CSS_SELECTOR,'.state').text.strip()

def main():
    o=Options(); o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--window-size=1600,1000'); o.add_argument('--ignore-certificate-errors')
    d=webdriver.Chrome(options=o); passed=[]
    def ok(fid): passed.append(fid); print('PASS',fid,flush=True)
    try:
        d.get(BASE); WebDriverWait(d,25).until(EC.frame_to_be_available_and_switch_to_it((By.ID,'frame')))
        wait_js(d,"return document.readyState==='complete'"); wait_js(d,"return !!document.querySelector('#catalog .item')",30)
        wait_js(d,"return document.documentElement.dataset.spaceopsSpecialistRuntime==='1'",30)
        wait_js(d,"return !!window.__spaceopsGlobeApi",30)
        d.execute_script("""
          window.__earthQaLastToast='';
          const root=document.getElementById('toasts');
          if(root && !window.__earthQaToastObserver){
            window.__earthQaToastObserver=new MutationObserver(ms=>{
              for(const m of ms) for(const n of m.addedNodes){
                if(n.nodeType===1 && n.classList && n.classList.contains('toast')) window.__earthQaLastToast=n.textContent||'';
              }
            });
            window.__earthQaToastObserver.observe(root,{childList:true});
          }
          window.__earthQaSyncDisabledSeen=false;
          const sync=document.getElementById('syncBtn');
          if(sync && !window.__earthQaSyncObserver){
            window.__earthQaSyncObserver=new MutationObserver(()=>{
              if(sync.disabled) window.__earthQaSyncDisabledSeen=true;
            });
            window.__earthQaSyncObserver.observe(sync,{attributes:true,attributeFilter:['disabled']});
          }
        """)
        assert set(visible_items(d))=={'eo-gf7','eo-neo','eo-sar'}
        click(d,d.find_element(By.CSS_SELECTOR,'.tab[data-tab="weather"]')); assert visible_items(d)==['wx-context']
        click(d,d.find_element(By.CSS_SELECTOR,'.tab[data-tab="ais"]')); assert set(visible_items(d))=={'ais-context','ais-dark'}
        click(d,d.find_element(By.CSS_SELECTOR,'.tab[data-tab="eo"]')); ok('EARTH-F01')
        set_select(d,'mode','SIMULATED'); assert set(visible_items(d))=={'eo-gf7','eo-neo','eo-sar'}
        set_select(d,'mode','CONNECTOR_REQUIRED'); assert visible_items(d)==[] and d.find_element(By.ID,'sourceEmpty').is_displayed()
        set_select(d,'mode','All modes'); ok('EARTH-F02')
        click(d,d.find_element(By.CSS_SELECTOR,'.item[data-id="eo-sar"]'))
        assert 'SAR-01' in d.find_element(By.ID,'selectedTitle').text and 'SAR' in d.find_element(By.ID,'selectedStats').text
        click(d,d.find_element(By.ID,'inspectBtn')); assert 'open' in d.find_element(By.ID,'drawer').get_attribute('class') and 'SAR-01' in d.find_element(By.ID,'drawerBody').text
        click(d,d.find_element(By.ID,'closeDrawer')); ok('EARTH-F03')
        for fid,layer,profile_key in [('EARTH-F04','eo','aoi'),('EARTH-F05','wx','weather'),('EARTH-F06','ais','ships')]:
            b=d.find_element(By.CSS_SELECTOR,f'[data-layer="{layer}"]')
            assert 'on' in b.get_attribute('class').split()
            p=d.execute_script("return window.__spaceopsGlobeApi.refreshLayers(true)"); assert bool(p[profile_key])
            click(d,b); assert 'on' not in b.get_attribute('class').split()
            p=d.execute_script("return window.__spaceopsGlobeApi.refreshLayers(true)"); assert not bool(p[profile_key])
            click(d,b); assert 'on' in b.get_attribute('class').split()
            p=d.execute_script("return window.__spaceopsGlobeApi.refreshLayers(true)"); assert bool(p[profile_key]); ok(fid)
        q=d.find_element(By.ID,'query'); left0=d.find_element(By.ID,'fallbackAoi').value_of_css_property('left')
        set_select(d,'query','SG-TUAS-02'); d.execute_script("arguments[0].dispatchEvent(new Event('change',{bubbles:true}))",q); time.sleep(.15)
        assert 'SG-TUAS-02' in d.find_element(By.ID,'viewStatus').text and d.find_element(By.ID,'fallbackAoi').value_of_css_property('left')!=left0; ok('EARTH-F07')
        d.execute_script("const s=arguments[0];const o=document.createElement('option');o.value='UNSUPPORTED';o.textContent='UNSUPPORTED';s.appendChild(o);s.value='UNSUPPORTED';s.dispatchEvent(new Event('change',{bubbles:true}));",q); time.sleep(.15)
        assert 'SG-PORT-04' in d.find_element(By.ID,'viewStatus').text and 'Singapore Strait' in d.find_element(By.ID,'viewStatus').text; ok('EARTH-F08')
        set_select(d,'query','SG-PORT-04'); d.execute_script("arguments[0].dispatchEvent(new Event('change',{bubbles:true}))",q)
        click(d,d.find_element(By.ID,'compareBtn')); assert 'compare' in d.find_element(By.ID,'scene').get_attribute('class').split()
        ov=d.find_element(By.CSS_SELECTOR,'.compareOverlay'); assert ov.is_displayed() and 'NOT CONNECTED' in ov.text and 'NOT COMPUTED' in ov.text
        click(d,d.find_element(By.ID,'compareBtn')); assert 'compare' not in d.find_element(By.ID,'scene').get_attribute('class').split(); ok('EARTH-F09')
        click(d,d.find_element(By.ID,'fuseBtn')); assert active_step(d)==2; ok('EARTH-F10')
        before=len(d.find_elements(By.CSS_SELECTOR,'#jobs tr')); click(d,d.find_element(By.ID,'runBtn'))
        rows=d.find_elements(By.CSS_SELECTOR,'#jobs tr'); assert len(rows)==before+1 and job_stage(d,rows[0])=='PROCESSING' and active_step(d)==2; ok('EARTH-F11')
        row=rows[0]; click(d,row.find_element(By.CSS_SELECTOR,'.advanceJob')); row=d.find_elements(By.CSS_SELECTOR,'#jobs tr')[0]
        assert job_stage(d,row)=='QC REVIEW' and active_step(d)==3; ok('EARTH-F12')
        click(d,row.find_element(By.CSS_SELECTOR,'.advanceJob')); row=d.find_elements(By.CSS_SELECTOR,'#jobs tr')[0]
        assert job_stage(d,row)=='PACKAGE READY' and active_step(d)==4; ok('EARTH-F13')
        click(d,row.find_element(By.CSS_SELECTOR,'.advanceJob')); row=d.find_elements(By.CSS_SELECTOR,'#jobs tr')[0]
        assert job_stage(d,row)=='PACKAGE COMPLETE' and row.find_elements(By.CSS_SELECTOR,'.advanceJob')==[]; ok('EARTH-F14')
        assert job_stage(d,row)=='PACKAGE COMPLETE' and 'DELIVERED' not in row.text.upper(); ok('EARTH-F15')
        d.execute_script("localStorage.removeItem('spaceops-earth-recipe')"); click(d,d.find_element(By.ID,'saveBtn'))
        recipe=json.loads(d.execute_script("return localStorage.getItem('spaceops-earth-recipe')")); assert recipe['mode']=='SIMULATED' and recipe['aoi']=='SG-PORT-04' and 'saved locally' in last_toast(d).lower(); ok('EARTH-F16')
        before=len(d.find_elements(By.CSS_SELECTOR,'#jobs tr')); click(d,d.find_element(By.ID,'productBtn')); assert 'open' in d.find_element(By.ID,'drawer').get_attribute('class')
        set_select(d,'productAoi','SG-PSA-W-01'); click(d,d.find_element(By.ID,'createProduct')); assert 'open' not in d.find_element(By.ID,'drawer').get_attribute('class')
        assert len(d.find_elements(By.CSS_SELECTOR,'#jobs tr'))==before+1 and 'SG-PSA-W-01' in d.find_elements(By.CSS_SELECTOR,'#jobs tr')[0].text; ok('EARTH-F17')
        click(d,d.find_element(By.CSS_SELECTOR,'.tab[data-tab="ais"]')); set_select(d,'mode','CONNECTOR_REQUIRED'); assert visible_items(d)==['ais-dark']
        click(d,d.find_element(By.CSS_SELECTOR,'.item[data-id="ais-dark"]')); assert d.find_element(By.ID,'processBtn').get_attribute('disabled') is not None
        assert 'BLOCKED' in d.find_element(By.ID,'selectedStats').text and 'CONNECTOR REQUIRED' in d.find_element(By.CSS_SELECTOR,'.item[data-id="ais-dark"]').text; ok('EARTH-F18')
        set_select(d,'mode','All modes')
        before=int(d.find_element(By.ID,'exceptionCount').text.split()[0]); ack=d.find_element(By.CSS_SELECTOR,'[data-ack] .ackBtn'); click(d,ack)
        assert ack.text=='ACKED' and ack.get_attribute('disabled') is not None and int(d.find_element(By.ID,'exceptionCount').text.split()[0])==before-1; ok('EARTH-F19')
        click(d,d.find_element(By.ID,'fuseBtn')); assert active_step(d)==2
        d.execute_script("window.__earthQaSyncDisabledSeen=false")
        sync=d.find_element(By.ID,'syncBtn'); click(d,sync,.05)
        assert bool(d.execute_script("return window.__earthQaSyncDisabledSeen===true")) and sync.is_enabled()
        assert active_step(d)==1 and 'scenario reset' in last_toast(d).lower(); ok('EARTH-F20')
        d.switch_to.default_content(); click(d,d.find_element(By.ID,'missionBtn')); m=d.find_element(By.ID,'missionId'); m.clear(); m.send_keys('QA-EARTH-001'); a=d.find_element(By.ID,'missionAoi'); a.clear(); a.send_keys('SG-TUAS-02'); click(d,d.find_element(By.ID,'saveContext')); time.sleep(.35); d.switch_to.frame(d.find_element(By.ID,'frame'))
        ctx=d.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]').text; assert 'QA-EARTH-001' in ctx and 'SG-TUAS-02' in ctx and 'SG-TUAS-02' in d.find_element(By.ID,'viewStatus').text; ok('EARTH-F21')
        controls=[d.find_element(By.ID,'syncBtn'),d.find_element(By.ID,'productBtn'),d.find_element(By.ID,'compareBtn'),d.find_element(By.ID,'fuseBtn'),d.find_element(By.ID,'runBtn'),d.find_element(By.CSS_SELECTOR,'.tab[data-tab="eo"]')]
        for el in controls:
            assert el.is_displayed(); d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",el); time.sleep(.04)
            hit=d.execute_script("const r=arguments[0].getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return x>=0&&y>=0&&x<innerWidth&&y<innerHeight&&(h===arguments[0]||arguments[0].contains(h)||h.contains(arguments[0]));",el); assert hit
        ok('EARTH-F22')
        print('EARTH QA PASS',len(passed),'controls:',','.join(passed),flush=True); assert len(passed)==22
    finally:
        d.quit()

if __name__=='__main__': main()
