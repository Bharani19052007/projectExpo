import time
import json
import os
import sys
import socket
import platform
import threading
import socketio
import psutil

# Initialize Socket.IO Client
sio = socketio.Client(reconnection=True, reconnection_attempts=0, reconnection_delay=2)

# Global variables for config and rate calculations
config = {}
last_disk_io = None
last_net_io = None
last_time = None

def load_config():
    global config
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
            print("[Config] Loaded configuration from config.json")
        else:
            # Defaults
            config = {
                "serverHost": "127.0.0.1",
                "serverPort": 4000,
                "deviceId": "laptop-001",
                "token": "TWINMIND_LAPTOP_SECURE_TOKEN_2026",
                "telemetryInterval": 2000
            }
            print("[Config] config.json not found. Using default loopback settings.")
    except Exception as e:
        print("[Config Error] Failed to load config.json:", e)

def get_io_rates():
    global last_disk_io, last_net_io, last_time
    
    current_disk_io = psutil.disk_io_counters()
    current_net_io = psutil.net_io_counters()
    current_time = time.time()
    
    # First iteration setup
    if last_disk_io is None or last_net_io is None or last_time is None:
        last_disk_io = current_disk_io
        last_net_io = current_net_io
        last_time = current_time
        return 0.0, 0.0, 0.0, 0.0
        
    elapsed = current_time - last_time
    if elapsed <= 0:
        elapsed = 1.0

    # Calculate Disk Read/Write rates in MB/s
    read_bytes = current_disk_io.read_bytes - last_disk_io.read_bytes
    write_bytes = current_disk_io.write_bytes - last_disk_io.write_bytes
    read_mbps = round((read_bytes / elapsed) / (1024 * 1024), 2)
    write_mbps = round((write_bytes / elapsed) / (1024 * 1024), 2)

    # Calculate Network Upload/Download speeds in Mbps
    sent_bits = (current_net_io.bytes_sent - last_net_io.bytes_sent) * 8
    recv_bits = (current_net_io.bytes_recv - last_net_io.bytes_recv) * 8
    upload_mbps = round((sent_bits / elapsed) / (1024 * 1024), 2)
    download_mbps = round((recv_bits / elapsed) / (1024 * 1024), 2)

    last_disk_io = current_disk_io
    last_net_io = current_net_io
    last_time = current_time

    return read_mbps, write_mbps, upload_mbps, download_mbps

