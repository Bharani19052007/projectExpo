"""
ui/app.py
TwinMind AI Monitoring Agent — Main Tkinter Application.

Screens:
  1. SetupScreen   — server URL + device name + pairing
  2. ConsentScreen — explicit START MONITORING consent
  3. Dashboard     — live metrics, health score, alerts
"""
from __future__ import annotations

import asyncio
import threading
import time
import tkinter as tk
from tkinter import messagebox, scrolledtext
from typing import Any, Callable, Dict, Optional

from ui.styles import (
    Colors, Fonts, apply_dark_theme, make_button, make_card,
    make_entry, make_label, make_separator, metric_color,
    risk_color, score_color
)

# ── Try system tray ───────────────────────────────────────────────────────────
try:
    import pystray                          # type: ignore
    from PIL import Image, ImageDraw        # type: ignore
    _HAS_TRAY = True
except ImportError:
    _HAS_TRAY = False


# ─────────────────────────────────────────────────────────────────────────────
# Helper: animated pulsing dot canvas
# ─────────────────────────────────────────────────────────────────────────────

class PulseDot(tk.Canvas):
    """Animated pulsing status dot."""

    def __init__(self, parent, color: str = Colors.STATUS_GREEN, size: int = 12, **kw):
        super().__init__(parent, width=size + 6, height=size + 6,
                         bg=Colors.BG_PANEL, highlightthickness=0, **kw)
        self._color = color
        self._size = size
        self._alpha = 1.0
        self._growing = False
        self._dot = self.create_oval(3, 3, size + 3, size + 3, fill=color, outline="")
        self._animate()

    def _animate(self):
        if self._growing:
            self._alpha = min(1.0, self._alpha + 0.05)
        else:
            self._alpha = max(0.4, self._alpha - 0.05)
        if self._alpha >= 1.0:
            self._growing = False
        elif self._alpha <= 0.4:
            self._growing = True
        # Simulate opacity by interpolating color toward background
        r1, g1, b1 = self.winfo_rgb(self._color)
        r2, g2, b2 = self.winfo_rgb(Colors.BG_PANEL)
        r = int(r1 * self._alpha + r2 * (1 - self._alpha)) >> 8
        g = int(g1 * self._alpha + g2 * (1 - self._alpha)) >> 8
        b = int(b1 * self._alpha + b2 * (1 - self._alpha)) >> 8
        blended = f"#{r:02x}{g:02x}{b:02x}"
        self.itemconfig(self._dot, fill=blended)
        self.after(60, self._animate)

    def set_color(self, color: str):
        self._color = color
        self.itemconfig(self._dot, fill=color)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: metric row (label + bar + value)
# ─────────────────────────────────────────────────────────────────────────────

class MetricRow(tk.Frame):
    def __init__(self, parent, label: str, unit: str = "%", **kw):
        super().__init__(parent, bg=Colors.BG_PANEL, **kw)
        self._unit = unit

        lbl = tk.Label(self, text=label, font=Fonts.BODY_BOLD,
                       fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL,
                       width=9, anchor="w")
        lbl.pack(side="left", padx=(0, 8))

        # Canvas bar
        self._bar_bg = tk.Canvas(self, width=160, height=10,
                                  bg=Colors.BG_PANEL2, highlightthickness=0)
        self._bar_bg.pack(side="left", padx=(0, 8))
        self._bar = self._bar_bg.create_rectangle(0, 0, 0, 10, fill=Colors.ACCENT_BLUE, width=0)

        self._val_lbl = tk.Label(self, text="—", font=Fonts.MONO,
                                  fg=Colors.ACCENT_CYAN, bg=Colors.BG_PANEL,
                                  width=8, anchor="e")
        self._val_lbl.pack(side="left")

    def update(self, value: Optional[float], text: Optional[str] = None):
        if value is None:
            self._val_lbl.config(text="N/A", fg=Colors.STATUS_GRAY)
            self._bar_bg.coords(self._bar, 0, 0, 0, 10)
            return
        display = text if text is not None else f"{value:.0f}{self._unit}"
        color = metric_color(value)
        self._val_lbl.config(text=display, fg=color)
        bar_w = int(160 * min(value, 100) / 100)
        self._bar_bg.coords(self._bar, 0, 0, bar_w, 10)
        self._bar_bg.itemconfig(self._bar, fill=color)


