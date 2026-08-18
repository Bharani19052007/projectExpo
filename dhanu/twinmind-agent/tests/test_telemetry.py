"""
Integration tests for TwinMind telemetry collectors.
"""

import sys
import json
import time
import pytest

# Ensure the project root is on the import path
sys.path.insert(0, r'g:\\digitaltwin\\twinmind-agent')

from agent.telemetry import cpu, memory, gpu, disk, battery, network, system
from agent.health.health_score import compute
from agent.health.anomaly_detector import AnomalyDetector, Sample

@pytest.fixture(scope="module")
def warmup_cpu():
    """Warm up psutil's CPU percentage measurement."""
    import psutil
    psutil.cpu_percent(interval=0.5)
    time.sleep(0.5)
    return None

def test_collect_all_telemetry(warmup_cpu):
    c = cpu.collect()
    m = memory.collect()
    g = gpu.collect()
    d = disk.collect()
    b = battery.collect()
    n = network.collect()
    s = system.collect()

    assert 0 <= c.usage_percent <= 100
    assert isinstance(c.model, str) and c.model
    assert 0 <= m.usage_percent <= 100
    assert m.total_bytes > 0
    assert hasattr(g, "available")
    assert hasattr(g, "usage_percent")
    assert isinstance(d.disks, list) and len(d.disks) > 0
    assert isinstance(b.available, bool)
    assert isinstance(n.connected, bool)
    assert isinstance(s.os_name, str) and s.os_name

def test_health_score_and_payload():
    c = cpu.collect()
    m = memory.collect()
    g = gpu.collect()
    d = disk.collect()
    b = battery.collect()
    n = network.collect()
    s = system.collect()

    max_disk = max((dd.usage_percent for dd in d.disks), default=0)
    h = compute(
        cpu_usage=c.usage_percent,
        cpu_temp=c.temperature_celsius,
        mem_usage=m.usage_percent,
        gpu_available=g.available,
        gpu_usage=g.usage_percent,
        gpu_temp=g.temperature_celsius,
        max_disk_usage=max_disk,
        bat_available=b.available,
        bat_percent=b.percent,
        bat_plugged=b.plugged_in,
        net_latency=n.server_latency_ms,
    )
    assert 0 <= h.score <= 100
    assert isinstance(h.label, str)

    payload = {
        "deviceId": "TEST-12345",
        "timestamp": "2026-08-17T12:00:00Z",
        "status": "online",
        "cpu": cpu.to_dict(c),
        "memory": memory.to_dict(m),
        "gpu": gpu.to_dict(g),
        "storage": disk.to_dict(d),
        "battery": battery.to_dict(b),
        "network": network.to_dict(n),
        "system": system.to_dict(s),
        "health": {"score": h.score, "label": h.label, "breakdown": h.breakdown},
    }
    payload_json = json.dumps(payload, indent=2, default=str)
    assert len(payload_json) > 0
    parsed = json.loads(payload_json)
    assert parsed["deviceId"] == "TEST-12345"
    assert "cpu" in parsed and "usage" in parsed["cpu"]

