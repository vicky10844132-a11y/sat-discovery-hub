from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, HttpUrl


class EOAsset(BaseModel):
    href: str
    title: str | None = None
    media_type: str | None = None
    roles: list[str] = Field(default_factory=list)


class EOScene(BaseModel):
    """Provider-neutral EO scene metadata used across DATA SEARCH and delivery flows."""

    scene_id: str
    provider: str
    satellite: str | None = None
    sensor: str | None = None
    acquisition_time: datetime
    geometry: dict[str, Any]
    bbox: list[float] = Field(min_length=4, max_length=4)
    resolution_m: float | None = None
    cloud_cover_pct: float | None = Field(default=None, ge=0, le=100)
    off_nadir_deg: float | None = None
    product_level: str | None = None
    license: str | None = None
    price: float | None = None
    currency: str | None = None
    availability: Literal["archive", "tasking", "unknown"] = "unknown"
    assets: dict[str, EOAsset] = Field(default_factory=dict)
    extra: dict[str, Any] = Field(default_factory=dict)
