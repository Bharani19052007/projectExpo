"""
agent/telemetry/disk.py
Disk usage, I/O speed, and optional SMART health telemetry.
"""
from __future__ import annotations

import platform
import time
from dataclasses import dataclass, field
from typing import List, Optional, Dict

import psutil


@dataclass
class DiskInfo:
    device: str
    mount_point: str
    fs_type: str
    total_bytes: int
    used_bytes: int
    free_bytes: int
    usage_percent: float
    read_speed_mb: Optional[float] = None   # MB/s since last sample
    write_speed_mb: Optional[float] = None
    smart_status: Optional[str] = None      # "OK" | "WARNING" | "FAILED" | None
    temperature_celsius: Optional[float] = None


@dataclass
class DiskTelemetry:
    disks: List[DiskInfo] = field(default_factory=list)


# ── I/O speed tracking ────────────────────────────────────────────────────────
_last_io: Optional[dict] = None
_last_io_time: Optional[float] = None


def _compute_io_speeds() -> Dict[str, tuple]:
    """Return {device: (read_mb_s, write_mb_s)} since last call."""
    global _last_io, _last_io_time
    now = time.monotonic()
    try:
        counters = psutil.disk_io_counters(perdisk=True)
    except Exception:
        return {}

    speeds: Dict[str, tuple] = {}
    if _last_io is not None and _last_io_time is not None:
        dt = max(now - _last_io_time, 0.1)
        for dev, curr in counters.items():
            prev = _last_io.get(dev)
            if prev:
                read_mb = (curr.read_bytes - prev.read_bytes) / (1024 ** 2) / dt
                write_mb = (curr.write_bytes - prev.write_bytes) / (1024 ** 2) / dt
                speeds[dev] = (round(max(read_mb, 0), 2), round(max(write_mb, 0), 2))

    _last_io = {dev: c for dev, c in counters.items()}
    _last_io_time = now
    return speeds


def _smart_status_windows() -> Dict[str, str]:
    """Return {device: status} using WMI on Windows."""
    result: Dict[str, str] = {}
    try:
        import wmi  # type: ignore
        w = wmi.WMI()
        for disk in w.Win32_DiskDrive():
            status = disk.Status or "Unknown"
            result[disk.DeviceID] = status
    except Exception:
        pass
    return result


def collect() -> DiskTelemetry:
    disks: List[DiskInfo] = []
    io_speeds = _compute_io_speeds()
    smart_map = _smart_status_windows() if platform.system() == "Windows" else {}

    try:
        partitions = psutil.disk_partitions(all=False)
    except Exception:
        return DiskTelemetry()

    for part in partitions:
        # Skip pseudo-filesystems
        if part.fstype in ("squashfs", "tmpfs", "devtmpfs", "overlay"):
            continue
        try:
            usage = psutil.disk_usage(part.mountpoint)
        except (PermissionError, OSError):
            continue

        # Match I/O counters by device name suffix
        dev_key = part.device.split("\\")[-1].split("/")[-1]
        speed = io_speeds.get(dev_key, (None, None))

        disks.append(
            DiskInfo(
                device=part.device,
                mount_point=part.mountpoint,
                fs_type=part.fstype,
                total_bytes=usage.total,
                used_bytes=usage.used,
                free_bytes=usage.free,
                usage_percent=usage.percent,
                read_speed_mb=speed[0],
                write_speed_mb=speed[1],
                smart_status=smart_map.get(part.device),
            )
        )

    return DiskTelemetry(disks=disks)


def _bytes_to_gb(b: int) -> float:
    return round(b / (1024 ** 3), 2)


def to_dict(t: DiskTelemetry) -> dict:
    return {
        "disks": [
            {
                "device": d.device,
                "mount": d.mount_point,
                "fs_type": d.fs_type,
                "total_gb": _bytes_to_gb(d.total_bytes),
                "used_gb": _bytes_to_gb(d.used_bytes),
                "free_gb": _bytes_to_gb(d.free_bytes),
                "usage": round(d.usage_percent, 1),
                "read_speed_mb": d.read_speed_mb,
                "write_speed_mb": d.write_speed_mb,
                "smart_status": d.smart_status,
                "temperature": d.temperature_celsius,
            }
            for d in t.disks
        ]
    }