# ─────────────────────────────────────────────────────────────────────────────
# Screen 1: Setup
# ─────────────────────────────────────────────────────────────────────────────

class SetupScreen(tk.Frame):
    def __init__(self, parent, config_mgr, on_proceed: Callable):
        super().__init__(parent, bg=Colors.BG_DARK)
        self._cfg = config_mgr
        self._on_proceed = on_proceed
        self._build()

    def _build(self):
        cfg = self._cfg.config

        # Header
        header = tk.Frame(self, bg=Colors.BG_PANEL, pady=20)
        header.pack(fill="x")
        tk.Label(header, text="⬡ TwinMind AI", font=Fonts.TITLE_LARGE,
                 fg=Colors.ACCENT_CYAN, bg=Colors.BG_PANEL).pack()
        tk.Label(header, text="Endpoint Monitoring Agent — Laptop B Setup",
                 font=Fonts.BODY, fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL).pack(pady=(4, 0))

        # Body
        body = tk.Frame(self, bg=Colors.BG_DARK, pady=20, padx=40)
        body.pack(fill="both", expand=True)

        # ── Server URL ────────────────────────────────────────────────────────
        make_label(body, "TwinMind Server Address (Laptop A)", font=Fonts.SUBTITLE,
                   fg=Colors.TEXT_ACCENT).pack(anchor="w", pady=(16, 4))
        make_label(body, "Enter the IP address and port of your TwinMind server:",
                   fg=Colors.TEXT_SECONDARY).pack(anchor="w")

        self._url_var = tk.StringVar(value=cfg.server_url or "http://192.168.1.10:8000")
        url_entry = make_entry(body, textvariable=self._url_var, width=40)
        url_entry.pack(anchor="w", pady=(4, 0))

        make_separator(body).pack(fill="x", pady=16)

        # ── Device Name ───────────────────────────────────────────────────────
        make_label(body, "Device Name", font=Fonts.SUBTITLE,
                   fg=Colors.TEXT_ACCENT).pack(anchor="w", pady=(0, 4))
        self._name_var = tk.StringVar(value=cfg.device_name)
        name_entry = make_entry(body, textvariable=self._name_var, width=40)
        name_entry.pack(anchor="w", pady=(0, 4))

        make_separator(body).pack(fill="x", pady=16)

        # ── Device ID ─────────────────────────────────────────────────────────
        make_label(body, "Device ID  (auto-generated)", font=Fonts.SUBTITLE,
                   fg=Colors.TEXT_ACCENT).pack(anchor="w", pady=(0, 4))
        id_frame = tk.Frame(body, bg=Colors.BG_INPUT, pady=10, padx=14)
        id_frame.pack(anchor="w", fill="x")
        tk.Label(id_frame, text=cfg.device_id, font=Fonts.MONO_LARGE,
                 fg=Colors.ACCENT_CYAN, bg=Colors.BG_INPUT).pack(side="left")

        make_separator(body).pack(fill="x", pady=16)

        # ── Status ────────────────────────────────────────────────────────────
        self._status_var = tk.StringVar(value="")
        self._status_lbl = tk.Label(body, textvariable=self._status_var,
                                    font=Fonts.SMALL, fg=Colors.STATUS_YELLOW,
                                    bg=Colors.BG_DARK, wraplength=480, justify="left")
        self._status_lbl.pack(anchor="w", pady=(0, 8))

        # ── Buttons ───────────────────────────────────────────────────────────
        btn_frame = tk.Frame(body, bg=Colors.BG_DARK)
        btn_frame.pack(anchor="w")

        self._pair_btn = make_button(btn_frame, "Test & Pair Device",
                                     command=self._start_pairing,
                                     bg=Colors.ACCENT_BLUE, width=22)
        self._pair_btn.pack(side="left", padx=(0, 12))

        self._skip_btn = make_button(btn_frame, "Skip Pairing (Offline)",
                                     command=self._skip_pairing,
                                     bg=Colors.BG_PANEL2, width=22)
        self._skip_btn.pack(side="left")

    def _set_status(self, msg: str, color: str = Colors.STATUS_YELLOW):
        self._status_var.set(msg)
        self._status_lbl.config(fg=color)
        self.update_idletasks()

    def _start_pairing(self):
        url = self._url_var.get().strip()
        name = self._name_var.get().strip()
        if not url:
            self._set_status("Please enter the server URL.", Colors.STATUS_RED)
            return
        if not name:
            self._set_status("Please enter a device name.", Colors.STATUS_RED)
            return

        self._cfg.set_server_url(url)
        self._cfg.set_device_name(name)
        self._pair_btn.config(state="disabled", text="Pairing…")
        self._set_status("Connecting to TwinMind server…")

        def run():
            from agent.security.pairing import PairingManager
            mgr = PairingManager(
                self._cfg,
                on_status=lambda m: self.after(0, lambda: self._set_status(m)),
                on_paired=lambda token: self.after(0, self._on_paired),
            )
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            success = loop.run_until_complete(mgr.start_pairing())
            loop.close()
            if not success:
                self.after(0, lambda: self._pair_btn.config(state="normal", text="Test & Pair Device"))

        threading.Thread(target=run, daemon=True).start()

    def _on_paired(self):
        self._set_status("✓ Device paired successfully!", Colors.STATUS_GREEN)
        self.after(1200, self._on_proceed)

    def _skip_pairing(self):
        url = self._url_var.get().strip()
        name = self._name_var.get().strip()
        if url:
            self._cfg.set_server_url(url)
        if name:
            self._cfg.set_device_name(name)
        self._on_proceed()


