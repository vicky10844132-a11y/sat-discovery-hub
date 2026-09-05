from __future__ import annotations

from dataclasses import asdict
from typing import Any, Dict, Iterable, List
from uuid import uuid4

from .agents import AgentRegistry, default_registry
from .memory import JsonlMemoryStore
from .models import AgentTask, Evaluation, GoalPlan, TaskStatus


class SpaceAGIOrchestrator:
    """Deterministic v0.1 orchestration kernel.

    The planner and evaluator are deliberately explicit and inspectable.
    LLM reasoning can be bound later without changing the execution contract.
    """

    def __init__(
        self,
        registry: AgentRegistry | None = None,
        memory: JsonlMemoryStore | None = None,
    ) -> None:
        self.registry = registry or default_registry()
        self.memory = memory or JsonlMemoryStore()

    def plan(self, goal: str, context: Dict[str, Any] | None = None) -> GoalPlan:
        context = context or {}
        route = self._route(goal, context)
        tasks: List[AgentTask] = []
        previous_id: str | None = None

        for agent_name, objective in route:
            task_id = f"task-{uuid4().hex[:10]}"
            tasks.append(
                AgentTask(
                    id=task_id,
                    objective=objective,
                    agent=agent_name,
                    inputs={"goal": goal, "context": context},
                    dependencies=[previous_id] if previous_id else [],
                )
            )
            previous_id = task_id

        plan = GoalPlan(goal=goal, tasks=tasks, metadata={"version": "0.1"})
        self.memory.remember("plan", goal, self._plan_to_dict(plan))
        return plan

    def execute(self, plan: GoalPlan) -> Dict[str, Any]:
        results: Dict[str, Dict[str, Any]] = {}

        for task in plan.tasks:
            if not self._dependencies_complete(task, results):
                task.status = TaskStatus.BLOCKED
                task.error = "Dependency not completed"
                results[task.id] = asdict(task)
                continue

            task.status = TaskStatus.RUNNING
            while task.attempts < task.max_attempts:
                task.attempts += 1
                try:
                    payload = {
                        **task.inputs,
                        "objective": task.objective,
                        "dependency_results": {
                            dep: results.get(dep) for dep in task.dependencies
                        },
                        "attempt": task.attempts,
                    }
                    task.result = self.registry.run(task.agent, payload)
                    evaluation = self.evaluate(task)
                    if evaluation.passed:
                        task.status = TaskStatus.COMPLETED
                        break
                    task.error = "; ".join(evaluation.reasons)
                except Exception as exc:  # execution boundary: never crash whole plan
                    task.error = f"{type(exc).__name__}: {exc}"

            if task.status != TaskStatus.COMPLETED:
                task.status = TaskStatus.FAILED

            results[task.id] = asdict(task)
            self.memory.remember(
                "task_result",
                task.objective,
                {"task": asdict(task), "goal": plan.goal},
            )

        summary = {
            "goal": plan.goal,
            "status": self._plan_status(plan.tasks),
            "tasks": results,
        }
        self.memory.remember("execution", plan.goal, summary)
        return summary

    def run(self, goal: str, context: Dict[str, Any] | None = None) -> Dict[str, Any]:
        plan = self.plan(goal, context)
        return self.execute(plan)

    def evaluate(self, task: AgentTask) -> Evaluation:
        result = task.result or {}
        if result.get("status") in {"ready_for_tool_binding", "ok", "completed", "success"}:
            return Evaluation(passed=True, score=1.0)
        return Evaluation(
            passed=False,
            score=0.0,
            reasons=["Agent result did not satisfy the execution contract."],
            retry_instruction="Retry with inspected inputs and tool output.",
        )

    def _route(self, goal: str, context: Dict[str, Any]) -> Iterable[tuple[str, str]]:
        text = f"{goal} {context}".lower()
        route: List[tuple[str, str]] = []

        if any(k in text for k in ["email", "邮件", "reply", "回复", "requirement", "需求"]):
            route.append(("communications", "Extract and normalize the incoming requirement"))
        if any(k in text for k in ["aoi", "satellite", "卫星", "imagery", "影像", "data", "数据", "tasking", "编程"]):
            route.append(("data", "Resolve EO data, AOI, catalog and tasking requirements"))
        if any(k in text for k in ["orbit", "轨道", "ground station", "地面站", "pass", "过境", "mission", "任务"]):
            route.append(("mission", "Resolve mission, orbit and ground-station operations"))
        if any(k in text for k in ["quote", "报价", "contract", "合同", "invoice", "发票", "payment", "付款", "project", "项目"]):
            route.append(("commercial", "Resolve commercial and project-control actions"))
        if any(k in text for k in ["research", "查", "政策", "market", "市场", "supplier", "厂家"]):
            route.append(("research", "Perform source-backed research required by the goal"))

        if not route:
            route.append(("research", "Interpret the goal and collect the information needed to proceed"))

        route.append(("critic", "Validate outputs against the original goal and execution requirements"))
        return route

    @staticmethod
    def _dependencies_complete(task: AgentTask, results: Dict[str, Dict[str, Any]]) -> bool:
        return all(results.get(dep, {}).get("status") == TaskStatus.COMPLETED.value for dep in task.dependencies)

    @staticmethod
    def _plan_status(tasks: List[AgentTask]) -> str:
        if all(task.status == TaskStatus.COMPLETED for task in tasks):
            return "completed"
        if any(task.status == TaskStatus.FAILED for task in tasks):
            return "failed"
        return "partial"

    @staticmethod
    def _plan_to_dict(plan: GoalPlan) -> Dict[str, Any]:
        return {
            "goal": plan.goal,
            "tasks": [asdict(task) for task in plan.tasks],
            "metadata": plan.metadata,
        }
