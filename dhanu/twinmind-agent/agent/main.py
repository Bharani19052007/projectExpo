"""
agent/main.py
TwinMind AI Monitoring Agent — entry point and telemetry orchestration.

Responsibilities:
  - Build the payload from all telemetry collectors
  - Run the local health + anomaly engine
  - Push telemetry via WebSocket (HTTP fallback)
  - Update the UI dashboard
  - Buffer offline data and replay on reconnect
"""
from __future__ import annotations

import asyncio
import sys
import threading
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

# ── Bootstrap sys.path ────────────────────────────────────────────────────────
import os, pathlib
_ROOT = pathlib.Path(__file__).parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# ── Dependency check ──────────────────────────────────────────────────────────
def _check_deps() -> None:
    missing = []
    for pkg in ("psutil", "httpx", "dotenv"):
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"[ERROR] Missing packages: {', '.join(missing)}")
        print("Run:  pip install -r requirements.txt")
        sys.exit(1)

_check_deps()

# ── Imports ───────────────────────────────────────────────────────────────────
from agent.config import get_config_manager
from agent.logger import get_logger
from agent.local_db import get_buffer
from agent.telemetry import cpu as cpu_tel
from agent.telemetry import memory as mem_tel
from agent.telemetry import gpu as gpu_tel
from agent.telemetry import disk as disk_tel
from agent.telemetry import battery as bat_tel
from agent.telemetry import network as net_tel
from agent.telemetry import system as sys_tel
from agent.health.health_score import compute as compute_health
from agent.health.anomaly_detector import AnomalyDetector, Sample
from agent.communication.websocket_client import WebSocketClient, ConnectionState

log = get_logger("twinmind.main")

# ── CPU warm-up (first call returns 0.0) ──────────────────────────────────────
import psutil as _psutil
_psutil.cpu_percent(interval=None)


# ─────────────────────────────────────────────────────────────────────────────
# AgentController — the core loop running in a background thread
# ─────────────────────────────────────────────────────────────────────────────

