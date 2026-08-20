from __future__ import annotations

from dataclasses import asdict
from typing import Iterable, Mapping, Any

from .planner import Candidate


def _resource_state(candidate: Candidate, satellite_pool: Iterable[Mapping[str, Any]]) -> Mapping[str, Any]:
    return next((item for item in satellite_pool if item.get("id") == candidate.satellite_id), {})


def _station_state(candidate: Candidate, ground_pool: Iterable[Mapping[str, Any]]) -> Mapping[str, Any]:
    return next((item for item in ground_pool if item.get("id") == candidate.ground_station_id), {})


def rank_operational_candidates(
    candidates: Iterable[Candidate],
    *,
    satellite_pool: Iterable[Mapping[str, Any]],
    ground_pool: Iterable[Mapping[str, Any]],
    min_battery_pct: float = 30,
    min_storage_free_pct: float = 20,
    max_station_utilization_pct: float = 90,
) -> list[dict[str, Any]]:
    """Rank acquisition candidates using mission, spacecraft and ground-network readiness.

    The base planner score remains intact; operational readiness is applied as an
    additional layer so the Mission Intelligence Engine can distinguish a good
    acquisition opportunity from an executable end-to-end opportunity.
    """
    ranked: list[dict[str, Any]] = []
    for candidate in candidates:
        satellite = _resource_state(candidate, satellite_pool)
        station = _station_state(candidate, ground_pool)

        battery = float(satellite.get("battery_pct", 0))
        storage = float(satellite.get("storage_free_pct", 0))
        utilization = float(station.get("utilization_pct", 100))
        station_available = station.get("status") in {"nominal", "available"}

        resource_ok = battery >= min_battery_pct and storage >= min_storage_free_pct
        ground_ok = station_available and utilization <= max_station_utilization_pct

        battery_factor = min(1.0, battery / 80.0)
        storage_factor = min(1.0, storage / 70.0)
        utilization_factor = max(0.0, 1.0 - utilization / 100.0)
        readiness = 0.4 * battery_factor + 0.3 * storage_factor + 0.3 * utilization_factor

        executable = resource_ok and ground_ok
        execution_penalty = 0.0 if executable else 0.35
        operational_score = round(max(0.0, 0.75 * candidate.score + 0.25 * readiness - execution_penalty), 4)

        reasons: list[str] = []
        if not resource_ok:
            reasons.append("spacecraft_resource_threshold")
        if not station_available:
            reasons.append("ground_station_unavailable")
        if utilization > max_station_utilization_pct:
            reasons.append("ground_station_capacity")

        ranked.append(
            {
                **asdict(candidate),
                "base_score": candidate.score,
                "operational_score": operational_score,
                "executable": executable,
                "resource_state": {
                    "battery_pct": battery,
                    "storage_free_pct": storage,
                    "ok": resource_ok,
                },
                "ground_state": {
                    "ground_station_id": candidate.ground_station_id,
                    "status": station.get("status", "unknown"),
                    "ownership": station.get("ownership", "unknown"),
                    "utilization_pct": utilization,
                    "ok": ground_ok,
                },
                "exceptions": reasons,
            }
        )

    return sorted(ranked, key=lambda item: (item["executable"], item["operational_score"]), reverse=True)
