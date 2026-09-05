from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict


AgentHandler = Callable[[Dict[str, Any]], Dict[str, Any]]


@dataclass
class AgentDefinition:
    name: str
    description: str
    handler: AgentHandler


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: Dict[str, AgentDefinition] = {}

    def register(self, name: str, description: str, handler: AgentHandler) -> None:
        self._agents[name] = AgentDefinition(name=name, description=description, handler=handler)

    def run(self, name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if name not in self._agents:
            raise KeyError(f"Unknown agent: {name}")
        return self._agents[name].handler(payload)

    def capabilities(self) -> Dict[str, str]:
        return {name: item.description for name, item in self._agents.items()}


def passthrough_agent(role: str) -> AgentHandler:
    """Safe v0.1 placeholder that exposes orchestration before LLM/tool binding."""
    def _run(payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "role": role,
            "status": "ready_for_tool_binding",
            "received": payload,
        }
    return _run


def default_registry() -> AgentRegistry:
    registry = AgentRegistry()
    registry.register("mission", "Mission planning, orbit, pass and ground-station workflow", passthrough_agent("mission"))
    registry.register("data", "EO catalog, AOI, imagery search, tasking and delivery workflow", passthrough_agent("data"))
    registry.register("commercial", "Quoting, contracts, invoices, payment and project workflow", passthrough_agent("commercial"))
    registry.register("research", "Source-backed market, policy and supplier research", passthrough_agent("research"))
    registry.register("communications", "Email intake, requirement extraction and reply workflow", passthrough_agent("communications"))
    registry.register("critic", "Result validation, requirement checks and retry decisions", passthrough_agent("critic"))
    return registry
