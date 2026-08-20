"""Vercel entrypoint for the Space Ops Platform API."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI

PROJECT_ROOT = Path(__file__).resolve().parents[1] / "space-ops-platform"
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from apps.api.main import app as space_ops_app  # noqa: E402

app = FastAPI(title="Sat Discovery Hub API", version="1.0.0")
app.mount("/api", space_ops_app)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "service": "sat-discovery-hub-api"}
