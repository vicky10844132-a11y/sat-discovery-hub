"""SkyFi Platform API 2.0.0 adapter for SPACE AGI OS GeoSource Hub.

This module intentionally uses the Python standard library only. It keeps SkyFi's
provider-specific request/response schema behind one adapter boundary so product
UIs and AGI workflows do not depend directly on SkyFi fields.

Authentication is read from SKYFI_API_KEY. Never commit keys to source control.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Optional


DEFAULT_BASE_URL = "https://app.skyfi.com/platform-api"


class SkyFiError(RuntimeError):
    pass


@dataclass(frozen=True)
class SkyFiConfig:
    api_key: str
    base_url: str = DEFAULT_BASE_URL
    timeout_seconds: int = 30

    @classmethod
    def from_env(cls) -> "SkyFiConfig":
        api_key = os.getenv("SKYFI_API_KEY", "").strip()
        if not api_key:
            raise SkyFiError("SKYFI_API_KEY is not configured")
        return cls(
            api_key=api_key,
            base_url=os.getenv("SKYFI_BASE_URL", DEFAULT_BASE_URL).rstrip("/"),
            timeout_seconds=int(os.getenv("SKYFI_TIMEOUT_SECONDS", "30")),
        )


class SkyFiAdapter:
    source_id = "skyfi_platform_api_v2"
    display_name = "SkyFi Platform API"
    category = "Earth Observation / commercial aggregator / tasking"
    adapter_version = "0.1.0"

    def __init__(self, config: Optional[SkyFiConfig] = None) -> None:
        self.config = config or SkyFiConfig.from_env()

    def _request(
        self,
        method: str,
        path: str,
        *,
        payload: Optional[Dict[str, Any]] = None,
        query: Optional[Dict[str, Any]] = None,
    ) -> Any:
        url = f"{self.config.base_url}/{path.lstrip('/')}"
        if query:
            url = f"{url}?{urllib.parse.urlencode(query, doseq=True)}"
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {
            "Accept": "application/json",
            "X-Skyfi-Api-Key": self.config.api_key,
        }
        if data is not None:
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url=url, data=data, headers=headers, method=method.upper())
        try:
            with urllib.request.urlopen(req, timeout=self.config.timeout_seconds) as resp:
                raw = resp.read()
                return json.loads(raw.decode("utf-8")) if raw else None
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise SkyFiError(f"SkyFi HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise SkyFiError(f"SkyFi connection failed: {exc.reason}") from exc

    # ---- health/auth -------------------------------------------------
    def ping(self) -> Any:
        return self._request("GET", "/ping")

    def health(self) -> Any:
        return self._request("GET", "/health_check")

    def whoami(self) -> Any:
        return self._request("GET", "/auth/whoami")

    # ---- canonical EO search ----------------------------------------
    def search_archives(
        self,
        *,
        aoi_wkt: str,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        product_types: Optional[Iterable[str]] = None,
        resolution: Optional[str] = None,
        open_data: Optional[bool] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Any:
        payload: Dict[str, Any] = {"aoi": aoi_wkt}
        if from_date:
            payload["fromDate"] = from_date
        if to_date:
            payload["toDate"] = to_date
        if product_types:
            payload["productTypes"] = list(product_types)
        if resolution:
            payload["resolution"] = resolution
        if open_data is not None:
            payload["openData"] = open_data
        if extra:
            payload.update(extra)
        return self._request("POST", "/archives", payload=payload)

    def get_archive(self, archive_id: str) -> Any:
        return self._request("GET", f"/archives/{urllib.parse.quote(archive_id, safe='')}")

    # ---- pricing / tasking feasibility ------------------------------
    def pricing(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/pricing", payload=request_body)

    def feasibility(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/feasibility", payload=request_body)

    def feasibility_status(self, feasibility_id: str) -> Any:
        return self._request("GET", f"/feasibility/{urllib.parse.quote(feasibility_id, safe='')}")

    def pass_prediction(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/feasibility/pass-prediction", payload=request_body)

    def providers(self) -> Any:
        return self._request("GET", "/providers")

    def tasking_products(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/tasking/products", payload=request_body)

    # ---- order validation / creation --------------------------------
    def validate_archive_order(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/order-archive/validate", payload=request_body)

    def validate_tasking_order(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/order-tasking/validate", payload=request_body)

    def create_archive_order(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/order-archive", payload=request_body)

    def create_tasking_order(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/order-tasking", payload=request_body)

    def list_orders(self, query: Optional[Dict[str, Any]] = None) -> Any:
        return self._request("GET", "/orders", query=query)

    def get_order(self, order_id: str) -> Any:
        return self._request("GET", f"/orders/{urllib.parse.quote(order_id, safe='')}")

    def redeliver_order(self, order_id: str, request_body: Dict[str, Any]) -> Any:
        return self._request(
            "POST",
            f"/orders/{urllib.parse.quote(order_id, safe='')}/redelivery",
            payload=request_body,
        )

    # ---- notifications / saved AOIs / tiles -------------------------
    def create_notification(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/notifications", payload=request_body)

    def list_notifications(self) -> Any:
        return self._request("GET", "/notifications")

    def list_saved_aois(self) -> Any:
        return self._request("GET", "/saved-aois")

    def create_saved_aoi(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/saved-aois", payload=request_body)

    def create_tile_token(self, request_body: Dict[str, Any]) -> Any:
        return self._request("POST", "/tiles/token", payload=request_body)


CAPABILITIES = {
    "archive_search": True,
    "archive_order": True,
    "tasking_order": True,
    "order_validation": True,
    "pricing": True,
    "feasibility": True,
    "pass_prediction": True,
    "notifications": True,
    "saved_aois": True,
    "tile_tokens": True,
    "cloud_delivery": ["S3", "GS", "AZURE"],
}
