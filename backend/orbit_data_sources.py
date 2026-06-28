"""External orbit data source adapters for GS LinkOps AI.

This module defines safe integration points for TLE/OMM acquisition. It does not
hard-code any satellite resources. The owner or approved resource package decides
which satellites are allowed to be used for real missions.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, Optional
from urllib.parse import quote_plus
from urllib.request import Request, urlopen


@dataclass
class OrbitElementRecord:
    source: str
    query: str
    format: str
    retrieved_at: str
    raw: str
    warning: Optional[str] = None


class OrbitSourceError(RuntimeError):
    pass


def fetch_celestrak_gp_by_norad(norad_id: str, fmt: str = "TLE") -> OrbitElementRecord:
    """Fetch GP data from CelesTrak by NORAD catalog number.

    Supported formats include TLE, 2LE, XML, KVN, JSON, JSON-PRETTY and CSV.
    The caller should cache responses and avoid frequent repeated requests.
    """
    if not norad_id or not norad_id.strip().isdigit():
        raise OrbitSourceError("NORAD ID must be numeric.")
    fmt = fmt.upper().strip()
    url = f"https://celestrak.org/NORAD/elements/gp.php?CATNR={quote_plus(norad_id.strip())}&FORMAT={quote_plus(fmt)}"
    return _http_get(url, source="CelesTrak", query=f"CATNR={norad_id}", fmt=fmt)


def fetch_celestrak_gp_by_name(name: str, fmt: str = "TLE") -> OrbitElementRecord:
    """Fetch GP data from CelesTrak by satellite name search."""
    if not name or not name.strip():
        raise OrbitSourceError("Satellite name is required.")
    fmt = fmt.upper().strip()
    url = f"https://celestrak.org/NORAD/elements/gp.php?NAME={quote_plus(name.strip())}&FORMAT={quote_plus(fmt)}"
    return _http_get(url, source="CelesTrak", query=f"NAME={name}", fmt=fmt)


def fetch_celestrak_gp_group(group: str, fmt: str = "JSON") -> OrbitElementRecord:
    """Fetch a CelesTrak GP group such as ACTIVE, STATIONS, STARLINK, GPS-OPS."""
    if not group or not group.strip():
        raise OrbitSourceError("Group name is required.")
    fmt = fmt.upper().strip()
    url = f"https://celestrak.org/NORAD/elements/gp.php?GROUP={quote_plus(group.strip().upper())}&FORMAT={quote_plus(fmt)}"
    return _http_get(url, source="CelesTrak", query=f"GROUP={group}", fmt=fmt)


def parse_tle_text(raw: str) -> Dict[str, str]:
    """Extract title, line1 and line2 from TLE/3LE text."""
    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    line1 = next((line for line in lines if line.startswith("1 ")), None)
    line2 = next((line for line in lines if line.startswith("2 ")), None)
    if not line1 or not line2:
        raise OrbitSourceError("No valid TLE Line 1 / Line 2 found.")
    idx = lines.index(line1)
    title = lines[idx - 1] if idx > 0 and not lines[idx - 1].startswith("2 ") else ""
    return {"title": title, "tle_line_1": line1, "tle_line_2": line2}


def validate_tle_pair(line1: str, line2: str) -> Dict[str, object]:
    """Basic TLE structural validation. Full propagation validation happens in orbit_engine.py."""
    issues = []
    if not line1.startswith("1 "):
        issues.append("Line 1 must start with '1 '.")
    if not line2.startswith("2 "):
        issues.append("Line 2 must start with '2 '.")
    if len(line1) < 60:
        issues.append("Line 1 appears too short.")
    if len(line2) < 60:
        issues.append("Line 2 appears too short.")
    cat1 = line1[2:7].strip() if len(line1) >= 7 else ""
    cat2 = line2[2:7].strip() if len(line2) >= 7 else ""
    if cat1 and cat2 and cat1 != cat2:
        issues.append("Catalog number mismatch between Line 1 and Line 2.")
    return {"valid": len(issues) == 0, "issues": issues, "catalog_number": cat1 or cat2}


def _http_get(url: str, source: str, query: str, fmt: str) -> OrbitElementRecord:
    req = Request(url, headers={"User-Agent": "GS-LinkOps-AI/0.1 owner-operated platform"})
    try:
        with urlopen(req, timeout=20) as resp:
            status = getattr(resp, "status", 200)
            if status != 200:
                raise OrbitSourceError(f"HTTP {status} returned by {source}")
            raw = resp.read().decode("utf-8", errors="replace")
    except Exception as exc:  # pragma: no cover - network dependent
        raise OrbitSourceError(str(exc)) from exc
    warning = None
    if not raw.strip():
        warning = "Empty response. Check query and source availability."
    return OrbitElementRecord(source=source, query=query, format=fmt, retrieved_at=datetime.now(timezone.utc).isoformat(), raw=raw, warning=warning)
