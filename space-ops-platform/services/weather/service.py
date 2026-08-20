from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class WeatherConstraint:
    timestamp_utc: datetime
    cloud_pct: float | None = None
    precipitation_mm_h: float | None = None
    wind_m_s: float | None = None
    visibility_km: float | None = None


def optical_window_is_feasible(weather: WeatherConstraint, max_cloud_pct: float | None) -> bool:
    if max_cloud_pct is None or weather.cloud_pct is None:
        return True
    return weather.cloud_pct <= max_cloud_pct
