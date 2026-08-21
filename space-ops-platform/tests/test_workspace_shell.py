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


def test_workspace_owns_shared_context_and_sync_state():
    html = read(WORKSPACE)
    required = [
        "spaceops.activeModule",
        "spaceops.sharedContext",
        "SpaceOpsSharedContext",
        "spaceops:context",
        "spaceops.lastAction",
        "syncPill",
        "Mission Context",
    ]
    for token in required:
        assert token in html


def test_shell_suppresses_duplicate_first_level_navigation():
    html = read(WORKSPACE)
    assert "rail.style.display='none'" in html
    assert "app.style.gridTemplateColumns='minmax(0,1fr)'" in html


def test_independent_data_search_product_is_not_linked_into_space_ops_shell():
    html = read(WORKSPACE).lower()
    assert "data_search_aoi" not in html
    assert "data-search-aoi" not in html
    assert "aoi-tool-full" not in html
