"""
agent/health/anomaly_detector.py
Lightweight rolling-window anomaly detection for device telemetry.
Uses trend analysis (linear slope) and threshold breaches.
No ML dependencies — runs in <1 ms per call.
"""
from __future__ import annotations

import statistics
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, Dict, List, Optional, Tuple


# ── Data structure ────────────────────────────────────────────────────────────

@dataclass
class Sample:
    timestamp: float
    cpu_usage: float
    cpu_temp: Optional[float]
    mem_usage: float
    max_disk_usage: float
    latency_ms: Optional[float]
    bat_percent: Optional[float]
    bat_plugged: Optional[bool]


@dataclass
class Anomaly:
    problem: str
    risk_level: str        # LOW | MEDIUM | HIGH | CRITICAL
    confidence_percent: int
    recommendation: str
    anomaly_score: float   # 0–100


@dataclass
class AnomalyReport:
    anomalies: List[Anomaly]
    overall_risk: str
    anomaly_score: float


# ── Detector ──────────────────────────────────────────────────────────────────

_WINDOW_SIZE = 90          # ~3 minutes at 2s interval
_MIN_SAMPLES = 10          # need at least this many to detect trends
_TREND_THRESHOLD = 0.05    # slope threshold per second for "rising" trend


class AnomalyDetector:
    def __init__(self, window: int = _WINDOW_SIZE) -> None:
        self._window = window
        self._history: Deque[Sample] = deque(maxlen=window)

    def add_sample(self, s: Sample) -> None:
        self._history.append(s)

    def analyze(self) -> AnomalyReport:
        history = list(self._history)
        if not history:
            return AnomalyReport(anomalies=[], overall_risk="UNKNOWN", anomaly_score=0.0)

        anomalies: List[Anomaly] = []

        # ── CPU usage sustained high ──────────────────────────────────────────
        if len(history) >= _MIN_SAMPLES:
            recent_cpu = [s.cpu_usage for s in history[-30:]]  # last ~1 min
            avg_cpu = statistics.mean(recent_cpu)
            if avg_cpu > 90:
                duration_min = round(len(history[-30:]) * 2 / 60, 1)
                anomalies.append(Anomaly(
                    problem=f"CPU utilization has remained above 90% for approximately {duration_min} minutes (avg {avg_cpu:.0f}%).",
                    risk_level="HIGH",
                    confidence_percent=min(90, int(avg_cpu)),
                    recommendation="Identify and close resource-intensive processes. Check for runaway applications.",
                    anomaly_score=70.0,
                ))
            elif avg_cpu > 80:
                anomalies.append(Anomaly(
                    problem=f"CPU utilization is consistently high at {avg_cpu:.0f}%.",
                    risk_level="MEDIUM",
                    confidence_percent=75,
                    recommendation="Monitor CPU usage. Consider closing unused applications.",
                    anomaly_score=40.0,
                ))

        # ── CPU temperature rising trend ──────────────────────────────────────
        temps = [(s.timestamp, s.cpu_temp) for s in history if s.cpu_temp is not None]
        if len(temps) >= _MIN_SAMPLES:
            slope = _linear_slope([t for t, _ in temps], [v for _, v in temps])
            latest_temp = temps[-1][1]
            duration_s = temps[-1][0] - temps[0][0]
            if slope > 0.1 and duration_s > 120:  # rising >0.1°C/s for >2 min
                anomalies.append(Anomaly(
                    problem=(
                        f"CPU temperature has been rising continuously for "
                        f"{round(duration_s / 60, 1)} minutes "
                        f"(now {latest_temp:.0f}°C, +{slope * duration_s:.1f}°C total)."
                    ),
                    risk_level="HIGH" if latest_temp > 80 else "MEDIUM",
                    confidence_percent=min(95, int(70 + slope * 100)),
                    recommendation="Check ventilation, clean cooling vents, and reduce sustained CPU load.",
                    anomaly_score=65.0,
                ))
            if latest_temp > 90:
                anomalies.append(Anomaly(
                    problem=f"CPU temperature is critically high at {latest_temp:.0f}°C.",
                    risk_level="CRITICAL",
                    confidence_percent=95,
                    recommendation="Immediately reduce system load. Check cooling system for failure.",
                    anomaly_score=90.0,
                ))

        # ── RAM sustained high ────────────────────────────────────────────────
        if len(history) >= _MIN_SAMPLES:
            recent_mem = [s.mem_usage for s in history[-30:]]
            avg_mem = statistics.mean(recent_mem)
            if avg_mem > 92:
                anomalies.append(Anomaly(
                    problem=f"Memory utilization is critically high at {avg_mem:.0f}%. System may become unresponsive.",
                    risk_level="CRITICAL",
                    confidence_percent=92,
                    recommendation="Close unused applications. Consider adding more RAM.",
                    anomaly_score=85.0,
                ))
            elif avg_mem > 85:
                anomalies.append(Anomaly(
                    problem=f"Memory utilization has been above 85% (avg {avg_mem:.0f}%).",
                    risk_level="HIGH",
                    confidence_percent=80,
                    recommendation="Close background applications to free RAM.",
                    anomaly_score=55.0,
                ))

        # ── RAM rising trend ──────────────────────────────────────────────────
        if len(history) >= _MIN_SAMPLES:
            mem_vals = [s.mem_usage for s in history]
            timestamps = [s.timestamp for s in history]
            slope = _linear_slope(timestamps, mem_vals)
            duration_s = timestamps[-1] - timestamps[0]
            if slope > 0.02 and duration_s > 120:  # >0.02%/s rising for 2+ min
                anomalies.append(Anomaly(
                    problem=(
                        f"Memory usage has been steadily increasing for "
                        f"{round(duration_s / 60, 1)} minutes. "
                        f"Possible memory leak detected."
                    ),
                    risk_level="MEDIUM",
                    confidence_percent=70,
                    recommendation="Identify the process consuming increasing memory. Restart if necessary.",
                    anomaly_score=50.0,
                ))

        # ── Disk approaching capacity ─────────────────────────────────────────
        if history:
            latest = history[-1]
            disk_usage = latest.max_disk_usage
            if disk_usage > 95:
                anomalies.append(Anomaly(
                    problem=f"A disk drive is {disk_usage:.0f}% full. System may become unstable.",
                    risk_level="CRITICAL",
                    confidence_percent=98,
                    recommendation="Immediately free disk space by removing large unused files.",
                    anomaly_score=90.0,
                ))
            elif disk_usage > 90:
                anomalies.append(Anomaly(
                    problem=f"A disk drive is {disk_usage:.0f}% full.",
                    risk_level="HIGH",
                    confidence_percent=95,
                    recommendation="Free disk space. Delete temporary files or move data to external storage.",
                    anomaly_score=65.0,
                ))
            elif disk_usage > 80:
                anomalies.append(Anomaly(
                    problem=f"A disk drive is {disk_usage:.0f}% full.",
                    risk_level="MEDIUM",
                    confidence_percent=90,
                    recommendation="Monitor disk usage and clean up unnecessary files.",
                    anomaly_score=35.0,
                ))

        # ── Network latency rising ────────────────────────────────────────────
        latencies = [s.latency_ms for s in history if s.latency_ms is not None]
        if len(latencies) >= _MIN_SAMPLES:
            recent_lat = latencies[-10:]
            avg_lat = statistics.mean(recent_lat)
            if avg_lat > 500:
                anomalies.append(Anomaly(
                    problem=f"Server latency is very high at {avg_lat:.0f} ms.",
                    risk_level="HIGH",
                    confidence_percent=85,
                    recommendation="Check network connection quality and server availability.",
                    anomaly_score=60.0,
                ))
            elif avg_lat > 200:
                anomalies.append(Anomaly(
                    problem=f"Server latency is elevated at {avg_lat:.0f} ms.",
                    risk_level="MEDIUM",
                    confidence_percent=70,
                    recommendation="Check for network congestion or interference.",
                    anomaly_score=30.0,
                ))

        # ── Battery draining fast ─────────────────────────────────────────────
        bat_samples = [
            (s.timestamp, s.bat_percent)
            for s in history
            if s.bat_percent is not None and s.bat_plugged is False
        ]
        if len(bat_samples) >= _MIN_SAMPLES:
            slope = _linear_slope([t for t, _ in bat_samples], [v for _, v in bat_samples])
            if slope < -0.05:  # losing >0.05% per second = 3% per minute
                drain_per_hour = abs(slope) * 3600
                anomalies.append(Anomaly(
                    problem=f"Battery is draining unusually fast (~{drain_per_hour:.0f}% per hour).",
                    risk_level="MEDIUM",
                    confidence_percent=75,
                    recommendation="Check for high-power applications. Reduce screen brightness and CPU load.",
                    anomaly_score=45.0,
                ))

        # ── Compute overall ───────────────────────────────────────────────────
        if not anomalies:
            return AnomalyReport(anomalies=[], overall_risk="NONE", anomaly_score=0.0)

        max_score = max(a.anomaly_score for a in anomalies)
        risk_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1, "NONE": 0}
        top_risk = max(anomalies, key=lambda a: risk_order.get(a.risk_level, 0)).risk_level

        return AnomalyReport(
            anomalies=anomalies,
            overall_risk=top_risk,
            anomaly_score=round(max_score, 1),
        )


# ── Math helpers ──────────────────────────────────────────────────────────────

def _linear_slope(xs: List[float], ys: List[float]) -> float:
    """Compute linear regression slope for a list of (x, y) pairs."""
    n = len(xs)
    if n < 2:
        return 0.0
    try:
        x_mean = statistics.mean(xs)
        y_mean = statistics.mean(ys)
        num = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys))
        den = sum((x - x_mean) ** 2 for x in xs)
        return num / den if den != 0 else 0.0
    except Exception:
        return 0.0
