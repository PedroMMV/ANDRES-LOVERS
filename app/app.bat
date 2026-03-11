@echo off
setlocal enabledelayedexpansion
title Interlub Grease Recommender - Control Panel

:MENU
cls
echo.
echo  ============================================
echo     INTERLUB GREASE RECOMMENDER SYSTEM
echo  ============================================
echo.
echo     [1] Start Services
echo     [2] Stop Services
echo     [3] Restart Services
echo     [4] Check Status
echo     [5] Open Browser
echo     [6] View Logs (API Docs)
echo     [0] Exit
echo.
echo  ============================================
echo.
set /p choice="  Select an option: "

if "%choice%"=="1" goto START
if "%choice%"=="2" goto STOP
if "%choice%"=="3" goto RESTART
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto BROWSER
if "%choice%"=="6" goto DOCS
if "%choice%"=="0" goto EXIT
goto MENU

:START
cls
echo.
echo  ============================================
echo     STARTING SERVICES
echo  ============================================
echo.

:: Kill any existing processes on ports 8000 and 5173
echo  [*] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul

:: Start Backend (FastAPI)
echo  [*] Starting Backend (FastAPI on port 8000)...
start "Backend - FastAPI" /min cmd /k "cd /d %~dp0backend && python main.py"

:: Wait for backend to initialize
echo  [*] Waiting for backend to initialize...
timeout /t 3 >nul

:: Start Frontend (Vite React)
echo  [*] Starting Frontend (Vite on port 5173)...
start "Frontend - Vite" /min cmd /k "cd /d %~dp0 && npm run dev"

:: Wait a moment
timeout /t 4 >nul

echo.
echo  ============================================
echo     SERVICES STARTED SUCCESSFULLY!
echo  ============================================
echo.
echo     Backend:  http://localhost:8000
echo     Frontend: http://localhost:5173
echo     API Docs: http://localhost:8000/docs
echo.
echo  ============================================
echo.
echo  Opening browser...
timeout /t 2 >nul
start http://localhost:5173
echo.
pause
goto MENU

:STOP
cls
echo.
echo  ============================================
echo     STOPPING SERVICES
echo  ============================================
echo.

:: Kill Backend on port 8000
echo  [*] Stopping Backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo      - Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill Frontend on port 5173
echo  [*] Stopping Frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    echo      - Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo  ============================================
echo     ALL SERVICES STOPPED
echo  ============================================
echo.
pause
goto MENU

:RESTART
cls
echo.
echo  ============================================
echo     RESTARTING SERVICES
echo  ============================================
echo.

:: Stop services first
echo  [*] Stopping services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul

:: Start Backend
echo  [*] Starting Backend (FastAPI on port 8000)...
start "Backend - FastAPI" /min cmd /k "cd /d %~dp0backend && python main.py"
timeout /t 3 >nul

:: Start Frontend
echo  [*] Starting Frontend (Vite on port 5173)...
start "Frontend - Vite" /min cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 4 >nul

echo.
echo  ============================================
echo     SERVICES RESTARTED SUCCESSFULLY!
echo  ============================================
echo.
echo     Backend:  http://localhost:8000
echo     Frontend: http://localhost:5173
echo.
pause
goto MENU

:STATUS
cls
echo.
echo  ============================================
echo     SERVICE STATUS
echo  ============================================
echo.

:: Check Backend
set "backend_status=OFFLINE"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do set "backend_status=ONLINE (PID: %%a)"
echo     Backend (8000):  !backend_status!

:: Check Frontend
set "frontend_status=OFFLINE"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do set "frontend_status=ONLINE (PID: %%a)"
echo     Frontend (5173): !frontend_status!

echo.
echo  ============================================
echo.
pause
goto MENU

:BROWSER
start http://localhost:5173
goto MENU

:DOCS
start http://localhost:8000/docs
goto MENU

:EXIT
cls
echo.
echo  ============================================
echo     GOODBYE!
echo  ============================================
echo.
echo  Do you want to stop services before exiting?
echo.
set /p stopChoice="  Stop services? (y/n): "
if /i "%stopChoice%"=="y" (
    echo.
    echo  [*] Stopping services...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
    echo  [*] Services stopped.
)
echo.
echo  Exiting...
timeout /t 2 >nul
exit /b 0
