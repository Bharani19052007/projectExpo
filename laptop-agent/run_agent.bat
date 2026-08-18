@echo off
title TwinMind-AI Laptop Agent Installer
echo ==================================================
echo       TwinMind-AI Laptop Telemetry Agent Setup
echo ==================================================
echo.

:: Check python is in Path
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in your system PATH.
    echo Please install Python 3.8+ and ensure "Add Python to PATH" is checked during setup.
    pause
    exit /b
)

:: Create Virtual Environment if not exists
if not exist venv (
    echo [Setup] Creating Python virtual environment in .\venv...
    python -m venv venv
)

:: Activate and install dependencies
echo [Setup] Installing/updating requirements from requirements.txt...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install python dependencies.
    pause
    exit /b
)

echo.
echo [Setup] Installation complete! Starting the Laptop Agent...
echo ==================================================
python agent.py
pause
