from pathlib import Path
import re

WEB = Path(__file__).resolve().parents[1] / "apps" / "web"
WORKSPACE = WEB / "workspace.html"
MODULES = {
    "ops": "GLOBAL OPERATIONS",
    "twin": "SPACE RESOURCE & DIGITAL TWIN",
    "plan": "MISSION PLANNING & SCHEDULING",
    "ground": "GROUND & MISSION OPERATIONS",
    "earth": "EARTH INTELLIGENCE",
    "eng": "ENGINEERING & DYNAMICS",
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_workspace_has_exactly_six_canonical_modules():
    html = read(WORKSPACE)
    nav = re.findall(r'data-module="([a-z]+)"', html)
    assert nav == list(MODULES)
    assert len(nav) == 6


def test_workspace_loads_every_completed_module():
    html = read(WORKSPACE)
    for key, label in MODULES.items():
        assert f"modules/{key}.html" in html
        assert label in html
        module = WEB / "modules" / f"{key}.html"
        assert module.exists()
        content = read(module)
        assert "Space Ops Platform" in content


def test_workspace_owns_shared_context_sync_and_cross_module_history():
    html = read(WORKSPACE)
    required = [
        "spaceops.activeModule",
        "spaceops.sharedContext",
        "spaceops.actionHistory",
        "SpaceOpsSharedContext",
        "spaceops:context",
        "spaceops.lastAction",
        "syncPill",
        "actionPill",
        "Mission Context",
        "RECENT CROSS-MODULE ACTIONS",
    ]
    for token in required:
        assert token in html


def test_shell_supports_sequential_navigation_and_keyboard_shortcuts():
    html = read(WORKSPACE)
    assert 'id="prevBtn"' in html
    assert 'id="nextBtn"' in html
    for key in MODULES:
        assert f'data-flow="{key}"' in html
    assert "e.altKey" in html
    assert "/^[1-6]$/" in html


def test_shared_mission_context_includes_priority():
    html = read(WORKSPACE)
    assert 'id="missionPriority"' in html
    assert 'id="priorityMini"' in html
    assert 'id="aoiMini"' in html
    assert "context.priority" in html
    for priority in ("P1", "P2", "P3"):
        assert f">{priority}<" in html or f">{priority}</option>" in html


def test_shell_suppresses_duplicate_first_level_navigation():
    html = read(WORKSPACE)
    assert "rail.style.display='none'" in html
    assert "app.style.gridTemplateColumns='minmax(0,1fr)'" in html


def test_workspace_supports_stable_module_deep_links():
    html = read(WORKSPACE)
    assert "location.hash" in html
    assert "history.replaceState" in html
    assert "hashchange" in html
    for key in MODULES:
        assert f"#{key}" in html


def test_workspace_has_cross_module_event_bridge_and_cross_tab_sync():
    html = read(WORKSPACE)
    required = [
        "broadcastContext",
        "postMessage",
        "spaceops:action",
        "spaceops:context-update",
        "addEventListener('storage'",
        "addEventListener('message'",
    ]
    for token in required:
        assert token in html


def test_workspace_can_reset_context_and_clear_action_history():
    html = read(WORKSPACE)
    assert 'id="resetContext"' in html
    assert 'id="clearHistory"' in html
    assert "MISSION CONTEXT RESET" in html
    assert "Cross-module action history cleared" in html


def test_independent_data_search_product_is_not_linked_into_space_ops_shell():
    html = read(WORKSPACE).lower()
    assert "data_search_aoi" not in html
    assert "data-search-aoi" not in html
    assert "aoi-tool-full" not in html
