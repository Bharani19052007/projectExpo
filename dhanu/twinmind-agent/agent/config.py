"""
agent/config.py
Configuration manager for TwinMind Agent.
Reads/writes .env and a JSON state file.
Never exposes raw tokens in repr or logs.
"""
from __future__ import annotations

import json
import os
import secrets
import string
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

try:
    from dotenv import load_dotenv, set_key
except ImportError:
    # No-op fallbacks if python-dotenv is not installed
    def load_dotenv(*args, **kwargs):
        return False
    def set_key(*args, **kwargs):
        return False

# ──────────────────────────────────────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────────────────────────────────────
_ROOT = Path(__file__).parent.parent
_ENV_FILE = _ROOT / ".env"
_STATE_FILE = _ROOT / "agent_state.json"


def _ensure_env_file() -> None:
    """Create .env from .env.example if it does not exist."""
    example = _ROOT / ".env.example"
    if not _ENV_FILE.exists() and example.exists():
        _ENV_FILE.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")


# ──────────────────────────────────────────────────────────────────────────────
# Device-ID generation
# ──────────────────────────────────────────────────────────────────────────────
def _generate_device_id() -> str:
    """Generate a deterministic-looking but unique device ID."""
    import hashlib, socket, platform
    seed = f"{socket.gethostname()}-{platform.node()}-{platform.machine()}"
    digest = hashlib.sha256(seed.encode()).hexdigest()[:5].upper()
    return f"TWIN-LAPTOP-{digest}"


# ──────────────────────────────────────────────────────────────────────────────
# Data class
# ──────────────────────────────────────────────────────────────────────────────
@dataclass
class AgentConfig:
    server_url: str = ""
    device_id: str = field(default_factory=_generate_device_id)
    device_name: str = field(default_factory=lambda: __import__("socket").gethostname())
    auth_token: str = ""
    telemetry_interval: float = 2.0
    log_level: str = "INFO"
    # Runtime state (not persisted to .env)
    paired: bool = False

    def __repr__(self) -> str:
        """Never expose auth_token in repr."""
        token_hint = "****" if self.auth_token else "<not set>"
        return (
            f"AgentConfig(server_url={self.server_url!r}, "
            f"device_id={self.device_id!r}, "
            f"device_name={self.device_name!r}, "
            f"auth_token={token_hint}, "
            f"paired={self.paired})"
        )


# ──────────────────────────────────────────────────────────────────────────────
# ConfigManager
# ──────────────────────────────────────────────────────────────────────────────
class ConfigManager:
    """Load, save, and expose agent configuration.

    Priority: in-memory → JSON state file → .env file.
    """

    def __init__(self) -> None:
        _ensure_env_file()
        load_dotenv(_ENV_FILE, override=True)  # .env always wins over system env
        self._cfg = self._load()

    # ── Public API ────────────────────────────────────────────────────────────
    @property
    def config(self) -> AgentConfig:
        return self._cfg

    def save(self) -> None:
        """Persist current config to .env and state file."""
        self._write_env()
        self._write_state()

    def set_server_url(self, url: str) -> None:
        self._cfg.server_url = url.rstrip("/")
        self.save()

    def set_device_name(self, name: str) -> None:
        self._cfg.device_name = name.strip()
        self.save()

    def set_auth_token(self, token: str) -> None:
        self._cfg.auth_token = token
        self._cfg.paired = bool(token)
        self._write_state()  # token only in state file (gitignored), not .env

    def set_paired(self, paired: bool) -> None:
        self._cfg.paired = paired
        self._write_state()

    # ── Internal ──────────────────────────────────────────────────────────────
    def _load(self) -> AgentConfig:
        cfg = AgentConfig()
        # Read .env values first
        env_server_url = os.getenv("SERVER_URL", "")
        cfg.server_url  = env_server_url
        cfg.device_id   = os.getenv("DEVICE_ID", cfg.device_id)
        cfg.device_name = os.getenv("DEVICE_NAME", cfg.device_name)
        cfg.telemetry_interval = float(os.getenv("TELEMETRY_INTERVAL", "2"))
        cfg.log_level = os.getenv("LOG_LEVEL", "INFO")

        # Load mutable state from JSON (auth_token only; server_url from .env wins)
        if _STATE_FILE.exists():
            try:
                state = json.loads(_STATE_FILE.read_text(encoding="utf-8"))
                cfg.auth_token  = state.get("auth_token", "")
                cfg.paired      = bool(cfg.auth_token)
                cfg.device_id   = state.get("device_id", cfg.device_id)
                cfg.device_name = state.get("device_name", cfg.device_name)
                # Only use state server_url if .env didn't provide one
                if not env_server_url:
                    cfg.server_url = state.get("server_url", cfg.server_url)
            except Exception:
                pass
        return cfg

    def _write_env(self) -> None:
        """Write non-sensitive fields to .env."""
        pairs = {
            "SERVER_URL": self._cfg.server_url,
            "DEVICE_ID": self._cfg.device_id,
            "DEVICE_NAME": self._cfg.device_name,
            "TELEMETRY_INTERVAL": str(self._cfg.telemetry_interval),
            "LOG_LEVEL": self._cfg.log_level,
        }
        for k, v in pairs.items():
            set_key(str(_ENV_FILE), k, v)

    def _write_state(self) -> None:
        """Write full config (including token) to local JSON — keep out of git."""
        state = {
            "server_url": self._cfg.server_url,
            "device_id": self._cfg.device_id,
            "device_name": self._cfg.device_name,
            "auth_token": self._cfg.auth_token,
            "paired": self._cfg.paired,
        }
        _STATE_FILE.write_text(
            json.dumps(state, indent=2), encoding="utf-8"
        )
        # Restrict file permissions on Windows where possible
        try:
            import stat
            _STATE_FILE.chmod(stat.S_IRUSR | stat.S_IWUSR)
        except Exception:
            pass


# Singleton
_manager: Optional[ConfigManager] = None


def get_config_manager() -> ConfigManager:
    global _manager
    if _manager is None:
        _manager = ConfigManager()
    return _manager


def get_config() -> AgentConfig:
    return get_config_manager().config
