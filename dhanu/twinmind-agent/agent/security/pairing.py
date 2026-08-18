"""
agent/security/pairing.py
Device registration and secure pairing with the TwinMind server on Laptop A.
"""
from __future__ import annotations

import asyncio
import time
from typing import Callable, Optional

from agent.communication.api_client import APIClient
from agent.config import ConfigManager
from agent.logger import get_logger
from agent.telemetry import system as sys_tel

log = get_logger("twinmind.pairing")

_POLL_INTERVAL = 3.0     # seconds between pairing-status polls
_POLL_TIMEOUT  = 300.0   # 5-minute timeout for user to approve on Laptop A


class PairingManager:
    """Handles device registration and approval flow with TwinMind server."""

    def __init__(
        self,
        config_mgr: ConfigManager,
        on_status: Optional[Callable[[str], None]] = None,
        on_paired: Optional[Callable[[str], None]] = None,
    ) -> None:
        self._cfg_mgr  = config_mgr
        self._cfg      = config_mgr.config
        self._on_status = on_status or (lambda m: None)
        self._on_paired = on_paired or (lambda token: None)
        self._api: Optional[APIClient] = None

    def _get_api(self) -> APIClient:
        if self._api is None:
            self._api = APIClient(self._cfg.server_url)
        return self._api

    async def start_pairing(self) -> bool:
        """
        Full pairing flow:
        1. Collect system info
        2. POST /api/devices/register
        3. Poll /api/devices/{id}/pairing until approved or timeout
        Returns True on success.
        """
        cfg = self._cfg

        if not cfg.server_url:
            self._on_status("ERROR: No server URL configured.")
            return False

        self._on_status("Collecting system information…")
        sys_info = sys_tel.to_dict(sys_tel.collect())

        self._on_status(f"Registering device {cfg.device_id} with server…")
        api = self._get_api()
        result = await api.register_device(cfg.device_id, cfg.device_name, sys_info)

        if "error" in result:
            self._on_status(f"Registration failed: {result['error']}")
            log.error("Device registration failed: %s", result["error"])
            return False

        log.info("Device registered. Waiting for Laptop A approval…")
        self._on_status("Registration sent. Waiting for approval on Laptop A…\n"
                        f"Device ID: {cfg.device_id}")

        # Poll for approval
        deadline = time.monotonic() + _POLL_TIMEOUT
        while time.monotonic() < deadline:
            await asyncio.sleep(_POLL_INTERVAL)
            status = await api.check_pairing_status(cfg.device_id)
            pairing_state = status.get("status", "pending")

            if pairing_state == "approved":
                token = status.get("token", status.get("auth_token", ""))
                if token:
                    self._cfg_mgr.set_auth_token(token)
                    log.info("Pairing approved for device %s", cfg.device_id)
                    self._on_status("✓ PAIRED — Device approved by TwinMind server.")
                    self._on_paired(token)
                    return True
                else:
                    # Server approved but sent no token — auto-proceed with empty token
                    self._cfg_mgr.set_paired(True)
                    self._on_paired("")
                    return True

            elif pairing_state == "rejected":
                self._on_status("✗ Pairing rejected by server administrator.")
                log.warning("Pairing rejected for device %s", cfg.device_id)
                return False

            elif pairing_state == "unreachable":
                self._on_status("Server unreachable. Retrying…")

            else:
                remaining = int(deadline - time.monotonic())
                self._on_status(
                    f"Waiting for approval on Laptop A…\n"
                    f"Device ID: {cfg.device_id}\n"
                    f"Timeout in {remaining}s"
                )

        self._on_status("Pairing timed out. Please try again.")
        log.warning("Pairing timed out for device %s", cfg.device_id)
        return False

    async def test_connection(self) -> Optional[float]:
        """Test connectivity to server, return latency ms or None."""
        api = self._get_api()
        latency = await api.ping_server()
        return latency
