"""
agent/telemetry/memory.py
RAM and swap/page-file telemetry using psutil.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import psutil


@dataclass
class MemoryTelemetry:
    total_bytes: int
    available_bytes: int
    used_bytes: int
    usage_percent: float
    # Swap / page file
    swap_total_bytes: int
    swap_used_bytes: int
    swap_usage_percent: float


def collect() -> MemoryTelemetry:
    vm = psutil.virtual_memory()
    sw = psutil.swap_memory()
    return MemoryTelemetry(
        total_bytes=vm.total,
        available_bytes=vm.available,
        used_bytes=vm.used,
        usage_percent=vm.percent,
        swap_total_bytes=sw.total,
        swap_used_bytes=sw.used,
        swap_usage_percent=sw.percent,
    )


def _bytes_to_gb(b: int) -> float:
    return round(b / (1024 ** 3), 2)


def to_dict(t: MemoryTelemetry) -> dict:
    return {
        "total_gb": _bytes_to_gb(t.total_bytes),
        "available_gb": _bytes_to_gb(t.available_bytes),
        "used_gb": _bytes_to_gb(t.used_bytes),
        "usage": round(t.usage_percent, 1),
        "swap_total_gb": _bytes_to_gb(t.swap_total_bytes),
        "swap_used_gb": _bytes_to_gb(t.swap_used_bytes),
        "swap_usage": round(t.swap_usage_percent, 1),
    }
