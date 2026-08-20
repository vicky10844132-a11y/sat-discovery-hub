from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


@dataclass(slots=True)
class MissionObjective:
    objective: str
    sensor: Literal["optical", "sar", "any"] = "any"
    priority: int = 3
    max_cloud_pct: float | None = None
    max_resolution_m: float | None = None


@dataclass(slots=True)
class MissionStage:
    key: str
    label: str
    status: Literal["pending", "running", "complete", "blocked"] = "pending"
    details: dict = field(default_factory=dict)


DEFAULT_PIPELINE = [
    MissionStage("resolve_target", "Resolve target / AOI"),
    MissionStage("orbit", "Enumerate orbital opportunities"),
    MissionStage("payload", "Apply payload constraints"),
    MissionStage("weather", "Apply weather constraints"),
    MissionStage("ground", "Select ground contacts"),
    MissionStage("schedule", "Resolve scheduling conflicts"),
    MissionStage("delivery", "Estimate processing and delivery"),
    MissionStage("rank", "Rank feasible mission plans"),
]


def build_pipeline() -> list[MissionStage]:
    return [MissionStage(stage.key, stage.label, stage.status, dict(stage.details)) for stage in DEFAULT_PIPELINE]
