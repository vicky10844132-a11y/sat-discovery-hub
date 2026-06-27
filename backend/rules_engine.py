"""Rules engine for GS LinkOps AI.

Covers:
- capability matching
- mission readiness
- transfer readiness
- billing decision
- failure classification
"""

from __future__ import annotations

from typing import Any, Dict, List


def capability_match(satellite: Dict[str, Any], station: Dict[str, Any]) -> Dict[str, Any]:
    score = 30
    reasons: List[str] = []

    if station.get("authorization_status") == "Authorized" or station.get("status") == "Authorized":
        score += 15
    else:
        reasons.append("station authorization not confirmed")

    if satellite.get("authorization_status") in {"Authorized", "Testing"} or satellite.get("status") in {"Authorized", "Testing"}:
        score += 15
    else:
        reasons.append("satellite authorization not confirmed")

    sat_band = (satellite.get("band") or "").lower()
    st_band = (station.get("supported_band") or station.get("band") or "").lower()
    if sat_band and sat_band.split("/")[0].strip() in st_band:
        score += 15
    else:
        reasons.append("frequency band needs confirmation")

    sat_rate = satellite.get("data_rate_mbps") or satellite.get("rate")
    st_rate = station.get("max_data_rate_mbps") or station.get("maxRate")
    if not sat_rate or not st_rate or float(st_rate) >= float(sat_rate):
        score += 10
    else:
        reasons.append("data rate may exceed station capability")

    sat_pol = (satellite.get("polarization") or satellite.get("polar") or "").lower()
    st_pol = (station.get("polarization") or station.get("polar") or "").lower()
    if sat_pol and sat_pol.split("/")[0].strip() in st_pol:
        score += 10
    else:
        reasons.append("polarization needs confirmation")

    if station.get("latitude") is not None and station.get("longitude") is not None:
        score += 10
    else:
        reasons.append("station coordinates missing")

    if satellite.get("tle_line_1") and satellite.get("tle_line_2"):
        score += 5
    else:
        reasons.append("TLE missing")

    match_status = "Matched" if score >= 80 else "Conditional" if score >= 55 else "Need Review"
    return {
        "score": min(100, score),
        "match_status": match_status,
        "reasons": reasons,
        "summary": "; ".join(reasons) if reasons else "ready",
    }


def mission_readiness(mission: Dict[str, Any], config: Dict[str, Any] | None, transfer: Dict[str, Any] | None) -> Dict[str, Any]:
    missing: List[str] = []
    if not mission.get("satellite_id"):
        missing.append("satellite")
    if not mission.get("station_id"):
        missing.append("ground station")
    if config is None:
        missing.append("station configuration")
    elif not (config.get("manufacturer_confirmed") and config.get("station_confirmed")):
        missing.append("configuration confirmation")
    if mission.get("status") in {"Data Captured", "Transfer Waiting"} and transfer is None:
        missing.append("transfer job")
    return {
        "ready": not missing,
        "missing": missing,
        "recommendation": "Ready to execute" if not missing else "Resolve missing items before execution: " + ", ".join(missing),
    }


def transfer_readiness(transfer: Dict[str, Any]) -> Dict[str, Any]:
    missing: List[str] = []
    for field in ["method", "destination_path", "manifest", "checksum_value"]:
        if not transfer.get(field):
            missing.append(field)
    complete = transfer.get("status") == "Transfer Completed" and bool(transfer.get("confirmed"))
    return {
        "ready_for_billing": complete,
        "missing": missing,
        "recommendation": "Ready for billing" if complete else "Hold billing until transfer and confirmation are complete",
    }


def billing_decision(mission: Dict[str, Any], transfer: Dict[str, Any] | None, reception: Dict[str, Any] | None) -> Dict[str, Any]:
    if transfer and transfer.get("status") == "Transfer Completed" and transfer.get("confirmed"):
        return {"status": "Billable", "reason": "Transfer completed and operator/manufacturer confirmation recorded."}
    if reception and reception.get("signal_detected") and not reception.get("data_captured"):
        return {"status": "Test Billable / Partial", "reason": "Signal acquired but full data capture not confirmed."}
    if mission.get("status") in {"Failed", "Cancelled"}:
        return {"status": "Not Billable / Contract Rule", "reason": "Mission failed or cancelled; apply contract rule."}
    return {"status": "Hold", "reason": "Billing trigger not yet satisfied."}


def classify_failure(reception: Dict[str, Any] | None, transfer: Dict[str, Any] | None) -> str:
    if reception:
        if not reception.get("signal_detected"):
            return "Visibility Issue or Station Tracking Issue"
        if not reception.get("carrier_lock"):
            return "RF Parameter Issue or Carrier Lock Issue"
        if not reception.get("demod_lock"):
            return "Demodulation Issue"
        if not reception.get("frame_sync"):
            return "Frame Sync Issue"
        if not reception.get("data_captured"):
            return "Data Capture Issue"
    if transfer and transfer.get("status") in {"Transfer Failed", "Destination Unreachable", "Checksum Failed"}:
        return "Transfer Issue"
    return "Unknown / Requires Manual Review"
