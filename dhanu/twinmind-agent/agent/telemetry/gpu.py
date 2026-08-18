"""
agent/telemetry/gpu.py
GPU telemetry.
Attempts NVIDIA (nvidia-smi), then AMD (rocm-smi), then WMI on Windows,
then falls back to PowerShell/DirectX query.
Returns UNAVAILABLE gracefully — never fabricates values.
"""
from __future__ import annotations

import platform
import subprocess
import shutil
from dataclasses import dataclass
from typing import Optional


@dataclass
class GPUTelemetry:
    available: bool
    name: Optional[str] = None
    usage_percent: Optional[float] = None
    memory_used_mb: Optional[float] = None
    memory_total_mb: Optional[float] = None
    temperature_celsius: Optional[float] = None
    driver_version: Optional[str] = None
    source: Optional[str] = None  # "nvidia-smi" | "rocm-smi" | "wmi" | "powershell"


def _query_nvidia() -> Optional[GPUTelemetry]:
    """Query NVIDIA GPU via nvidia-smi."""
    if not shutil.which("nvidia-smi"):
        return None
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu,driver_version",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return None
        lines = [l.strip() for l in result.stdout.strip().splitlines() if l.strip()]
        if not lines:
            return None
        parts = [p.strip() for p in lines[0].split(",")]
        if len(parts) < 5:
            return None
        return GPUTelemetry(
            available=True,
            name=parts[0],
            usage_percent=float(parts[1]) if parts[1] not in ("N/A", "") else None,
            memory_used_mb=float(parts[2]) if parts[2] not in ("N/A", "") else None,
            memory_total_mb=float(parts[3]) if parts[3] not in ("N/A", "") else None,
            temperature_celsius=float(parts[4]) if parts[4] not in ("N/A", "") else None,
            driver_version=parts[5] if len(parts) > 5 else None,
            source="nvidia-smi",
        )
    except Exception:
        return None


def _query_rocm() -> Optional[GPUTelemetry]:
    """Query AMD GPU via rocm-smi."""
    if not shutil.which("rocm-smi"):
        return None
    try:
        result = subprocess.run(
            ["rocm-smi", "--showuse", "--showtemp", "--showproductname", "--json"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return None
        import json
        data = json.loads(result.stdout)
        card = next(iter(data.values()), {})
        return GPUTelemetry(
            available=True,
            name=card.get("Card series", "AMD GPU"),
            usage_percent=float(card["GPU use (%)"]) if "GPU use (%)" in card else None,
            temperature_celsius=(
                float(card["Temperature (Sensor edge) (C)"])
                if "Temperature (Sensor edge) (C)" in card else None
            ),
            source="rocm-smi",
        )
    except Exception:
        return None


def _query_wmi() -> Optional[GPUTelemetry]:
    """Windows WMI — name only (no usage/temp without drivers or OHM)."""
    if platform.system() != "Windows":
        return None
    try:
        import wmi  # type: ignore
        w = wmi.WMI()
        for gpu in w.Win32_VideoController():
            return GPUTelemetry(
                available=True,
                name=gpu.Name,
                driver_version=gpu.DriverVersion,
                source="wmi",
            )
    except Exception:
        pass
    return None


def _query_powershell() -> Optional[GPUTelemetry]:
    """Windows PowerShell fallback — Get-CimInstance for GPU name and VRAM."""
    if platform.system() != "Windows":
        return None
    try:
        cmd = (
            'Get-CimInstance -ClassName Win32_VideoController '
            '| Select-Object -First 1 Name,DriverVersion,AdapterRAM '
            '| ConvertTo-Json'
        )
        result = subprocess.run(
            ["powershell", "-NoProfile", "-Command", cmd],
            capture_output=True,
            text=True,
            timeout=8,
            creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0,
        )
        if result.returncode != 0 or not result.stdout.strip():
            return None
        import json
        data = json.loads(result.stdout.strip())
        name = data.get("Name")
        if not name:
            return None

        adapter_ram = data.get("AdapterRAM")
        memory_total_mb = round(adapter_ram / (1024 ** 2), 0) if adapter_ram and adapter_ram > 0 else None

        return GPUTelemetry(
            available=True,
            name=name,
            driver_version=data.get("DriverVersion"),
            memory_total_mb=memory_total_mb,
            source="powershell",
        )
    except Exception:
        return None


def collect() -> GPUTelemetry:
    """Return best available GPU telemetry."""
    for fn in (_query_nvidia, _query_rocm, _query_wmi, _query_powershell):
        result = fn()
        if result is not None:
            return result
    return GPUTelemetry(available=False)


def to_dict(t: GPUTelemetry) -> dict:
    if not t.available:
        return {"available": False, "status": "UNAVAILABLE"}
    return {
        "available": True,
        "name": t.name,
        "usage": t.usage_percent,
        "memory_used_mb": t.memory_used_mb,
        "memory_total_mb": t.memory_total_mb,
        "temperature": t.temperature_celsius,
        "driver_version": t.driver_version,
        "source": t.source,
    }