# ─────────────────────────────────────────────────────────────────────────────
# Screen 2: Consent
# ─────────────────────────────────────────────────────────────────────────────

class ConsentScreen(tk.Frame):
    def __init__(self, parent, on_consent: Callable):
        super().__init__(parent, bg=Colors.BG_DARK)
        self._on_consent = on_consent
        self._build()

    def _build(self):
        # Header
        header = tk.Frame(self, bg=Colors.BG_PANEL, pady=20)
        header.pack(fill="x")
        tk.Label(header, text="⬡ TwinMind AI Monitoring",
                 font=Fonts.TITLE_LARGE, fg=Colors.ACCENT_CYAN, bg=Colors.BG_PANEL).pack()

        # Body
        body = tk.Frame(self, bg=Colors.BG_DARK, padx=50, pady=20)
        body.pack(fill="both", expand=True)

        make_label(body,
                   "This agent collects system-health information from this laptop\n"
                   "to provide real-time device monitoring and Digital Twin analytics.",
                   font=Fonts.BODY, fg=Colors.TEXT_PRIMARY).pack(pady=(12, 16))

        # Collected
        coll_card = make_card(body)
        coll_card.pack(fill="x", pady=(0, 8))
        tk.Label(coll_card, text="  ✓  Collected:", font=Fonts.SUBTITLE,
                 fg=Colors.STATUS_GREEN, bg=Colors.BG_PANEL, anchor="w").pack(fill="x", padx=12, pady=(8, 2))
        tk.Label(coll_card,
                 text="  CPU, RAM, GPU, storage, battery, network and system-health telemetry.",
                 font=Fonts.BODY, fg=Colors.TEXT_PRIMARY, bg=Colors.BG_PANEL,
                 anchor="w", justify="left").pack(fill="x", padx=12, pady=(0, 10))

        # Not collected
        not_card = make_card(body)
        not_card.pack(fill="x", pady=(0, 20))
        tk.Label(not_card, text="  ✗  Not collected:", font=Fonts.SUBTITLE,
                 fg=Colors.STATUS_RED, bg=Colors.BG_PANEL, anchor="w").pack(fill="x", padx=12, pady=(8, 2))
        tk.Label(not_card,
                 text="  Passwords, keystrokes, screenshots, webcam, microphone,\n"
                      "  personal documents, browser history or private messages.",
                 font=Fonts.BODY, fg=Colors.TEXT_PRIMARY, bg=Colors.BG_PANEL,
                 anchor="w", justify="left").pack(fill="x", padx=12, pady=(0, 10))

        make_separator(body).pack(fill="x", pady=8)

        start_btn = make_button(
            body,
            "▶  START MONITORING",
            command=self._on_consent,
            bg=Colors.STATUS_GREEN,
            width=28,
            pady=12,
            font=Fonts.TITLE,
        )
        start_btn.pack(pady=16)


