@echo off
echo ========================================
echo   DROPLER - Utilities Menu
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. View Database (Prisma Studio)
echo 2. Update Database Schema
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

cd /d "%~dp0\.."

if "%choice%"=="1" goto viewdb
if "%choice%"=="2" goto updatedb
if "%choice%"=="3" goto end
goto invalid

:viewdb
echo.
echo Opening Prisma Studio...
echo Visit: http://localhost:5555
echo Press Ctrl+C to close
call npx prisma studio
goto end

:updatedb
echo.
echo Syncing database schema...
echo NOTE: If the dev server is running, any EPERM warning is harmless.
echo.
call npx prisma db push 2>&1
echo.
echo Done. Restart the dev server to pick up changes.
pause
goto end

:invalid
echo.
echo Invalid choice.
pause
goto end

:end
