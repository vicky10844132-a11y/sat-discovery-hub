from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .orchestrator import SpaceAGIOrchestrator

router = APIRouter(prefix="/api/space-agi", tags=["SPACE AGI OS"])
orchestrator = SpaceAGIOrchestrator()


class GoalRequest(BaseModel):
    goal: str = Field(min_length=3)
    context: Dict[str, Any] = Field(default_factory=dict)


@router.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "system": "SPACE AGI OS",
        "version": "0.1",
        "agents": orchestrator.registry.capabilities(),
    }


@router.post("/run")
def run_goal(request: GoalRequest) -> Dict[str, Any]:
    return orchestrator.run(request.goal, request.context)


@router.get("/memory")
def recall_memory(q: str, limit: int = 20) -> Dict[str, Any]:
    return {"query": q, "items": orchestrator.memory.recall(q, limit=max(1, min(limit, 100)))}
