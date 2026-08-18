"""
agent/telemetry/system.py
OS, uptime, top processes, and system-health event telemetry.
Does NOT collect: passwords, keystrokes, file contents, browser data.
"""
from __future__ import annotations

import platform
import socket
import subprocess
import time
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict

import psutil

from agent import __version__


@dataclass
class ProcessInfo:
    pid: int
    name: str
    cpu_percent: float
    memory_mb: float
    status: str


@dataclass
class ResourceWarning:
    process_name: str
    pid: int
    cpu_percent: float
    memory_mb: float
    message: str


@dataclass
class SystemEvent:
    source: str
    count: int
    severity: str  # "Error" | "Warning"


@dataclass
class SystemTelemetry:
    hostname: str
    os_name: str
    os_version: str
    architecture: str
    boot_time_utc: str
    uptime_seconds: int
    agent_version: str
    top_processes: List[ProcessInfo] = field(default_factory=list)
    resource_warnings: List[ResourceWarning] = field(default_factory=list)
    recent_errors: List[str] = field(default_factory=list)   # safe event summaries only
    system_events: List[SystemEvent] = field(default_factory=list)


# ── Process snapshot ──────────────────────────────────────────────────────────
_EXCLUDED_PROCESS_NAMES = frozenset({
    "System Idle Process", "System", "Idle", "Registry",
    "smss.exe", "csrss.exe", "wininit.exe", "winlogon.exe",
})

# Track sustained high-CPU processes
_high_cpu_tracker: Dict[int, List[float]] = defaultdict(list)
_HIGH_CPU_THRESHOLD = 80.0
_HIGH_CPU_SUSTAINED_SAMPLES = 5  # ~10 seconds at 2s interval


