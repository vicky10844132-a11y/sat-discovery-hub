from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from typing import Iterable, Literal

from services.mission.planner import Candidate


@dataclass(frozen=True)
class MissionObjective:
    objective: str
    sensor: Literal["optical", "sar", "any"] = "any"
    priority: int = 3
    max_cloud_pct: float | None = None
    max_resolution_m: float | None = None
    data_strategy: Literal["auto", "archive", "tasking"] = "auto"


@dataclass(frozen=True)
class MissionStage:
    key: str
    label: str
    status: Literal["pending", "running", "complete", "blocked"] = "pending"
    details: dict | None = None


@dataclass(frozen=True)
class AOIContext:
    name: str
    lat: float
    lon: float
    radius_km: float


@dataclass(frozen=True)
class SpacecraftState:
    satellite_id: str
    battery_pct: float
    storage_free_pct: float


@dataclass(frozen=True)
class GroundAsset:
    id: str
    name: str
    bands: tuple[str, ...]
    status: str
    ownership: str
    utilization_pct: float


@dataclass(frozen=True)
class GroundReservation:
    id: str
    satellite_id: str
    ground_station_id: str
    start: datetime
    end: datetime
    priority: int


@dataclass(frozen=True)
class CatalogProduct:
    id: str
    sensor: str
    resolution_m: float
    cloud_pct: float | None
    age_hours: float


@dataclass(frozen=True)
class WeatherWindow:
    time: datetime
    cloud_pct: float
    optical_feasible: bool


DEFAULT_PIPELINE = [
    MissionStage("objective", "Resolve objective"),
    MissionStage("resolve_target", "Resolve target / AOI"),
    MissionStage("data_search", "Search compliant archive data"),
    MissionStage("orbit", "Enumerate orbital opportunities"),
    MissionStage("payload", "Apply payload constraints"),
    MissionStage("weather", "Apply weather constraints"),
    MissionStage("resource", "Check spacecraft resources"),
    MissionStage("ground", "Select ground contacts"),
    MissionStage("schedule", "Resolve scheduling conflicts"),
    MissionStage("process", "Process and quality-control product"),
    MissionStage("delivery", "Estimate delivery"),
    MissionStage("rank", "Rank feasible mission plans"),
]

CANONICAL_STAGES = (
    "OBJECTIVE",
    "AOI",
    "DATA_SEARCH",
    "OPPORTUNITY",
    "WEATHER",
    "RESOURCE",
    "CONTACT",
    "SCHEDULE",
    "PROCESS",
    "DELIVER",
)


def build_pipeline() -> list[MissionStage]:
    return [MissionStage(stage.key, stage.label, stage.status, dict(stage.details or {})) for stage in DEFAULT_PIPELINE]


def select_archive_product(
    products: Iterable[CatalogProduct],
    *,
    sensor: str = "any",
    max_resolution_m: float | None = None,
    max_cloud_pct: float | None = None,
) -> CatalogProduct | None:
    feasible: list[CatalogProduct] = []
    for product in products:
        if sensor != "any" and product.sensor != sensor:
            continue
        if max_resolution_m is not None and product.resolution_m > max_resolution_m:
            continue
        if max_cloud_pct is not None and product.cloud_pct is not None and product.cloud_pct > max_cloud_pct:
            continue
        feasible.append(product)
    return min(feasible, key=lambda item: (item.age_hours, item.resolution_m)) if feasible else None


def rank_ground_assets(assets: Iterable[GroundAsset], required_band: str = "X") -> list[GroundAsset]:
    ownership_rank = {"own": 0, "partner": 1, "gsaas": 2, "virtual": 3}
    feasible = [
        asset
        for asset in assets
        if asset.status in {"nominal", "available"} and required_band in asset.bands
    ]
    return sorted(feasible, key=lambda item: (ownership_rank.get(item.ownership, 9), item.utilization_pct))


