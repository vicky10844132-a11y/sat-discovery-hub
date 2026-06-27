"""GS LinkOps AI backend API.

Production-oriented API foundation for the full intelligent ground segment
operations platform. No satellite, station, manufacturer or customer records are
preloaded. All resources enter through controlled CRUD/import endpoints.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ai_copilot_service import billing_recommendation, generate_operational_brief, recommend_best_contact
from billing_service import BillingInput, decide_billing
from orbit_engine import SatelliteTLE, Station, calculate_contact_windows
from report_service import generate_billing_statement, generate_mission_report, generate_transfer_report
from rules_engine import capability_match, classify_failure, mission_readiness, transfer_readiness

app = FastAPI(
    title="GS LinkOps AI API",
    version="0.2.0",
    description="Full intelligent ground segment resource and downlink operations platform API.",
)


class Status(str, Enum):
    draft = "Draft"
    onboarding = "Onboarding"
    authorized = "Authorized"
    testing = "Testing"
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
    altitude_m: float = 0.0
    antenna: Optional[str] = None
    supported_band: Optional[str] = None
    frequency_range: Optional[str] = None
    polarization: Optional[str] = None
    minimum_elevation_deg: float = 10.0
    demodulator: Optional[str] = None
    max_data_rate_mbps: Optional[float] = None
    transfer_method: str = "SFTP"
    status: Status = Status.draft
    cost_per_pass_usd: float = 0.0


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


class StationConfiguration(BaseModel):
    id: str = Field(default_factory=lambda: f"CFG-{uuid4().hex[:8].upper()}")
    mission_id: str
    frequency: Optional[str] = None
    if_frequency: Optional[str] = None
    polarization: Optional[str] = None
    modulation: Optional[str] = None
    coding: Optional[str] = None
    data_rate_mbps: Optional[float] = None
    frame_format: Optional[str] = None
    sync_word: Optional[str] = None
    manufacturer_confirmed: bool = False
    station_confirmed: bool = False


class ReceptionLog(BaseModel):
    id: str = Field(default_factory=lambda: f"RF-{uuid4().hex[:8].upper()}")
    mission_id: str
    signal_detected: bool = False
    carrier_lock: bool = False
    demod_lock: bool = False
    frame_sync: bool = False
    data_captured: bool = False
    peak_snr: Optional[str] = None
    cn0: Optional[str] = None
    received_size: Optional[str] = None
    issue_description: Optional[str] = None


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
    "configs": {},
    "receptions": {},
    "transfers": {},
    "billing": {},
    "reports": {},
    "audit": {},
}


def store(collection: str, item: BaseModel) -> BaseModel:
    DB[collection][item.id] = item.model_dump()
    DB["audit"][uuid4().hex] = {"time": datetime.now(timezone.utc).isoformat(), "action": f"create {collection}", "object_id": item.id}
    return item


def get_or_404(collection: str, object_id: str) -> Dict[str, Any]:
    obj = DB[collection].get(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{collection} object not found")
    return obj


def platform_snapshot() -> Dict[str, Any]:
    return {
        "organizations": list(DB["organizations"].values()),
        "stations": list(DB["stations"].values()),
        "satellites": list(DB["satellites"].values()),
        "missions": list(DB["missions"].values()),
        "configs": list(DB["configs"].values()),
        "receptions": list(DB["receptions"].values()),
        "transfers": list(DB["transfers"].values()),
        "billing": list(DB["billing"].values()),
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "GS LinkOps AI"}


@app.get("/dashboard")
def dashboard() -> Dict[str, Any]:
    brief = generate_operational_brief(platform_snapshot())
    return {"counts": brief["summary"], "ai_alerts": brief["highest_priority_alerts"], "recommended_next_action": brief["recommended_next_action"]}


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


@app.post("/orbit/calculate")
def calculate_pass_windows_api() -> List[PassWindow]:
    DB["passes"].clear()
    results: List[PassWindow] = []
    for sat in DB["satellites"].values():
        for stn in DB["stations"].values():
            match = capability_match(sat, stn)
            try:
                if sat.get("tle_line_1") and sat.get("tle_line_2") and stn.get("latitude") is not None and stn.get("longitude") is not None:
                    windows = calculate_contact_windows(
                        SatelliteTLE(sat["name"], sat["tle_line_1"], sat["tle_line_2"]),
                        Station(stn["name"], float(stn["latitude"]), float(stn["longitude"]), float(stn.get("altitude_m") or 0), float(stn.get("minimum_elevation_deg") or 10)),
                        hours=24,
                    )
                    for w in windows[:3]:
                        pw = PassWindow(satellite_id=sat["id"], station_id=stn["id"], start_utc=w.start_utc, end_utc=w.end_utc, duration_min=w.duration_min, max_elevation_deg=w.max_elevation_deg, score=match["score"], match_status=match["match_status"], reason=match["summary"], orbit_mode=w.orbit_mode)
                        DB["passes"][pw.id] = pw.model_dump()
                        results.append(pw)
                    continue
            except Exception as exc:
                orbit_mode = f"Skyfield unavailable; fallback placeholder: {exc}"
            else:
                orbit_mode = "placeholder; TLE/coordinates required for Skyfield/SGP4"
            seed = (int(sat.get("norad_id") or 10000) + round(abs((stn.get("latitude") or 0) * 100))) % 720
            pw = PassWindow(satellite_id=sat["id"], station_id=stn["id"], start_utc=f"D+1 {seed//60:02d}:{seed%60:02d} UTC", end_utc="+10 min", duration_min=10, max_elevation_deg=30, score=match["score"], match_status=match["match_status"], reason=match["summary"], orbit_mode=orbit_mode)
            DB["passes"][pw.id] = pw.model_dump()
            results.append(pw)
    return sorted(results, key=lambda x: x.score, reverse=True)


@app.get("/passes")
def list_passes() -> List[Dict[str, Any]]:
    return list(DB["passes"].values())


@app.get("/capability/recommendation")
def recommend_contact() -> Dict[str, Any]:
    return recommend_best_contact(list(DB["satellites"].values()), list(DB["stations"].values()))


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
    if mission["status"] == MissionStatus.configuration_pending.value and not any(c["mission_id"] == mission_id for c in DB["configs"].values()):
        store("configs", StationConfiguration(mission_id=mission_id))
    if mission["status"] in {MissionStatus.signal_acquired.value, MissionStatus.carrier_locked.value, MissionStatus.demod_locked.value, MissionStatus.frame_synced.value, MissionStatus.data_captured.value} and not any(r["mission_id"] == mission_id for r in DB["receptions"].values()):
        store("receptions", ReceptionLog(mission_id=mission_id, signal_detected=True))
    if mission["status"] == MissionStatus.transfer_waiting.value and not any(t["mission_id"] == mission_id for t in DB["transfers"].values()):
        stn = get_or_404("stations", mission["station_id"])
        store("transfers", TransferJob(mission_id=mission_id, source_station_id=mission["station_id"], method=stn.get("transfer_method") or "SFTP"))
    return mission


@app.get("/missions")
def list_missions() -> List[Dict[str, Any]]:
    return list(DB["missions"].values())


@app.post("/configs")
def create_config(item: StationConfiguration) -> StationConfiguration:
    return store("configs", item)


@app.post("/receptions")
def create_reception(item: ReceptionLog) -> ReceptionLog:
    return store("receptions", item)


@app.get("/transfers")
def list_transfers() -> List[Dict[str, Any]]:
    return list(DB["transfers"].values())


@app.post("/transfers/{transfer_id}/complete")
def complete_transfer(transfer_id: str) -> Dict[str, Any]:
    transfer = get_or_404("transfers", transfer_id)
    transfer["status"] = "Transfer Completed"
    transfer["confirmed"] = True
    mission = get_or_404("missions", transfer["mission_id"])
    stn = get_or_404("stations", mission["station_id"])
    decision = decide_billing(BillingInput(mission_status=mission["status"], data_captured=True, transfer_completed=True, operator_confirmed=True, station_cost=float(stn.get("cost_per_pass_usd") or 0), service_fee=1000))
    billing = BillingRecord(mission_id=mission["id"], station_cost_usd=decision.station_cost, client_price_usd=decision.client_price, gs_service_fee_usd=decision.service_fee, gross_margin_usd=decision.gross_margin, status=decision.status.value, decision_reason=decision.reason)
    store("billing", billing)
    return transfer


@app.get("/billing")
def list_billing() -> List[Dict[str, Any]]:
    return list(DB["billing"].values())


@app.get("/billing/recommendation/{mission_id}")
def get_billing_recommendation(mission_id: str) -> Dict[str, Any]:
    mission = get_or_404("missions", mission_id)
    transfer = next((t for t in DB["transfers"].values() if t["mission_id"] == mission_id), None)
    reception = next((r for r in DB["receptions"].values() if r["mission_id"] == mission_id), None)
    return billing_recommendation(mission, transfer, reception)


@app.get("/reports/mission/{mission_id}")
def mission_report(mission_id: str) -> Dict[str, Any]:
    mission = get_or_404("missions", mission_id)
    sat = get_or_404("satellites", mission["satellite_id"])
    stn = get_or_404("stations", mission["station_id"])
    cfg = next((c for c in DB["configs"].values() if c["mission_id"] == mission_id), None)
    rec = next((r for r in DB["receptions"].values() if r["mission_id"] == mission_id), None)
    trf = next((t for t in DB["transfers"].values() if t["mission_id"] == mission_id), None)
    bil = next((b for b in DB["billing"].values() if b["mission_id"] == mission_id), None)
    report = generate_mission_report(mission, sat, stn, cfg, rec, trf, bil)
    DB["reports"][uuid4().hex] = report.__dict__
    return report.__dict__


@app.get("/reports/transfer/{transfer_id}")
def transfer_report(transfer_id: str) -> Dict[str, Any]:
    transfer = get_or_404("transfers", transfer_id)
    mission = get_or_404("missions", transfer["mission_id"])
    report = generate_transfer_report(transfer, mission)
    return report.__dict__


@app.get("/reports/billing/{billing_id}")
def billing_report(billing_id: str) -> Dict[str, Any]:
    billing = get_or_404("billing", billing_id)
    mission = get_or_404("missions", billing["mission_id"])
    report = generate_billing_statement(billing, mission)
    return report.__dict__


@app.get("/ai/alerts")
def ai_alerts() -> List[str]:
    return generate_operational_brief(platform_snapshot())["highest_priority_alerts"]


@app.get("/ai/brief")
def ai_brief() -> Dict[str, Any]:
    return generate_operational_brief(platform_snapshot())


@app.get("/ai/failure-classification/{mission_id}")
def failure_classification(mission_id: str) -> Dict[str, Any]:
    get_or_404("missions", mission_id)
    reception = next((r for r in DB["receptions"].values() if r["mission_id"] == mission_id), None)
    transfer = next((t for t in DB["transfers"].values() if t["mission_id"] == mission_id), None)
    return {"mission_id": mission_id, "classification": classify_failure(reception, transfer)}


@app.get("/readiness/mission/{mission_id}")
def readiness(mission_id: str) -> Dict[str, Any]:
    mission = get_or_404("missions", mission_id)
    cfg = next((c for c in DB["configs"].values() if c["mission_id"] == mission_id), None)
    trf = next((t for t in DB["transfers"].values() if t["mission_id"] == mission_id), None)
    return mission_readiness(mission, cfg, trf)


@app.get("/readiness/transfer/{transfer_id}")
def transfer_ready(transfer_id: str) -> Dict[str, Any]:
    transfer = get_or_404("transfers", transfer_id)
    return transfer_readiness(transfer)
