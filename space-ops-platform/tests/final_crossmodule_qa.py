import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.chrome.options import Options

BASE='http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#ops'
MODULES=['ops','twin','plan','ground','earth','eng']

def driver():
    o=Options(); o.page_load_strategy='eager'
    o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--disable-gpu'); o.add_argument('--window-size=1600,1200')
    d=webdriver.Chrome(options=o); d.set_page_load_timeout(30); return d

def shell_click(d, selector):
    e=d.find_element(By.CSS_SELECTOR,selector)
    d.execute_script("arguments[0].scrollIntoView({block:'center'});",e); time.sleep(.05); e.click()

def wait_module(d,m):
    WebDriverWait(d,20).until(lambda x: x.find_element(By.ID,'modulePill').text.strip()==m.upper())
    WebDriverWait(d,20).until(lambda x: f'{m}.html' in (x.find_element(By.ID,'frame').get_attribute('src') or ''))
    WebDriverWait(d,20).until(lambda x: x.find_element(By.ID,'frame').get_attribute('src'))

def main():
    d=driver()
    try:
        d.get(BASE); wait_module(d,'ops')
        for m in MODULES:
            shell_click(d,f'#nav button[data-module="{m}"]'); wait_module(d,m)
            assert d.execute_script('return location.hash') == '#'+m
            assert 'on' in d.find_element(By.CSS_SELECTOR,f'#nav button[data-module="{m}"]').get_attribute('class')
            print('PASS NAV',m,flush=True)
        print('FREL-02 PASS',flush=True)

        shell_click(d,'#missionBtn')
        mi=d.find_element(By.ID,'missionId'); mi.clear(); mi.send_keys('FINAL-QA-CTX-001')
        ao=d.find_element(By.ID,'missionAoi'); ao.clear(); ao.send_keys('SG-PORT-04')
        Select(d.find_element(By.ID,'missionPriority')).select_by_visible_text('P1')
        shell_click(d,'#saveContext'); time.sleep(.3)
        assert d.find_element(By.ID,'missionLabel').text=='FINAL-QA-CTX-001'
        assert d.find_element(By.ID,'priorityMini').text=='P1'

        for m in MODULES:
            shell_click(d,f'#nav button[data-module="{m}"]'); wait_module(d,m)
            d.switch_to.frame(d.find_element(By.ID,'frame'))
            ctx=WebDriverWait(d,20).until(lambda x: x.find_element(By.CSS_SELECTOR,'[data-spaceops-shared-context]'))
            txt=ctx.text
            assert 'FINAL-QA-CTX-001' in txt and 'SG-PORT-04' in txt and 'P1' in txt
            d.switch_to.default_content()
            print('PASS CTX',m,flush=True)
        print('FREL-03 PASS',flush=True)
    finally:
        d.quit()

if __name__=='__main__': main()
