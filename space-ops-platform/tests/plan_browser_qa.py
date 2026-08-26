from __future__ import annotations
import json, tempfile, time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#plan'

def wait_js(d,s,t=30): return WebDriverWait(d,t).until(lambda x:x.execute_script(s))
def click(d,e,p=.22):
    d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",e); time.sleep(.06); e.click(); time.sleep(p)
def on(e): return 'on' in (e.get_attribute('class') or '').split()
def visible_plans(d): return [e.get_attribute('data-plan') for e in d.find_elements(By.CSS_SELECTOR,'.planCard') if e.is_displayed()]
def setval(d,eid,val): d.execute_script("const e=document.getElementById(arguments[0]);e.value=arguments[1];e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));",eid,str(val))
def last_toast(d):
    x=d.find_elements(By.CSS_SELECTOR,'.toast'); return x[-1].text if x else ''

def main():
    o=Options(); o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--window-size=1600,1000'); o.add_argument('--ignore-certificate-errors')
    d=webdriver.Chrome(options=o); passed=[]
    def ok(fid): passed.append(fid); print('PASS',fid,flush=True)
    try:
        d.get(BASE); WebDriverWait(d,25).until(EC.frame_to_be_available_and_switch_to_it((By.ID,'frame')))
        wait_js(d,"return document.readyState==='complete'"); wait_js(d,"return !!window.__spaceopsGlobeApi && !!document.querySelector('.spaceopsSharedGlobeHost canvas')",40)
        wait_js(d,"return document.documentElement.dataset.spaceopsPlanRuntime==='1'")

        with tempfile.NamedTemporaryFile('w',suffix='.json',delete=False) as f:
            json.dump({'objective':'QA imported objective','aoi':'QA-AOI','priority':'Critical'},f); good=f.name
        d.find_element(By.ID,'importFile').send_keys(str(Path(good).resolve())); time.sleep(.35)
        assert d.find_element(By.ID,'objective').get_attribute('value')=='QA imported objective'
        assert d.find_element(By.ID,'aoi').get_attribute('value')=='QA-AOI'; ok('PLAN-F01')

        with tempfile.NamedTemporaryFile('w',suffix='.json',delete=False) as f:
            f.write('{bad json'); bad=f.name
        d.find_element(By.ID,'importFile').send_keys(str(Path(bad).resolve())); time.sleep(.3)
        assert 'Import failed' in last_toast(d); ok('PLAN-F02')

        click(d,d.find_element(By.ID,'newMissionBtn')); assert 'open' in d.find_element(By.ID,'missionDrawer').get_attribute('class')
        obj=d.find_element(By.ID,'drawerObjective'); obj.clear(); obj.send_keys('QA created objective')
        ao=d.find_element(By.ID,'drawerAoi'); ao.clear(); ao.send_keys('SG-PORT-04')
        before=int(d.find_element(By.ID,'mObjectives').text); click(d,d.find_element(By.ID,'createMission'))
        assert d.find_element(By.ID,'objective').get_attribute('value')=='QA created objective'; assert int(d.find_element(By.ID,'mObjectives').text)==before+1; ok('PLAN-F03')

        old=d.find_element(By.ID,'objective').get_attribute('value'); setval(d,'objective',''); click(d,d.find_element(By.ID,'validateBtn'))
        assert 'bad' in d.find_element(By.ID,'validation').get_attribute('class') and 'Objective is required' in d.find_element(By.ID,'validation').text; ok('PLAN-F04')
        setval(d,'objective',old); setval(d,'aoi','SG-PORT-04')

        click(d,d.find_element(By.ID,'syncBtn')); click(d,d.find_element(By.ID,'validateBtn'))
        assert 'ok' in d.find_element(By.ID,'validation').get_attribute('class') and d.find_element(By.ID,'planMode').text.startswith('VALIDATED'); ok('PLAN-F05')

        setval(d,'cloud',20); setval(d,'elev',15); setval(d,'battery',35)
        for eid,want in [('opticalOnly',True),('partnerGround',True),('preemption',False)]:
            e=d.find_element(By.ID,eid)
            if on(e)!=want: click(d,e)
        click(d,d.find_element(By.ID,'generateBtn')); base=visible_plans(d); assert base==['A','B']; ok('PLAN-F13')

        click(d,d.find_element(By.ID,'opticalOnly')); click(d,d.find_element(By.ID,'generateBtn')); assert 'C' in visible_plans(d); ok('PLAN-F06')
        click(d,d.find_element(By.ID,'opticalOnly'))

        setval(d,'cloud',10); click(d,d.find_element(By.ID,'generateBtn')); assert 'A' not in visible_plans(d) and 'B' in visible_plans(d); ok('PLAN-F07'); setval(d,'cloud',20)
        setval(d,'elev',30); click(d,d.find_element(By.ID,'generateBtn')); assert 'B' not in visible_plans(d); ok('PLAN-F08'); setval(d,'elev',15)
        setval(d,'battery',50); click(d,d.find_element(By.ID,'generateBtn')); assert 'B' not in visible_plans(d); ok('PLAN-F09'); setval(d,'battery',35)
        click(d,d.find_element(By.ID,'partnerGround')); click(d,d.find_element(By.ID,'generateBtn')); assert 'B' not in visible_plans(d); ok('PLAN-F10'); click(d,d.find_element(By.ID,'partnerGround'))
        click(d,d.find_element(By.ID,'preemption')); click(d,d.find_element(By.ID,'generateBtn')); assert 'D' in visible_plans(d); ok('PLAN-F11'); click(d,d.find_element(By.ID,'preemption'))

        strat=d.find_element(By.ID,'strategy'); d.execute_script("arguments[0].value='cloud';arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",strat)
        click(d,d.find_element(By.ID,'generateBtn')); order=[x.get_attribute('data-plan') for x in d.find_elements(By.CSS_SELECTOR,'.planCard')]; assert order[0]=='C'; ok('PLAN-F12')
        d.execute_script("arguments[0].value='best';arguments[0].dispatchEvent(new Event('change',{bubbles:true}));",strat)

        setval(d,'battery',70); click(d,d.find_element(By.ID,'generateBtn')); assert not visible_plans(d); assert d.find_element(By.ID,'scheduleLabel').text=='NO FEASIBLE PLAN'; ok('PLAN-F14'); setval(d,'battery',35)
        click(d,d.find_element(By.ID,'generateBtn'))

        b=d.find_element(By.CSS_SELECTOR,'.planCard[data-plan="B"]'); click(d,b); assert 'PLAN B' in d.find_element(By.ID,'scheduleLabel').text and d.find_element(By.ID,'scheduleBody').text.strip(); ok('PLAN-F15')

        for key in ['weather','resources','contacts','opportunities']:
            e=d.find_element(By.CSS_SELECTOR,f'[data-view="{key}"]'); click(d,e); assert on(e); assert key.upper() in d.find_element(By.ID,'viewNote').text.upper()
        ok('PLAN-F16')

        before=int(d.find_element(By.ID,'mConflicts').text); click(d,d.find_element(By.CSS_SELECTOR,'[data-resolve]')); assert int(d.find_element(By.ID,'mConflicts').text)==before-1; ok('PLAN-F17')

        setval(d,'cloud',19); click(d,d.find_element(By.ID,'commitBtn')); assert 'Generate plans' in last_toast(d); ok('PLAN-F18')
        click(d,d.find_element(By.ID,'generateBtn')); click(d,d.find_element(By.ID,'commitBtn')); t=last_toast(d); assert 'accepted' in t and 'NO COMMAND TRANSMITTED' in t; ok('PLAN-F19')

        click(d,d.find_element(By.ID,'syncBtn')); s1=d.find_element(By.ID,'start').get_attribute('value'); assert s1 and d.find_element(By.ID,'planMode').text=='VALIDATION REQUIRED'; ok('PLAN-F20')

        # Approved visual correction: old floating bars are hidden; three curved SVG windows are bound to orbital geometry layer.
        legacy=d.find_elements(By.CSS_SELECTOR,'.windowSeg'); assert legacy and all(not x.is_displayed() for x in legacy)
        svg=d.find_element(By.ID,'spaceopsPlanOpportunityWindows'); assert svg.get_attribute('data-orbit-attached')=='1'
        paths=d.find_elements(By.CSS_SELECTOR,'#spaceopsPlanOpportunityWindows path[data-opportunity-window]'); assert len(paths)==3
        assert all('C' in (p.get_attribute('d') or '') for p in paths); ok('PLAN-F21')

        prof=lambda: d.execute_script('return window.__spaceopsGlobeApi.refreshLayers(true)')
        orbit=next(x for x in d.find_elements(By.CSS_SELECTOR,'[data-layer]') if x.text.strip().upper()=='ORBITS'); p0=bool(prof().get('orbits')); click(d,orbit); assert bool(prof().get('orbits'))!=p0; click(d,orbit)
        a0=float(d.execute_script('return window.__spaceopsGlobeApi.pointOfView().altitude')); d.execute_script("window.__spaceopsGlobeApi.zoomBy(-0.18)"); time.sleep(.2); assert float(d.execute_script('return window.__spaceopsGlobeApi.pointOfView().altitude'))<a0; d.execute_script("window.__spaceopsGlobeApi.resetView()"); ok('PLAN-F22')

        d.switch_to.default_content(); click(d,d.find_element(By.ID,'missionBtn')); m=d.find_element(By.ID,'missionId'); m.clear(); m.send_keys('QA-PLAN-001'); a=d.find_element(By.ID,'missionAoi'); a.clear(); a.send_keys('Singapore PLAN QA'); click(d,d.find_element(By.ID,'saveContext')); time.sleep(.35); d.switch_to.frame(d.find_element(By.ID,'frame'))
        ctx=d.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]').text; assert 'QA-PLAN-001' in ctx and 'Singapore PLAN QA' in ctx; ok('PLAN-F23')

        for eid in ['validateBtn','generateBtn','commitBtn','syncBtn','newMissionBtn']:
            e=d.find_element(By.ID,eid); assert e.is_displayed() and e.is_enabled(); r=d.execute_script("const r=arguments[0].getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return h===arguments[0]||arguments[0].contains(h);",e); assert r,eid
        ok('PLAN-F24')
        print('PLAN QA PASS',len(passed),'controls:',','.join(passed))
    finally: d.quit()

if __name__=='__main__': main()
