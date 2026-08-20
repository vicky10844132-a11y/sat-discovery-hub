from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class AssetStatus(str, Enum):
    nominal = "nominal"
    degraded = "degraded"
    offline = "offline"


class GeoPoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    altitude_m: float = 0.0


class Satellite(BaseModel):
    id: str
    name: str
    norad_id: int | None = None
    operator: str | None = None
    orbit_type: Literal["LEO", "MEO", "GEO", "HEO", "OTHER"] = "LEO"
    status: AssetStatus = AssetStatus.nominal
    tle_line_1: str | None = None
    tle_line_2: str | None = None


class GroundStation(BaseModel):
    id: str
    name: str
    location: GeoPoint
    bands: list[str] = []
    tx_enabled: bool = False
    rx_enabled: bool = True
    status: AssetStatus = AssetStatus.nominal


class AOI(BaseModel):
    id: str
    name: str
    center: GeoPoint
    radius_km: float = Field(gt=0)


class ContactWindow(BaseModel):
    satellite_id: str
    ground_station_id: str
    aos_utc: datetime
    los_utc: datetime
    max_elevation_deg: float = Field(ge=0, le=90)


class AcquisitionOpportunity(BaseModel):
    satellite_id: str
    aoi_id: str
    start_utc: datetime
    end_utc: datetime
    sensor: str
    off_nadir_deg: float | None = None
    cloud_probability_pct: float | None = None
    feasible: bool = True
    reasons: list[str] = []


class MissionPlan(BaseModel):
    id: str
    objective: str
    acquisition: AcquisitionOpportunity
    contact: ContactWindow | None = None
    score: float = Field(ge=0, le=1)
    estimated_product_ready_utc: datetime | None = None
