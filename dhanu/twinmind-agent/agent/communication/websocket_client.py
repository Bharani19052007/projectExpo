"""
agent/communication/websocket_client.py
Async WebSocket client with:
  - Automatic reconnection with exponential backoff (max 60s)
  - Heartbeat/ping every 30s
  - Offline buffer drain after reconnect
  - Connection state callbacks for UI updates
"""
from __future__ import annotations

import asyncio
import json
import time
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional

try:
    import websockets  # type: ignore
    from websockets.exceptions import (
        ConnectionClosed,
        InvalidURI,
        WebSocketException,
    )
    _HAS_WS = True
except ImportError:
    # Provide placeholder exception classes for type checking when websockets is unavailable
    class ConnectionClosed(Exception):
        pass
    class InvalidURI(Exception):
        pass
    class WebSocketException(Exception):
        pass
    websockets = None
    _HAS_WS = False

from agent.local_db import get_buffer
from agent.logger import get_logger

log = get_logger("twinmind.ws")

# ── Constants ─────────────────────────────────────────────────────────────────
_HEARTBEAT_INTERVAL = 30.0   # seconds
_CONNECT_TIMEOUT    = 10.0   # seconds
_MAX_BACKOFF        = 60.0   # seconds
_INITIAL_BACKOFF    = 2.0    # seconds


class ConnectionState(Enum):
    DISCONNECTED = auto()
    CONNECTING   = auto()
    CONNECTED    = auto()
    PAUSED       = auto()


# ── Client ────────────────────────────────────────────────────────────────────

