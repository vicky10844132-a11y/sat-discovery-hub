from __future__ import annotations

import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE = "http://127.0.0.1:8765/space-ops-platform/apps/web/workspace.html#ops"


def wait_js(driver, script, timeout=20):
    return WebDriverWait(driver, timeout).until(lambda d: d.execute_script(script))


def iframe_driver(driver):
    WebDriverWait(driver, 20).until(EC.frame_to_be_available_and_switch_to_it((By.ID, "frame")))
    wait_js(driver, "return document.readyState === 'complete'")
    wait_js(driver, "return !!window.__spaceopsGlobeApi && !!document.querySelector('.spaceopsSharedGlobeHost canvas')", 35)


def click_text(driver, selector, text):
    els = driver.find_elements(By.CSS_SELECTOR, selector)
    target = next((e for e in els if text.upper() in e.text.strip().upper()), None)
    assert target is not None, f"control not found: {text}"
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", target)
    target.click()
    time.sleep(.35)
    return target


def profile(driver):
    return driver.execute_script("return window.__spaceopsGlobeApi.refreshLayers(true)")


def main():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1600,1000")
    opts.add_argument("--ignore-certificate-errors")
    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(45)
    results = []
    try:
        driver.get(BASE)
        iframe_driver(driver)

        # F09-F13: layer controls must alter the active 3D profile, then restore it.
        layer_cases = [
            ("ORBITS", "orbits"),
            ("SATELLITES", "sats"),
            ("GROUND", "ground"),
            ("AOI", "aoi"),
            ("GRID", "grid"),
        ]
        for label, key in layer_cases:
            before = bool(profile(driver).get(key))
            click_text(driver, ".maptools .chip,.sceneTools .chip,[data-layer]", label)
            after = bool(profile(driver).get(key))
            assert after != before, f"{label} did not change 3D profile ({before} -> {after})"
            click_text(driver, ".maptools .chip,.sceneTools .chip,[data-layer]", label)
            restored = bool(profile(driver).get(key))
            assert restored == before, f"{label} did not restore ({before} -> {restored})"
            results.append(f"PASS {label}")

        # F14: NIGHT must switch the globe texture state through the runtime profile.
        night = driver.find_element(By.ID, "nightBtn")
        before = bool(profile(driver).get("night"))
        night.click(); time.sleep(.4)
        after = bool(profile(driver).get("night"))
        assert after != before, f"NIGHT did not toggle ({before}->{after})"
        night.click(); time.sleep(.4)
        assert bool(profile(driver).get("night")) == before
        results.append("PASS NIGHT")

        # F15-F17: zoom and reset must change/restore actual globe POV.
        get_alt = "return window.__spaceopsGlobeApi.pointOfView().altitude"
        alt0 = float(driver.execute_script(get_alt))
        driver.find_element(By.ID, "zoomIn").click(); time.sleep(.5)
        alt_in = float(driver.execute_script(get_alt))
        assert alt_in < alt0, f"zoom in failed {alt0}->{alt_in}"
        driver.find_element(By.ID, "zoomOut").click(); time.sleep(.5)
        alt_out = float(driver.execute_script(get_alt))
        assert alt_out > alt_in, f"zoom out failed {alt_in}->{alt_out}"
        driver.find_element(By.ID, "resetView").click(); time.sleep(.8)
        pov = driver.execute_script("return window.__spaceopsGlobeApi.pointOfView()")
        assert abs(float(pov["altitude"]) - 2.08) < .08, f"reset altitude unexpected: {pov}"
        assert abs(float(pov["lat"]) - 18) < 1.5 and abs(float(pov["lng"]) - 103) < 1.5, f"reset POV unexpected: {pov}"
        results += ["PASS ZOOM+", "PASS ZOOM-", "PASS RESET"]

        # F18-F20: exercise the same selection API used by Globe click callbacks and verify HUD + POV.
        for object_id in ["GF-7 02", "GS-SE-01", "SG-PORT-04"]:
            driver.execute_script("window.__spaceopsGlobeApi.selectObject(arguments[0])", object_id)
            time.sleep(.8)
            hud = driver.find_element(By.ID, "spaceopsOpsSelectedHud").text
            assert object_id in hud, f"selected HUD missing {object_id}: {hud}"
            results.append(f"PASS SELECT {object_id}")

        # F23: visible contact rows must contain runtime UTC-formatted values, not blank/static placeholders.
        body_text = driver.find_element(By.TAG_NAME, "body").text
        utc_tokens = re.findall(r"\b\d{2}:\d{2}(?::\d{2})?Z\b", body_text)
        assert len(utc_tokens) >= 2, f"insufficient visible UTC contact/runtime tokens: {utc_tokens}"
        results.append("PASS DYNAMIC UTC")

        # F25: intended controls must be hittable (not covered by non-interactive HUD overlays).
        for element_id in ["nightBtn", "zoomIn", "zoomOut", "resetView"]:
            el = driver.find_element(By.ID, element_id)
            rect = driver.execute_script("return arguments[0].getBoundingClientRect()", el)
            x = rect["left"] + rect["width"] / 2
            y = rect["top"] + rect["height"] / 2
            top = driver.execute_script("return document.elementFromPoint(arguments[0],arguments[1])", x, y)
            assert driver.execute_script("return arguments[0]===arguments[1] || arguments[1].contains(arguments[0])", top, el), f"{element_id} is covered by {top.get_attribute('id') or top.get_attribute('class')}"
        results.append("PASS POINTER EVENTS")

        # F24: switch to shell, save shared context, then ensure iframe receives and renders it.
        driver.switch_to.default_content()
        driver.find_element(By.ID, "missionBtn").click()
        mid = driver.find_element(By.ID, "missionId")
        aoi = driver.find_element(By.ID, "missionAoi")
        mid.clear(); mid.send_keys("QA-OPS-001")
        aoi.clear(); aoi.send_keys("Singapore Port QA")
        driver.find_element(By.ID, "saveContext").click(); time.sleep(.6)
        driver.switch_to.frame(driver.find_element(By.ID, "frame"))
        chip = driver.find_element(By.CSS_SELECTOR, "[data-spaceops-shared-context]")
        assert "QA-OPS-001" in chip.text and "Singapore Port QA" in chip.text, chip.text
        results.append("PASS SHARED CONTEXT")

        print("\n".join(results))
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
