from __future__ import annotations
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#ground'

def wait_js(d,s,t=35): return WebDriverWait(d,t).until(lambda x:x.execute_script(s))
def click(d,e,p=.18):
    d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",e); time.sleep(.05); e.click(); time.sleep(p)
def on(e): return 'on' in (e.get_attribute('class') or '').split()
def set_select(d,eid,text):
    s=Select(d.find_element(By.ID,eid))
    try: s.select_by_visible_text(text)
    except NoSuchElementException: s.select_by_value(text)
    time.sleep(.15)
def set_input(d,eid,text):
    e=d.find_element(By.ID,eid); e.clear(); e.send_keys(text); time.sleep(.15)
def first_resource(d):
    xs=d.find_elements(By.CSS_SELECTOR,'#resourceList .resource'); return xs[0].get_attribute('data-id') if xs else ''
def visible_resources(d): return [x.get_attribute('data-id') for x in d.find_elements(By.CSS_SELECTOR,'#resourceList .resource') if x.is_displayed()]
def last_toast(d):
    xs=d.find_elements(By.CSS_SELECTOR,'.toast'); return xs[-1].text if xs else ''
def profile(d): return d.execute_script('return window.__spaceopsGlobeApi.refreshLayers(true)')

def main():
    o=Options(); o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--window-size=1600,1000'); o.add_argument('--ignore-certificate-errors')
    d=webdriver.Chrome(options=o); passed=[]
    def ok(fid): passed.append(fid); print('PASS',fid,flush=True)
    try:
        d.get(BASE); WebDriverWait(d,25).until(EC.frame_to_be_available_and_switch_to_it((By.ID,'frame')))
        wait_js(d,"return document.readyState==='complete'"); wait_js(d,"return !!window.__spaceopsGlobeApi && !!document.querySelector('.spaceopsSharedGlobeHost canvas')",45)
        wait_js(d,"return document.documentElement.dataset.spaceopsSpecialistRuntime==='1'")

        # F01 resource class/search filters
        set_select(d,'typeFilter','Own'); assert len(visible_resources(d))==2
        set_input(d,'searchBox','13.5'); assert visible_resources(d)==['GS-SE-01-A2']
        set_input(d,'searchBox',''); set_select(d,'typeFilter','All classes'); assert len(visible_resources(d))==5; ok('GROUND-F01')

        # F02 band filters
        set_select(d,'bandFilter','Ka'); assert set(visible_resources(d))=={'GS-SG-02-A1','GS-IN-04-A1'}
        set_select(d,'bandFilter','All bands'); assert len(visible_resources(d))==5; ok('GROUND-F02')

        # F03 sort controls visibly change ordering
        set_select(d,'sortFilter','available'); assert first_resource(d)=='GS-SG-02-A1'
        set_select(d,'sortFilter','util'); assert first_resource(d)=='EXT-AU-01'
        set_select(d,'sortFilter','name'); assert first_resource(d)=='EXT-AU-01'; set_select(d,'sortFilter','available'); ok('GROUND-F03')

        # F04 resource selection selects associated contact/access
        r=d.find_element(By.CSS_SELECTOR,'.resource[data-id="GS-IN-04-A1"]'); click(d,r)
        assert 'active' in d.find_element(By.CSS_SELECTOR,'.resource[data-id="GS-IN-04-A1"]').get_attribute('class')
        assert 'SAR-01' in d.find_element(By.ID,'accessTitle').text and '04' in d.find_element(By.ID,'accessTitle').text; ok('GROUND-F04')

        # F05 queue contact selection updates Selected Access
        click(d,d.find_element(By.CSS_SELECTOR,'.contact[data-contact="c2"]'))
        assert 'GF-7 02' in d.find_element(By.ID,'accessTitle').text and '02' in d.find_element(By.ID,'accessTitle').text; ok('GROUND-F05')

        # F06 timeline block selection is active and updates selection
        click(d,d.find_element(By.CSS_SELECTOR,'.block[data-contact="c3"]'))
        assert 'active' in d.find_element(By.CSS_SELECTOR,'.block[data-contact="c3"]').get_attribute('class')
        assert 'SAR-01' in d.find_element(By.ID,'accessTitle').text; ok('GROUND-F06')

        # F07-F10 scene layers must affect the actual shared globe profile
        access=d.find_element(By.CSS_SELECTOR,'[data-layer="access"]'); p0=bool(profile(d).get('links')); click(d,access); assert bool(profile(d).get('links'))!=p0; click(d,access); assert bool(profile(d).get('links'))==p0; ok('GROUND-F07')
        stations=d.find_element(By.CSS_SELECTOR,'[data-layer="stations"]'); p0=bool(profile(d).get('ground')); click(d,stations); assert bool(profile(d).get('ground'))!=p0; click(d,stations); ok('GROUND-F08')
        fp=d.find_element(By.CSS_SELECTOR,'[data-layer="footprint"]'); p0=bool(profile(d).get('footprint')); click(d,fp); assert bool(profile(d).get('footprint'))!=p0; click(d,fp); ok('GROUND-F09')
        wx=d.find_element(By.CSS_SELECTOR,'[data-layer="weather"]'); p0=bool(profile(d).get('weather')); click(d,wx); assert bool(profile(d).get('weather'))!=p0; click(d,wx); ok('GROUND-F10')

        # F11 managed reserve drawer
        click(d,d.find_element(By.CSS_SELECTOR,'.contact[data-contact="c1"]')); click(d,d.find_element(By.ID,'reserveBtn'))
        assert 'open' in d.find_element(By.ID,'drawer').get_attribute('class') and 'Reserve Contact' in d.find_element(By.ID,'drawerTitle').text; ok('GROUND-F11')

        # F12 reservation lifecycle + counters/table
        before_rows=len(d.find_elements(By.CSS_SELECTOR,'#reservationBody tr')); before_confirm=int(d.find_element(By.ID,'confirmedMetric').text)
        click(d,d.find_element(By.ID,'confirmReserve')); assert 'open' not in d.find_element(By.ID,'drawer').get_attribute('class')
        c1=d.find_element(By.CSS_SELECTOR,'.contact[data-contact="c1"]'); assert 'RESERVED' in c1.text
        assert len(d.find_elements(By.CSS_SELECTOR,'#reservationBody tr'))==before_rows+1 and int(d.find_element(By.ID,'confirmedMetric').text)==before_confirm+1; ok('GROUND-F12')

        # F13 repeat reservation is blocked/handled
        assert not d.find_element(By.CSS_SELECTOR,'.reserve[data-contact="c1"]').is_enabled(); click(d,d.find_element(By.ID,'reserveBtn'))
        assert 'RESERVED' in last_toast(d) and 'open' not in d.find_element(By.ID,'drawer').get_attribute('class'); ok('GROUND-F13')

        # F14 external quote flow
        click(d,d.find_element(By.CSS_SELECTOR,'.contact[data-contact="c4"]')); click(d,d.find_element(By.ID,'reserveBtn'))
        assert 'open' in d.find_element(By.ID,'drawer').get_attribute('class') and 'External Provider Quote' in d.find_element(By.ID,'drawerTitle').text; ok('GROUND-F14')

        # F15 quote lifecycle + automatic exception resolution
        before_conf=int(d.find_element(By.ID,'conflictMetric').text); click(d,d.find_element(By.ID,'confirmReserve'))
        c4=d.find_element(By.CSS_SELECTOR,'.contact[data-contact="c4"]'); assert 'QUOTE REQUESTED' in c4.text
        assert int(d.find_element(By.ID,'conflictMetric').text)==before_conf-1 and 'resolved' in d.find_element(By.CSS_SELECTOR,'[data-exception="quote"]').get_attribute('class'); ok('GROUND-F15')

        # F16 repeat quote blocked/handled
        assert not d.find_element(By.CSS_SELECTOR,'.reserve[data-contact="c4"]').is_enabled(); click(d,d.find_element(By.ID,'reserveBtn'))
        assert 'QUOTE REQUESTED' in last_toast(d) and 'open' not in d.find_element(By.ID,'drawer').get_attribute('class'); ok('GROUND-F16')

        # F17 manual exception review/ack
        before=int(d.find_element(By.ID,'conflictMetric').text); b=d.find_element(By.CSS_SELECTOR,'[data-exception="maintenance"] .resolve'); click(d,b)
        assert int(d.find_element(By.ID,'conflictMetric').text)==before-1 and 'resolved' in d.find_element(By.CSS_SELECTOR,'[data-exception="maintenance"]').get_attribute('class'); ok('GROUND-F17')

        # F18 sync regenerates scenario epoch/window and visible feedback
        old_epoch=d.find_element(By.ID,'scenarioEpochText').text; time.sleep(1.05); click(d,d.find_element(By.ID,'syncBtn')); time.sleep(.8)
        new_epoch=d.find_element(By.ID,'scenarioEpochText').text; assert new_epoch!=old_epoch and 'Scenario synchronized' in last_toast(d); ok('GROUND-F18')

        # F19 countdown follows selected contact's scenario offset (c2 ~83 minutes)
        click(d,d.find_element(By.CSS_SELECTOR,'.block[data-contact="c2"]')); txt=d.find_element(By.ID,'countdown').text
        assert txt.startswith('T−') and ':' in txt; mins=int(txt.split('−',1)[1].split(':',1)[0]); assert 81<=mins<=83; ok('GROUND-F19')

        # F20 actual 3D scene interaction: wheel zoom changes POV; shared reset restores approved POV
        canvas=d.find_element(By.CSS_SELECTOR,'.spaceopsSharedGlobeHost canvas'); a0=float(d.execute_script('return window.__spaceopsGlobeApi.pointOfView().altitude'))
        ActionChains(d).move_to_element(canvas).scroll_by_amount(0,-520).perform(); time.sleep(.7)
        a1=float(d.execute_script('return window.__spaceopsGlobeApi.pointOfView().altitude')); assert abs(a1-a0)>0.01
        d.execute_script('window.__spaceopsGlobeApi.resetView()'); time.sleep(.8); ar=float(d.execute_script('return window.__spaceopsGlobeApi.pointOfView().altitude')); assert abs(ar-2.08)<0.10; ok('GROUND-F20')

        # F21 shared mission context visible in GROUND
        d.switch_to.default_content(); click(d,d.find_element(By.ID,'missionBtn')); m=d.find_element(By.ID,'missionId'); m.clear(); m.send_keys('QA-GROUND-001'); a=d.find_element(By.ID,'missionAoi'); a.clear(); a.send_keys('Singapore Ground QA'); click(d,d.find_element(By.ID,'saveContext')); time.sleep(.35); d.switch_to.frame(d.find_element(By.ID,'frame'))
        ctx=d.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]').text; assert 'QA-GROUND-001' in ctx and 'Singapore Ground QA' in ctx; ok('GROUND-F21')

        # F22 overlay/pointer-event sanity for key controls
        for el in [d.find_element(By.ID,'syncBtn'),d.find_element(By.ID,'reserveBtn'),d.find_element(By.CSS_SELECTOR,'[data-layer="access"]'),d.find_element(By.CSS_SELECTOR,'.resource[data-id="GS-SG-02-A1"]'),d.find_element(By.CSS_SELECTOR,'.contact[data-contact="c3"]')]:
            assert el.is_displayed()
            d.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});",el); time.sleep(.05)
            hit=d.execute_script("const r=arguments[0].getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return x>=0&&y>=0&&x<innerWidth&&y<innerHeight&&(h===arguments[0]||arguments[0].contains(h)||h.contains(arguments[0]));",el); assert hit
        ok('GROUND-F22')

        print('GROUND QA PASS',len(passed),'controls:',','.join(passed),flush=True)
        assert len(passed)==22
    finally:
        d.quit()

if __name__=='__main__': main()
