@echo off
echo ================================================
echo  Rebuilding Pregnancy Service
echo ================================================

echo [1/3] Stopping Pregnancy Service (port 8082)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8082" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Building with Maven...
cd pregnancy-service
call mvn clean package -DskipTests
cd ..

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ================================================
    echo Build FAILED! Check the error messages above.
    echo ================================================
    pause
    exit /b 1
)

echo [3/3] Starting Pregnancy Service...
cd pregnancy-service\target
start "Pregnancy Service (8082)" cmd /k "java -jar pregnancy-service-1.0.0.jar"
cd ..\..

echo ================================================
echo Pregnancy Service rebuilt and restarted!
echo Check the new window for logs.
echo ================================================
pause
