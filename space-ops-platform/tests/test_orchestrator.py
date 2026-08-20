from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from services.mission.orchestrator import (
    AOIContext,
    CANONICAL_STAGES,
    CatalogProduct,
    GroundAsset,
    GroundReservation,
    MissionObjective,
    SpacecraftState,
    WeatherWindow,
    orchestrate_mission,
)
from services.mission.planner import demo_plan


def common_inputs(now: datetime) -> dict:
    return {
        "objective": MissionObjective(
            objective="Monitor Singapore port in the next 24 hours",
            sensor="any",
            priority=1,
            max_cloud_pct=20,
            max_resolution_m=1.0,
        ),
        "aoi": AOIContext("Singapore Port", 1.264, 103.84, 50),
        "candidates": demo_plan(now),
        "spacecraft": [
            SpacecraftState("SAT-007", 81, 63),
            SpacecraftState("SAT-018", 89, 78),
            SpacecraftState("SAT-042", 84, 71),
        ],
        "ground_assets": [
            GroundAsset("GS-SIN-01", "Singapore", ("S", "X"), "nominal", "own", 54),
            GroundAsset("GS-SE-01", "Sweden", ("S", "X", "Ka"), "nominal", "partner", 71),
            GroundAsset("GS-GSAAS-01", "GSaaS", ("S", "X"), "available", "gsaas", 37),
        ],
        "weather": [WeatherWindow(now + timedelta(hours=1), 12, True)],
        "now": now,
    }


def test_archive_first_path_skips_new_tasking_when_compliant_data_exists() -> None:
    now = datetime(2026, 8, 20, 12, tzinfo=timezone.utc)
    result = orchestrate_mission(
        **common_inputs(now),
        archive_products=[CatalogProduct("EO-OPT-1", "optical", 0.5, 8, 4)],
    )
    assert result["status"] == "executable"
    assert result["strategy"] == "archive-first"
    stages = [item["stage"] for item in result["workflow"]]
    assert tuple(stages) == CANONICAL_STAGES
    status = {item["stage"]: item["status"] for item in result["workflow"]}
    assert status["DATA_SEARCH"] == "resolved"
    assert status["OPPORTUNITY"] == "not_required"
    assert result["processing_delivery"]["mode"] == "SIMULATED"


def test_archive_only_blocks_instead_of_silently_tasking() -> None:
    now = datetime(2026, 8, 20, 12, tzinfo=timezone.utc)
    inputs = common_inputs(now)
    inputs["objective"] = MissionObjective(
        objective="Use archive data only",
        sensor="optical",
        priority=2,
        max_cloud_pct=5,
        max_resolution_m=0.4,
        data_strategy="archive",
    )
    result = orchestrate_mission(**inputs, archive_products=[])
    assert result["status"] == "no_feasible_plan"
    assert result["strategy"] == "archive-only"
    assert result["workflow"][-1]["stage"] == "DATA_SEARCH"
    assert result["workflow"][-1]["status"] == "blocked"


def test_tasking_path_runs_full_space_to_earth_chain() -> None:
    now = datetime(2026, 8, 20, 12, tzinfo=timezone.utc)
    inputs = common_inputs(now)
    inputs["objective"] = MissionObjective(
        objective="Acquire a new Singapore port image",
        sensor="any",
        priority=1,
        max_cloud_pct=20,
        max_resolution_m=1.0,
        data_strategy="tasking",
    )
    result = orchestrate_mission(
        **inputs,
        archive_products=[],
        delivery_target_hours=12,
    )
    assert result["status"] in {"executable", "executable_with_exceptions"}
    assert result["strategy"] == "tasking"
    stages = [item["stage"] for item in result["workflow"]]
    assert tuple(stages) == CANONICAL_STAGES
    assert result["selected"]["satellite"]["satellite_id"]
    assert result["selected"]["ground_station"]["id"] == "GS-SIN-01"
    assert result["selected"]["contact"]["resolution"] == "accepted"
    assert result["processing_delivery"]["delivery_eta"]


def test_ground_pool_is_conflict_resource_not_static_decoration() -> None:
    now = datetime(2026, 8, 20, 12, tzinfo=timezone.utc)
    inputs = common_inputs(now)
    inputs["objective"] = MissionObjective(
        objective="Acquire a new image",
        sensor="any",
        priority=3,
        max_cloud_pct=20,
        max_resolution_m=1.0,
        data_strategy="tasking",
    )
    inputs["ground_assets"] = [GroundAsset("GS-BLOCKED", "Blocked", ("S",), "nominal", "own", 10)]
    result = orchestrate_mission(**inputs, archive_products=[])
    assert result["status"] == "no_feasible_plan"
    assert "No compatible ground contact resource" in result["exceptions"]
    assert result["workflow"][-1]["stage"] == "CONTACT"
    assert result["workflow"][-1]["status"] == "blocked"


def test_conflict_resolution_falls_back_to_next_ground_asset() -> None:
    now = datetime(2026, 8, 20, 12, tzinfo=timezone.utc)
    inputs = common_inputs(now)
    inputs["objective"] = MissionObjective(
        objective="Acquire a new image",
        sensor="any",
        priority=3,
        max_cloud_pct=20,
        max_resolution_m=1.0,
        data_strategy="tasking",
    )
    best_candidate = demo_plan(now)[0]
    start = best_candidate.downlink_utc
    reservations = [
        GroundReservation(
            "CNT-BLOCK-OWN",
            "SAT-031",
            "GS-SIN-01",
            start,
            start + timedelta(minutes=15),
            1,
        )
    ]
    result = orchestrate_mission(**inputs, archive_products=[], ground_reservations=reservations)
    assert result["status"] in {"executable", "executable_with_exceptions"}
    assert result["selected"]["ground_station"]["id"] == "GS-SE-01"
    schedule = next(item for item in result["workflow"] if item["stage"] == "SCHEDULE")
    assert schedule["status"] == "resolved"


def test_high_priority_mission_can_preempt_lower_priority_contact() -> None:
    now = datetime(2026, 8, 20, 12, tzinfo=timezone.utc)
    inputs = common_inputs(now)
    inputs["objective"] = MissionObjective(
        objective="Priority acquisition",
        sensor="any",
        priority=1,
        max_cloud_pct=20,
        max_resolution_m=1.0,
        data_strategy="tasking",
    )
    best_candidate = demo_plan(now)[0]
    start = best_candidate.downlink_utc
    reservations = [
        GroundReservation(
            "CNT-LOW",
            "SAT-031",
            "GS-SIN-01",
            start,
            start + timedelta(minutes=15),
            4,
        )
    ]
    result = orchestrate_mission(**inputs, archive_products=[], ground_reservations=reservations)
    assert result["selected"]["ground_station"]["id"] == "GS-SIN-01"
    assert result["selected"]["contact"]["resolution"] == "preempt-lower-priority"
    assert "Lower-priority ground contact will be preempted" in result["exceptions"]
