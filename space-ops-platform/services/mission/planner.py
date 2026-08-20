from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass(frozen=True)
class Candidate:
    satellite_id: str
    sensor: str
    acquisition_utc: datetime
    cloud_pct: float | None
    resolution_m: float
    off_nadir_deg: float
    ground_station_id: str
    downlink_utc: datetime
    latency_min: int
    score: float


def score_candidate(*, resolution_m: float, off_nadir_deg: float, cloud_pct: float | None, latency_min: int) -> float:
    resolution_score = max(0.0, min(1.0, 1.2 - resolution_m / 2.0))
    geometry_score = max(0.0, 1.0 - off_nadir_deg / 45.0)
    cloud_score = 1.0 if cloud_pct is None else max(0.0, 1.0 - cloud_pct / 100.0)
    latency_score = max(0.0, 1.0 - latency_min / 180.0)
    return round(0.35 * resolution_score + 0.25 * geometry_score + 0.20 * cloud_score + 0.20 * latency_score, 4)


def demo_plan(now: datetime | None = None) -> list[Candidate]:
    now = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    raw = [
        ("SAT-007", "optical", 18, 8.0, 0.7, 12.0, "GS-SIN-01", 31),
        ("SAT-042", "sar", 26, None, 0.9, 19.0, "GS-SIN-01", 41),
        ("SAT-018", "optical", 44, 17.0, 0.5, 28.0, "GS-SE-01", 72),
    ]
    candidates: list[Candidate] = []
    for sat, sensor, acq_offset, cloud, res, off_nadir, gs, downlink_offset in raw:
        score = score_candidate(
            resolution_m=res,
            off_nadir_deg=off_nadir,
            cloud_pct=cloud,
            latency_min=downlink_offset,
        )
        candidates.append(
            Candidate(
                satellite_id=sat,
                sensor=sensor,
                acquisition_utc=now + timedelta(minutes=acq_offset),
                cloud_pct=cloud,
                resolution_m=res,
                off_nadir_deg=off_nadir,
                ground_station_id=gs,
                downlink_utc=now + timedelta(minutes=downlink_offset),
                latency_min=downlink_offset,
                score=score,
            )
        )
    return sorted(candidates, key=lambda item: item.score, reverse=True)
