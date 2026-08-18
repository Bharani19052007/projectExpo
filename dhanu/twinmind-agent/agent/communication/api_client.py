"""
agent/communication/api_client.py
HTTPS REST client for device registration, pairing, and telemetry fallback.
"""
from __future__ import annotations

import json
from typing import Any, Dict, Optional
from urllib.parse import urljoin

import httpx

from agent.logger import get_logger

log = get_logger("twinmind.api")


class APIClient:
    """Async HTTPS client for TwinMind server interactions."""

    def __init__(self, base_url: str, auth_token: str = "", timeout: float = 10.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._auth_token = auth_token
        self._timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    def _make_client(self) -> httpx.AsyncClient:
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if self._auth_token:
            headers["Authorization"] = f"Bearer [REDACTED_IN_LOG]"
        return httpx.AsyncClient(
            headers={
                "Content-Type": "application/json",
                **({"Authorization": f"Bearer {self._auth_token}"} if self._auth_token else {}),
            },
            timeout=self._timeout,
            verify=False,  # allow self-signed certs in LAN environment
        )

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = self._make_client()
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ── Device registration ───────────────────────────────────────────────────
    async def register_device(
        self,
        device_id: str,
        device_name: str,
        system_info: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Send device registration request to Laptop A."""
        url = f"{self._base_url}/api/devices/register"
        payload = {
            "deviceId": device_id,
            "deviceName": device_name,
            "systemInfo": system_info,
            "agentVersion": system_info.get("agent_version", "1.0.0"),
        }
        log.info("Registering device %s with server %s", device_id, self._base_url)
        client = await self._get_client()
        try:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()
        except httpx.ConnectError:
            log.warning("Cannot reach server at %s", self._base_url)
            return {"error": "connection_failed"}
        except httpx.HTTPStatusError as e:
            log.error("Registration HTTP error: %s", e.response.status_code)
            return {"error": f"http_{e.response.status_code}"}
        except Exception as e:
            log.error("Registration error: %s", type(e).__name__)
            return {"error": str(type(e).__name__)}

    # ── Pairing status ────────────────────────────────────────────────────────
    async def check_pairing_status(self, device_id: str) -> Dict[str, Any]:
        """Poll Laptop A for pairing approval."""
        url = f"{self._base_url}/api/devices/{device_id}/pairing"
        client = await self._get_client()
        try:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                return resp.json()
            return {"status": "pending"}
        except Exception:
            return {"status": "unreachable"}

    # ── Telemetry POST (fallback) ─────────────────────────────────────────────
    async def post_telemetry(self, payload: Dict[str, Any]) -> bool:
        """POST telemetry when WebSocket is unavailable. Returns True on success."""
        url = f"{self._base_url}/api/telemetry"
        client = await self._get_client()
        try:
            resp = await client.post(url, json=payload, timeout=5.0)
            return resp.status_code in (200, 201, 202, 204)
        except Exception as e:
            log.debug("HTTP telemetry fallback failed: %s", type(e).__name__)
            return False

    # ── Heartbeat / health check ──────────────────────────────────────────────
    async def ping_server(self) -> Optional[float]:
        """Return round-trip time ms to server, or None if unreachable."""
        import time
        url = f"{self._base_url}/health"
        client = await self._get_client()
        try:
            t0 = time.perf_counter()
            resp = await client.get(url, timeout=3.0)
            return round((time.perf_counter() - t0) * 1000, 1)
        except Exception:
            return None

    def update_token(self, token: str) -> None:
        self._auth_token = token
        if self._client and not self._client.is_closed:
            import asyncio
            asyncio.create_task(self._client.aclose())
            self._client = None
