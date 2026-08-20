from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from services.mission.planner import demo_plan
from services.orbit.engine import propagate_tle, sample_iss_tle

app = FastAPI(title="Space Ops Platform API", version="0.2.0")


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


class OrbitRequest(BaseModel):
    tle_line_1: str
    tle_line_2: str
    minutes: int = Field(default=90, ge=1, le=1440)
    step_seconds: int = Field(default=60, ge=5, le=600)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "space-ops-api",
        "version": "0.2.0",
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


@app.get("/v1/assets/ground-stations")
def ground_stations() -> list[dict]:
    return [
        {"id": "GS-SIN-01", "name": "Singapore", "lat": 1.3521, "lon": 103.8198, "bands": ["S", "X"], "status": "nominal"},
        {"id": "GS-SE-01", "name": "Sweden", "lat": 67.8558, "lon": 20.2253, "bands": ["S", "X", "Ka"], "status": "nominal"},
    ]


@app.get("/v1/orbit/demo")
def orbit_demo() -> dict:
    line1, line2 = sample_iss_tle()
    points = propagate_tle(line1, line2, datetime.now(timezone.utc), minutes=18, step_seconds=120)
    return {"satellite": "ISS-DEMO", "points": [point.__dict__ for point in points]}


@app.post("/v1/orbit/propagate")
def orbit_propagate(request: OrbitRequest) -> dict:
    points = propagate_tle(
        request.tle_line_1,
        request.tle_line_2,
        datetime.now(timezone.utc),
        minutes=request.minutes,
        step_seconds=request.step_seconds,
    )
    return {"count": len(points), "points": [point.__dict__ for point in points]}


@app.post("/v1/missions/plan")
def plan_mission(request: MissionRequest) -> dict:
    candidates = demo_plan()
    if request.sensor != "any":
        candidates = [candidate for candidate in candidates if candidate.sensor == request.sensor]
    if request.max_cloud_pct is not None:
        candidates = [candidate for candidate in candidates if candidate.cloud_pct is None or candidate.cloud_pct <= request.max_cloud_pct]
    if request.max_resolution_m is not None:
        candidates = [candidate for candidate in candidates if candidate.resolution_m <= request.max_resolution_m]

    recommended = candidates[0] if candidates else None
    return {
        "mission": request.model_dump(),
        "status": "planned" if recommended else "no_feasible_plan",
        "candidate_count": len(candidates),
        "recommended": recommended.__dict__ if recommended else None,
        "candidates": [candidate.__dict__ for candidate in candidates],
    }
