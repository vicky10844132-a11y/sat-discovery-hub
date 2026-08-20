from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from math import asin, atan2, cos, degrees, radians, sin, sqrt
from typing import Callable

EARTH_RADIUS_KM = 6378.137


@dataclass(frozen=True)
class GroundStationRef:
    id: str
    lat_deg: float
    lon_deg: float
    altitude_m: float = 0.0
    min_elevation_deg: float = 10.0


@dataclass(frozen=True)
class PassWindow:
    station_id: str
    aos_utc: datetime
    tca_utc: datetime
    los_utc: datetime
    max_elevation_deg: float
    duration_s: float


def _ecef_from_geodetic(lat_deg: float, lon_deg: float, alt_km: float = 0.0) -> tuple[float, float, float]:
    lat = radians(lat_deg)
    lon = radians(lon_deg)
    r = EARTH_RADIUS_KM + alt_km
    return r * cos(lat) * cos(lon), r * cos(lat) * sin(lon), r * sin(lat)


def elevation_deg(sat_ecef_km: tuple[float, float, float], station: GroundStationRef) -> float:
    sx, sy, sz = sat_ecef_km
    gx, gy, gz = _ecef_from_geodetic(station.lat_deg, station.lon_deg, station.altitude_m / 1000.0)
    dx, dy, dz = sx - gx, sy - gy, sz - gz
    rng = sqrt(dx * dx + dy * dy + dz * dz)
    lat = radians(station.lat_deg)
    lon = radians(station.lon_deg)
    up = cos(lat) * cos(lon) * dx + cos(lat) * sin(lon) * dy + sin(lat) * dz
    return degrees(asin(max(-1.0, min(1.0, up / rng))))


def predict_passes(
    station: GroundStationRef,
    position_provider: Callable[[datetime], tuple[float, float, float]],
    start_utc: datetime | None = None,
    horizon_hours: float = 24.0,
    step_seconds: int = 30,
) -> list[PassWindow]:
    """Generic pass detector.

    position_provider must return satellite ECEF position in km for a UTC datetime.
    The function is deliberately independent from the chosen propagator so SGP4,
    numerical propagation, or precise ephemeris can share the same access engine.
    """
    start = (start_utc or datetime.now(timezone.utc)).astimezone(timezone.utc)
    end = start + timedelta(hours=horizon_hours)
    step = timedelta(seconds=step_seconds)

    passes: list[PassWindow] = []
    in_pass = False
    aos: datetime | None = None
    peak_t: datetime | None = None
    peak_el = -90.0
    t = start

    while t <= end:
        el = elevation_deg(position_provider(t), station)
        visible = el >= station.min_elevation_deg
        if visible and not in_pass:
            in_pass = True
            aos = t
            peak_t = t
            peak_el = el
        elif visible and in_pass and el > peak_el:
            peak_el = el
            peak_t = t
        elif not visible and in_pass:
            los = t
            passes.append(
                PassWindow(
                    station_id=station.id,
                    aos_utc=aos or t,
                    tca_utc=peak_t or t,
                    los_utc=los,
                    max_elevation_deg=round(peak_el, 2),
                    duration_s=(los - (aos or los)).total_seconds(),
                )
            )
            in_pass = False
            aos = peak_t = None
            peak_el = -90.0
        t += step

    return passes