class AgentController:
    """Runs the async telemetry loop in a background thread."""

    def __init__(self) -> None:
        self._cfg_mgr   = get_config_manager()
        self._cfg       = self._cfg_mgr.config
        self._interval  = self._cfg.telemetry_interval
        self._detector  = AnomalyDetector()
        self._dashboard = None   # set after UI starts
        self._ws_client: Optional[WebSocketClient] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._running   = False
        self._paused    = False
        self._thread: Optional[threading.Thread] = None
        # Cache slow-changing data
        self._cached_sys: Optional[dict] = None
        self._sys_cache_ts: float = 0.0

    # ── Public API ─────────────────────────────────────────────────────────────

    def set_dashboard(self, dashboard) -> None:
        self._dashboard = dashboard

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        log.info("TwinMind Agent started — device %s", self._cfg.device_id)

    def stop(self) -> None:
        self._running = False
        if self._ws_client:
            self._ws_client.stop()
        log.info("TwinMind Agent stopping…")

    def pause(self) -> None:
        self._paused = True
        if self._ws_client:
            self._ws_client.pause()
        log.info("Monitoring paused by user")

    def resume(self) -> None:
        self._paused = False
        if self._ws_client:
            self._ws_client.resume()
        log.info("Monitoring resumed by user")

    # ── Loop ──────────────────────────────────────────────────────────────────

    def _run_loop(self) -> None:
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        try:
            self._loop.run_until_complete(self._async_main())
        except Exception as e:
            log.error("Agent loop crashed: %s", e)
        finally:
            self._loop.close()

    async def _async_main(self) -> None:
        cfg = self._cfg

        # Build WebSocket client
        self._ws_client = WebSocketClient(
            server_url=cfg.server_url or "http://localhost:8000",
            device_id=cfg.device_id,
            auth_token=cfg.auth_token,
            on_state_change=self._on_conn_state,
        )

        # Run WebSocket and telemetry loop concurrently
        await asyncio.gather(
            self._ws_client.run(),
            self._telemetry_loop(),
        )

    async def _telemetry_loop(self) -> None:
        """Collect → analyze → enqueue every interval seconds."""
        log.info("Telemetry loop started (interval=%.1fs)", self._interval)
        while self._running:
            if not self._paused:
                try:
                    payload = await asyncio.get_event_loop().run_in_executor(
                        None, self._build_payload
                    )
                    self._ws_client.enqueue(payload)
                    self._update_ui(payload)
                except Exception as e:
                    log.error("Telemetry collection error: %s", e)
            await asyncio.sleep(self._interval)

    # ── Payload builder ────────────────────────────────────────────────────────

    def _build_payload(self) -> Dict[str, Any]:
        cfg = self._cfg

        # ── Collect ────────────────────────────────────────────────────────────
        cpu   = cpu_tel.collect()
        mem   = mem_tel.collect()
        gpu   = gpu_tel.collect()
        disk  = disk_tel.collect()
        bat   = bat_tel.collect()
        net   = net_tel.collect(server_url=cfg.server_url)

        # System info — only re-collect every 30s (it's slow due to process scan)
        now = time.monotonic()
        if self._cached_sys is None or (now - self._sys_cache_ts) > 30:
            sys_info = sys_tel.collect()
            self._cached_sys = sys_tel.to_dict(sys_info)
            self._sys_cache_ts = now
        sys_d = self._cached_sys

        # ── Health score ────────────────────────────────────────────────────────
        max_disk = max((d.usage_percent for d in disk.disks), default=0.0)
        health = compute_health(
            cpu_usage=cpu.usage_percent,
            cpu_temp=cpu.temperature_celsius,
            mem_usage=mem.usage_percent,
            gpu_available=gpu.available,
            gpu_usage=gpu.usage_percent,
            gpu_temp=gpu.temperature_celsius,
            max_disk_usage=max_disk,
            bat_available=bat.available,
            bat_percent=bat.percent,
            bat_plugged=bat.plugged_in,
            net_latency=net.server_latency_ms,
            net_connected=net.connected,
            error_count=len(sys_d.get("recent_errors", [])),
        )

        # ── Anomaly detection ───────────────────────────────────────────────────
        sample = Sample(
            timestamp=time.monotonic(),
            cpu_usage=cpu.usage_percent,
            cpu_temp=cpu.temperature_celsius,
            mem_usage=mem.usage_percent,
            max_disk_usage=max_disk,
            latency_ms=net.server_latency_ms,
            bat_percent=bat.percent if bat.available else None,
            bat_plugged=bat.plugged_in,
        )
        self._detector.add_sample(sample)
        anomaly_report = self._detector.analyze()

        # ── Alerts ─────────────────────────────────────────────────────────────
        alerts = self._build_alerts(cpu, mem, gpu, disk, bat, net, sys_d)

        # ── Assemble payload ────────────────────────────────────────────────────
        payload: Dict[str, Any] = {
            "deviceId":  cfg.device_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status":    "online",
            "cpu":       cpu_tel.to_dict(cpu),
            "memory":    mem_tel.to_dict(mem),
            "gpu":       gpu_tel.to_dict(gpu),
            "storage":   disk_tel.to_dict(disk),
            "battery":   bat_tel.to_dict(bat),
            "network":   net_tel.to_dict(net),
            "system":    sys_d,
            "health":    {
                "score":     health.score,
                "label":     health.label,
                "breakdown": health.breakdown,
            },
            "anomalies": [
                {
                    "problem":     a.problem,
                    "risk":        a.risk_level,
                    "confidence":  a.confidence_percent,
                    "recommendation": a.recommendation,
                    "score":       a.anomaly_score,
                }
                for a in anomaly_report.anomalies
            ],
            "alerts": alerts,
        }

        # Store anomaly report for UI update
        payload["_anomaly_report"] = anomaly_report
        return payload

    # ── Alert generation ───────────────────────────────────────────────────────

    @staticmethod
    def _build_alerts(cpu, mem, gpu, disk, bat, net, sys_d=None) -> list:
        from ui.styles import Colors
        alerts = []

        if cpu.usage_percent > 90:
            alerts.append({
                "level": "WARNING",
                "message": f"CPU utilization is {cpu.usage_percent:.0f}%. System is under heavy load.",
                "color": Colors.STATUS_ORANGE,
            })
        if cpu.temperature_celsius and cpu.temperature_celsius > 85:
            alerts.append({
                "level": "WARNING",
                "message": f"CPU temperature is {cpu.temperature_celsius:.0f}°C. Check cooling.",
                "color": Colors.STATUS_RED,
            })
        if mem.usage_percent > 92:
            alerts.append({
                "level": "CRITICAL",
                "message": f"Memory utilization is {mem.usage_percent:.0f}%. System may be unstable.",
                "color": Colors.STATUS_RED,
            })
        elif mem.usage_percent > 85:
            alerts.append({
                "level": "WARNING",
                "message": f"Memory utilization is {mem.usage_percent:.0f}%.",
                "color": Colors.STATUS_ORANGE,
            })
        for d in disk.disks:
            if d.usage_percent > 90:
                alerts.append({
                    "level": "CRITICAL",
                    "message": f"Drive {d.mount_point} is {d.usage_percent:.0f}% full.",
                    "color": Colors.STATUS_RED,
                })
            elif d.usage_percent > 80:
                alerts.append({
                    "level": "WARNING",
                    "message": f"Drive {d.mount_point} is {d.usage_percent:.0f}% full.",
                    "color": Colors.STATUS_ORANGE,
                })
        if bat.available and not bat.plugged_in and bat.percent is not None:
            if bat.percent < 10:
                alerts.append({
                    "level": "CRITICAL",
                    "message": f"Battery critically low: {bat.percent:.0f}%.",
                    "color": Colors.STATUS_RED,
                })
            elif bat.percent < 20:
                alerts.append({
                    "level": "WARNING",
                    "message": f"Battery low: {bat.percent:.0f}%. Please plug in.",
                    "color": Colors.STATUS_ORANGE,
                })
        if net.server_latency_ms is not None and net.server_latency_ms > 500:
            alerts.append({
                "level": "WARNING",
                "message": f"High server latency: {net.server_latency_ms:.0f} ms.",
                "color": Colors.STATUS_ORANGE,
            })

        # Resource warnings from process monitoring
        if sys_d and "resource_warnings" in sys_d:
            for w in sys_d["resource_warnings"][:3]:  # limit to top 3
                alerts.append({
                    "level": "WARNING",
                    "message": w.get("message", "Process resource warning"),
                    "color": Colors.STATUS_ORANGE,
                })

        # System event warnings
        if sys_d and "system_events" in sys_d:
            for ev in sys_d["system_events"][:2]:  # limit
                if ev.get("count", 0) >= 3:
                    alerts.append({
                        "level": "WARNING",
                        "message": f"Repeated system errors from {ev['source']}: {ev['count']} events.",
                        "color": Colors.STATUS_ORANGE,
                    })

        return alerts

    # ── UI update (must be called on Tk main thread) ───────────────────────────

    def _update_ui(self, payload: Dict[str, Any]) -> None:
        if self._dashboard is None:
            return
        anomaly_report = payload.pop("_anomaly_report", None)

        def _do_update():
            try:
                self._dashboard.update_metrics(payload)
                alerts = payload.get("alerts", [])
                if alerts:
                    top = alerts[0]
                    from ui.styles import Colors
                    self._dashboard.update_alert(top["message"], top.get("color", Colors.STATUS_ORANGE))
                else:
                    from ui.styles import Colors
                    self._dashboard.update_alert("No active problems", Colors.STATUS_GREEN)
                if anomaly_report:
                    self._dashboard.update_anomaly(anomaly_report)
            except Exception as e:
                log.debug("UI update error: %s", e)

        try:
            self._dashboard.after(0, _do_update)
        except Exception:
            pass

    # ── Connection state callback ──────────────────────────────────────────────

    def _on_conn_state(self, state: ConnectionState, message: str) -> None:
        log.info("Connection: %s — %s", state.name, message)
        if self._dashboard is None:
            return
        connected = state == ConnectionState.CONNECTED
        try:
            self._dashboard.after(
                0,
                lambda: self._dashboard.update_connection(connected, message)
            )
        except Exception:
            pass


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="TwinMind AI Monitoring Agent")
    parser.add_argument("--check", action="store_true",
                        help="Verify dependencies and exit")
    args = parser.parse_args()

    if args.check:
        print("[OK] All dependencies available")
        print(f"  psutil: {_psutil.__version__}")
        sys.exit(0)

    log.info("=" * 60)
    log.info("TwinMind AI Monitoring Agent v1.0.0 starting")
    log.info("=" * 60)

    cfg_mgr     = get_config_manager()
    controller  = AgentController()

    # Import UI here so it only runs in GUI mode
    from ui.app import TwinMindApp
    app = TwinMindApp(cfg_mgr, controller)
    app.run()

    log.info("TwinMind Agent exited.")


if __name__ == "__main__":
    main()