# ─────────────────────────────────────────────────────────────────────────────
# Screen 3: Live Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class DashboardScreen(tk.Frame):
    def __init__(self, parent, config_mgr, agent_controller, **kw):
        super().__init__(parent, bg=Colors.BG_DARK, **kw)
        self._cfg = config_mgr.config
        self._ctrl = agent_controller
        self._alert_text: str = "No active problems"
        self._anomaly_text: str = ""
        self._build()

    def _build(self):
        cfg = self._cfg
        # ── Header ────────────────────────────────────────────────────────────
        hdr = tk.Frame(self, bg=Colors.BG_PANEL, pady=8)
        hdr.pack(fill="x")
        hdr_inner = tk.Frame(hdr, bg=Colors.BG_PANEL)
        hdr_inner.pack()
        tk.Label(hdr_inner, text="⬡ TwinMind AI", font=Fonts.TITLE,
                 fg=Colors.ACCENT_CYAN, bg=Colors.BG_PANEL).pack(side="left", padx=(0, 20))
        tk.Label(hdr_inner, text="Monitoring Agent", font=Fonts.BODY,
                 fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL).pack(side="left")

        # ── Main layout: left panel + right panel ─────────────────────────────
        main = tk.Frame(self, bg=Colors.BG_DARK)
        main.pack(fill="both", expand=True, padx=16, pady=12)

        left = tk.Frame(main, bg=Colors.BG_DARK)
        left.pack(side="left", fill="both", expand=False, padx=(0, 12))

        right = tk.Frame(main, bg=Colors.BG_DARK)
        right.pack(side="left", fill="both", expand=True)

        # ── LEFT: Device info ─────────────────────────────────────────────────
        dev_card = make_card(left)
        dev_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(dev_card, "DEVICE")
        tk.Label(dev_card, text=cfg.device_name, font=Fonts.SUBTITLE,
                 fg=Colors.TEXT_PRIMARY, bg=Colors.BG_PANEL).pack(anchor="w", padx=12)
        tk.Label(dev_card, text=cfg.device_id, font=Fonts.MONO,
                 fg=Colors.ACCENT_CYAN, bg=Colors.BG_PANEL).pack(anchor="w", padx=12, pady=(0, 10))

        # ── LEFT: Monitoring status ───────────────────────────────────────────
        mon_card = make_card(left)
        mon_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(mon_card, "MONITORING")
        mon_inner = tk.Frame(mon_card, bg=Colors.BG_PANEL)
        mon_inner.pack(anchor="w", padx=12, pady=(4, 10))
        self._pulse = PulseDot(mon_inner, color=Colors.STATUS_GREEN)
        self._pulse.pack(side="left", padx=(0, 8))
        self._mon_lbl = tk.Label(mon_inner, text="MONITORING ACTIVE",
                                  font=Fonts.BODY_BOLD, fg=Colors.STATUS_GREEN,
                                  bg=Colors.BG_PANEL)
        self._mon_lbl.pack(side="left")

        # ── LEFT: Connection ──────────────────────────────────────────────────
        conn_card = make_card(left)
        conn_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(conn_card, "TWINMIND SERVER")
        conn_inner = tk.Frame(conn_card, bg=Colors.BG_PANEL)
        conn_inner.pack(anchor="w", padx=12, pady=(0, 4))
        self._conn_dot = PulseDot(conn_inner, color=Colors.STATUS_GRAY)
        self._conn_dot.pack(side="left", padx=(0, 6))
        self._conn_lbl = tk.Label(conn_inner, text="CONNECTING…",
                                   font=Fonts.BODY_BOLD, fg=Colors.STATUS_GRAY,
                                   bg=Colors.BG_PANEL)
        self._conn_lbl.pack(side="left")
        self._server_lbl = tk.Label(conn_card, text=cfg.server_url or "Not configured",
                                     font=Fonts.SMALL, fg=Colors.TEXT_SECONDARY,
                                     bg=Colors.BG_PANEL)
        self._server_lbl.pack(anchor="w", padx=12, pady=(0, 10))

        # ── LEFT: Health Score ────────────────────────────────────────────────
        score_card = make_card(left)
        score_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(score_card, "DEVICE HEALTH")
        self._score_lbl = tk.Label(score_card, text="—",
                                    font=Fonts.SCORE_FONT,
                                    fg=Colors.ACCENT_CYAN, bg=Colors.BG_PANEL)
        self._score_lbl.pack(anchor="w", padx=12)
        self._score_status = tk.Label(score_card, text="Initializing…",
                                       font=Fonts.BODY_BOLD,
                                       fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL)
        self._score_status.pack(anchor="w", padx=12, pady=(0, 10))

        # ── RIGHT: Live Metrics ───────────────────────────────────────────────
        metrics_card = make_card(right)
        metrics_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(metrics_card, "LIVE METRICS")
        metrics_body = tk.Frame(metrics_card, bg=Colors.BG_PANEL, padx=12, pady=8)
        metrics_body.pack(fill="x")
        self._m_cpu  = MetricRow(metrics_body, "CPU")
        self._m_cpu.pack(anchor="w", pady=3)
        self._m_ram  = MetricRow(metrics_body, "RAM")
        self._m_ram.pack(anchor="w", pady=3)
        self._m_gpu  = MetricRow(metrics_body, "GPU")
        self._m_gpu.pack(anchor="w", pady=3)
        self._m_disk = MetricRow(metrics_body, "DISK")
        self._m_disk.pack(anchor="w", pady=3)
        self._m_bat  = MetricRow(metrics_body, "BATTERY")
        self._m_bat.pack(anchor="w", pady=3)
        self._m_net  = MetricRow(metrics_body, "LATENCY", unit=" ms")
        self._m_net.pack(anchor="w", pady=3)

        # ── RIGHT: System info row ────────────────────────────────────────────
        sys_card = make_card(right)
        sys_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(sys_card, "SYSTEM")
        sys_inner = tk.Frame(sys_card, bg=Colors.BG_PANEL, padx=12, pady=8)
        sys_inner.pack(fill="x")
        self._sys_os_lbl   = tk.Label(sys_inner, text="OS: —", font=Fonts.SMALL,
                                       fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL, anchor="w")
        self._sys_os_lbl.pack(anchor="w")
        self._sys_up_lbl   = tk.Label(sys_inner, text="Uptime: —", font=Fonts.SMALL,
                                       fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL, anchor="w")
        self._sys_up_lbl.pack(anchor="w")
        self._sys_cpu_lbl  = tk.Label(sys_inner, text="CPU Model: —", font=Fonts.SMALL,
                                       fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL, anchor="w")
        self._sys_cpu_lbl.pack(anchor="w", pady=(0, 4))

        # ── RIGHT: Alerts ─────────────────────────────────────────────────────
        alert_card = make_card(right)
        alert_card.pack(fill="x", pady=(0, 10))
        self._build_card_header(alert_card, "LATEST ALERT")
        self._alert_lbl = tk.Label(alert_card, text="No active problems",
                                    font=Fonts.BODY, fg=Colors.STATUS_GREEN,
                                    bg=Colors.BG_PANEL, wraplength=380, justify="left",
                                    anchor="w")
        self._alert_lbl.pack(anchor="w", padx=12, pady=(0, 10))

        # ── RIGHT: Anomaly detection ──────────────────────────────────────────
        anom_card = make_card(right)
        anom_card.pack(fill="x")
        self._build_card_header(anom_card, "AI ANOMALY DETECTION")
        self._anom_lbl = tk.Label(anom_card, text="Monitoring… No anomalies detected.",
                                   font=Fonts.BODY, fg=Colors.STATUS_GREEN,
                                   bg=Colors.BG_PANEL, wraplength=380, justify="left",
                                   anchor="w")
        self._anom_lbl.pack(anchor="w", padx=12, pady=(0, 10))

        # ── Controls bar ──────────────────────────────────────────────────────
        ctrl_bar = tk.Frame(self, bg=Colors.BG_PANEL2, pady=8)
        ctrl_bar.pack(fill="x", side="bottom")
        tk.Label(ctrl_bar, text="", bg=Colors.BG_PANEL2).pack(side="left", expand=True)
        self._pause_btn = make_button(ctrl_bar, "⏸ Pause", command=self._toggle_pause,
                                      bg=Colors.BG_PANEL, width=12, pady=4)
        self._pause_btn.pack(side="left", padx=6)
        make_button(ctrl_bar, "Settings", command=self._open_settings,
                    bg=Colors.BG_PANEL, width=12, pady=4).pack(side="left", padx=6)
        tk.Label(ctrl_bar, text="", bg=Colors.BG_PANEL2).pack(side="left", expand=True)

        self._paused = False

    def _build_card_header(self, parent, title: str):
        hdr = tk.Frame(parent, bg=Colors.BORDER_ACTIVE, height=2)
        hdr.pack(fill="x")
        tk.Label(parent, text=title, font=Fonts.SMALL,
                 fg=Colors.TEXT_SECONDARY, bg=Colors.BG_PANEL).pack(
            anchor="w", padx=12, pady=(6, 2))

    # ── Public update methods (called from main thread via .after()) ───────────

    def update_metrics(self, data: Dict[str, Any]):
        """Update all dashboard widgets with fresh telemetry data."""
        try:
            cpu = data.get("cpu", {})
            mem = data.get("memory", {})
            gpu = data.get("gpu", {})
            storage = data.get("storage", {})
            bat = data.get("battery", {})
            net = data.get("network", {})
            health = data.get("health", {})
            sys_d = data.get("system", {})

            # Metrics
            self._m_cpu.update(cpu.get("usage"))
            self._m_ram.update(mem.get("usage"))

            gpu_usage = gpu.get("usage") if gpu.get("available") else None
            self._m_gpu.update(gpu_usage, text="N/A" if gpu_usage is None else f"{gpu_usage:.0f}%")

            disks = storage.get("disks", [])
            max_disk = max((d.get("usage", 0) for d in disks), default=None)
            self._m_disk.update(max_disk)

            bat_pct = bat.get("percent") if bat.get("available") else None
            if bat_pct is not None:
                charging_str = " ⚡" if bat.get("charging") else ""
                self._m_bat.update(bat_pct, text=f"{bat_pct:.0f}%{charging_str}")
            else:
                self._m_bat.update(None, text="N/A")

            latency = net.get("latency_ms")
            if latency is not None:
                self._m_net.update(min(latency, 100) if latency < 500 else 100,
                                    text=f"{latency:.0f} ms")
            else:
                self._m_net.update(None, text="N/A")

            # Health score
            score = health.get("score")
            label = health.get("label", "")
            if score is not None:
                color = score_color(int(score))
                self._score_lbl.config(text=f"{score} / 100", fg=color)
                self._score_status.config(text=label, fg=color)

            # System
            if sys_d:
                self._sys_os_lbl.config(text=f"OS: {sys_d.get('os', '—')}")
                self._sys_up_lbl.config(text=f"Uptime: {sys_d.get('uptime', '—')}")

            cpu_model = cpu.get("model", "")
            if cpu_model:
                short = cpu_model[:50] + "…" if len(cpu_model) > 50 else cpu_model
                self._sys_cpu_lbl.config(text=f"CPU: {short}")

        except Exception:
            pass

    def update_alert(self, text: str, color: str = Colors.STATUS_GREEN):
        self._alert_lbl.config(text=text, fg=color)

    def update_anomaly(self, report):
        if not report or not report.anomalies:
            self._anom_lbl.config(
                text="No anomalies detected.",
                fg=Colors.STATUS_GREEN
            )
            return
        top = max(report.anomalies, key=lambda a: a.anomaly_score)
        risk_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        color = risk_color(top.risk_level)
        text = (
            f"⚠ {top.risk_level} RISK\n"
            f"{top.problem}\n"
            f"Confidence: {top.confidence_percent}%\n"
            f"→ {top.recommendation}"
        )
        self._anom_lbl.config(text=text, fg=color)

    def update_connection(self, connected: bool, message: str = ""):
        if connected:
            self._conn_lbl.config(text="CONNECTED", fg=Colors.STATUS_GREEN)
            self._conn_dot.set_color(Colors.STATUS_GREEN)
        else:
            self._conn_lbl.config(text=message or "OFFLINE", fg=Colors.STATUS_RED)
            self._conn_dot.set_color(Colors.STATUS_RED)

    def update_monitoring_status(self, active: bool):
        if active:
            self._mon_lbl.config(text="MONITORING ACTIVE", fg=Colors.STATUS_GREEN)
            self._pulse.set_color(Colors.STATUS_GREEN)
        else:
            self._mon_lbl.config(text="MONITORING PAUSED", fg=Colors.STATUS_YELLOW)
            self._pulse.set_color(Colors.STATUS_YELLOW)

    def _toggle_pause(self):
        self._paused = not self._paused
        if self._paused:
            self._pause_btn.config(text="▶ Resume")
            self.update_monitoring_status(False)
            if self._ctrl:
                self._ctrl.pause()
        else:
            self._pause_btn.config(text="⏸ Pause")
            self.update_monitoring_status(True)
            if self._ctrl:
                self._ctrl.resume()

    def _open_settings(self):
        win = tk.Toplevel(self)
        win.title("TwinMind — Settings")
        win.configure(bg=Colors.BG_DARK)
        win.geometry("420x260")
        apply_dark_theme(win)
        make_label(win, "Settings", font=Fonts.TITLE, fg=Colors.ACCENT_CYAN).pack(pady=16)
        make_label(win, "Log file: logs/twinmind-agent.log", fg=Colors.TEXT_SECONDARY).pack(padx=20, anchor="w")
        make_label(win, f"Buffer: {__import__('agent.local_db', fromlist=['get_buffer']).get_buffer().count()} rows",
                   fg=Colors.TEXT_SECONDARY).pack(padx=20, anchor="w")
        make_label(win, f"Telemetry interval: {self._ctrl._interval}s" if self._ctrl else "",
                   fg=Colors.TEXT_SECONDARY).pack(padx=20, anchor="w")
        make_button(win, "Close", command=win.destroy, width=14).pack(pady=20)


