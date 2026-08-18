"""
agent/local_db.py
SQLite-backed offline telemetry buffer.
Stores up to MAX_ROWS rows; auto-purges oldest on overflow.
Thread-safe write, async-friendly read.
"""
from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any

_DB_PATH = Path(__file__).parent.parent / "buffer.db"
_MAX_ROWS = 500


class TelemetryBuffer:
    """Local SQLite buffer for offline telemetry storage and replay."""

    def __init__(self, db_path: Path = _DB_PATH, max_rows: int = _MAX_ROWS) -> None:
        self._db_path = db_path
        self._max_rows = max_rows
        self._lock = threading.Lock()
        self._init_db()

    # ── Setup ─────────────────────────────────────────────────────────────────
    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS telemetry (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    payload   TEXT NOT NULL
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_ts ON telemetry(timestamp)"
            )

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self._db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    # ── Write ─────────────────────────────────────────────────────────────────
    def store(self, payload: Dict[str, Any]) -> None:
        """Persist one telemetry payload; purge oldest if over limit."""
        with self._lock, self._connect() as conn:
            conn.execute(
                "INSERT INTO telemetry (timestamp, payload) VALUES (?, ?)",
                (
                    datetime.now(timezone.utc).isoformat(),
                    json.dumps(payload, default=str),
                ),
            )
            row_count = conn.execute("SELECT COUNT(*) FROM telemetry").fetchone()[0]
            if row_count > self._max_rows:
                excess = row_count - self._max_rows
                conn.execute(
                    "DELETE FROM telemetry WHERE id IN "
                    "(SELECT id FROM telemetry ORDER BY id ASC LIMIT ?)",
                    (excess,),
                )

    # ── Read ──────────────────────────────────────────────────────────────────
    def fetch_all(self) -> List[Dict[str, Any]]:
        """Return all buffered payloads ordered oldest-first."""
        with self._lock, self._connect() as conn:
            rows = conn.execute(
                "SELECT id, payload FROM telemetry ORDER BY id ASC"
            ).fetchall()
        return [{"_buffer_id": r["id"], **json.loads(r["payload"])} for r in rows]

    def delete(self, buffer_ids: List[int]) -> None:
        """Remove successfully delivered rows."""
        if not buffer_ids:
            return
        placeholders = ",".join("?" * len(buffer_ids))
        with self._lock, self._connect() as conn:
            conn.execute(
                f"DELETE FROM telemetry WHERE id IN ({placeholders})", buffer_ids
            )

    def clear_all(self) -> None:
        with self._lock, self._connect() as conn:
            conn.execute("DELETE FROM telemetry")

    def count(self) -> int:
        with self._lock, self._connect() as conn:
            return conn.execute("SELECT COUNT(*) FROM telemetry").fetchone()[0]


# Singleton
_buffer: TelemetryBuffer | None = None


def get_buffer() -> TelemetryBuffer:
    global _buffer
    if _buffer is None:
        _buffer = TelemetryBuffer()
    return _buffer
