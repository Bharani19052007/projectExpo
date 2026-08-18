"""
agent/telemetry/cpu.py
Real CPU telemetry using psutil + platform-specific APIs.
"""
from __future__ import annotations

import platform
import time
from dataclasses import dataclass, field
from typing import List, Optional

import psutil

# Optional: cpuinfo for model name
try:
    import cpuinfo  # type: ignore
    _CPU_NAME: str = cpuinfo.get_cpu_info().get("brand_raw", platform.processor())
except Exception:
    _CPU_NAME = platform.processor() or "Unknown CPU"


@dataclass
class CPUTelemetry:
    model: str
    physical_cores: int
    logical_cores: int
    usage_percent: float                  # overall %
    per_core_usage: List[float]           # per-core %
    frequency_mhz: Optional[float]        # current MHz
    frequency_max_mhz: Optional[float]    # max MHz
    temperature_celsius: Optional[float]  # None if unavailable
    load_avg_1m: Optional[float]          # 1-min load avg (Unix only)


def _get_temperature() -> Optional[float]:
    """Best-effort CPU temperature across platforms."""
    # psutil sensors (Linux, some macOS)
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for key in ("coretemp", "cpu_thermal", "k10temp", "acpitz", "cpu-thermal"):
                if key in temps and temps[key]:
                    return float(temps[key][0].current)
            # Take first available sensor
            for entries in temps.values():
                if entries:
                    return float(entries[0].current)
    except (AttributeError, OSError):
        pass

    # Windows — WMI
    if platform.system() == "Windows":
        try:
            import wmi  # type: ignore
            w = wmi.WMI(namespace="root\\OpenHardwareMonitor")
            sensors = w.Sensor()
            for s in sensors:
                if s.SensorType == "Temperature" and "CPU" in s.Name:
                    return float(s.Value)
        except Exception:
            pass

        try:
            import wmi  # type: ignore
            w = wmi.WMI(namespace="root\\wmi")
            temps = w.MSAcpi_ThermalZoneTemperature()
            if temps:
                return round((temps[0].CurrentTemperature / 10.0) - 273.15, 1)
        except Exception:
            pass

    return None


def collect() -> CPUTelemetry:
    """Collect CPU telemetry snapshot."""
    # Overall usage (non-blocking; first call after import may return 0.0)
    usage = psutil.cpu_percent(interval=None)
    per_core = psutil.cpu_percent(percpu=True, interval=None)

    freq = psutil.cpu_freq()
    freq_current = round(freq.current, 1) if freq else None
    freq_max = round(freq.max, 1) if freq and freq.max else None

    # Load average (Unix only)
    try:
        load_avg = psutil.getloadavg()[0]
    except (AttributeError, OSError):
        load_avg = None

    return CPUTelemetry(
        model=_CPU_NAME,
        physical_cores=psutil.cpu_count(logical=False) or 1,
        logical_cores=psutil.cpu_count(logical=True) or 1,
        usage_percent=usage,
        per_core_usage=per_core if isinstance(per_core, list) else [per_core],
        frequency_mhz=freq_current,
        frequency_max_mhz=freq_max,
        temperature_celsius=_get_temperature(),
        load_avg_1m=load_avg,
    )


def to_dict(t: CPUTelemetry) -> dict:
    return {
        "model": t.model,
        "physical_cores": t.physical_cores,
        "logical_cores": t.logical_cores,
        "usage": round(t.usage_percent, 1),
        "per_core_usage": [round(c, 1) for c in t.per_core_usage],
        "frequency_mhz": t.frequency_mhz,
        "frequency_max_mhz": t.frequency_max_mhz,
        "temperature": t.temperature_celsius,
        "load_avg_1m": round(t.load_avg_1m, 2) if t.load_avg_1m is not None else None,
    }
