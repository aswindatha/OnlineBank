@echo off
echo ==========================================
echo   OnlineBank - Starting Full Stack
echo ==========================================
echo.

echo [1/2] Starting FastAPI backend on :8000
start "OnlineBank API" cmd /k "cd /d %~dp0 && python -m uvicorn api:app --port 8000 --reload"

echo [2/2] Starting Vite frontend on :5173
start "OnlineBank Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ==========================================
echo   Both servers are starting!
echo.
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Frontend : http://localhost:5173
echo ==========================================
echo.
echo Close both command windows to stop the servers.
echo.

echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173

pause
