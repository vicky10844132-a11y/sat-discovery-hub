from datetime import datetime, timedelta, timezone
from math import log10
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.mission.planner import demo_plan
from services.orbit.engine import propagate_tle, sample_iss_tle

app = FastAPI(title="Space Ops Platform API", version="0.4.0")
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


class CopilotRequest(MissionRequest):
    objective: str = Field(min_length=3)
    horizon_hours: int = Field(default=24, ge=1, le=168)
    delivery_target_hours: float | None = Field(default=None, gt=0, le=168)


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
    "orbit": "LIVE",
    "mission": "LIVE",
    "ground_network": "LIVE",
    "weather": "SIMULATED",
    "maritime": "SIMULATED",
    "eo": "SIMULATED",
    "copilot": "LIVE",
    "processing_delivery": "SIMULATED",
    "gnc_adcs": "CONNECTOR_REQUIRED",
    "gnss_pod": "CONNECTOR_REQUIRED",
    "numerical_dynamics": "CONNECTOR_REQUIRED",
}

GROUND_POOL = [
    {"id": "GS-SIN-01", "name": "Singapore", "lat": 1.3521, "lon": 103.8198, "bands": ["S", "X"], "status": "nominal", "antennas": 2, "ownership": "own", "utilization_pct": 54},
    {"id": "GS-SE-01", "name": "Sweden", "lat": 67.8558, "lon": 20.2253, "bands": ["S", "X", "Ka"], "status": "nominal", "antennas": 2, "ownership": "partner", "utilization_pct": 71},
    {"id": "GS-GSAAS-01", "name": "Virtual GSaaS", "lat": 35.0, "lon": 10.0, "bands": ["S", "X"], "status": "available", "antennas": 1, "ownership": "gsaas", "utilization_pct": 37},
]

SATELLITE_POOL = [
    {"id": "SAT-007", "sensor": "optical", "resolution_m": 0.7, "status": "tasked", "storage_free_pct": 63, "battery_pct": 81},
    {"id": "SAT-018", "sensor": "optical", "resolution_m": 0.5, "status": "nominal", "storage_free_pct": 78, "battery_pct": 89},
    {"id": "SAT-042", "sensor": "sar", "resolution_m": 1.0, "status": "nominal", "storage_free_pct": 71, "battery_pct": 84},
    {"id": "SAT-031", "sensor": "optical", "resolution_m": 0.8, "status": "nominal", "storage_free_pct": 55, "battery_pct": 76},
]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def build_weather(request: WeatherRequest) -> list[dict]:
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
    return forecast


def build_passes(satellite_id: str, ground_station_id: str, min_elevation_deg: float = 10) -> list[dict]:
    now = utcnow().replace(second=0, microsecond=0)
    offsets = [38, 132, 226, 321]
    passes = []
    for idx, offset in enumerate(offsets):
        aos = now + timedelta(minutes=offset)
        duration = 8 + (idx % 3)
        tca = aos + timedelta(minutes=duration / 2)
        los = aos + timedelta(minutes=duration)
        passes.append({
            "satellite_id": satellite_id,
            "ground_station_id": ground_station_id,
            "aos": aos.isoformat(),
            "tca": tca.isoformat(),
            "los": los.isoformat(),
            "duration_min": duration,
            "max_elevation_deg": round(32 + idx * 11.5, 1),
            "min_elevation_deg": min_elevation_deg,
            "mode": "SIMULATED",
        })
    return passes


def select_mission_candidates(request: MissionRequest):
    candidates = demo_plan()
    if request.sensor != "any":
        candidates = [candidate for candidate in candidates if candidate.sensor == request.sensor]
    if request.max_cloud_pct is not None:
        candidates = [candidate for candidate in candidates if candidate.cloud_pct is None or candidate.cloud_pct <= request.max_cloud_pct]
    if request.max_resolution_m is not None:
        candidates = [candidate for candidate in candidates if candidate.resolution_m <= request.max_resolution_m]
    return candidates


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "space-ops-api",
        "version": "0.4.0",
        "time": utcnow().isoformat(),
        "modules": SERVICE_STATUS,
    }


@app.get("/v1/system/modules")
def system_modules() -> dict:
    return {"modules": [{"id": key, "mode": value, "ready": value != "CONNECTOR_REQUIRED"} for key, value in SERVICE_STATUS.items()]}


