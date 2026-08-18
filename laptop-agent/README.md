# TwinMind-AI Laptop Monitoring Agent

This folder contains a lightweight background agent that monitors a physical laptop's telemetry (Computer B) and transmits it in real-time over the local Wi-Fi/LAN network to the primary TwinMind-AI Digital Twin dashboard (Computer A).

---

## 🛠️ Requirements

*   **Python 3.8+** installed on the laptop to be monitored (Computer B).
*   Both computers must be connected to the **same Wi-Fi network**.

---

## 🚀 Quick Start Guide

### Step 1: Find Computer A's LAN IP Address
On **Computer A** (running the TwinMind-AI Node.js backend):
1.  Open your Command Prompt (CMD) or PowerShell.
2.  Run the command:
    ```cmd
    ipconfig
    ```
3.  Look for your active adapter (e.g., "Wireless LAN adapter Wi-Fi") and copy the **IPv4 Address**.
    *   *Example:* `192.168.1.10`

### Step 2: Configure the Agent on Computer B
On **Computer B** (the physical laptop being monitored):
1.  Open [`laptop-agent/config.json`](config.json).
2.  Update the parameters:
    *   `serverHost`: Replace `"127.0.0.1"` with Computer A's LAN IPv4 address (e.g. `"192.168.1.10"`).
    *   `serverPort`: Confirm it matches the Node.js server port (`4000`).
    *   `deviceId`: Leave as `"laptop-001"` (must match the ID expected by the React twin dashboard).
    *   `token`: Preconfigured connection key (`"TWINMIND_LAPTOP_SECURE_TOKEN_2026"`).
    *   `telemetryInterval`: Frequency in milliseconds to send data (`2000` = every 2 seconds).

### Step 3: Run the Telemetry Agent
On **Computer B**:
*   **Windows:** Simply double-click the [`run_agent.bat`](run_agent.bat) file. It will automatically create a Python virtual environment, install the requirements (`psutil`, `python-socketio`, `GPUtil`), and launch the agent.
*   **Linux / macOS:** Run:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python agent.py
    ```

---

## 💻 Running the TwinMind-AI Server (Computer A)

To receive data and display it in the React UI:
1.  Start the Node.js backend:
    ```bash
    cd backend
    npm install
    npm start
    ```
2.  Start the React + Vite frontend (binding to all interfaces so you can access it from other LAN devices):
    ```bash
    cd frontend
    npm install
    npm run dev -- --host 0.0.0.0
    ```
3.  Open `http://localhost:5173` on Computer A, navigate to **LAPTOP**, and turn off **Demo Mode** in the top-right to view live remote telemetry!

---

## 🛡️ Windows Firewall & Network Troubleshooting

If Computer B fails to connect to Computer A's IP address:
1.  **Private Network Profile:** Make sure both laptops have their network profile set to **Private** (Go to Windows Settings -> Network & Internet -> Properties -> Set profile to Private).
2.  **Allow Port 4000:** On Computer A, create an inbound firewall rule for port 4000:
    *   Open **Windows Defender Firewall with Advanced Security**.
    *   Click **Inbound Rules** -> **New Rule**.
    *   Select **Port** -> **TCP** -> Specific local ports: `4000`.
    *   Select **Allow the connection**.
    *   Check only **Private** and **Domain** (uncheck Public to keep your device secure on public Wi-Fi).
    *   Name the rule `TwinMind Backend (Socket.IO)` and save.

---

## 📊 Telemetry Schema

The agent transmits data in the following nested JSON format via the `laptop:telemetry` Socket.IO event:

```json
{
  "deviceId": "laptop-001",
  "hostname": "USER-LAPTOP",
  "timestamp": "2026-08-17T12:30:00Z",
  "token": "TWINMIND_LAPTOP_SECURE_TOKEN_2026",
  "cpu": {
    "usage": 43.5,
    "temperature": 62.3
  },
  "memory": {
    "usagePercent": 68.2,
    "totalGB": 16.0,
    "usedGB": 10.9,
    "availableGB": 5.1
  },
  "disk": {
    "usagePercent": 71.4,
    "readMBps": 1.2,
    "writeMBps": 0.4
  },
  "battery": {
    "percentage": 78,
    "charging": true,
    "temperature": null
  },
  "gpu": {
    "usage": null,
    "temperature": null
  },
  "fan": {
    "rpm": null
  },
  "network": {
    "connected": true,
    "uploadMbps": 0.45,
    "downloadMbps": 3.82
  },
  "system": {
    "uptimeSeconds": 125430
  }
}
```
*Note: Unsupported OS hardware sensors (like GPU temps or Fan RPMs when run inside virtualized containers) will report `null` and display as `N/A` on the dashboard instead of faking values.*