def _top_processes(n: int = 10) -> tuple:
    """Return (top_processes, resource_warnings)."""
    global _high_cpu_tracker
    procs: List[ProcessInfo] = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_info", "status"]):
        try:
            info = proc.info
            name = info.get("name") or "?"
            if name in _EXCLUDED_PROCESS_NAMES:
                continue
            mem = info.get("memory_info")
            cpu_pct = round(info.get("cpu_percent") or 0.0, 1)
            mem_mb = round(mem.rss / (1024 ** 2), 1) if mem else 0.0
            procs.append(
                ProcessInfo(
                    pid=info["pid"],
                    name=name,
                    cpu_percent=cpu_pct,
                    memory_mb=mem_mb,
                    status=info.get("status") or "?",
                )
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # Sort by CPU desc, then RAM desc
    procs.sort(key=lambda p: (p.cpu_percent, p.memory_mb), reverse=True)

    # Track sustained high-CPU processes
    warnings: List[ResourceWarning] = []
    current_pids = set()
    for p in procs[:20]:  # check top 20
        current_pids.add(p.pid)
        if p.cpu_percent > _HIGH_CPU_THRESHOLD:
            _high_cpu_tracker[p.pid].append(p.cpu_percent)
            # Keep only recent samples
            _high_cpu_tracker[p.pid] = _high_cpu_tracker[p.pid][-_HIGH_CPU_SUSTAINED_SAMPLES:]
            if len(_high_cpu_tracker[p.pid]) >= _HIGH_CPU_SUSTAINED_SAMPLES:
                avg = sum(_high_cpu_tracker[p.pid]) / len(_high_cpu_tracker[p.pid])
                if avg > _HIGH_CPU_THRESHOLD:
                    warnings.append(ResourceWarning(
                        process_name=p.name,
                        pid=p.pid,
                        cpu_percent=p.cpu_percent,
                        memory_mb=p.memory_mb,
                        message=f"{p.name} is consuming unusually high resources "
                                f"(CPU: {p.cpu_percent}%, Memory: {p.memory_mb:.1f} MB).",
                    ))
        elif p.memory_mb > 2048:  # > 2 GB RAM
            warnings.append(ResourceWarning(
                process_name=p.name,
                pid=p.pid,
                cpu_percent=p.cpu_percent,
                memory_mb=p.memory_mb,
                message=f"{p.name} is using {p.memory_mb:.0f} MB of memory.",
            ))

    # Clean up stale PIDs from tracker
    stale = [pid for pid in _high_cpu_tracker if pid not in current_pids]
    for pid in stale:
        del _high_cpu_tracker[pid]

    return procs[:n], warnings


def _recent_system_errors() -> tuple:
    """Return (brief_summaries, structured_events) for system-health events.
    Tries WMI first, then falls back to wevtutil on Windows."""
    errors: List[str] = []
    events: List[SystemEvent] = []

    if platform.system() != "Windows":
        return errors, events

    # Try WMI first
    try:
        import wmi  # type: ignore
        w = wmi.WMI()
        wmi_events = w.Win32_NTLogEvent(
            EventType=[1, 2],  # 1=Error, 2=Warning
            Logfile="System",
        )
        seen: dict = {}
        for evt in wmi_events[:50]:
            key = evt.SourceName
            seen[key] = seen.get(key, 0) + 1
        for source, count in sorted(seen.items(), key=lambda x: -x[1])[:5]:
            errors.append(f"{source}: {count} event(s)")
            events.append(SystemEvent(source=source, count=count, severity="Error"))
        return errors, events
    except Exception:
        pass

    # Fallback: wevtutil (available on all Windows without extra packages)
    try:
        # Query last 50 System errors from the last hour
        result = subprocess.run(
            [
                "wevtutil", "qe", "System",
                "/q:*[System[Level<=2 and TimeCreated[timediff(@SystemTime) <= 3600000]]]",
                "/c:50", "/f:text",
            ],
            capture_output=True,
            text=True,
            timeout=10,
            creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0,
        )
        if result.returncode == 0 and result.stdout.strip():
            # Parse wevtutil text output to count events by source
            seen = {}
            current_source = None
            for line in result.stdout.splitlines():
                line = line.strip()
                if line.startswith("Source:"):
                    current_source = line.split(":", 1)[1].strip()
                    if current_source:
                        seen[current_source] = seen.get(current_source, 0) + 1

            for source, count in sorted(seen.items(), key=lambda x: -x[1])[:5]:
                errors.append(f"{source}: {count} event(s)")
                events.append(SystemEvent(source=source, count=count, severity="Error"))
    except Exception:
        pass

    return errors, events


def collect() -> SystemTelemetry:
    boot_ts = psutil.boot_time()
    boot_utc = datetime.fromtimestamp(boot_ts, tz=timezone.utc).isoformat()
    uptime = int(time.time() - boot_ts)

    uname = platform.uname()
    top_procs, resource_warnings = _top_processes()
    error_summaries, system_events = _recent_system_errors()

    return SystemTelemetry(
        hostname=socket.gethostname(),
        os_name=f"{uname.system} {uname.release}",
        os_version=uname.version,
        architecture=uname.machine,
        boot_time_utc=boot_utc,
        uptime_seconds=uptime,
        agent_version=__version__,
        top_processes=top_procs,
        resource_warnings=resource_warnings,
        recent_errors=error_summaries,
        system_events=system_events,
    )


def _uptime_str(secs: int) -> str:
    days, rem = divmod(secs, 86400)
    hours, rem = divmod(rem, 3600)
    mins = rem // 60
    parts = []
    if days:
        parts.append(f"{days}d")
    if hours:
        parts.append(f"{hours}h")
    parts.append(f"{mins}m")
    return " ".join(parts)


def to_dict(t: SystemTelemetry) -> dict:
    result = {
        "hostname": t.hostname,
        "os": t.os_name,
        "os_version": t.os_version,
        "architecture": t.architecture,
        "boot_time": t.boot_time_utc,
        "uptime": _uptime_str(t.uptime_seconds),
        "uptime_seconds": t.uptime_seconds,
        "agent_version": t.agent_version,
        "top_processes": [
            {
                "pid": p.pid,
                "name": p.name,
                "cpu": p.cpu_percent,
                "memory_mb": p.memory_mb,
                "status": p.status,
            }
            for p in t.top_processes
        ],
        "recent_errors": t.recent_errors,
    }

    if t.resource_warnings:
        result["resource_warnings"] = [
            {
                "process": w.process_name,
                "pid": w.pid,
                "cpu": w.cpu_percent,
                "memory_mb": w.memory_mb,
                "message": w.message,
            }
            for w in t.resource_warnings
        ]

    if t.system_events:
        result["system_events"] = [
            {
                "source": e.source,
                "count": e.count,
                "severity": e.severity,
            }
            for e in t.system_events
        ]

    return result
