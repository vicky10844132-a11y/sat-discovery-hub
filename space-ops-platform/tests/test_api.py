from __future__ import annotations

import sys
from pathlib import Path

from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from apps.api.main import app

client = TestClient(app)


def test_health_and_summary() -> None:
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

    summary = client.get("/v1/operations/summary")
    assert summary.status_code == 200
    body = summary.json()
    assert body["tracked_satellites"] > 0
    assert body["ground_stations"] > 0


def test_mission_planner_returns_feasible_candidate() -> None:
    response = client.post(
        "/v1/missions/plan",
        json={
            "name": "Singapore Port Watch",
            "aoi": {"name": "Singapore Port", "lat": 1.264, "lon": 103.84, "radius_km": 50},
            "sensor": "any",
            "max_cloud_pct": 20,
            "max_resolution_m": 1,
            "priority": 1,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "planned"
    assert body["candidate_count"] >= 1
    assert body["recommended"]["satellite_id"]


def test_pass_prediction_and_ground_schedule() -> None:
    predicted = client.post(
        "/v1/passes/predict",
        json={
            "satellite_id": "SAT-007",
            "ground_station_id": "GS-SIN-01",
            "min_elevation_deg": 10,
            "horizon_hours": 24,
        },
    )
    assert predicted.status_code == 200
    passes = predicted.json()["passes"]
    assert len(passes) == 4

    first = passes[0]
    scheduled = client.post(
        "/v1/ground-network/schedule",
        json={
            "satellite_id": first["satellite_id"],
            "ground_station_id": first["ground_station_id"],
            "start_time": first["aos"],
            "duration_min": 10,
            "priority": 3,
        },
    )
    assert scheduled.status_code == 200
    assert scheduled.json()["status"] in {"scheduled", "conflict"}


def test_link_budget() -> None:
    response = client.post(
        "/v1/link-budget",
        json={
            "frequency_ghz": 8.2,
            "range_km": 1200,
            "tx_power_dbw": 13,
            "tx_gain_dbi": 18,
            "rx_gain_dbi": 42,
            "other_losses_db": 2,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "free_space_path_loss_db" in body
    assert "received_power_dbw" in body
    assert body["margin_class"] in {"strong", "marginal", "weak"}
