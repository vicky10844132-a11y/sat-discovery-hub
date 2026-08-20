from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from services.mission.intelligence import rank_operational_candidates
from services.mission.planner import demo_plan


def test_operational_ranking_prefers_executable_candidate() -> None:
    satellites = [
        {"id": "SAT-007", "battery_pct": 82, "storage_free_pct": 74},
        {"id": "SAT-042", "battery_pct": 20, "storage_free_pct": 72},
        {"id": "SAT-018", "battery_pct": 91, "storage_free_pct": 81},
    ]
    stations = [
        {"id": "GS-SIN-01", "status": "nominal", "ownership": "own", "utilization_pct": 48},
        {"id": "GS-SE-01", "status": "nominal", "ownership": "partner", "utilization_pct": 67},
    ]

    ranked = rank_operational_candidates(
        demo_plan(),
        satellite_pool=satellites,
        ground_pool=stations,
    )

    assert ranked
    assert ranked[0]["executable"] is True
    assert ranked[0]["operational_score"] > 0
    assert all("resource_state" in item for item in ranked)
    assert all("ground_state" in item for item in ranked)


def test_operational_ranking_surfaces_resource_and_capacity_exceptions() -> None:
    satellites = [
        {"id": "SAT-007", "battery_pct": 10, "storage_free_pct": 10},
        {"id": "SAT-042", "battery_pct": 10, "storage_free_pct": 10},
        {"id": "SAT-018", "battery_pct": 10, "storage_free_pct": 10},
    ]
    stations = [
        {"id": "GS-SIN-01", "status": "nominal", "ownership": "own", "utilization_pct": 99},
        {"id": "GS-SE-01", "status": "offline", "ownership": "partner", "utilization_pct": 30},
    ]

    ranked = rank_operational_candidates(
        demo_plan(),
        satellite_pool=satellites,
        ground_pool=stations,
    )

    assert all(item["executable"] is False for item in ranked)
    flattened = {reason for item in ranked for reason in item["exceptions"]}
    assert "spacecraft_resource_threshold" in flattened
    assert flattened & {"ground_station_capacity", "ground_station_unavailable"}