# ─────────────────────────────────────────────────────────────────────────────
# Main Application Window
# ─────────────────────────────────────────────────────────────────────────────

class TwinMindApp:
    """Root Tkinter application that manages screen transitions."""

    def __init__(self, config_mgr, agent_controller):
        self._cfg_mgr = config_mgr
        self._ctrl    = agent_controller

        self._root = tk.Tk()
        self._root.title("TwinMind AI — Monitoring Agent")
        self._root.geometry("880x600")
        self._root.minsize(780, 540)
        apply_dark_theme(self._root)
        self._root.protocol("WM_DELETE_WINDOW", self._on_close)

        # Set window icon (generated programmatically)
        self._set_icon()

        self._current_frame: Optional[tk.Frame] = None
        self._dashboard: Optional[DashboardScreen] = None
        self._tray_icon = None

        # Start on correct screen
        cfg = config_mgr.config
        if cfg.paired or cfg.server_url:
            self._show_consent()
        else:
            self._show_setup()

    def _set_icon(self):
        try:
            from PIL import Image, ImageDraw, ImageTk
            img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
            d = ImageDraw.Draw(img)
            d.ellipse([2, 2, 30, 30], fill="#2D9CDB")
            d.polygon([(16, 6), (26, 22), (6, 22)], fill="white")
            self._icon_img = ImageTk.PhotoImage(img)
            self._root.iconphoto(True, self._icon_img)
        except Exception:
            pass

    # ── Screen transitions ─────────────────────────────────────────────────────

    def _switch_to(self, frame: tk.Frame):
        if self._current_frame:
            self._current_frame.pack_forget()
        self._current_frame = frame
        frame.pack(fill="both", expand=True)

    def _show_setup(self):
        f = SetupScreen(self._root, self._cfg_mgr, self._show_consent)
        self._switch_to(f)

    def _show_consent(self):
        f = ConsentScreen(self._root, self._start_monitoring)
        self._switch_to(f)

    def _start_monitoring(self):
        dash = DashboardScreen(self._root, self._cfg_mgr, self._ctrl)
        self._dashboard = dash
        self._switch_to(dash)
        self._ctrl.set_dashboard(dash)
        self._ctrl.start()
        self._setup_tray()

    # ── Tray ──────────────────────────────────────────────────────────────────

    def _setup_tray(self):
        if not _HAS_TRAY:
            return
        try:
            icon_img = self._make_tray_image()
            menu = pystray.Menu(
                pystray.MenuItem("Open Agent",      self._tray_open, default=True),
                pystray.MenuItem("Pause Monitoring", self._tray_pause),
                pystray.MenuItem("Resume Monitoring", self._tray_resume),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Connection Status", self._tray_status),
                pystray.MenuItem("Settings",         self._tray_settings),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Exit",             self._tray_exit),
            )
            self._tray_icon = pystray.Icon("twinmind", icon_img,
                                           "TwinMind AI\n🟢 Monitoring Active", menu)
            threading.Thread(target=self._tray_icon.run, daemon=True).start()
            self._root.protocol("WM_DELETE_WINDOW", self._minimize_to_tray)
        except Exception:
            pass

    def _make_tray_image(self) -> "Image":
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.ellipse([4, 4, 60, 60], fill="#0D1117")
        d.ellipse([6, 6, 58, 58], fill="#2D9CDB")
        d.polygon([(32, 12), (52, 48), (12, 48)], fill="white")
        d.ellipse([28, 35, 36, 43], fill="#0D1117")
        return img

    def _minimize_to_tray(self):
        self._root.withdraw()

    def _tray_open(self, icon=None, item=None):
        self._root.after(0, self._root.deiconify)

    def _tray_pause(self, icon=None, item=None):
        if self._ctrl:
            self._root.after(0, self._ctrl.pause)

    def _tray_resume(self, icon=None, item=None):
        if self._ctrl:
            self._root.after(0, self._ctrl.resume)

    def _tray_status(self, icon=None, item=None):
        self._root.after(0, self._show_status_popup)

    def _show_status_popup(self):
        cfg = self._cfg_mgr.config
        messagebox.showinfo(
            "TwinMind Connection Status",
            f"Device: {cfg.device_name}\n"
            f"ID: {cfg.device_id}\n"
            f"Server: {cfg.server_url or 'Not configured'}\n"
            f"Paired: {'Yes' if cfg.paired else 'No'}"
        )

    def _tray_settings(self, icon=None, item=None):
        self._root.after(0, self._root.deiconify)

    def _tray_exit(self, icon=None, item=None):
        if self._ctrl:
            self._ctrl.stop()
        if self._tray_icon:
            self._tray_icon.stop()
        self._root.after(0, self._root.destroy)

    def _on_close(self):
        if _HAS_TRAY and self._tray_icon:
            self._minimize_to_tray()
        else:
            if messagebox.askyesno("Exit", "Stop monitoring and exit TwinMind Agent?"):
                if self._ctrl:
                    self._ctrl.stop()
                self._root.destroy()

    # ── Run ───────────────────────────────────────────────────────────────────

    def run(self):
        self._root.mainloop()
