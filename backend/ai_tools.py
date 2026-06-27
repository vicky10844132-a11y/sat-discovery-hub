"""Tool registry for embedded GS LinkOps AI Operator.

The platform owner should be able to use natural language. The AI Operator maps
intent to safe platform tools. Tools that change records should be confirmation-
gated in the UI.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, List


@dataclass
class AITool:
    name: str
    description: str
    category: str
    requires_confirmation: bool
    input_schema: Dict[str, Any]


TOOLS: List[AITool] = [
    AITool(
        name="get_platform_brief",
        category="read",
        requires_confirmation=False,
        description="Summarize current organizations, stations, satellites, missions, transfers, billing records and AI alerts.",
        input_schema={"type": "object", "properties": {}},
    ),
    AITool(
        name="check_missing_resource_fields",
        category="read",
        requires_confirmation=False,
        description="Check missing fields for satellites, ground stations, contacts, TLE, authorization and transfer settings.",
        input_schema={"type": "object", "properties": {}},
    ),
    AITool(
        name="recommend_best_contact",
        category="read",
        requires_confirmation=False,
        description="Recommend the best satellite/station pair based on capability matching and pass windows.",
        input_schema={"type": "object", "properties": {"satellite_id": {"type": "string"}, "station_id": {"type": "string"}}},
    ),
    AITool(
        name="calculate_pass_windows",
        category="operation",
        requires_confirmation=True,
        description="Run orbit/contact calculation for available satellite and ground station resources.",
        input_schema={"type": "object", "properties": {}},
    ),
    AITool(
        name="create_downlink_mission",
        category="operation",
        requires_confirmation=True,
        description="Create a downlink mission from a selected pass window.",
        input_schema={"type": "object", "properties": {"pass_id": {"type": "string"}}, "required": ["pass_id"]},
    ),
    AITool(
        name="advance_mission_status",
        category="operation",
        requires_confirmation=True,
        description="Move a mission to the next workflow status and create dependent records when needed.",
        input_schema={"type": "object", "properties": {"mission_id": {"type": "string"}}, "required": ["mission_id"]},
    ),
    AITool(
        name="check_mission_readiness",
        category="read",
        requires_confirmation=False,
        description="Check whether a mission is ready for execution, transfer, reporting or billing.",
        input_schema={"type": "object", "properties": {"mission_id": {"type": "string"}}, "required": ["mission_id"]},
    ),
    AITool(
        name="complete_transfer",
        category="operation",
        requires_confirmation=True,
        description="Mark a transfer as completed and trigger billing decision.",
        input_schema={"type": "object", "properties": {"transfer_id": {"type": "string"}}, "required": ["transfer_id"]},
    ),
    AITool(
        name="generate_mission_report",
        category="report",
        requires_confirmation=False,
        description="Generate a customer/manufacturer-facing mission report.",
        input_schema={"type": "object", "properties": {"mission_id": {"type": "string"}}, "required": ["mission_id"]},
    ),
    AITool(
        name="get_billing_recommendation",
        category="commercial",
        requires_confirmation=False,
        description="Determine whether a mission is billable, hold, partial billable, test billable or not billable.",
        input_schema={"type": "object", "properties": {"mission_id": {"type": "string"}}, "required": ["mission_id"]},
    ),
]


def list_tools() -> List[Dict[str, Any]]:
    return [tool.__dict__ for tool in TOOLS]


def find_tool(name: str) -> AITool | None:
    for tool in TOOLS:
        if tool.name == name:
            return tool
    return None
