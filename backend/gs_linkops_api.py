"""GS LinkOps AI backend skeleton.

This is the production-oriented API foundation for the full intelligent ground
segment operations platform. It intentionally starts without preloaded satellite
or ground station resources. Approved resources should enter through API import
or controlled CRUD endpoints.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(
    title="GS LinkOps AI API",
    version="0.1.0",
    description="Intelligent ground segment resource and downlink operations platform API.",
)


class Status(str, Enum):
    draft = "Draft"
    onboarding = "Onboarding"
    authorized = "Authorized"
    suspended = "Suspended"


class MissionStatus(str, Enum):
    new_request = "New Request"
    auto_matched = "Auto Matched"
    task_generated = "Task Generated"
    station_confirmation_pending = "Station Confirmation Pending"
    station_confirmed = "Station Confirmed"
    configuration_pending = "Configuration Pending"
    configured = "Configured"
    scheduled = "Scheduled"
    in_pass = "In Pass"
    signal_acquired = "Signal Acquired"
    carrier_locked = "Carrier Locked"
    demod_locked = "Demod Locked"
    frame_synced = "Frame Synced"
    data_captured = "Data Captured"
    transfer_waiting = "Transfer Waiting"
    transfer_started = "Transfer Started"
    transfer_completed = "Transfer Completed"
    operator_confirmed = "Operator / Manufacturer Confirmed"
    report_generated = "Report Generated"
    billable = "Billable"
    billed = "Billed"
    supplier_settled = "Supplier Settled"
    closed = "Closed"
    failed = "Failed"
    cancelled = "Cancelled"


class Organization(BaseModel):
    id: str = Field(default_factory=lambda: f"ORG-{uuid4().hex[:8].upper()}")
    name: str
    type: str
    country: Optional[str] = None
    notes: Optional[str] = None


class Contact(BaseModel):
    id: str = Field(default_factory=lambda: f"CON-{uuid4().hex[:8].upper()}")
    name: str
    organization_id: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None


class GroundStation(BaseModel):
    id: str = Field(default_factory=lambda: f"STN-{uuid4().hex[:8].upper()}")
    name: str
    organization_id: Optional[str] = None
    country_city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude_m: Optional[float] = None
    antenna: Optional[str] = None
    supported_band: Optional[str] = None
    frequency_range: Optional[str] = None
    polarization: Optional[str] = None
    minimum_elevation_deg: float = 10.0
    demodulator: Optional[str] = None
    max_data_rate_mbps: Optional[float] = None
    transfer_method: Optional[str] = None
    status: Status = Status.draft
    cost_per_pass_usd: Optional[float] = None


class Satellite(BaseModel):
    id: str = Field(default_factory=lambda: f"SAT-{uuid4().hex[:8].upper()}")
    name: str
    organization_id: Optional[str] = None
    norad_id: Optional[str] = None
    tle_line_1: Optional[str] = None
    tle_line_2: Optional[str] = None
    band: Optional[str] = None
    downlink_frequency: Optional[str] = None
    polarization: Optional[str] = None
    modulation: Optional[str] = None
    coding: Optional[str] = None
    data_rate_mbps: Optional[float] = None
    frame_format: Optional[str] = None
    status: Status = Status.draft


class PassWindow(BaseModel):
    id: str = Field(default_factory=lambda: f"PASS-{uuid4().hex[:8].upper()}")
    satellite_id: str
    station_id: str
    start_utc: str
    end_utc: str
    duration_min: float
    max_elevation_deg: float
    score: int
    match_status: str
    reason: str
    orbit_mode: str


class Mission(BaseModel):
    id: str = Field(default_factory=lambda: f"GS-DL-{datetime.now().year}-{uuid4().hex[:6].upper()}")
    satellite_id: str
    station_id: str
    pass_window_id: Optional[str] = None
    status: MissionStatus = MissionStatus.new_request
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TransferJob(BaseModel):
    id: str = Field(default_factory=lambda: f"TRF-{uuid4().hex[:8].upper()}")
    mission_id: str
    source_station_id: str
    destination_operator_id: Optional[str] = None
    method: str = "SFTP"
    source_path: Optional[str] = None
    destination_path: Optional[str] = None
    manifest: Optional[str] = None
    total_size: Optional[str] = None
    checksum_type: str = "SHA256"
    checksum_value: Optional[str] = None
    status: str = "Waiting for File"
    confirmed: bool = False
    retention_hours: int = 72


class BillingRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"BIL-{uuid4().hex[:8].upper()}")
    mission_id: str
    billing_mode: str = "Per successful downlink"
    billing_trigger: str = "Transfer Completed + Operator / Manufacturer Confirmed"
    station_cost_usd: float = 0
    client_price_usd: float = 0
    gs_service_fee_usd: float = 0
    gross_margin_usd: float = 0
    status: str = "Hold"
    decision_reason: Optional[str] = None


DB: Dict[str, Dict[str, Any]] = {
    "organizations": {},
    "contacts": {},
    "stations": {},
    "satellites": {},
    "passes": {},
    "missions": {},
    "transfers": {},
    "billing": {},
    "audit": {},
}


def store(collection: str, item: BaseModel) -> BaseModel:
    DB[collection][item.id] = item.model_dump()
    DB["audit"][uuid4().hex] = {
        "time": datetime.now(timezone.utc).isoformat(),
        "action": f"create {collection}",
        "object_id": item.id,
    }
    return item


def get_or_404(collection: str, object_id: str) -> Dict[str, Any]:
    obj = DB[collection].get(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{collection} object not found")
    return obj


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "GS LinkOps AI"}


@app.get("/dashboard")
def dashboard() -> Dict[str, Any]:
    return {
        "organizations": len(DB["organizations"]),
        "contacts": len(DB["contacts"]),
        "ground_stations": len(DB["stations"]),
        "satellites": len(DB["satellites"]),
        "pass_windows": len(DB["passes"]),
        "missions": len(DB["missions"]),
        "transfer_jobs": len(DB["transfers"]),
        "billing_records": len(DB["billing"]),
        "ai_alerts": ai_alerts(),
    }


@app.post("/organizations")
def create_organization(item: Organization) -> Organization:
    return store("organizations", item)


@app.post("/contacts")
def create_contact(item: Contact) -> Contact:
    return store("contacts", item)


@app.post("/stations")
def create_station(item: GroundStation) -> GroundStation:
    return store("stations", item)


@app.post("/satellites")
def create_satellite(item: Satellite) -> Satellite:
    return store("satellites", item)


@app.get("/organizations")
def list_organizations() -> List[Dict[str, Any]]:
    return list(DB["organizations"].values())


@app.get("/stations")
def list_stations() -> List[Dict[str, Any]]:
    return list(DB["stations"].values())


@app.get("/satellites")
def list_satellites() -> List[Dict[str, Any]]:
    return list(DB["satellites"].values())


def capability_score(sat: Dict[str, Any], stn: Dict[str, Any]) -> Dict[str, Any]:
    score = 30
    reasons: List[str] = []
    if stn.get("status") == "Authorized":
        score += 15
    else:
        reasons.append("station not authorized")
    if sat.get("status") in {"Authorized", "Testing"}:
        score += 15
    else:
        reasons.append("satellite not authorized/testing")
    if sat.get("band") and stn.get("supported_band") and sat["band"].lower().split("/")[0].strip() in stn["supported_band"].lower():
        score += 15
    else:
        reasons.append("band confirmation required")
    if not sat.get("data_rate_mbps") or not stn.get("max_data_rate_mbps") or stn["max_data_rate_mbps"] >= sat["data_rate_mbps"]:
        score += 10
    else:
        reasons.append("data rate may exceed station capacity")
    if sat.get("polarization") and stn.get("polarization") and sat["polarization"].lower().split("/")[0].strip() in stn["polarization"].lower():
        score += 10
    else:
        reasons.append("polarization confirmation required")
    if stn.get("latitude") is not None and stn.get("longitude") is not None:
        score += 10
    else:
        reasons.append("station coordinates missing")
    if sat.get("tle_line_1") and sat.get("tle_line_2"):
        score += 5
    else:
        reasons.append("TLE missing")
    status = "Matched" if score >= 80 else "Conditional" if score >= 55 else "Need Review"
    return {"score": min(100, score), "match_status": status, "reason": "; ".join(reasons) or "ready"}


@app.post("/orbit/calculate")
def calculate_pass_windows() -> List[PassWindow]:
    """Simplified placeholder for contact windows.

    Production implementation should replace this with a Skyfield/SGP4 service.
    """
    DB["passes"].clear()
    results: List[PassWindow] = []
    for sat_index, sat in enumerate(DB["satellites"].values()):
        for stn_index, stn in enumerate(DB["stations"].values()):
            match = capability_score(sat, stn)
            seed = (int(sat.get("norad_id") or 10000) + round(abs((stn.get("latitude") or 0) * 100)) + stn_index * 89 + sat_index * 53) % 720
            hour = seed // 60
            minute = seed % 60
            duration = 10 + (seed % 7)
            max_el = max(stn.get("minimum_elevation_deg") or 10, min(87, 20 + match["score"] % 50))
            pw = PassWindow(
                satellite_id=sat["id"],
                station_id=stn["id"],
                start_utc=f"D+1 {hour:02d}:{minute:02d} UTC",
                end_utc=f"+{duration} min",
                duration_min=float(duration),
                max_elevation_deg=float(max_el),
                score=match["score"],
                match_status=match["match_status"],
                reason=match["reason"],
                orbit_mode="placeholder; production requires Skyfield/SGP4",
            )
            DB["passes"][pw.id] = pw.model_dump()
            results.append(pw)
    return sorted(results, key=lambda x: x.score, reverse=True)


@app.post("/missions/from-pass/{pass_id}")
def create_mission_from_pass(pass_id: str) -> Mission:
    p = get_or_404("passes", pass_id)
    mission = Mission(satellite_id=p["satellite_id"], station_id=p["station_id"], pass_window_id=pass_id)
    return store("missions", mission)


@app.post("/missions/{mission_id}/advance")
def advance_mission(mission_id: str) -> Dict[str, Any]:
    mission = get_or_404("missions", mission_id)
    flow = [status.value for status in MissionStatus]
    idx = flow.index(mission["status"]) if mission["status"] in flow else 0
    mission["status"] = flow[min(idx + 1, len(flow) - 1)]
    if mission["status"] == MissionStatus.transfer_waiting.value:
        if not any(t["mission_id"] == mission_id for t in DB["transfers"].values()):
            stn = get_or_404("stations", mission["station_id"])
            transfer = TransferJob(mission_id=mission_id, source_station_id=mission["station_id"], method=stn.get("transfer_method") or "SFTP")
            store("transfers", transfer)
    return mission


@app.post("/transfers/{transfer_id}/complete")
def complete_transfer(transfer_id: str) -> Dict[str, Any]:
    transfer = get_or_404("transfers", transfer_id)
    transfer["status"] = "Transfer Completed"
    transfer["confirmed"] = True
    mission = get_or_404("missions", transfer["mission_id"])
    stn = get_or_404("stations", mission["station_id"])
    cost = float(stn.get("cost_per_pass_usd") or 0)
    billing = BillingRecord(
        mission_id=mission["id"],
        station_cost_usd=cost,
        client_price_usd=cost + 1000,
        gs_service_fee_usd=1000,
        gross_margin_usd=1000,
        status="Billable",
        decision_reason="Transfer completed and operator/manufacturer confirmation recorded.",
    )
    store("billing", billing)
    return transfer


@app.get("/ai/alerts")
def ai_alerts() -> List[str]:
    alerts: List[str] = []
    if not DB["organizations"]:
        alerts.append("No organizations have been added.")
    if not DB["stations"]:
        alerts.append("No ground stations have been added.")
    if not DB["satellites"]:
        alerts.append("No satellites have been added.")
    for sat in DB["satellites"].values():
        if not sat.get("tle_line_1") or not sat.get("tle_line_2"):
            alerts.append(f"Satellite {sat.get('name') or sat['id']} is missing TLE lines.")
        if not sat.get("band") or not sat.get("polarization"):
            alerts.append(f"Satellite {sat.get('name') or sat['id']} is missing downlink band or polarization.")
    for stn in DB["stations"].values():
        if stn.get("latitude") is None or stn.get("longitude") is None:
            alerts.append(f"Station {stn.get('name') or stn['id']} is missing coordinates.")
        if stn.get("status") != "Authorized":
            alerts.append(f"Station {stn.get('name') or stn['id']} is not marked Authorized.")
    return alerts or ["No major alerts detected."]
