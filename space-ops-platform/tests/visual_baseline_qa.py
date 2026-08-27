import io, time, math
from PIL import Image, ImageChops, ImageStat
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

MODULES=['ops','twin','ground','earth','eng']
BASES={'v1':'http://127.0.0.1:8766/space-ops-platform/apps/web/workspace.html#','dev':'http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#'}
FREEZE_CSS='''
*{animation:none!important;transition:none!important;caret-color:transparent!important}
canvas,.toastbox,.clock,time,#stateAge,#ageMetric,#epochMetric,#hudTime,#solutionAge,#epochValue{visibility:hidden!important}
'''

def make_driver():
    o=Options(); o.page_load_strategy='eager'; o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--disable-gpu'); o.add_argument('--window-size=1600,1000'); o.add_argument('--force-device-scale-factor=1')
    d=webdriver.Chrome(options=o); d.set_page_load_timeout(30); return d

def shot(d,url,module):
    d.get(url+module)
    WebDriverWait(d,25).until(lambda x:x.find_element(By.ID,'modulePill').text.strip()==module.upper())
    WebDriverWait(d,25).until(lambda x:f'{module}.html' in (x.find_element(By.ID,'frame').get_attribute('src') or ''))
    time.sleep(1.5)
    d.execute_script("let s=document.createElement('style');s.textContent=arguments[0];document.head.appendChild(s)",FREEZE_CSS)
    d.switch_to.frame(d.find_element(By.ID,'frame'))
    d.execute_script("let s=document.createElement('style');s.textContent=arguments[0];document.head.appendChild(s)",FREEZE_CSS)
    d.switch_to.default_content(); time.sleep(.2)
    return Image.open(io.BytesIO(d.get_screenshot_as_png())).convert('RGB')

def diff_ratio(a,b):
    assert a.size==b.size
    diff=ImageChops.difference(a,b)
    # Count pixels with material channel delta > 12; antialiasing noise below threshold is ignored.
    px=diff.load(); w,h=diff.size; changed=0
    for y in range(h):
        for x in range(w):
            if max(px[x,y])>12: changed+=1
    return changed/(w*h)

def main():
    d=make_driver()
    try:
        for m in MODULES:
            a=shot(d,BASES['v1'],m); b=shot(d,BASES['dev'],m)
            r=diff_ratio(a,b)
            print(f'VISUAL {m.upper()} changed_ratio={r:.5f}',flush=True)
            # Functional corrections may alter tiny state cues, but chrome/layout should remain overwhelmingly identical.
            assert r < 0.035, (m,r)
        print('FREL-04 PASS: non-PLAN visual chrome remains within V1 regression tolerance; PLAN intentionally excluded for approved opportunity-window fix.',flush=True)
    finally:
        d.quit()

if __name__=='__main__': main()
