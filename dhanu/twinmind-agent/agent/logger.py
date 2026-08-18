"""
agent/logger.py
Safe rotating logger for TwinMind Agent.
Never logs passwords, tokens, or private data.
"""
from __future__ import annotations

import logging
import os
import re
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

try:
    import colorlog  # type: ignore
    _HAS_COLOR = True
except ImportError:
    _HAS_COLOR = False

# ──────────────────────────────────────────────────────────────────────────────
# Sensitive-data scrubber
# ──────────────────────────────────────────────────────────────────────────────
_REDACT_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r'(?i)(auth_token|token|password|secret|key|credential)\s*[=:]\s*\S+'),
     r'\1=[REDACTED]'),
    (re.compile(r'Bearer\s+\S+'),
     'Bearer [REDACTED]'),
    (re.compile(r'(?i)(Authorization):\s*\S+'),
     r'\1: [REDACTED]'),
]


def _scrub(msg: str) -> str:
    for pat, repl in _REDACT_PATTERNS:
        msg = pat.sub(repl, msg)
    return msg


class _ScrubFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = _scrub(str(record.msg))
        if record.args:
            try:
                record.args = tuple(_scrub(str(a)) for a in record.args)
            except Exception:
                record.args = ()
        return True


# ──────────────────────────────────────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────────────────────────────────────
_LOG_DIR = Path(__file__).parent.parent / "logs"
_LOG_DIR.mkdir(exist_ok=True)
_LOG_FILE = _LOG_DIR / "twinmind-agent.log"

_CONSOLE_FMT = "%(asctime)s %(levelname)-8s %(name)s — %(message)s"
_FILE_FMT    = "%(asctime)s %(levelname)-8s %(name)s [%(filename)s:%(lineno)d] — %(message)s"
_DATE_FMT    = "%Y-%m-%d %H:%M:%S"


def get_logger(name: str = "twinmind") -> logging.Logger:
    """Return a configured logger for the given component name."""
    log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    logger = logging.getLogger(name)
    if logger.handlers:
        return logger  # already configured

    logger.setLevel(log_level)
    logger.addFilter(_ScrubFilter())

    # ── File handler ──────────────────────────────────────────────────────────
    file_handler = RotatingFileHandler(
        _LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(logging.Formatter(_FILE_FMT, datefmt=_DATE_FMT))
    file_handler.addFilter(_ScrubFilter())

    # ── Console handler ───────────────────────────────────────────────────────
    if _HAS_COLOR:
        console_handler = colorlog.StreamHandler(sys.stdout)
        console_handler.setFormatter(
            colorlog.ColoredFormatter(
                "%(log_color)s" + _CONSOLE_FMT,
                datefmt=_DATE_FMT,
                log_colors={
                    "DEBUG":    "cyan",
                    "INFO":     "white",
                    "WARNING":  "yellow",
                    "ERROR":    "red",
                    "CRITICAL": "bold_red",
                },
            )
        )
    else:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(_CONSOLE_FMT, datefmt=_DATE_FMT))
    console_handler.setLevel(log_level)
    console_handler.addFilter(_ScrubFilter())

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    logger.propagate = False
    return logger
