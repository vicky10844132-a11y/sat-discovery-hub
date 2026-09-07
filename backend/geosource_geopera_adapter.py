"""Geopera adapter for SPACE AGI OS GeoSource Hub.

Provider API model:
- Base URL: https://api.geopera.com
- Canonical operation endpoint: POST /v1/op/{operation_id}
- Auth: Authorization: Bearer <GEOPERA_TOKEN>

This adapter deliberately keeps Geopera-specific operation ids behind a provider
boundary. AGI/core business logic should call normalized GeoSource capabilities.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass
from typing import Any, Dict, Optional


DEFAULT_BASE_URL = "https://api.geopera.com"

# Spend-tier operations require explicit opt-in and an idempotency key.
SPEND_OPERATIONS = {
    "orders.archive.place",
    "orders.cancel",
    "orders.place",
    "orders.tasking.feasibility_decide",
    "orders.tasking.place",
    "orders.tasking.quotation_decide",
    "processing.create",
    "processing.create_and_dispatch",
    "processing.dispatch",
    "processing.execute",
    "processing.job.register",
    "clip.create_from_area",
    "clip.create_from_item",
}


class GeoperaError(RuntimeError):
    pass


@dataclass
class GeoperaClient:
    token: Optional[str] = None
    base_url: str = DEFAULT_BASE_URL
    timeout_seconds: int = 60

    def __post_init__(self) -> None:
        self.token = self.token or os.getenv("GEOPERA_TOKEN")
        self.base_url = (self.base_url or DEFAULT_BASE_URL).rstrip("/")

    @property
    def configured(self) -> bool:
        return bool(self.token)

    def invoke(
        self,
        operation_id: str,
        payload: Optional[Dict[str, Any]] = None,
        *,
        allow_spend: bool = False,
        idempotency_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Invoke a Geopera operation by stable dotted operation id."""
        if not self.token:
            raise GeoperaError("GEOPERA_TOKEN is not configured")

        if operation_id in SPEND_OPERATIONS and not allow_spend:
            raise GeoperaError(
                f"Spend operation blocked by policy gate: {operation_id}. "
                "Pass allow_spend=True only after explicit business authorization."
            )

        body = json.dumps(payload or {}).encode("utf-8")
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "GLORY-STELLAR-SPACE-AGI/0.1",
        }
        if operation_id in SPEND_OPERATIONS:
            headers["Idempotency-Key"] = idempotency_key or str(uuid.uuid4())

        req = urllib.request.Request(
            f"{self.base_url}/v1/op/{operation_id}",
            data=body,
            headers=headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise GeoperaError(f"Geopera HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise GeoperaError(f"Geopera connection failed: {exc}") from exc

    # ---- Read/search canonical wrappers ----

    def federated_search(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("catalog.federated_search", payload)

    def catalog_search(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("catalog.search", payload)

    def list_sources(self, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self.invoke("catalog.sources.list", payload or {})

    def list_vendors(self, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self.invoke("catalog.vendors.list", payload or {})

    def stac_search(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("stac.search", payload)

    # ---- Orders/tasking ----

    def archive_estimate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("orders.archive.estimate", payload)

    def tasking_estimate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("orders.tasking.estimate", payload)

    def feasibility_check(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("orders.tasking.feasibility_check", payload)

    def opportunities(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("orders.tasking.opportunities_list", payload)

    def tasking_sensors(self, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self.invoke("orders.tasking.sensors", payload or {})

    def order_get(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("orders.get", payload)

    def order_assets(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("orders.list_assets", payload)

    # ---- Delivered items / visualization ----

    def item_stac(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("items.get_stac", payload)

    def item_assets(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("items.list_assets", payload)

    def visualization_list(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("visualization.list_for", payload)

    def analytics_execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("analytics.execute", payload)

    def report_generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.invoke("reports.generate", payload)

    # ---- Explicit spend wrappers ----

    def place_archive_order(self, payload: Dict[str, Any], *, authorized: bool) -> Dict[str, Any]:
        return self.invoke("orders.archive.place", payload, allow_spend=authorized)

    def place_tasking_order(self, payload: Dict[str, Any], *, authorized: bool) -> Dict[str, Any]:
        return self.invoke("orders.tasking.place", payload, allow_spend=authorized)

    def cancel_order(self, payload: Dict[str, Any], *, authorized: bool) -> Dict[str, Any]:
        return self.invoke("orders.cancel", payload, allow_spend=authorized)


def capability_manifest() -> Dict[str, Any]:
    """Normalized capability metadata for GeoSource Hub registration."""
    return {
        "source_id": "geopera",
        "display_name": "Geopera",
        "category": "Earth Observation / STAC / imagery catalogs",
        "provider": "Geopera",
        "base_url": DEFAULT_BASE_URL,
        "protocol": "REST operations + STAC",
        "auth_type": "Bearer API key",
        "credential_env": "GEOPERA_TOKEN",
        "core_capabilities": [
            "federated_catalog_search",
            "commercial_catalog_search",
            "stac_search",
            "archive_price_estimate",
            "tasking_price_estimate",
            "tasking_feasibility",
            "predicted_tasking_opportunities",
            "archive_order",
            "tasking_order",
            "order_tracking",
            "delivered_asset_access",
            "cog_tiles_and_terrain",
            "processing",
            "analytics",
            "reports",
            "provenance",
            "alerts_and_notifications",
        ],
        "side_effect_policy": "read by default; spend/destructive operations gated",
        "dependency_class": "external replaceable adapter",
        "status": "IMPLEMENTED_NOT_VERIFIED",
    }
