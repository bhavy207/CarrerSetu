@echo off
REM CareerSetu Health Check Script for Windows
REM Run this to verify all services are working

cls
echo.
echo ====================================================
echo  CareerSetu Health Check
echo ====================================================
echo.

REM Check Backend
echo 1. Backend Check (Port 8000)...
setlocal enabledelayedexpansion
for /f "tokens=*" %%A in ('powershell -Command "try { $r = Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; Write-Host 'OK' } catch { Write-Host 'FAIL' }" 2^>nul') do set BACKEND=%%A

if "!BACKEND!"=="OK" (
    echo    [OK] Backend is running
    powershell -Command "Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing | Select-Object -ExpandProperty Content" >nul 2>&1
) else (
    echo    [FAIL] Backend NOT running on port 8000
    echo    Fix: cd backend ^&^& npm run dev
)
echo.

REM Check Frontend  
echo 2. Frontend Check (Port 5173)...
for /f "tokens=*" %%A in ('powershell -Command "try { Invoke-WebRequest -Uri http://localhost:5173/ -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop | Write-Host 'OK' } catch { Write-Host 'FAIL' }" 2^>nul') do set FRONTEND=%%A

if "!FRONTEND!"=="OK" (
    echo    [OK] Frontend is running at http://localhost:5173
) else (
    echo    [FAIL] Frontend NOT running on port 5173
    echo    Fix: cd frontend ^&^& npm run dev
)
echo.

REM Check MongoDB Atlas
echo 3. MongoDB Atlas...
echo    [INFO] MongoDB Atlas is configured in backend\.env
powershell -Command "if (Test-Path 'C:\Users\DELL\Downloads\sgp_5\CareerSetu\backend\.env') { Write-Host '   .env file found' }" 2>nul
echo.

REM Summary
echo ====================================================
if "!BACKEND!"=="OK" if "!FRONTEND!"=="OK" (
    echo  Status: All systems operational!
) else (
    echo  Status: Some services not running
)
echo.
echo  Open browser: http://localhost:5173
echo ====================================================
echo.

pause
