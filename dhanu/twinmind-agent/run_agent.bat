@echo off
setlocal

rem Activate virtual environment
if not exist ".venv\Scripts\activate" (
    echo No virtual environment found. Creating one…
    python -m venv .venv
)

call .venv\Scripts\activate

rem Install dependencies if missing
.venv\Scripts\pip install -r requirements.txt --quiet

rem Launch the TwinMind agent
python agent\main.py