def _utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _overlaps(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    return start_a < end_b and start_b < end_a


def select_contact(
    *,
    assets: Iterable[GroundAsset],
    reservations: Iterable[GroundReservation],
    desired_start: datetime,
    duration_min: int,
    mission_priority: int,
    required_band: str = "X",
) -> dict | None:
    start = _utc(desired_start)
    end = start + timedelta(minutes=duration_min)
    reservation_rows = list(reservations)
    for asset in rank_ground_assets(assets, required_band=required_band):
        conflicts = [
            row
            for row in reservation_rows
            if row.ground_station_id == asset.id
            and _overlaps(start, end, _utc(row.start), _utc(row.end))
        ]
        blocking = [row for row in conflicts if row.priority <= mission_priority]
        if blocking:
            continue
        preempted = [row for row in conflicts if row.priority > mission_priority]
        return {
            "asset": asset,
            "start": start,
            "end": end,
            "resolution": "preempt-lower-priority" if preempted else "accepted",
            "preempted": preempted,
        }
    return None


def orchestrate_mission(
    *,
    objective: MissionObjective,
    aoi: AOIContext,
    candidates: list[Candidate],
    spacecraft: Iterable[SpacecraftState],
    ground_assets: Iterable[GroundAsset],
    weather: list[WeatherWindow],
    archive_products: Iterable[CatalogProduct],
    ground_reservations: Iterable[GroundReservation] = (),
    delivery_target_hours: float | None = None,
    now: datetime | None = None,
) -> dict:
    now_utc = _utc(now or datetime.now(timezone.utc))
    workflow: list[dict] = [
        {"stage": "OBJECTIVE", "status": "resolved", "detail": objective.objective},
        {"stage": "AOI", "status": "resolved", "detail": asdict(aoi)},
    ]
    exceptions: list[str] = []

    archive = None
    if objective.data_strategy != "tasking":
        archive = select_archive_product(
            archive_products,
            sensor=objective.sensor,
            max_resolution_m=objective.max_resolution_m,
            max_cloud_pct=objective.max_cloud_pct,
        )
    if archive is not None:
        delivery_eta = now_utc + timedelta(minutes=20)
        workflow.extend([
            {"stage": "DATA_SEARCH", "status": "resolved", "detail": f"Archive hit {archive.id}"},
            {"stage": "OPPORTUNITY", "status": "not_required", "detail": "Archive-first policy satisfied mission"},
            {"stage": "WEATHER", "status": "not_required", "detail": "Archive product already acquired"},
            {"stage": "RESOURCE", "status": "not_required", "detail": "No spacecraft tasking required"},
            {"stage": "CONTACT", "status": "not_required", "detail": "No new downlink required"},
            {"stage": "SCHEDULE", "status": "not_required", "detail": "No contact reservation required"},
            {"stage": "PROCESS", "status": "resolved", "detail": "Archive QC / product preparation"},
            {"stage": "DELIVER", "status": "resolved", "detail": delivery_eta.isoformat()},
        ])
        return {
            "status": "executable",
            "strategy": "archive-first",
            "mode": "LIVE",
            "selected": {"archive_product": asdict(archive)},
            "workflow": workflow,
            "processing_delivery": {"mode": "SIMULATED", "delivery_eta": delivery_eta.isoformat(), "delivery_hours": 0.33},
            "exceptions": exceptions,
        }

    if objective.data_strategy == "archive":
        workflow.append({"stage": "DATA_SEARCH", "status": "blocked", "detail": "No compliant archive product"})
        return {
            "status": "no_feasible_plan",
            "strategy": "archive-only",
            "mode": "LIVE",
            "workflow": workflow,
            "exceptions": ["No compliant archive product"],
        }
    if objective.data_strategy == "tasking":
        workflow.append({"stage": "DATA_SEARCH", "status": "not_required", "detail": "New acquisition explicitly requested"})
    else:
        workflow.append({"stage": "DATA_SEARCH", "status": "resolved", "detail": "No compliant archive product; escalate to tasking"})

    filtered = [candidate for candidate in candidates if objective.sensor == "any" or candidate.sensor == objective.sensor]
    if objective.max_resolution_m is not None:
        filtered = [candidate for candidate in filtered if candidate.resolution_m <= objective.max_resolution_m]
    if objective.max_cloud_pct is not None:
        filtered = [candidate for candidate in filtered if candidate.cloud_pct is None or candidate.cloud_pct <= objective.max_cloud_pct]
    if not filtered:
        workflow.append({"stage": "OPPORTUNITY", "status": "blocked", "detail": "No candidate satisfies mission constraints"})
        return {"status": "no_feasible_plan", "strategy": "tasking", "mode": "LIVE", "workflow": workflow, "exceptions": ["No feasible acquisition opportunity"]}

    candidate = max(filtered, key=lambda item: item.score)
    workflow.append({"stage": "OPPORTUNITY", "status": "resolved", "detail": asdict(candidate)})

    matching_weather = [item for item in weather if candidate.sensor != "optical" or objective.max_cloud_pct is None or item.cloud_pct <= objective.max_cloud_pct]
    weather_choice = matching_weather[0] if matching_weather else (weather[0] if weather else None)
    if candidate.sensor == "optical" and not matching_weather:
        exceptions.append("No weather window satisfies the requested optical cloud threshold")
        workflow.append({"stage": "WEATHER", "status": "exception", "detail": asdict(weather_choice) if weather_choice else None})
    else:
        workflow.append({"stage": "WEATHER", "status": "resolved", "detail": asdict(weather_choice) if weather_choice else "Not weather-limited"})

    states = {item.satellite_id: item for item in spacecraft}
    state = states.get(candidate.satellite_id)
    resource_ok = bool(state and state.battery_pct >= 30 and state.storage_free_pct >= 20)
    if not resource_ok:
        exceptions.append("Spacecraft resource reserve below mission threshold or unavailable")
    workflow.append({"stage": "RESOURCE", "status": "resolved" if resource_ok else "exception", "detail": asdict(state) if state else None})

    ranked_ground = rank_ground_assets(ground_assets)
    if not ranked_ground:
        workflow.append({"stage": "CONTACT", "status": "blocked", "detail": "No compatible X-band ground asset"})
        return {"status": "no_feasible_plan", "strategy": "tasking", "mode": "LIVE", "workflow": workflow, "exceptions": exceptions + ["No compatible ground contact resource"]}

    contact_start = max(_utc(candidate.downlink_utc), now_utc + timedelta(minutes=5))
    contact = select_contact(
        assets=ranked_ground,
        reservations=ground_reservations,
        desired_start=contact_start,
        duration_min=10,
        mission_priority=objective.priority,
    )
    if contact is None:
        workflow.append({"stage": "CONTACT", "status": "blocked", "detail": "All compatible ground assets conflict at required downlink window"})
        workflow.append({"stage": "SCHEDULE", "status": "blocked", "detail": "No conflict-free or preemptable contact"})
        return {
            "status": "no_feasible_plan",
            "strategy": "tasking",
            "mode": "LIVE",
            "workflow": workflow,
            "exceptions": exceptions + ["Ground-network scheduling conflict"],
        }

    station: GroundAsset = contact["asset"]
    workflow.append({"stage": "CONTACT", "status": "resolved", "detail": asdict(station)})
    schedule_detail = {
        "start": contact["start"].isoformat(),
        "end": contact["end"].isoformat(),
        "resolution": contact["resolution"],
        "preempted": [asdict(item) for item in contact["preempted"]],
    }
    if contact["preempted"]:
        exceptions.append("Lower-priority ground contact will be preempted")
    workflow.append({"stage": "SCHEDULE", "status": "resolved", "detail": schedule_detail})

    process_start = contact["end"] + timedelta(minutes=4)
    qc_complete = process_start + timedelta(minutes=18)
    delivery_eta = qc_complete + timedelta(minutes=8)
    delivery_hours = round((delivery_eta - now_utc).total_seconds() / 3600, 2)
    workflow.append({"stage": "PROCESS", "status": "resolved", "detail": {"start": process_start.isoformat(), "qc_complete": qc_complete.isoformat(), "mode": "SIMULATED"}})
    workflow.append({"stage": "DELIVER", "status": "resolved", "detail": {"eta": delivery_eta.isoformat(), "mode": "SIMULATED"}})
    if delivery_target_hours is not None and delivery_hours > delivery_target_hours:
        exceptions.append("Estimated delivery exceeds requested delivery target")

    return {
        "status": "executable_with_exceptions" if exceptions else "executable",
        "strategy": "tasking",
        "mode": "LIVE",
        "selected": {
            "satellite": asdict(candidate),
            "spacecraft_state": asdict(state) if state else None,
            "ground_station": asdict(station),
            "weather": asdict(weather_choice) if weather_choice else None,
            "contact": {"start": contact["start"].isoformat(), "end": contact["end"].isoformat(), "resolution": contact["resolution"]},
        },
        "workflow": workflow,
        "processing_delivery": {
            "mode": "SIMULATED",
            "processing_start": process_start.isoformat(),
            "qc_complete": qc_complete.isoformat(),
            "delivery_eta": delivery_eta.isoformat(),
            "delivery_hours": delivery_hours,
        },
        "exceptions": exceptions,
    }
