"""
run_headless.py  —  Run the TwinMind agent WITHOUT the Tkinter GUI.
Connects to SERVER_URL from .env and streams telemetry until Ctrl-C.
"""
import sys, os, pathlib, asyncio, time, signal

# Bootstrap path
ROOT = pathlib.Path(__file__).parent
sys.path.insert(0, str(ROOT))

from agent.config import get_config_manager
from agent.logger import get_logger
from agent.main import AgentController

log = get_logger("twinmind.headless")

def main():
    cfg_mgr = get_config_manager()
    cfg     = cfg_mgr.config

    if not cfg.server_url:
        print("[ERROR] SERVER_URL is not set in .env — please set it to http://<server-ip>:4000")
        sys.exit(1)

    print("=" * 56)
    print("  TwinMind Agent  —  Headless Mode")
    print("=" * 56)
    print(f"  Device ID  : {cfg.device_id}")
    print(f"  Device Name: {cfg.device_name}")
    print(f"  Server URL : {cfg.server_url}")
    print(f"  Interval   : {cfg.telemetry_interval}s")
    print("=" * 56)
    print("  Press Ctrl-C to stop.\n")

    controller = AgentController()

    # Handle Ctrl-C cleanly
    def _stop(sig, frame):
        print("\n[Agent] Stopping...")
        controller.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, _stop)

    controller.start()

    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        controller.stop()

if __name__ == "__main__":
    main()