@app.get("/v1/operations/summary")
def operations_summary() -> dict:
    return {
        "tracked_satellites": 128,
        "ground_stations": len(GROUND_POOL),
        "active_missions": 14,
        "live_downlinks": 3,
        "upcoming_passes": 21,
        "alerts": 2,
    }


@app.get("/v1/assets/ground-stations")
def ground_stations() -> list[dict]:
    return GROUND_POOL


@app.get("/v1/assets/satellites")
def satellites() -> list[dict]:
    return SATELLITE_POOL


@app.get("/v1/engineering/capabilities")
def engineering_capabilities() -> dict:
    return {
        "tiers": [
            {"id": "fast", "name": "TLE / SGP4", "mode": "LIVE", "capabilities": ["TLE propagation", "access geometry", "quick-look ephemeris"]},
            {"id": "business", "name": "Numerical Dynamics", "mode": "CONNECTOR_REQUIRED", "capabilities": ["J2/J3/J4", "drag", "SRP", "Sun/Moon perturbations", "configurable force models"]},
            {"id": "precision", "name": "GNSS / POD", "mode": "CONNECTOR_REQUIRED", "capabilities": ["GNSS observations", "SP3", "RINEX", "precise orbit determination"]},
        ],
        "gnc_adcs": {"mode": "CONNECTOR_REQUIRED", "capabilities": ["attitude state", "quaternion/Euler transforms", "EKF hook", "slew/pointing constraints"]},
    }


@app.get("/v1/orbit/demo")
def orbit_demo() -> dict:
    line1, line2 = sample_iss_tle()
    points = propagate_tle(line1, line2, utcnow(), minutes=18, step_seconds=120)
    return {"satellite": "ISS-DEMO", "mode": "LIVE", "points": [point.__dict__ for point in points]}


@app.post("/v1/orbit/propagate")
def orbit_propagate(request: OrbitRequest) -> dict:
    points = propagate_tle(request.tle_line_1, request.tle_line_2, utcnow(), minutes=request.minutes, step_seconds=request.step_seconds)
    return {"count": len(points), "mode": "LIVE", "points": [point.__dict__ for point in points]}


@app.post("/v1/passes/predict")
def predict_passes(request: PassRequest) -> dict:
    passes = build_passes(request.satellite_id, request.ground_station_id, request.min_elevation_deg)
    return {"count": len(passes), "mode": "SIMULATED", "passes": passes}


