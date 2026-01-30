@echo off
title FreemiumOdds - Auto Update Results

:loop
echo.
echo ================================================
echo  FreemiumOdds - Updating Match Results
echo  Time: %time%
echo ================================================
echo.

node fetch-real-results.js

echo.
echo Next update in 1 hour...
echo Press Ctrl+C to stop
timeout /t 3600 /nobreak

goto loop
