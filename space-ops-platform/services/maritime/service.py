from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class VesselTrackPoint:
    mmsi: str
    timestamp_utc: datetime
    lat: float
    lon: float
    speed_knots: float | None = None
    course_deg: float | None = None


def predict_linear_position(point: VesselTrackPoint, minutes_ahead: float) -> VesselTrackPoint:
    """Framework placeholder for maritime target prediction.

    The production implementation will replace this with geodesic motion and
    uncertainty envelopes before satellite opportunity matching.
    """
    return point
