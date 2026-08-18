"""
ui/styles.py
TwinMind AI color palette, fonts, and Tkinter style helpers.
Light-blue / dark corporate visual theme.
"""
from __future__ import annotations

import tkinter as tk
from tkinter import ttk


# ── Color Palette ─────────────────────────────────────────────────────────────

class Colors:
    # Backgrounds
    BG_DARK        = "#0D1117"    # main window background
    BG_PANEL       = "#161B22"    # panel / card background
    BG_PANEL2      = "#1C2230"    # secondary panel
    BG_INPUT       = "#21262D"    # input fields

    # Accent
    ACCENT_BLUE    = "#2D9CDB"    # primary TwinMind blue
    ACCENT_CYAN    = "#56CCF2"    # highlight / active
    ACCENT_TEAL    = "#1F6FA0"    # darker blue for hover

    # Status
    STATUS_GREEN   = "#27AE60"    # online / healthy
    STATUS_YELLOW  = "#F2C94C"    # warning
    STATUS_ORANGE  = "#F2994A"    # medium risk
    STATUS_RED     = "#EB5757"    # critical / error
    STATUS_GRAY    = "#6B7280"    # offline / unavailable

    # Text
    TEXT_PRIMARY   = "#E6EDF3"    # main text
    TEXT_SECONDARY = "#8B949E"    # dim / subtitle
    TEXT_ACCENT    = "#56CCF2"    # highlighted label

    # Border
    BORDER         = "#30363D"    # card border
    BORDER_ACTIVE  = "#2D9CDB"    # active border

    # Score colors
    SCORE_HEALTHY  = "#27AE60"
    SCORE_GOOD     = "#56CCF2"
    SCORE_WARNING  = "#F2C94C"
    SCORE_CRITICAL = "#EB5757"


# ── Font Definitions ──────────────────────────────────────────────────────────

class Fonts:
    TITLE_LARGE  = ("Segoe UI", 20, "bold")
    TITLE        = ("Segoe UI", 15, "bold")
    SUBTITLE     = ("Segoe UI", 11, "bold")
    BODY         = ("Segoe UI", 10)
    BODY_BOLD    = ("Segoe UI", 10, "bold")
    SMALL        = ("Segoe UI", 9)
    MONO         = ("Consolas", 10)
    MONO_LARGE   = ("Consolas", 14, "bold")
    METRIC_VALUE = ("Consolas", 18, "bold")
    SCORE_FONT   = ("Consolas", 36, "bold")


# ── Score → color ─────────────────────────────────────────────────────────────

def score_color(score: int) -> str:
    if score >= 90:
        return Colors.SCORE_HEALTHY
    if score >= 75:
        return Colors.SCORE_GOOD
    if score >= 50:
        return Colors.SCORE_WARNING
    return Colors.SCORE_CRITICAL


def risk_color(risk: str) -> str:
    mapping = {
        "CRITICAL": Colors.STATUS_RED,
        "HIGH":     Colors.STATUS_ORANGE,
        "MEDIUM":   Colors.STATUS_YELLOW,
        "LOW":      Colors.ACCENT_CYAN,
        "NONE":     Colors.STATUS_GREEN,
        "UNKNOWN":  Colors.STATUS_GRAY,
    }
    return mapping.get(risk.upper(), Colors.STATUS_GRAY)


def metric_color(value: float, warn: float = 80, crit: float = 90) -> str:
    """Color-code a percentage metric."""
    if value >= crit:
        return Colors.STATUS_RED
    if value >= warn:
        return Colors.STATUS_YELLOW
    return Colors.ACCENT_CYAN


# ── Tkinter helpers ───────────────────────────────────────────────────────────

def apply_dark_theme(root: tk.Tk | tk.Toplevel) -> None:
    """Apply dark background to root window."""
    root.configure(bg=Colors.BG_DARK)


def make_label(
    parent,
    text: str = "",
    font=None,
    fg: str = Colors.TEXT_PRIMARY,
    bg: str = Colors.BG_DARK,
    anchor: str = "w",
    **kwargs,
) -> tk.Label:
    return tk.Label(
        parent, text=text, font=font or Fonts.BODY,
        fg=fg, bg=bg, anchor=anchor, **kwargs
    )


def make_button(
    parent,
    text: str,
    command=None,
    bg: str = Colors.ACCENT_BLUE,
    fg: str = Colors.TEXT_PRIMARY,
    font=None,
    width: int = 20,
    pady: int = 8,
    **kwargs,
) -> tk.Button:
    btn = tk.Button(
        parent,
        text=text,
        command=command,
        bg=bg,
        fg=fg,
        font=font or Fonts.BODY_BOLD,
        relief="flat",
        cursor="hand2",
        activebackground=Colors.ACCENT_TEAL,
        activeforeground=Colors.TEXT_PRIMARY,
        width=width,
        pady=pady,
        **kwargs,
    )
    # Hover effect
    btn.bind("<Enter>", lambda e: btn.config(bg=Colors.ACCENT_CYAN))
    btn.bind("<Leave>", lambda e: btn.config(bg=bg))
    return btn


def make_entry(
    parent,
    textvariable=None,
    font=None,
    width: int = 30,
    **kwargs,
) -> tk.Entry:
    return tk.Entry(
        parent,
        textvariable=textvariable,
        font=font or Fonts.BODY,
        bg=Colors.BG_INPUT,
        fg=Colors.TEXT_PRIMARY,
        insertbackground=Colors.ACCENT_CYAN,
        relief="flat",
        width=width,
        **kwargs,
    )


def make_card(parent, **kwargs) -> tk.Frame:
    """A styled card/panel frame."""
    return tk.Frame(
        parent,
        bg=Colors.BG_PANEL,
        relief="flat",
        **kwargs,
    )


def make_separator(parent, **kwargs) -> tk.Frame:
    return tk.Frame(parent, bg=Colors.BORDER, height=1, **kwargs)


def progress_bar_color(value: float) -> str:
    """Color for a progress bar given a 0–100 percent value."""
    if value >= 90:
        return Colors.STATUS_RED
    if value >= 80:
        return Colors.STATUS_YELLOW
    return Colors.ACCENT_BLUE
