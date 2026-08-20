from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from math import atan2, cos, degrees, radians, sin, sqrt

from sgp4.api import Satrec, jday

EARTH_RADIUS_KM = 6378.137


@dataclass(frozen=True)
class OrbitPoint:
    time_utc: datetime
    x_km: float
    y_km: float
    z_km: float
    vx_km_s: float
    vy_km_s: float
    vz_km_s: float
    lat_deg: float
    lon_deg: float
    altitude_km: float


def _gmst_rad(dt: datetime) -> float:
    dt = dt.astimezone(timezone.utc)
    jd, fr = jday(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second + dt.microsecond / 1e6)
    d = (jd + fr) - 2451545.0
    gmst_deg = (280.46061837 + 360.98564736629 * d) % 360.0
    return radians(gmst_deg)


def _eci_to_geodetic(x: float, y: float, z: float, dt: datetime) -> tuple[float, float, float]:
    theta = _gmst_rad(dt)
    x_ecef = cos(theta) * x + sin(theta) * y
    y_ecef = -sin(theta) * x + cos(theta) * y
    z_ecef = z
    lon = atan2(y_ecef, x_ecef)
    r_xy = sqrt(x_ecef * x_ecef + y_ecef * y_ecef)
    lat = atan2(z_ecef, r_xy)
    radius = sqrt(x_ecef * x_ecef + y_ecef * y_ecef + z_ecef * z_ecef)
    return degrees(lat), ((degrees(lon) + 180) % 360) - 180, radius - EARTH_RADIUS_KM


def propagate_tle(line1: str, line2: str, start_utc: datetime, minutes: int = 90, step_seconds: int = 60) -> list[OrbitPoint]:
    sat = Satrec.twoline2rv(line1, line2)
    start = start_utc.astimezone(timezone.utc)
    points: list[OrbitPoint] = []
    total_seconds = minutes * 60

    for offset in range(0, total_seconds + 1, step_seconds):
        t = start + timedelta(seconds=offset)
        jd, fr = jday(t.year, t.month, t.day, t.hour, t.minute, t.second + t.microsecond / 1e6)
        error, r, v = sat.sgp4(jd, fr)
        if error:
            continue
        lat, lon, alt = _eci_to_geodetic(r[0], r[1], r[2], t)
        points.append(
            OrbitPoint(
                time_utc=t,
                x_km=r[0], y_km=r[1], z_km=r[2],
                vx_km_s=v[0], vy_km_s=v[1], vz_km_s=v[2],
                lat_deg=lat, lon_deg=lon, altitude_km=alt,
            )
        )
    return points


def sample_iss_tle() -> tuple[str, str]:
    return (
        "1 25544U 98067A   24233.51041667  .00016717  00000+0  30125-3 0  9996",
        "2 25544  51.6414  42.6337 0005288  52.2515  51.8367 15.50000000468452",
    )
