# SPACE AGI OS v0.1

SPACE AGI OS is a goal-driven orchestration layer for satellite-data, mission, ground-station, research, communications and commercial workflows.

## v0.1 Core Loop

`Goal -> Plan -> Execute -> Evaluate -> Retry -> Memory`

The v0.1 kernel is deliberately inspectable. It uses deterministic routing and explicit execution contracts first; frontier-model planning, tool execution and vector memory can be added without replacing the orchestration interface.

## Current Modules

- `backend/space_agi/models.py` — task, plan and evaluation state models.
- `backend/space_agi/memory.py` — persistent JSONL episodic memory interface.
- `backend/space_agi/agents.py` — domain-agent registry.
- `backend/space_agi/orchestrator.py` — planning, dependency execution, evaluation, retry and memory loop.
- `backend/space_agi/api.py` — FastAPI endpoints for health, goal execution and memory recall.
- `space_agi_console.py` — Streamlit command console and execution trace.
- `backend/space_agi/test_orchestrator.py` — smoke tests.

## Domain Agents

1. Communications Agent — email intake, requirement extraction and replies.
2. EO Data Agent — AOI, catalog, imagery search, tasking and delivery.
3. Mission Agent — orbit, pass and ground-station operations.
4. Commercial Agent — quotes, contracts, invoices, payment and project control.
5. Research Agent — source-backed policy, market and supplier research.
6. Critic Agent — validation and retry decisions.

## Existing Repository Capabilities to Bind Next

The repository already contains domain services such as AI Copilot, AI tools, orbit data sources, orbit engine, GS LinkOps API, billing and rules. These are the first concrete tools that should replace the v0.1 agent placeholders.

## Target Vertical Workflow

Example: Belize imagery project.

1. Receive project goal or incoming email.
2. Extract AOI and acquisition requirements.
3. Validate resolution, cloud, processing level, CRS, buffer and time window.
4. Query satellite/catalog providers.
5. Evaluate acquisition feasibility and alternatives.
6. Generate supplier requirement package.
7. Track supplier response.
8. Build commercial quote and project record.
9. Track delivery, invoice and payment.
10. Critic validates completion against the original requirement.
11. Store execution experience in long-term memory.

## Roadmap

### v0.2 — Real Tool Binding
- Bind repository orbit engine and ground-station services.
- Bind satellite catalog/AOI tools.
- Bind Gmail intake/reply workflow through authorized connectors.
- Bind project ledger and commercial workflow.

### v0.3 — Frontier Model Planner
- Structured planning output.
- Dynamic task graph generation.
- Tool selection.
- Context-aware replanning.

### v0.4 — Long-Term Semantic Memory
- PostgreSQL + vector retrieval.
- Project memory.
- Supplier memory.
- Workflow memory.
- Experience replay.

### v0.5 — Autonomous Project Controller
- Event-driven execution.
- Approval gates for sensitive/external actions.
- Deadline/watch conditions.
- Full execution trace and audit log.

## Safety / Governance

External writes, commercial commitments, credential release and irreversible actions must remain behind explicit authorization gates. The agent may prepare and recommend actions automatically, but authority boundaries must be enforced in code.
