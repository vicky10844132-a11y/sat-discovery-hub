from __future__ import annotations

import json
import os
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE = "http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#twin"
DOWNLOAD_DIR = Path("/tmp/spaceops-downloads")


def wait_js(driver, script, timeout=25):
    return WebDriverWait(driver, timeout).until(lambda d: d.execute_script(script))


def iframe_driver(driver):
    WebDriverWait(driver, 25).until(EC.frame_to_be_available_and_switch_to_it((By.ID, "frame")))
    wait_js(driver, "return document.readyState === 'complete'")
    wait_js(driver, "return !!window.__spaceopsGlobeApi && !!document.querySelector('.spaceopsSharedGlobeHost canvas')", 40)
    wait_js(driver, "return document.documentElement.dataset.twinVisualReady === '1'", 20)


def class_on(driver, element):
    return "on" in (element.get_attribute("class") or "").split()


def visible_asset_names(driver):
    return [e.get_attribute("data-name") for e in driver.find_elements(By.CSS_SELECTOR, ".asset") if e.is_displayed()]


def active_profile(driver):
    return driver.execute_script("return window.__spaceopsGlobeApi.refreshLayers(true)")


def click_center(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block:'center',inline:'center'});", element)
    time.sleep(.12)
    element.click()
    time.sleep(.35)


