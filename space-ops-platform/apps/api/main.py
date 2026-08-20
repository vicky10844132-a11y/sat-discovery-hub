from datetime import datetime, timedelta, timezone
from math import log10
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.mission.planner import demo_plan
from services.orbit.engine import propagate_tle, sample_iss_tle

app = FastAPI(title="Space Ops Platform API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


class PassRequest(BaseModel):
    satellite_id: str = "SAT-007"
    ground_station_id: str = "GS-SIN-01"
    min_elevation_deg: float = Field(default=10, ge=0, le=90)
    horizon_hours: int = Field(default=24, ge=1, le=168)


class GroundScheduleRequest(BaseModel):
    satellite_id: str
    ground_station_id: str
    start_time: datetime
    duration_min: int = Field(default=10, ge=1, le=60)
    priority: int = Field(default=3, ge=1, le=5)


class WeatherRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    hours: int = Field(default=24, ge=1, le=168)


class MaritimeRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    radius_km: float = Field(default=100, gt=0, le=1000)


class EOSearchRequest(BaseModel):
    aoi: AOI
    sensor: Literal["optical", "sar", "any"] = "any"
    max_resolution_m: float | None = Field(default=None, gt=0)
    max_cloud_pct: float | None = Field(default=None, ge=0, le=100)


class LinkBudgetRequest(BaseModel):
    frequency_ghz: float = Field(gt=0)
    range_km: float = Field(gt=0)
    tx_power_dbw: float
    tx_gain_dbi: float
    rx_gain_dbi: float
    other_losses_db: float = Field(default=2.0, ge=0)


SERVICE_STATUS = {
    "orbit": "live-algorithm",
    "mission": "rule-engine",
    "ground_network": "rule-engine",
    "weather": "demo-provider",
    "maritime": "demo-provider",
    "eo": "demo-provider",
    "copilot": "demo-orchestrator",
}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "space-ops-api",
        "version": "0.3.0",
        "time": utcnow().isoformat(),
        "modules": SERVICE_STATUS,
    }


@app.get("/v1/system/modules")
def system_modules() -> dict:
    return {
        "modules": [
            {"id": key, "mode": value, "ready": True}
            for key, value in SERVICE_STATUS.items()
        ]
    }


@app.get("/v1/operations/summary")
def operations_summary() -> dict:
    return {
        "tracked_satellites": 128,
        "ground_stations": 6,
        "active_missions": 14,
        "live_downlinks": 3,
        "upcoming_passes": 21,
        "alerts": 2,
    }


@app.get("/v1/assets/ground-stations")
def ground_stations() -> list[dict]:
    return [
        {"id": "GS-SIN-01", "name": "Singapore", "lat": 1.3521, "lon": 103.8198, "bands": ["S", "X"], "status": "nominal", "antennas": 2},
        {"id": "GS-SE-01", "name": "Sweden", "lat": 67.8558, "lon": 20.2253, "bands": ["S", "X", "Ka"], "status": "nominal", "antennas": 2},
    ]


@app.get("/v1/assets/satellites")
def satellites() -> list[dict]:
    return [
        {"id": "SAT-007", "sensor": "optical", "resolution_m": 0.7, "status": "tasked"},
        {"id": "SAT-018", "sensor": "optical", "resolution_m": 0.5, "status": "nominal"},
        {"id": "SAT-042", "sensor": "sar", "resolution_m": 1.0, "status": "nominal"},
        {"id": "SAT-031", "sensor": "optical", "resolution_m": 0.8, "status": "nominal"},
    ]


@app.get("/v1/orbit/demo")
def orbit_demo() -> dict:
    line1, line2 = sample_iss_tle()
    points = propagate_tle(line1, line2, utcnow(), minutes=18, step_seconds=120)
    return {"satellite": "ISS-DEMO", "points": [point.__dict__ for point in points]}


@app.post("/v1/orbit/propagate")
def orbit_propagate(request: OrbitRequest) -> dict:
    points = propagate_tle(
        request.tle_line_1,
        request.tle_line_2,
        utcnow(),
        minutes=request.minutes,
        step_seconds=request.step_seconds,
    )
    return {"count": len(points), "points": [point.__dict__ for point in points]}


