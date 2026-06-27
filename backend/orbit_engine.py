"""Orbit/contact window engine for GS LinkOps AI.

Production target:
- Use Skyfield/SGP4 to propagate TLE.
- Calculate station visibility windows.
- Return start/end UTC, duration, max elevation, azimuth profile.

This file is kept separate from the API so the orbit service can later be
exposed as a microservice or worker.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional

try:
    from skyfield.api import EarthSatellite, Topos, load
except Exception:  # pragma: no cover - allows app import before dependency install
    EarthSatellite = None
    Topos = None
    load = None


@dataclass
class Station:
    name: str
    latitude: float
    longitude: float
    altitude_m: float = 0.0
    minimum_elevation_deg: float = 10.0


@dataclass
class SatelliteTLE:
    name: str
    tle_line_1: str
    tle_line_2: str


@dataclass
class ContactWindow:
    start_utc: str
    end_utc: str
    duration_min: float
    max_elevation_deg: float
    orbit_mode: str


def calculate_contact_windows(
    satellite: SatelliteTLE,
    station: Station,
    start_utc: Optional[datetime] = None,
    hours: int = 24,
    step_seconds: int = 30,
) -> List[ContactWindow]:
    """Calculate visible contact windows using Skyfield.

    This function requires `skyfield` and valid TLE lines. It scans the time
    range at a fixed step and groups intervals where elevation is above the
    station minimum elevation.
    """
    if EarthSatellite is None or Topos is None or load is None:
        raise RuntimeError("Skyfield is not installed. Install requirements-gs-linkops.txt first.")

    start_utc = start_utc or datetime.now(timezone.utc)
    end_utc = start_utc + timedelta(hours=hours)
    ts = load.timescale()
    sat = EarthSatellite(satellite.tle_line_1, satellite.tle_line_2, satellite.name, ts)
    site = Topos(latitude_degrees=station.latitude, longitude_degrees=station.longitude, elevation_m=station.altitude_m)

    windows: List[ContactWindow] = []
    in_window = False
    win_start: Optional[datetime] = None
    max_el = -90.0
    last_above: Optional[datetime] = None

    t = start_utc
    while t <= end_utc:
        sf_time = ts.from_datetime(t)
        difference = sat - site
        topocentric = difference.at(sf_time)
        alt, _az, _distance = topocentric.altaz()
        elevation = alt.degrees
        above = elevation >= station.minimum_elevation_deg

        if above and not in_window:
            in_window = True
            win_start = t
            max_el = elevation
        elif above and in_window:
            max_el = max(max_el, elevation)
        elif not above and in_window:
            if win_start and last_above:
                duration = (last_above - win_start).total_seconds() / 60.0
                windows.append(ContactWindow(
                    start_utc=win_start.isoformat(),
                    end_utc=last_above.isoformat(),
                    duration_min=round(duration, 2),
                    max_elevation_deg=round(max_el, 2),
                    orbit_mode="Skyfield/SGP4",
                ))
            in_window = False
            win_start = None
            max_el = -90.0
        if above:
            last_above = t
        t += timedelta(seconds=step_seconds)

    if in_window and win_start and last_above:
        duration = (last_above - win_start).total_seconds() / 60.0
        windows.append(ContactWindow(
            start_utc=win_start.isoformat(),
            end_utc=last_above.isoformat(),
            duration_min=round(duration, 2),
            max_elevation_deg=round(max_el, 2),
            orbit_mode="Skyfield/SGP4",
        ))

    return windows
