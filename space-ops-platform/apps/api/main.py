from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Space Ops Platform API", version="0.1.0")


class AOI(BaseModel):
    name: str
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    radius_km: float = Field(gt=0, le=10000)


class MissionRequest(BaseModel):
    name: str
    aoi: AOI
    sensor: Literal["optical", "sar", "any"] = "any"
    max_cloud_pct: float | None = Field(default=None, ge=0, le=100)
    max_resolution_m: float | None = Field(default=None, gt=0)
    priority: int = Field(default=3, ge=1, le=5)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "space-ops-api",
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/v1/operations/summary")
def operations_summary() -> dict:
    return {
        "tracked_satellites": 128,
        "ground_stations": 6,
        "active_missions": 14,
        "live_downlinks": 3,
        "upcoming_passes": 21,
    }


@app.post("/v1/missions/plan")
def plan_mission(request: MissionRequest) -> dict:
    # V0 deterministic contract. The planning engine will replace these mock
    # candidates once orbit, weather, payload and ground-network services are wired.
    return {
        "mission": request.model_dump(),
        "status": "planned",
        "candidate_count": 3,
        "recommended": {
            "satellite_id": "SAT-007",
            "acquisition_utc": "2026-08-20T02:34:00Z",
            "ground_station_id": "GS-SIN-01",
            "downlink_utc": "2026-08-20T02:47:00Z",
            "estimated_product_ready_utc": "2026-08-20T03:18:00Z",
        },
    }
