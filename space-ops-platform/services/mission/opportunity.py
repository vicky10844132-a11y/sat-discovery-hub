from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from math import acos, cos, radians, sin


@dataclass(frozen=True)
class AOICircle:
    id: str
    lat_deg: float
    lon_deg: float
    radius_km: float


@dataclass(frozen=True)
class SensorConstraint:
    sensor: str
    max_off_nadir_deg: float = 35.0
    max_cloud_pct: float | None = None
    max_resolution_m: float | None = None


@dataclass(frozen=True)
class Opportunity:
    satellite_id: str
    aoi_id: str
    start_utc: datetime
    end_utc: datetime
    off_nadir_deg: float
    cloud_pct: float | None
    resolution_m: float | None
    feasible: bool
    score: float
    reasons: tuple[str, ...]


def _angular_distance_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = radians(lat1), radians(lat2)
    dl = radians(lon2 - lon1)
    value = sin(p1) * sin(p2) + cos(p1) * cos(p2) * cos(dl)
    return acos(max(-1.0, min(1.0, value))) * 57.29577951308232


def evaluate_opportunity(
    *,
    satellite_id: str,
    aoi: AOICircle,
    start_utc: datetime,
    end_utc: datetime,
    subsatellite_lat_deg: float,
    subsatellite_lon_deg: float,
    off_nadir_deg: float,
    cloud_pct: float | None,
    resolution_m: float | None,
    constraint: SensorConstraint,
) -> Opportunity:
    reasons: list[str] = []
    center_distance_deg = _angular_distance_deg(
        subsatellite_lat_deg, subsatellite_lon_deg, aoi.lat_deg, aoi.lon_deg
    )
    if off_nadir_deg > constraint.max_off_nadir_deg:
        reasons.append("off_nadir_limit")
    if constraint.max_cloud_pct is not None and cloud_pct is not None and cloud_pct > constraint.max_cloud_pct:
        reasons.append("cloud_limit")
    if constraint.max_resolution_m is not None and resolution_m is not None and resolution_m > constraint.max_resolution_m:
        reasons.append("resolution_limit")

    geometry_score = max(0.0, 1.0 - off_nadir_deg / max(1.0, constraint.max_off_nadir_deg))
    cloud_score = 1.0 if cloud_pct is None else max(0.0, 1.0 - cloud_pct / 100.0)
    center_score = max(0.0, 1.0 - center_distance_deg / 10.0)
    score = round(0.5 * geometry_score + 0.3 * cloud_score + 0.2 * center_score, 4)

    return Opportunity(
        satellite_id=satellite_id,
        aoi_id=aoi.id,
        start_utc=start_utc,
        end_utc=end_utc,
        off_nadir_deg=off_nadir_deg,
        cloud_pct=cloud_pct,
        resolution_m=resolution_m,
        feasible=not reasons,
        score=score,
        reasons=tuple(reasons),
    )
