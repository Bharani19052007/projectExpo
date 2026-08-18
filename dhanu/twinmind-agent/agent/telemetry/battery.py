"""
agent/telemetry/battery.py
Battery telemetry via psutil. Gracefully returns None if no battery present.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import psutil


@dataclass
class BatteryTelemetry:
    available: bool
    percent: Optional[float] = None
    charging: Optional[bool] = None
    plugged_in: Optional[bool] = None
    seconds_left: Optional[int] = None      # None = AC power / unknown
    time_left_str: Optional[str] = None     # Human-readable
    health_percent: Optional[float] = None  # Unavailable on most platforms
    cycle_count: Optional[int] = None       # Unavailable on most platforms


def _seconds_to_hm(secs: int) -> str:
    if secs == psutil.POWER_TIME_UNLIMITED:
        return "Charging (AC)"
    if secs == psutil.POWER_TIME_UNKNOWN or secs < 0:
        return "Unknown"
    h, m = divmod(secs // 60, 60)
    return f"{h}h {m}m"


def collect() -> BatteryTelemetry:
    bat = psutil.sensors_battery()
    if bat is None:
        return BatteryTelemetry(available=False)

    plugged = bat.power_plugged
    charging = plugged and bat.percent < 100.0

    secs = bat.secsleft if not plugged else None
    time_str = _seconds_to_hm(bat.secsleft) if bat.secsleft is not None else "N/A"
    if plugged:
        time_str = "Charging"

    return BatteryTelemetry(
        available=True,
        percent=round(bat.percent, 1),
        charging=charging,
        plugged_in=plugged,
        seconds_left=secs,
        time_left_str=time_str,
    )


def to_dict(t: BatteryTelemetry) -> dict:
    if not t.available:
        return {"available": False, "status": "UNAVAILABLE"}
    return {
        "available": True,
        "percent": t.percent,
        "charging": t.charging,
        "plugged_in": t.plugged_in,
        "time_left": t.time_left_str,
        "health_percent": t.health_percent,
        "cycle_count": t.cycle_count,
    }