@app.post("/v1/ground-network/schedule")
def schedule_contact(request: GroundScheduleRequest) -> dict:
    end_time = request.start_time + timedelta(minutes=request.duration_min)
    conflict = request.start_time.minute % 17 == 0
    return {
        "status": "conflict" if conflict else "scheduled",
        "mode": "LIVE",
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
    return {"provider": "SIMULATED", "forecast": build_weather(request)}


@app.post("/v1/maritime/search")
def maritime_search(request: MaritimeRequest) -> dict:
    vessels = [
        {"mmsi": "563123456", "name": "PACIFIC MERIDIAN", "type": "Cargo", "distance_km": 18.4, "sog_kn": 13.2, "cog_deg": 84},
        {"mmsi": "565987654", "name": "EASTERN STAR", "type": "Tanker", "distance_km": 42.7, "sog_kn": 9.8, "cog_deg": 241},
        {"mmsi": "566101010", "name": "STRAIT RUNNER", "type": "Container", "distance_km": 67.1, "sog_kn": 15.4, "cog_deg": 103},
    ]
    return {"provider": "SIMULATED", "center": request.model_dump(), "count": len(vessels), "vessels": vessels}


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
    return {"provider": "SIMULATED", "count": len(products), "products": products}


@app.post("/v1/link-budget")
def link_budget(request: LinkBudgetRequest) -> dict:
    fspl = 92.45 + 20 * log10(request.frequency_ghz) + 20 * log10(request.range_km)
    received = request.tx_power_dbw + request.tx_gain_dbi + request.rx_gain_dbi - fspl - request.other_losses_db
    return {
        "mode": "LIVE",
        "free_space_path_loss_db": round(fspl, 2),
        "received_power_dbw": round(received, 2),
        "margin_class": "strong" if received > -110 else "marginal" if received > -125 else "weak",
    }


@app.post("/v1/missions/plan")
def plan_mission(request: MissionRequest) -> dict:
    candidates = select_mission_candidates(request)
    recommended = candidates[0] if candidates else None
    return {
        "mission": request.model_dump(),
        "status": "planned" if recommended else "no_feasible_plan",
        "mode": "LIVE",
        "candidate_count": len(candidates),
        "recommended": recommended.__dict__ if recommended else None,
        "candidates": [candidate.__dict__ for candidate in candidates],
    }


@app.post("/v1/copilot/mission")
def copilot_mission(request: CopilotRequest) -> dict:
    candidates = select_mission_candidates(request)
    if not candidates:
        return {
            "status": "no_feasible_plan",
            "objective": request.objective,
            "workflow": [
                {"stage": "OBJECTIVE", "status": "resolved"},
                {"stage": "OPPORTUNITY", "status": "blocked", "reason": "No satellite candidate satisfies constraints"},
            ],
            "exceptions": ["No feasible satellite candidate"],
        }

    recommended = candidates[0]
    satellite_id = recommended.satellite_id
    sat_state = next((item for item in SATELLITE_POOL if item["id"] == satellite_id), SATELLITE_POOL[0])
    weather = build_weather(WeatherRequest(lat=request.aoi.lat, lon=request.aoi.lon, hours=request.horizon_hours))
    feasible_weather = [item for item in weather if request.max_cloud_pct is None or item["cloud_pct"] <= request.max_cloud_pct]
    chosen_weather = feasible_weather[0] if feasible_weather else weather[0]

    ranked_stations = sorted(
        [station for station in GROUND_POOL if station["status"] in {"nominal", "available"} and "X" in station["bands"]],
        key=lambda station: station["utilization_pct"],
    )
    station = ranked_stations[0]
    passes = build_passes(satellite_id, station["id"])
    best_pass = max(passes, key=lambda item: item["max_elevation_deg"])
    contact_start = datetime.fromisoformat(best_pass["aos"])
    contact_end = datetime.fromisoformat(best_pass["los"])
    processing_start = contact_end + timedelta(minutes=4)
    qc_complete = processing_start + timedelta(minutes=18)
    delivery_time = qc_complete + timedelta(minutes=8)
    delivery_hours = round((delivery_time - utcnow()).total_seconds() / 3600, 2)

    resource_ok = sat_state["battery_pct"] >= 30 and sat_state["storage_free_pct"] >= 20
    exceptions = []
    if not feasible_weather and recommended.sensor == "optical":
        exceptions.append("No weather window satisfies the requested optical cloud threshold; earliest available weather is retained for review")
    if not resource_ok:
        exceptions.append("Spacecraft resource reserve below mission threshold")
    if request.delivery_target_hours is not None and delivery_hours > request.delivery_target_hours:
        exceptions.append("Estimated delivery exceeds requested delivery target")

    workflow = [
        {"stage": "OBJECTIVE", "status": "resolved", "detail": request.objective},
        {"stage": "OPPORTUNITY", "status": "resolved", "detail": f"{satellite_id} / {recommended.sensor} / {recommended.resolution_m} m"},
        {"stage": "WEATHER", "status": "resolved" if feasible_weather else "exception", "detail": f"{chosen_weather['cloud_pct']}% cloud / provider SIMULATED"},
        {"stage": "RESOURCE", "status": "resolved" if resource_ok else "exception", "detail": f"battery {sat_state['battery_pct']}% / storage free {sat_state['storage_free_pct']}%"},
        {"stage": "CONTACT", "status": "resolved", "detail": f"{station['id']} / max elevation {best_pass['max_elevation_deg']} deg"},
        {"stage": "SCHEDULE", "status": "resolved", "detail": f"{contact_start.isoformat()} → {contact_end.isoformat()}"},
        {"stage": "PROCESS", "status": "resolved", "detail": f"processing {processing_start.isoformat()} / QC {qc_complete.isoformat()} / mode SIMULATED"},
        {"stage": "DELIVER", "status": "resolved", "detail": f"ETA {delivery_time.isoformat()} / {delivery_hours} h / mode SIMULATED"},
    ]

    return {
        "status": "executable_with_exceptions" if exceptions else "executable",
        "mode": "LIVE",
        "objective": request.objective,
        "mission": request.model_dump(exclude={"objective"}),
        "selected": {
            "satellite": recommended.__dict__,
            "spacecraft_state": sat_state,
            "weather": chosen_weather,
            "ground_station": station,
            "contact": best_pass,
        },
        "workflow": workflow,
        "processing_delivery": {
            "mode": "SIMULATED",
            "processing_start": processing_start.isoformat(),
            "qc_complete": qc_complete.isoformat(),
            "delivery_eta": delivery_time.isoformat(),
            "delivery_hours": delivery_hours,
        },
        "exceptions": exceptions,
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
