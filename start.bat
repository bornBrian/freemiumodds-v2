@echo off
REM Quick start script for Windows
REM Double-click this file to run setup and start the app

echo.
echo =============================================
echo   FreemiumOdds V2 - Quick Start (Windows)
echo =============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if .env exists
if not exist ".env" (
    echo No .env file found. Running setup...
    echo.
    node setup.js
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
    echo.
)

echo.
echo =============================================
echo   Starting FreemiumOdds V2...
echo =============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop
echo.

REM Start both servers
call npm run dev

pause
