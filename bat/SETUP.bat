@echo off
echo ========================================
echo   DROPLER - Complete Setup
echo ========================================
echo.
echo This will set up everything you need:
echo 1. Install dependencies
echo 2. Generate Prisma client
echo 3. Apply all migrations
echo 4. Seed default data
echo.
echo IMPORTANT: Make sure dev server is STOPPED!
echo.
pause

cd /d "%~dp0\.."

echo.
echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo [2/4] Generating Prisma client...
call npx prisma generate
if errorlevel 1 goto error

echo.
echo [3/4] Resolving database schema...
call npx prisma migrate resolve --applied 20260329000000_add_flexible_storefront_fields
call npx prisma migrate resolve --applied 20260329000001_add_seo_stats_fields
call npx prisma db push --accept-data-loss
if errorlevel 1 goto error

echo.
echo [4/4] Seeding default categories...
node scripts/add-default-categories.js

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: bat\START.bat
echo 2. Visit: http://localhost:3000
echo 3. Register your admin account
echo 4. Start adding products!
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo   ERROR: Setup failed!
echo ========================================
echo.
echo Common issues:
echo - Dev server is still running (stop it first)
echo - Database is locked (close Prisma Studio)
echo - Permission error (run as administrator)
echo.
pause
exit /b 1
