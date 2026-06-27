"""Report service for GS LinkOps AI.

Generates mission, transfer, billing and failure-analysis summaries.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional


@dataclass
class Report:
    report_type: str
    title: str
    body: str
    generated_at_utc: str
    generated_by: str = "GS LinkOps AI"


def generate_mission_report(
    mission: Dict[str, Any],
    satellite: Dict[str, Any],
    station: Dict[str, Any],
    config: Optional[Dict[str, Any]] = None,
    reception: Optional[Dict[str, Any]] = None,
    transfer: Optional[Dict[str, Any]] = None,
    billing: Optional[Dict[str, Any]] = None,
) -> Report:
    title = f"Mission Report — {mission.get('mission_code') or mission.get('id')}"
    body = f"""
Mission Overview
- Mission: {mission.get('mission_code') or mission.get('id')}
- Status: {mission.get('status')}
- Satellite: {satellite.get('satellite_name') or satellite.get('name') or satellite.get('id')}
- Ground Station: {station.get('station_name') or station.get('name') or station.get('id')}

Configuration
- Status: {config_status(config)}

Reception
- Status: {reception_status(reception)}

Transfer
- Status: {transfer_status(transfer)}

Billing
- Status: {billing_status(billing)}

Conclusion
{mission_conclusion(mission, reception, transfer, billing)}
""".strip()
    return Report("Mission Report", title, body, datetime.now(timezone.utc).isoformat())


def generate_transfer_report(transfer: Dict[str, Any], mission: Dict[str, Any]) -> Report:
    title = f"Transfer Handover Report — {mission.get('mission_code') or mission.get('id')}"
    body = f"""
Transfer Job
- Transfer ID: {transfer.get('id')}
- Mission: {mission.get('mission_code') or mission.get('id')}
- Method: {transfer.get('transfer_method') or transfer.get('method')}
- Source Path: {transfer.get('source_path')}
- Destination Path: {transfer.get('destination_path')}
- Manifest: {transfer.get('file_manifest') or transfer.get('manifest')}
- Total Size: {transfer.get('total_size')}
- Checksum: {transfer.get('checksum_type')} / {transfer.get('checksum_value')}
- Status: {transfer.get('transfer_status') or transfer.get('status')}
- Confirmation: {transfer.get('confirmation_person') or 'Pending'}
""".strip()
    return Report("Transfer Handover Report", title, body, datetime.now(timezone.utc).isoformat())


def generate_billing_statement(billing: Dict[str, Any], mission: Dict[str, Any]) -> Report:
    title = f"Billing Statement — {mission.get('mission_code') or mission.get('id')}"
    body = f"""
Billing Summary
- Mission: {mission.get('mission_code') or mission.get('id')}
- Billing Mode: {billing.get('billing_mode')}
- Billing Trigger: {billing.get('billing_trigger')}
- Station Cost: {billing.get('station_cost_usd')}
- Client Price: {billing.get('client_price_usd')}
- GS Service Fee: {billing.get('gs_service_fee_usd')}
- Gross Margin: {billing.get('gross_margin_usd')}
- Currency: {billing.get('currency', 'USD')}
- Billing Status: {billing.get('billing_status') or billing.get('status')}
- Decision Reason: {billing.get('billing_decision_reason') or billing.get('decision_reason')}
""".strip()
    return Report("Billing Statement", title, body, datetime.now(timezone.utc).isoformat())


def config_status(config: Optional[Dict[str, Any]]) -> str:
    if not config:
        return "Not created"
    if config.get("manufacturer_confirmed") and config.get("station_confirmed"):
        return "Confirmed by manufacturer and station"
    return "Pending confirmation"


def reception_status(reception: Optional[Dict[str, Any]]) -> str:
    if not reception:
        return "Not recorded"
    if reception.get("data_captured"):
        return "Data captured"
    if reception.get("frame_sync"):
        return "Frame sync confirmed"
    if reception.get("demod_lock"):
        return "Demod lock confirmed"
    if reception.get("carrier_lock"):
        return "Carrier lock confirmed"
    if reception.get("signal_detected"):
        return "Signal acquired"
    return "No signal confirmed"


def transfer_status(transfer: Optional[Dict[str, Any]]) -> str:
    if not transfer:
        return "Not created"
    return transfer.get("transfer_status") or transfer.get("status") or "Unknown"


def billing_status(billing: Optional[Dict[str, Any]]) -> str:
    if not billing:
        return "Not billable yet"
    return billing.get("billing_status") or billing.get("status") or "Unknown"


def mission_conclusion(
    mission: Dict[str, Any],
    reception: Optional[Dict[str, Any]],
    transfer: Optional[Dict[str, Any]],
    billing: Optional[Dict[str, Any]],
) -> str:
    if billing and (billing.get("billing_status") == "Billable" or billing.get("status") == "Billable"):
        return "Mission has satisfied the billing trigger and is ready for invoicing/settlement."
    if transfer and (transfer.get("transfer_status") == "Transfer Completed" or transfer.get("status") == "Transfer Completed"):
        return "Transfer is completed but billing may still require operator/manufacturer confirmation."
    if reception and reception.get("signal_detected"):
        return "Reception evidence exists. Continue transfer or apply test/partial billing rules if applicable."
    return "Mission remains in progress or requires manual review."