@app.post("/v1/passes/predict")
def predict_passes(request: PassRequest) -> dict:
    now = utcnow().replace(second=0, microsecond=0)
    offsets = [38, 132, 226, 321]
    passes = []
    for idx, offset in enumerate(offsets):
        aos = now + timedelta(minutes=offset)
        duration = 8 + (idx % 3)
        tca = aos + timedelta(minutes=duration / 2)
        los = aos + timedelta(minutes=duration)
        passes.append({
            "satellite_id": request.satellite_id,
            "ground_station_id": request.ground_station_id,
            "aos": aos.isoformat(),
            "tca": tca.isoformat(),
            "los": los.isoformat(),
            "duration_min": duration,
            "max_elevation_deg": round(32 + idx * 11.5, 1),
            "min_elevation_deg": request.min_elevation_deg,
            "mode": "deterministic-demo-pass-model",
        })
    return {"count": len(passes), "passes": passes}


@app.post("/v1/ground-network/schedule")
def schedule_contact(request: GroundScheduleRequest) -> dict:
    end_time = request.start_time + timedelta(minutes=request.duration_min)
    conflict = request.start_time.minute % 17 == 0
    return {
        "status": "conflict" if conflict else "scheduled",
        "contact": {
            "satellite_id": request.satellite_id,
            "ground_station_id": request.ground_station_id,
            "start_time": request.start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "priority": request.priority,
        },
        "conflict": conflict,
        "resolution": "try-next-window" if conflict else "accepted",
    }


@app.post("/v1/weather/check")
def weather_check(request: WeatherRequest) -> dict:
    base = int(abs(request.lat * 7 + request.lon * 3)) % 65
    forecast = []
    for hour in range(0, request.hours, 3):
        cloud = (base + hour * 3) % 100
        forecast.append({
            "time": (utcnow() + timedelta(hours=hour)).isoformat(),
            "cloud_pct": cloud,
            "precip_mm": round((cloud / 100) * 1.8, 2),
            "wind_mps": round(3.5 + (hour % 12) * 0.35, 1),
            "optical_feasible": cloud <= 20,
        })
    return {"provider": "demo-provider", "forecast": forecast}


@app.post("/v1/maritime/search")
def maritime_search(request: MaritimeRequest) -> dict:
    vessels = [
        {"mmsi": "563123456", "name": "PACIFIC MERIDIAN", "type": "Cargo", "distance_km": 18.4, "sog_kn": 13.2, "cog_deg": 84},
        {"mmsi": "565987654", "name": "EASTERN STAR", "type": "Tanker", "distance_km": 42.7, "sog_kn": 9.8, "cog_deg": 241},
        {"mmsi": "566101010", "name": "STRAIT RUNNER", "type": "Container", "distance_km": 67.1, "sog_kn": 15.4, "cog_deg": 103},
    ]
    return {"provider": "demo-provider", "center": request.model_dump(), "count": len(vessels), "vessels": vessels}


@app.post("/v1/eo/search")
def eo_search(request: EOSearchRequest) -> dict:
    products = [
        {"id": "EO-OPT-2401", "sensor": "optical", "resolution_m": 0.5, "cloud_pct": 8, "age_hours": 6, "mode": "archive"},
        {"id": "EO-SAR-9011", "sensor": "sar", "resolution_m": 1.0, "cloud_pct": None, "age_hours": 3, "mode": "archive"},
        {"id": "EO-OPT-2394", "sensor": "optical", "resolution_m": 0.8, "cloud_pct": 17, "age_hours": 18, "mode": "archive"},
    ]
    if request.sensor != "any":
        products = [p for p in products if p["sensor"] == request.sensor]
    if request.max_resolution_m is not None:
        products = [p for p in products if p["resolution_m"] <= request.max_resolution_m]
    if request.max_cloud_pct is not None:
        products = [p for p in products if p["cloud_pct"] is None or p["cloud_pct"] <= request.max_cloud_pct]
    return {"provider": "demo-provider", "count": len(products), "products": products}


@app.post("/v1/link-budget")
def link_budget(request: LinkBudgetRequest) -> dict:
    fspl = 92.45 + 20 * log10(request.frequency_ghz) + 20 * log10(request.range_km)
    received = request.tx_power_dbw + request.tx_gain_dbi + request.rx_gain_dbi - fspl - request.other_losses_db
    return {
        "free_space_path_loss_db": round(fspl, 2),
        "received_power_dbw": round(received, 2),
        "margin_class": "strong" if received > -110 else "marginal" if received > -125 else "weak",
    }


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


@app.get("/v1/alerts")
def alerts() -> dict:
    return {
        "count": 2,
        "alerts": [
            {"severity": "warning", "code": "WX-CLOUD", "message": "Cloud risk rising for Singapore optical window"},
            {"severity": "info", "code": "GS-QUEUE", "message": "Sweden X-band queue above 70% utilization"},
        ],
    }
