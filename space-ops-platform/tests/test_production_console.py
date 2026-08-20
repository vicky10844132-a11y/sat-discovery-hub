from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
PRODUCTION = ROOT / "apps" / "web" / "production.html"
VERCEL = ROOT.parent / "vercel.json"


def source() -> str:
    return PRODUCTION.read_text(encoding="utf-8")


def test_production_console_has_exact_six_primary_modules() -> None:
    html = source()
    for key in ["ops", "twin", "plan", "gs", "earth", "eng"]:
        assert html.count(f'data-v="{key}"') == 1
    assert "opscenter" not in html
    assert html.count('id="nav"') == 1


def test_production_console_wires_real_api_endpoints() -> None:
    html = source()
    endpoints = [
        "/health",
        "/v1/operations/summary",
        "/v1/assets/satellites",
        "/v1/assets/ground-stations",
        "/v1/system/modules",
        "/v1/missions/plan",
        "/v1/weather/check",
        "/v1/passes/predict",
        "/v1/ground-network/schedule",
        "/v1/eo/search",
        "/v1/maritime/search",
        "/v1/orbit/demo",
        "/v1/link-budget",
    ]
    for endpoint in endpoints:
        assert endpoint in html
    assert "const API='/api'" in html


def test_mission_copilot_contains_full_operational_chain() -> None:
    html = source()
    for step in ["OBJECTIVE", "OPPORTUNITY", "WEATHER", "CONTACT", "SCHEDULE", "PROCESS", "DELIVER"]:
        assert step in html
    assert 'id="runMission"' in html
    assert "Mission Copilot" in html
    assert "Mission Intelligence Engine" in html


def test_data_modes_are_not_misrepresented() -> None:
    html = source()
    assert "SIMULATED UNTIL CONNECTOR IS ADDED" in html
    assert "LIVE API" in html
    assert "Provider modes are surfaced from the API" in html


def test_no_duplicate_ids() -> None:
    ids = re.findall(r'\bid="([^"]+)"', source())
    duplicates = sorted({value for value in ids if ids.count(value) > 1})
    assert not duplicates, duplicates


def test_vercel_space_ops_route_targets_production_console() -> None:
    config = json.loads(VERCEL.read_text(encoding="utf-8"))
    route = next(item for item in config["rewrites"] if item["source"] == "/space-ops")
    assert route["destination"] == "/space-ops-platform/apps/web/production.html"
