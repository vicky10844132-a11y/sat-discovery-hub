from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ContactCandidate:
    id: str
    satellite_id: str
    station_id: str
    antenna_id: str
    aos_utc: datetime
    los_utc: datetime
    max_elevation_deg: float
    priority: int = 3
    data_volume_gb: float = 0.0


@dataclass(frozen=True)
class ScheduledContact:
    candidate: ContactCandidate
    accepted: bool
    reason: str | None = None


def _overlap(a: ContactCandidate, b: ContactCandidate) -> bool:
    return a.aos_utc < b.los_utc and b.aos_utc < a.los_utc


def schedule_contacts(candidates: list[ContactCandidate]) -> list[ScheduledContact]:
    """Greedy deterministic antenna scheduler.

    Higher priority wins, then higher elevation, then earlier AOS. This is a V1
    operational baseline that can later be replaced by MILP/CP-SAT optimization.
    """
    ordered = sorted(
        candidates,
        key=lambda c: (c.priority, c.max_elevation_deg, -c.aos_utc.timestamp()),
        reverse=True,
    )
    accepted: list[ContactCandidate] = []
    result: dict[str, ScheduledContact] = {}

    for candidate in ordered:
        conflict = next(
            (
                chosen
                for chosen in accepted
                if chosen.antenna_id == candidate.antenna_id and _overlap(chosen, candidate)
            ),
            None,
        )
        if conflict:
            result[candidate.id] = ScheduledContact(
                candidate=candidate,
                accepted=False,
                reason=f"antenna_conflict:{conflict.id}",
            )
        else:
            accepted.append(candidate)
            result[candidate.id] = ScheduledContact(candidate=candidate, accepted=True)

    return [result[c.id] for c in candidates]