def collect_telemetry():
    # Warm up cpu percent
    cpu_usage = psutil.cpu_percent(interval=None)
    
    # 1. CPU Temperature
    cpu_temp = None
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for key in ['coretemp', 'k10temp', 'cpu_thermal', 'acpitz']:
                if key in temps and len(temps[key]) > 0:
                    cpu_temp = round(sum(t.current for t in temps[key]) / len(temps[key]), 1)
                    break
            if cpu_temp is None:
                for key, val in temps.items():
                    if len(val) > 0:
                        cpu_temp = round(sum(t.current for t in val) / len(val), 1)
                        break
    except Exception:
        pass

    # 2. GPU telemetry (optional library)
    gpu_usage = None
    gpu_temp = None
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus and len(gpus) > 0:
            gpu_usage = round(gpus[0].load * 100, 1)
            gpu_temp = round(gpus[0].temperature, 1)
    except Exception:
        pass

    # 3. Cooling Fan Speeds
    fan_rpm = None
    try:
        fans = psutil.sensors_fans()
        if fans:
            for key, val in fans.items():
                if len(val) > 0:
                    fan_rpm = val[0].current
                    break
    except Exception:
        pass

    # 4. Battery metrics
    battery_pct = None
    battery_charging = None
    battery_temp = None
    try:
        bat = psutil.sensors_battery()
        if bat:
            battery_pct = bat.percent
            battery_charging = bat.power_plugged
        # Attempt battery temperature search on Linux path
        temps = psutil.sensors_temperatures()
        if temps and 'battery' in temps and len(temps['battery']) > 0:
            battery_temp = round(temps['battery'][0].current, 1)
    except Exception:
        pass

    # 5. RAM virtual memory
    mem = psutil.virtual_memory()
    mem_usage_pct = mem.percent
    mem_total_gb = round(mem.total / (1024**3), 1)
    mem_used_gb = round(mem.used / (1024**3), 1)
    mem_available_gb = round(mem.available / (1024**3), 1)

    # 6. Disk metrics & IO
    disk = psutil.disk_usage('/')
    disk_usage_pct = disk.percent
    read_mbps, write_mbps, upload_mbps, download_mbps = get_io_rates()

    # 7. System uptime
    uptime_sec = int(time.time() - psutil.boot_time())

    # Build consistent payload schema
    payload = {
        "deviceId": config.get("deviceId", "laptop-001"),
        "hostname": socket.gethostname(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "token": config.get("token"),
        "cpu": {
            "usage": cpu_usage,
            "temperature": cpu_temp
        },
        "memory": {
            "usagePercent": mem_usage_pct,
            "totalGB": mem_total_gb,
            "usedGB": mem_used_gb,
            "availableGB": mem_available_gb
        },
        "disk": {
            "usagePercent": disk_usage_pct,
            "readMBps": read_mbps,
            "writeMBps": write_mbps
        },
        "battery": {
            "percentage": battery_pct,
            "charging": battery_charging,
            "temperature": battery_temp
        },
        "gpu": {
            "usage": gpu_usage,
            "temperature": gpu_temp
        },
        "fan": {
            "rpm": fan_rpm
        },
        "network": {
            "connected": True,
            "uploadMbps": upload_mbps,
            "downloadMbps": download_mbps
        },
        "system": {
            "uptimeSeconds": uptime_sec
        }
      }
    return payload

@sio.event
def connect():
    print(f"\n[SocketIO] Connected to server: {sio.connection_url}")
    # Register immediately
    sio.emit('laptop:register', {
        "deviceId": config.get("deviceId", "laptop-001"),
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "agentVersion": "1.0.0",
        "token": config.get("token")
    })
    print("[SocketIO] Sent laptop:register registration payload.")

@sio.event
def disconnect():
    print("\n[SocketIO] Disconnected from server.")

@sio.event
def connect_error(data):
    print(f"\n[SocketIO] Connection error: {data}")

@sio.on('laptop:auth_failed')
def on_auth_failed(data):
    print(f"\n[Auth Failed] Server rejected credentials: {data.get('message', 'No details provided')}")
    print("[Agent] Terminating thread.")
    sio.disconnect()
    os._exit(1)

def telemetry_thread():
    interval = config.get("telemetryInterval", 2000) / 1000.0
    print(f"[Agent] Telemetry collection loop started. Interval: {interval}s")
    while True:
        if sio.connected:
            try:
                payload = collect_telemetry()
                sio.emit('laptop:telemetry', payload)
                print(f"[Telemetry] Sent state: CPU {payload['cpu']['usage']}% | RAM {payload['memory']['usagePercent']}% | Battery {payload['battery']['percentage']}%")
            except Exception as e:
                print("[Telemetry Error] Failed to compile or emit payload:", e)
        time.sleep(interval)

def main():
    load_config()
    
    server_ip = config.get("serverHost", "127.0.0.1")
    server_port = config.get("serverPort", 4000)
    server_url = f"http://{server_ip}:{server_port}"

    print("====================================================")
    print("        TwinMind-AI Laptop Telemetry Agent")
    print("====================================================")
    print(f"Device ID: {config.get('deviceId')}")
    print(f"Hostname:  {socket.gethostname()}")
    print(f"Platform:  {platform.system()} ({platform.release()})")
    print(f"Server:    {server_url}")
    print("====================================================")

    # Initialize rates calculations
    get_io_rates()
    time.sleep(1)

    # Launch background thread
    t = threading.Thread(target=telemetry_thread, daemon=True)
    t.start()

    # Connection loop
    while True:
        if not sio.connected:
            try:
                print(f"[Agent] Attempting connection to server at {server_url}...")
                sio.connect(server_url)
                sio.wait()
            except Exception as e:
                print(f"[Connection failed] Server offline or firewall blocked. Retrying in 5 seconds...")
                time.sleep(5)
        else:
            time.sleep(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Agent] Exiting due to user interruption.")
        sio.disconnect()
        sys.exit(0)
