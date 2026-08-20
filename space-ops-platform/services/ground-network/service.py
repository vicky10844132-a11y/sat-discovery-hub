from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class GroundContactCandidate:
    satellite_id: str
    ground_station_id: str
    aos_utc: datetime
    los_utc: datetime
    max_elevation_deg: float
    score: float


def rank_contacts(candidates: list[GroundContactCandidate]) -> list[GroundContactCandidate]:
    """Framework-level ranking hook for ground-network scheduling.

    Real scoring will later include priority, RF-band compatibility, conflicts,
    latency, downlink capacity, commercial policy and operator constraints.
    """
    return sorted(candidates, key=lambda item: item.score, reverse=True)
