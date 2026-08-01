@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion
title OnlineBank - Setup

echo ==========================================
echo   OnlineBank - First-Time Setup
echo ==========================================
echo.

set "NEED_RESTART=0"
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:: ---------------------------------------------------------------------------
:: Check Python
:: ---------------------------------------------------------------------------
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo       Python not found. Downloading Python 3.12...
    set "PY_INSTALLER=%TEMP%\python-installer.exe"
    powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe' -OutFile '%TEMP%\python-installer.exe' -UseBasicParsing } catch { Write-Host 'Download failed: ' $_.Exception.Message; exit 1 }"
    if !errorlevel! neq 0 (
        echo       ERROR: Failed to download Python.
        echo       Please install manually from https://www.python.org/downloads/
        pause
        exit /b 1
    )
    echo       Installing Python silently...
    "%TEMP%\python-installer.exe" /quiet InstallAllUsers=0 PrependPath=1 Include_pip=1
    if !errorlevel! neq 0 (
        echo       ERROR: Python installation failed.
        echo       Please install manually from https://www.python.org/downloads/
        pause
        exit /b 1
    )
    del "%TEMP%\python-installer.exe" >nul 2>&1
    echo       Python installed successfully.
    set "NEED_RESTART=1"
) else (
    for /f "tokens=*" %%v in ('python --version 2^>^&1') do set "PY_VER=%%v"
    echo       Found: !PY_VER!
)

:: ---------------------------------------------------------------------------
:: Check Node.js
:: ---------------------------------------------------------------------------
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo       Node.js not found. Downloading Node.js 20 LTS...
    set "NODE_INSTALLER=%TEMP%\node-installer.msi"
    powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node-installer.msi' -UseBasicParsing } catch { Write-Host 'Download failed: ' $_.Exception.Message; exit 1 }"
    if !errorlevel! neq 0 (
        echo       ERROR: Failed to download Node.js.
        echo       Please install manually from https://nodejs.org/
        pause
        exit /b 1
    )
    echo       Installing Node.js silently...
    msiexec /i "%TEMP%\node-installer.msi" /qn
    if !errorlevel! neq 0 (
        echo       ERROR: Node.js installation failed.
        echo       Please install manually from https://nodejs.org/
        pause
        exit /b 1
    )
    del "%TEMP%\node-installer.msi" >nul 2>&1
    echo       Node.js installed successfully.
    set "NEED_RESTART=1"
) else (
    for /f "tokens=*" %%v in ('node --version 2^>^&1') do set "NODE_VER=%%v"
    echo       Found: !NODE_VER!
)

:: ---------------------------------------------------------------------------
:: If we installed something, PATH needs refresh — relaunch
:: ---------------------------------------------------------------------------
if !NEED_RESTART! equ 1 (
    echo.
    echo       Prerequisites installed. Relaunching setup to pick up PATH...
    echo.
    timeout /t 3 /nobreak >nul
    start "" cmd /c "cd /d "%PROJECT_DIR%" && setup.bat"
    exit /b 0
)

:: ---------------------------------------------------------------------------
:: Install Python dependencies
:: ---------------------------------------------------------------------------
echo.
echo [3/4] Installing Python dependencies...
python -m pip install --upgrade pip >nul 2>&1
pip install -r "%PROJECT_DIR%\requirements.txt"
if %errorlevel% neq 0 (
    echo       ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)
echo       Python dependencies installed.

:: ---------------------------------------------------------------------------
:: Install frontend dependencies
:: ---------------------------------------------------------------------------
echo.
echo [4/4] Installing frontend dependencies...
cd /d "%PROJECT_DIR%\frontend"
call npm install
if %errorlevel% neq 0 (
    echo       ERROR: Failed to install frontend dependencies.
    pause
    exit /b 1
)
echo       Frontend dependencies installed.

:: ---------------------------------------------------------------------------
:: Done — launch servers
:: ---------------------------------------------------------------------------
echo.
echo ==========================================
echo   Setup complete! Starting servers...
echo ==========================================
echo.
cd /d "%PROJECT_DIR"
call start.bat
