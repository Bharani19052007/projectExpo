"""
agent/health/health_score.py
Weighted device health score (0–100).
Penalizes bad readings; never inflates score artificially.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class HealthResult:
    score: int          # 0–100
    label: str          # HEALTHY | GOOD | WARNING | CRITICAL
    breakdown: dict     # per-component penalty details


# ── Component scorers ─────────────────────────────────────────────────────────

def _score_cpu(cpu_usage: float, cpu_temp: Optional[float]) -> float:
    """Returns 0–100 for CPU health."""
    score = 100.0
    if cpu_usage > 95:
        score -= 30
    elif cpu_usage > 90:
        score -= 20
    elif cpu_usage > 80:
        score -= 10
    elif cpu_usage > 70:
        score -= 5

    if cpu_temp is not None:
        if cpu_temp > 95:
            score -= 35
        elif cpu_temp > 85:
            score -= 20
        elif cpu_temp > 75:
            score -= 10
        elif cpu_temp > 65:
            score -= 5

    return max(score, 0.0)


def _score_memory(mem_usage: float) -> float:
    score = 100.0
    if mem_usage > 95:
        score -= 35
    elif mem_usage > 90:
        score -= 25
    elif mem_usage > 85:
        score -= 15
    elif mem_usage > 75:
        score -= 8
    return max(score, 0.0)


def _score_gpu(gpu_available: bool, gpu_usage: Optional[float], gpu_temp: Optional[float]) -> float:
    if not gpu_available:
        return 80.0  # neutral if no GPU present
    score = 100.0
    if gpu_usage is not None and gpu_usage > 95:
        score -= 15
    if gpu_temp is not None:
        if gpu_temp > 90:
            score -= 30
        elif gpu_temp > 80:
            score -= 15
        elif gpu_temp > 70:
            score -= 5
    return max(score, 0.0)


def _score_disk(max_disk_usage: float) -> float:
    score = 100.0
    if max_disk_usage > 95:
        score -= 40
    elif max_disk_usage > 90:
        score -= 25
    elif max_disk_usage > 80:
        score -= 12
    elif max_disk_usage > 70:
        score -= 5
    return max(score, 0.0)


def _score_battery(
    bat_available: bool,
    bat_percent: Optional[float],
    plugged_in: Optional[bool],
) -> float:
    if not bat_available:
        return 85.0  # desktop or AC-only
    if bat_percent is None:
        return 85.0
    score = 100.0
    if not plugged_in:
        if bat_percent < 10:
            score -= 40
        elif bat_percent < 20:
            score -= 25
        elif bat_percent < 30:
            score -= 10
    return max(score, 0.0)


def _score_network(latency_ms: Optional[float], connected: bool) -> float:
    if not connected:
        return 40.0
    if latency_ms is None:
        return 70.0  # connected but no latency measurement
    score = 100.0
    if latency_ms > 500:
        score -= 40
    elif latency_ms > 200:
        score -= 20
    elif latency_ms > 100:
        score -= 10
    elif latency_ms > 50:
        score -= 3
    return max(score, 0.0)


def _score_stability(error_count: int) -> float:
    score = 100.0
    if error_count > 10:
        score -= 40
    elif error_count > 5:
        score -= 20
    elif error_count > 2:
        score -= 10
    elif error_count > 0:
        score -= 5
    return max(score, 0.0)


# ── Weights ───────────────────────────────────────────────────────────────────
_WEIGHTS = {
    "cpu":       0.20,
    "memory":    0.20,
    "gpu":       0.10,
    "disk":      0.20,
    "battery":   0.10,
    "network":   0.10,
    "stability": 0.10,
}


def _label(score: int) -> str:
    if score >= 90:
        return "HEALTHY"
    if score >= 75:
        return "GOOD"
    if score >= 50:
        return "WARNING"
    return "CRITICAL"


def compute(
    cpu_usage: float = 0.0,
    cpu_temp: Optional[float] = None,
    mem_usage: float = 0.0,
    gpu_available: bool = False,
    gpu_usage: Optional[float] = None,
    gpu_temp: Optional[float] = None,
    max_disk_usage: float = 0.0,
    bat_available: bool = False,
    bat_percent: Optional[float] = None,
    bat_plugged: Optional[bool] = None,
    net_latency: Optional[float] = None,
    net_connected: bool = True,
    error_count: int = 0,
) -> HealthResult:
    components = {
        "cpu":       _score_cpu(cpu_usage, cpu_temp),
        "memory":    _score_memory(mem_usage),
        "gpu":       _score_gpu(gpu_available, gpu_usage, gpu_temp),
        "disk":      _score_disk(max_disk_usage),
        "battery":   _score_battery(bat_available, bat_percent, bat_plugged),
        "network":   _score_network(net_latency, net_connected),
        "stability": _score_stability(error_count),
    }

    weighted = sum(components[k] * _WEIGHTS[k] for k in components)
    score = max(0, min(100, round(weighted)))

    return HealthResult(
        score=score,
        label=_label(score),
        breakdown={k: round(v) for k, v in components.items()},
    )
