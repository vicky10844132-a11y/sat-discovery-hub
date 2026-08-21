from pathlib import Path

WEB = Path(__file__).resolve().parents[1] / "apps" / "web"
MODULES = {
    "ops": {
        "title": "GLOBAL OPERATIONS",
        "tokens": ["MISSION COPILOT", "MISSION QUEUE", "UPCOMING CONTACTS", "RESOURCE HEALTH", "NEW MISSION"],
    },
    "twin": {
        "title": "SPACE RESOURCE & DIGITAL TWIN",
        "tokens": ["RESOURCE GRAPH", "OBJECT INSPECTOR", "STATE VECTOR", "RELATIONSHIPS", "TWIN QUALITY"],
    },
    "plan": {
        "title": "MISSION PLANNING & SCHEDULING",
        "tokens": ["MISSION DEFINITION", "RANKED EXECUTABLE PLANS", "EXECUTION SCHEDULE", "CONFLICTS", "COMMIT"],
    },
    "ground": {
        "title": "GROUND & MISSION OPERATIONS",
        "tokens": ["RESOURCE POOL", "CONTACT", "RESERVATION", "GSaaS", "CONFLICT"],
    },
    "earth": {
        "title": "EARTH INTELLIGENCE",
        "tokens": ["WEATHER", "AIS", "PROCESS", "QC", "DELIVERY"],
    },
    "eng": {
        "title": "ENGINEERING & DYNAMICS",
        "tokens": ["TLE", "SGP4", "GNC", "ADCS", "GNSS", "POD", "LINK"],
    },
}


def read(name: str) -> str:
    return (WEB / "modules" / f"{name}.html").read_text(encoding="utf-8")


def test_all_six_module_files_exist_and_are_real_workspaces():
    for name, spec in MODULES.items():
        path = WEB / "modules" / f"{name}.html"
        assert path.exists(), f"missing {name} workspace"
        html = path.read_text(encoding="utf-8")
        assert len(html) > 5000, f"{name} is too small to be the completed workspace"
        assert "Space Ops Platform" in html
        assert spec["title"] in html.upper()


def test_each_module_preserves_its_approved_visible_capability_set():
    for name, spec in MODULES.items():
        html = read(name).upper()
        missing = [token for token in spec["tokens"] if token.upper() not in html]
        assert not missing, f"{name} lost visible capabilities: {missing}"


def test_each_module_has_prototype_interaction_surface():
    for name in MODULES:
        html = read(name).lower()
        assert "<button" in html, f"{name} has no actionable controls"
        assert "addeventlistener" in html or ".onclick" in html, f"{name} has no prototype interactions"
        assert "toast" in html, f"{name} lacks interaction feedback"


def test_each_module_retains_help_and_sync_controls():
    for name in MODULES:
        html = read(name).lower()
        assert "help" in html, f"{name} lacks help/documentation access"
        assert "sync" in html, f"{name} lacks synchronization control/status"


def test_workspace_is_the_only_first_level_navigation_owner():
    shell = (WEB / "workspace.html").read_text(encoding="utf-8")
    expected = [
        'data-module="ops"',
        'data-module="twin"',
        'data-module="plan"',
        'data-module="ground"',
        'data-module="earth"',
        'data-module="eng"',
    ]
    positions = [shell.index(token) for token in expected]
    assert positions == sorted(positions)
    assert shell.count('data-module="') == 6
    assert "rail.style.display='none'" in shell


def test_data_search_aoi_product_is_not_part_of_space_ops_modules():
    forbidden = ["DATA_SEARCH_AOI", "data-search-aoi", "aoi-tool-full-v8"]
    for name in MODULES:
        html = read(name)
        for token in forbidden:
            assert token not in html, f"independent Data Search/AOI product leaked into {name}"
