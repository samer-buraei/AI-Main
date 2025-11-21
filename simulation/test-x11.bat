@echo off
echo ================================================
echo    FireSwarm X11 Connection Test
echo ================================================
echo.

echo Checking DISPLAY environment variable...
if "%DISPLAY%"=="" (
    echo ❌ DISPLAY not set
    echo    The simulation script should auto-detect this.
) else (
    echo ✅ DISPLAY = %DISPLAY%
)

echo.
echo Checking for X Server processes...
tasklist /FI "IMAGENAME eq vcxsrv.exe" 2>NUL | find /I "vcxsrv.exe" >nul
if %errorlevel%==0 (
    echo ✅ Found VcXsrv running
) else (
    echo ❌ VcXsrv not found
    echo    Please start VcXsrv from Start Menu
)

echo.
echo ================================================
echo    SETUP INSTRUCTIONS
echo ================================================
echo.
echo 1. Download and install VcXsrv:
echo    https://sourceforge.net/projects/vcxsrv/
echo.
echo 2. Start VcXsrv with these settings:
echo    • Multiple windows
echo    • Display number: -1 (auto)
echo    • Start no client
echo    • ✅ DISABLE access control (IMPORTANT!)
echo.
echo 3. Run the simulation:
echo    .\start-simulation.ps1
echo.
echo 4. You should see Gazebo GUI window open
echo.
pause
