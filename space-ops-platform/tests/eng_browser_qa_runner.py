from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import eng_browser_qa as qa


def resilient_driver():
    o = Options()
    o.page_load_strategy = 'eager'
    o.add_argument('--headless=new')
    o.add_argument('--no-sandbox')
    o.add_argument('--disable-dev-shm-usage')
    o.add_argument('--disable-gpu')
    o.add_argument('--window-size=1600,1200')
    o.add_experimental_option('prefs', {
        'download.default_directory': qa.DL,
        'download.prompt_for_download': False,
    })
    d = webdriver.Chrome(options=o)
    d.set_page_load_timeout(30)
    return d


qa.driver = resilient_driver

if __name__ == '__main__':
    qa.main()
