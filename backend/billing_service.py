"""Billing service for GS LinkOps AI.

Supports operational, test, partial-success and failure/cancellation billing logic.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class BillingMode(str, Enum):
    per_pass = "Per pass"
    per_minute = "Per minute"
    per_successful_downlink = "Per successful downlink"
    per_test_mission = "Per test mission"
    cost_plus_service_fee = "Cost plus service fee"
    monthly_package = "Monthly package"
    partial_failure_rule = "Partial / failure rule"
    cancellation_rule = "Cancellation rule"


class BillingStatus(str, Enum):
    hold = "Hold"
    billable = "Billable"
    test_billable = "Test Billable"
    partial_billable = "Partial Billable"
    not_billable = "Not Billable"
    contract_rule = "Apply Contract Rule"


@dataclass
class BillingInput:
    mission_status: str
    signal_detected: bool = False
    carrier_lock: bool = False
    demod_lock: bool = False
    frame_sync: bool = False
    data_captured: bool = False
    transfer_completed: bool = False
    operator_confirmed: bool = False
    scheduled_duration_min: float = 0
    actual_duration_min: float = 0
    station_cost: float = 0
    client_rate: float = 0
    service_fee: float = 0
    billing_mode: BillingMode = BillingMode.per_successful_downlink


@dataclass
class BillingDecision:
    status: BillingStatus
    reason: str
    station_cost: float
    client_price: float
    service_fee: float
    gross_margin: float
    billable_duration_min: float


def decide_billing(data: BillingInput) -> BillingDecision:
    duration = data.actual_duration_min or data.scheduled_duration_min

    if data.transfer_completed and data.operator_confirmed:
        client_price = calculate_price(data, duration)
        return BillingDecision(
            status=BillingStatus.billable,
            reason="Transfer completed and operator/manufacturer confirmation recorded.",
            station_cost=data.station_cost,
            client_price=client_price,
            service_fee=data.service_fee,
            gross_margin=client_price - data.station_cost,
            billable_duration_min=duration,
        )

    if data.signal_detected and not data.data_captured:
        client_price = data.client_rate or data.service_fee
        return BillingDecision(
            status=BillingStatus.test_billable,
            reason="Signal acquired but full data capture not confirmed; test billing may apply.",
            station_cost=data.station_cost,
            client_price=client_price,
            service_fee=max(0, client_price - data.station_cost),
            gross_margin=client_price - data.station_cost,
            billable_duration_min=duration,
        )

    if data.carrier_lock or data.demod_lock or data.frame_sync:
        client_price = max(data.client_rate * 0.5, data.service_fee) if data.client_rate else data.service_fee
        return BillingDecision(
            status=BillingStatus.partial_billable,
            reason="Partial technical success recorded; partial billing rule may apply.",
            station_cost=data.station_cost,
            client_price=client_price,
            service_fee=max(0, client_price - data.station_cost),
            gross_margin=client_price - data.station_cost,
            billable_duration_min=duration,
        )

    if data.mission_status in {"Failed", "Cancelled"}:
        return BillingDecision(
            status=BillingStatus.contract_rule,
            reason="Mission failed/cancelled. Apply agreed failure or cancellation rule.",
            station_cost=data.station_cost,
            client_price=0,
            service_fee=0,
            gross_margin=-data.station_cost,
            billable_duration_min=0,
        )

    return BillingDecision(
        status=BillingStatus.hold,
        reason="Billing trigger not yet satisfied.",
        station_cost=data.station_cost,
        client_price=0,
        service_fee=0,
        gross_margin=-data.station_cost if data.station_cost else 0,
        billable_duration_min=0,
    )


def calculate_price(data: BillingInput, duration_min: float) -> float:
    if data.billing_mode == BillingMode.per_minute:
        return duration_min * data.client_rate
    if data.billing_mode == BillingMode.cost_plus_service_fee:
        return data.station_cost + data.service_fee
    if data.billing_mode == BillingMode.per_pass:
        return data.client_rate
    if data.billing_mode == BillingMode.per_successful_downlink:
        return data.client_rate or data.station_cost + data.service_fee
    if data.billing_mode == BillingMode.per_test_mission:
        return data.client_rate or data.service_fee
    return data.client_rate
