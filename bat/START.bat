@echo off
echo ========================================
echo   DROPLER - Starting Server
echo ========================================
echo.
echo Server will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0\.."
npm run dev