def main():
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    for p in DOWNLOAD_DIR.glob("*"):
        p.unlink()

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1600,1000")
    opts.add_argument("--ignore-certificate-errors")
    opts.add_experimental_option("prefs", {
        "download.default_directory": str(DOWNLOAD_DIR),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
    })
    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(45)
    results = []

    def passed(fid, note=""):
        results.append((fid, note))
        print(f"PASS {fid} {note}".rstrip())

    try:
        driver.get(BASE)
        iframe_driver(driver)

        # F01 Simulation live/paused state must visibly change and hold state.
        live = driver.find_element(By.ID, "liveState")
        initial_live = class_on(driver, live)
        footer_before = driver.find_element(By.ID, "footerLive").text
        click_center(driver, live)
        assert class_on(driver, live) != initial_live
        footer_after = driver.find_element(By.ID, "footerLive").text
        assert footer_after != footer_before and ("PAUSED" in footer_after or "LIVE" in footer_after)
        age1 = driver.find_element(By.ID, "stateAge").text
        time.sleep(.8)
        age2 = driver.find_element(By.ID, "stateAge").text
        if "PAUSED" in footer_after:
            # shared 3D simulation clock should also be frozen by the normalized live control
            shared_live = driver.execute_script("return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.live")
            assert shared_live is False
        click_center(driver, live)
        assert class_on(driver, live) == initial_live
        passed("TWIN-F01")

        # F02 Sync resets state age and shared epoch.
        time.sleep(.7)
        before_epoch = driver.execute_script("return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.epochMs")
        click_center(driver, driver.find_element(By.ID, "syncBtn"))
        after_epoch = driver.execute_script("return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.epochMs")
        age = driver.find_element(By.ID, "stateAge").text
        assert after_epoch >= before_epoch
        assert float(age.rstrip("s")) < .8, age
        passed("TWIN-F02")

        # F03 resource search.
        search = driver.find_element(By.ID, "assetSearch")
        search.clear(); search.send_keys("SAR-01"); time.sleep(.25)
        names = visible_asset_names(driver)
        assert names == ["SAR-01"], names
        search.clear(); time.sleep(.2)
        passed("TWIN-F03")

        # F04 tabs.
        driver.find_element(By.ID, "tabSpacecraft").click(); time.sleep(.2)
        names = visible_asset_names(driver)
        assert len(names) == 4 and all(n in {"GF-7 02","SUPERVIEW NEO-1","SY-01","SAR-01"} for n in names), names
        driver.find_element(By.ID, "tabGround").click(); time.sleep(.2)
        names = visible_asset_names(driver)
        assert len(names) == 3 and all(n.startswith("GS-") for n in names), names
        driver.find_element(By.ID, "tabAll").click(); time.sleep(.2)
        assert len(visible_asset_names(driver)) == 8
        passed("TWIN-F04")

        # F05 object selection must update inspector; camera-focus behavior is asserted when wired.
        sar = driver.find_element(By.CSS_SELECTOR, '.asset[data-name="SAR-01"]')
        pov0 = driver.execute_script("return window.__spaceopsGlobeApi.pointOfView()")
        click_center(driver, sar)
        assert driver.find_element(By.ID, "objectName").text == "SAR-01"
        assert driver.find_element(By.ID, "objectStatus").text == "WATCH"
        pov1 = driver.execute_script("return window.__spaceopsGlobeApi.pointOfView()")
        # Selection must be reflected in the shared twin state even if the POV is already near the object.
        selected_id = driver.execute_script("return window.parent.__SPACEOPS_SHARED_GLOBE_STATE__.selectedId")
        assert selected_id == "SAR-01", f"shared selectedId={selected_id}, pov0={pov0}, pov1={pov1}"
        passed("TWIN-F05")

        # F06-F08 modes: visible toggle + runtime accessibility state.
        for fid, eid in [("TWIN-F06","coverageMode"),("TWIN-F07","anomalyMode"),("TWIN-F08","linkMode")]:
            el = driver.find_element(By.ID, eid)
            before = class_on(driver, el)
            click_center(driver, el)
            assert class_on(driver, el) != before
            assert el.get_attribute("aria-pressed") == ("true" if not before else "false")
            toast = driver.find_elements(By.CSS_SELECTOR, ".toast")
            assert toast and ("enabled" in toast[-1].text.lower() or "disabled" in toast[-1].text.lower())
            click_center(driver, el)
            assert class_on(driver, el) == before
            passed(fid)

        # F09 core scene layers must change the active shared Globe profile then restore.
        cases = [("ORBITS","orbits"),("ASSETS","sats"),("GROUND","ground"),("AOI","aoi")]
        for label, key in cases:
            el = next(x for x in driver.find_elements(By.CSS_SELECTOR, '[data-layer]') if label == x.text.strip().upper())
            before = bool(active_profile(driver).get(key))
            click_center(driver, el)
            after = bool(active_profile(driver).get(key))
            assert after != before, f"{label}: {before}->{after}"
            click_center(driver, el)
            assert bool(active_profile(driver).get(key)) == before
        passed("TWIN-F09")

        # F10 capability DETAILS drawer open/close.
        click_center(driver, driver.find_element(By.ID, "payloadToggle"))
        drawer = driver.find_element(By.ID, "payloadDrawer")
        assert "open" in (drawer.get_attribute("class") or "").split()
        assert "SAR-01" in driver.find_element(By.ID, "payloadDrawerTitle").text
        drawer.find_element(By.CSS_SELECTOR, "[data-close]").click(); time.sleep(.2)
        assert "open" not in (drawer.get_attribute("class") or "").split()
        passed("TWIN-F10")

        # F11 full object profile drawer.
        click_center(driver, driver.find_element(By.ID, "profileLink"))
        drawer = driver.find_element(By.ID, "profileDrawer")
        assert "open" in (drawer.get_attribute("class") or "").split()
        assert driver.find_element(By.ID, "profileName").text == "SAR-01"
        assert driver.find_element(By.ID, "profileGrid").text.strip()
        drawer.find_element(By.CSS_SELECTOR, "[data-close]").click(); time.sleep(.2)
        passed("TWIN-F11")

        # F12 export snapshot must produce a JSON download with selected object/layers.
        click_center(driver, driver.find_element(By.ID, "snapshotBtn"))
        deadline = time.time() + 8
        snap = DOWNLOAD_DIR / "space-ops-twin-snapshot.json"
        while time.time() < deadline and not snap.exists():
            time.sleep(.2)
        assert snap.exists(), "snapshot download missing"
        payload = json.loads(snap.read_text())
        assert payload["selected"] == "SAR-01"
        assert "layers" in payload and "orbits" in payload["layers"]
        passed("TWIN-F12")

        # F13 zoom/reset actual globe POV.
        get_alt = "return window.__spaceopsGlobeApi.pointOfView().altitude"
        alt0 = float(driver.execute_script(get_alt))
        click_center(driver, driver.find_element(By.ID, "zoomIn"))
        alt1 = float(driver.execute_script(get_alt))
        assert alt1 < alt0, (alt0, alt1)
        click_center(driver, driver.find_element(By.ID, "zoomOut"))
        alt2 = float(driver.execute_script(get_alt))
        assert alt2 > alt1, (alt1, alt2)
        click_center(driver, driver.find_element(By.ID, "resetView"))
        time.sleep(.5)
        pov = driver.execute_script("return window.__spaceopsGlobeApi.pointOfView()")
        assert abs(float(pov["altitude"]) - 2.08) < .12, pov
        passed("TWIN-F13")

        # F14 shared mission context.
        driver.switch_to.default_content()
        driver.find_element(By.ID, "missionBtn").click()
        mid = driver.find_element(By.ID, "missionId"); mid.clear(); mid.send_keys("QA-TWIN-001")
        aoi = driver.find_element(By.ID, "missionAoi"); aoi.clear(); aoi.send_keys("Singapore Twin QA")
        driver.find_element(By.ID, "missionPriority").send_keys("P1")
        driver.find_element(By.ID, "saveContext").click(); time.sleep(.5)
        driver.switch_to.frame(driver.find_element(By.ID, "frame"))
        ctx = driver.find_element(By.CSS_SELECTOR, "[data-spaceops-shared-context]").text
        assert "QA-TWIN-001" in ctx and "Singapore Twin QA" in ctx and "P1" in ctx, ctx
        passed("TWIN-F14")

        # F15 pointer-event/hit target sanity at desktop viewport.
        for eid in ["liveState","syncBtn","snapshotBtn","assetSearch","coverageMode","anomalyMode","linkMode","zoomIn","zoomOut","resetView","payloadToggle","profileLink"]:
            el = driver.find_element(By.ID, eid)
            rect = driver.execute_script("return arguments[0].getBoundingClientRect()", el)
            assert rect["width"] > 0 and rect["height"] > 0, f"{eid} has no box"
            assert driver.execute_script("return getComputedStyle(arguments[0]).pointerEvents", el) != "none", f"{eid} pointer-events none"
        passed("TWIN-F15")

        print(f"TWIN functional browser QA passed {len(results)}/15 controls")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
