from pathlib import Path

WEB = Path(__file__).resolve().parents[1] / "apps" / "web"
MODULES = {
    "ops": ["MISSION COPILOT", "MISSION QUEUE", "UPCOMING CONTACTS", "RESOURCE HEALTH", "NEW MISSION"],
    "twin": ["RESOURCE GRAPH", "OBJECT INSPECTOR", "STATE VECTOR", "RELATIONSHIPS", "TWIN QUALITY"],
    "plan": ["MISSION DEFINITION", "RANKED EXECUTABLE PLANS", "EXECUTION SCHEDULE", "CONFLICTS", "COMMIT"],
    "ground": ["RESOURCE POOL", "CONTACT", "RESERVATION", "GSAAS", "CONFLICT"],
    "earth": ["WEATHER", "AIS", "PROCESS", "QC", "DELIVERY"],
    "eng": ["TLE", "SGP4", "GNC", "ADCS", "GNSS", "POD", "LINK"],
}


def read(name: str) -> str:
    return (WEB / "modules" / f"{name}.html").read_text(encoding="utf-8")


def test_all_six_module_files_are_substantial_workspaces():
    for name in MODULES:
        path = WEB / "modules" / f"{name}.html"
        assert path.exists(), f"missing {name} workspace"
        html = path.read_text(encoding="utf-8")
        assert len(html) > 5000, f"{name} workspace is unexpectedly small"
        assert "Space Ops Platform" in html


def test_each_module_preserves_required_visible_capabilities():
    for name, tokens in MODULES.items():
        html = read(name).upper()
        missing = [token for token in tokens if token not in html]
        assert not missing, f"{name} lost visible capabilities: {missing}"


def test_each_module_has_interactions_and_feedback():
    for name in MODULES:
        html = read(name).lower()
        assert "<button" in html, f"{name} has no actionable controls"
        assert "addeventlistener" in html or ".onclick" in html, f"{name} has no prototype interactions"
        assert "toast" in html, f"{name} lacks interaction feedback"
        assert "sync" in html, f"{name} lacks sync control/status"


def test_workspace_is_only_first_level_navigation_owner_when_embedded():
    shell = (WEB / "workspace.html").read_text(encoding="utf-8")
    expected = [f'data-module="{name}"' for name in MODULES]
    positions = [shell.index(token) for token in expected]
    assert positions == sorted(positions)
    assert shell.count('data-module="') == 6
    assert ".rail{display:none!important}" in shell
    assert "left:-76px" in shell


def test_independent_data_search_aoi_product_does_not_leak_into_space_ops():
    forbidden = ["DATA_SEARCH_AOI", "data-search-aoi", "aoi-tool-full-v8"]
    for name in MODULES:
        html = read(name)
        for token in forbidden:
            assert token not in html, f"independent Data Search/AOI product leaked into {name}"
