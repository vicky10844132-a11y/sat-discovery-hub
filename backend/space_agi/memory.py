from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


@dataclass
class MemoryRecord:
    ts: str
    kind: str
    key: str
    payload: Dict[str, Any]


class JsonlMemoryStore:
    """Small durable memory store for v0.1.

    Production migration target: PostgreSQL + pgvector (or another vector DB),
    while preserving this interface.
    """

    def __init__(self, path: str = "data/space_agi_memory.jsonl") -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def remember(self, kind: str, key: str, payload: Dict[str, Any]) -> MemoryRecord:
        record = MemoryRecord(
            ts=datetime.now(timezone.utc).isoformat(),
            kind=kind,
            key=key,
            payload=payload,
        )
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")
        return record

    def recall(self, key: str, limit: int = 20) -> List[Dict[str, Any]]:
        if not self.path.exists():
            return []
        matches: List[Dict[str, Any]] = []
        with self.path.open("r", encoding="utf-8") as fh:
            for line in fh:
                try:
                    item = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if key.lower() in str(item.get("key", "")).lower() or key.lower() in json.dumps(item.get("payload", {}), ensure_ascii=False).lower():
                    matches.append(item)
        return matches[-limit:]
