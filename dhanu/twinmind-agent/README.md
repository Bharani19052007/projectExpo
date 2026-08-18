# TwinMind AI — Monitoring Agent

> **Laptop B only.** This agent collects real system telemetry from this device and streams it to the TwinMind server on **Laptop A**.

---

## Quick Start

### 1. Install Python 3.11+
Download from [python.org](https://www.python.org/downloads/).
Make sure Python is in your `PATH`.

### 2. Run the Agent (Windows)
```bat
run_agent.bat
```
This automatically:
- Creates a virtual environment (`.venv/`)
- Installs all dependencies from `requirements.txt`
- Launches the TwinMind Agent GUI

### 3. Setup Screen
1. Enter the **TwinMind Server Address** (Laptop A's IP and port).  
   Example: `http://192.168.1.10:8000`
2. Enter a **Device Name** (e.g. `Engineering-Laptop-01`)
3. Click **Test & Pair Device** — the agent will register with the server and wait for approval on Laptop A.
4. Once approved, click **Start Monitoring**.

### 4. Skip Pairing (Test Mode)
Click **Skip Pairing (Offline)** to start monitoring without a server connection.
Telemetry will be buffered locally and replayed when the server becomes available.

---

## Manual Installation

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python agent\main.py
```

### Optional: Windows GPU & Temperature Support
For NVIDIA GPU monitoring:
```
nvidia-smi must be in PATH (installed with NVIDIA drivers)
```

For CPU/GPU temperature and SMART disk data via WMI:
```powershell
pip install wmi pywin32
```
> `wmi` is Windows-only. The agent runs fine without it, reporting `UNAVAILABLE` for temperature sensors.

---

## Configuration

Copy `.env.example` to `.env` and set values — **or** let the setup wizard configure it automatically:

```env
SERVER_URL=http://192.168.1.10:8000
DEVICE_ID=TWIN-A7F42
DEVICE_NAME=Engineering-Laptop-01
TELEMETRY_INTERVAL=2
LOG_LEVEL=INFO
```

> ⚠️ **Never commit your real `.env` file.** It is already listed in `.gitignore`.

---

## What is Monitored

| Component | Data Collected |
|-----------|---------------|
| CPU | Usage %, per-core, frequency, temperature, load |
| RAM | Total, used, available, swap |
| GPU | Name, usage %, VRAM, temperature (NVIDIA/AMD) |
| Disk | Per-partition usage, read/write speed, SMART status |
| Battery | Charge %, charging state, time remaining |
| Network | Upload/download Mbps, server latency |
| System | OS, uptime, top 10 processes (CPU + RAM only) |

**Never collected:** passwords, keystrokes, screenshots, webcam, microphone, browser history, file contents, private messages.

---

## Project Structure

```
twinmind-agent/
│
├── agent/
│   ├── main.py             ← Entry point & telemetry orchestration
│   ├── config.py           ← Config manager (loads .env + state JSON)
│   ├── logger.py           ← Secure rotating logger
│   ├── local_db.py         ← SQLite offline buffer
│   │
│   ├── telemetry/
│   │   ├── cpu.py
│   │   ├── memory.py
│   │   ├── gpu.py
│   │   ├── disk.py
│   │   ├── battery.py
│   │   ├── network.py
│   │   └── system.py
│   │
│   ├── health/
│   │   ├── health_score.py     ← 0–100 weighted health score
│   │   └── anomaly_detector.py ← Rolling-window trend analysis
│   │
│   ├── communication/
│   │   ├── websocket_client.py ← WS with reconnect + buffer drain
│   │   └── api_client.py       ← HTTPS REST (registration, fallback)
│   │
│   └── security/
│       └── pairing.py          ← Device registration & approval flow
│
├── ui/
│   ├── app.py              ← Tkinter GUI (Setup / Consent / Dashboard)
│   └── styles.py           ← TwinMind color palette & widget helpers
│
├── logs/                   ← Rotating log files (auto-created)
├── requirements.txt
├── .env.example
├── run_agent.bat
└── README.md
```

---

## Logs

Log files are written to `logs/twinmind-agent.log` (max 5 MB, 3 rotating backups).

Tokens and passwords are automatically **redacted** from all log output.

---

## Security

- Laptop B makes **outbound connections only** — no listening server is opened.
- Auth tokens are stored in `agent_state.json` (file-permissions restricted) and never written to `.env` or logs.
- HTTPS/WSS is used whenever the server URL starts with `https://`.
- Self-signed certificates are accepted for LAN deployments.

---

## Telemetry Payload (example)

```json
{
  "deviceId": "TWIN-A7F42",
  "timestamp": "2026-08-17T12:00:00Z",
  "status": "online",
  "cpu": { "usage": 42, "temperature": 48, "frequency_mhz": 3200 },
  "memory": { "usage": 61, "total_gb": 16.0 },
  "gpu": { "available": true, "usage": 35, "temperature": 46 },
  "storage": { "disks": [{ "mount": "C:\\", "usage": 72, "free_gb": 89.4 }] },
  "battery": { "percent": 91, "charging": true },
  "network": { "latency_ms": 18, "upload_mbps": 14, "download_mbps": 48 },
  "health": { "score": 94, "label": "HEALTHY" }
}
```
