from pathlib import Path
import json
import re

PLATFORM_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PLATFORM_ROOT.parent
PRODUCTION = PLATFORM_ROOT / "apps" / "web" / "production.html"
LIVE_ENTRY = REPO_ROOT / "space-ops-live.html"
VERCEL = REPO_ROOT / "vercel.json"


def source() -> str:
    return PRODUCTION.read_text(encoding="utf-8")


def test_production_console_has_exact_six_primary_modules() -> None:
    html = source()
    for key in ["ops", "twin", "plan", "gs", "earth", "eng"]:
        assert html.count(f'data-v="{key}"') == 1
    assert "opscenter" not in html
    assert html.count('id="nav"') == 1


def test_production_console_wires_canonical_api_endpoints() -> None:
    html = source()
    endpoints = [
        "/health",
        "/v1/operations/summary",
        "/v1/assets/satellites",
        "/v1/assets/ground-stations",
        "/v1/system/modules",
        "/v1/copilot/mission",
        "/v1/missions/plan",
        "/v1/ground-network/pool",
        "/v1/passes/predict",
        "/v1/ground-network/schedule",
        "/v1/weather/check",
        "/v1/eo/search",
        "/v1/maritime/search",
        "/v1/orbit/demo",
        "/v1/link-budget",
        "/v1/engineering/capabilities",
    ]
    for endpoint in endpoints:
        assert endpoint in html
    assert "const API='/api'" in html


def test_mission_copilot_contains_full_operational_chain() -> None:
    html = source()
    for step in [
        "OBJECTIVE",
        "AOI",
        "DATA_SEARCH",
        "OPPORTUNITY",
        "WEATHER_RESOURCE",
        "CONTACT",
        "SCHEDULE",
        "PROCESS",
        "DELIVER",
    ]:
        assert step in html
    assert 'id="runMission"' in html
    assert "Mission Copilot" in html
    assert "Mission Intelligence Engine" in html
    assert "runCanonicalMission" in html


def test_ground_and_engineering_workspaces_consume_unified_contracts() -> None:
    html = source()
    assert "API_ENDPOINTS.pool" in html
    assert "API_ENDPOINTS.eng" in html
    for ownership in ["own", "partner", "gsaas"]:
        assert ownership in html
    for tier in ["TLE / SGP4", "Numerical Dynamics", "GNSS / POD", "GNC / ADCS"]:
        assert tier in html


def test_earth_data_search_can_feed_mission_strategy() -> None:
    html = source()
    assert 'id="sendToMission"' in html
    assert "DATA_SEARCH selected" in html
    assert "archive-first" in html
    assert "API_ENDPOINTS.eo" in html


def test_mission_execution_state_persists_in_browser() -> None:
    html = source()
    assert "spaceops.currentMission" in html
    assert "localStorage.setItem" in html
    assert "localStorage.removeItem" in html


def test_data_modes_are_not_misrepresented() -> None:
    html = source()
    assert "SIMULATED" in html
    assert "CONNECTOR_REQUIRED" in html
    assert "STATIC CONSOLE · SIMULATED FALLBACK" in html
    assert "Help / Documentation" in html


def test_no_duplicate_ids() -> None:
    ids = re.findall(r'\bid="([^"]+)"', source())
    duplicates = sorted({value for value in ids if ids.count(value) > 1})
    assert not duplicates, duplicates


def test_fixed_live_entry_targets_production_console() -> None:
    live = LIVE_ENTRY.read_text(encoding="utf-8")
    assert "space-ops-platform/apps/web/production.html" in live
    assert "console.html" not in live


def test_vercel_space_ops_route_targets_production_console() -> None:
    config = json.loads(VERCEL.read_text(encoding="utf-8"))
    route = next(item for item in config["rewrites"] if item["source"] == "/space-ops")
    assert route["destination"] == "/space-ops-platform/apps/web/production.html"
