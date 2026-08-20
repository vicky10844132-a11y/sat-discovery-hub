from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal


@dataclass(slots=True)
class EOAsset:
    satellite_id: str
    sensor: Literal["optical", "sar", "other"]
    resolution_m: float | None
    archive_available: bool = False
    tasking_available: bool = True


@dataclass(slots=True)
class EOOpportunity:
    satellite_id: str
    start_utc: datetime
    end_utc: datetime
    off_nadir_deg: float | None
    cloud_pct: float | None
    score: float


def rank_opportunities(items: list[EOOpportunity]) -> list[EOOpportunity]:
    return sorted(items, key=lambda item: item.score, reverse=True)
