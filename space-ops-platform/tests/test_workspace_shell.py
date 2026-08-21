from pathlib import Path
import re

WEB = Path(__file__).resolve().parents[1] / "apps" / "web"
WORKSPACE = WEB / "workspace.html"
MODULES = ["ops", "twin", "plan", "ground", "earth", "eng"]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_workspace_has_exactly_six_canonical_modules():
    html = read(WORKSPACE)
    nav = re.findall(r'data-module="([a-z]+)"', html)
    assert nav == MODULES
    assert len(nav) == 6


def test_workspace_loads_every_module():
    html = read(WORKSPACE)
    for key in MODULES:
        assert f"modules/{key}.html" in html
        module = WEB / "modules" / f"{key}.html"
        assert module.exists()
        assert "Space Ops Platform" in read(module)


def test_workspace_uses_lifecycle_not_duplicate_module_navigation():
    html = read(WORKSPACE)
    for step in ("REQUEST", "PLAN", "TASK", "CONTACT", "PROCESS", "DELIVER"):
        assert f">{step}<" in html
    assert "data-flow=" not in html
    assert 'id="prevBtn"' not in html
    assert 'id="nextBtn"' not in html


def test_shell_robustly_suppresses_embedded_module_rails():
    html = read(WORKSPACE)
    assert "spaceops-shell-embed" in html
    assert ".rail{display:none!important}" in html
    assert "left:-76px" in html
    assert "width:calc(100% + 76px)" in html


def test_workspace_supports_deep_links_and_keyboard_shortcuts():
    html = read(WORKSPACE)
    assert "location.hash" in html
    assert "history.replaceState" in html
    assert "hashchange" in html
    assert "e.altKey" in html
    assert "/^[1-6]$/" in html


def test_shared_mission_context_includes_priority_and_aoi():
    html = read(WORKSPACE)
    for token in ('id="missionPriority"', 'id="priorityMini"', 'id="aoiMini"', "spaceops.sharedContext"):
        assert token in html
    for priority in ("P1", "P2", "P3"):
        assert f">{priority}<" in html


def test_workspace_marks_development_data_as_demo():
    html = read(WORKSPACE)
    assert "DEMO WORKSPACE" in html
    assert "DEMO MODEL" in html
    assert "textContent.trim()==='LIVE'" in html


def test_data_search_product_is_not_linked_into_space_ops_shell():
    html = read(WORKSPACE).lower()
    for forbidden in ("data_search_aoi", "data-search-aoi", "aoi-tool-full"):
        assert forbidden not in html
