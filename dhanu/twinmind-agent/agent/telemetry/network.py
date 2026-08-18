"""
agent/telemetry/network.py
Network bandwidth, latency, and interface telemetry.
"""
from __future__ import annotations

import socket
import subprocess
import time
import platform
from dataclasses import dataclass, field
from typing import Optional, List, Dict

import psutil


@dataclass
class InterfaceInfo:
    name: str
    is_up: bool
    speed_mbps: int      # 0 if unknown
    ipv4: Optional[str]
    ipv6: Optional[str]


@dataclass
class NetworkTelemetry:
    connected: bool
    interfaces: List[InterfaceInfo] = field(default_factory=list)
    bytes_sent_per_sec: Optional[float] = None
    bytes_recv_per_sec: Optional[float] = None
    upload_mbps: Optional[float] = None
    download_mbps: Optional[float] = None
    server_latency_ms: Optional[float] = None
    packets_sent_per_sec: Optional[float] = None
    packets_recv_per_sec: Optional[float] = None


# ── Bandwidth tracking ────────────────────────────────────────────────────────
_last_net: Optional[object] = None
_last_net_time: Optional[float] = None


def _compute_bandwidth() -> tuple:
    """Return (upload_mbps, download_mbps) since last call."""
    global _last_net, _last_net_time
    now = time.monotonic()
    try:
        counters = psutil.net_io_counters()
    except Exception:
        return None, None

    upload = download = None
    if _last_net and _last_net_time:
        dt = max(now - _last_net_time, 0.1)
        upload = max((counters.bytes_sent - _last_net.bytes_sent) / (1024 ** 2) / dt * 8, 0)
        download = max((counters.bytes_recv - _last_net.bytes_recv) / (1024 ** 2) / dt * 8, 0)
        upload = round(upload, 2)
        download = round(download, 2)

    _last_net = counters
    _last_net_time = now
    return upload, download


def _measure_latency(host: str, port: int = 80, timeout: float = 3.0) -> Optional[float]:
    """TCP connect latency in ms."""
    try:
        start = time.perf_counter()
        with socket.create_connection((host, port), timeout=timeout):
            pass
        return round((time.perf_counter() - start) * 1000, 1)
    except Exception:
        return None


def _extract_ip(addrs) -> tuple:
    ipv4 = ipv6 = None
    for addr in addrs:
        if addr.family == socket.AF_INET:
            ipv4 = addr.address
        elif addr.family == socket.AF_INET6:
            ipv6 = addr.address.split("%")[0]
    return ipv4, ipv6


def collect(server_url: str = "") -> NetworkTelemetry:
    """Collect network telemetry. server_url used for latency check."""
    upload, download = _compute_bandwidth()

    # Interfaces
    interfaces: List[InterfaceInfo] = []
    try:
        stats = psutil.net_if_stats()
        addrs = psutil.net_if_addrs()
        for name, stat in stats.items():
            if name.startswith("lo") or name.startswith("Loopback"):
                continue
            ipv4, ipv6 = _extract_ip(addrs.get(name, []))
            interfaces.append(
                InterfaceInfo(
                    name=name,
                    is_up=stat.isup,
                    speed_mbps=stat.speed or 0,
                    ipv4=ipv4,
                    ipv6=ipv6,
                )
            )
    except Exception:
        pass

    connected = any(i.is_up for i in interfaces)

    # Latency to server
    latency = None
    if server_url:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(server_url)
            host = parsed.hostname or server_url.split("//")[-1].split(":")[0]
            port = parsed.port or (443 if parsed.scheme == "https" else 80)
            latency = _measure_latency(host, port)
        except Exception:
            pass

    return NetworkTelemetry(
        connected=connected,
        interfaces=interfaces,
        upload_mbps=upload,
        download_mbps=download,
        server_latency_ms=latency,
    )


def to_dict(t: NetworkTelemetry) -> dict:
    return {
        "connected": t.connected,
        "upload_mbps": t.upload_mbps,
        "download_mbps": t.download_mbps,
        "latency_ms": t.server_latency_ms,
        "interfaces": [
            {
                "name": i.name,
                "is_up": i.is_up,
                "speed_mbps": i.speed_mbps,
                "ipv4": i.ipv4,
            }
            for i in t.interfaces
        ],
    }
