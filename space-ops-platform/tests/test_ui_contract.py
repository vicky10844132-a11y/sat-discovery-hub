from pathlib import Path
import re


CONSOLE = Path(__file__).parents[1] / "apps" / "web" / "console.html"


def source() -> str:
    return CONSOLE.read_text(encoding="utf-8")


def test_exactly_six_canonical_primary_modules():
    html = source()
    expected = {
        'data-v="ops"',
        'data-v="twin"',
        'data-v="plan"',
        'data-v="ground"',
        'data-v="earth"',
        'data-v="eng"',
    }
    for token in expected:
        assert html.count(token) == 1, f"primary module must appear once: {token}"
    assert html.count('id="nav"') == 1


def test_help_is_the_documentation_home():
    html = source()
    assert 'id="help"' in html
    assert "HELP / DOCUMENTATION" in html
    assert "数据模式" in html


def test_core_autonomous_loop_is_present():
    html = source()
    for step in [
        "OBJECTIVE",
        "OPPORTUNITY",
        "WEATHER",
        "RESOURCE",
        "CONTACT",
        "PROCESS",
        "DELIVER",
    ]:
        assert step in html
    assert 'id="runMission"' in html
    assert "EXECUTABLE PLAN READY" in html


def test_specialist_capabilities_have_single_canonical_workspace():
    html = source()
    required = [
        "Mission Intelligence Engine",
        "EO Search & Tasking",
        "AIS / Maritime",
        "Orbit Dynamics",
        "GNC / ADCS",
        "GNSS / POD",
        "Link Engineering",
        "Network Scheduler",
    ]
    for label in required:
        assert label in html


def test_no_duplicate_html_ids():
    html = source()
    ids = re.findall(r'\bid="([^"]+)"', html)
    duplicates = sorted({item for item in ids if ids.count(item) > 1})
    assert not duplicates, f"duplicate ids: {duplicates}"
