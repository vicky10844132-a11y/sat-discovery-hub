from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    BLOCKED = "blocked"
    FAILED = "failed"
    COMPLETED = "completed"


@dataclass
class AgentTask:
    id: str
    objective: str
    agent: str
    status: TaskStatus = TaskStatus.PENDING
    inputs: Dict[str, Any] = field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    attempts: int = 0
    max_attempts: int = 3
    dependencies: List[str] = field(default_factory=list)


@dataclass
class GoalPlan:
    goal: str
    tasks: List[AgentTask]
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Evaluation:
    passed: bool
    score: float
    reasons: List[str] = field(default_factory=list)
    retry_instruction: Optional[str] = None
