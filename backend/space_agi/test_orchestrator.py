from pathlib import Path

from .memory import JsonlMemoryStore
from .orchestrator import SpaceAGIOrchestrator


def test_belize_project_routes_across_domains(tmp_path: Path) -> None:
    memory = JsonlMemoryStore(str(tmp_path / "memory.jsonl"))
    orchestrator = SpaceAGIOrchestrator(memory=memory)

    result = orchestrator.run(
        "处理伯利兹卫星影像编程项目，整理需求、查询卫星数据、联系厂家并进入报价流程",
        {
            "area_km2": 2029,
            "resolution_m": 0.3,
            "cloud_max_pct": 15,
            "processing": "L1",
            "crs": "WGS84",
        },
    )

    assert result["status"] == "completed"
    agents = [item["agent"] for item in result["tasks"].values()]
    assert "communications" in agents
    assert "data" in agents
    assert "commercial" in agents
    assert "research" in agents
    assert agents[-1] == "critic"


def test_memory_is_written(tmp_path: Path) -> None:
    path = tmp_path / "memory.jsonl"
    orchestrator = SpaceAGIOrchestrator(memory=JsonlMemoryStore(str(path)))
    orchestrator.run("查询卫星数据")

    assert path.exists()
    assert orchestrator.memory.recall("查询卫星数据")
