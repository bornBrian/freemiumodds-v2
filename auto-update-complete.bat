@echo off
title FreemiumOdds - Complete Auto Update System

echo ================================================
echo  FreemiumOdds - Starting Auto-Update System
echo  Date: %date%
echo  Time: %time%
echo ================================================
echo.

:loop
echo.
echo [%time%] Running update cycle...
echo.

echo 1. Fetching today's matches from Oddslot...
node force-fetch-today.js

echo.
echo 2. Updating results for finished matches...
node fetch-real-results.js

echo.
echo 3. Checking database status...
node check-database-status.js

echo.
echo ================================================
echo  Update cycle complete
echo  Next update in 30 minutes...
echo  Press Ctrl+C to stop
echo ================================================
timeout /t 1800 /nobreak

goto loop
