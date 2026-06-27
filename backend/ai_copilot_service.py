"""AI Copilot service for GS LinkOps AI.

This is a deterministic rules-plus-summary layer. A production LLM can be added
behind these structured checks later.
"""

from __future__ import annotations

from typing import Any, Dict, List

from rules_engine import billing_decision, capability_match, classify_failure, mission_readiness, transfer_readiness


def generate_operational_brief(data: Dict[str, Any]) -> Dict[str, Any]:
    alerts = generate_alerts(data)
    return {
        "summary": {
            "organizations": len(data.get("organizations", [])),
            "stations": len(data.get("stations", [])),
            "satellites": len(data.get("satellites", [])),
            "missions": len(data.get("missions", [])),
            "transfers": len(data.get("transfers", [])),
            "billing_records": len(data.get("billing", [])),
        },
        "highest_priority_alerts": alerts[:10],
        "recommended_next_action": next_action(alerts),
    }


def generate_alerts(data: Dict[str, Any]) -> List[str]:
    alerts: List[str] = []
    stations = data.get("stations", [])
    satellites = data.get("satellites", [])
    missions = data.get("missions", [])
    transfers = data.get("transfers", [])
    configs = data.get("configs", [])
    receptions = data.get("receptions", [])

    if not data.get("organizations"):
        alerts.append("Governance: no organizations have been added.")
    if not stations:
        alerts.append("Resource: no ground station resources have been added.")
    if not satellites:
        alerts.append("Resource: no satellite resources have been added.")

    for sat in satellites:
        if not sat.get("tle_line_1") or not sat.get("tle_line_2"):
            alerts.append(f"Orbit: satellite {sat.get('name') or sat.get('id')} is missing TLE.")
        if not sat.get("band") or not sat.get("polarization"):
            alerts.append(f"Downlink: satellite {sat.get('name') or sat.get('id')} is missing band or polarization.")

    for st in stations:
        if st.get("latitude") is None or st.get("longitude") is None:
            alerts.append(f"Station: {st.get('name') or st.get('id')} is missing coordinates.")
        if st.get("status") != "Authorized" and st.get("authorization_status") != "Authorized":
            alerts.append(f"Station: {st.get('name') or st.get('id')} is not marked Authorized.")

    for mission in missions:
        config = first_by(configs, "mission_id", mission.get("id"))
        transfer = first_by(transfers, "mission_id", mission.get("id"))
        readiness = mission_readiness(mission, config, transfer)
        if not readiness["ready"]:
            alerts.append(f"Mission {mission.get('id')}: {readiness['recommendation']}")
        if transfer:
            tr = transfer_readiness(transfer)
            if not tr["ready_for_billing"]:
                alerts.append(f"Transfer {transfer.get('id')}: {tr['recommendation']}")
        reception = first_by(receptions, "mission_id", mission.get("id"))
        if mission.get("status") == "Failed":
            alerts.append(f"Mission {mission.get('id')} failure classification: {classify_failure(reception, transfer)}")

    return alerts or ["No major alerts detected."]


def recommend_best_contact(satellites: List[Dict[str, Any]], stations: List[Dict[str, Any]]) -> Dict[str, Any]:
    best = None
    for sat in satellites:
        for station in stations:
            result = capability_match(sat, station)
            item = {
                "satellite": sat.get("name") or sat.get("id"),
                "station": station.get("name") or station.get("id"),
                **result,
            }
            if best is None or item["score"] > best["score"]:
                best = item
    return best or {"recommendation": "Add at least one satellite and one ground station."}


def billing_recommendation(mission: Dict[str, Any], transfer: Dict[str, Any] | None, reception: Dict[str, Any] | None) -> Dict[str, Any]:
    return billing_decision(mission, transfer, reception)


def next_action(alerts: List[str]) -> str:
    if not alerts:
        return "Continue operations."
    first = alerts[0]
    if first.startswith("Resource") or first.startswith("Governance"):
        return "Complete resource onboarding first."
    if first.startswith("Orbit"):
        return "Upload or refresh TLE records."
    if first.startswith("Mission"):
        return "Open Mission Control and resolve the missing workflow items."
    if first.startswith("Transfer"):
        return "Open Transfer Center and complete delivery confirmation."
    return "Review AI alerts and resolve the highest-risk item."


def first_by(items: List[Dict[str, Any]], key: str, value: Any) -> Dict[str, Any] | None:
    for item in items:
        if item.get(key) == value:
            return item
    return None