class WebSocketClient:
    """Resilient WebSocket client that sends telemetry to the TwinMind server."""

    def __init__(
        self,
        server_url: str,
        device_id: str,
        auth_token: str,
        on_state_change: Optional[Callable[[ConnectionState, str], None]] = None,
    ) -> None:
        self._ws_url     = self._build_ws_url(server_url, device_id)
        self._http_url   = server_url
        self._device_id  = device_id
        self._auth_token = auth_token
        self._state      = ConnectionState.DISCONNECTED
        self._on_state   = on_state_change or (lambda s, m: None)
        self._ws         = None
        self._running    = False
        self._paused     = False
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=200)
        self._backoff    = _INITIAL_BACKOFF
        self._buffer     = get_buffer()

    @staticmethod
    def _build_ws_url(server_url: str, device_id: str) -> str:
        url = server_url.rstrip("/")
        if url.startswith("https://"):
            url = "wss://" + url[8:]
        elif url.startswith("http://"):
            url = "ws://" + url[7:]
        return f"{url}/ws/telemetry/{device_id}"

    # ── Public API ─────────────────────────────────────────────────────────────
    async def run(self) -> None:
        """Main run loop — reconnects indefinitely until stopped."""
        if not _HAS_WS:
            log.warning("websockets library not available — using HTTP fallback only")
            await self._http_fallback_loop()
            return

        self._running = True
        while self._running:
            if self._paused:
                await asyncio.sleep(1)
                continue
            await self._connect_and_run()
            if self._running and not self._paused:
                log.info("Reconnecting in %.1f s …", self._backoff)
                await asyncio.sleep(self._backoff)
                self._backoff = min(self._backoff * 2, _MAX_BACKOFF)

    def enqueue(self, payload: Dict[str, Any]) -> None:
        """Add a telemetry payload to the send queue (non-blocking)."""
        try:
            self._queue.put_nowait(payload)
        except asyncio.QueueFull:
            # Drop oldest, add new
            try:
                self._queue.get_nowait()
                self._queue.put_nowait(payload)
            except Exception:
                pass
            # Also buffer to SQLite when queue is full
            self._buffer.store(payload)

    def pause(self) -> None:
        self._paused = True
        self._set_state(ConnectionState.PAUSED, "Monitoring paused by user")

    def resume(self) -> None:
        self._paused = False

    def stop(self) -> None:
        self._running = False

    @property
    def state(self) -> ConnectionState:
        return self._state

    def update_token(self, token: str) -> None:
        self._auth_token = token

    # ── Connection lifecycle ───────────────────────────────────────────────────
    async def _connect_and_run(self) -> None:
        self._set_state(ConnectionState.CONNECTING, f"Connecting to {self._ws_url}")
        headers = {"Authorization": f"Bearer {self._auth_token}"} if self._auth_token else {}
        try:
            async with websockets.connect(
                self._ws_url,
                additional_headers=headers,
                open_timeout=_CONNECT_TIMEOUT,
                ping_interval=_HEARTBEAT_INTERVAL,
                ping_timeout=10,
                ssl=None,
            ) as ws:
                self._ws = ws
                self._backoff = _INITIAL_BACKOFF  # reset on success
                self._set_state(ConnectionState.CONNECTED, "Connected to TwinMind server")
                log.info("WebSocket connected: %s", self._ws_url)

                # Drain offline buffer first
                await self._drain_buffer(ws)

                # Send loop
                await self._send_loop(ws)

        except InvalidURI:
            log.error("Invalid WebSocket URL: %s", self._ws_url)
            self._set_state(ConnectionState.DISCONNECTED, "Invalid server URL")
        except (ConnectionClosed, OSError, asyncio.TimeoutError) as e:
            log.warning("WebSocket disconnected: %s", type(e).__name__)
            self._set_state(ConnectionState.DISCONNECTED, "Connection lost — reconnecting…")
        except Exception as e:
            log.error("WebSocket error: %s — %s", type(e).__name__, str(e)[:80])
            self._set_state(ConnectionState.DISCONNECTED, f"Error: {type(e).__name__}")
        finally:
            self._ws = None

    async def _send_loop(self, ws) -> None:
        """Consume queue and send payloads."""
        while self._running and not self._paused:
            try:
                payload = await asyncio.wait_for(self._queue.get(), timeout=1.0)
                msg = json.dumps(payload, default=str)
                await ws.send(msg)
                self._queue.task_done()
            except asyncio.TimeoutError:
                continue
            except ConnectionClosed:
                # Requeue the payload for the buffer
                try:
                    self._buffer.store(payload)
                except Exception:
                    pass
                raise
            except Exception as e:
                log.debug("Send error: %s", type(e).__name__)
                raise

    async def _drain_buffer(self, ws) -> None:
        """Replay buffered offline payloads after reconnect."""
        buffered = self._buffer.fetch_all()
        if not buffered:
            return
        log.info("Replaying %d buffered telemetry payloads…", len(buffered))
        delivered_ids: List[int] = []
        for row in buffered:
            buf_id = row.pop("_buffer_id", None)
            try:
                await ws.send(json.dumps(row, default=str))
                if buf_id is not None:
                    delivered_ids.append(buf_id)
            except Exception:
                break
        if delivered_ids:
            self._buffer.delete(delivered_ids)
            log.info("Cleared %d delivered payloads from buffer", len(delivered_ids))

    # ── HTTP fallback loop ─────────────────────────────────────────────────────
    async def _http_fallback_loop(self) -> None:
        """Send telemetry via HTTPS POST when WebSocket is unavailable."""
        from agent.communication.api_client import APIClient
        client = APIClient(self._http_url, self._auth_token)
        self._set_state(ConnectionState.CONNECTED, "HTTP fallback mode")
        while self._running:
            try:
                payload = await asyncio.wait_for(self._queue.get(), timeout=1.0)
                success = await client.post_telemetry(payload)
                if not success:
                    self._buffer.store(payload)
                self._queue.task_done()
            except asyncio.TimeoutError:
                continue

    # ── Helpers ────────────────────────────────────────────────────────────────
    def _set_state(self, state: ConnectionState, message: str) -> None:
        if state != self._state:
            self._state = state
            try:
                self._on_state(state, message)
            except Exception:
                pass
